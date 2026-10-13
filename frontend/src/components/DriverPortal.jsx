import { useState } from 'react';
import {
  UserPlus,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  CreditCard,
  RefreshCw,
  Check,
  Power,
} from 'lucide-react';
import { toast } from 'sonner';
import { HYDERABAD_LOCALITIES } from '../data/mockDrivers';
import {
  triggerDriverRegistrationRazorpay,
  triggerDriverSubscriptionRazorpay,
} from '../utils/razorpay';

const SAMPLE_INDIAN_PHOTOS = [
  { label: 'Chauffeur in Shirt', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80' },
  { label: 'Executive Driver', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { label: 'Senior Driver', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { label: 'Female Driver', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
  { label: 'Highway Specialist', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' },
];

export default function DriverPortal({
  bookings = [],
  onAcceptBooking,
  onDeclineBooking,
  onRegisterDriver,
  totalDriversCount = 0,
  customDrivers = [],
  allDrivers = [],
  onToggleDriverStatus,
}) {
  const [activeTab, setActiveTab] = useState('duty'); // 'duty' | 'register' | 'listing' | 'inquiries'

  // Duty status control for registered drivers or active driver
  const [selectedDriverIdForDuty, setSelectedDriverIdForDuty] = useState(() => {
    if (customDrivers.length > 0) return customDrivers[0].id;
    if (allDrivers.length > 0) return allDrivers[0].id;
    return 'drv-01';
  });

  // Driver sign-up form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    driverType: 'freelance', // 'freelance' (₹49) or 'permanent' (₹99)
    vehicle: '',
    hourlyRate: 180,
    monthlySalary: 20000,
    location: 'Hitec City & Cyberabad, Hyderabad',
    experience: 6,
    languages: 'Telugu, Hindi, English',
    photo: SAMPLE_INDIAN_PHOTOS[0].url,
    bio: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);

  // Active driver for duty toggle
  const activeDutyDriver = allDrivers.find((d) => d.id === selectedDriverIdForDuty) || allDrivers[0] || {
    id: 'drv-01',
    name: 'Ramesh Kumar',
    status: 'Available',
    driverType: 'freelance',
  };

  const isCurrentDriverOnline = activeDutyDriver?.status === 'Available';

  // Toggle duty state
  const handleToggleDuty = () => {
    const nextStatus = isCurrentDriverOnline ? 'Offline' : 'Available';
    if (typeof onToggleDriverStatus === 'function') {
      onToggleDriverStatus(activeDutyDriver.id, nextStatus);
    }
  };

  // Split Razorpay registration: ₹49 (Freelance) vs ₹99 (Permanent)
  const currentRegistrationFee = formData.driverType === 'permanent' ? 99 : 49;

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.vehicle.trim()) {
      toast.error('Please enter your full name and cars you can drive');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your active mobile number');
      return;
    }

    setIsSubmitting(true);

    triggerDriverRegistrationRazorpay({
      driverName: formData.name.trim(),
      driverType: formData.driverType,
      fee: currentRegistrationFee,
      onPaymentSuccess: () => {
        const isPermanent = formData.driverType === 'permanent';
        const newDriver = {
          id: `drv-hyd-${Date.now()}`,
          name: formData.name.trim(),
          driverType: formData.driverType,
          vehicle: formData.vehicle.trim(),
          rating: 5.0,
          trips: 0,
          hourlyRate: isPermanent ? null : Number(formData.hourlyRate) || 180,
          monthlySalary: isPermanent ? Number(formData.monthlySalary) || 20000 : null,
          location: formData.location.trim(),
          status: 'Available',
          languages: formData.languages.trim() || 'Telugu, Hindi',
          experience: Number(formData.experience) || 5,
          phone: formData.phone.trim(),
          photo: formData.photo || SAMPLE_INDIAN_PHOTOS[0].url,
          bio:
            formData.bio.trim() ||
            (isPermanent
              ? 'Experienced permanent family & executive chauffeur seeking full-time monthly role in Hyderabad.'
              : 'Verified freelance private driver available for hourly rides and airport transfers.'),
          listingPlan: `First 3 Months Free (₹${currentRegistrationFee} Paid)`,
          listingStatus: isPermanent ? 'Verified Monthly Chauffeur' : 'Verified Driver',
          registeredDate: new Date().toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        };

        onRegisterDriver(newDriver);
        setIsSubmitting(false);

        toast.success(
          `Welcome to Mana Driver, ${formData.name}! You are registered as a ${
            isPermanent ? 'Permanent' : 'Freelance'
          } Driver on the homepage.`
        );

        setSelectedDriverIdForDuty(newDriver.id);
        setActiveTab('duty');
      },
    });

    setTimeout(() => {
      setIsSubmitting(false);
    }, 1500);
  };

  // Direct Razorpay renewal flow: ₹99/month
  const handleRenewListing = (driverName) => {
    setIsRenewing(true);
    triggerDriverSubscriptionRazorpay({
      driverName: driverName || 'Hyderabad Driver',
      onPaymentSuccess: () => {
        setIsRenewing(false);
        toast.success('Homepage listing active for another 30 days! (₹99/mo)');
      },
    });
    setTimeout(() => {
      setIsRenewing(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Portal Header */}
      <div className="border-b border-neutral-200 pb-5">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] font-black mb-1">
          [ DRIVER PORTAL & DISPATCH CONTROL ]
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
          Mana Driver Portal
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Join {totalDriversCount || allDrivers.length} active Hyderabad drivers. Manage your live online/offline duty status, register as Freelance (₹49) or Permanent (₹99), and manage your homepage listing.
        </p>
      </div>

      {/* =========================================================================
          UBER-STYLE DUTY TOGGLE HIGHLIGHT BANNER
         ========================================================================= */}
      <div className="bg-[#0A0A0A] text-white p-6 sm:p-7 border-l-4 border-[#FF5500] shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#FF5500]/20 border border-[#FF5500]/40 text-[#FF5500] text-[10px] font-black uppercase tracking-widest">
            <Power className="w-3 h-3 text-[#FF5500]" />
            <span>Uber-Style Live Status</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
            Control Your Availability: Online or Offline
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
            Turn your status <strong>ONLINE</strong> when ready to drive so customers can call or WhatsApp you directly. Switch to <strong>OFFLINE</strong> when resting so calls are paused and you are not disturbed.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('duty')}
            className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center gap-2 ${
              isCurrentDriverOnline
                ? 'bg-emerald-500 hover:bg-emerald-600 text-black'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCurrentDriverOnline ? 'bg-black animate-pulse' : 'bg-neutral-400'
              }`}
            />
            <span>{isCurrentDriverOnline ? 'You Are ONLINE' : 'You Are OFFLINE'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className="px-4 py-3 bg-[#FF5500] hover:bg-[#E04B00] text-black font-black text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
          >
            <span>Register Driver (From ₹49)</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-neutral-200">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
            FREELANCE FEE
          </p>
          <p className="text-3xl font-black text-neutral-950 mt-1 font-mono">
            ₹49
          </p>
          <p className="text-[10px] text-neutral-500 mt-1 font-medium">Hourly rides · 3 mos free</p>
        </div>

        <div className="p-5 bg-white border border-neutral-200">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
            PERMANENT FEE
          </p>
          <p className="text-3xl font-black text-neutral-950 mt-1 font-mono">
            ₹99
          </p>
          <p className="text-[10px] text-neutral-500 mt-1 font-medium">Monthly jobs · 3 mos free</p>
        </div>

        <div className="p-5 bg-white border border-neutral-200">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
            AFTER 3 MONTHS
          </p>
          <p className="text-3xl font-black text-emerald-600 mt-1 font-mono">
            ₹99/mo
          </p>
          <p className="text-[10px] text-neutral-500 mt-1 font-medium">Homepage subscription</p>
        </div>

        <div className="p-5 bg-[#FF5500] text-black border border-black">
          <p className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-black">
            YOUR COMMISSIONS
          </p>
          <p className="text-3xl font-black text-black mt-1 font-mono">
            0% CUT
          </p>
          <p className="text-[10px] text-black/80 mt-1 font-black">Keep 100% trip earnings</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-4">
        <button
          onClick={() => setActiveTab('duty')}
          className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'duty'
              ? 'bg-neutral-950 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950'
          }`}
        >
          <Power className="w-3.5 h-3.5 text-[#FF5500]" />
          <span>Duty Status (Online / Offline)</span>
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'register'
              ? 'bg-neutral-950 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5 text-[#FF5500]" />
          <span>Join as Driver (₹49 / ₹99)</span>
        </button>

        <button
          onClick={() => setActiveTab('listing')}
          className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'listing'
              ? 'bg-neutral-950 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-[#FF5500]" />
          <span>Listing Plan & Renewal (₹99/mo)</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'inquiries'
              ? 'bg-neutral-950 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#FF5500]" />
          <span>Customer Requests ({bookings.length})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: LIVE UBER-STYLE DUTY TOGGLE (ONLINE / OFFLINE)
         ========================================================================= */}
      {activeTab === 'duty' && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#FF5500] font-black">
                  [ DRIVER DISPATCH CONSOLE ]
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-950 mt-1">
                  Live Online / Offline Duty Switch
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Toggle your live duty status like Uber. When you are offline, calls and WhatsApp on your card are paused.
                </p>
              </div>

              {/* Selector to test with any driver */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-500 uppercase">Profile:</span>
                <select
                  value={activeDutyDriver.id}
                  onChange={(e) => setSelectedDriverIdForDuty(e.target.value)}
                  className="bg-neutral-50 border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#FF5500]"
                >
                  {allDrivers.slice(0, 10).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.driverType === 'permanent' ? 'Permanent' : 'Freelance'} - {d.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Big Interactive Duty Control Card */}
            <div
              className={`p-6 sm:p-8 border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                isCurrentDriverOnline
                  ? 'bg-emerald-50/70 border-emerald-500'
                  : 'bg-neutral-100 border-neutral-300'
              }`}
            >
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="relative shrink-0 w-20 h-20 bg-neutral-900 overflow-hidden border border-neutral-300">
                  <img
                    src={activeDutyDriver.photo || SAMPLE_INDIAN_PHOTOS[0].url}
                    alt={activeDutyDriver.name}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      isCurrentDriverOnline ? 'bg-emerald-500 animate-ping' : 'bg-neutral-400'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-black uppercase tracking-tight text-neutral-950">
                      {activeDutyDriver.name}
                    </h4>
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-black text-[#FF5500]">
                      {activeDutyDriver.driverType === 'permanent' ? 'Permanent' : 'Freelance'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    {activeDutyDriver.vehicle} · {activeDutyDriver.location}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider ${
                        isCurrentDriverOnline
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-300 text-neutral-800'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCurrentDriverOnline ? 'bg-white animate-pulse' : 'bg-neutral-600'
                        }`}
                      />
                      <span>{isCurrentDriverOnline ? 'Status: ONLINE & AVAILABLE' : 'Status: OFFLINE / OFF-DUTY'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Big 1-Click Toggle Button */}
              <button
                type="button"
                onClick={handleToggleDuty}
                className={`px-8 py-5 text-sm sm:text-base font-black uppercase tracking-wider flex items-center justify-center gap-3 transition-all shrink-0 shadow-md ${
                  isCurrentDriverOnline
                    ? 'bg-neutral-950 hover:bg-neutral-900 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-black'
                }`}
              >
                <Power className="w-5 h-5 stroke-[2.5]" />
                <span>
                  {isCurrentDriverOnline ? 'GO OFFLINE (OFF-DUTY)' : 'GO ONLINE (AVAILABLE)'}
                </span>
              </button>
            </div>

            {/* Explanation of Status behavior */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 space-y-1">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-950">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>When ONLINE (Available)</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Your profile displays a glowing green dot on the homepage. Customers can click <strong>Call</strong> or <strong>WhatsApp</strong> to book your services immediately.
                </p>
              </div>

              <div className="p-4 bg-neutral-100 border border-neutral-300 space-y-1">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                  <span>When OFFLINE (Off-Duty)</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  Your card is marked as "Currently Offline". Direct phone and WhatsApp buttons are paused with an off-duty badge so nobody calls you while resting or sleeping.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: DRIVER SIGN UP FORM (₹49 FREELANCE VS ₹99 PERMANENT)
         ========================================================================= */}
      {activeTab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sign Up Form */}
          <div className="lg:col-span-7 bg-white border border-neutral-200 p-6 sm:p-8">
            <div className="mb-6 pb-4 border-b border-neutral-200">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#FF5500] font-black">
                [ REGISTER ON MANA DRIVER ]
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-950 mt-1">
                Join Hyderabad Driver Roster
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Register as Freelance (₹49) or Permanent (₹99). First 3 months free homepage listing.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* DRIVER TYPE SELECTION: FREELANCE VS PERMANENT */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-2">
                  Select Your Driver Category *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, driverType: 'freelance' })
                    }
                    className={`p-4 border-2 text-left transition-all ${
                      formData.driverType === 'freelance'
                        ? 'border-[#FF5500] bg-orange-50/40 text-neutral-950'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm uppercase">
                        Freelance Driver
                      </span>
                      <span className="font-mono font-black text-xs px-2 py-0.5 bg-[#FF5500] text-black">
                        ₹49 FEE
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">
                      Hourly / on-demand driving, airport trips, and flexible daily rides.
                    </p>
                    <div className="text-[10px] font-mono text-emerald-700 font-bold mt-2">
                      First 3 Months Free · Then ₹99/mo
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, driverType: 'permanent' })
                    }
                    className={`p-4 border-2 text-left transition-all ${
                      formData.driverType === 'permanent'
                        ? 'border-[#FF5500] bg-orange-50/40 text-neutral-950'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm uppercase">
                        Permanent Driver
                      </span>
                      <span className="font-mono font-black text-xs px-2 py-0.5 bg-neutral-950 text-white">
                        ₹99 FEE
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">
                      Full-time monthly chauffeur for family, executive, and corporate cars.
                    </p>
                    <div className="text-[10px] font-mono text-emerald-700 font-bold mt-2">
                      First 3 Months Free · Then ₹99/mo
                    </div>
                  </button>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Active Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98490 12345"
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                  />
                </div>
              </div>

              {/* Cars You Can Drive / Experience */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Cars You Can Drive / Experience *
                </label>
                <input
                  type="text"
                  required
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  placeholder="e.g. Manual & Automatic cars: Swift, Innova, Fortuner, Honda City"
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Drivers can drive any personal vehicle (Hatchbacks, Sedans, SUVs, or Luxury).
                </span>
              </div>

              {/* Dynamic Rate based on type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formData.driverType === 'freelance' ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Your Hourly Rate (₹)
                    </label>
                    <input
                      type="number"
                      min="140"
                      max="400"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                      placeholder="180"
                      className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      Realistic: ₹140 (Small), ₹180-₹220 (Sedan), ₹250-₹300 (SUV)
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Expected Monthly Salary (₹)
                    </label>
                    <input
                      type="number"
                      min="15000"
                      max="35000"
                      step="500"
                      value={formData.monthlySalary}
                      onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                      placeholder="20000"
                      className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      Realistic: ₹18,000–₹22,000 (Standard) · ₹22,000–₹26,000 (Luxury)
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Years of Driving Experience
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="35"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                  />
                </div>
              </div>

              {/* Languages & Base Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Languages Spoken
                  </label>
                  <input
                    type="text"
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    placeholder="e.g. Telugu, Hindi, English"
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Hyderabad Base Area
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                  >
                    {HYDERABAD_LOCALITIES.map((loc) => (
                      <option key={loc} value={`${loc}, Hyderabad`}>
                        {loc}, Hyderabad
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo Selection (Curated Real Indian Chauffeur Photos) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Profile Photo (Real Indian Chauffeur)
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {SAMPLE_INDIAN_PHOTOS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, photo: p.url })}
                      className={`relative shrink-0 w-12 h-12 border-2 transition-all ${
                        formData.photo === p.url
                          ? 'border-[#FF5500] scale-105 shadow-sm'
                          : 'border-neutral-200 opacity-70 hover:opacity-100'
                      }`}
                      title={p.label}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Bio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Short Profile Bio
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="e.g. 7 years experience in Hyderabad city traffic, manual and automatic cars, non-smoker, clean license."
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              {/* Fee Breakdown Summary */}
              <div className="bg-neutral-50 border border-neutral-200 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-800">
                    Registration Fee ({formData.driverType === 'permanent' ? 'Permanent' : 'Freelance'}):
                  </span>
                  <span className="font-black text-neutral-950 font-mono text-base text-[#FF5500]">
                    ₹{currentRegistrationFee}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
                  <span>First 3 Months Homepage Listing:</span>
                  <span className="font-mono uppercase">FREE (₹0)</span>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-500 pt-1 border-t border-neutral-200">
                  <span>From Month 4 Renewal:</span>
                  <span className="font-mono">₹99 / month</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-[#FF5500] hover:bg-[#E04B00] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>
                  {isSubmitting
                    ? 'Opening Razorpay...'
                    : `Pay ₹${currentRegistrationFee} & List as ${
                        formData.driverType === 'permanent' ? 'Permanent' : 'Freelance'
                      } Driver`}
                </span>
              </button>
            </form>
          </div>

          {/* Model Explanation Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-neutral-200 p-6 space-y-4">
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#FF5500] font-black">
                [ REGISTRATION MODEL ]
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-neutral-950">
                How Listing on Mana Driver Works
              </h3>

              <div className="space-y-4 pt-1">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-neutral-950 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight text-neutral-950">
                      ₹49 (Freelance) or ₹99 (Permanent)
                    </h4>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                      Pay once on Razorpay according to your desired job type. Your phone number is verified and your profile goes live.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#FF5500] text-black flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight text-neutral-950">
                      First 3 Months 100% Free
                    </h4>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                      Your profile stays featured on the Mana Driver homepage for 90 days. Customers call you directly with 0% middleman cut.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-neutral-950 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight text-neutral-950">
                      After 3 Months: ₹99/Month
                    </h4>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                      Starting in month 4, maintain active homepage visibility for just ₹99/month. Cancel or pause anytime.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Direct Customer Cash or UPI</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Passengers pay your hourly or monthly rate directly to you. Mana Driver takes ₹0 commission on rides.
                </p>
              </div>
            </div>

            {/* Custom registered drivers */}
            {customDrivers.length > 0 && (
              <div className="bg-white border border-neutral-200 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-black uppercase">
                  <span>Your Registered Profiles ({customDrivers.length})</span>
                  <span className="text-emerald-600">Active</span>
                </div>
                <div className="space-y-2">
                  {customDrivers.map((drv) => (
                    <div key={drv.id} className="p-3 bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-black text-neutral-950 flex items-center gap-1.5">
                          <span>{drv.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-black text-[#FF5500] uppercase font-mono">
                            {drv.driverType === 'permanent' ? 'Permanent' : 'Freelance'}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500">{drv.vehicle} · {drv.location}</div>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 uppercase">
                        3 Mos Free
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: LISTING PLAN & RENEWAL (₹99/MO)
         ========================================================================= */}
      {activeTab === 'listing' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-neutral-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#FF5500] font-black">
                  [ ACTIVE SUBSCRIPTION STATUS ]
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-950 mt-1">
                  Homepage Listing Management
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Keep your driver profile active and displayed on the Mana Driver homepage.
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Homepage Status: Active</span>
                </span>
              </div>
            </div>

            {/* Plan Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                  REGISTRATION ENTRY
                </div>
                <div className="text-base font-black text-neutral-950">₹49 (Freelance) / ₹99 (Permanent)</div>
                <p className="text-xs text-neutral-600">One-time registration fee authenticated on Razorpay.</p>
              </div>

              <div className="p-4 bg-emerald-50/50 border border-emerald-200 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold">
                  SPECIAL OFFER PERIOD
                </div>
                <div className="text-base font-black text-emerald-950">First 3 Months Free</div>
                <p className="text-xs text-emerald-700">90 days of complimentary homepage listing.</p>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                  AFTER 3 MONTHS
                </div>
                <div className="text-base font-black text-neutral-950">₹99 / Month</div>
                <p className="text-xs text-neutral-600">Monthly renewal to maintain active homepage visibility.</p>
              </div>
            </div>

            {/* Renewal Action */}
            <div className="p-6 bg-neutral-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
              <div>
                <h4 className="text-base font-black uppercase tracking-tight text-white">
                  Renew or Extend Homepage Listing for ₹99
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Keep your driver profile, contact number, and booking button live for 30 days.
                </p>
              </div>
              <button
                type="button"
                disabled={isRenewing}
                onClick={() => handleRenewListing('Driver')}
                className="px-5 py-3 bg-[#FF5500] hover:bg-[#E04B00] text-black font-black text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 shrink-0 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-black ${isRenewing ? 'animate-spin' : ''}`} />
                <span>{isRenewing ? 'Opening Razorpay...' : 'Pay ₹99 on Razorpay'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PASSENGER INQUIRIES & DISPATCH
         ========================================================================= */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h3 className="text-lg font-black uppercase tracking-tight text-neutral-950">
              Customer Bookings & Ride Requests ({bookings.length})
            </h3>
            <span className="text-xs text-neutral-500 font-mono">
              Direct bookings from Hyderabad car owners
            </span>
          </div>

          {bookings.length === 0 ? (
            <div className="p-10 text-center bg-white border border-neutral-200 text-neutral-500 text-xs">
              No booking inquiries yet. Keep your status Online to receive incoming ride requests.
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-5 bg-white border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-400">
                        #{booking.id}
                      </span>
                      <span className="font-black text-neutral-950 text-sm">
                        {booking.driverName}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 font-bold uppercase ${
                          booking.status === 'Accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : booking.status === 'Declined'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600">
                      <strong>Pickup:</strong> {booking.pickupAddress}
                    </p>
                    <p className="text-xs text-neutral-500">
                      <strong>Schedule:</strong> {booking.date} at {booking.time} · {booking.hours} Hours
                    </p>
                    {booking.passengerNotes && (
                      <p className="text-[11px] text-neutral-500 italic">
                        "{booking.passengerNotes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {booking.status !== 'Accepted' && (
                      <button
                        type="button"
                        onClick={() => onAcceptBooking(booking.id)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                      >
                        Accept
                      </button>
                    )}
                    {booking.status !== 'Declined' && (
                      <button
                        type="button"
                        onClick={() => onDeclineBooking(booking.id)}
                        className="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs uppercase tracking-wider transition-colors"
                      >
                        Decline
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
