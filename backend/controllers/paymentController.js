const {
  getKeyId,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
} = require('../services/razorpayService');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * Get Public Razorpay Key ID
 * GET /api/payment/key
 */
const getPaymentKey = asyncHandler(async (req, res) => {
  const keyId = getKeyId();
  return successResponse(res, { keyId }, 'Razorpay Key retrieved', 200);
});

/**
 * Create a new Razorpay Order
 * POST /api/payment/order
 */
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', receipt, notes } = req.body;

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return errorResponse(res, 'Please provide a valid numeric amount greater than 0', 400);
  }

  const result = await createOrder({ amount, currency, receipt, notes });
  return successResponse(res, result, 'Razorpay order created successfully', 201);
});

/**
 * Verify Razorpay payment signature from frontend checkout
 * POST /api/payment/verify
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id) {
    return errorResponse(
      res,
      'Missing required parameters: razorpay_order_id and razorpay_payment_id',
      400
    );
  }

  const result = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!result.isValid) {
    return errorResponse(res, result.message || 'Payment verification failed', 400);
  }

  return successResponse(res, result, 'Payment verified successfully', 200);
});

/**
 * Handle incoming Razorpay Webhook events
 * POST /api/payment/webhook
 */
const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const verification = verifyWebhookSignature({
    rawBody: JSON.stringify(req.body),
    signature,
  });

  if (!verification.isValid) {
    return errorResponse(res, 'Invalid webhook signature', 400);
  }

  const event = req.body.event;
  console.log(`[Razorpay Webhook Event Received]: ${event}`);

  return successResponse(res, { received: true, event }, 'Webhook acknowledged', 200);
});

module.exports = {
  getPaymentKey,
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
};
