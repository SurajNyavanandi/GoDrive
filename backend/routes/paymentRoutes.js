const express = require('express');
const router = express.Router();
const {
  getPaymentKey,
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
} = require('../controllers/paymentController');

router.get('/key', getPaymentKey);
router.post('/order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/webhook', handleWebhook);

module.exports = router;
