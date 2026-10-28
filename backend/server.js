const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./config/db');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();

  // Enable trust proxy for express-rate-limit when running behind reverse proxy
  app.set('trust proxy', 1);

  // Initialize Database Connection
  await connectDB();

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // High-performance gzip response compression
  app.use(compression());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
  });
  app.use('/api', limiter);

  // CORS Configuration (Includes manadrivers.com production domain + preview URLs)
  const allowedOrigins = [
    'https://manadrivers.com',
    'https://www.manadrivers.com',
    'http://manadrivers.com',
    'http://www.manadrivers.com',
    'http://localhost:3000',
    'http://localhost:5173',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or same-origin)
        if (!origin) return callback(null, true);

        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith('.manadrivers.com') ||
          origin.includes('run.app') ||
          process.env.NODE_ENV !== 'production'
        ) {
          return callback(null, true);
        }

        logger.warn(`CORS request received from origin: ${origin}`);
        return callback(null, true); // Allow for seamless launch, log origin
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      credentials: true,
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Request Logger Middleware
  app.use('/api', (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.api(req, res, duration);
    });
    next();
  }, apiRoutes);

  // Catch-all for missing API routes
  app.use('/api', (req, res) => {
    logger.warn(`API Route Not Found: ${req.method} ${req.path}`);
    res.status(404).json({ success: false, message: `API route ${req.method} ${req.path} not found` });
  });

  // Frontend static distribution & SPA fallback or Vite Middleware
  const isProduction = process.env.NODE_ENV === 'production';
  logger.info(`Server running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode on port ${PORT}`);
  const frontendDir = path.resolve(__dirname, '../frontend');
  const distPath = path.resolve(frontendDir, 'dist');

  if (isProduction && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
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
        if (req.method === 'GET' && !req.path.startsWith('/api')) {
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
          if (req.method === 'GET' && !req.path.startsWith('/api')) {
            return res.sendFile(path.join(distPath, 'index.html'));
          }
          next();
        });
      }
    }
  }

  // 404 and Global Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  // Start server
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Mana Drivers server listening at http://0.0.0.0:${PORT}`);
    });
  }
}

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
});
