import { useState } from 'react';
import {
  UserPlus,
  Clock,
  CreditCard,
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
    vehicle: 'Manual & Automatic Cars (Sedan, SUV, Hatchback)',
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
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
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
          vehicle: formData.vehicle.trim() || 'Manual & Automatic Cars',
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
          `Welcome to Mana Driver, ${formData.name}! You are registered on the Hyderabad homepage.`
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
      <div className="pb-6 border-b border-neutral-200/80">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500 mb-2">
          CHAUFFEUR PORTAL &amp; DISPATCH
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 font-sans">
          Chauffeur Control Center
        </h1>
        <p className="text-sm text-neutral-600 mt-2 max-w-2xl">
          Join {totalDriversCount || allDrivers.length} verified Hyderabad chauffeurs. Toggle your live Online/Offline duty status, manage your homepage profile, and accept passenger requests.
        </p>
      </div>

      {/* Modern Duty Status Banner (NOVA Style) */}
      <div className="bg-[#121212] text-white rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-neutral-300">
            <Power className="w-3.5 h-3.5 text-emerald-400" />
            <span>Uber-Style Duty Status</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            Control Your Availability
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
            Turn your status <strong>ONLINE</strong> when ready to take trips. When <strong>OFFLINE</strong>, your contact buttons are paused so passengers do not disturb you while resting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleToggleDuty}
            className={`px-6 py-3.5 text-xs font-medium rounded-full transition-all inline-flex items-center gap-2.5 shadow-sm ${
              isCurrentDriverOnline
                ? 'bg-emerald-500 hover:bg-emerald-600 text-black font-semibold'
                : 'bg-white/10 hover:bg-white/20 text-white border border-neutral-700'
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
            className="px-6 py-3.5 bg-white text-neutral-950 hover:bg-neutral-100 rounded-full text-xs font-medium transition-all"
          >
            Register Chauffeur (From ₹49)
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 bg-white rounded-2xl border border-neutral-200/80">
          <p className="text-xs text-neutral-500 font-medium">Freelance Plan</p>
          <p className="text-3xl font-bold text-neutral-950 mt-1 font-sans">₹49</p>
          <p className="text-xs text-neutral-500 mt-1">3 months free homepage listing</p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-neutral-200/80">
          <p className="text-xs text-neutral-500 font-medium">Permanent Plan</p>
          <p className="text-3xl font-bold text-neutral-950 mt-1 font-sans">₹99</p>
          <p className="text-xs text-neutral-500 mt-1">Full-time monthly jobs listing</p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-neutral-200/80">
          <p className="text-xs text-neutral-500 font-medium">Monthly Renewal</p>
          <p className="text-3xl font-bold text-neutral-950 mt-1 font-sans">₹99</p>
          <p className="text-xs text-neutral-500 mt-1">Only after 3 months free</p>
        </div>

        <div className="p-6 bg-neutral-950 text-white rounded-2xl shadow-sm">
          <p className="text-xs text-neutral-400 font-medium">Trip Commission</p>
          <p className="text-3xl font-bold text-white mt-1 font-sans">0%</p>
          <p className="text-xs text-neutral-400 mt-1">Keep 100% of trip pay</p>
        </div>
      </div>

      {/* Pill Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-200/60 rounded-full w-fit max-w-full overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('duty')}
          className={`px-4 py-2 text-xs font-medium rounded-full transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'duty'
              ? 'bg-white text-neutral-950 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-950'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>Duty Status</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`px-4 py-2 text-xs font-medium rounded-full transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'register'
              ? 'bg-white text-neutral-950 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-950'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Join as Driver (₹49 / ₹99)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('listing')}
          className={`px-4 py-2 text-xs font-medium rounded-full transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'listing'
              ? 'bg-white text-neutral-950 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-950'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Listing &amp; Plan (₹99/mo)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-2 text-xs font-medium rounded-full transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'inquiries'
              ? 'bg-white text-neutral-950 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-950'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Trip Requests ({bookings.length})</span>
        </button>
      </div>

      {/* TAB 1: DUTY STATUS */}
      {activeTab === 'duty' && (
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-xl font-bold text-neutral-950 font-sans">
                Live Online / Offline Switch
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Select your chauffeur profile and toggle status in real time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-medium">Chauffeur:</span>
              <select
                value={activeDutyDriver.id}
                onChange={(e) => setSelectedDriverIdForDuty(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs font-medium text-neutral-900 focus:outline-none focus:border-neutral-900"
              >
                {allDrivers.slice(0, 10).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.driverType === 'permanent' ? 'Permanent' : 'Freelance'} - {d.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className={`p-6 sm:p-8 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
              isCurrentDriverOnline
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <img
                src={activeDutyDriver.photo || SAMPLE_INDIAN_PHOTOS[0].url}
                alt={activeDutyDriver.name}
                className="w-16 h-16 rounded-xl object-cover border border-neutral-200"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-neutral-950 font-sans">
                    {activeDutyDriver.name}
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-neutral-200 text-neutral-800 font-medium">
                    {activeDutyDriver.driverType === 'permanent' ? 'Permanent' : 'Freelance'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">{activeDutyDriver.location}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCurrentDriverOnline ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
                    }`}
                  />
                  <span className="text-xs font-medium text-neutral-800">
                    {isCurrentDriverOnline ? 'Available for calls' : 'Currently off-duty'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleDuty}
              className={`px-8 py-3.5 text-xs font-medium rounded-full transition-all shrink-0 ${
                isCurrentDriverOnline
                  ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isCurrentDriverOnline ? 'Switch to Offline (Resting)' : 'Go Online (Accept Rides)'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTER DRIVER */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-10 space-y-6 max-w-3xl">
          <div className="pb-4 border-b border-neutral-100">
            <h3 className="text-xl font-bold text-neutral-950 font-sans">
              Register as a Verified Chauffeur
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Select your chauffeur category. Your profile is active for 3 months free on the homepage.
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            {/* Split Category Options */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-2">
                Chauffeur Category *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    formData.driverType === 'freelance'
                      ? 'border-neutral-950 bg-neutral-50/80 shadow-xs'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="driverType"
                    value="freelance"
                    checked={formData.driverType === 'freelance'}
                    onChange={() => setFormData({ ...formData, driverType: 'freelance' })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-bold text-sm text-neutral-950">Freelance Driver</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Hourly rides &amp; airport drops</p>
                    <p className="text-xs font-semibold text-neutral-900 mt-2">
                      ₹49 fee · 3 months free
                    </p>
                  </div>
                </label>

                <label
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    formData.driverType === 'permanent'
                      ? 'border-neutral-950 bg-neutral-50/80 shadow-xs'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="driverType"
                    value="permanent"
                    checked={formData.driverType === 'permanent'}
                    onChange={() => setFormData({ ...formData, driverType: 'permanent' })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-bold text-sm text-neutral-950">Permanent Chauffeur</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Full-time monthly family support</p>
                    <p className="text-xs font-semibold text-neutral-900 mt-2">
                      ₹99 fee · 3 months free
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Rate & Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.driverType === 'freelance' ? (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Hourly Rate (₹/hr)
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Monthly Salary Expectation (₹/month)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlySalary}
                    onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Primary Location in Hyderabad
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
                >
                  {HYDERABAD_LOCALITIES.filter((l) => l !== 'All').map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Photo Selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-2">
                Choose Profile Photo
              </label>
              <div className="grid grid-cols-5 gap-2.5">
                {SAMPLE_INDIAN_PHOTOS.map((p) => (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => setFormData({ ...formData, photo: p.url })}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                      formData.photo === p.url
                        ? 'border-neutral-950 ring-2 ring-neutral-950/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-[#111111] hover:bg-neutral-800 text-white rounded-full text-sm font-medium transition-all shadow-xs"
            >
              {isSubmitting
                ? 'Processing Razorpay...'
                : `Pay ₹${currentRegistrationFee} & Activate 3-Month Listing`}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: LISTING & PLAN */}
      {activeTab === 'listing' && (
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-10 space-y-6 max-w-3xl">
          <div className="pb-4 border-b border-neutral-100">
            <h3 className="text-xl font-bold text-neutral-950 font-sans">
              Homepage Listing Management
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Keep your profile active on the Mana Driver homepage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 font-medium">Current Status</p>
                <p className="text-base font-bold text-neutral-950 font-sans mt-0.5">
                  Active (First 3 Months Free Included)
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                Verified Chauffeur
              </span>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              After 3 free months, renewal is only ₹99/month. Zero percentage commission is ever deducted from customer trips.
            </p>

            <button
              type="button"
              disabled={isRenewing}
              onClick={() => handleRenewListing(activeDutyDriver.name)}
              className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-full transition-colors"
            >
              {isRenewing ? 'Opening Razorpay...' : 'Renew Listing (₹99/month)'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: TRIP REQUESTS */}
      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-10 space-y-6">
          <div className="pb-4 border-b border-neutral-100">
            <h3 className="text-xl font-bold text-neutral-950 font-sans">
              Customer Trip Requests ({bookings.length})
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Direct booking inquiries from Hyderabad vehicle owners.
            </p>
          </div>

          {bookings.length === 0 ? (
            <p className="text-sm text-neutral-500 py-8 text-center">No active booking inquiries.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-neutral-400">{b.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-neutral-200 text-neutral-800">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-neutral-950">{b.driverName}</p>
                    <p className="text-xs text-neutral-500">
                      {b.date} at {b.time} · {b.pickupAddress}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-neutral-950 font-sans">₹{b.totalCost}</span>
                    {b.status === 'Confirmed' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onAcceptBooking(b.id)}
                          className="px-4 py-2 bg-neutral-900 text-white rounded-full text-xs font-medium hover:bg-neutral-800 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeclineBooking(b.id)}
                          className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-full text-xs font-medium hover:bg-neutral-300 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
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
