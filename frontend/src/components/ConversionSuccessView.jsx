import { CheckCircle2, ShieldCheck, KeyRound, Clock, MapPin, Home } from 'lucide-react';

export default function ConversionSuccessView({
  type = 'booking', // 'booking' | 'driver'
  booking = null,
  onBackToHome,
  onOpenBookings,
  onOpenDriverLogin,
}) {
  if (type === 'driver') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 sm:py-28 text-center space-y-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Registration Submitted · Meta & Google Ads Verified
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-950 font-sans tracking-tight">
            Driver Application Confirmed!
          </h1>
          <p className="text-base text-neutral-600 max-w-lg mx-auto">
            Your registration is received and your <strong>90-Day (3-Month) Free Trial</strong> has been activated in the Mana Drivers system.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm text-left space-y-4">
          <div className="flex items-start gap-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
            <KeyRound className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-emerald-950 font-sans">
                Permanent Driver Review OTP
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                A permanent 4-digit Review OTP is assigned to your driver profile. Customers must enter this OTP after every trip to leave you verified 5-star ratings!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
            <Clock className="w-5 h-5 text-neutral-700 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-neutral-950 font-sans">
                Aadhaar & License Verification
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Our Hyderabad operations desk verifies documents within 24 to 72 hours. Once approved, your profile becomes publicly searchable for personal car owners.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onOpenDriverLogin && (
            <button
              type="button"
              onClick={onOpenDriverLogin}
              className="w-full sm:w-auto px-6 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full font-bold text-sm transition-all shadow-sm cursor-pointer"
            >
              Go to Driver Dashboard
            </button>
          )}
          <button
            type="button"
            onClick={onBackToHome}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 sm:py-28 text-center space-y-8 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-3">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Booking Confirmed · Conversion Tracked
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-950 font-sans tracking-tight">
          Your Personal Driver is Confirmed!
        </h1>
        <p className="text-base text-neutral-600 max-w-lg mx-auto">
          Thank you for choosing Mana Drivers. Your trip details have been dispatched to our verified Hyderabad driver network.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm text-left space-y-5">
        {booking && (
          <div className="p-4 bg-[#FAF9F6] border border-neutral-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>Booking Reference</span>
              <span className="font-mono font-bold text-neutral-950">{booking.id || 'MNA-HYD-LATEST'}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold text-neutral-950">
              <span>{booking.tripType || 'City Duty (4/6/8h)'}</span>
              <span className="text-emerald-700 font-mono">₹{booking.estimatedFare || 'Standard Rate'}</span>
            </div>
            {booking.pickupLocation && (
              <p className="text-xs text-neutral-600 flex items-center gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>Pickup: {booking.pickupLocation}</span>
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-neutral-900 font-sans">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>30-Min Doorstep Pickup</span>
            </div>
            <p className="text-neutral-600">
              Driver will reach your Hyderabad location at the scheduled time.
            </p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-neutral-900 font-sans">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Direct Driver Payment</span>
            </div>
            <p className="text-neutral-600">
              Pay ₹0 commission directly to driver via PhonePe, GPay, or Cash upon completion.
            </p>
          </div>
        </div>

        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1">
          <p className="font-bold font-sans">Trip Tip: Ask for the 4-Digit Review OTP</p>
          <p className="text-amber-900">
            Every driver has a unique permanent Review OTP. Ask your driver for this code at the end of the trip to submit an honest rating!
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {onOpenBookings && (
          <button
            type="button"
            onClick={onOpenBookings}
            className="w-full sm:w-auto px-6 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full font-bold text-sm transition-all shadow-sm cursor-pointer"
          >
            View Active Bookings
          </button>
        )}
        <button
          type="button"
          onClick={onBackToHome}
          className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return to Homepage</span>
        </button>
      </div>
    </div>
  );
}
