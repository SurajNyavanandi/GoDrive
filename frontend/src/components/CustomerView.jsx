import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  MapPin,
  ArrowRight,
  Check,
  ArrowUpRight,
  Plus,
  X,
  Briefcase,
  ShieldCheck,
  Sparkles,
  Star,
  Clock,
  Car,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { HYDERABAD_LOCALITIES } from '../utils/constants';
import { fetchReviewsApi } from '../utils/api';
import SearchableSelect from './common/SearchableSelect';
import HowToUseSection from './HowToUseSection';
import WhyManaDriversSection from './WhyManaDriversSection';
import ReviewModal from './ReviewModal';

const HYDERABAD_ALL_LOCALITIES = HYDERABAD_LOCALITIES;

export default function CustomerView({
  drivers = [],
  initialService = 'all',
  onOpenBooking,
  onSwitchToDriver,
  pricingSettings,
}) {
  const cityBaseFare = pricingSettings?.cityBaseFare || 700;
  const cityBaseHours = pricingSettings?.cityBaseHours || 4;
  const cityExtraRate = pricingSettings?.cityExtraHourlyRate || 100;
  const nightRate = pricingSettings?.nightSurchargePerHour || 150;
  const outstationRate = pricingSettings?.outstationFlatRate || 2000;
  const interstateRate = pricingSettings?.outstationInterstateRate || 2500;
  // Live Reviews State & Modal
  const [reviewsList, setReviewsList] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewModalDriver, setReviewModalDriver] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadReviews() {
      const data = await fetchReviewsApi();
      if (mounted && Array.isArray(data) && data.length > 0) {
        setReviewsList(data);
      }
    }
    loadReviews();
    return () => { mounted = false; };
  }, []);
  // Sync selectedDriverType based on initialService
  const initialDriverType = useMemo(() => {
    if (initialService === 'hourly' || initialService === 'city') return 'freelance';
    if (initialService === 'monthly' || initialService === 'permanent') return 'permanent';
    return 'all';
  }, [initialService]);

  const [selectedDriverType, setSelectedDriverType] = useState(initialDriverType);
  const [selectedLocality, setSelectedLocality] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Sync state if initialService prop changes
  const [prevService, setPrevService] = useState(initialService);
  if (initialService !== prevService) {
    setPrevService(initialService);
    setSelectedDriverType(initialDriverType);
  }

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Filtered drivers based on approval, active plan, driverType, locality, availability, and search query
  const filteredDrivers = useMemo(() => {
    return drivers
      .filter((d) => d.isApproved !== false)
      .filter((d) => d.subscriptionPlan !== 'expired')
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
      question: 'How fast will the driver reach my doorstep in Hyderabad?',
      answer:
        'In primary tech hubs like Hitec City, Gachibowli, Jubilee Hills, and Kondapur, your verified driver arrives within 30 minutes of booking confirmation.',
    },
    {
      question: 'Do newly registered drivers get a 3-month free trial on Mana Drivers?',
      answer:
        'Yes! All newly approved verified drivers receive an automatic 90-day (3-month) free trial listing. After 3 months, subscription prices are ₹49/month for Freelance drivers, ₹99/month for Permanent drivers, and ₹149/month for Combination (Freelance + Permanent) drivers.',
    },
    {
      question: 'Do you charge extra for luxury SUVs, automatic transmissions, or EV cars?',
      answer:
        'No extra fees whatsoever. All our verified drivers drive both manual and automatic cars across all vehicle classes at transparent fixed rates with direct driver payments.',
    },
    {
      question: 'How do I pay the driver for the trip?',
      answer:
        'Pay the driver directly via UPI (PhonePe, Google Pay, Paytm) or cash after your trip. Mana Drivers takes ₹0 commission from trip fares.',
    },
    {
      question: 'Can I hire a permanent driver on a monthly salary for my family?',
      answer:
        'Yes. Choose a permanent monthly driver for 8, 10, or 12 hours daily. Standard monthly salaries are ₹25,000 (8h), ₹28,000 (10h), and ₹30,000 (12h) with 1 day off per week.',
    },
    {
      question: 'Are all drivers verified with Aadhaar and driving license checks?',
      answer:
        'Yes. Every driver undergoes mandatory Aadhaar identity verification, address check, and driving license background verification before going live.',
    },
  ];

  const today = new Date();
  const realtimeDateStr = today.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const reviews = [
    {
      id: 'rev-1',
      title: 'Arrived in 20 minutes at Cyber Towers for my Fortuner',
      quote:
        'Booked an hourly driver for an urgent client meeting and evening dinner across Hitec City and Jubilee Hills. The driver was punctual, drove my automatic Fortuner smoothly through heavy traffic, and the fixed ₹700 rate for 4 hours was completely honest with zero commission.',
      author: 'Vikram Reddy',
      initials: 'VR',
      carAndArea: 'Hitec City · Toyota Fortuner Owner',
      date: 'Today',
      tripType: '4-Hr City Duty',
      rating: 5,
    },
    {
      id: 'rev-2',
      title: 'Very polite driver and knows every route in Jubilee Hills',
      quote:
        'We needed a reliable driver to take my elderly parents to Apollo Hospital and then for family shopping. Driver Suresh was extremely courteous, helped my mother with wheelchair assistance, and waited patiently. Truly trustworthy.',
      author: 'Dr. Ananya Rao',
      initials: 'AR',
      carAndArea: 'Jubilee Hills · Honda City Owner',
      date: 'Yesterday',
      tripType: 'Hourly Errands',
      rating: 5,
    },
    {
      id: 'rev-3',
      title: 'Highway trip to Srisailam was so relaxed',
      quote:
        'Took my family on a weekend trip to Srisailam. Handed over the keys for our Kia Seltos. The driver kept steady speed on the ghat roads, took good care of the vehicle, and the fixed ₹2,000 outstation rate was very reasonable.',
      author: 'Suresh Goud',
      initials: 'SG',
      carAndArea: 'Kukatpally · Kia Seltos Owner',
      date: '3 days ago',
      tripType: 'Outstation Duty',
      rating: 5,
    },
    {
      id: 'rev-4',
      title: 'Hired our permanent monthly driver with complete peace of mind',
      quote:
        'Needed a full-time driver for daily office commute to Financial District and school pickups. We selected a verified monthly driver on the ₹28,000/month tier (10 hrs/day). Verified Aadhaar and police records gave my family complete safety.',
      author: 'P. Srinivas Rao',
      initials: 'SR',
      carAndArea: 'Gachibowli · Hyundai Creta Owner',
      date: '5 days ago',
      tripType: 'Monthly Driver',
      rating: 5,
    },
    {
      id: 'rev-5',
      title: 'Late-night airport pickup from RGIA Shamshabad',
      quote:
        'My flight landed past 11:00 PM. Booked a driver in advance with the late-night surcharge. He was already waiting at the arrival terminal with my car keys. Drove safely all the way to Begumpet in heavy rain.',
      author: 'Radhika Varma',
      initials: 'RV',
      carAndArea: 'Begumpet · Maruti Brezza Owner',
      date: '1 week ago',
      tripType: 'Airport Night Ride',
      rating: 5,
    },
    {
      id: 'rev-6',
      title: 'Zero commission means fair pay for driver and great service',
      quote:
        'Direct WhatsApp connection with the driver without middleman fees is fantastic. Paid directly through PhonePe UPI right after the trip ended. No haggling or surge pricing.',
      author: 'Mohammed Farooq',
      initials: 'MF',
      carAndArea: 'Banjara Hills · Mahindra XUV700 Owner',
      date: 'Verified Trip',
      tripType: 'City Round Trip',
      rating: 5,
    },
  ];


  const activeReviews = reviewsList.length > 0 ? reviewsList : reviews;

  return (
    <div className="w-full text-neutral-900 bg-[#FAF9F6]">
      {/* =========================================================================
          SECTION 1: HERO SECTION (ULTRA MINIMALIST MODERN)
         ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-[#0A0A0A] border-b border-neutral-800 text-white min-h-130 sm:min-h-145 flex flex-col justify-center pt-24 sm:pt-28 pb-12 sm:pb-16">
        {/* Background Overlay & Smooth Fading Car Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://res.cloudinary.com/dfr0zghtc/image/upload/v1793333461/Business_Driver_Through_the_City_bpfr8c.png"
            alt="Verified private driver driving car in Hyderabad"
            className="w-full h-full object-cover object-right lg:object-center opacity-70 scale-100"
          />
          {/* Edge Fading Gradients for Smooth Text Overlay on Left */}
          <div className="absolute inset-0 bg-linear-to-r from-[#0A0A0A] via-[#0A0A0A]/90 sm:via-[#0A0A0A]/80 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full flex-1 flex flex-col justify-center">
          {/* Main Hero Content - Simple English */}
          <div className="max-w-2xl text-white space-y-6 animate-fade-in-up">
            {/* Minimal Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-neutral-200">
              <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
              <span>Hyderabad Private Car Drivers · 30-Min Doorstep Pickup</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-tight font-sans">
              Hire Verified Drivers for Your Own Car in{' '}
              <span className="text-[#FF5500] font-bold">
                Hyderabad
              </span>
              .
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 font-normal leading-relaxed max-w-xl">
              Hourly rides or full-time monthly drivers across Hyderabad. Driver arrives at your doorstep in 30 minutes. Pay directly to driver with zero extra fees.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full sm:w-auto">
              <a
                href="#drivers"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white hover:bg-neutral-200 active:scale-95 text-neutral-950 rounded-full text-sm font-semibold tracking-tight transition-all shadow-lg min-h-12 w-full sm:w-auto text-center cursor-pointer"
              >
                <span>Book Driver Now</span>
                <ArrowRight className="w-4 h-4 text-neutral-950" />
              </a>

              <button
                type="button"
                onClick={onSwitchToDriver}
                className="inline-flex items-center justify-center px-6 py-4 bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/20 text-white rounded-full text-sm font-semibold tracking-tight transition-all min-h-12 w-full sm:w-auto text-center cursor-pointer"
              >
                <span>Become a Driver (Free Trial)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: ABOUT OUR PLATFORM (MINIMALIST STATS SHOWCASE - SINGLE LINE)
         ========================================================================= */}
      <section id="platform" className="bg-white py-16 sm:py-24 border-b border-neutral-200 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-950 font-sans">
              About our platform
            </h2>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl mx-auto">
              Simple, verified car driver service in Hyderabad. Book directly with zero extra commission and fair transparent rates.
            </p>
          </div>

          {/* Single-line minimalistic stats row */}
          <div className="mt-10 sm:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Box 1: 30 Mins Doorstep Pickup */}
            <div className="flex flex-col items-center justify-center gap-y-2 rounded-2xl bg-neutral-50 border border-neutral-200/90 px-5 py-7 text-center shadow-2xs hover:border-neutral-400 transition-all">
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 font-sans">
                30 Mins
              </p>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                Doorstep Pickup
              </p>
            </div>

            {/* Box 2: 100+ Trips Completed */}
            <div className="flex flex-col items-center justify-center gap-y-2 rounded-2xl bg-neutral-950 border border-neutral-900 px-5 py-7 text-center shadow-xs hover:bg-neutral-900 transition-all">
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                100+
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium">
                Trips Completed
              </p>
            </div>

            {/* Box 3: ₹0 Extra Zero Commission */}
            <div className="flex flex-col items-center justify-center gap-y-2 rounded-2xl bg-neutral-50 border border-neutral-200/90 px-5 py-7 text-center shadow-2xs hover:border-neutral-400 transition-all">
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 font-sans">
                ₹0 Extra
              </p>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                Zero Commission
              </p>
            </div>

            {/* Box 4: 100% Direct Driver Pay */}
            <div className="flex flex-col items-center justify-center gap-y-2 rounded-2xl bg-neutral-950 border border-neutral-900 px-5 py-7 text-center shadow-xs hover:bg-neutral-900 transition-all">
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                100%
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium">
                Direct Driver Pay
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: VERIFIED DRIVER ROSTER & SEARCH (CLEAN STARK WHITE BACKGROUND)
          Placed directly between Hero Section and Coverage Zones Carousel!
         ========================================================================= */}
      <section id="drivers" className="w-full bg-white py-16 sm:py-24 border-b border-neutral-200/90 text-neutral-950 scroll-mt-24 sm:scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5500]/10 text-[#FF5500] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
                <span>Verified Hyderabad Drivers</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-950 font-sans">
                Browse Active Drivers Near You
              </h2>
              <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
                Only active drivers with valid licenses and Aadhaar verification appear below. Select a driver to connect directly.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              <button
                type="button"
                onClick={() => setSelectedDriverType('all')}
                className={`px-4.5 py-2 rounded-full text-xs sm:text-sm font-medium tracking-tight shrink-0 transition-all cursor-pointer ${
                  selectedDriverType === 'all'
                    ? 'bg-neutral-950 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200'
                }`}
              >
                All Drivers ({drivers.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedDriverType('freelance')}
                className={`px-4.5 py-2 rounded-full text-xs sm:text-sm font-medium tracking-tight shrink-0 transition-all cursor-pointer ${
                  selectedDriverType === 'freelance'
                    ? 'bg-neutral-950 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200'
                }`}
              >
                Hourly Freelance
              </button>
              <button
                type="button"
                onClick={() => setSelectedDriverType('permanent')}
                className={`px-4.5 py-2 rounded-full text-xs sm:text-sm font-medium tracking-tight shrink-0 transition-all cursor-pointer ${
                  selectedDriverType === 'permanent'
                    ? 'bg-neutral-950 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200'
                }`}
              >
                Monthly Personal
              </button>
              <button
                type="button"
                onClick={() => setSelectedDriverType('combined')}
                className={`px-4.5 py-2 rounded-full text-xs sm:text-sm font-medium tracking-tight shrink-0 transition-all cursor-pointer ${
                  selectedDriverType === 'combined'
                    ? 'bg-neutral-950 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200'
                }`}
              >
                Combined
              </button>
            </div>
          </div>

          {/* Search & Availability Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#FAF9F6] p-4 rounded-3xl border border-neutral-200/90 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search driver by name, area, or language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-2xl text-xs sm:text-sm font-medium text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 shadow-2xs"
              />
            </div>

            {/* Searchable Locality Dropdown */}
            <div className="w-full lg:w-72">
              <SearchableSelect
                options={[
                  { value: 'All', label: 'All Areas in Hyderabad' },
                  ...HYDERABAD_LOCALITIES.map((loc) => ({ value: loc, label: loc }))
                ]}
                value={selectedLocality}
                onChange={(val) => setSelectedLocality(val)}
                placeholder="Filter by Locality..."
                searchPlaceholder="Search 300+ areas..."
              />
            </div>

            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-neutral-700 cursor-pointer select-none shrink-0 px-2 py-1">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-900"
              />
              <span>Available Now Only</span>
            </label>
          </div>

          {/* Driver Roster Grid */}
          {filteredDrivers.length === 0 ? (
            <div className="bg-[#FAF9F6] rounded-3xl p-12 text-center border border-neutral-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 text-neutral-500 flex items-center justify-center mx-auto text-xl shadow-2xs">
                🚗
              </div>
              <h3 className="text-xl font-bold tracking-tight text-neutral-950 font-sans">No Active Drivers Found</h3>
              <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                Drivers register and set duty categories to appear on the homepage roster.
              </p>
              <button
                type="button"
                onClick={onSwitchToDriver}
                className="px-6 py-3 bg-neutral-950 text-white rounded-full text-xs sm:text-sm font-semibold tracking-tight hover:bg-neutral-800 transition-all shadow-md cursor-pointer"
              >
                Register as a Driver (3 Months Free)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrivers.map((driver) => {
                const isCombined = driver.driverType === 'combined';
                const isPermanent = driver.driverType === 'permanent';
                const isFeatured = driver.subscriptionPlan === 'featured';

                return (
                  <div
                    key={driver.id}
                    className={`bg-[#FAF9F6] rounded-3xl p-6 border ${
                      isFeatured ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20' : 'border-neutral-200/90'
                    } hover:border-neutral-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group relative overflow-hidden`}
                  >
                    {isFeatured && (
                      <div className="absolute top-0 right-0 bg-linear-to-l from-amber-500 to-amber-600 text-neutral-950 px-3.5 py-1 rounded-bl-2xl text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-neutral-950" />
                        Featured
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={driver.photo}
                            alt={driver.name}
                            className="w-16 h-16 rounded-2xl object-cover bg-white border border-neutral-200/90 shadow-2xs"
                          />
                          <span
                            className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                              driver.status === 'Available' ? 'bg-emerald-500' : 'bg-neutral-400'
                            }`}
                            title={driver.status}
                          />
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-950 font-sans truncate">
                              {driver.name}
                            </h3>
                            <span className="p-0.5 bg-emerald-100 text-emerald-700 rounded-full shrink-0" title="Verified Driver">
                              <Check className="w-3 h-3 stroke-3" />
                            </span>
                          </div>

                          {/* Rating & Trips */}
                          <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-amber-500">
                            <span>⭐⭐⭐⭐⭐</span>
                            <span className="text-neutral-900 ml-1 font-bold">{driver.rating || 5.0}</span>
                            <span className="text-neutral-500 font-normal">({driver.trips || 24} trips)</span>
                          </div>

                          <p className="text-xs sm:text-sm text-neutral-600 mt-1 flex items-center gap-1 truncate font-normal">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate">{driver.location}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-700">
                        <span className="px-2.5 py-0.5 rounded-md bg-white text-neutral-800 text-[11px] font-medium border border-neutral-200">
                          {driver.experience} Yrs Exp
                        </span>
                        <span className="text-neutral-300">·</span>
                        <span className="text-neutral-600 text-[11px] font-normal truncate">{driver.languages}</span>
                      </div>

                      <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2 font-normal">
                        {driver.bio}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-neutral-200/80 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-emerald-700 block">
                          {isCombined
                            ? 'Hourly & Monthly'
                            : isPermanent
                            ? 'Monthly Driver'
                            : 'Standard Duty Rate'}
                        </span>
                        <div className="text-base sm:text-lg font-bold tracking-tight text-neutral-950 font-sans">
                          {isCombined
                            ? 'Hourly & Monthly Duties'
                            : isPermanent
                            ? '₹20k – ₹40k / mo (Negotiable)'
                            : `₹${cityBaseFare} / ${cityBaseHours}h (Standard Rate)`}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setReviewModalDriver(driver);
                            setIsReviewModalOpen(true);
                          }}
                          className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full text-xs font-semibold tracking-tight transition-all cursor-pointer"
                          title="Write OTP-verified review"
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInitiateDriverAction(driver)}
                          className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full text-xs sm:text-sm font-semibold tracking-tight transition-all shadow-xs cursor-pointer"
                        >
                          Book Driver
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInitiateDriverAction(driver)}
                          className="w-9 h-9 rounded-full border border-neutral-200 hover:border-neutral-900 flex items-center justify-center text-neutral-900 transition-all shrink-0 bg-white cursor-pointer"
                          title="Contact"
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
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: STANDALONE HYDERABAD COVERAGE PLACES CAROUSEL SECTION
          (CRUIP-INSPIRED ULTRA MINIMALIST SLOW HORIZONTAL SCROLL WITH GRADIENT MASK)
         ========================================================================= */}
      <section id="localities" className="w-full bg-[#0A0A0A] border-y border-neutral-800/80 py-8 sm:py-10 overflow-hidden relative scroll-mt-24 sm:scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/8 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-200 font-sans">
                HYDERABAD COVERAGE ZONES & LOCALITIES
              </h3>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium">
              300+ Verified Greater Hyderabad Service Sectors · 30-Min Doorstep Pickup
            </p>
          </div>
        </div>

        {/* Cruip-style infinite scroll container with CSS mask-image fade on edges */}
        <div className="w-full inline-flex flex-nowrap overflow-hidden mask-gradient-x py-1">
          <ul className="flex items-center justify-center md:justify-start [&_li]:mx-2 sm:[&_li]:mx-2.5 shrink-0 animate-infinite-scroll">
            {HYDERABAD_ALL_LOCALITIES.map((locality, idx) => (
              <li key={`loc1-${idx}`} className="shrink-0">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/4 hover:bg-white/9 border border-white/8 hover:border-white/20 text-neutral-300 hover:text-white text-xs font-medium transition-all group cursor-default whitespace-nowrap">
                  <span className="w-1 h-1 rounded-full bg-emerald-400/80 group-hover:bg-emerald-400 transition-colors" />
                  <span className="tracking-normal">{locality}</span>
                </span>
              </li>
            ))}
          </ul>
          <ul className="flex items-center justify-center md:justify-start [&_li]:mx-2 sm:[&_li]:mx-2.5 shrink-0 animate-infinite-scroll" aria-hidden="true">
            {HYDERABAD_ALL_LOCALITIES.map((locality, idx) => (
              <li key={`loc2-${idx}`} className="shrink-0">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/4 hover:bg-white/9 border border-white/8 hover:border-white/20 text-neutral-300 hover:text-white text-xs font-medium transition-all group cursor-default whitespace-nowrap">
                  <span className="w-1 h-1 rounded-full bg-emerald-400/80 group-hover:bg-emerald-400 transition-colors" />
                  <span className="tracking-normal">{locality}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: SERVICES SHOWCASE (STARK PURE WHITE)
         ========================================================================= */}
      <section id="services" className="w-full bg-white py-16 sm:py-24 border-b border-neutral-200 scroll-mt-24 sm:scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500">
              OUR SERVICES
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 font-sans">
              You Deserve Stress-Free Travel in Your Own Car
            </h2>
            <p className="text-sm text-neutral-600">
              Discover driver support options tailored for every need—hourly errands, airport drops, and dedicated monthly family drivers.
            </p>
          </div>

          {/* ZIGZAG ROW 1: Large Image Left + 3-Grid Cards Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Image Feature Card */}
            <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-900 group shadow-sm min-h-85 flex flex-col justify-end p-6">
              <img
                src="https://res.cloudinary.com/dfr0zghtc/image/upload/v1793249726/referencedriverstandingnearcar_gaxe08.jpg"
                alt="Hourly Driver Service"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

              <div className="relative z-10 space-y-2 text-white">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-wider">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>30-Min Doorstep Pickup</span>
                </div>
                <h3 className="text-2xl font-bold text-white font-sans">
                  Hourly City Rides & Outstation
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Hire verified drivers for office commutes, shopping, doctor visits, or late-night dinners in your car.
                </p>
              </div>
            </div>

            {/* Right Side 3 Service Cards Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#FAF9F6] rounded-3xl p-6 border border-neutral-200/80 hover:border-neutral-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold tracking-tight text-neutral-400 font-sans">01</span>
                  <h4 className="text-base sm:text-lg font-bold tracking-tight text-neutral-950 font-sans">
                    City Temporary Duty
                  </h4>
                  <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                    Round trips, errands & late night driving in your car.
                  </p>
                </div>
                <div className="pt-3 border-t border-neutral-200">
                  <span className="text-base font-bold tracking-tight text-emerald-700 block font-sans">₹{cityBaseFare} for {cityBaseHours} Hours</span>
                  <span className="text-xs text-neutral-500 font-normal">+₹{cityExtraRate}/extra hr · +₹{nightRate}/hr night</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] rounded-3xl p-6 border border-neutral-200/80 hover:border-neutral-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold tracking-tight text-neutral-400 font-sans">02</span>
                  <h4 className="text-base sm:text-lg font-bold tracking-tight text-neutral-950 font-sans">
                    Outstation Travel
                  </h4>
                  <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                    Single-day highway return trips or interstate multi-day road trips.
                  </p>
                </div>
                <div className="pt-3 border-t border-neutral-200">
                  <span className="text-base font-bold tracking-tight text-emerald-700 block font-sans">Flat ₹{outstationRate.toLocaleString('en-IN')} / ₹{interstateRate.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-neutral-500 font-normal">Food & Room rules apply</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] rounded-3xl p-6 border border-neutral-200/80 hover:border-neutral-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold tracking-tight text-neutral-400 font-sans">03</span>
                  <h4 className="text-base sm:text-lg font-bold tracking-tight text-neutral-950 font-sans">
                    Monthly Personal Driver
                  </h4>
                  <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                    Dedicated family driver for 4h, 8h, or 12h daily shifts.
                  </p>
                </div>
                <div className="pt-3 border-t border-neutral-200 space-y-0.5">
                  <span className="text-sm font-bold tracking-tight text-emerald-700 block font-sans">4h: ₹20k–₹25k · 8h: ₹25k–₹30k</span>
                  <span className="text-xs text-neutral-600 font-medium block">12h: ₹30k–₹40k (Negotiable)</span>
                  <span className="text-[11px] text-neutral-400 font-normal block">6 days/wk (1 weekly off)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ZIGZAG ROW 2: 2x2 Bento Cards Left + Large Image Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
            {/* Left Side 2x2 Bento Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FAF9F6] rounded-3xl p-5 border border-neutral-200/80 space-y-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h4 className="text-base font-bold tracking-tight text-neutral-950 font-sans">Fully Secured</h4>
                <p className="text-sm text-neutral-600 leading-relaxed font-normal">Aadhaar & License background checked.</p>
                <div className="pt-2 text-base font-bold tracking-tight text-neutral-950 font-sans">100% Verified</div>
              </div>

              <div className="bg-[#FAF9F6] rounded-3xl p-5 border border-neutral-200/80 space-y-2">
                <Car className="w-6 h-6 text-neutral-900" />
                <h4 className="text-base font-bold tracking-tight text-neutral-950 font-sans">Manual & Auto</h4>
                <p className="text-sm text-neutral-600 leading-relaxed font-normal">Skilled with luxury sedans, SUVs, and EVs.</p>
                <div className="pt-2 text-base font-bold tracking-tight text-neutral-950 font-sans">Any Car Class</div>
              </div>

              <div className="bg-[#FAF9F6] rounded-3xl p-5 border border-neutral-200/80 space-y-2">
                <Sparkles className="w-6 h-6 text-[#FF5500]" />
                <h4 className="text-base font-bold tracking-tight text-neutral-950 font-sans">Zero Commission</h4>
                <p className="text-sm text-neutral-600 leading-relaxed font-normal">Pay direct fare to driver via UPI or Cash.</p>
                <div className="pt-2 text-base font-bold tracking-tight text-emerald-600 font-sans">₹0 Platform Fee</div>
              </div>

              <div className="bg-[#FAF9F6] rounded-3xl p-5 border border-neutral-200/80 space-y-2">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                <h4 className="text-base font-bold tracking-tight text-neutral-950 font-sans">4.9/5 Rating</h4>
                <p className="text-sm text-neutral-600 leading-relaxed font-normal">Rated by verified car owners across Hyderabad.</p>
                <div className="pt-2 text-base font-bold tracking-tight text-neutral-950 font-sans">100+ Trips</div>
              </div>
            </div>

            {/* Right Side Monthly Driver Feature Card */}
            <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-900 group shadow-sm min-h-85 flex flex-col justify-end p-6">
              <img
                src="/assets/aistudio/pexels-introspectivedsgn-9195126_1f82dc4d.jpg"
                alt="Dedicated Monthly Driver"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

              <div className="relative z-10 space-y-2 text-white">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-semibold">
                  <Briefcase className="w-3.5 h-3.5 text-purple-300" />
                  <span>Monthly Personal Driver</span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-white font-sans">
                  Dedicated Full-Time Family Drivers
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                  4, 8, or 12 hours daily support for office commutes to Financial District, school drops, and family travel.
                </p>
                <div className="pt-1 text-sm font-bold tracking-tight text-emerald-400 font-sans">
                  4h: ₹20k–₹25k · 8h: ₹25k–₹30k · 12h: ₹30k–₹40k (Negotiable)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: USES & ADVANTAGES OF MANA DRIVERS
         ========================================================================= */}
      <WhyManaDriversSection
        onBookNow={() => onOpenBooking(drivers[0])}
        onBecomeDriver={onSwitchToDriver}
      />

      {/* =========================================================================
          SECTION: HOW TO USE MANA DRIVERS (ZIG-ZAG STEP-BY-STEP FOR USERS & DRIVERS)
         ========================================================================= */}
      <HowToUseSection
        onBookNow={() => onOpenBooking(drivers[0])}
        onJoinDriver={onSwitchToDriver}
      />

      {/* =========================================================================
          SECTION: CUSTOMER INSTRUCTIONS & SAFETY PRECAUTIONS
         ========================================================================= */}
      <section className="w-full bg-white py-14 sm:py-20 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 sm:p-10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-amber-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-950 font-sans">
                    Customer Precautions & Booking Guidelines
                  </h3>
                  <p className="text-xs text-amber-900 font-medium">
                    Important rules and safety checklist before starting your trip
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-200 text-amber-950 px-3 py-1 rounded-full">
                Safety First · 100% Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-neutral-800">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-neutral-950 font-sans">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>1. Check Car Documents & Fuel</span>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  Ensure your vehicle has a valid RC (Registration Certificate), active motor insurance, Pollution Certificate (PUC), and sufficient fuel/charge before handing over the keys.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-neutral-950 font-sans">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>2. Verify Driver Identity</span>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  Cross-check the driver’s name and photograph shown on the platform. Every driver is Aadhaar-verified and holds a valid Commercial/Non-Transport driving license.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-neutral-950 font-sans">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>3. Get Permanent Review OTP</span>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  Upon trip completion, pay the driver directly via PhonePe, GPay, or Cash with ₹0 commission. Ask for their 4-digit Review OTP to post an honest rating!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          SECTION 6: REVIEWS & STORIES (INFINITE CAROUSEL)
         ========================================================================= */}
      <section id="reviews" className="relative w-full bg-[#FAF9F6] py-16 sm:py-24 border-b border-neutral-200 overflow-hidden scroll-mt-24 sm:scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>100+ Successful Trips · {realtimeDateStr}</span>
              </div>

              <p className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
                Reviews & Stories
              </p>
              <h2 className="font-sans font-semibold text-3xl sm:text-5xl text-neutral-950 tracking-tight leading-tight">
                Read Stories Written By Hyderabad Car Owners
              </h2>
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
                Real experiences from verified car owners across Jubilee Hills, Hitec City, Gachibowli, Banjara Hills, and Begumpet. Transparent fixed duty rates with zero commission.
              </p>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="px-6 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-full text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Write a Driver Review & Rating</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Infinite Carousel */}
        <div className="w-full overflow-hidden mask-gradient-x py-2">
          <div className="animate-marquee-reviews gap-6">
            {/* First Set of Review Cards */}
            {activeReviews.map((rev, idx) => (
              <div
                key={`rev-a-${rev.id || idx}`}
                className="w-[320px] sm:w-95 shrink-0 p-6 sm:p-7 bg-white rounded-3xl border border-neutral-200/90 shadow-2xs hover:shadow-lg hover:border-neutral-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                      <span>{'★'.repeat(rev.rating || 5)}</span>
                    </div>
                    <span className="text-xs font-medium text-neutral-400">
                      {rev.date}
                    </span>
                  </div>
                  <h3 className="font-sans font-bold text-base sm:text-lg text-neutral-950 tracking-tight leading-snug">
                    “{rev.title}”
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                    “{rev.quote}”
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-neutral-950 text-white font-bold text-xs flex items-center justify-center font-sans shrink-0 shadow-2xs">
                      {rev.initials || 'CU'}
                    </div>
                    <div>
                      <h4 className="font-bold tracking-tight text-neutral-950 text-xs sm:text-sm font-sans">{rev.author}</h4>
                      <p className="text-xs text-neutral-500 font-normal">{rev.carAndArea}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
                    {rev.tripType}
                  </span>
                </div>
              </div>
            ))}

            {/* Duplicated Set of Review Cards for Seamless Infinite Loop */}
            {activeReviews.map((rev, idx) => (
              <div
                key={`rev-b-${rev.id || idx}`}
                aria-hidden="true"
                className="w-[320px] sm:w-95 shrink-0 p-6 sm:p-7 bg-white rounded-3xl border border-neutral-200/90 shadow-2xs hover:shadow-lg hover:border-neutral-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                      <span>{'★'.repeat(rev.rating || 5)}</span>
                    </div>
                    <span className="text-xs font-medium text-neutral-400">
                      {rev.date}
                    </span>
                  </div>
                  <h3 className="font-sans font-bold text-base sm:text-lg text-neutral-950 tracking-tight leading-snug">
                    “{rev.title}”
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                    “{rev.quote}”
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-neutral-950 text-white font-bold text-xs flex items-center justify-center font-sans shrink-0 shadow-2xs">
                      {rev.initials || 'CU'}
                    </div>
                    <div>
                      <h4 className="font-bold tracking-tight text-neutral-950 text-xs sm:text-sm font-sans">{rev.author}</h4>
                      <p className="text-xs text-neutral-500 font-normal">{rev.carAndArea}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
                    {rev.tripType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OTP-VERIFIED DRIVER REVIEW MODAL */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewModalDriver(null);
        }}
        drivers={drivers}
        initialDriver={reviewModalDriver}
        onReviewSubmitted={(newRev) => {
          setReviewsList((prev) => [newRev, ...prev]);
        }}
      />

      {/* =========================================================================
          SECTION 7: FAQ SECTION (STARK PURE WHITE)
         ========================================================================= */}
      <section id="faq" className="w-full bg-white py-16 sm:py-24 border-b border-neutral-200 scroll-mt-24 sm:scroll-mt-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
              Frequently Asked Questions
            </p>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-950 font-sans">
              Got Questions? We Have Answers
            </h2>
            <p className="mt-3 text-base sm:text-lg text-neutral-600 max-w-xl mx-auto leading-relaxed font-normal">
              Everything you need to know about booking private drivers in Hyderabad under transparent fixed duty rates.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-[#FAF9F6] rounded-2xl border border-neutral-200/90 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none min-h-11 cursor-pointer"
                  >
                    <span className="text-base sm:text-lg font-semibold tracking-tight text-neutral-950 font-sans">
                      {faq.question}
                    </span>
                    <span className="p-1 rounded-full bg-white border border-neutral-200 text-neutral-700 shrink-0">
                      {isOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-sm text-neutral-600 leading-relaxed border-t border-neutral-200/60 mt-1 font-normal">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-6 text-center">
            <p className="text-sm text-neutral-600 font-normal">
              Need direct assistance? Reach out to support at{' '}
              <a
                href="mailto:supportmanadrivers@gmail.com"
                className="font-semibold text-neutral-950 hover:underline"
              >
                supportmanadrivers@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
