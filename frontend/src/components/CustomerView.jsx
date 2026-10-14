import { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  ArrowRight,
  Phone,
  Check,
  MessageCircle,
  ArrowUpRight,
  Plus,
  X,
} from 'lucide-react';

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

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Direct Contact Driver Modal (for circular ↗ button)
  const [contactDriverModal, setContactDriverModal] = useState(null);

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

  const availableCount = drivers.filter((d) => d.status === 'Available').length;

  const faqs = [
    {
      question: 'How fast will the driver reach my home?',
      answer:
        'In areas like Hitec City, Gachibowli, and Jubilee Hills, your driver arrives within 30 minutes of booking.',
    },
    {
      question: 'Do you charge extra for automatic cars or SUVs?',
      answer:
        'No. All our drivers drive both manual and automatic cars. The price stays the exact same for any car model.',
    },
    {
      question: 'How do I pay the driver?',
      answer:
        'Pay the driver directly with UPI (PhonePe, Google Pay, Paytm) or cash after your trip. Mana Drivers takes ₹0 commission.',
    },
    {
      question: 'Can I get a full-time driver on a monthly salary?',
      answer:
        'Yes. Choose a permanent driver for 8 to 9 hours daily. Typical monthly salary is ₹18,000 to ₹22,000.',
    },
    {
      question: 'Are all drivers police verified?',
      answer:
        'Yes. Every driver has an Aadhaar ID check, valid driving license check, and police background check.',
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
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* =========================================================================
          1. HERO SECTION (NOVA REFERENCE PAGE 1)
          Clean, open, breathable hero with left-aligned bold typography
         ========================================================================= */}
      <section className="pt-6 sm:pt-14 pb-8 sm:pb-16 max-w-4xl">
        {/* Eyebrow */}
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500 mb-6 sm:mb-8">
          PERSONAL CAR DRIVERS · HYDERABAD
        </p>

        {/* Large Display Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-950 leading-[1.08] mb-6 sm:mb-8 font-sans">
          Drivers for your <br className="hidden sm:inline" />
          personal car
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-neutral-600 font-normal leading-relaxed max-w-2xl mb-8 sm:mb-10">
          Hire trusted drivers by the hour or by the month in Hyderabad. Doorstep pickup in 30 minutes.
        </p>

        {/* Action Buttons: Solid Black Pill + Bordered Pill */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-14 sm:mb-20">
          <a
            href="#drivers"
            className="inline-flex items-center justify-center px-7 py-3.5 bg-[#111111] hover:bg-neutral-800 text-white rounded-full text-sm font-medium transition-all shadow-xs"
          >
            Find a Driver
          </a>
          <button
            type="button"
            onClick={onSwitchToDriver}
            className="inline-flex items-center justify-center px-7 py-3.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-900 rounded-full text-sm font-medium transition-all"
          >
            Driver Portal
          </button>
        </div>

        {/* Social Proof Strip */}
        <div className="pt-8 border-t border-neutral-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-xs text-neutral-500">
            <span className="font-semibold text-neutral-400 uppercase tracking-wider shrink-0">
              Trusted in
            </span>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 sm:gap-x-7 font-medium text-neutral-700 tracking-wider text-xs">
              <span>HITEC CITY</span>
              <span>GACHIBOWLI</span>
              <span>JUBILEE HILLS</span>
              <span>BANJARA HILLS</span>
              <span>KONDAPUR</span>
              <span>MADHAPUR</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. DARK STATS SECTION (NOVA REFERENCE PAGE 2)
          A dark charcoal/black rounded-3xl container with 4-column metric grid
         ========================================================================= */}
      <section className="bg-[#121212] text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl overflow-hidden">
        {/* 4-Metric Grid with Hairline Dividers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-neutral-800 pb-10 sm:pb-14 border-b border-neutral-800">
          <div className="md:px-8 first:pl-0">
            <div className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-2 font-sans">
              15,000+
            </div>
            <div className="text-xs sm:text-sm text-neutral-400 font-normal">
              Trips done
            </div>
          </div>
          <div className="md:px-8">
            <div className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-2 font-sans">
              30 mins
            </div>
            <div className="text-xs sm:text-sm text-neutral-400 font-normal">
              Pickup time
            </div>
          </div>
          <div className="md:px-8">
            <div className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-2 font-sans">
              100%
            </div>
            <div className="text-xs sm:text-sm text-neutral-400 font-normal">
              Police checked
            </div>
          </div>
          <div className="md:px-8 last:pr-0">
            <div className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-2 font-sans">
              ₹0
            </div>
            <div className="text-xs sm:text-sm text-neutral-400 font-normal">
              Extra fees
            </div>
          </div>
        </div>

        {/* Narrative Block in Simple English */}
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

      {/* =========================================================================
          3. VISUAL SHOWCASE & SERVICES (NOVA REFERENCE PAGE 3 & 4)
         ========================================================================= */}
      <section id="services" className="space-y-12">
        {/* Visual Showcase Card */}
        <div className="relative rounded-3xl overflow-hidden min-h-[300px] sm:min-h-[400px] bg-neutral-900 flex flex-col justify-end p-6 sm:p-10 text-white shadow-xl group">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=85"
            alt="Personal car driver in Hyderabad"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-60 group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <div className="relative z-10 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-300 block mb-2">
                PERSONAL CAR DRIVERS
              </span>
              <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                A verified driver for your personal car
              </h3>
            </div>
            <a
              href="#drivers"
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-neutral-900 flex items-center justify-center transition-all shrink-0"
              aria-label="Find a driver"
            >
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Section Header: Our Services */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4">
          <div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 font-sans mb-3">
              Our services
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 max-w-xl">
              Hourly rides or full-time monthly drivers. Flat rates for all cars.
            </p>
          </div>
          <a
            href="#pricing"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors shrink-0"
          >
            <span>See all pricing</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Numbered Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {services.map((service) => (
            <div
              key={service.number}
              className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold text-neutral-400">
                    {service.number}.
                  </span>
                  <div className="w-9 h-9 rounded-full bg-neutral-100 group-hover:bg-[#111111] group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-950 mb-2 font-sans">
                  {service.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed font-normal mb-6">
                  {service.description}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-950 text-sm">{service.rate}</span>
                <span className="text-neutral-500">{service.min}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. PEOPLE WHO CREATE VALUE (OUR DRIVERS)
         ========================================================================= */}
      <section className="bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-12 lg:p-14 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Driver Photo */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/5] bg-neutral-100">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
              alt="Verified driver in Hyderabad"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-xl p-3 border border-neutral-200/80 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-neutral-900">Verified Driver</p>
                <p className="text-[11px] text-neutral-500">Manual &amp; Automatic Expert</p>
              </div>
            </div>
          </div>

          {/* Right: Story & Drivers */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500">
              OUR DRIVERS
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 font-sans leading-tight">
              Trusted drivers for your car
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
              Friendly, polite, and verified drivers who take good care of your car. Every driver is checked for safety and drives any car brand.
            </p>

            {/* Overlapping Avatars */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex -space-x-2">
                <img
                  className="w-9 h-9 rounded-full object-cover border-2 border-white ring-1 ring-neutral-200"
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
                  alt="Driver Ramesh"
                />
                <img
                  className="w-9 h-9 rounded-full object-cover border-2 border-white ring-1 ring-neutral-200"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
                  alt="Driver Amit"
                />
                <img
                  className="w-9 h-9 rounded-full object-cover border-2 border-white ring-1 ring-neutral-200"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Driver Sunitha"
                />
              </div>
              <span className="text-sm font-bold text-neutral-900">
                10+ verified drivers on call
              </span>
            </div>

            {/* Simple Check List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-900" />
                </div>
                <span>Police checked &amp; valid driving license</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-900" />
                </div>
                <span>Drives both manual and automatic cars</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-900" />
                </div>
                <span>Quick 30-minute pickup at your doorstep</span>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="#drivers"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-[#111111] hover:bg-neutral-800 text-white rounded-full text-sm font-medium transition-all shadow-xs"
              >
                Meet the drivers
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. MINIMALIST DRIVER ROSTER & FILTER SYSTEM (#drivers)
         ========================================================================= */}
      <section id="drivers" className="space-y-8 scroll-mt-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500 mb-2">
              HYDERABAD DRIVERS
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 font-sans">
              Choose your verified driver
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">
              Call or message drivers directly. Pay them direct with zero commission.
            </p>
          </div>

          {/* Quick Counter */}
          <div className="text-xs font-medium text-neutral-500">
            Showing <span className="font-bold text-neutral-900">{filteredDrivers.length}</span> of {drivers.length} drivers ·{' '}
            <span className="text-emerald-700 font-bold">{availableCount} Available Now</span>
          </div>
        </div>

        {/* Minimalist Segmented Filter Bar */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 space-y-4 shadow-xs">
          {/* Row 1: Category Filter Pills + Available Now Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Pill Tabs: All Drivers | Freelance | Permanent */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-full shrink-0">
              <button
                type="button"
                onClick={() => setSelectedDriverType('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedDriverType === 'all'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                All Drivers ({drivers.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedDriverType('freelance')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedDriverType === 'freelance'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Freelance (Hourly)
              </button>
              <button
                type="button"
                onClick={() => setSelectedDriverType('permanent')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedDriverType === 'permanent'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Permanent (Monthly)
              </button>
            </div>

            {/* Available Only Toggle Switch */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-neutral-700 select-none">
              <span className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-900" />
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Show Available Now Only</span>
              </span>
            </label>
          </div>

          {/* Row 2: Search Input & Locality Pills */}
          <div className="pt-3 border-t border-neutral-100 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by driver name, area, or languages..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-full text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
              />
            </div>

            {/* Locality Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedLocality('All')}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap font-medium transition-colors ${
                  selectedLocality === 'All'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                All Localities
              </button>
              {['Hitec City', 'Gachibowli', 'Jubilee Hills', 'Banjara Hills', 'Kondapur'].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setSelectedLocality(loc)}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap font-medium transition-colors ${
                    selectedLocality === loc
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Minimalist Driver Cards Grid */}
        {filteredDrivers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3">
            <p className="text-base font-bold text-neutral-900">No matching drivers found</p>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Try choosing another area or turn off "Show Available Now Only".
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedDriverType('all');
                setSelectedLocality('All');
                setSearchQuery('');
                setOnlyAvailable(false);
              }}
              className="mt-2 px-5 py-2 bg-neutral-900 text-white text-xs font-medium rounded-full"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrivers.map((driver) => {
              const isAvailable = driver.status === 'Available';
              const isPermanent = driver.driverType === 'permanent';

              return (
                <div
                  key={driver.id}
                  className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden group ${
                    isAvailable
                      ? 'border-neutral-200/90 hover:border-neutral-400 hover:shadow-md'
                      : 'border-neutral-200 opacity-75 bg-neutral-50/50'
                  }`}
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Top Row: Square Portrait + Status + Experience */}
                    <div className="flex items-start gap-4">
                      {/* Driver Square Photo with Live Dot */}
                      <div className="relative shrink-0">
                        <img
                          src={driver.photo}
                          alt={driver.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover object-top border border-neutral-200"
                        />
                        <span
                          className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
                          }`}
                          title={isAvailable ? 'Available Now' : 'Currently Offline'}
                        />
                      </div>

                      {/* Driver Basic Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-0.5">
                          <span className="font-semibold text-neutral-900">
                            {driver.experience} Yrs Exp
                          </span>
                          <span>·</span>
                          <span className="truncate">
                            {isPermanent ? 'Permanent' : 'Freelance'}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-neutral-950 truncate font-sans">
                          {driver.name}
                        </h3>

                        {/* Status Label */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`text-[11px] font-medium ${
                              isAvailable ? 'text-emerald-700' : 'text-neutral-500'
                            }`}
                          >
                            {isAvailable ? 'Available Now' : 'Currently Off-Duty'}
                          </span>
                        </div>

                        {/* Spoken Languages */}
                        <p className="text-xs text-neutral-500 truncate mt-1">
                          {driver.languages || 'Telugu, Hindi, English'}
                        </p>
                      </div>
                    </div>

                    {/* Service Area */}
                    <div className="pt-2 flex items-center gap-1.5 text-xs text-neutral-600">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{driver.location}</span>
                    </div>

                    {/* Transparent Pricing: Flat Rate with Zero Car Categories */}
                    <div className="pt-3 border-t border-neutral-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-xl font-bold text-neutral-950 font-sans">
                          {isPermanent
                            ? `₹${(driver.monthlySalary || 20000).toLocaleString('en-IN')}`
                            : `₹${driver.hourlyRate || 180}`}
                        </span>
                        <span className="text-xs text-neutral-500 ml-1">
                          {isPermanent ? '/ month' : '/ hour'}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500">
                        {isPermanent ? '8–9 hrs/day' : '3 hr minimum'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Row: Solid Black Pill + Circular Arrow Button (↗) */}
                  <div className="p-4 sm:p-5 pt-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenBooking(driver)}
                      disabled={!isAvailable}
                      className={`flex-1 py-2.5 px-4 rounded-full text-xs font-medium text-center transition-all ${
                        isAvailable
                          ? 'bg-[#111111] hover:bg-neutral-800 text-white shadow-xs'
                          : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      {isAvailable ? 'Book Driver' : 'Off-Duty'}
                    </button>

                    {/* Circular ↗ Arrow Button for Direct Contact */}
                    <button
                      type="button"
                      onClick={() => setContactDriverModal(driver)}
                      className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-[#111111] hover:text-white text-neutral-900 flex items-center justify-center transition-colors shrink-0"
                      title={`Call or WhatsApp ${driver.name}`}
                      aria-label={`Contact ${driver.name}`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================================
          6. PRICING SECTION
         ========================================================================= */}
      <section id="pricing" className="space-y-8 scroll-mt-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500 mb-2">
            TRANSPARENT RATES
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 font-sans">
            Simple, honest pricing
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-2">
            One fair price for all cars. No higher charge for SUVs, automatics, or luxury cars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Hourly Freelance */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                Hourly · On-Demand
              </span>
              <h3 className="text-xl font-bold text-neutral-950 font-sans">
                Hourly City Driver
              </h3>
              <div className="pt-2">
                <span className="text-4xl font-bold text-neutral-950 font-sans">₹160 – ₹180</span>
                <span className="text-xs text-neutral-500 block mt-1">/ hour · 3 hour minimum</span>
              </div>
              <ul className="space-y-2.5 text-xs text-neutral-600 pt-2 font-normal">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                  <span>Doorstep pickup in 30 minutes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                  <span>Drives manual and automatic cars</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                  <span>Zero surge charges during rush hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                  <span>Pay driver directly via UPI</span>
                </li>
              </ul>
            </div>
            <a
              href="#drivers"
              onClick={() => setSelectedDriverType('freelance')}
              className="w-full py-3 bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-900 text-xs font-medium rounded-full text-center transition-all"
            >
              Find hourly driver
            </a>
          </div>

          {/* Card 2: RGIA Airport Transfer */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                Flat Rate · Airport
              </span>
              <h3 className="text-xl font-bold text-neutral-950 font-sans">
                Airport Ride
              </h3>
              <div className="pt-2">
                <span className="text-4xl font-bold text-neutral-950 font-sans">₹600 – ₹800</span>
                <span className="text-xs text-neutral-500 block mt-1">Flat fare per one-way trip</span>
              </div>
              <ul className="space-y-2.5 text-xs text-neutral-600 pt-2 font-normal">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                  <span>On-time pickup for RGIA flights</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                  <span>Day or late-night trips</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                  <span>Safe highway driving on ORR</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                  <span>Helps with your luggage</span>
                </li>
              </ul>
            </div>
            <a
              href="#drivers"
              className="w-full py-3 bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-900 text-xs font-medium rounded-full text-center transition-all"
            >
              Book airport driver
            </a>
          </div>

          {/* Card 3: Monthly Permanent Driver */}
          <div className="bg-white rounded-2xl border-2 border-neutral-950 p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-md">
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#FF5500] font-bold">
                Most Popular · Dedicated
              </span>
              <h3 className="text-xl font-bold text-neutral-950 font-sans">
                Monthly Driver
              </h3>
              <div className="pt-2">
                <span className="text-4xl font-bold text-neutral-950 font-sans">₹18k – ₹22k</span>
                <span className="text-xs text-neutral-500 block mt-1">/ month · 8–9 hrs daily</span>
              </div>
              <ul className="space-y-2.5 text-xs text-neutral-600 pt-2 font-normal">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                  <span>Dedicated driver for your family</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                  <span>Full police &amp; license verified</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                  <span>3-day trial before you confirm</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                  <span>Zero monthly platform fee</span>
                </li>
              </ul>
            </div>
            <a
              href="#drivers"
              onClick={() => setSelectedDriverType('permanent')}
              className="w-full py-3 bg-[#111111] hover:bg-neutral-800 text-white text-xs font-medium rounded-full text-center transition-all"
            >
              Find monthly driver
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FREQUENTLY ASKED QUESTIONS (SHORT, SIMPLE WORDS)
         ========================================================================= */}
      <section id="faq" className="space-y-8 scroll-mt-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500 mb-2">
            COMMON QUESTIONS
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 font-sans">
            Frequently asked questions
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-2">
            Quick answers about booking, verification, and payment.
          </p>
        </div>

        {/* Minimalist Accordion Cards */}
        <div className="space-y-3 max-w-4xl">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.question}
                className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-semibold text-neutral-950 text-sm sm:text-base hover:text-neutral-700 transition-colors"
                >
                  <span>{faq.question}</span>
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                    {isOpen ? (
                      <X className="w-4 h-4 text-neutral-900" />
                    ) : (
                      <Plus className="w-4 h-4 text-neutral-900" />
                    )}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal border-t border-neutral-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          8. REVIEWS
         ========================================================================= */}
      <section className="space-y-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500 mb-2">
            CUSTOMER REVIEWS
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 font-sans">
            Reviews from car owners
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-2">
            See how easy it is to hire verified drivers across Hyderabad.
          </p>
        </div>

        {/* Minimal Quote Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.author}
              className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:shadow-md transition-all"
            >
              <p className="text-sm text-neutral-700 leading-relaxed font-normal">
                "{rev.quote}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <img
                  src={rev.avatar}
                  alt={rev.author}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-neutral-950 font-sans">
                    {rev.author}
                  </h4>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    {rev.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          9. DARK CTA CONTAINER
         ========================================================================= */}
      <section className="bg-[#111111] text-white rounded-3xl p-10 sm:p-16 lg:p-20 text-center shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-neutral-400">
            — RELAX IN YOUR OWN CAR —
          </p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-sans leading-tight">
            Ready to hire a driver?
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto font-normal leading-relaxed">
            Book a trusted personal driver today in Hyderabad. Pay direct with zero extra fees.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#drivers"
              className="px-8 py-3.5 bg-white text-neutral-950 hover:bg-neutral-100 rounded-full text-sm font-medium transition-all shadow-md"
            >
              Find a Driver
            </a>
            <button
              type="button"
              onClick={onSwitchToDriver}
              className="px-8 py-3.5 bg-transparent hover:bg-white/10 border border-neutral-700 text-white rounded-full text-sm font-medium transition-all"
            >
              Join as a Driver
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          DIRECT CONTACT MODAL (for circular ↗ button on Driver Cards)
         ========================================================================= */}
      {contactDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-neutral-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={contactDriverModal.photo}
                  alt={contactDriverModal.name}
                  className="w-14 h-14 rounded-xl object-cover border border-neutral-200"
                />
                <div>
                  <h3 className="font-bold text-base text-neutral-950 font-sans">
                    {contactDriverModal.name}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {contactDriverModal.location}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {contactDriverModal.driverType === 'permanent'
                      ? `₹${(contactDriverModal.monthlySalary || 20000).toLocaleString('en-IN')}/mo`
                      : `₹${contactDriverModal.hourlyRate || 180}/hr`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setContactDriverModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl text-xs text-neutral-600 leading-relaxed">
              Connect directly with zero commission. Call or message {contactDriverModal.name} directly.
            </div>

            <div className="space-y-2.5">
              <a
                href={`tel:${contactDriverModal.phone || '+919876543210'}`}
                className="w-full py-3 bg-[#111111] hover:bg-neutral-800 text-white rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Call {contactDriverModal.name} ({contactDriverModal.phone || '+91 98765 43210'})</span>
              </a>

              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(
                  `Hi ${contactDriverModal.name}, I found your profile on Mana Drivers. Are you available for a driving trip in Hyderabad?`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Message</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const d = contactDriverModal;
                  setContactDriverModal(null);
                  onOpenBooking(d);
                }}
                className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full text-xs font-medium transition-colors"
              >
                Schedule &amp; Book via Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
