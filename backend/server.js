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
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
  });
  app.use('/api', limiter);

  // CORS & Parsing
  const rawCorsOrigin = process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS || '*';
  const allowedOrigins = rawCorsOrigin.includes(',')
    ? rawCorsOrigin.split(',').map((o) => o.trim())
    : rawCorsOrigin.trim();

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins === '*') {
          return callback(null, true);
        }
        if (Array.isArray(allowedOrigins)) {
          if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          return callback(null, false);
        }
        if (allowedOrigins === origin) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes
  app.use('/api', (req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.path}`);
    next();
  }, apiRoutes);

  // Debug catch-all for API
  app.use('/api', (req, res, next) => {
    console.log(`[API Fallthrough] ${req.method} ${req.path}`);
    res.status(404).json({ success: false, message: 'API route not found' });
  });

  // Frontend static distribution & SPA fallback or Vite Middleware
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`[Server] Running in ${isProduction ? 'production' : 'development'} mode`);
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
      console.warn('Vite dev middleware initialization failed, falling back to static files:', viteErr.message);
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
      console.log(`Mana Drivers server running at http://0.0.0.0:${PORT}`);
    });
  }
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
