import { useState, useMemo } from 'react';
import {
  Search,
  Star,
  Car,
  MapPin,
  ArrowRight,
  Phone,
  Check,
  MessageCircle,
  Award,
  UserCheck,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import DriverAvatar3D from './DriverAvatar3D';
import { CATEGORIES, HYDERABAD_LOCALITIES } from '../data/mockDrivers';

export default function CustomerView({
  drivers,
  onOpenBooking,
  onSwitchToDriver,
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocality, setSelectedLocality] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // All verified drivers in Hyderabad (Zero locking / 100% free direct customer access)
  const filteredDrivers = useMemo(() => {
    return drivers
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

  const allFilteredDriversCount = filteredDrivers.length;

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

        {/* Hero Content (Clean, Focused & Minimalist) */}
        <div className="relative z-10 px-6 sm:px-10 lg:px-12 pb-10 sm:pb-14 pt-16 max-w-3xl space-y-4">
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

            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <span>View Pricing</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. REDESIGNED HOW IT WORKS (3-STEP INTERACTIVE VISUAL CARD GRID)
         ========================================================================= */}
      <section id="how-it-works" className="pt-6 scroll-mt-24">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-neutral-300">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] font-black mb-1">
              [ HOW IT WORKS ]
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-neutral-950">
              Three Simple Steps
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md">
            Hire a trusted, police-verified driver for your personal car in Hyderabad with zero middleman hassle.
          </p>
        </div>

        {/* 3-Step Interactive Visual Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 relative">
          {/* Step 1 Card — Browse & Pick */}
          <div className="bg-white border-2 border-neutral-200 hover:border-black p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 group relative shadow-sm hover:shadow-md">
            <div>
              {/* Top Row: Step Badge + Icon */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-black px-2.5 py-1 bg-black text-[#FF5500] uppercase tracking-wider">
                  STEP 01
                </span>
                <div className="w-12 h-12 bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500] group-hover:bg-[#FF5500] group-hover:text-black transition-colors">
                  <UserCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#FF5500] font-bold mb-1">
                BROWSE & PICK
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-950 mb-3 group-hover:text-[#FF5500] transition-colors">
                Pick a Driver Nearby
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Browse verified Hyderabad drivers in Hitec City, Gachibowli, Jubilee Hills, and nearby areas. Check their ratings, driving experience, and languages.
              </p>
            </div>

            {/* Bottom Tags */}
            <div className="pt-6 mt-6 border-t border-neutral-100 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px] font-bold uppercase tracking-wider">
                <Check className="w-3 h-3 text-[#FF5500]" /> Police Verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px] font-bold uppercase tracking-wider">
                <MapPin className="w-3 h-3 text-[#FF5500]" /> Local Hyderabad Experts
              </span>
            </div>
          </div>

          {/* Step 2 Card — Connect Instantly */}
          <div className="bg-white border-2 border-neutral-200 hover:border-black p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 group relative shadow-sm hover:shadow-md">
            <div>
              {/* Top Row: Step Badge + Icon */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-black px-2.5 py-1 bg-black text-[#FF5500] uppercase tracking-wider">
                  STEP 02
                </span>
                <div className="w-12 h-12 bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500] group-hover:bg-[#FF5500] group-hover:text-black transition-colors">
                  <PhoneCall className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#FF5500] font-bold mb-1">
                CONNECT INSTANTLY
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-950 mb-3 group-hover:text-[#FF5500] transition-colors">
                Call or WhatsApp Directly
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Zero middleman fees and no app commission. Contact any driver directly with one tap to discuss your pickup time and destination.
              </p>
            </div>

            {/* Bottom Tags */}
            <div className="pt-6 mt-6 border-t border-neutral-100 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px] font-bold uppercase tracking-wider">
                <Check className="w-3 h-3 text-[#FF5500]" /> 100% Free Contact
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px] font-bold uppercase tracking-wider">
                <MessageSquare className="w-3 h-3 text-[#FF5500]" /> Instant Direct Response
              </span>
            </div>
          </div>

          {/* Step 3 Card — Relax in Your Car */}
          <div className="bg-white border-2 border-neutral-200 hover:border-black p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 group relative shadow-sm hover:shadow-md">
            <div>
              {/* Top Row: Step Badge + Icon */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-black px-2.5 py-1 bg-black text-[#FF5500] uppercase tracking-wider">
                  STEP 03
                </span>
                <div className="w-12 h-12 bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500] group-hover:bg-[#FF5500] group-hover:text-black transition-colors">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#FF5500] font-bold mb-1">
                RELAX IN YOUR CAR
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-950 mb-3 group-hover:text-[#FF5500] transition-colors">
                Driver Arrives in 30 Mins
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Your driver arrives right at your doorstep. Relax in the comfort of your own car, avoid traffic fatigue, and pay the driver directly when the trip ends.
              </p>
            </div>

            {/* Bottom Tags */}
            <div className="pt-6 mt-6 border-t border-neutral-100 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px] font-bold uppercase tracking-wider">
                <Car className="w-3 h-3 text-[#FF5500]" /> Doorstep Pickup
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px] font-bold uppercase tracking-wider">
                <Check className="w-3 h-3 text-[#FF5500]" /> Pay Driver Directly
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CTA Action Bar */}
        <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-50 p-4 sm:p-5 border border-neutral-200">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#FF5500] animate-pulse" />
            <p className="text-xs sm:text-sm font-bold text-neutral-900">
              Need a driver now? Trained drivers on standby across Hyderabad.
            </p>
          </div>
          <a
            href="#drivers"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF5500] hover:bg-[#E04B00] text-black font-black text-xs uppercase tracking-wider transition-colors shrink-0"
          >
            <span>Find a Driver Now</span>
            <ChevronRight className="w-4 h-4" />
          </a>
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
              Direct phone numbers, WhatsApp, and booking for all verified Hyderabad drivers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold">
              {allFilteredDriversCount} DRIVERS AVAILABLE
            </span>
          </div>
        </div>

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

        {/* Driver Grid: All Verified Hyderabad Drivers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-white border border-neutral-200 flex flex-col justify-between hover:border-neutral-950 transition-colors shadow-2xs group"
            >
              {/* Clean Status / Listing Badge */}
              <div className="bg-[#0A0A0A] text-white px-3.5 py-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{driver.listingStatus || 'Verified Chauffeur'}</span>
                </span>
                <span className="text-[#FF5500] font-mono text-[9px]">
                  {driver.listingPlan || 'Active on Homepage'}
                </span>
              </div>

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

              {/* Card Footer Actions: Book, Call, WhatsApp (Direct Access) */}
              <div className="p-4 sm:p-5 pt-0 mt-auto flex items-center gap-2">
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
                  href={`https://wa.me/${driver.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(driver.name)},%20I%20would%20like%20to%20book%20a%20driver%20in%20Hyderabad%20via%20Maa%20Driver.`}
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
                FOR DRIVERS
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                List on Homepage
              </h3>
              <p className="text-xs text-black/85 mt-2 font-medium">
                One-time ₹49 registration. First 3 months free, then ₹99/month to stay listed for customer bookings.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-black/20">
              <div className="text-2xl font-black text-black">₹49</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-black">
                ONE-TIME · 3 MOS FREE · THEN ₹99/MO
              </div>
              <button
                type="button"
                onClick={onSwitchToDriver}
                className="mt-3 w-full py-2 bg-black hover:bg-neutral-900 text-white font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Register Driver (₹49)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated Driver Listing Model Banner */}
        <div className="mt-4 bg-[#0A0A0A] border-l-4 border-[#FF5500] p-5 sm:p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#FF5500] font-black">
              <span>FOR PRIVATE DRIVERS</span>
            </div>
            <h4 className="text-base sm:text-lg font-black uppercase tracking-tight text-white mt-0.5">
              List on Maa Driver for ₹49 · First 3 Months Free · Then ₹99/Month
            </h4>
            <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
              One-time registration of ₹49. Your name and contact appear on this homepage for direct customer bookings. Free for the first 3 months, then ₹99/month renewal to stay listed. 0% trip commission.
            </p>
          </div>
          {onSwitchToDriver && (
            <button
              type="button"
              onClick={onSwitchToDriver}
              className="shrink-0 px-5 py-3 bg-[#FF5500] hover:bg-[#E04B00] text-black font-black text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <span>Driver Registration (₹49)</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          )}
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
