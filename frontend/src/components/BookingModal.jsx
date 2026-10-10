import { useState } from 'react';
import { X, Calendar, Clock, MapPin, Star, Car, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl text-slate-900 max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto my-3 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Book Driver in Hyderabad</h2>
            <p className="text-xs text-slate-500">Verified Telangana Chauffeur</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Driver Card with 3D Avatar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DriverAvatar3D
                type={driver.avatarType || 'suit'}
                name={driver.name}
                isPro={driver.isPro}
                size="md"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{driver.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                  <Car className="w-3.5 h-3.5 text-blue-600" />
                  <span>{driver.vehicle}</span>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center gap-0.5 text-amber-500 font-semibold">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>{driver.rating}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>{driver.location}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-slate-900 tabular-nums">₹{driver.hourlyRate}</span>
              <span className="text-xs text-slate-500 block">/ hour</span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Pickup Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Pickup Time</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">How many hours do you need the driver?</label>
              <span className="text-xs font-bold text-blue-600 tabular-nums">{hours} Hours</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 4, 6, 8].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHours(h)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    hours === h
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {h} hrs
                </button>
              ))}
            </div>
          </div>

          {/* Pickup Address in Hyderabad */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Where in Hyderabad should the driver come?</span>
            </label>
            <input
              type="text"
              required
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="e.g. Hitec City Cyber Towers, Road No. 36 Jubilee Hills, or RGIA Shamshabad"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (e.g. Airport flight number, wedding, outstation)</label>
            <input
              type="text"
              value={passengerNotes}
              onChange={(e) => setPassengerNotes(e.target.value)}
              placeholder="e.g. Flight arrival at RGIA Shamshabad, or family wedding trip"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Live Price Calculator */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Driver rate (₹{driver.hourlyRate} × {hours} hours)</span>
              <span className="font-semibold text-slate-900">₹{totalCost}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Platform service fee</span>
              <span className="text-emerald-600 font-semibold">Free (₹0)</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Total to pay driver in Hyderabad</span>
              <span className="text-xl font-extrabold text-blue-600 tabular-nums">₹{totalCost}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Hyderabad Booking'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
