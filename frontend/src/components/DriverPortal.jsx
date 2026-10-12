import { useState } from 'react';
import {
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CreditCard,
  RefreshCw,
  Car,
  Phone,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { HYDERABAD_LOCALITIES } from '../data/mockDrivers';
import {
  triggerDriverRegistrationRazorpay,
  triggerDriverSubscriptionRazorpay,
} from '../utils/razorpay';

export default function DriverPortal({
  bookings,
  onAcceptBooking,
  onDeclineBooking,
  onRegisterDriver,
  totalDriversCount,
  customDrivers = [],
}) {
  const [activeTab, setActiveTab] = useState('register');

  // Driver sign-up form
  const [formData, setFormData] = useState({
    name: '',
    vehicle: '',
    category: 'Sedan',
    hourlyRate: 200,
    location: 'Hitec City, Hyderabad',
    experience: 5,
    phone: '',
    avatarType: 'suit',
    bio: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);

  // Direct Razorpay registration flow: ₹49 one-time with 3 months free
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.vehicle.trim()) {
      toast.error('Please enter your full name and vehicle model');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your active mobile number');
      return;
    }

    setIsSubmitting(true);

    triggerDriverRegistrationRazorpay({
      driverName: formData.name.trim(),
      onPaymentSuccess: () => {
        const newDriver = {
          id: `drv-hyd-${Date.now()}`,
          name: formData.name.trim(),
          vehicle: formData.vehicle.trim(),
          category: formData.category,
          rating: 5.0,
          trips: 0,
          hourlyRate: Number(formData.hourlyRate) || 200,
          location: `${formData.location.trim()}`,
          status: 'Available',
          isPro: false,
          experience: Number(formData.experience) || 3,
          phone: formData.phone.trim(),
          avatarType: formData.avatarType || 'suit',
          bio:
            formData.bio.trim() ||
            'Verified professional private driver operating across Hyderabad & Telangana.',
          listingPlan: 'First 3 Months Free (Renews at ₹99/mo)',
          listingStatus: 'Active on Homepage',
          registeredDate: new Date().toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        };

        onRegisterDriver(newDriver);
        setIsSubmitting(false);

        toast.success(
          `Welcome to Maa Driver, ${formData.name}! Your profile is live on the homepage for bookings.`
        );

        setFormData({
          name: '',
          vehicle: '',
          category: 'Sedan',
          hourlyRate: 200,
          location: 'Hitec City, Hyderabad',
          experience: 5,
          phone: '',
          avatarType: 'suit',
          bio: '',
        });

        setActiveTab('listing');
      },
    });

    // Reset submitting after timeout if user dismissed popup
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
          [ DRIVER OPERATIONS & DISPATCH ]
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
          Hyderabad Driver Portal
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Register your driver profile, join {totalDriversCount} active Hyderabad drivers, and accept passenger ride requests.
        </p>
      </div>

      {/* =========================================================================
          UNIFIED DRIVER LISTING MODEL BANNER
          One-time ₹49 Registration · First 3 Months Free · Then ₹99/Month
         ========================================================================= */}
      <div className="bg-[#0A0A0A] text-white p-6 sm:p-7 border-l-4 border-[#FF5500] shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#FF5500]/20 border border-[#FF5500]/40 text-[#FF5500] text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-[#FF5500]" />
            <span>Driver Listing Model</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
            Join Maa Driver for ₹49 · First 3 Months Free · Then ₹99/Month
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
            Pay a single one-time registration of ₹49. Your name, photo, and direct phone number appear immediately on the Maa Driver Hyderabad homepage for customer bookings. Enjoy 3 full months 100% free, then just ₹99/month to keep receiving direct calls. 0% trip commission.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className="px-5 py-3 bg-[#FF5500] hover:bg-[#E04B00] text-black font-black text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
          >
            <span>Register for ₹49</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('listing')}
            className="px-4 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            <span>View Listing Plan</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-neutral-200">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
            REGISTRATION FEE
          </p>
          <p className="text-3xl font-black text-neutral-950 mt-1 font-mono">
            ₹49
          </p>
          <p className="text-[10px] text-neutral-500 mt-1 font-medium">One-time entry</p>
        </div>
        <div className="p-5 bg-white border border-neutral-200">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
            FIRST 3 MONTHS
          </p>
          <p className="text-3xl font-black text-emerald-600 mt-1 font-mono">
            FREE
          </p>
          <p className="text-[10px] text-neutral-500 mt-1 font-medium">Displayed on homepage</p>
        </div>
        <div className="p-5 bg-white border border-neutral-200">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
            MONTH 4 ONWARDS
          </p>
          <p className="text-3xl font-black text-neutral-950 mt-1 font-mono">
            ₹99/mo
          </p>
          <p className="text-[10px] text-neutral-500 mt-1 font-medium">To stay active</p>
        </div>
        <div className="p-5 bg-[#FF5500] text-black border border-black">
          <p className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-black">
            YOUR COMMISSIONS
          </p>
          <p className="text-3xl font-black text-black mt-1 font-mono">
            0% CUT
          </p>
          <p className="text-[10px] text-black/80 mt-1 font-black">Keep 100% earnings</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-4">
        <button
          onClick={() => setActiveTab('register')}
          className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'register'
              ? 'bg-neutral-950 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5 text-[#FF5500]" />
          <span>Join as Driver (₹49)</span>
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
          TAB 1: DRIVER SIGN UP FORM WITH DIRECT RAZORPAY ₹49 CHECKOUT
         ========================================================================= */}
      {activeTab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sign Up Form */}
          <div className="lg:col-span-7 bg-white border border-neutral-200 p-6 sm:p-8">
            <div className="mb-6 pb-4 border-b border-neutral-200">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#FF5500] font-black">
                [ STEP 1 OF 1 ]
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-950 mt-1">
                Driver Registration in Hyderabad
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Pay ₹49 once on Razorpay to display your name and mobile number on the GoDrive homepage immediately.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Primary Car Experience *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    placeholder="e.g. Maruti Dzire / Honda City"
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Car Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                  >
                    <option value="Sedan">Sedan (Dzire, City, Verna)</option>
                    <option value="SUV">SUV (Innova, Creta, XUV)</option>
                    <option value="Small Car">Small Car (Swift, i20, Baleno)</option>
                    <option value="Luxury">Luxury Chauffeur (BMW, Audi, Mercedes)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Your Hourly Rate (₹)
                  </label>
                  <input
                    type="number"
                    min="120"
                    max="600"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Short Profile Bio
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="e.g. 7 years experience. Safe driving in city traffic and RGIA airport routes. Manual and automatic cars."
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              {/* Pricing Breakdown Card Inside Form */}
              <div className="bg-neutral-50 border border-neutral-200 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-800">One-Time Registration Fee:</span>
                  <span className="font-black text-neutral-950 font-mono text-sm">₹49</span>
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
                  {isSubmitting ? 'Opening Razorpay...' : 'Pay ₹49 & List on Homepage (First 3 Months Free)'}
                </span>
              </button>
            </form>
          </div>

          {/* Model Clarification & Value Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-neutral-200 p-6 space-y-4">
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#FF5500] font-black">
                [ TRANSPARENT MODEL ]
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-neutral-950">
                How Driver Listing Works
              </h3>

              <div className="space-y-4 pt-1">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-neutral-950 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight text-neutral-950">
                      ₹49 One-Time Registration
                    </h4>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                      Pay just ₹49 once on Razorpay. We authenticate your phone and add your profile immediately.
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
                      Your name and direct contact are displayed on the Maa Driver homepage roster. Customers call or book you directly with 0% platform deductions.
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
                      To keep your name active and receiving calls on the homepage, pay a simple ₹99 per month subscription. Cancel anytime.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>No Middlemen · Direct Customer Cash/UPI</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Passengers pay your hourly fee directly to you upon trip completion. Maa Driver never takes a cut from your trips.
                </p>
              </div>
            </div>

            {/* Recently registered driver preview */}
            {customDrivers.length > 0 && (
              <div className="bg-white border border-neutral-200 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-black uppercase">
                  <span>Your Live Listing</span>
                  <span className="text-emerald-600">Active</span>
                </div>
                <div className="space-y-2">
                  {customDrivers.slice(0, 3).map((drv) => (
                    <div key={drv.id} className="p-3 bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-black text-neutral-950">{drv.name}</div>
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
          TAB 2: LISTING PLAN & RENEWAL (₹99/MO)
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
                  Keep your driver profile active and displayed on the Maa Driver homepage.
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
                  REGISTRATION STATUS
                </div>
                <div className="text-base font-black text-neutral-950">₹49 Paid</div>
                <p className="text-xs text-neutral-600">One-time registration authenticated.</p>
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
                <p className="text-xs text-neutral-600">To maintain active homepage visibility.</p>
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

          {/* List of Registered Profiles */}
          <div className="bg-white border border-neutral-200 p-6 space-y-4">
            <h4 className="text-base font-black uppercase tracking-tight text-neutral-950">
              Your Registered Homepage Profiles ({customDrivers.length})
            </h4>

            {customDrivers.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-50 border border-neutral-200">
                No custom registered profiles yet. Use the "Join as Driver" tab to register for ₹49.
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {customDrivers.map((driver) => (
                  <div key={driver.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-950 text-white font-black flex items-center justify-center text-xs uppercase">
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-neutral-950 text-sm">{driver.name}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold uppercase">
                            First 3 Months Free
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500 flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Car className="w-3 h-3 text-[#FF5500]" />
                            {driver.vehicle}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {driver.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-neutral-700">₹{driver.hourlyRate}/hr</span>
                      <button
                        type="button"
                        onClick={() => handleRenewListing(driver.name)}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-[#FF5500] hover:text-black text-white text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        Renew ₹99
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CUSTOMER REQUESTS
         ========================================================================= */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-tight text-neutral-950">
              Live Booking Inquiries
            </h2>
            <span className="text-xs text-neutral-500 font-mono">TELANGANA DISPATCH FEED</span>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center bg-white border border-neutral-200 space-y-2">
              <Calendar className="w-10 h-10 text-neutral-300 mx-auto" />
              <h3 className="text-base font-black uppercase tracking-tight text-neutral-950">
                No Booking Requests Right Now
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                When customers book a driver across Hyderabad, requests appear here so you can accept them.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-5 bg-white border border-neutral-200 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-[#FF5500]">{booking.id}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider ${
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
                      <h4 className="text-sm font-black uppercase tracking-tight text-neutral-950 mt-1">
                        Driver: {booking.driverName}
                      </h4>
                      <p className="text-xs text-neutral-500">{booking.vehicle}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-neutral-950 font-mono">₹{booking.totalCost}</span>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">{booking.hours} hrs</p>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="space-y-1.5 text-xs text-neutral-700 bg-neutral-50 p-3 border border-neutral-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#FF5500]" />
                      <span className="font-semibold text-neutral-950">{booking.date} at {booking.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#FF5500]" />
                      <span className="truncate">{booking.pickupAddress}</span>
                    </div>
                    {booking.passengerNotes && (
                      <div className="text-[11px] text-neutral-600 pt-1 border-t border-neutral-200">
                        Note: "{booking.passengerNotes}"
                      </div>
                    )}
                  </div>

                  {/* Accept / Decline */}
                  {booking.status === 'Confirmed' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onAcceptBooking(booking.id)}
                        className="flex-1 py-2 px-3 bg-neutral-950 hover:bg-[#FF5500] hover:text-black text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Trip</span>
                      </button>
                      <button
                        onClick={() => onDeclineBooking(booking.id)}
                        className="py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
