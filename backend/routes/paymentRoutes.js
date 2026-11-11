const express = require('express');
const router = express.Router();
const {
  getPaymentKey,
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
} = require('../controllers/paymentController');
const { validate } = require('../middleware/validateMiddleware');
const { paymentOrderSchema, paymentVerifySchema } = require('../middleware/schemas');

router.get('/key', getPaymentKey);
router.post('/order', validate(paymentOrderSchema, 'body'), createPaymentOrder);
router.post('/verify', validate(paymentVerifySchema, 'body'), verifyPayment);
router.post('/webhook', handleWebhook);

module.exports = router;
