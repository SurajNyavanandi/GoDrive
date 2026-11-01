import { useState, useMemo, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Star, Phone, MessageCircle, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { toast } from 'sonner';
import { validateAddress, validateIndianMobile } from '../utils/helpers';
import { calculateCityFare, calculateOutstationFare, MONTHLY_DUTY_TIERS, getMonthlyTier } from '../utils/pricingEngine';
import { HYDERABAD_LOCALITIES } from '../data/mockDrivers';

export default function BookingModal({ driver, isOpen, onClose, onBookingConfirmed }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('10:00');
  
  // Booking parameters according to Welfare Association guidelines
  const [dutyCategory, setDutyCategory] = useState(() => {
    if (driver?.driverType === 'permanent') return 'monthly';
    return 'city';
  }); // 'city' | 'outstation' | 'monthly'

  // Sync duty category whenever selected driver changes
  useEffect(() => {
    if (driver) {
      if (driver.driverType === 'permanent') {
        setDutyCategory('monthly');
      } else if (driver.driverType === 'freelance' && dutyCategory === 'monthly') {
        setDutyCategory('city');
      }
    }
  }, [driver]);

  // City duty state
  const [cityHours, setCityHours] = useState(4);
  const [isNightDuty, setIsNightDuty] = useState(false);
  const [nightHours, setNightHours] = useState(1);

  // Outstation duty state
  const [outstationDays, setOutstationDays] = useState(1);
  const [outstationDistance, setOutstationDistance] = useState(150);
  const [isInterstate, setIsInterstate] = useState(false);
  const [agreedOutstationRules, setAgreedOutstationRules] = useState(false);

  // Monthly duty state
  const [monthlyHoursPerDay, setMonthlyHoursPerDay] = useState(8);

  // Location selector (Granular Doorstep Address)
  const [localitySearch, setLocalitySearch] = useState('');
  const filteredLocalities = useMemo(() => {
    if (!localitySearch.trim()) return HYDERABAD_LOCALITIES;
    const q = localitySearch.toLowerCase();
    return HYDERABAD_LOCALITIES.filter((loc) => loc.toLowerCase().includes(q));
  }, [localitySearch]);

  const [selectedLocality, setSelectedLocality] = useState(HYDERABAD_LOCALITIES[0]);
  const [houseNo, setHouseNo] = useState('');
  const [streetLandmark, setStreetLandmark] = useState('');
  const [passengerNotes, setPassengerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Fare Calculation based on Welfare Association Rules
  const fareBreakdown = useMemo(() => {
    if (dutyCategory === 'city') {
      return calculateCityFare({
        hours: cityHours,
        isNightDuty,
        nightHours,
      });
    } else if (dutyCategory === 'outstation') {
      return calculateOutstationFare({
        distanceKm: outstationDistance,
        days: outstationDays,
        isInterstate,
      });
    } else {
      const tier = getMonthlyTier(monthlyHoursPerDay);
      return {
        totalCost: tier.monthlySalary,
        tier,
        ruleNotice: `${tier.label}: ₹${tier.monthlySalary.toLocaleString('en-IN')}/mo (6 days/week, 1 mandated weekly off).`,
      };
    }
  }, [dutyCategory, cityHours, isNightDuty, nightHours, outstationDistance, outstationDays, isInterstate, monthlyHoursPerDay]);

  if (!isOpen || !driver) return null;

  const fullAddress = `${houseNo.trim() ? houseNo.trim() + ', ' : ''}${streetLandmark.trim() ? streetLandmark.trim() + ', ' : ''}${selectedLocality}, Hyderabad`;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

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

    // Validate pickup time if today
    if (date === today) {
      const now = new Date();
      const [hourStr, minStr] = (time || '10:00').split(':');
      const pickupDateTime = new Date();
      pickupDateTime.setHours(Number(hourStr), Number(minStr), 0, 0);
      if (pickupDateTime.getTime() < now.getTime() + 15 * 60 * 1000) {
        toast.error('Please select a pickup time at least 30 minutes in advance for today');
        return;
      }
    }

    // Outstation mandatory food/stay policy confirmation
    if (dutyCategory === 'outstation' && !agreedOutstationRules) {
      toast.error('Please accept driver food & room accommodation rules to proceed with outstation duty');
      return;
    }

    const addrRes = validateAddress(fullAddress);
    if (!addrRes.isValid) {
      toast.error(addrRes.error);
      return;
    }

    setIsSubmitting(true);

    const cleanCustomerMobile = phoneRes.cleaned;
    const finalFare = fareBreakdown.totalCost;

    let dutyLabel = 'City Duty';
    if (dutyCategory === 'city') {
      dutyLabel = `City Duty (${cityHours} hrs${isNightDuty ? `, ${nightHours}h night` : ''})`;
    } else if (dutyCategory === 'outstation') {
      dutyLabel = `Outstation (${outstationDays} day${outstationDays > 1 ? 's' : ''}${isInterstate ? ', Interstate' : ''})`;
    } else {
      dutyLabel = `Monthly Driver (${fareBreakdown.tier?.label || '8h/day'})`;
    }

    const newBooking = {
      id: `HYD-${Math.floor(1000 + Math.random() * 9000)}`,
      driverId: driver.id,
      driverName: driver.name,
      driverType: driver.driverType || 'freelance',
      customerName: customerName.trim(),
      customerPhone: `+91 ${cleanCustomerMobile.slice(0, 5)} ${cleanCustomerMobile.slice(5)}`,
      date,
      time,
      dutyCategory,
      hours: dutyLabel,
      pickupAddress: addrRes.cleaned,
      totalCost: finalFare,
      passengerNotes: passengerNotes.trim().slice(0, 300),
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    // 1. Save to backend database
    onBookingConfirmed(newBooking);

    // 2. Direct Instant WhatsApp Dispatch to Driver with Welfare Association Rates
    const rawDriverPhone = (driver.rawPhone || driver.phone || '').replace(/[^0-9]/g, '').replace(/^91/, '');
    const messageText = 
`Hello ${driver.name},

I want to book you for driver duty via Mana Drivers:

• Customer Name: ${customerName.trim()}
• Customer Mobile: +91 ${cleanCustomerMobile}
• Pickup Address: ${addrRes.cleaned}
• Pickup Date & Time: ${date} at ${time}
• Duty Type: ${dutyLabel}
• Welfare Fixed Fare: ₹${finalFare.toLocaleString('en-IN')}
${dutyCategory === 'outstation' ? '• Rules: Food & room accommodation policy accepted\n' : ''}${passengerNotes ? `• Notes: ${passengerNotes}\n` : ''}
Rates based on ALL CITY DRIVERS WELFARE ASSOCIATION guidelines.
Please confirm if you are available!`;

    const targetPhone = rawDriverPhone || '9963254183';
    const waUrl = `https://wa.me/91${targetPhone}?text=${encodeURIComponent(messageText)}`;

    toast.success(`Booking saved! Opening WhatsApp...`);
    window.open(waUrl, '_blank');

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-3xl border border-neutral-200 text-neutral-950 max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 sm:py-5 border-b border-neutral-100 bg-neutral-50/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold text-emerald-700">
                Welfare Association Fixed Fare Booking
              </p>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 font-sans">
              Book Driver Directly
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-950 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 overflow-y-auto">
          {/* Driver Card Summary */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
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
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                driver.status === 'Available'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                {driver.status === 'Available' ? 'Available Now' : 'On Duty'}
              </span>
            </div>
          </div>

          {/* Driver Currently On Duty Notice */}
          {driver.status === 'On Duty' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Driver is currently on duty.</strong> You can pre-book them for later today or tomorrow. They will review and confirm availability.
              </p>
            </div>
          )}

          {/* Duty Category Selector aligned with Driver Specialization */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
              {driver.driverType === 'permanent'
                ? 'Assigned Duty: Permanent Monthly Driver'
                : driver.driverType === 'freelance'
                ? 'Assigned Duty: Freelance / Temporary Duties'
                : 'Select Service Duty Category'}
            </label>
            {driver.driverType === 'permanent' ? (
              <div className="p-3 bg-neutral-900 text-white rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold">Monthly Family & Corporate Duty</span>
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Fixed Salary Tier
                </span>
              </div>
            ) : driver.driverType === 'freelance' ? (
              <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-2xl border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setDutyCategory('city')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                    dutyCategory === 'city'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-200/70'
                  }`}
                >
                  City Temporary Duty
                </button>
                <button
                  type="button"
                  onClick={() => setDutyCategory('outstation')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                    dutyCategory === 'outstation'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-200/70'
                  }`}
                >
                  Outstation Duty
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 rounded-2xl border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setDutyCategory('city')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                    dutyCategory === 'city'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-200/70'
                  }`}
                >
                  City Duty
                </button>
                <button
                  type="button"
                  onClick={() => setDutyCategory('outstation')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                    dutyCategory === 'outstation'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-200/70'
                  }`}
                >
                  Outstation
                </button>
                <button
                  type="button"
                  onClick={() => setDutyCategory('monthly')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                    dutyCategory === 'monthly'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-200/70'
                  }`}
                >
                  Monthly
                </button>
              </div>
            )}
          </div>

          {/* Dynamic Category Controls */}
          {dutyCategory === 'city' && (
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900">Required Hours</span>
                <span className="text-xs font-bold text-emerald-700">₹700 Base (First 4 Hours)</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[4, 5, 6, 8, 10, 12].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setCityHours(h)}
                    className={`flex-1 min-h-[44px] py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      cityHours === h
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {h} hrs
                  </button>
                ))}
              </div>

              {/* Night Duty Toggle */}
              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">Night Hours (10 PM to 6 AM)</span>
                  <span className="text-[11px] text-neutral-500">₹150 / hr night surcharge</span>
                </div>
                <input
                  type="checkbox"
                  checked={isNightDuty}
                  onChange={(e) => setIsNightDuty(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {isNightDuty && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-neutral-600">Night Hours:</span>
                  {[1, 2, 3, 4, 6].map((nh) => (
                    <button
                      key={nh}
                      type="button"
                      onClick={() => setNightHours(nh)}
                      className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold border ${
                        nightHours === nh
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-700 border-neutral-200'
                      }`}
                    >
                      {nh}h
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {dutyCategory === 'outstation' && (
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900">Trip Scope</span>
                <span className="text-xs font-bold text-emerald-700">₹2,000 Up to 200 km</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsInterstate(false);
                    setOutstationDays(1);
                  }}
                  className={`min-h-[44px] py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    !isInterstate && outstationDays === 1
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  Single Day (&lt;200 km) · ₹2,000
                </button>
                <button
                  type="button"
                  onClick={() => setIsInterstate(true)}
                  className={`min-h-[44px] py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    isInterstate || outstationDays > 1
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  Multi-Day / Interstate · ₹2,500/day
                </button>
              </div>

              {/* Approximate Distance Selection for Single Day */}
              {!isInterstate && outstationDays === 1 && (
                <div className="pt-2 border-t border-neutral-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-700 font-semibold">Estimated Distance:</span>
                    <span className="text-xs font-bold text-neutral-900">{outstationDistance} km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[100, 150, 200, 250, 300].map((km) => (
                      <button
                        key={km}
                        type="button"
                        onClick={() => setOutstationDistance(km)}
                        className={`flex-1 min-h-[40px] py-1.5 px-2 rounded-lg text-xs font-bold border ${
                          outstationDistance === km
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-white text-neutral-700 border-neutral-200'
                        }`}
                      >
                        {km} km
                      </button>
                    ))}
                  </div>
                  {outstationDistance > 200 && (
                    <p className="text-[11px] text-emerald-700 font-medium">
                      +₹10/km for distance beyond 200 km (+₹{(outstationDistance - 200) * 10}).
                    </p>
                  )}
                </div>
              )}

              {(isInterstate || outstationDays > 1) && (
                <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                  <span className="text-xs text-neutral-700 font-semibold">Number of Days:</span>
                  <div className="flex items-center gap-2">
                    {[2, 3, 4, 5, 7].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setOutstationDays(d);
                          setIsInterstate(true);
                        }}
                        className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold border ${
                          outstationDays === d
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-white text-neutral-700 border-neutral-200'
                        }`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mandatory Outstation Welfare Warning & Required Agreement */}
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 text-xs text-amber-950">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Welfare Association Accommodation &amp; Food Policy</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  Customer must provide driver food expenses. For multi-day and interstate trips, customer MUST arrange decent room accommodation. Sleeping inside vehicles is strictly prohibited.
                </p>
                <label className="flex items-start gap-2.5 pt-2 border-t border-amber-200/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedOutstationRules}
                    onChange={(e) => setAgreedOutstationRules(e.target.checked)}
                    className="w-4.5 h-4.5 mt-0.5 accent-emerald-600 rounded cursor-pointer shrink-0"
                  />
                  <span className="text-xs font-bold text-amber-950 leading-tight">
                    I agree to provide driver food expenses and arrange room accommodation as required by Welfare Association rules *
                  </span>
                </label>
              </div>
            </div>
          )}

          {dutyCategory === 'monthly' && (
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
              <span className="text-xs font-bold text-neutral-900 block">Select Monthly Duty Tier</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {MONTHLY_DUTY_TIERS.slice(0, 3).map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setMonthlyHoursPerDay(tier.hoursPerDay)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      monthlyHoursPerDay === tier.hoursPerDay
                        ? 'bg-neutral-950 text-white border-neutral-950 shadow-md'
                        : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="text-xs font-extrabold">{tier.label}</div>
                    <div className="text-sm font-bold text-emerald-400 mt-1">₹{tier.monthlySalary.toLocaleString('en-IN')}/mo</div>
                    <div className="text-[10px] opacity-80 mt-1">1 Weekly Off</div>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>All monthly subscriptions include 1 mandated weekly day off (6 working days/week).</span>
              </div>
            </div>
          )}

          {/* Customer Full Name */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              maxLength={60}
              placeholder="e.g. Vikram Reddy"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Customer Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              <span>Your Mobile Number *</span>
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

          {/* Pickup Address Dropdown & Detailed Fields */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-neutral-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Complete Doorstep Pickup Address *</span>
            </label>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-neutral-600">
                  Locality / Area *
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {filteredLocalities.length} {filteredLocalities.length === 1 ? 'Area' : 'Areas'}
                </span>
              </div>
              <input
                type="text"
                placeholder="Search area (e.g. Begumpet, Madhapur, Kukatpally)..."
                value={localitySearch}
                onChange={(e) => setLocalitySearch(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 mb-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {filteredLocalities.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Flat / House No, Floor &amp; Building Name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  placeholder="e.g. Flat G1, Radha Krishna Towers"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Street Name &amp; Landmark *
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={streetLandmark}
                  onChange={(e) => setStreetLandmark(e.target.value)}
                  placeholder="e.g. Road No 36, Near Police Station"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
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
              <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
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

          {/* Passenger Notes */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
              Trip Notes / Car Details (Optional)
            </label>
            <input
              type="text"
              maxLength={300}
              value={passengerNotes}
              onChange={(e) => setPassengerNotes(e.target.value)}
              placeholder="e.g. Fortuner automatic car, RGIA drop"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Welfare Association Official Rate Summary */}
          <div className="p-4 bg-emerald-50/90 rounded-2xl border border-emerald-200 space-y-2">
            <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>All City Drivers Welfare Association Fixed Fare</span>
            </div>
            <div className="text-sm text-emerald-950 leading-relaxed font-normal">
              {fareBreakdown.ruleNotice}
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-emerald-950 pt-2 border-t border-emerald-200">
              <span>Final Fare (Direct to Driver)</span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight font-sans text-emerald-950">₹{fareBreakdown.totalCost.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold text-sm sm:text-base rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg cursor-pointer tracking-tight"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            <span>{isSubmitting ? 'Processing...' : `Confirm & Connect on WhatsApp · ₹${fareBreakdown.totalCost.toLocaleString('en-IN')}`}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

