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
  UserCheck,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Languages,
  Clock,
  Briefcase,
  Info,
} from 'lucide-react';
import { HYDERABAD_LOCALITIES } from '../data/mockDrivers';

export default function CustomerView({
  drivers,
  onOpenBooking,
  onSwitchToDriver,
}) {
  // Driver Type filter: 'all' | 'freelance' | 'permanent'
  const [selectedDriverType, setSelectedDriverType] = useState('all');
  const [selectedLocality, setSelectedLocality] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Filtered drivers based on driverType, locality, availability, and search query
  const filteredDrivers = useMemo(() => {
    return drivers
      .filter((d) => {
        if (selectedDriverType === 'all') return true;
        return (d.driverType || 'freelance') === selectedDriverType;
      })
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
          (d.vehicle && d.vehicle.toLowerCase().includes(q)) ||
          d.location.toLowerCase().includes(q) ||
          (d.languages && d.languages.toLowerCase().includes(q))
        );
      });
  }, [drivers, selectedDriverType, selectedLocality, onlyAvailable, searchQuery]);

  const allFilteredDriversCount = filteredDrivers.length;
  const availableCount = drivers.filter((d) => d.status === 'Available').length;

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* =========================================================================
          1. HERO SECTION
         ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-neutral-950 border border-neutral-850 text-white min-h-[580px] sm:min-h-[640px] lg:min-h-[680px] flex flex-col justify-end">
        {/* Background Photo with Cinematic Dark Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=85"
            alt="Luxury automobile on open road"
            className="w-full h-full object-cover object-center opacity-45 brightness-90 filter"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/90 via-transparent to-[#0A0A0A]/40" />
        </div>

        {/* Top Floating Badge Bar */}
        <div className="relative z-10 px-6 sm:px-10 lg:px-12 pt-8 sm:pt-10 flex items-center justify-between text-xs uppercase tracking-widest text-neutral-400 font-bold mb-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FF5500] animate-pulse" />
            <span>Hyderabad, Telangana · Verified Drivers for Your Car</span>
          </div>
          <span className="hidden sm:inline text-neutral-500">Freelance Hourly & Permanent Monthly · Police Verified</span>
        </div>

        {/* Hero Content (Clean, Focused & Minimalist) */}
        <div className="relative z-10 px-6 sm:px-10 lg:px-12 pb-10 sm:pb-14 pt-16 max-w-3xl space-y-4">
          <div className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#FF5500] font-black">
            [ MANA DRIVER · HYDERABAD ]
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-black tracking-tight uppercase leading-[0.92] text-white">
            NEED A DRIVER <br />
            <span className="text-[#FF5500]">FOR YOUR CAR?</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-300 max-w-xl font-normal leading-relaxed pt-2">
            Hire trusted Hyderabad drivers for your personal car. Choose hourly freelance drivers in 30 minutes, or hire full-time monthly permanent drivers for family & corporate needs.
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
              <span>View Pricing Rates</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. 3-STEP HOW IT WORKS SECTION
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
            Hire a trusted, police-verified driver for your personal car in Hyderabad with zero middleman hassle and 100% free direct calls.
          </p>
        </div>

        {/* 3-Step Interactive Visual Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 relative">
          {/* Step 1 Card — Browse & Pick */}
          <div className="bg-white border-2 border-neutral-200 hover:border-black p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 group relative shadow-xs hover:shadow-md">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-black px-2.5 py-1 bg-black text-[#FF5500] uppercase tracking-wider">
                  STEP 01
                </span>
                <div className="w-12 h-12 bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500] group-hover:bg-[#FF5500] group-hover:text-black transition-colors">
                  <UserCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>

              <div className="text-[10px] font-mono uppercase tracking-widest text-[#FF5500] font-bold mb-1">
                BROWSE & FILTER
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-950 mb-3 group-hover:text-[#FF5500] transition-colors">
                Pick Freelance or Permanent
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Filter by Freelance (Hourly / On-Demand) or Permanent (Monthly / Full-Time). Check real driver photos, years of experience, languages, and ratings.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-neutral-100 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px] font-bold uppercase tracking-wider">
                <Check className="w-3 h-3 text-[#FF5500]" /> Police Verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px] font-bold uppercase tracking-wider">
                <MapPin className="w-3 h-3 text-[#FF5500]" /> Hyderabad Experts
              </span>
            </div>
          </div>

          {/* Step 2 Card — Connect Instantly */}
          <div className="bg-white border-2 border-neutral-200 hover:border-black p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 group relative shadow-xs hover:shadow-md">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-black px-2.5 py-1 bg-black text-[#FF5500] uppercase tracking-wider">
                  STEP 02
                </span>
                <div className="w-12 h-12 bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500] group-hover:bg-[#FF5500] group-hover:text-black transition-colors">
                  <PhoneCall className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>

              <div className="text-[10px] font-mono uppercase tracking-widest text-[#FF5500] font-bold mb-1">
                DIRECT CONTACT
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-950 mb-3 group-hover:text-[#FF5500] transition-colors">
                Call or WhatsApp Directly
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Check their live availability status. If Online, tap to call or WhatsApp immediately with zero app commission or unlock fees.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-neutral-100 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px] font-bold uppercase tracking-wider">
                <Check className="w-3 h-3 text-[#FF5500]" /> 100% Free Access
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px] font-bold uppercase tracking-wider">
                <MessageSquare className="w-3 h-3 text-[#FF5500]" /> Live Duty Status
              </span>
            </div>
          </div>

          {/* Step 3 Card — Relax in Your Car */}
          <div className="bg-white border-2 border-neutral-200 hover:border-black p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 group relative shadow-xs hover:shadow-md">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-black px-2.5 py-1 bg-black text-[#FF5500] uppercase tracking-wider">
                  STEP 03
                </span>
                <div className="w-12 h-12 bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500] group-hover:bg-[#FF5500] group-hover:text-black transition-colors">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>

              <div className="text-[10px] font-mono uppercase tracking-widest text-[#FF5500] font-bold mb-1">
                DOORSTEP SERVICE
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-950 mb-3 group-hover:text-[#FF5500] transition-colors">
                Driver Arrives in 30 Mins
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Your driver arrives right at your doorstep. Relax in the comfort of your own car, avoid Hyderabad traffic fatigue, and pay the driver directly.
              </p>
            </div>

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
              {availableCount} verified drivers currently online across Hyderabad. Ready for immediate dispatch.
            </p>
          </div>
          <a
            href="#drivers"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF5500] hover:bg-[#E04B00] text-black font-black text-xs uppercase tracking-wider transition-colors shrink-0"
          >
            <span>Browse Drivers Now</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* =========================================================================
          3. SIMPLE SERVICES OVERVIEW
         ========================================================================= */}
      <section id="services" className="pt-4 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] font-black mb-1">
              [ WHAT WE OFFER ]
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
              Personal Car Driving Services
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md">
            Clear market rates with zero surprise charges. Experienced, licensed drivers for your personal car (any make, manual or automatic).
          </p>
        </div>

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
                HOURLY / ON-DEMAND
              </div>
            </div>
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-neutral-950 group-hover:text-[#FF5500] transition-colors">
                  CITY & HOURLY DRIVING
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                  Office commutes, shopping runs, doctor visits, and weekend traffic relief. Driver arrives in 30 minutes.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-900">From ₹140 – ₹160 / hr</span>
                <a href="#drivers" className="font-bold uppercase tracking-wider text-[#FF5500] flex items-center gap-1 hover:underline">
                  <span>View Drivers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Permanent Monthly Drivers */}
          <div className="bg-white border border-neutral-200 flex flex-col group hover:border-neutral-900 transition-colors">
            <div className="w-full aspect-[4/3] bg-neutral-900 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80"
                alt="Permanent Monthly Driver"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-[#FF5500] text-black text-[10px] font-black uppercase tracking-wider px-2 py-0.5">
                PERMANENT / MONTHLY
              </div>
            </div>
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-neutral-950 group-hover:text-[#FF5500] transition-colors">
                  MONTHLY FAMILY CHAUFFEURS
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                  Dedicated full-time private drivers for car owners, families, school runs, and senior corporate executives.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-900">₹18,000 – ₹24,000 / mo</span>
                <a href="#drivers" className="font-bold uppercase tracking-wider text-[#FF5500] flex items-center gap-1 hover:underline">
                  <span>View Drivers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 3: Airport & Outstation Trips */}
          <div className="bg-white border border-neutral-200 flex flex-col group hover:border-neutral-900 transition-colors">
            <div className="w-full aspect-[4/3] bg-neutral-900 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"
                alt="Outstation Trips"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-black text-[#FF5500] text-[10px] font-black uppercase tracking-wider px-2 py-0.5">
                AIRPORT & HIGHWAY
              </div>
            </div>
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-neutral-950 group-hover:text-[#FF5500] transition-colors">
                  AIRPORT & OUTSTATION TRIPS
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                  Fixed RGIA Shamshabad airport transfers and long-distance highway travel across Telangana & Andhra Pradesh.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-900">₹1,400 – ₹1,800 / day</span>
                <a href="#drivers" className="font-bold uppercase tracking-wider text-[#FF5500] flex items-center gap-1 hover:underline">
                  <span>View Drivers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. DRIVER ROSTER WITH FREELANCE VS PERMANENT FILTERS & MINIMALIST CARDS
         ========================================================================= */}
      <section id="drivers" className="pt-4 scroll-mt-24 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] font-black mb-1">
              [ DIRECT DRIVER ROSTER ]
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
              Verified Drivers in Hyderabad
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Browse authentic Indian drivers with live status. Call or WhatsApp directly for free.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold">
              {allFilteredDriversCount} DRIVERS LISTED
            </span>
          </div>
        </div>

        {/* 1. PRIMARY DRIVER TYPE FILTER TABS (FREELANCE VS PERMANENT) */}
        <div className="bg-neutral-950 text-white p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSelectedDriverType('all')}
              className={`px-3.5 sm:px-4 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                selectedDriverType === 'all'
                  ? 'bg-[#FF5500] text-black'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <span>All Drivers</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDriverType('freelance')}
              className={`px-3.5 sm:px-4 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                selectedDriverType === 'freelance'
                  ? 'bg-[#FF5500] text-black'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Freelance Drivers (Hourly / On-Demand)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDriverType('permanent')}
              className={`px-3.5 sm:px-4 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                selectedDriverType === 'permanent'
                  ? 'bg-[#FF5500] text-black'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Permanent Drivers (Monthly / Full-Time)</span>
            </button>
          </div>

          {/* Quick Info text for currently active type */}
          <div className="text-[11px] font-mono text-neutral-400 hidden lg:block pr-3">
            {selectedDriverType === 'freelance'
              ? 'Pay hourly (₹140 - ₹300/hr) · Fast 30-min pickup'
              : selectedDriverType === 'permanent'
              ? 'Monthly salary (₹18k - ₹26k/mo) · Dedicated full-time'
              : 'Showing all hourly & monthly drivers'}
          </div>
        </div>

        {/* 2. SECONDARY CONTROLS: SEARCH + UBER-STYLE AVAILABLE ONLY TOGGLE */}
        <div className="bg-white border border-neutral-200 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search driver by name, car (Dzire, Fortuner), language, or area..."
                className="w-full bg-neutral-50 border border-neutral-300 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-950 placeholder-neutral-400 focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]"
              />
            </div>

            {/* Uber-style Available Only Toggle */}
            <button
              type="button"
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 border text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                onlyAvailable
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-300 hover:bg-neutral-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  onlyAvailable ? 'bg-white animate-pulse' : 'bg-neutral-400'
                }`}
              />
              <span>Show Available Drivers Only</span>
            </button>
          </div>

          {/* Locality Quick Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
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

        {/* 3. ULTRA-MINIMALIST DRIVER CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredDrivers.map((driver) => {
            const isAvailable = driver.status === 'Available';
            const isPermanent = (driver.driverType || 'freelance') === 'permanent';

            return (
              <div
                key={driver.id}
                className={`bg-white border transition-all duration-200 flex flex-col justify-between relative group ${
                  isAvailable
                    ? 'border-neutral-200 hover:border-black shadow-xs hover:shadow-md'
                    : 'border-neutral-200/80 bg-neutral-50/60 opacity-90'
                }`}
              >
                {/* Top Status Bar with Uber-style Live Dot */}
                <div
                  className={`px-4 py-2 border-b flex items-center justify-between text-[11px] font-mono uppercase tracking-wider ${
                    isAvailable
                      ? 'bg-neutral-950 text-white border-neutral-950'
                      : 'bg-neutral-200 text-neutral-600 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse'
                          : 'bg-neutral-400'
                      }`}
                    />
                    <span className="font-bold">
                      {isAvailable ? 'AVAILABLE FOR RIDES' : 'CURRENTLY OFFLINE'}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      isPermanent
                        ? 'bg-purple-900 text-purple-200'
                        : 'bg-[#FF5500] text-black'
                    }`}
                  >
                    {isPermanent ? 'Permanent' : 'Freelance'}
                  </span>
                </div>

                {/* Main Card Content: Square Portrait Photo + Clean Details */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    {/* Real Driver Photo (Square aspect ratio with fallback) */}
                    <div className="relative shrink-0 w-20 h-20 sm:w-22 sm:h-22 bg-neutral-900 overflow-hidden border border-neutral-200">
                      <img
                        src={
                          driver.photo ||
                          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={driver.name}
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                          !isAvailable ? 'grayscale-[40%]' : ''
                        }`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      {/* Status indicator pin */}
                      <span
                        className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${
                          isAvailable ? 'bg-emerald-500' : 'bg-neutral-400'
                        }`}
                        title={isAvailable ? 'Online' : 'Offline'}
                      />
                    </div>

                    {/* Driver Identity & Vehicle */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-neutral-950 text-base sm:text-lg uppercase tracking-tight truncate">
                          {driver.name}
                        </h4>
                        <span
                          className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"
                          title="Police & License Checked"
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      </div>

                      <div className="text-xs text-neutral-600 font-medium flex items-center gap-1.5 mt-0.5 truncate">
                        <Car className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{driver.vehicle}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-neutral-500 mt-2">
                        <span className="flex items-center gap-1 font-bold text-neutral-900">
                          <Star className="w-3.5 h-3.5 fill-[#FF5500] text-[#FF5500]" />
                          {driver.rating}
                        </span>
                        <span>·</span>
                        <span>{driver.experience} Yrs Exp</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Info Grid: Languages & Location */}
                  <div className="pt-3 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Languages className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate font-medium">
                        {driver.languages || 'Telugu, Hindi, English'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                      <span className="truncate">{driver.location}</span>
                    </div>
                  </div>

                  {/* Transparent Pricing Callout */}
                  <div className="p-3 bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                        {isPermanent ? 'MONTHLY SALARY' : 'HOURLY RATE'}
                      </div>
                      <div className="text-lg font-black text-neutral-950 font-mono">
                        {isPermanent
                          ? `₹${(driver.monthlySalary || 20000).toLocaleString('en-IN')}`
                          : `₹${driver.hourlyRate}`}
                        <span className="text-xs text-neutral-500 font-sans font-medium ml-1">
                          {isPermanent ? '/ month' : '/ hr'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-neutral-500">
                        {isPermanent ? '26 Days · 8-10 Hrs' : 'Min 3 Hours'}
                      </span>
                    </div>
                  </div>

                  {/* Off-Duty Notice when Driver is Offline */}
                  {!isAvailable && (
                    <div className="p-2.5 bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs flex items-center gap-2">
                      <Info className="w-4 h-4 text-neutral-500 shrink-0" />
                      <span className="text-[11px] leading-tight">
                        Driver is off-duty / resting. Calls paused to respect their personal time.
                      </span>
                    </div>
                  )}
                </div>

                {/* Minimalist Action Buttons */}
                <div className="p-4 pt-0 mt-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenBooking(driver)}
                    className="flex-1 py-2.5 px-3 bg-neutral-950 hover:bg-[#FF5500] hover:text-black text-white font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{isPermanent ? 'Inquire / Hire' : 'Book Ride'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Call Button (Disabled if driver is offline) */}
                  {isAvailable ? (
                    <a
                      href={`tel:${driver.phone}`}
                      className="px-3 py-2.5 border border-neutral-300 hover:border-black text-neutral-900 transition-colors flex items-center gap-1 text-xs font-bold"
                      title={`Call ${driver.name}`}
                    >
                      <Phone className="w-3.5 h-3.5 text-[#FF5500]" />
                      <span className="hidden sm:inline text-[11px]">Call</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="px-3 py-2.5 border border-neutral-200 text-neutral-400 bg-neutral-100 cursor-not-allowed flex items-center gap-1 text-xs font-bold"
                      title="Driver is currently offline"
                    >
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="hidden sm:inline text-[11px]">Offline</span>
                    </button>
                  )}

                  {/* WhatsApp Button (Disabled if driver is offline) */}
                  {isAvailable ? (
                    <a
                      href={`https://wa.me/${driver.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(driver.name)},%20I%20would%20like%20to%20hire%20you%20as%20a%20driver%20in%20Hyderabad%20via%20Mana%20Driver.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 border border-neutral-300 hover:border-emerald-600 text-neutral-900 hover:text-emerald-600 transition-colors flex items-center gap-1 text-xs font-bold"
                      title={`WhatsApp ${driver.name}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline text-[11px]">WhatsApp</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="px-3 py-2.5 border border-neutral-200 text-neutral-400 bg-neutral-100 cursor-not-allowed flex items-center gap-1 text-xs font-bold"
                      title="Driver is currently offline"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="hidden sm:inline text-[11px]">Paused</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {allFilteredDriversCount === 0 && (
          <div className="text-center py-12 bg-white border border-neutral-200 p-8 space-y-3">
            <p className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              No drivers match your current filter
            </p>
            <p className="text-xs text-neutral-500">
              Try searching a different area or turn off "Show Available Drivers Only"
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedDriverType('all');
                setSelectedLocality('All');
                setSearchQuery('');
                setOnlyAvailable(false);
              }}
              className="mt-2 px-4 py-2 bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>

      {/* =========================================================================
          5. TRANSPARENT PRICING SECTION (#pricing)
         ========================================================================= */}
      <section id="pricing" className="pt-4 scroll-mt-24 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] font-black mb-1">
              [ REALISTIC HYDERABAD MARKET RATES ]
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
              Transparent Driver Rates
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              No surge prices or middleman commission. Pay the driver directly in cash or UPI.
            </p>
          </div>
        </div>

        {/* 1. FREELANCE HOURLY DRIVING RATES */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#FF5500]" />
            <h3 className="text-lg font-black uppercase tracking-tight text-neutral-950">
              1. Freelance Driving Rates (Hourly / On-Demand)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  FLAT HOURLY RATE
                </div>
                <h4 className="text-base font-black uppercase tracking-tight text-neutral-950">
                  Hourly City Driving
                </h4>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  Flat hourly rate for any personal car (Manual or Automatic). Office rides, shopping runs, doctor visits, and traffic relief.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-neutral-100">
                <div className="text-2xl font-black text-neutral-950 font-mono">₹160 – ₹180</div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  PER HOUR · 3 HR MINIMUM
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  AIRPORT TRANSFER
                </div>
                <h4 className="text-base font-black uppercase tracking-tight text-neutral-950">
                  RGIA Airport Pickup / Drop
                </h4>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  On-time doorstep airport transfers to Rajiv Gandhi International Airport Shamshabad. Flight tracking and luggage help.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-neutral-100">
                <div className="text-2xl font-black text-neutral-950 font-mono">Fixed ₹550</div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  PER AIRPORT TRIP · 24/7 SERVICE
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  OUTSTATION HIRE
                </div>
                <h4 className="text-base font-black uppercase tracking-tight text-neutral-950">
                  Outstation & Highway Trip
                </h4>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  Full-day long-distance highway travel across Telangana & AP (Vijayawada, Warangal, Srisailam, Tirupati) with safe night drivers.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-neutral-100">
                <div className="text-2xl font-black text-neutral-950 font-mono">₹1,400 – ₹1,800</div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  PER DAY + DRIVER FOOD/STAY
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PERMANENT MONTHLY DRIVER SALARIES */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-neutral-950" />
            <h3 className="text-lg font-black uppercase tracking-tight text-neutral-950">
              2. Permanent Drivers (Monthly / Full-Time Salaries)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
              <div>
                <div className="inline-block px-2.5 py-0.5 bg-neutral-100 text-neutral-800 text-[10px] font-black uppercase tracking-wider mb-2">
                  STANDARD MONTHLY CHAUFFEUR
                </div>
                <h4 className="text-lg font-black uppercase tracking-tight text-neutral-950">
                  Personal & Family Driver
                </h4>
                <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                  Dedicated driver for your household. 8 to 9 hours daily, 26 days per month. Daily office drop & pickup, school transport, and family errands.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-neutral-100 flex items-end justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-neutral-950 font-mono">
                    ₹18,000 – ₹22,000
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    PER MONTH · DIRECT PAYMENT
                  </div>
                </div>
                <a
                  href="#drivers"
                  onClick={() => setSelectedDriverType('permanent')}
                  className="text-xs font-black uppercase tracking-wider text-[#FF5500] hover:underline"
                >
                  View Permanent Drivers →
                </a>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
              <div>
                <div className="inline-block px-2.5 py-0.5 bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider mb-2">
                  EXECUTIVE & CORPORATE CHAUFFEUR
                </div>
                <h4 className="text-lg font-black uppercase tracking-tight text-neutral-950">
                  Full-Time Executive Chauffeur
                </h4>
                <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                  Uniformed, English/Telugu speaking private chauffeur for business founders, executives, and senior leaders. 10 to 12 hours daily with flexible corporate standby.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-neutral-100 flex items-end justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-neutral-950 font-mono">
                    ₹22,000 – ₹26,000
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    PER MONTH · DIRECT PAYMENT
                  </div>
                </div>
                <a
                  href="#drivers"
                  onClick={() => setSelectedDriverType('permanent')}
                  className="text-xs font-black uppercase tracking-wider text-[#FF5500] hover:underline"
                >
                  View Permanent Drivers →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 3. DEDICATED DRIVER ONBOARDING MODEL BANNER */}
        <div className="mt-6 bg-[#0A0A0A] border-l-4 border-[#FF5500] p-6 sm:p-7 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#FF5500] font-black">
              <span>FOR DRIVERS SEEKING BOOKINGS</span>
            </div>
            <h4 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white leading-tight">
              Join Mana Driver: ₹49 (Freelance) · ₹99 (Permanent) · 3 Months Free
            </h4>
            <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
              Register as a Freelance Driver for ₹49 or Permanent Driver for ₹99. Your profile and mobile number are displayed on the homepage immediately for direct bookings. 3 full months 100% free, then ₹99/month to stay active. 0% trip commission.
            </p>
          </div>
          {onSwitchToDriver && (
            <button
              type="button"
              onClick={onSwitchToDriver}
              className="shrink-0 px-6 py-3.5 bg-[#FF5500] hover:bg-[#E04B00] text-black font-black text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-xs"
            >
              <span>Driver Registration (From ₹49)</span>
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
