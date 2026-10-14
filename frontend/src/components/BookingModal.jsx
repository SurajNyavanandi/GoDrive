import { useState } from 'react';
import { X, Calendar, Clock, MapPin, Star, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingModal({ driver, isOpen, onClose, onBookingConfirmed }) {
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('10:00');
  const [hours, setHours] = useState(3);
  const [pickupAddress, setPickupAddress] = useState('Inorbit Mall, Hitec City, Hyderabad');
  const [passengerNotes, setPassengerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !driver) return null;

  const isPermanent = driver.driverType === 'permanent';
  const totalCost = isPermanent
    ? (driver.monthlySalary || 20000)
    : (driver.hourlyRate || 180) * hours;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickupAddress.trim()) {
      toast.error('Please enter a pickup address in Hyderabad');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newBooking = {
        id: `HYD-${Math.floor(1000 + Math.random() * 9000)}`,
        driverId: driver.id,
        driverName: driver.name,
        driverType: driver.driverType || 'freelance',
        date,
        time,
        hours: isPermanent ? 'Monthly Chauffeur' : hours,
        pickupAddress: pickupAddress.trim(),
        totalCost,
        passengerNotes: passengerNotes.trim(),
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
      };

      onBookingConfirmed(newBooking);
      setIsSubmitting(false);
      toast.success(`Booking confirmed with ${driver.name} for ${date} in Hyderabad!`);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-3xl border border-neutral-200 text-neutral-950 max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-neutral-100">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              BOOK A DRIVER
            </p>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-950 font-sans">
              Schedule Your Driver
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-950 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 overflow-y-auto">
          {/* Driver Card Summary */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={driver.photo}
                alt={driver.name}
                className="w-13 h-13 rounded-xl object-cover border border-neutral-200"
              />
              <div>
                <h3 className="font-bold text-neutral-950 text-sm font-sans">
                  {driver.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                  <span className="font-medium text-neutral-700">
                    {driver.experience} Yrs Exp
                  </span>
                  <span>·</span>
                  <div className="flex items-center gap-0.5 text-neutral-900 font-semibold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{driver.rating}</span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-neutral-400" />
                  <span className="truncate max-w-[180px]">{driver.location}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-neutral-950 font-sans">
                {isPermanent ? `₹${(driver.monthlySalary || 20000).toLocaleString('en-IN')}` : `₹${driver.hourlyRate || 180}`}
              </span>
              <span className="text-[11px] text-neutral-400 block font-normal">
                {isPermanent ? '/ month' : '/ hour'}
              </span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Pickup Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-neutral-950 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Pickup Time</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-neutral-950 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Duration Selector (Only for freelance drivers) */}
          {!isPermanent && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-neutral-700">
                  Required Duration
                </label>
                <span className="text-xs font-bold text-neutral-900">{hours} Hours</span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 6, 8].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(h)}
                    className={`flex-1 py-2 text-xs font-medium rounded-full border transition-all ${
                      hours === h
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pickup Address in Hyderabad */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>Doorstep Pickup Address</span>
            </label>
            <input
              type="text"
              required
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="e.g. Cyber Towers Hitec City, Rd 36 Jubilee Hills, or RGIA Terminal"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
            />
          </div>

          {/* Instructions (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Special Instructions (Optional)
            </label>
            <input
              type="text"
              value={passengerNotes}
              onChange={(e) => setPassengerNotes(e.target.value)}
              placeholder="e.g. RGIA airport terminal drop, car is automatic BMW, night travel"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
            />
          </div>

          {/* Price Calculation Box */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span>{isPermanent ? 'Monthly Driver Package' : `Driver rate (₹${driver.hourlyRate || 180} × ${hours} hrs)`}</span>
              <span className="font-semibold text-neutral-900">₹{totalCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span>Platform fee</span>
              <span className="text-emerald-700 font-semibold">₹0 (Zero commission)</span>
            </div>
            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-950">
                Direct Payment to Driver
              </span>
              <span className="text-xl font-bold text-neutral-950 font-sans">
                ₹{totalCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Submit Pill Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 bg-[#111111] hover:bg-neutral-800 text-white font-medium text-sm rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-xs"
          >
            {isSubmitting ? 'Confirming...' : `Confirm Booking · ₹${totalCost.toLocaleString('en-IN')}`}
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
