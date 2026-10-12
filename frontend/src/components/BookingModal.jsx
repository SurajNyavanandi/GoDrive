import { useState } from 'react';
import { X, Calendar, Clock, MapPin, Star, Car, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import DriverAvatar3D from './DriverAvatar3D';

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

  const totalCost = (driver.hourlyRate || 200) * hours;

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
        vehicle: driver.vehicle,
        date,
        time,
        hours,
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
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white border-2 border-neutral-900 text-neutral-950 max-h-[94vh] flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-neutral-900 bg-neutral-950 text-white">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#FF5500] font-black">
              [ BOOK DRIVER ]
            </div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
              Book Your Driver
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Driver Card Summary */}
          <div className="p-4 bg-neutral-50 border border-neutral-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DriverAvatar3D
                type={driver.avatarType || 'suit'}
                name={driver.name}
                isPro={driver.isPro}
                size="md"
              />
              <div>
                <h3 className="font-black text-neutral-950 text-sm uppercase tracking-tight">
                  {driver.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-600 mt-0.5 font-medium">
                  <Car className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span>{driver.vehicle}</span>
                  <span>·</span>
                  <div className="flex items-center gap-0.5 text-neutral-950 font-bold">
                    <Star className="w-3 h-3 fill-[#FF5500] text-[#FF5500]" />
                    <span>{driver.rating}</span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#FF5500]" />
                  <span>{driver.location}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-neutral-950 tabular-nums">₹{driver.hourlyRate}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">/ hour</span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Pickup Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-950 focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Pickup Time</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-950 focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]"
              />
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                How Many Hours?
              </label>
              <span className="text-xs font-black text-[#FF5500] uppercase font-mono">{hours} Hours</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 4, 6, 8].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHours(h)}
                  className={`py-2 text-xs font-black uppercase tracking-wider border transition-all ${
                    hours === h
                      ? 'bg-neutral-950 text-white border-neutral-950'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                  }`}
                >
                  {h} hrs
                </button>
              ))}
            </div>
          </div>

          {/* Pickup Address in Hyderabad */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Pickup Address in Hyderabad</span>
            </label>
            <input
              type="text"
              required
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="e.g. Cyber Towers Hitec City, Rd 36 Jubilee Hills, or RGIA Shamshabad"
              className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 placeholder-neutral-400 focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Instructions (Optional)
            </label>
            <input
              type="text"
              value={passengerNotes}
              onChange={(e) => setPassengerNotes(e.target.value)}
              placeholder="e.g. RGIA airport terminal pick-up, outstation to Vijayawada"
              className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:border-[#FF5500]"
            />
          </div>

          {/* Live Price Calculation Box */}
          <div className="p-4 bg-neutral-100 border border-neutral-300 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-600 font-medium">
              <span>Driver rate (₹{driver.hourlyRate} × {hours} hours)</span>
              <span className="font-bold text-neutral-950">₹{totalCost}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-600 font-medium">
              <span>Platform fee</span>
              <span className="text-emerald-700 font-bold uppercase tracking-wider">₹0 (No extra fees)</span>
            </div>
            <div className="pt-2 border-t border-neutral-300 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-950">
                Total to Pay Driver
              </span>
              <span className="text-xl font-black text-[#FF5500] font-mono">₹{totalCost}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-[#FF5500] hover:bg-[#E04B00] text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-md"
          >
            {isSubmitting ? 'CONFIRMING...' : `CONFIRM BOOKING (₹${totalCost})`}
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </form>
      </div>
    </div>
  );
}
