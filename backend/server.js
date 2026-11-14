const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const env = require('./config/env');
const connectDB = require('./config/db');
const apiRoutes = require('./routes');
const { getHealthStatus, getLiveness, getReadiness } = require('./controllers/healthController');
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');
const logger = require('./utils/logger');
const { generalLimiter } = require('./middleware/rateLimiter');

// Recursive helper to sanitize MongoDB query injection operators ($ and .)
function sanitizeMongoOperators(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeMongoOperators);
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      continue; // drop injected mongo operator keys
    }
    clean[key] = sanitizeMongoOperators(value);
  }
  return clean;
}

const PORT = env.PORT;
let serverInstance = null;

async function startServer() {
  const app = express();

  // Enable trust proxy for reverse proxies (Render, Nginx, Cloudflare)
  app.set('trust proxy', 1);

  // Disable X-Powered-By to prevent framework information disclosure
  app.disable('x-powered-by');

  // Initialize Database Connection with connection pooling
  await connectDB();

  // 1. Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for Vite/SPA embedding compatibility
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. High-performance gzip response compression with threshold & MIME filter
  app.use(
    compression({
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
    })
  );

  // 3. CORS Configuration: Registered before routes so preflight OPTIONS succeed
  const isProduction = env.isProduction;
  const rawAllowed = (env.ALLOWED_ORIGINS || env.CORS_ORIGIN || '').trim();

  let allowedOrigins = [];
  if (rawAllowed && rawAllowed !== '*') {
    allowedOrigins = rawAllowed.split(',').map((o) => o.trim()).filter(Boolean);
  } else if (!isProduction) {
    allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ];
  } else {
    allowedOrigins = ['https://manadrivers.com', 'https://www.manadrivers.com'];
  }

  const clientUrl = (env.CLIENT_URL || '').trim();
  const frontendUrl = (env.FRONTEND_URL || '').trim();
  if (clientUrl && !allowedOrigins.includes(clientUrl)) {
    allowedOrigins.push(clientUrl);
  }
  if (frontendUrl && !allowedOrigins.includes(frontendUrl)) {
    allowedOrigins.push(frontendUrl);
  }

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, server-to-server, health checks)
        if (!origin) return callback(null, true);

        // Never allow wildcard when credentials are used
        if (!isProduction && rawAllowed === '*') {
          return callback(null, true);
        }

        if (
          allowedOrigins.includes(origin) ||
          (!isProduction && (origin.includes('localhost') || origin.includes('127.0.0.1'))) ||
          origin.endsWith('.manadrivers.com') ||
          origin.endsWith('.vercel.app')
        ) {
          return callback(null, true);
        }

        logger.warn(`CORS rejected origin: ${origin}`);
        return callback(new Error(`CORS Error: Origin ${origin} not allowed by CORS policy`));
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-admin-key', 'x-api-key'],
      exposedHeaders: ['X-Request-Id', 'x-rtb-fingerprint-id', 'request-id'],
      credentials: true,
      maxAge: 86400, // 24-hour preflight cache
    })
  );

  // 4. Request Body Size Limits (100KB default to prevent memory exhaustion DoS)
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // Sanitize MongoDB operators from request body and query params
  app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeMongoOperators(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeMongoOperators(req.query);
    }
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeMongoOperators(req.params);
    }
    next();
  });

  // 5. Rewrite /api/api/* to /api/* to seamlessly handle double-prefixed requests
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/api/')) {
      req.url = req.url.replace(/^\/api\/api\//, '/api/');
    }
    next();
  });

  // Request ID middleware for distributed tracing
  app.use((req, res, next) => {
    req.id = req.headers['x-request-id'] || crypto.randomUUID();
    res.setHeader('X-Request-Id', req.id);
    next();
  });

  // 6. Direct Root Health Check Endpoints (Liveness & Readiness Probes)
  app.get('/health', getHealthStatus);
  app.get('/health/live', getLiveness);
  app.get('/health/ready', getReadiness);

  // 7. General API Rate Limiter
  app.use('/api', generalLimiter);

  // 8. API Request Logger Middleware
  app.use(
    '/api',
    (req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.api(req, res, duration);
      });
      next();
    },
    apiRoutes
  );

  // 9. Catch-all for missing API routes
  app.use('/api', (req, res) => {
    logger.warn(`API Route Not Found: ${req.method} ${req.originalUrl || req.path}`);
    res.status(404).json({
      success: false,
      message: `API route ${req.method} ${req.originalUrl || req.path} not found`,
      code: 'NOT_FOUND',
    });
  });

  // 10. Frontend static distribution & SPA fallback or Vite Middleware
  logger.info(`Server initialized in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode on port ${PORT}`);
  const frontendDir = path.resolve(__dirname, '../frontend');
  const distPath = path.resolve(frontendDir, 'dist');

  if (isProduction && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/health')) {
        return res.sendFile(path.join(distPath, 'index.html'));
      }
      next();
    });
  } else if (isProduction) {
    // Pure API Web Service mode (Render Web Service without local frontend build)
    app.get('/', (req, res) => {
      res.json({
        success: true,
        service: 'Mana Drivers API',
        environment: 'production',
        health: '/health',
        apiDocs: '/api',
      });
    });
  } else if (!env.isTest) {
    // Development mode: Dynamically load Vite dev server middleware
    try {
      let viteModule;
      try {
        viteModule = await import('vite');
      } catch (_importErr) {
        const vitePath = require.resolve('vite', {
          paths: [frontendDir, path.resolve(__dirname, '..'), __dirname],
        });
        const { pathToFileURL } = require('url');
        viteModule = await import(pathToFileURL(vitePath).href);
      }
      const { createServer: createViteServer } = viteModule;
      const vite = await createViteServer({
        server: { middlewareMode: true, host: '0.0.0.0', allowedHosts: 'all' },
        appType: 'spa',
        root: frontendDir,
        configFile: path.resolve(frontendDir, 'vite.config.js'),
      });
      app.use(vite.middlewares);

      // SPA fallback for HTML navigation in development mode
      app.use(async (req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/health')) {
          try {
            const indexHtmlPath = path.resolve(frontendDir, 'index.html');
            if (fs.existsSync(indexHtmlPath)) {
              let template = await fs.promises.readFile(indexHtmlPath, 'utf-8');
              template = await vite.transformIndexHtml(req.originalUrl, template);
              return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
            }
          } catch (e) {
            return next(e);
          }
        }
        next();
      });
    } catch (viteErr) {
      logger.warn('Vite dev middleware initialization fallback:', viteErr.message);
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.use((req, res, next) => {
          if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/health')) {
            return res.sendFile(path.join(distPath, 'index.html'));
          }
          next();
        });
      }
    }
  }

  // 11. 404 and Global Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  // Start HTTP server with automatic fallback if primary port is in use
  if (!env.isTest) {
    const startListening = (port, fallbackPort = 5000) => {
      serverInstance = app.listen(port, '0.0.0.0', () => {
        logger.info(`Mana Drivers server listening at http://0.0.0.0:${port}`);
      });
      // Configure timeouts for Render reverse proxy (AWS ALB/Nginx has 60s idle timeout)
      serverInstance.keepAliveTimeout = 65000;
      serverInstance.headersTimeout = 66000;
      serverInstance.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && fallbackPort && port !== fallbackPort) {
          logger.warn(
            `Port ${port} in use (e.g. by standalone Vite dev server). Automatically starting backend on port ${fallbackPort}...`
          );
          startListening(fallbackPort, null);
        } else {
          logger.error('HTTP server startup error:', err);
          handleShutdown('serverError');
        }
      });
    };
    startListening(PORT, PORT === 5000 ? 5001 : 5000);
  }

  return app;
}

// Graceful Shutdown handler
async function handleShutdown(signal) {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);
  if (serverInstance) {
    serverInstance.close(async () => {
      logger.info('HTTP server closed. Draining database connection...');
      try {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close(false);
          logger.info('MongoDB connection closed cleanly.');
        }
      } catch (err) {
        logger.error('Error closing database connection:', err);
      }
      process.exit(0);
    });

    // Force exit after 10 seconds if connections fail to drain
    setTimeout(() => {
      logger.error('Graceful shutdown timed out after 10s, forcing exit.');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection at:', { promise, reason });
  handleShutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown:', err);
  handleShutdown('uncaughtException');
});

if (require.main === module) {
  startServer().catch((err) => {
    logger.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = { startServer, handleShutdown };
