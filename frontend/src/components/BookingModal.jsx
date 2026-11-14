import { useState, useMemo, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Star, MessageCircle, AlertTriangle, ShieldCheck, Info, Navigation, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { validateAddress, validateIndianMobile } from '../utils/helpers';
import { calculateCityFare, calculateOutstationFare, MONTHLY_DUTY_TIERS, getMonthlyTier, ALLOWED_CITY_BOOKING_HOURS } from '../utils/pricingEngine';
import { HYDERABAD_LOCALITIES } from '../utils/constants';
import { fetchReviewsApi } from '../utils/api';
import SearchableSelect from './common/SearchableSelect';
import LocationPermissionModal from './common/LocationPermissionModal';
import { generateGoogleMapsUrl } from '../utils/locationHelper';

export default function BookingModal({ driver, isOpen, onClose, onBookingConfirmed, pricingSettings }) {
  const [driverReviews, setDriverReviews] = useState([]);
  const [showReviewsToggle, setShowReviewsToggle] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('10:00');
  
  // Normalize driver registration type (freelance | permanent | combined)
  const normalizedDriverType = useMemo(() => {
    if (!driver) return 'freelance';
    const type = (driver.driverType || driver.type || '').toLowerCase();
    const pref = (driver.workingPreference || '').toLowerCase();
    if (type === 'permanent' || type === 'monthly' || (pref.includes('monthly') && !pref.includes('hourly') && !pref.includes('combined') && !pref.includes('both'))) {
      return 'permanent';
    }
    if (type === 'combined' || type === 'combination' || type === 'both' || pref.includes('combined') || pref.includes('both')) {
      return 'combined';
    }
    return 'freelance';
  }, [driver]);

  // Booking duty parameters: 'city' | 'outstation' | 'monthly'
  const [dutyCategory, setDutyCategory] = useState(() => {
    if (normalizedDriverType === 'permanent') return 'monthly';
    return 'city';
  });

  // Sync duty category during render when driver or driver type changes
  const [prevDriverId, setPrevDriverId] = useState(driver?.id);
  if (driver && driver.id !== prevDriverId) {
    setPrevDriverId(driver.id);
    if (normalizedDriverType === 'permanent') {
      setDutyCategory('monthly');
    } else if (normalizedDriverType === 'freelance' && dutyCategory === 'monthly') {
      setDutyCategory('city');
    }
  }

  // City duty state (Only 4, 6, 8 hours allowed per requirement)
  const [cityHours, setCityHours] = useState(4);
  const [isNightDuty, setIsNightDuty] = useState(false);
  const [nightHours, setNightHours] = useState(1);

  // Outstation duty state (No 200km restriction box)
  const [outstationDays, setOutstationDays] = useState(1);
  const [isInterstate, setIsInterstate] = useState(false);
  const [agreedOutstationRules, setAgreedOutstationRules] = useState(false);

  // Monthly duty state: 4, 8, or 12 hours
  const [monthlyHoursPerDay, setMonthlyHoursPerDay] = useState(8);

  // Searchable Doorstep Locality & Live GPS Location State (100% Free, 0 API Keys)
  const [selectedLocality, setSelectedLocality] = useState(HYDERABAD_LOCALITIES[0] || 'Kondapur');
  const [houseNo, setHouseNo] = useState('');
  const [streetLandmark, setStreetLandmark] = useState('');
  const [passengerNotes, setPassengerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressMode, setAddressMode] = useState('manual'); // 'manual' | 'gps'
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [gpsAddressDetails, setGpsAddressDetails] = useState(null);
  const [gpsCoords, setGpsCoords] = useState(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt');
  const [permissionError, setPermissionError] = useState('');

  const handleOpenLocationPrompt = () => {
    setPermissionState('prompt');
    setPermissionError('');
    setIsPermissionModalOpen(true);
  };

  const executeGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error('Browser location is unavailable. Please type your address manually.');
      setIsPermissionModalOpen(false);
      setAddressMode('manual');
      return;
    }

    setPermissionState('requesting');
    setIsDetectingLocation(true);
    toast.loading('Acquiring high-accuracy GPS coordinates...', { id: 'gps-fetch' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGpsCoords({ lat: latitude, lng: longitude });
        setPermissionState('prompt');
        setIsPermissionModalOpen(false);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          toast.dismiss('gps-fetch');

          if (data && data.address) {
            const addr = data.address;
            const sub = addr.suburb || addr.neighbourhood || addr.residential || addr.district || addr.city_district || 'Hyderabad';
            const road = addr.road || addr.pedestrian || addr.street || '';
            const house = addr.house_number || addr.building || '';

            const matchedLocality = HYDERABAD_LOCALITIES.find(
              (l) => l.toLowerCase() === sub.toLowerCase() || l.toLowerCase().includes(sub.toLowerCase())
            );

            if (matchedLocality) {
              setSelectedLocality(matchedLocality);
            } else if (sub) {
              setSelectedLocality(sub);
            }

            if (house) setHouseNo(`House/Flat ${house}`);
            if (road) setStreetLandmark(road);

            setGpsAddressDetails(data.display_name);
            setAddressMode('gps');
            toast.success('Live GPS location detected! Verified address filled.');
          } else {
            setAddressMode('gps');
            setGpsAddressDetails(`GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
            toast.success(`GPS coordinates captured (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          }
        } catch {
          toast.dismiss('gps-fetch');
          setAddressMode('gps');
          setGpsAddressDetails(`GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          toast.success(`GPS coordinates captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        toast.dismiss('gps-fetch');
        setIsDetectingLocation(false);
        if (err.code === 1) {
          // Permission denied
          setPermissionState('denied');
          setPermissionError('Location permission was denied in your browser or device settings.');
          setIsPermissionModalOpen(true);
        } else if (err.code === 2) {
          toast.error('Location position unavailable. Please choose your area manually.');
          setIsPermissionModalOpen(false);
          setAddressMode('manual');
        } else {
          toast.error('Location request timed out. Please select your area manually.');
          setIsPermissionModalOpen(false);
          setAddressMode('manual');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const handleManualLocationFallback = () => {
    setIsPermissionModalOpen(false);
    setAddressMode('manual');
    toast.info('Switched to manual Hyderabad address entry');
  };

  // Dynamic Fare Calculation based on Standard Duty Rates
  const fareBreakdown = useMemo(() => {
    if (dutyCategory === 'city') {
      return calculateCityFare({
        hours: cityHours,
        isNightDuty,
        nightHours,
        pricing: pricingSettings,
      });
    } else if (dutyCategory === 'outstation') {
      return calculateOutstationFare({
        days: outstationDays,
        isInterstate,
        pricing: pricingSettings,
      });
    } else {
      const tier = getMonthlyTier(monthlyHoursPerDay, pricingSettings);
      return {
        totalCost: tier.monthlySalary,
        tier,
        ruleNotice: `${tier.label}: ${tier.salaryRangeText} (6 days/week, 1 mandated weekly off).`,
      };
    }
  }, [dutyCategory, cityHours, isNightDuty, nightHours, outstationDays, isInterstate, monthlyHoursPerDay, pricingSettings]);

  useEffect(() => {
    let mounted = true;
    if (driver?.id) {
      fetchReviewsApi(driver.id).then((revs) => {
        if (mounted && Array.isArray(revs)) {
          setDriverReviews(revs);
        }
      });
    }
    return () => { mounted = false; };
  }, [driver?.id]);

  if (!isOpen || !driver) return null;

  const isLocationDetected = Boolean(addressMode === 'gps' && (gpsCoords || gpsAddressDetails));

  const manualAddressParts = [houseNo.trim(), streetLandmark.trim()].filter(Boolean).join(', ');
  const fullAddress = isLocationDetected
    ? (manualAddressParts
        ? `${manualAddressParts}, ${gpsAddressDetails || `${selectedLocality}, Hyderabad`}`
        : (gpsAddressDetails || `${selectedLocality}, Hyderabad`))
    : `${manualAddressParts ? manualAddressParts + ', ' : ''}${selectedLocality}, Hyderabad`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    // Validate Customer Phone Number
    const phoneRes = validateIndianMobile(customerPhone);
    if (!phoneRes.isValid) {
      setPhoneError(phoneRes.error);
      toast.error(phoneRes.error);
      return;
    }
    setPhoneError('');

    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      toast.error('Pickup date cannot be in the past');
      return;
    }

    if (dutyCategory === 'outstation' && !agreedOutstationRules) {
      toast.error('Please acknowledge the Outstation food and accommodation policy');
      return;
    }

    // Validate Doorstep Address:
    // When live GPS location is detected, manual house/flat and street entry is optional
    let resolvedPickupAddress;
    if (isLocationDetected) {
      resolvedPickupAddress = fullAddress;
    } else {
      if (!houseNo.trim() || !streetLandmark.trim()) {
        toast.error('Please enter your house/flat number and street/landmark, or use Detect Live Location');
        return;
      }
      const addrRes = validateAddress(fullAddress);
      if (!addrRes.isValid) {
        toast.error(addrRes.error);
        return;
      }
      resolvedPickupAddress = addrRes.cleaned;
    }

    setIsSubmitting(true);

    const cleanCustomerMobile = phoneRes.cleaned;
    const finalFare = fareBreakdown.totalCost;
    const dutyLabel =
      dutyCategory === 'city'
        ? `${cityHours} Hours City Duty${isNightDuty ? ` (+${nightHours}h Night)` : ''}`
        : dutyCategory === 'outstation'
        ? `${outstationDays} Day${outstationDays > 1 ? 's' : ''} ${isInterstate ? 'Interstate' : 'Outstation'} Trip`
        : `${monthlyHoursPerDay} Hours/Day Monthly Chauffeur (${fareBreakdown.tier?.salaryRangeText || 'Negotiable'})`;

    const googleMapsUrl = generateGoogleMapsUrl(resolvedPickupAddress, gpsCoords);

    const newBooking = {
      id: `BK-${Date.now()}`,
      driverId: driver.id,
      driverName: driver.name,
      driverPhone: driver.phone || driver.rawPhone,
      driverType: driver.driverType || 'freelance',
      customerName: customerName.trim(),
      customerPhone: `+91 ${cleanCustomerMobile.slice(0, 5)} ${cleanCustomerMobile.slice(5)}`,
      date,
      time,
      dutyCategory,
      hours: dutyLabel,
      pickupAddress: resolvedPickupAddress,
      mapsUrl: googleMapsUrl,
      coords: gpsCoords,
      totalCost: finalFare,
      passengerNotes: passengerNotes.trim().slice(0, 300),
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    // 1. Save to backend database
    const bookingRes = await onBookingConfirmed(newBooking);
    if (bookingRes && !bookingRes.success) {
      setIsSubmitting(false);
      if (bookingRes.field === 'customerPhone' || bookingRes.code === 'DUPLICATE_ENTRY') {
        setPhoneError(bookingRes.message);
      }
      toast.error(bookingRes.message || 'Failed to confirm booking.');
      return;
    }

    // 2. Direct Instant WhatsApp Dispatch to Driver with Transparent Fixed Rates
    const rawDriverPhone = (driver.rawPhone || driver.phone || '').replace(/[^0-9]/g, '').replace(/^91/, '');
    const messageText = 
`Hello ${driver.name},

I want to book you for personal car driving duty via Mana Drivers:

• Customer Name: ${customerName.trim()}
• Customer Mobile: +91 ${cleanCustomerMobile}
• Pickup Address: ${resolvedPickupAddress}
• Google Maps Location: ${googleMapsUrl}
• Pickup Date & Time: ${date} at ${time}
• Duty Schedule: ${dutyLabel}
• Estimated Fare / Salary: ${dutyCategory === 'monthly' ? fareBreakdown.tier?.salaryRangeText : `₹${finalFare.toLocaleString('en-IN')}`}
${dutyCategory === 'outstation' ? '• Rules: Food & room accommodation policy accepted\n' : ''}${passengerNotes ? `• Notes: ${passengerNotes}\n` : ''}
Transparent direct rates with 0% platform commission.
Please confirm your availability!`;

    if (rawDriverPhone) {
      const waUrl = `https://wa.me/91${rawDriverPhone}?text=${encodeURIComponent(messageText)}`;
      toast.success(`Booking confirmed! Opening WhatsApp connection to ${driver.name}...`);
      window.location.href = waUrl;
    } else {
      toast.success(`Booking saved successfully! Driver will contact you at +91 ${cleanCustomerMobile}.`);
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-3xl border border-neutral-200 text-neutral-950 max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 sm:py-5 border-b border-neutral-100 bg-neutral-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold text-emerald-700">
                Transparent Fixed Fare Booking (0% Commission)
              </p>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 font-sans">
              Book {driver.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-5">
          {/* Driver Mini Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
            <img
              src={driver.photo}
              alt={driver.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-neutral-900 truncate">
                  {driver.name}
                </h3>
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {driver.rating || '5.0'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 truncate">
                {driver.experience} Yrs Exp · {driver.location} · {driver.languages}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-mono">
                  Verified LMV License
                </span>
                {driverReviews.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowReviewsToggle(!showReviewsToggle)}
                    className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                  >
                    {driverReviews.length} Verified Reviews
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Dropdown Preview if requested */}
          {showReviewsToggle && driverReviews.length > 0 && (
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2 text-xs">
              <p className="font-bold text-neutral-900">Recent Customer Reviews:</p>
              {driverReviews.slice(0, 3).map((r, i) => (
                <div key={i} className="p-2 bg-white rounded-xl border border-neutral-100">
                  <div className="flex items-center justify-between font-semibold">
                    <span>{r.author}</span>
                    <span className="text-amber-500 font-bold">{r.rating}★</span>
                  </div>
                  <p className="text-neutral-600 text-[11px] mt-0.5 font-normal">"{r.quote}"</p>
                </div>
              ))}
            </div>
          )}

          {/* Duty Category Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-800 font-sans">
              Choose Duty Category *
            </label>
            {normalizedDriverType === 'permanent' ? (
              <div className="p-3 bg-neutral-100 rounded-xl text-xs font-semibold text-neutral-800">
                Monthly Chauffeur Duty (Permanent Placement)
              </div>
            ) : normalizedDriverType === 'freelance' ? (
              <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setDutyCategory('city')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dutyCategory === 'city'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-200/70'
                  }`}
                >
                  City Duty (4, 6, 8 Hours)
                </button>
                <button
                  type="button"
                  onClick={() => setDutyCategory('outstation')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dutyCategory === 'outstation'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-200/70'
                  }`}
                >
                  Outstation Highway Duty
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setDutyCategory('city')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dutyCategory === 'monthly'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-200/70'
                  }`}
                >
                  Monthly Duty
                </button>
              </div>
            )}
          </div>

          {/* Dynamic Category Controls */}
          {dutyCategory === 'city' && (() => {
            const baseHours = pricingSettings?.cityBaseHours || 4;
            const baseFare = pricingSettings?.cityBaseFare || 700;
            const extraRate = pricingSettings?.cityExtraHourlyRate || 100;
            const nightRate = pricingSettings?.nightSurchargePerHour || 150;

            const fare4h = baseFare;
            const fare6h = baseFare + (6 - baseHours) * extraRate;
            const fare8h = baseFare + (8 - baseHours) * extraRate;

            return (
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900">Required Hours (Standard Fixed Rates)</span>
                  <span className="text-xs font-bold text-emerald-700">₹{fare4h} (4h) · ₹{fare6h} (6h) · ₹{fare8h} (8h)</span>
                </div>
                
                {/* Strictly 4, 6, 8 Hours selection per user requirement */}
                <div className="grid grid-cols-3 gap-2">
                  {ALLOWED_CITY_BOOKING_HOURS.map((h) => {
                    const hCost = h === 4 ? fare4h : h === 6 ? fare6h : fare8h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setCityHours(h)}
                        className={`py-3 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          cityHours === h
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="text-sm font-extrabold">{h} Hours</div>
                        <div className={cityHours === h ? 'text-emerald-100 text-[11px] mt-0.5' : 'text-neutral-500 text-[11px] mt-0.5'}>
                          {h === 4 ? `₹${hCost} Base` : h === 6 ? `₹${hCost} Fixed` : `₹${hCost} Full Day`}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Extra Hours & Additional Time Customer Notice */}
                <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-xl space-y-1 text-xs text-amber-950">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Info className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Extra Hours Notice for Customer</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900">
                    Base city duty covers {baseHours} hours for ₹{baseFare}. If you select {cityHours} hours or extend your trip beyond booked hours, please <strong>pay the driver accordingly (+₹{extraRate}/extra hour)</strong> directly via Cash or UPI. 0% platform commission deducted.
                  </p>
                </div>

                {/* Night Duty Toggle */}
                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">Night Hours (10:00 PM to 6:00 AM)</span>
                    <span className="text-[11px] text-neutral-500">₹{nightRate} / hr night surcharge for late night duties</span>
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
                        className={`min-h-9.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border ${
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
            );
          })()}

          {dutyCategory === 'outstation' && (
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900">Trip Scope</span>
                <span className="text-xs font-bold text-emerald-700">₹2,000 / day flat</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsInterstate(false);
                    setOutstationDays(1);
                  }}
                  className={`min-h-11 py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    !isInterstate && outstationDays === 1
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  Single Day Outstation · ₹2,000
                </button>
                <button
                  type="button"
                  onClick={() => setIsInterstate(true)}
                  className={`min-h-11 py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    isInterstate || outstationDays > 1
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  Multi-Day / Interstate · ₹2,500/day
                </button>
              </div>

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
                        className={`min-h-9.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border ${
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

              {/* Mandatory Outstation Accommodation & Food Policy */}
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 text-xs text-amber-950">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Outstation Accommodation &amp; Food Policy</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  Customer must provide driver food expenses. For multi-day and overnight stays, customer MUST arrange decent room accommodation. Sleeping inside cars is strictly prohibited.
                </p>
                <label className="flex items-start gap-2.5 pt-2 border-t border-amber-200/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedOutstationRules}
                    onChange={(e) => setAgreedOutstationRules(e.target.checked)}
                    className="w-4.5 h-4.5 mt-0.5 accent-emerald-600 rounded cursor-pointer shrink-0"
                  />
                  <span className="text-xs font-bold text-amber-950 leading-tight">
                    I agree to provide driver food expenses and arrange room accommodation for driver safety *
                  </span>
                </label>
              </div>
            </div>
          )}

          {dutyCategory === 'monthly' && (
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
              <span className="text-xs font-bold text-neutral-900 block">Select Monthly Duty Tier (Salary in Range)</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {MONTHLY_DUTY_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setMonthlyHoursPerDay(tier.hoursPerDay)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      monthlyHoursPerDay === tier.hoursPerDay
                        ? 'bg-neutral-950 text-white border-neutral-950 shadow-md'
                        : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="text-xs font-extrabold">{tier.label}</div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-400 mt-1">{tier.salaryRangeText}</div>
                    <div className="text-[10px] opacity-80 mt-1">6 Days/Wk · 1 Weekly Off</div>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Monthly salaries are in negotiable ranges directly settled between car owner and driver. All monthly placements include 1 mandated weekly off.</span>
              </div>
            </div>
          )}

          {/* Customer Full Name */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5 font-sans">
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
            <label className="block text-xs font-bold text-neutral-800 mb-1.5 font-sans">
              Your Mobile Number (For Driver Call &amp; Dispatch) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500 font-mono">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="98765 43210"
                value={customerPhone}
                onChange={(e) => {
                  setPhoneError('');
                  setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                }}
                className={`w-full pl-11 pr-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs sm:text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                  phoneError ? 'border-red-500 bg-red-50/30' : 'border-neutral-200'
                }`}
              />
            </div>
            {phoneError && (
              <p className="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{phoneError}</span>
              </p>
            )}
          </div>

          {/* Doorstep Pickup Address Selection (Manual or Live GPS) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 font-sans">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isLocationDetected ? 'Pickup Location (Live GPS Detected)' : 'Complete Doorstep Pickup Address *'}</span>
              </label>

              {/* Address Mode Toggle (100% Free - 0 API Keys) */}
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-[11px]">
                <button
                  type="button"
                  onClick={() => setAddressMode('manual')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    addressMode === 'manual'
                      ? 'bg-white text-neutral-950 shadow-xs border border-neutral-200'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={handleOpenLocationPrompt}
                  disabled={isDetectingLocation}
                  className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    addressMode === 'gps'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-700 hover:bg-emerald-100/70'
                  }`}
                >
                  <Navigation className="w-3 h-3 animate-pulse" />
                  <span>{isDetectingLocation ? 'Locating...' : 'Detect Live Location'}</span>
                </button>
              </div>
            </div>

            {/* GPS Detection Confirmation Banner */}
            {isLocationDetected && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start gap-2">
                <Navigation className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-950">Live Location Detected:</span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-200/70 text-emerald-800 rounded-full">
                      Entering below details is optional
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-800 block">
                    {gpsAddressDetails || `Coordinates: ${gpsCoords?.lat.toFixed(5)}, ${gpsCoords?.lng.toFixed(5)}`}
                  </span>
                </div>
              </div>
            )}

            {/* Searchable Select for 300+ Localities */}
            <SearchableSelect
              options={HYDERABAD_LOCALITIES}
              value={selectedLocality}
              onChange={(val) => setSelectedLocality(val)}
              label="Hyderabad Locality / Area"
              placeholder="Search Hyderabad area (e.g. Kondapur, Banjara Hills)..."
              searchPlaceholder="Type area name (e.g. Gachibowli, Kukatpally)..."
              required={!isLocationDetected}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  {isLocationDetected ? 'Flat / House No, Floor (Optional with GPS)' : 'Flat / House No, Floor & Building Name *'}
                </label>
                <input
                  type="text"
                  required={!isLocationDetected}
                  maxLength={100}
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  placeholder={isLocationDetected ? 'Optional: e.g. Flat G1, Towers' : 'e.g. Flat G1, Radha Krishna Towers'}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  {isLocationDetected ? 'Street Name & Landmark (Optional with GPS)' : 'Street Name & Landmark *'}
                </label>
                <input
                  type="text"
                  required={!isLocationDetected}
                  maxLength={150}
                  value={streetLandmark}
                  onChange={(e) => setStreetLandmark(e.target.value)}
                  placeholder={isLocationDetected ? 'Optional: e.g. Road No 36' : 'e.g. Road No 36, Near Police Station'}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 mb-1.5 font-sans">
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
              <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 mb-1.5 font-sans">
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

          {/* Trip Notes */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5 font-sans">
              Trip Notes / Car Details (Optional)
            </label>
            <input
              type="text"
              maxLength={300}
              value={passengerNotes}
              onChange={(e) => setPassengerNotes(e.target.value)}
              placeholder="e.g. Fortuner automatic car, RGIA Airport drop"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Platform Liability Disclaimer & Customer Guidelines */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5 text-xs text-amber-950">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Platform Liability &amp; Booking Guidelines</span>
            </div>
            
            <div className="p-2.5 bg-amber-100/90 border border-amber-300/80 rounded-xl text-[11px] leading-relaxed text-amber-950 font-medium">
              <strong className="font-bold text-amber-950">Important Platform Disclaimer:</strong> Mana Drivers is purely a technological connecting platform between car owners/customers and independent driver service providers. Mana Drivers is not responsible or liable for any vehicle damage, property loss, accidents, traffic fines, personal injury, or disputes. Customers and drivers contract directly with each other.
            </div>

            <ul className="text-[11px] leading-relaxed text-amber-900 space-y-1 list-disc pl-4">
              <li><strong>Verify Original License:</strong> Always check the driver's original Driving License (LMV) before handing over your car keys.</li>
              <li><strong>Fuel &amp; Tolls:</strong> Customer is responsible for sufficient fuel/charge, FASTag toll fees, and parking charges.</li>
              <li><strong>Zero Alcohol Tolerance:</strong> Drivers follow a strict zero-tolerance policy for alcohol and narcotics.</li>
              <li><strong>Review OTP:</strong> Ask the driver for their permanent 4-digit Review OTP after trip completion to submit verified feedback.</li>
              <li><strong>Direct Payment:</strong> Pay the exact agreed fare directly to driver via Cash or UPI with 0% platform deductions.</li>
            </ul>
          </div>

          {/* Direct Driver Fixed Rate Summary */}
          <div className="p-4 bg-emerald-50/90 rounded-2xl border border-emerald-200 space-y-2">
            <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Transparent Direct Driver Fixed Fare (0% Commission)</span>
            </div>
            <div className="text-xs text-emerald-950 leading-relaxed font-normal">
              {fareBreakdown.ruleNotice}
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-emerald-950 pt-2 border-t border-emerald-200">
              <span>{dutyCategory === 'monthly' ? 'Estimated Monthly Salary' : 'Final Fare (Direct to Driver)'}</span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight font-sans text-emerald-950">
                {dutyCategory === 'monthly' ? fareBreakdown.tier?.salaryRangeText : `₹${fareBreakdown.totalCost.toLocaleString('en-IN')}`}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold text-sm sm:text-base rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg cursor-pointer tracking-tight"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            <span>
              {isSubmitting
                ? 'Processing Booking...'
                : dutyCategory === 'monthly'
                ? `Confirm Booking · ${fareBreakdown.tier?.salaryRangeText}`
                : `Confirm Booking · ₹${fareBreakdown.totalCost.toLocaleString('en-IN')}`}
            </span>
          </button>
        </form>
      </div>

      {/* Cross-Platform Device Location Permission Modal */}
      <LocationPermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onAllow={executeGeolocation}
        onManualSelect={handleManualLocationFallback}
        permissionState={permissionState}
        errorMessage={permissionError}
        onRetry={executeGeolocation}
      />
    </div>
  );
}
