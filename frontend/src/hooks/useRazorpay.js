import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom React hook for Razorpay payments
 * Dynamically loads script, fetches key ID from backend, and handles verification
 */
export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load checkout script dynamically
  const loadScript = useCallback(() => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        setIsScriptLoaded(true);
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setIsScriptLoaded(true);
        resolve(true);
      };
      script.onerror = () => {
        setIsScriptLoaded(false);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  /**
   * Process a checkout payment
   * @param {Object} options
   * @param {number} options.amount - Amount in Rupees
   * @param {string} [options.currency] - Currency (default 'INR')
   * @param {string} [options.name] - Business / App name
   * @param {string} [options.description] - Order description
   * @param {Object} [options.prefill] - { name, email, contact }
   * @param {Object} [options.notes] - Key-value metadata
   * @param {Function} [options.onSuccess] - Callback on payment verified
   * @param {Function} [options.onFailure] - Callback on dismiss/fail
   */
  const processPayment = useCallback(
    async ({
      amount,
      currency = 'INR',
      name = 'VIRAT TOM Development',
      description = 'Starter Template Payment',
      prefill = {},
      notes = {},
      onSuccess,
      onFailure,
    }) => {
      setIsLoading(true);

      try {
        // 1. Ensure Razorpay checkout script is loaded
        const scriptOk = await loadScript();
        if (!scriptOk) {
          throw new Error('Failed to load Razorpay SDK. Please check your network connection.');
        }

        // 2. Create order on backend
        const orderRes = await api.post('/payment/order', {
          amount,
          currency,
          notes,
        });

        const orderData = orderRes.data?.data;
        const order = orderData?.order;
        const keyId = orderData?.keyId || 'rzp_test_mock';

        if (!order || !order.id) {
          throw new Error('Failed to create payment order on backend');
        }

        // 3. Open Razorpay Modal
        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency || 'INR',
          name,
          description,
          order_id: order.id,
          prefill: {
            name: prefill.name || 'Test User',
            email: prefill.email || 'user@example.com',
            contact: prefill.contact || '9876543210',
          },
          notes: {
            ...notes,
            receipt: order.receipt,
          },
          theme: {
            color: '#0071e3',
          },
          handler: async (response) => {
            try {
              // 4. Verify payment signature on backend
              const verifyRes = await api.post('/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              setIsLoading(false);
              if (onSuccess) {
                onSuccess({
                  order,
                  paymentResponse: response,
                  verification: verifyRes.data,
                });
              }
            } catch (err) {
              setIsLoading(false);
              if (onFailure) onFailure(err);
            }
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false);
              if (onFailure) onFailure(new Error('Payment checkout dismissed by user'));
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          setIsLoading(false);
          if (onFailure) onFailure(response.error);
        });
        rzp.open();
      } catch (error) {
        setIsLoading(false);
        if (onFailure) onFailure(error);
        throw error;
      }
    },
    [loadScript]
  );

  return {
    processPayment,
    isLoading,
    isScriptLoaded,
  };
}

export default useRazorpay;
