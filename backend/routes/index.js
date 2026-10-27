const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const emailRoutes = require('./emailRoutes');
const otpRoutes = require('./otpRoutes');
const paymentRoutes = require('./paymentRoutes');
const itemRoutes = require('./itemRoutes');
const driverRoutes = require('./driverRoutes');
const adminRoutes = require('./adminRoutes');
const bookingRoutes = require('./bookingRoutes');

router.use('/health', (req, res, next) => { console.log('[Route] Health'); next(); }, healthRoutes);
router.use('/auth', (req, res, next) => { console.log('[Route] Auth'); next(); }, authRoutes);
router.use('/email', (req, res, next) => { console.log('[Route] Email'); next(); }, emailRoutes);
router.use('/otp', (req, res, next) => { console.log('[Route] OTP'); next(); }, otpRoutes);
router.use('/payment', (req, res, next) => { console.log('[Route] Payment'); next(); }, paymentRoutes);
router.use('/items', (req, res, next) => { console.log('[Route] Items'); next(); }, itemRoutes);
router.use('/drivers', (req, res, next) => { console.log('[Route] Drivers'); next(); }, driverRoutes);
router.use('/admin', (req, res, next) => { console.log('[Route] Admin'); next(); }, adminRoutes);
router.use('/bookings', (req, res, next) => { console.log('[Route] Bookings'); next(); }, bookingRoutes);

module.exports = router;
