const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const env = require('./config/env');
const connectDB = require('./config/db');
const apiRoutes = require('./routes');
const { getHealthStatus } = require('./controllers/healthController');
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');
const logger = require('./utils/logger');
const { generalLimiter } = require('./middleware/rateLimiter');

const PORT = Number(process.env.PORT || env.PORT) || 3000;
let serverInstance = null;

async function startServer() {
  const app = express();

  // Enable trust proxy for reverse proxies (Render, Nginx, Cloudflare)
  app.set('trust proxy', 1);

  // Initialize Database Connection with connection pooling
  await connectDB();

  // 1. Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for Vite/SPA embedding compatibility
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. High-performance gzip response compression
  app.use(compression());

  // 3. CORS Configuration: Registered before routes so preflight OPTIONS succeed
  const isProduction = process.env.NODE_ENV === 'production';
  const rawAllowed = (
    process.env.ALLOWED_ORIGINS ||
    process.env.CORS_ORIGIN ||
    env.ALLOWED_ORIGINS ||
    env.CORS_ORIGIN ||
    ''
  ).trim();

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
          origin.endsWith('.manadrivers.com')
        ) {
          return callback(null, true);
        }

        logger.warn(`CORS rejected origin: ${origin}`);
        return callback(new Error(`CORS Error: Origin ${origin} not allowed by CORS policy`));
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-admin-key', 'x-api-key'],
      credentials: true,
      maxAge: 86400, // 24-hour preflight cache
    })
  );

  // 4. Request Body Size Limits (1MB to prevent memory exhaustion DoS)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 5. Rewrite /api/api/* to /api/* to seamlessly handle double-prefixed requests
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/api/')) {
      req.url = req.url.replace(/^\/api\/api\//, '/api/');
    }
    next();
  });

  // 6. Direct Root Health Check Endpoint
  app.get('/health', getHealthStatus);

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
      if (req.method === 'GET' && !req.path.startsWith('/api') && req.path !== '/health') {
        return res.sendFile(path.join(distPath, 'index.html'));
      }
      next();
    });
  } else {
    // Development mode: Dynamically load Vite dev server middleware
    try {
      let viteModule;
      try {
        viteModule = await import('vite');
      } catch (_importErr) {
        const vitePath = require.resolve('vite', {
          paths: [frontendDir, path.resolve(__dirname, '..'), __dirname],
        });
        viteModule = await import(vitePath);
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
        if (req.method === 'GET' && !req.path.startsWith('/api') && req.path !== '/health') {
          try {
            const indexHtmlPath = path.resolve(frontendDir, 'index.html');
            if (fs.existsSync(indexHtmlPath)) {
              let template = fs.readFileSync(indexHtmlPath, 'utf-8');
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
          if (req.method === 'GET' && !req.path.startsWith('/api') && req.path !== '/health') {
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

  // Start HTTP server
  if (process.env.NODE_ENV !== 'test') {
    serverInstance = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Mana Drivers server listening at http://0.0.0.0:${PORT}`);
    });
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

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
