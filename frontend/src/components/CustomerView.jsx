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
  ChevronRight,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import HeroDriverR3F from './HeroDriverR3F';
import DriverAvatar3D from './DriverAvatar3D';
import { CATEGORIES } from '../data/mockDrivers';

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

  // Helper for category badge colors
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Luxury':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SUV':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Small Car':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Sedan':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  // Filter regular free drivers
  const filteredFreeDrivers = useMemo(() => {
    return drivers
      .filter((d) => !d.isPro)
      .filter((d) => (selectedCategory === 'All' ? true : d.category === selectedCategory))
      .filter((d) => (selectedLocality === 'All' ? true : d.location.toLowerCase().includes(selectedLocality.toLowerCase())))
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
      .filter((d) => (selectedLocality === 'All' ? true : d.location.toLowerCase().includes(selectedLocality.toLowerCase())))
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

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Colorful, Minimalist Hero Section with Animated 3D Chauffeur */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-blue-50/30 to-amber-50/20 px-4 sm:px-8 py-6 sm:py-8 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Value Prop & Simple 3-Step Guide */}
          <div className="lg:col-span-7 space-y-3.5 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-blue-700 border border-blue-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hyderabad · Verified Private Drivers</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Hire a Verified Driver <br className="hidden sm:inline" />
              <span className="text-blue-600">in Hyderabad</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed mx-auto lg:mx-0">
              Hire trusted drivers for your car by the hour. Experienced in Hitec City, Gachibowli, Banjara Hills, Jubilee Hills, and RGIA Airport.
            </p>

            {/* 3-Step Simple Guide for Everyday People */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-[11px] font-semibold text-slate-700 pt-0.5">
              <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>1. Select time</span>
              </span>
              <span className="text-slate-400">→</span>
              <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>2. Enter location</span>
              </span>
              <span className="text-slate-400">→</span>
              <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>3. Confirm driver</span>
              </span>
            </div>

            {/* Search Input */}
            <div className="pt-1 max-w-md mx-auto lg:mx-0">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search driver, car, or area (e.g. Hitec City)..."
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
                />
              </div>
            </div>

            {/* Quick Popular Hyderabad Areas with Colorful Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 pt-0.5 text-[11px]">
              <span className="font-semibold text-slate-600">Areas:</span>
              {[
                { name: 'All', color: 'bg-slate-100 text-slate-700' },
                { name: 'Hitec City', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
                { name: 'Gachibowli', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
                { name: 'Banjara Hills', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                { name: 'Shamshabad', color: 'bg-amber-50 text-amber-800 border-amber-200' },
              ].map((loc) => (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => setSelectedLocality(loc.name)}
                  className={`px-2.5 py-0.5 rounded-lg font-medium transition-all border ${
                    selectedLocality === loc.name
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                      : `${loc.color} hover:bg-white`
                  }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: React Three Fiber Animated 3D Chauffeur Character */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] h-[220px] sm:h-[260px] rounded-3xl bg-gradient-to-b from-blue-50/70 via-white to-amber-50/40 border border-blue-100 p-2 shadow-xs flex flex-col items-center justify-center">
              <HeroDriverR3F />

              {/* Colorful Status Tag */}
              <div className="absolute bottom-2.5 inset-x-3 bg-white/95 backdrop-blur-xs py-1.5 px-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>3D Verified Chauffeur</span>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                  Active Now
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Pills & Toggle */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Only Available Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`py-1 px-3 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                onlyAvailable
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${onlyAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span>Available Drivers Only</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{filteredFreeDrivers.length}</strong> drivers in Hyderabad
          </span>
          {isProUnlocked && (
            <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>All 10+ Drivers Unlocked (₹300 Pass)</span>
            </span>
          )}
        </div>
      </div>

      {/* Streamlined, Colorful Driver Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredFreeDrivers.map((driver) => (
          <div
            key={driver.id}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-xs group"
          >
            <div className="space-y-3">
              {/* Header: 3D Avatar Portrait, Name & Hourly Rate */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <DriverAvatar3D
                    type={driver.avatarType || 'suit'}
                    name={driver.name}
                    isPro={false}
                    size="sm"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-snug">{driver.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      {/* Warm Sunshine Amber Rating Badge */}
                      <div className="inline-flex items-center gap-0.5 text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded font-bold text-[11px] border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{driver.rating}</span>
                      </div>
                      <span aria-hidden="true">·</span>
                      <span>{driver.trips} trips</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-slate-900 tabular-nums">₹{driver.hourlyRate}</span>
                  <span className="text-[11px] text-slate-500 block">/ hour</span>
                </div>
              </div>

              {/* Vehicle & Area Row with Colorful Badges */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span className="flex items-center gap-1.5 truncate">
                    <Car className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{driver.vehicle}</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${getCategoryBadgeClass(driver.category)}`}>
                    {driver.category}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 truncate text-slate-600">
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                    <span className="truncate font-medium">{driver.location}</span>
                  </span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded shrink-0 text-[10px] ${
                      driver.status === 'Available'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {driver.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {driver.bio}
              </p>
            </div>

            {/* Vibrant Action Button */}
            <button
              onClick={() => onOpenBooking(driver)}
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <span>Book Driver</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Paywall Section: Direct Razorpay Checkout (Zero Intermediate Popups) */}
      {!isProUnlocked ? (
        <div className="relative mt-8 rounded-3xl border border-amber-200/90 bg-gradient-to-br from-amber-50/40 via-white to-blue-50/40 p-5 sm:p-7 text-slate-900 shadow-2xs text-center">
          <div className="max-w-md mx-auto space-y-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xs">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>

            <div>
              <span className="inline-block text-[11px] font-bold text-amber-800 bg-amber-100/90 px-3 py-0.5 rounded-full mb-1.5 border border-amber-200">
                Special Hyderabad Offer: ₹300 One-Time
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Unlock All 10+ Hyderabad Drivers for ₹300
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Pay ₹300 once to see direct phone numbers and book all remaining drivers, including airport chauffeurs and outstation experts.
              </p>
            </div>

            {/* Simple Value Badges */}
            <div className="grid grid-cols-2 gap-2 text-left text-[11px] text-slate-700 pt-1">
              <div className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-medium">Direct phone numbers</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-medium">Airport & outstations</span>
              </div>
            </div>

            {/* Direct Razorpay Launch Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenRazorpay}
                className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
              >
                <span>Unlock All Drivers for ₹300</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Direct Razorpay Gateway · Instant UPI & Cards</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Unlocked Section */
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-emerald-900">
                All 10+ Hyderabad Drivers Unlocked Permanently
              </span>
            </div>

            <button
              onClick={onResetPro}
              className="text-[11px] text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md border border-slate-200 bg-white transition-colors"
            >
              Reset Demo
            </button>
          </div>

          {/* Unlocked Drivers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredProDrivers.map((driver) => (
              <div
                key={driver.id}
                className="p-4 rounded-2xl bg-white border border-blue-200 hover:border-blue-400 transition-all flex flex-col justify-between space-y-3 shadow-2xs group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <DriverAvatar3D
                        type={driver.avatarType || 'vip'}
                        name={driver.name}
                        isPro={true}
                        size="sm"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-snug">{driver.name}</h3>
                          <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                            UNLOCKED
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <div className="inline-flex items-center gap-0.5 text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded font-bold text-[11px] border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{driver.rating}</span>
                          </div>
                          <span aria-hidden="true">·</span>
                          <span>{driver.trips} VIP trips</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-slate-900 tabular-nums">₹{driver.hourlyRate}</span>
                      <span className="text-[11px] text-slate-500 block">/ hour</span>
                    </div>
                  </div>

                  {/* Vehicle, Area & Direct Phone */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span className="flex items-center gap-1.5 truncate">
                        <Car className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{driver.vehicle}</span>
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${getCategoryBadgeClass(driver.category)}`}>
                        {driver.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 truncate text-slate-600">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="truncate font-medium">{driver.location}</span>
                      </span>
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded shrink-0 text-[10px] ${
                          driver.status === 'Available'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {driver.status}
                      </span>
                    </div>

                    {driver.phone && (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-bold pt-1.5 border-t border-slate-200">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Direct Phone: {driver.phone}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {driver.bio}
                  </p>
                </div>

                <button
                  onClick={() => onOpenBooking(driver)}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <span>Book Driver</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
