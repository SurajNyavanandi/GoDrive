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
  Phone,
  Mail,
  Star,
  Clock,
  Car,
  ChevronLeft,
  ChevronRight,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerView({
  drivers = [],
  onOpenBooking,
  onSwitchToDriver,
}) {
  // Driver Type filter: 'all' | 'freelance' | 'permanent' | 'combined'
  const [selectedDriverType, setSelectedDriverType] = useState('all');
  const [selectedLocality] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Review / Story Carousel State
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  // Contact / Lead Form State
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'Hourly City Ride',
    locality: 'Hitec City',
    message: '',
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

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

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) {
      toast.error('Please enter your name and phone number.');
      return;
    }
    setIsSubmittingLead(true);
    setTimeout(() => {
      setIsSubmittingLead(false);
      toast.success('Thank you! Our Hyderabad dispatch team will contact you shortly.');
      setLeadForm({
        name: '',
        email: '',
        phone: '',
        serviceType: 'Hourly City Ride',
        locality: 'Hitec City',
        message: '',
      });
    }, 600);
  };

  const faqs = [
    {
      question: 'How fast will the driver reach my doorstep in Hyderabad?',
      answer:
        'In primary tech hubs like Hitec City, Gachibowli, Jubilee Hills, and Kondapur, your verified chauffeur arrives within 30 minutes of booking confirmation.',
    },
    {
      question: 'Do newly registered drivers get a 3-month free trial on Mana Drivers?',
      answer:
        'Yes! All newly approved verified drivers receive an automatic 90-day (3-month) free trial listing on our public driver roster.',
    },
    {
      question: 'Do you charge extra for luxury SUVs, automatic transmissions, or EV cars?',
      answer:
        'No extra fees whatsoever. All our verified chauffeurs drive both manual and automatic cars across all vehicle classes at the exact same transparent rates.',
    },
    {
      question: 'How do I pay the driver for the trip?',
      answer:
        'Pay the driver directly via UPI (PhonePe, Google Pay, Paytm) or cash after your trip. Mana Drivers takes ₹0 commission from trip fares.',
    },
    {
      question: 'Can I hire a permanent driver on a monthly salary for my family?',
      answer:
        'Yes. Choose a permanent monthly driver for 8 to 9 hours daily. Typical monthly driver salary ranges from ₹18,000 to ₹22,000.',
    },
    {
      question: 'Are all drivers verified with Aadhaar and driving license checks?',
      answer:
        'Yes. Every driver undergoes mandatory Aadhaar identity verification, address check, and driving license background verification before going live.',
    },
  ];

  const services = [
    {
      number: '01',
      title: 'Hourly In-City Ride',
      rate: '₹160 – ₹180 / hr',
      min: '3 hr minimum',
      description:
        'Doorstep driver arrival for office commutes, shopping trips, doctor appointments, and family dinners in your personal vehicle.',
    },
    {
      number: '02',
      title: 'RGIA Airport Drop & Pickup',
      rate: '₹600 – ₹800 flat',
      min: 'One-way flat fare',
      description:
        'Punctual 24/7 transfers to and from Rajiv Gandhi International Airport Shamshabad in your car.',
    },
    {
      number: '03',
      title: 'Monthly Executive Chauffeur',
      rate: '₹18,000 – ₹22,000 / mo',
      min: '8–9 hrs daily · 6 days/wk',
      description:
        'Dedicated monthly driver for executive daily commutes, school drops, and personal family travel.',
    },
    {
      number: '04',
      title: 'Outstation Highway Trip',
      rate: '₹1,400 – ₹1,800 / day',
      min: 'Day trip allowance',
      description:
        'Experienced highway drivers for weekend family trips to Srisailam, Vijayawada, Nagarjuna Sagar, or Warangal.',
    },
  ];

  const stories = [
    {
      quote:
        'Ramesh reached Cyber Towers in 25 minutes. He drove my Fortuner very smoothly through heavy peak-hour traffic. Exceptional professionalism and zero hidden charges.',
      author: 'Vikram Reddy',
      title: 'Hitec City · Fortuner Owner',
      metric: '30-Min Arrival',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      image:
        'https://res.cloudinary.com/dfr0zghtc/image/upload/v1793249726/referencedriverstandingnearcar_gaxe08.jpg',
    },
    {
      quote:
        'We hired Suresh as our monthly family driver in Jubilee Hills. Always punctual, polite, extremely safe with elderly parents, and knows every shortcut in the city.',
      author: 'Dr. Ananya Rao',
      title: 'Jubilee Hills · Honda City Owner',
      metric: 'Monthly Family Driver',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSG7kH9djSSdt6ljWchCZHMkYwzZzXa5TTAbRasvuhPBw&s',
    },
    {
      quote:
        'Now I take my own vehicle to late-night dinners in Banjara Hills without stressing over parking or fatigue. Reliable airport drop and instant UPI payment.',
      author: 'Karthik Varma',
      title: 'Banjara Hills · BMW Owner',
      metric: '24/7 Airport Service',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      image:
        'https://www.deepamcabs.com/images/new-site-images/airport_transfer_hero_image.webp',
    },
  ];

  const currentStory = stories[activeStoryIndex];

  return (
    <div className="w-full text-neutral-900 bg-[#FAF9F6]">
      {/* =========================================================================
          SECTION 1: HERO SECTION (ULTRA MINIMALIST MODERN)
         ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-[#0A0A0A] border-b border-neutral-800 text-white min-h-[580px] sm:min-h-[620px] flex flex-col justify-between pt-20">
        {/* Background Overlay & Smooth Fading Car Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://res.cloudinary.com/dfr0zghtc/image/upload/v1793333461/Business_Driver_Through_the_City_bpfr8c.png"
            alt="Verified private driver driving car in Hyderabad"
            className="w-full h-full object-cover object-right lg:object-center opacity-70 scale-100"
          />
          {/* Edge Fading Gradients for Smooth Text Overlay on Left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/90 sm:via-[#0A0A0A]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12 w-full flex-1 flex flex-col justify-between">
          {/* Main Hero Content - Simple Indian English */}
          <div className="max-w-2xl text-white space-y-6 animate-fade-in-up">
            {/* Minimal Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs font-semibold tracking-wider text-neutral-200 uppercase">
              <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
              <span>HYDERABAD PRIVATE CAR DRIVERS · 30-MIN PICKUP</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] font-sans">
              Hire Verified Drivers for Your Own Car in{' '}
              <span className="text-[#FF5500] font-black">
                HYDERABAD
              </span>
              .
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed max-w-xl">
              Hourly rides or full-time monthly drivers across Hyderabad. Driver arrives at your doorstep in 30 minutes. Pay directly to driver with zero extra fees.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full sm:w-auto">
              <a
                href="#drivers"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white hover:bg-neutral-200 active:scale-95 text-neutral-950 rounded-full text-xs sm:text-sm font-bold transition-all shadow-lg min-h-[48px] w-full sm:w-auto text-center"
              >
                <span>Book Driver Now</span>
                <ArrowRight className="w-4 h-4 text-neutral-950" />
              </a>

              <button
                type="button"
                onClick={onSwitchToDriver}
                className="inline-flex items-center justify-center px-6 py-4 bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/20 text-white rounded-full text-xs sm:text-sm font-semibold transition-all min-h-[48px] w-full sm:w-auto text-center"
              >
                <span>Become a Driver (Free Trial)</span>
              </button>
            </div>
          </div>

          {/* Bottom 3-Column Metric Strip */}
          <div className="pt-8 sm:pt-12 grid grid-cols-3 gap-2 sm:gap-6 border-t border-white/10 max-w-2xl w-full">
            <div className="space-y-0.5">
              <div className="text-xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
                30 Mins
              </div>
              <div className="text-[10px] sm:text-xs text-neutral-400 font-medium leading-tight">
                Doorstep Pickup
              </div>
            </div>

            <div className="space-y-0.5 border-l border-white/10 pl-3 sm:pl-6">
              <div className="text-xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
                100+
              </div>
              <div className="text-[10px] sm:text-xs text-neutral-400 font-medium leading-tight">
                Trips Completed
              </div>
            </div>

            <div className="space-y-0.5 border-l border-white/10 pl-3 sm:pl-6">
              <div className="text-xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
                ₹0 Extra
              </div>
              <div className="text-[10px] sm:text-xs text-emerald-400 font-medium leading-tight">
                Zero Commission
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: STANDALONE HYDERABAD COVERAGE PLACES CAROUSEL SECTION
         ========================================================================= */}
      <section id="localities" className="w-full bg-[#111111] border-b-2 border-neutral-800 py-8 overflow-hidden text-xs text-neutral-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5500]">
              HYDERABAD COVERAGE ZONES & PLACES
            </h3>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <div className="inline-flex space-x-6 animate-marquee whitespace-nowrap font-medium text-xs text-neutral-200">
              {[
                'HITEC City',
                'Gachibowli',
                'Jubilee Hills',
                'Banjara Hills',
                'Kondapur',
                'Madhapur',
                'Financial District',
                'Begumpet',
                'Secunderabad',
                'Kukatpally',
                'Miyapur',
                'RGIA Airport Shamshabad',
                'Kompally',
                'LB Nagar',
                'Uppal',
                'Ameerpet',
                'Mehdipatnam',
                'Tarnaka',
                'HITEC City',
                'Gachibowli',
                'Jubilee Hills',
                'Banjara Hills',
              ].map((locality, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-neutral-200 hover:border-amber-400/50 transition-colors shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{locality}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: ASYMMETRICAL ABOUT & CONCERN SECTION (WARM SLATE #FAF9F6)
          Inspired by reference screenshot #1
         ========================================================================= */}
      <section className="w-full bg-[#FAF9F6] py-16 sm:py-24 border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-white rounded-3xl p-8 sm:p-16 border border-neutral-200/90 shadow-sm overflow-hidden flex flex-col items-center text-center space-y-8">
            {/* Top Left Floating Offset Photo Card */}
            <div className="hidden lg:block absolute top-8 left-8 w-44 h-44 rounded-3xl overflow-hidden border border-neutral-200 shadow-md transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMMIWNMK0CiKRChLI_o_DCXR-kYVqQ6El0dkVBmYrQdZlQfydzjfWYCIA7&s=10"
                alt="Chauffeur holding keys"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  Verified Drivers
                </span>
              </div>
            </div>

            {/* Bottom Right Floating Offset Photo Card */}
            <div className="hidden lg:block absolute bottom-8 right-8 w-44 h-44 rounded-3xl overflow-hidden border border-neutral-200 shadow-md transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSG7kH9djSSdt6ljWchCZHMkYwzZzXa5TTAbRasvuhPBw&s"
                alt="Happy customer in luxury car"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  Peace of Mind
                </span>
              </div>
            </div>

            {/* Centered Editorial Message */}
            <div className="max-w-2xl space-y-4 z-10 my-4">
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-neutral-500">
                ABOUT MANA DRIVERS
              </p>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 font-sans leading-tight">
                Have any concerns? We're just a{' '}
                <span className="italic font-normal">message away</span> — reach out now.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal max-w-xl mx-auto">
                We understand how essential trust and vehicle safety are when hiring a chauffeur. Our drivers undergo thorough background screening so you can relax on every ride.
              </p>
            </div>

            {/* Direct Contact Pills */}
            <div className="z-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md pt-2">
              <a
                href="mailto:supportmanadrivers@gmail.com"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#111111] hover:bg-neutral-800 active:scale-95 text-white rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm min-h-[44px]"
              >
                <Mail className="w-4 h-4 text-[#FF5500]" />
                <span>supportmanadrivers@gmail.com</span>
              </a>

              <a
                href={`https://wa.me/919963254183?text=${encodeURIComponent(
                  'Hello Mana Drivers, I have a query about booking a private driver in Hyderabad.'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm min-h-[44px]"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp Helpline</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: ZIGZAG FEATURE SHOWCASE & SERVICES (STARK PURE WHITE)
          Inspired by reference screenshot #2
         ========================================================================= */}
      <section id="services" className="w-full bg-white py-16 sm:py-24 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500">
              01 / OUR SERVICES
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 font-sans">
              You Deserve Stress-Free Travel in Your Own Car
            </h2>
            <p className="text-sm text-neutral-600">
              Discover driver support options tailored for every need—hourly errands, airport drops, and dedicated monthly family chauffeurs.
            </p>
          </div>

          {/* ZIGZAG ROW 1: Large Image Left + 3-Grid Cards Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Image Feature Card */}
            <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-900 group shadow-sm min-h-[340px] flex flex-col justify-end p-6">
              <img
                src="https://res.cloudinary.com/dfr0zghtc/image/upload/v1793249726/referencedriverstandingnearcar_gaxe08.jpg"
                alt="Hourly Chauffeur Service"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

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
                  <span className="text-xs font-bold font-mono text-neutral-400">01</span>
                  <h4 className="text-base font-bold text-neutral-950 font-sans">
                    Hourly In-City
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Easy rides for shopping and errands. Pay per hour directly.
                  </p>
                </div>
                <div className="pt-3 border-t border-neutral-200">
                  <span className="text-sm font-bold text-neutral-950 block">₹160 – ₹180 / hr</span>
                  <span className="text-[10px] text-neutral-500">3 hr min</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] rounded-3xl p-6 border border-neutral-200/80 hover:border-neutral-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold font-mono text-neutral-400">02</span>
                  <h4 className="text-base font-bold text-neutral-950 font-sans">
                    Airport Flat
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    24/7 drops & pickups for RGIA Airport Shamshabad.
                  </p>
                </div>
                <div className="pt-3 border-t border-neutral-200">
                  <span className="text-sm font-bold text-neutral-950 block">₹600 – ₹800 flat</span>
                  <span className="text-[10px] text-emerald-600 font-bold">24/7 Ready</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] rounded-3xl p-6 border border-neutral-200/80 hover:border-neutral-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold font-mono text-neutral-400">03</span>
                  <h4 className="text-base font-bold text-neutral-950 font-sans">
                    Outstation
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Safe highway travel to temple towns or weekend getaways.
                  </p>
                </div>
                <div className="pt-3 border-t border-neutral-200">
                  <span className="text-sm font-bold text-neutral-950 block">₹1,400 – ₹1,800/day</span>
                  <span className="text-[10px] text-neutral-500">Day allowance</span>
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
                <h4 className="text-sm font-bold text-neutral-950 font-sans">Fully Secured</h4>
                <p className="text-xs text-neutral-600">Aadhaar & License background checked.</p>
                <div className="pt-2 text-base font-bold text-neutral-950 font-mono">100% Checked</div>
              </div>

              <div className="bg-[#FAF9F6] rounded-3xl p-5 border border-neutral-200/80 space-y-2">
                <Car className="w-6 h-6 text-neutral-900" />
                <h4 className="text-sm font-bold text-neutral-950 font-sans">Manual & Auto</h4>
                <p className="text-xs text-neutral-600">Skilled with luxury sedans and SUVs.</p>
                <div className="pt-2 text-base font-bold text-neutral-950 font-mono">Any Car Class</div>
              </div>

              <div className="bg-[#FAF9F6] rounded-3xl p-5 border border-neutral-200/80 space-y-2">
                <Sparkles className="w-6 h-6 text-[#FF5500]" />
                <h4 className="text-sm font-bold text-neutral-950 font-sans">Zero Commission</h4>
                <p className="text-xs text-neutral-600">Pay direct fare to driver via UPI or Cash.</p>
                <div className="pt-2 text-base font-bold text-emerald-600 font-mono">₹0 Platform Fee</div>
              </div>

              <div className="bg-[#FAF9F6] rounded-3xl p-5 border border-neutral-200/80 space-y-2">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                <h4 className="text-sm font-bold text-neutral-950 font-sans">4.9/5 Rating</h4>
                <p className="text-xs text-neutral-600">Rated by verified car owners across HYD.</p>
                <div className="pt-2 text-base font-bold text-neutral-950 font-mono">100+ Trips</div>
              </div>
            </div>

            {/* Right Side Executive Chauffeur Feature Card */}
            <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-900 group shadow-sm min-h-[340px] flex flex-col justify-end p-6">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSG7kH9djSSdt6ljWchCZHMkYwzZzXa5TTAbRasvuhPBw&s"
                alt="Dedicated Monthly Chauffeur"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="relative z-10 space-y-2 text-white">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-wider">
                  <Briefcase className="w-3 h-3 text-purple-300" />
                  <span>Monthly Executive Chauffeur</span>
                </div>
                <h3 className="text-2xl font-bold text-white font-sans">
                  Dedicated Full-Time Family Drivers
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  8–9 hours daily support for office commutes to Financial District, school drops, and family travel.
                </p>
                <div className="pt-1 text-sm font-bold text-amber-400">
                  ₹18,000 – ₹22,000 / month
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: VERIFIED DRIVER ROSTER & SEARCH (OBSIDIAN DARK #0A0A0A)
         ========================================================================= */}
      <section id="drivers" className="w-full bg-[#0A0A0A] py-16 sm:py-24 border-b border-neutral-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400">
                02 / CHAUFFEURS
              </p>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-sans">
                Meet Our Verified Hyderabad Chauffeurs
              </h2>
              <p className="text-sm text-neutral-400">
                Only active drivers with valid licenses and Aadhaar verification appear below. Contact or book directly.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              <button
                type="button"
                onClick={() => setSelectedDriverType('all')}
                className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  selectedDriverType === 'all'
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                All ({drivers.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedDriverType('freelance')}
                className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  selectedDriverType === 'freelance'
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                Hourly Freelance
              </button>
              <button
                type="button"
                onClick={() => setSelectedDriverType('permanent')}
                className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  selectedDriverType === 'permanent'
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                Monthly Permanent
              </button>
              <button
                type="button"
                onClick={() => setSelectedDriverType('combined')}
                className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  selectedDriverType === 'combined'
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                Combined
              </button>
            </div>
          </div>

          {/* Search & Availability Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#111111] p-4 rounded-3xl border border-neutral-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
              <input
                type="text"
                placeholder="Search driver by name, area, or language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-medium text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-white"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-white"
              />
              <span>Available Now Only</span>
            </label>
          </div>

          {/* Bento Driver Grid */}
          {filteredDrivers.length === 0 ? (
            <div className="bg-[#111111] rounded-3xl p-12 text-center border border-neutral-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center mx-auto text-xl">
                🚗
              </div>
              <h3 className="text-xl font-bold text-white font-sans">No Active Drivers Found</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Drivers must register and maintain an active listing or 3-month free trial to appear on the homepage roster.
              </p>
              <button
                type="button"
                onClick={onSwitchToDriver}
                className="px-6 py-3 bg-white text-neutral-950 rounded-full text-xs font-bold hover:bg-neutral-200 transition-all"
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
                    className={`bg-[#111111] rounded-3xl p-6 border ${
                      isFeatured ? 'border-amber-400 ring-1 ring-amber-400/30' : 'border-neutral-800'
                    } hover:border-neutral-600 transition-all duration-300 flex flex-col justify-between space-y-6 group relative overflow-hidden`}
                  >
                    {isFeatured && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-neutral-950 px-3.5 py-1 rounded-bl-2xl text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
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
                            className="w-16 h-16 rounded-2xl object-cover bg-neutral-900 border border-neutral-800"
                          />
                          <span
                            className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#111111] ${
                              driver.status === 'Available' ? 'bg-emerald-500' : 'bg-neutral-500'
                            }`}
                            title={driver.status}
                          />
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="text-lg font-bold tracking-tight text-white font-sans truncate">
                              {driver.name}
                            </h3>
                            <span className="p-0.5 bg-emerald-500/20 text-emerald-400 rounded-full shrink-0" title="Verified Chauffeur">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          </div>

                          {/* Rating & Trips */}
                          <div className="flex items-center gap-1 mt-1 text-xs font-bold text-amber-400">
                            <span>⭐⭐⭐⭐⭐</span>
                            <span className="text-white ml-1">{driver.rating || 5.0}</span>
                            <span className="text-neutral-500 font-normal">({driver.trips || 24} trips)</span>
                          </div>

                          <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                            <span className="truncate">{driver.location}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-300">
                        <span className="px-2.5 py-0.5 rounded-md bg-neutral-900 text-neutral-300 text-[11px] border border-neutral-800">
                          {driver.experience} Yrs Exp
                        </span>
                        <span className="text-neutral-600">·</span>
                        <span className="text-neutral-400 text-[11px] truncate">{driver.languages}</span>
                      </div>

                      <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                        {driver.bio}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                          {isCombined ? 'Hourly & Monthly' : isPermanent ? 'Monthly Salary' : 'Hourly Fare'}
                        </span>
                        <div className="text-base font-bold text-white font-sans">
                          {isCombined
                            ? `₹${driver.hourlyRate || 180}/hr · Monthly`
                            : isPermanent
                            ? `Full-Time Monthly`
                            : `₹${driver.hourlyRate || 180} / hr`}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleInitiateDriverAction(driver)}
                          className="px-4 py-2 bg-white hover:bg-neutral-200 text-neutral-950 rounded-full text-xs font-bold transition-all"
                        >
                          Book Chauffeur
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInitiateDriverAction(driver)}
                          className="w-9 h-9 rounded-full border border-neutral-800 hover:border-white flex items-center justify-center text-white transition-all shrink-0"
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
          SECTION 5: BLOG / CLIENT TESTIMONIAL SHOWCASE (WARM SLATE #FAF9F6)
          Inspired by reference screenshot #3
         ========================================================================= */}
      <section className="w-full bg-[#FAF9F6] py-16 sm:py-24 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500">
              03 / REVIEWS & STORIES
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 font-sans">
              Read Stories Written By Hyderabad Car Owners
            </h2>
          </div>

          {/* Split Story Card Showcase */}
          <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Story Photo */}
            <div className="lg:col-span-5 h-72 sm:h-96 rounded-2xl overflow-hidden border border-neutral-200 relative">
              <img
                src={currentStory.image}
                alt={currentStory.author}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-neutral-950/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {currentStory.metric}
              </div>
            </div>

            {/* Right Column: Story Excerpt & Pagination Controls */}
            <div className="lg:col-span-7 space-y-6 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <span className="text-xs font-bold text-neutral-400">09, October 2026</span>
                <blockquote className="text-lg sm:text-2xl font-medium text-neutral-900 leading-relaxed font-sans italic">
                  "{currentStory.quote}"
                </blockquote>
              </div>

              <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={currentStory.avatar}
                    alt={currentStory.author}
                    className="w-12 h-12 rounded-full object-cover border border-neutral-200"
                  />
                  <div>
                    <div className="text-sm font-bold text-neutral-950">{currentStory.author}</div>
                    <div className="text-xs text-neutral-500">{currentStory.title}</div>
                  </div>
                </div>

                {/* Capsule Pagination Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveStoryIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1))
                    }
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full text-xs font-semibold flex items-center gap-1 transition-all min-h-[40px]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveStoryIndex((prev) => (prev === stories.length - 1 ? 0 : prev + 1))
                    }
                    className="px-4 py-2 bg-[#111111] hover:bg-neutral-800 text-white rounded-full text-xs font-semibold flex items-center gap-1 transition-all min-h-[40px]"
                  >
                    <span>Next Story</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: INTERACTIVE LEAD FORM & FAQ (STARK PURE WHITE)
          Inspired by reference screenshot #3
         ========================================================================= */}
      <section className="w-full bg-white py-16 sm:py-24 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500">
              04 / CONTACT & FAQ
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 font-sans">
              Ready To Begin Your Mana Drivers Journey?
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Clean Contact Lead Form */}
            <div className="lg:col-span-7 bg-[#FAF9F6] rounded-3xl p-6 sm:p-10 border border-neutral-200/90 shadow-sm space-y-6">
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1">
                    Your Name*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                      Your Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="supportmanadrivers@gmail.com"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                      Service Type
                    </label>
                    <select
                      value={leadForm.serviceType}
                      onChange={(e) => setLeadForm({ ...leadForm, serviceType: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    >
                      <option value="Hourly City Ride">Hourly In-City Ride (₹160/hr)</option>
                      <option value="RGIA Airport Drop">RGIA Airport Transfer (Flat ₹600-800)</option>
                      <option value="Monthly Family Driver">Monthly Family Chauffeur (₹18k-22k/mo)</option>
                      <option value="Outstation Trip">Outstation Highway Trip</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                      Hyderabad Locality
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hitec City, Jubilee Hills"
                      value={leadForm.locality}
                      onChange={(e) => setLeadForm({ ...leadForm, locality: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1">
                    Special Instructions / Vehicle Model
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Need driver for Fortuner automatic tomorrow 9 AM..."
                    value={leadForm.message}
                    onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="w-full py-4 bg-[#111111] hover:bg-neutral-800 active:scale-[0.98] text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md min-h-[44px]"
                >
                  <Send className="w-4 h-4 text-[#FF5500]" />
                  <span>{isSubmittingLead ? 'Submitting Request...' : 'Submit Booking Inquiry'}</span>
                </button>
              </form>
            </div>

            {/* Right Column: Framed Interior Photo with Quote Badge */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative rounded-3xl overflow-hidden border border-neutral-200 h-[420px] bg-neutral-900 shadow-sm">
                <img
                  src="https://www.deepamcabs.com/images/new-site-images/airport_transfer_hero_image.webp"
                  alt="Mana Drivers Chauffeur Service"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-lg text-neutral-900 space-y-1">
                  <p className="text-xs font-bold font-sans">
                    "Verified Chauffeur Arrives in 30 Minutes"
                  </p>
                  <p className="text-[11px] text-neutral-600">
                    Mana Drivers Hyderabad · Cyber Towers · Gachibowli · Jubilee Hills
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div className="pt-8 border-t border-neutral-200 max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold tracking-tight text-neutral-950 font-sans">
                Frequently Asked Questions
              </h3>
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
                      className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none min-h-[44px]"
                    >
                      <span className="text-sm font-bold text-neutral-950 font-sans">
                        {faq.question}
                      </span>
                      <span className="p-1 rounded-full bg-white border border-neutral-200 text-neutral-700 shrink-0">
                        {isOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-0 text-xs text-neutral-600 leading-relaxed border-t border-neutral-200/60 mt-1">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
