import { useState } from 'react';
import { X, Calendar, Clock, MapPin, Star, Phone, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { validateAddress, validateIndianMobile } from '../utils/helpers';

export default function BookingModal({ driver, isOpen, onClose, onBookingConfirmed }) {
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('10:00');
  const [hours, setHours] = useState(3);
  const [pickupAddress, setPickupAddress] = useState('Hitec City, Cyber Towers, Hyderabad');
  const [passengerNotes, setPassengerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !driver) return null;

  const isPermanent = driver.driverType === 'permanent';
  const totalCost = isPermanent
    ? (driver.monthlySalary || 20000)
    : (driver.hourlyRate || 180) * hours;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate Customer Phone Number
    const phoneRes = validateIndianMobile(customerPhone);
    if (!phoneRes.isValid) {
      toast.error(phoneRes.error);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      toast.error('Pickup date cannot be in the past');
      return;
    }

    const addrRes = validateAddress(pickupAddress);
    if (!addrRes.isValid) {
      toast.error(addrRes.error);
      return;
    }

    if (!isPermanent && (hours < 1 || hours > 24)) {
      toast.error('Duration must be between 1 and 24 hours');
      return;
    }

    setIsSubmitting(true);

    const cleanCustomerMobile = phoneRes.cleaned;
    const newBooking = {
      id: `HYD-${Math.floor(1000 + Math.random() * 9000)}`,
      driverId: driver.id,
      driverName: driver.name,
      driverType: driver.driverType || 'freelance',
      customerPhone: `+91 ${cleanCustomerMobile.slice(0, 5)} ${cleanCustomerMobile.slice(5)}`,
      date,
      time,
      hours: isPermanent ? 'Monthly Chauffeur' : hours,
      pickupAddress: addrRes.cleaned,
      totalCost,
      passengerNotes: passengerNotes.trim().slice(0, 300),
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    // 1. Save to backend database
    onBookingConfirmed(newBooking);

    // 2. Direct Instant WhatsApp Dispatch to Driver
    const rawDriverPhone = (driver.rawPhone || driver.phone || '').replace(/[^0-9]/g, '').replace(/^91/, '');
    const messageText = `Hello ${driver.name},\n\nI want to book you as my personal car driver in Hyderabad via Mana Drivers.\n\n📱 Customer Mobile: +91 ${cleanCustomerMobile}\n📍 Pickup Address: ${addrRes.cleaned}\n📅 Pickup Date: ${date}\n⏰ Pickup Time: ${time}\n⏳ Duration: ${isPermanent ? 'Monthly Chauffeur' : `${hours} Hours`}\n💰 Total Fare: ₹${totalCost.toLocaleString('en-IN')}\n${passengerNotes ? `📝 Notes: ${passengerNotes}\n` : ''}\nPlease confirm availability!`;

    const targetPhone = rawDriverPhone || '9963254183';
    const waUrl = `https://wa.me/91${targetPhone}?text=${encodeURIComponent(messageText)}`;

    toast.success(`Booking saved! Launching WhatsApp connection...`);
    window.open(waUrl, '_blank');

    setIsSubmitting(false);
    onClose();
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
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              DIRECT WHATSAPP BOOKING
            </p>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-950 font-sans">
              Schedule Your Driver
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-950 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 overflow-y-auto">
          {/* Driver Card Summary */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={driver.photo}
                alt={driver.name}
                className="w-12 h-12 rounded-xl object-cover border border-neutral-200"
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

          {/* Customer Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              <span>Your Mobile Number</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-neutral-400">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="98765 43210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full pl-11 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Pickup Address */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>Doorstep Pickup Address</span>
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="e.g. Cyber Towers Hitec City, Rd 36 Jubilee Hills"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
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
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Duration Selector (Only for freelance drivers) */}
          {!isPermanent && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
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
                        ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Special Instructions (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Instructions (Optional)
            </label>
            <input
              type="text"
              maxLength={300}
              value={passengerNotes}
              onChange={(e) => setPassengerNotes(e.target.value)}
              placeholder="e.g. RGIA airport drop, automatic car, night trip"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Fare Summary */}
          <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-emerald-900 font-medium">
              <span>{isPermanent ? 'Monthly Salary' : `Driver Rate (${hours} hrs)`}</span>
              <span>₹{totalCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950 pt-1 border-t border-emerald-200">
              <span>Total Fare (Pay Driver Direct)</span>
              <span className="text-base font-sans">₹{totalCost.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-md"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            <span>{isSubmitting ? 'Processing...' : `Confirm & Connect on WhatsApp · ₹${totalCost.toLocaleString('en-IN')}`}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
