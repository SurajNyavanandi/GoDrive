import { useState, useMemo } from 'react';
import {
  Search,
  Star,
  Car,
  MapPin,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Phone,
  Check,
  MessageCircle,
  Award,
} from 'lucide-react';
import DriverAvatar3D from './DriverAvatar3D';
import { CATEGORIES, HYDERABAD_LOCALITIES } from '../data/mockDrivers';

export default function CustomerView({
  drivers,
  isProUnlocked,
  onOpenBooking,
  onOpenRazorpay,
  onResetPro,
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocality, setSelectedLocality] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Filter regular free drivers
  const filteredFreeDrivers = useMemo(() => {
    return drivers
      .filter((d) => !d.isPro)
      .filter((d) => (selectedCategory === 'All' ? true : d.category === selectedCategory))
      .filter((d) =>
        selectedLocality === 'All'
          ? true
          : d.location.toLowerCase().includes(selectedLocality.toLowerCase())
      )
      .filter((d) => (onlyAvailable ? d.status === 'Available' : true))
      .filter((d) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.vehicle.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q)
        );
      });
  }, [drivers, selectedCategory, selectedLocality, onlyAvailable, searchQuery]);

  // Locked/Pro drivers
  const proDrivers = useMemo(() => {
    return drivers.filter((d) => d.isPro);
  }, [drivers]);

  const filteredProDrivers = useMemo(() => {
    return proDrivers
      .filter((d) => (selectedCategory === 'All' ? true : d.category === selectedCategory))
      .filter((d) =>
        selectedLocality === 'All'
          ? true
          : d.location.toLowerCase().includes(selectedLocality.toLowerCase())
      )
      .filter((d) => (onlyAvailable ? d.status === 'Available' : true))
      .filter((d) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.vehicle.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q)
        );
      });
  }, [proDrivers, selectedCategory, selectedLocality, onlyAvailable, searchQuery]);

  const allFilteredDriversCount = filteredFreeDrivers.length + filteredProDrivers.length;

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* =========================================================================
          1. HERO SECTION (REFERENCE IMAGE 3)
          Full-width cinematic car photo on open road, dark gradient, massive bold
          bottom-left headline, pinned bottom-right solid orange accent block.
         ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-neutral-950 border border-neutral-850 text-white min-h-[580px] sm:min-h-[640px] lg:min-h-[680px] flex flex-col justify-end">
        {/* Background Photo with Cinematic Dark Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=85"
            alt="Luxury automobile on open road"
            className="w-full h-full object-cover object-center opacity-45 brightness-90 filter"
          />
          {/* Multi-layer atmospheric vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/90 via-transparent to-[#0A0A0A]/40" />
        </div>

        {/* Top Floating Badge Bar */}
        <div className="relative z-10 px-6 sm:px-10 lg:px-12 pt-8 sm:pt-10 flex items-center justify-between text-xs uppercase tracking-widest text-neutral-400 font-bold mb-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FF5500] animate-pulse" />
            <span>Hyderabad, Telangana · Verified Drivers for Your Car</span>
          </div>
          <span className="hidden sm:inline text-neutral-500">No Surge Prices · Police Verified</span>
        </div>

        {/* Hero Content Grid (Bottom) */}
        <div className="relative z-10 px-6 sm:px-10 lg:px-12 pb-8 sm:pb-12 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            {/* Massive Bold Headline in Bottom-Left */}
            <div className="lg:col-span-8 space-y-4">
              <div className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#FF5500] font-black">
                [ HIRE DRIVERS FOR YOUR CAR ]
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-black tracking-tight uppercase leading-[0.92] text-white">
                NEED A DRIVER <br />
                <span className="text-[#FF5500]">FOR YOUR CAR?</span>
              </h1>
              <p className="text-sm sm:text-base text-neutral-300 max-w-xl font-normal leading-relaxed pt-2">
                Trained, verified drivers ready in 30 minutes in Hyderabad.
              </p>

              {/* Quick Jump Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <a
                  href="#drivers"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#FF5500] hover:bg-[#E04B00] text-black font-black text-xs uppercase tracking-wider transition-colors"
                >
                  <span>Find a Driver</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </a>

                {!isProUnlocked ? (
                  <button
                    type="button"
                    onClick={onOpenRazorpay}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-[#FF5500]" />
                    <span>Pay ₹300 on Razorpay</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-3 bg-neutral-900 border border-emerald-500/50 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>All Drivers Unlocked</span>
                  </span>
                )}
              </div>
            </div>

            {/* Pinned Bottom-Right Solid Orange Accent Card */}
            <div className="lg:col-span-4">
              <div className="bg-[#FF5500] text-black p-6 sm:p-7 border border-[#FF6A1A] shadow-xl relative">
                {/* Driver Photo + Verification Mark */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="relative w-12 h-12 bg-black shrink-0 overflow-hidden border border-black">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                      alt="Verified Hyderabad driver"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-black text-[#FF5500] flex items-center justify-center text-[9px] font-black">
                      ✓
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-black text-black/80">
                      QUICK SERVICE
                    </div>
                    <div className="text-sm font-black uppercase text-black leading-tight">
                      ARRIVES IN 30 MIN
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] font-semibold text-black/90 leading-snug mb-4">
                  Driver arrives in 30 minutes. Police verified & license checked for your personal car.
                </p>

                <div className="pt-2 border-t border-black/20 flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-black">
                    No Extra Fees
                  </span>
                  <a
                    href="#how-it-works"
                    className="text-xs font-black uppercase tracking-wider text-black underline underline-offset-4 hover:opacity-80 flex items-center gap-1"
                  >
                    <span>How It Works</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. CLEAN 3-STEP "HOW IT WORKS" SECTION
          Step 1: Pick a driver near your area.
          Step 2: Choose your date and time.
          Step 3: Driver arrives at your door.
         ========================================================================= */}
      <section id="how-it-works" className="pt-4 scroll-mt-24">
        {/* Section Top Header with Thumbnails */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-neutral-300">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] font-black mb-1">
              [ EASY 3 STEPS ]
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-neutral-950">
              How It Works
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2 max-w-xl font-normal">
              Book a safe and verified driver for your car in three simple steps.
            </p>
          </div>

          {/* Three Small Aspect-Ratio Thumbnail Previews */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-20 h-14 sm:w-24 sm:h-16 bg-neutral-900 border border-neutral-200 overflow-hidden relative group">
              <img
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80"
                alt="Luxury driving"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="w-20 h-14 sm:w-24 sm:h-16 bg-neutral-900 border border-neutral-200 overflow-hidden relative group">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                alt="Verified chauffeur"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="w-20 h-14 sm:w-24 sm:h-16 bg-neutral-900 border border-neutral-200 overflow-hidden relative group">
              <img
                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80"
                alt="Car interior"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>
        </div>

        {/* Big-Type Feature Rows: 3 Simple Steps */}
        <div className="divide-y divide-neutral-200">
          {/* Step 1 */}
          <div className="py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start group">
            <div className="lg:col-span-1 text-xs font-mono uppercase tracking-widest text-[#FF5500] font-black pt-1">
              01 //
            </div>
            <div className="lg:col-span-6">
              <h3 className="text-2xl sm:text-4xl lg:text-[40px] font-black uppercase tracking-tight text-neutral-950 group-hover:text-[#FF5500] transition-colors">
                PICK A DRIVER NEAR YOUR AREA
              </h3>
            </div>
            <div className="lg:col-span-5">
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Choose a verified driver in your area like Hitec City, Gachibowli, Jubilee Hills, or Banjara Hills.
                Check their rating and experience before booking.
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs uppercase tracking-wider font-bold text-neutral-900">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#FF5500]" /> Police verified & license checked
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#FF5500]" /> Clean driving record
                </span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start group">
            <div className="lg:col-span-1 text-xs font-mono uppercase tracking-widest text-[#FF5500] font-black pt-1">
              02 //
            </div>
            <div className="lg:col-span-6">
              <h3 className="text-2xl sm:text-4xl lg:text-[40px] font-black uppercase tracking-tight text-neutral-950 group-hover:text-[#FF5500] transition-colors">
                CHOOSE YOUR DATE AND TIME
              </h3>
            </div>
            <div className="lg:col-span-5">
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Select when and how long you need the driver. Whether you need a quick 2-hour trip in the city
                or a full day drive, simply pick your time slot.
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs uppercase tracking-wider font-bold text-neutral-900">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#FF5500]" /> Safe & careful drivers
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#FF5500]" /> Manual & automatic cars
                </span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start group">
            <div className="lg:col-span-1 text-xs font-mono uppercase tracking-widest text-[#FF5500] font-black pt-1">
              03 //
            </div>
            <div className="lg:col-span-6">
              <h3 className="text-2xl sm:text-4xl lg:text-[40px] font-black uppercase tracking-tight text-neutral-950 group-hover:text-[#FF5500] transition-colors">
                DRIVER ARRIVES AT YOUR DOOR
              </h3>
            </div>
            <div className="lg:col-span-5">
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Driver arrives in 30 minutes at your pickup address. Sit back in your own car, avoid traffic fatigue,
                and pay the driver directly when your trip ends.
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs uppercase tracking-wider font-bold text-neutral-900">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#FF5500]" /> On-time arrival
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#FF5500]" /> Direct phone & WhatsApp
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. 3 SIMPLE SERVICE CARDS
          Card 1: "City Driving" — Office rides, shopping, and traffic relief (From ₹160/hr).
          Card 2: "Airport Pickup & Drop" — On-time rides to RGIA Shamshabad (Fixed ₹550).
          Card 3: "Outstation Trips" — Safe family trips outside Hyderabad (From ₹1,400/day).
         ========================================================================= */}
      <section id="services" className="pt-4 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] font-black mb-1">
              [ WHAT WE DO ]
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
              Simple Driving Services
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md">
            Clear prices with zero extra charges. Safe & careful drivers for your personal car.
          </p>
        </div>

        {/* 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: City Driving */}
          <div className="bg-white border border-neutral-200 flex flex-col group hover:border-neutral-900 transition-colors">
            <div className="w-full aspect-[4/3] bg-neutral-900 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80"
                alt="City Driving"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-black text-[#FF5500] text-[10px] font-black uppercase tracking-wider px-2 py-0.5">
                CITY RIDES
              </div>
            </div>
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-neutral-950 group-hover:text-[#FF5500] transition-colors">
                  CITY DRIVING
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                  Office rides, shopping, and traffic relief. Relax in the backseat of your car while a trained driver navigates Hyderabad traffic.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-900">From ₹160 / hr</span>
                <a href="#drivers" className="font-bold uppercase tracking-wider text-[#FF5500] flex items-center gap-1 hover:underline">
                  <span>Find a Driver</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Airport Pickup & Drop */}
          <div className="bg-white border border-neutral-200 flex flex-col group hover:border-neutral-900 transition-colors">
            <div className="w-full aspect-[4/3] bg-neutral-900 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80"
                alt="Airport Pickup & Drop"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-[#FF5500] text-black text-[10px] font-black uppercase tracking-wider px-2 py-0.5">
                RGIA 24/7 AIRPORT
              </div>
            </div>
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-neutral-950 group-hover:text-[#FF5500] transition-colors">
                  AIRPORT PICKUP & DROP
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                  On-time rides to RGIA Shamshabad airport. 24/7 service, flight timing tracking, and smooth highway drive with luggage help.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-900">Fixed ₹550 / trip</span>
                <a href="#drivers" className="font-bold uppercase tracking-wider text-[#FF5500] flex items-center gap-1 hover:underline">
                  <span>Find a Driver</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 3: Outstation Trips */}
          <div className="bg-white border border-neutral-200 flex flex-col group hover:border-neutral-900 transition-colors">
            <div className="w-full aspect-[4/3] bg-neutral-900 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"
                alt="Outstation Trips"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-black text-[#FF5500] text-[10px] font-black uppercase tracking-wider px-2 py-0.5">
                HIGHWAY TRIPS
              </div>
            </div>
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-neutral-950 group-hover:text-[#FF5500] transition-colors">
                  OUTSTATION TRIPS
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                  Safe family trips outside Hyderabad to Vijayawada, Warangal, Srisailam, or Tirupati with an expert highway driver.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-900">From ₹1,400 / day</span>
                <a href="#drivers" className="font-bold uppercase tracking-wider text-[#FF5500] flex items-center gap-1 hover:underline">
                  <span>Find a Driver</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. DRIVER ROSTER & DIRECT RAZORPAY PAYMENT
         ========================================================================= */}
      <section id="drivers" className="pt-4 scroll-mt-24 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] font-black mb-1">
              [ AVAILABLE DRIVERS ]
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
              Available Drivers in Hyderabad
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Pick a driver below, or unlock direct phone numbers for all 10+ drivers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold">
              {allFilteredDriversCount} DRIVERS AVAILABLE
            </span>
          </div>
        </div>

        {/* High-Impact Razorpay Unlock Banner */}
        {!isProUnlocked ? (
          <div className="bg-[#FF5500] text-black p-6 sm:p-8 border-2 border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-black text-[#FF5500] px-2.5 py-0.5">
                <Sparkles className="w-3 h-3 text-[#FF5500]" />
                <span>UNLOCK DIRECT PHONE NUMBERS · ₹300 ONE-TIME</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black leading-none pt-1">
                UNLOCK ALL DRIVER PHONE NUMBERS
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-black/85 leading-relaxed">
                Direct phone numbers and WhatsApp for all verified drivers. No middleman and no extra charges.
                Instant Razorpay checkout with one-tap payment.
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={onOpenRazorpay}
                className="w-full md:w-auto px-6 py-4 bg-black hover:bg-neutral-900 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
              >
                <Sparkles className="w-4 h-4 text-[#FF5500]" />
                <span>PAY ₹300 ON RAZORPAY</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-950 text-white p-5 sm:p-6 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 text-black flex items-center justify-center font-black">
                ✓
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  DIRECT ACCESS UNLOCKED
                </div>
                <div className="text-sm font-bold uppercase text-white">
                  All Hyderabad Drivers & Direct Phone Numbers Available
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onResetPro}
              className="text-xs text-neutral-400 hover:text-white underline uppercase tracking-wider font-semibold"
            >
              Reset Lock (Demo Mode)
            </button>
          </div>
        )}

        {/* Filter Controls: Search, Category Tabs, Locality Pills */}
        <div className="bg-white border border-neutral-200 p-4 sm:p-5 space-y-4">
          {/* Top Line: Search Bar + Available Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search driver by name, car type, or area (e.g. Hitec City)..."
                className="w-full bg-neutral-50 border border-neutral-300 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-950 placeholder-neutral-400 focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]"
              />
            </div>

            <button
              type="button"
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 border text-xs font-bold uppercase tracking-wider transition-colors shrink-0 ${
                onlyAvailable
                  ? 'bg-neutral-950 text-white border-neutral-950'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-300 hover:bg-neutral-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${onlyAvailable ? 'bg-emerald-400' : 'bg-neutral-400'}`} />
              <span>Available Now Only</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mr-2 font-bold">
              CAR TYPE:
            </span>
            {Array.from(new Set(CATEGORIES.includes('All') ? CATEGORIES : ['All', ...CATEGORIES])).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? 'bg-neutral-950 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Locality Quick Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-100">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mr-2 font-bold">
              AREA:
            </span>
            <button
              type="button"
              onClick={() => setSelectedLocality('All')}
              className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all ${
                selectedLocality === 'All'
                  ? 'bg-[#FF5500] text-black font-black'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950'
              }`}
            >
              All Hyderabad
            </button>
            {HYDERABAD_LOCALITIES.slice(0, 6).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setSelectedLocality(loc)}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all ${
                  selectedLocality === loc
                    ? 'bg-[#FF5500] text-black font-black'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Driver Grid: Regular Drivers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreeDrivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-white border border-neutral-200 flex flex-col justify-between hover:border-neutral-950 transition-colors shadow-2xs group"
            >
              {/* Card Header & Avatar */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <DriverAvatar3D
                      type={driver.avatarType || 'suit'}
                      name={driver.name}
                      isPro={driver.isPro}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-neutral-950 text-base uppercase tracking-tight">
                          {driver.name}
                        </h4>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Verified" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-neutral-600 font-medium mt-0.5">
                        <Car className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{driver.vehicle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hourly Rate Badge */}
                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-neutral-950">
                      ₹{driver.hourlyRate}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      PER HOUR
                    </div>
                  </div>
                </div>

                {/* Driver Bio / Details */}
                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                  {driver.bio || 'Experienced private driver for Hyderabad city and Outer Ring Road commutes.'}
                </p>

                {/* Metadata Row: Rating, Trips, Experience, Location */}
                <div className="pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2 text-[11px] text-neutral-600 font-medium">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#FF5500] text-[#FF5500]" />
                    <span className="font-bold text-neutral-950">{driver.rating}</span>
                    <span className="text-neutral-400">({driver.trips} trips)</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-700">
                    <Award className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{driver.experience} yrs exp</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1 text-neutral-500 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                    <span className="truncate">{driver.location}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 sm:p-5 pt-0 mt-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenBooking(driver)}
                  className="flex-1 py-2.5 px-3 bg-neutral-950 hover:bg-[#FF5500] hover:text-black text-white font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Book Driver</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Direct Call / WhatsApp (Instant Unlocked Actions) */}
                <a
                  href={`tel:${driver.phone}`}
                  className="px-2.5 py-2.5 border border-neutral-300 hover:border-neutral-950 text-neutral-700 hover:text-neutral-950 transition-colors flex items-center gap-1 text-xs font-bold"
                  aria-label={`Call ${driver.name}`}
                  title="Call Now"
                >
                  <Phone className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span className="hidden sm:inline text-[11px]">Call Now</span>
                </a>
                <a
                  href={`https://wa.me/${driver.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(driver.name)},%20I%20would%20like%20to%20book%20a%20driver%20in%20Hyderabad%20via%20GoDrive.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-2.5 border border-neutral-300 hover:border-emerald-600 text-neutral-700 hover:text-emerald-600 transition-colors flex items-center gap-1 text-xs font-bold"
                  aria-label={`WhatsApp ${driver.name}`}
                  title="WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline text-[11px]">WhatsApp</span>
                </a>
              </div>
            </div>
          ))}

          {/* Pro / Locked Drivers */}
          {filteredProDrivers.map((driver) => (
            <div
              key={driver.id}
              className={`bg-white border flex flex-col justify-between transition-colors shadow-2xs relative overflow-hidden ${
                isProUnlocked ? 'border-neutral-200 hover:border-neutral-950' : 'border-neutral-300 bg-neutral-50/50'
              }`}
            >
              {/* Tag */}
              <div className="bg-black text-[#FF5500] px-3 py-1 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                <span>VERIFIED DRIVERS · TELANGANA</span>
                {!isProUnlocked && <span>LOCKED (₹300 PASS)</span>}
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <DriverAvatar3D
                      type={driver.avatarType || 'vip'}
                      name={driver.name}
                      isPro={true}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-neutral-950 text-base uppercase tracking-tight">
                          {driver.name}
                        </h4>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" title="Verified" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-neutral-600 font-medium mt-0.5">
                        <Car className="w-3.5 h-3.5 text-[#FF5500]" />
                        <span>{driver.vehicle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-neutral-950">
                      ₹{driver.hourlyRate}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      PER HOUR
                    </div>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                  {driver.bio}
                </p>

                <div className="pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2 text-[11px] text-neutral-600 font-medium">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#FF5500] text-[#FF5500]" />
                    <span className="font-bold text-neutral-950">{driver.rating}</span>
                    <span className="text-neutral-400">({driver.trips} trips)</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-700">
                    <Award className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{driver.experience} yrs exp</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1 text-neutral-500 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                    <span className="truncate">{driver.location}</span>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="p-4 sm:p-5 pt-0 mt-auto">
                {isProUnlocked ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenBooking(driver)}
                      className="flex-1 py-2.5 px-3 bg-neutral-950 hover:bg-[#FF5500] hover:text-black text-white font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Book Driver</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`tel:${driver.phone}`}
                      className="px-2.5 py-2.5 border border-neutral-300 hover:border-neutral-950 text-neutral-700 hover:text-neutral-950 transition-colors flex items-center gap-1 text-xs font-bold"
                      aria-label={`Call ${driver.name}`}
                      title="Call Now"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#FF5500]" />
                      <span className="hidden sm:inline text-[11px]">Call Now</span>
                    </a>
                    <a
                      href={`https://wa.me/${driver.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(driver.name)},%20I%20would%20like%20to%20book%20you%20in%20Hyderabad%20via%20GoDrive.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-2.5 border border-neutral-300 hover:border-emerald-600 text-neutral-700 hover:text-emerald-600 transition-colors flex items-center gap-1 text-xs font-bold"
                      aria-label={`WhatsApp ${driver.name}`}
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline text-[11px]">WhatsApp</span>
                    </a>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenRazorpay}
                    className="w-full py-2.5 px-3 bg-[#FF5500] hover:bg-[#E04B00] text-black font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5 text-black" />
                    <span>Unlock Phone Numbers (₹300)</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {allFilteredDriversCount === 0 && (
          <div className="text-center py-12 bg-white border border-neutral-200 p-8 space-y-3">
            <p className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              No drivers match your current search
            </p>
            <p className="text-xs text-neutral-500">
              Try resetting your search query or selecting "All Hyderabad"
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedLocality('All');
                setSearchQuery('');
                setOnlyAvailable(false);
              }}
              className="mt-2 px-4 py-2 bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* =========================================================================
          5. PRICING SECTION (#pricing)
         ========================================================================= */}
      <section id="pricing" className="pt-4 scroll-mt-24 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] font-black mb-1">
              [ CLEAR PRICES ]
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
              Simple Hourly Rates
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              No extra surge prices during rain or rush hour. Pay the driver directly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold mb-1">
                TIER 1
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-neutral-950">
                Small Car / Hatchback
              </h3>
              <p className="text-xs text-neutral-600 mt-2">
                Swift, Baleno, i20, Tiago for daily local office errands.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-neutral-100">
              <div className="text-2xl font-black text-neutral-950">₹140 - ₹160</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                PER HOUR · 3 HR MIN
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold mb-1">
                TIER 2
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-neutral-950">
                Sedan Car
              </h3>
              <p className="text-xs text-neutral-600 mt-2">
                City, Dzire, Verna, Ciaz for business meetings & airport runs.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-neutral-100">
              <div className="text-2xl font-black text-neutral-950">₹180 - ₹220</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                PER HOUR · 3 HR MIN
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold mb-1">
                TIER 3
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-neutral-950">
                SUV & 7-Seater
              </h3>
              <p className="text-xs text-neutral-600 mt-2">
                Innova Crysta, Fortuner, Creta, XUV700 for family trips.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-neutral-100">
              <div className="text-2xl font-black text-neutral-950">₹250 - ₹300</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                PER HOUR · 4 HR MIN
              </div>
            </div>
          </div>

          <div className="bg-[#FF5500] text-black border-2 border-black p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-black/70 font-black mb-1">
                ONE-TIME PASS
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                Unlock All Drivers
              </h3>
              <p className="text-xs text-black/85 mt-2 font-medium">
                Get direct phone numbers and WhatsApp access for all 10+ drivers.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-black/20">
              <div className="text-2xl font-black text-black">₹300</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-black">
                ONE-TIME · RAZORPAY
              </div>
              <button
                type="button"
                onClick={onOpenRazorpay}
                className="mt-3 w-full py-2 bg-black hover:bg-neutral-900 text-white font-black text-xs uppercase tracking-wider transition-colors"
              >
                {isProUnlocked ? 'Already Unlocked' : 'Unlock on Razorpay'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. LOCALITIES COVERAGE SECTION (#localities)
         ========================================================================= */}
      <section id="localities" className="pt-4 scroll-mt-24 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] font-black mb-1">
              [ OUR AREAS ]
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
              Hyderabad Pickup Areas
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Drivers available across all major neighborhoods in 20 to 35 minutes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'Hitec City', time: '20 mins', note: 'Cyber Towers & Mindspace' },
            { name: 'Gachibowli', time: '25 mins', note: 'Financial District' },
            { name: 'Banjara Hills', time: '30 mins', note: 'Roads 1, 10 & 12' },
            { name: 'Jubilee Hills', time: '25 mins', note: 'Checkpost & Rd 36' },
            { name: 'RGIA Airport', time: '35 mins', note: 'Shamshabad Corridor' },
            { name: 'Madhapur', time: '20 mins', note: 'Durgam Cheruvu' },
          ].map((loc) => (
            <div
              key={loc.name}
              className="bg-white border border-neutral-200 p-4 hover:border-neutral-950 transition-colors"
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#FF5500] font-black">
                {loc.time}
              </div>
              <h4 className="text-sm font-black uppercase tracking-tight text-neutral-950 mt-1">
                {loc.name}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">{loc.note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
