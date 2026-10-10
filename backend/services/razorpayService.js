let Razorpay;
try {
  Razorpay = require('razorpay');
} catch {
  Razorpay = null;
}
const crypto = require('crypto');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const isConfigured = keyId && keySecret && !keyId.startsWith('rzp_test_xxx') && keyId !== 'your_razorpay_key_id';

const razorpayInstance = isConfigured && Razorpay
  ? new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  : null;

/**
 * Return public Razorpay Key ID for client initialization
 */
const getKeyId = () => {
  return keyId || 'rzp_test_sandbox_mock';
};

/**
 * Create a new Razorpay Order
 * @param {Object} options
 * @param {number} options.amount - Amount in Indian Rupees (will be converted to paise) or raw smallest unit
 * @param {string} [options.currency] - Currency code (default 'INR')
 * @param {string} [options.receipt] - Unique receipt ID
 * @param {Object} [options.notes] - Key-value metadata notes
 */
const createOrder = async ({
  amount,
  currency = 'INR',
  receipt = `rcpt_${Date.now()}`,
  notes = {},
}) => {
  // If amount is passed in INR (e.g., 500), ensure it is formatted in paise (50000)
  const amountInPaise = Number(amount) < 1000 ? Math.round(Number(amount) * 100) : Math.round(Number(amount));

  if (!razorpayInstance) {
    const mockOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log('\n[Razorpay Service - Sandbox Simulation Order]');
    console.log(`Order ID: ${mockOrderId}`);
    console.log(`Amount: ${amountInPaise / 100} ${currency} (${amountInPaise} paise)`);
    console.log(`Receipt: ${receipt}\n`);

    return {
      success: true,
      simulated: true,
      order: {
        id: mockOrderId,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency,
        receipt,
        status: 'created',
        notes,
        created_at: Math.floor(Date.now() / 1000),
      },
      keyId: getKeyId(),
    };
  }

  try {
    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes,
    });

    return {
      success: true,
      simulated: false,
      order,
      keyId: getKeyId(),
    };
  } catch (error) {
    console.error('[Razorpay Create Order Error]:', error.message);
    throw new Error(`Razorpay Error: ${error.message}`);
  }
};

/**
 * Verify Razorpay Payment Signature (HMAC SHA-256)
 * @param {Object} options
 * @param {string} options.orderId - razorpay_order_id
 * @param {string} options.paymentId - razorpay_payment_id
 * @param {string} options.signature - razorpay_signature
 */
const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (!orderId || !paymentId) {
    return {
      isValid: false,
      message: 'orderId and paymentId are required',
    };
  }

  // Allow sandbox simulated checkout verification
  if (!isConfigured || orderId.startsWith('order_sim_')) {
    return {
      isValid: true,
      simulated: true,
      message: 'Payment signature verified (sandbox mock mode)',
      paymentId,
      orderId,
    };
  }

  try {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === signature;

    return {
      isValid,
      simulated: false,
      message: isValid ? 'Signature valid' : 'Invalid payment signature',
      paymentId,
      orderId,
    };
  } catch (error) {
    console.error('[Razorpay Signature Error]:', error.message);
    return {
      isValid: false,
      message: error.message,
    };
  }
};

/**
 * Verify Razorpay Webhook Event Signature
 * @param {Object} options
 * @param {string|Buffer} options.rawBody - Raw request body
 * @param {string} options.signature - Header 'x-razorpay-signature'
 * @param {string} [options.secret] - Webhook secret
 */
const verifyWebhookSignature = ({ rawBody, signature, secret = process.env.RAZORPAY_WEBHOOK_SECRET }) => {
  if (!secret) {
    return { isValid: true, simulated: true, message: 'Webhook secret omitted (sandbox)' };
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return {
      isValid: expectedSignature === signature,
    };
  } catch {
    return { isValid: false };
  }
};

module.exports = {
  getKeyId,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
};
