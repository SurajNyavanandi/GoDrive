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

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/email', emailRoutes);
router.use('/otp', otpRoutes);
router.use('/payment', paymentRoutes);
router.use('/items', itemRoutes);
router.use('/drivers', driverRoutes);
router.use('/admin', adminRoutes);
router.use('/bookings', bookingRoutes);

module.exports = router;
