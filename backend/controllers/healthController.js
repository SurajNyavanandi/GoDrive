const mongoose = require('mongoose');
const env = require('../config/env');

/**
 * Liveness Probe: GET /health/live
 * Returns 200 with uptime, timestamp, and environment.
 */
const getLiveness = (req, res) => {
  return res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
};

/**
 * Readiness Probe: GET /health/ready
 * Checks critical dependencies (MongoDB connectivity).
 * Returns 200 if connected (readyState === 1), or 503 if disconnected.
 */
const getReadiness = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;

  const data = {
    status: isDbConnected ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      connected: isDbConnected,
      state: dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected',
      readyState: dbState,
    },
  };

  if (!isDbConnected) {
    return res.status(503).json({
      success: false,
      message: 'Service Not Ready - Database connection is not established.',
      code: 'DATABASE_DISCONNECTED',
      data,
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Service is ready to handle requests',
    data,
  });
};

/**
 * Health Check Controller: GET /health
 * Checks database connectivity and returns 200 (healthy) or 503 (service unavailable in prod)
 */
const getHealthStatus = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;
  const isProd = env.isProduction;

  const healthData = {
    status: isDbConnected ? 'ok' : (isProd ? 'error' : 'ok (sandbox mode)'),
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: env.NODE_ENV,
    database: {
      connected: isDbConnected,
      state: dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected',
    },
  };

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
  getLiveness,
  getReadiness,
  getHealthStatus,
};
