import { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  ArrowRight,
  Check,
  ArrowUpRight,
  Plus,
  X,
  Plane,
  Briefcase,
  Key,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function CustomerView({
  drivers = [],
  onOpenBooking,
  onSwitchToDriver,
}) {
  // Driver Type filter: 'all' | 'freelance' | 'permanent'
  const [selectedDriverType, setSelectedDriverType] = useState('all');
  const [selectedLocality] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

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
          d.location.toLowerCase().includes(q) ||
          (d.languages && d.languages.toLowerCase().includes(q))
        );
      });
  }, [drivers, selectedDriverType, selectedLocality, onlyAvailable, searchQuery]);

  const handleInitiateDriverAction = (driver) => {
    onOpenBooking(driver);
  };

  const faqs = [
    {
      question: 'How fast will the driver reach my home?',
      answer:
        'In areas like Hitec City, Gachibowli, and Jubilee Hills, your driver arrives within 30 minutes of booking.',
    },
    {
      question: 'Do drivers have a 3-month free trial on Mana Drivers?',
      answer:
        'Yes! All newly approved verified drivers receive a 90-day (3-month) free trial listing on our homepage directory.',
    },
    {
      question: 'Do you charge extra for automatic cars or SUVs?',
      answer:
        'No. All our drivers drive both manual and automatic cars. The price stays the exact same for any car model.',
    },
    {
      question: 'How do I pay the driver?',
      answer:
        'Pay the driver directly with UPI (PhonePe, Google Pay, Paytm) or cash after your trip. Mana Drivers takes ₹0 commission from trip fares.',
    },
    {
      question: 'Can I get a full-time driver on a monthly salary?',
      answer:
        'Yes. Choose a permanent driver for 8 to 9 hours daily. Typical monthly salary is ₹18,000 to ₹22,000.',
    },
    {
      question: 'Are all drivers verified with Aadhaar and License?',
      answer:
        'Yes. Every driver undergoes mandatory Aadhaar ID verification and driving license background checks before going live on Mana Drivers.',
    },
  ];

  const services = [
    {
      number: '01',
      title: 'Hourly City Ride',
      rate: '₹160 – ₹180 / hr',
      min: '3 hr minimum',
      description:
        'Easy rides for office commutes, shopping, doctor visits, and family dinners in your car.',
    },
    {
      number: '02',
      title: 'Airport Drop & Pickup',
      rate: '₹600 – ₹800 flat',
      min: 'One-way flat fare',
      description:
        'On-time rides to and from RGIA Shamshabad in your car. Day or night trips.',
    },
    {
      number: '03',
      title: 'Monthly Family Driver',
      rate: '₹18,000 – ₹22,000 / mo',
      min: '8–9 hrs daily · 6 days/wk',
      description:
        'Dedicated driver for daily office, school drops, and family needs. Polite and punctual.',
    },
    {
      number: '04',
      title: 'Outstation Highway Trip',
      rate: '₹1,400 – ₹1,800 / day',
      min: 'Day trip allowance',
      description:
        'Safe highway driving for weekend trips and temple visits to Srisailam or Vijayawada.',
    },
  ];

  const reviews = [
    {
      quote:
        'Ramesh reached Cyber Towers in 25 minutes. He drove my Fortuner very smoothly in heavy traffic. Great experience and zero extra fees.',
      author: 'Vikram Reddy',
      title: 'Hitec City · Fortuner Owner',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    {
      quote:
        'We hired Suresh as our monthly family driver in Jubilee Hills. Always on time, polite, and very safe with elderly parents.',
      author: 'Dr. Ananya Rao',
      title: 'Jubilee Hills · Honda City Owner',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    },
    {
      quote:
        'Now I take my own car to late-night dinners without worrying about traffic or parking. Very reliable service.',
      author: 'Karthik Varma',
      title: 'Banjara Hills · BMW Owner',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  ];

  return (
    <div className="w-full pb-16">
      {/* HERO SECTION WITH BACKGROUND IMAGE & MODERN GLASSMORPHISM */}
      <section className="relative w-full rounded-none overflow-hidden bg-neutral-950 border-b border-neutral-200/80 shadow-md">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/aistudio/pexels-introspectivedsgn-9195126_1f82dc4d.jpg"
            alt="Private car driver in Hyderabad"
            className="w-full h-full object-cover object-center scale-105 transform motion-safe:transition-transform motion-safe:duration-10000 motion-safe:hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/95 via-neutral-950/85 to-neutral-950/50 sm:to-neutral-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/40 sm:hidden" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-8 sm:pb-16 flex flex-col lg:flex-row lg:items-center justify-between gap-8 sm:gap-10">
          <div className="max-w-2xl text-white space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-neutral-200 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
              <span>HYDERABAD'S PREMIER DRIVER NETWORK</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12] font-sans drop-shadow-sm">
              Professional drivers for your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-[#FF884D]">
                personal car
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-neutral-300 font-normal leading-relaxed max-w-xl">
              Hire verified private drivers by the hour or by the month in Hyderabad. Doorstep pickup in 30 minutes for office commutes, airport runs, or outstation family trips.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 sm:pt-2">
              <a
                href="#drivers"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 sm:py-4 bg-[#FF5500] hover:bg-[#E04B00] active:scale-95 text-white rounded-full text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-[#FF5500]/30 hover:shadow-xl hover:shadow-[#FF5500]/40 text-center"
              >
                <span>Find a Driver Nearby</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={onSwitchToDriver}
                className="inline-flex items-center justify-center px-7 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/20 text-white rounded-full text-xs sm:text-sm font-medium transition-all text-center"
              >
                Driver Portal (3-Mo Free Trial)
              </button>
            </div>

            <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-neutral-300">
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] sm:text-xs">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Commission</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] sm:text-xs">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Aadhaar & License Verified</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] sm:text-xs">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>30-Min Arrival</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:max-w-xs bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-2xl space-y-3.5 hover:border-white/30 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <div>
                <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Verified Local Fleet
                </p>
                <p className="text-lg sm:text-xl font-bold text-white font-sans">Hyderabad Metro</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FF5500]/20 border border-[#FF5500]/40 flex items-center justify-center text-[#FF5500]">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-neutral-300">Hourly Freelance</span>
                <span className="font-bold text-white">From ₹160/hr</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-neutral-300">Monthly Permanent</span>
                <span className="font-bold text-white">₹18,000 – ₹22,000/mo</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-neutral-300">Driver Trial Offer</span>
                <span className="font-bold text-emerald-400">🎁 3 Months Free</span>
              </div>
            </div>

            <div className="pt-1">
              <p className="text-[10px] sm:text-[11px] text-neutral-400 text-center">
                Manual & Automatic Cars · In-city & Outstation
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full bg-neutral-900/80 backdrop-blur-md border-t border-white/10 text-xs text-neutral-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <span className="font-semibold text-neutral-300 uppercase tracking-wider text-[10px] sm:text-[11px]">
              ACTIVE COVERAGE:
            </span>
            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-6 gap-y-1 font-medium text-neutral-200 text-[11px] sm:text-xs">
              <span>HITEC CITY</span>
              <span>·</span>
              <span>GACHIBOWLI</span>
              <span>·</span>
              <span>JUBILEE HILLS</span>
              <span>·</span>
              <span>BANJARA HILLS</span>
              <span>·</span>
              <span>KONDAPUR</span>
              <span>·</span>
              <span>MADHAPUR</span>
              <span>·</span>
              <span>RGIA AIRPORT</span>
            </div>
          </div>
        </div>
      </section>

      {/* LOWER SECTIONS CONTAINER */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-16 sm:space-y-24 mt-12 sm:mt-16">

      {/* THREE SPECIAL FEATURED SHOWCASE BANNERS (USING USER IMAGE URLS) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Banner 1: Key Handover & Trust */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="relative h-48 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMMIWNMK0CiKRChLI_o_DCXR-kYVqQ6El0dkVBmYrQdZlQfydzjfWYCIA7&s=10"
                alt="Car key handover to verified driver"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3 h-3 text-amber-400" />
                Key Handover Safety
              </div>
            </div>
            <h3 className="text-lg font-bold text-neutral-950 font-sans">
              Hand Your Keys with 100% Peace of Mind
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Every driver undergoes mandatory police verification, Aadhaar check, and driving test before driving your personal car.
            </p>
          </div>
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-900">
            <span>Verified Driver Roster</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        {/* Banner 2: Airport Pickup & Drop (Specified Airport Image) */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="relative h-48 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
              <img
                src="https://expressmulticabz.com/wp-content/uploads/2026/05/airport-pickup-and-drop-service-Hyderabad-1024x576.png"
                alt="Airport pickup and drop service Hyderabad"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Plane className="w-3 h-3 text-blue-400" />
                RGIA Airport Flat Fares
              </div>
            </div>
            <h3 className="text-lg font-bold text-neutral-950 font-sans">
              Airport Pickup & Drop in Your Own Car
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              24/7 on-time driver arrival for RGIA Shamshabad airport runs. Ride comfortably back home after late flights.
            </p>
          </div>
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-900">
            <span>Flat ₹600 – ₹800</span>
            <span className="text-[11px] text-emerald-600 font-bold">24/7 Available</span>
          </div>
        </div>

        {/* Banner 3: Corporate & Office Pickup (Specified Corporate Image) */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="relative h-48 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSG7kH9djSSdt6ljWchCZHMkYwzZzXa5TTAbRasvuhPBw&s"
                alt="Driver picking up corporate client"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3 h-3 text-purple-400" />
                Monthly Executive Chauffeur
              </div>
            </div>
            <h3 className="text-lg font-bold text-neutral-950 font-sans">
              Dedicated Executive & Family Drivers
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Hire permanent monthly chauffeurs for daily office commutes to Financial District, IT Parks & school drops.
            </p>
          </div>
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-900">
            <span>Monthly ₹18k – ₹22k</span>
            <span className="text-[11px] text-purple-700 font-bold">Full-Time</span>
          </div>
        </div>
      </section>

      {/* DARK STATS SECTION */}
      <section className="bg-[#121212] text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-neutral-800 pb-10 sm:pb-14 border-b border-neutral-800">
          <div className="md:px-8 first:pl-0">
            <div className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-2 font-sans">
              100+
            </div>
            <div className="text-xs sm:text-sm text-neutral-400 font-normal">
              Trips completed
            </div>
          </div>
          <div className="md:px-8">
            <div className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-2 font-sans">
              30 mins
            </div>
            <div className="text-xs sm:text-sm text-neutral-400 font-normal">
              Doorstep pickup
            </div>
          </div>
          <div className="md:px-8">
            <div className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-2 font-sans">
              90 Days
            </div>
            <div className="text-xs sm:text-sm text-emerald-400 font-medium">
              Free Trial for Drivers
            </div>
          </div>
          <div className="md:px-8 last:pr-0">
            <div className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-2 font-sans">
              ₹0
            </div>
            <div className="text-xs sm:text-sm text-neutral-400 font-normal">
              Extra hidden fees
            </div>
          </div>
        </div>

        <div className="pt-10 sm:pt-14 max-w-3xl space-y-4">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight font-sans">
            Easy rides in your own car
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-normal">
            Enjoy stress-free travel. Our verified drivers know Hyderabad roads well. Book in minutes and pay the driver directly with zero extra fees.
          </p>
          <div className="pt-2">
            <a
              href="#drivers"
              className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-neutral-300 transition-colors"
            >
              <span>See verified drivers</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* DRIVER ROSTER & FILTERS SECTION */}
      <section id="drivers" className="space-y-8 sm:space-y-12">
        <div className="space-y-4 max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500">
            HYDERABAD CHAUFFEURS
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 font-sans">
            Verified Active Drivers
          </h2>
          <p className="text-sm text-neutral-600">
            Only drivers with active free trials or subscriptions are listed below. Verified with Aadhaar and Driving License.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="space-y-4 bg-white p-4 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 sm:pb-4 border-b border-neutral-100 -mx-1 px-1">
            <button
              type="button"
              onClick={() => setSelectedDriverType('all')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedDriverType === 'all'
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              All Active Drivers ({drivers.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedDriverType('freelance')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedDriverType === 'freelance'
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              Freelance (Hourly)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDriverType('permanent')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedDriverType === 'permanent'
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              Permanent (Monthly)
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-1 sm:pt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
              <input
                type="text"
                placeholder="Search name, area, language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-full text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 rounded-md border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <span>Available Now Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Driver Cards Grid */}
        {filteredDrivers.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-neutral-200/80 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto text-xl font-bold">
              🚗
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-950 font-sans">No Active Drivers Found</h3>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
              Drivers must register and maintain an active subscription or 3-month free trial to appear on the homepage roster.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onSwitchToDriver}
                className="px-6 py-3 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all shadow-xs"
              >
                Register as a Driver (3 Months Free)
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredDrivers.map((driver) => {
              const isPermanent = driver.driverType === 'permanent';
              const isFeatured = driver.subscriptionPlan === 'featured';

              return (
                <div
                  key={driver.id}
                  className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border ${
                    isFeatured ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-neutral-200/80'
                  } hover:border-neutral-400 hover:shadow-xl sm:hover:shadow-2xl hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 shadow-xs flex flex-col justify-between space-y-4 sm:space-y-6 group relative overflow-hidden`}
                >
                  {isFeatured && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-neutral-950 px-4 py-1 rounded-bl-2xl text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3 text-neutral-950" />
                      Featured Chauffeur
                    </div>
                  )}

                  {/* Top Section */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-3.5 sm:gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={driver.photo}
                          alt={driver.name}
                          className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover bg-neutral-100 border border-neutral-200/80"
                        />
                        <span
                          className={`absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white ${
                            driver.status === 'Available' ? 'bg-emerald-500' : 'bg-neutral-400'
                          }`}
                          title={driver.status}
                        />
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="text-base sm:text-xl font-bold tracking-tight text-neutral-950 font-sans truncate">
                              {driver.name}
                            </h3>
                            <span className="p-0.5 bg-emerald-100 text-emerald-800 rounded-full shrink-0" title="Verified Driver">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          </div>

                          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 shrink-0">
                            {isPermanent ? 'Monthly' : 'Hourly'}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-500 font-medium mt-1 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                          <span className="truncate">{driver.location}</span>
                        </p>

                        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 mt-2">
                          <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[11px] shrink-0">
                            {driver.experience} Yrs Exp
                          </span>
                          <span>·</span>
                          <span className="text-neutral-500 text-[11px] truncate">{driver.languages}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2">
                      {driver.bio}
                    </p>
                  </div>

                  {/* Bottom Section */}
                  <div className="pt-3 sm:pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-baseline justify-between sm:block">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block sm:mb-0.5">
                        {isPermanent ? 'Monthly Package' : 'Hourly Rate'}
                      </span>
                      <div className="text-base sm:text-xl font-bold tracking-tight text-neutral-950 font-sans">
                        {isPermanent
                          ? `₹${(driver.monthlySalary || 20000).toLocaleString('en-IN')} / mo`
                          : `₹${driver.hourlyRate || 180} / hr`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleInitiateDriverAction(driver)}
                        className="flex-1 sm:flex-initial text-center justify-center px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 active:scale-[0.98] text-white rounded-full text-xs font-bold transition-all shadow-xs"
                      >
                        Book Driver
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInitiateDriverAction(driver)}
                        className="w-10 h-10 rounded-full border border-neutral-300 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white flex items-center justify-center transition-all shrink-0"
                        title="Direct Contact (Phone & WhatsApp)"
                        aria-label="Direct Contact"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SERVICES SECTION */}
      <section className="space-y-8 sm:space-y-12">
        <div className="space-y-3 max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500">
            TRANSPARENT PRICING
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 font-sans">
            Simple Rates
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <div
              key={s.number}
              className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="text-xs font-bold font-mono text-neutral-400 block">
                  {s.number}
                </span>
                <h3 className="text-lg font-bold text-neutral-950 font-sans">
                  {s.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <div className="text-base font-bold text-neutral-950 font-sans">{s.rate}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">{s.min}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200 space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500">
            HYDERABAD CAR OWNERS
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-950 font-sans">
            Client Reviews
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div key={i} className="p-6 bg-neutral-50 rounded-2xl space-y-4 flex flex-col justify-between border border-neutral-100">
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-normal">
                "{r.quote}"
              </p>
              <div className="pt-2 border-t border-neutral-200/60">
                <div className="text-xs font-bold text-neutral-950">{r.author}</div>
                <div className="text-[11px] text-neutral-500">{r.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}
      <section className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500">
            FREQUENTLY ASKED QUESTIONS
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-950 font-sans">
            Questions & Answers
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-sm font-bold text-neutral-950 font-sans">
                    {faq.question}
                  </span>
                  <span className="p-1 rounded-full bg-neutral-100 text-neutral-700 shrink-0">
                    {isOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 mt-1">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      </div>
    </div>
  );
}
