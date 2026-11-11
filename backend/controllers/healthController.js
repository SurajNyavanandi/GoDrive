const mongoose = require('mongoose');

/**
 * Health Check Controller
 * Checks database connectivity and returns 200 (healthy) or 503 (service unavailable)
 */
const getHealthStatus = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;
  const isProd = process.env.NODE_ENV === 'production';

  const healthData = {
    status: isDbConnected ? 'ok' : (isProd ? 'error' : 'ok (sandbox mode)'),
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: isDbConnected,
      state: dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected',
    },
  };

  // In production, an unavailable database must return 503
  if (isProd && !isDbConnected) {
    return res.status(503).json({
      success: false,
      message: 'Service Unavailable - Database connection is degraded or disconnected.',
      code: 'DATABASE_DISCONNECTED',
      data: healthData,
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: healthData,
  });
};

module.exports = {
  getHealthStatus,
};
