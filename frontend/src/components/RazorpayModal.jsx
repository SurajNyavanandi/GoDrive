import { useState } from 'react';
import { X, ShieldCheck, Check, Lock, Loader2, QrCode, Smartphone, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function RazorpayModal({ isOpen, onClose, onPaymentSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'qr' | 'card'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExecutePayment = (methodName = 'UPI') => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#0066FF', '#10B981', '#F59E0B', '#3B82F6'],
      });

      toast.success('Payment of ₹300 successful! All Hyderabad drivers are now unlocked.');

      setTimeout(() => {
        onPaymentSuccess();
        setIsSuccess(false);
        onClose();
      }, 1000);
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs transition-opacity">
      <div
        className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl text-slate-900 flex flex-col animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Authentic Razorpay Dark Top Header */}
        <div className="bg-[#0c2340] px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#3395ff] text-white font-extrabold text-xs flex items-center justify-center">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs tracking-tight">Razorpay</span>
                <span className="text-[9px] bg-[#1a3860] text-emerald-400 px-1.5 py-0.2 rounded font-mono font-semibold">SECURE</span>
              </div>
              <p className="text-[10px] text-slate-300">GoDrive Hyderabad · All-Access Pass</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close Razorpay checkout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Strip */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Order Total</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              ₹300<span className="text-xs font-normal text-slate-500">.00</span>
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500 block">order_HYD_300</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Instant Activation</span>
            </span>
          </div>
        </div>

        {/* Direct Payment Options (Zero Intermediate Menus) */}
        <div className="p-4 space-y-3">
          <p className="text-xs font-bold text-slate-700">Choose One-Tap Payment Method:</p>

          {/* Quick UPI Apps Grid */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleExecutePayment('Google Pay')}
              disabled={isProcessing}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center font-bold text-xs text-blue-600">
                  G
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 block">Google Pay (GPay UPI)</span>
                  <span className="text-[10px] text-slate-500">Fast one-tap approval</span>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                Pay ₹300 →
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleExecutePayment('PhonePe')}
              disabled={isProcessing}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 flex items-center justify-between transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                  Pe
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 block">PhonePe UPI</span>
                  <span className="text-[10px] text-slate-500">Direct wallet / bank</span>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-600 group-hover:translate-x-0.5 transition-transform">
                Pay ₹300 →
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleExecutePayment('Paytm')}
              disabled={isProcessing}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 flex items-center justify-between transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#002e6e] text-[#00baf2] font-black text-xs flex items-center justify-center shadow-2xs">
                  P
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 block">Paytm UPI / BHIM</span>
                  <span className="text-[10px] text-slate-500">Any bank account</span>
                </div>
              </div>
              <span className="text-xs font-bold text-sky-600 group-hover:translate-x-0.5 transition-transform">
                Pay ₹300 →
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleExecutePayment('Card')}
              disabled={isProcessing}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-between transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 block">Debit / Credit Card</span>
                  <span className="text-[10px] text-slate-500">Visa, Mastercard, RuPay</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:translate-x-0.5 transition-transform">
                Pay ₹300 →
              </span>
            </button>
          </div>

          {/* Guarantee info */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[11px] text-slate-600">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Unlocks all 10+ Hyderabad drivers permanently. No monthly fees.</span>
          </div>
        </div>

        {/* Processing State Overlay */}
        {isProcessing && (
          <div className="p-4 border-t border-slate-200 bg-blue-50 text-center flex items-center justify-center gap-2 text-xs font-bold text-blue-700">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Connecting to Razorpay & NPCI...</span>
          </div>
        )}

        {/* Success Overlay */}
        {isSuccess && (
          <div className="p-4 border-t border-emerald-200 bg-emerald-50 text-center flex items-center justify-center gap-2 text-xs font-bold text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Payment Approved! Unlocking Drivers...</span>
          </div>
        )}

        {/* Razorpay Trust Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>256-Bit SSL Encrypted</span>
          </span>
          <span className="font-semibold text-slate-600">Razorpay Trusted Business</span>
        </div>
      </div>
    </div>
  );
}
