const express = require('express');
const router = express.Router();
const { getHealthStatus, getLiveness, getReadiness } = require('../controllers/healthController');

/**
 * @route   GET /api/health
 * @desc    Get API health status, server uptime, and database connectivity
 * @access  Public
 */
router.get('/', getHealthStatus);

/**
 * @route   GET /api/health/live
 * @desc    Kubernetes / Render Liveness Probe
 * @access  Public
 */
router.get('/live', getLiveness);

/**
 * @route   GET /api/health/ready
 * @desc    Kubernetes / Render Readiness Probe (verifies MongoDB connectivity)
 * @access  Public
 */
router.get('/ready', getReadiness);

module.exports = router;
