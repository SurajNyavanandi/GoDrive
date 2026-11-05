import { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  UserCheck,
  Sparkles,
} from 'lucide-react';

export default function HowToUseSection({
  onBookNow,
  onJoinDriver,
  onOpenBooking,
  onSwitchToDriver,
}) {
  const [activeTab, setActiveTab] = useState('owners'); // 'owners' | 'drivers'
  const handleBook = onBookNow || onOpenBooking;
  const handleJoin = onJoinDriver || onSwitchToDriver;

  return (
    <section id="how-to-use" className="w-full bg-[#FAF9F6] py-20 sm:py-28 border-b border-neutral-200 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Header with Bilingual Cue */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wider uppercase border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Step-by-Step Guide · సులువైన మార్గదర్శి</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 font-sans leading-tight">
            How to Use Mana Drivers
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
            Designed with crystal clarity so anyone—even with basic or zero prior app knowledge—can book a driver or earn money with 100% transparency.
          </p>

          {/* Toggle Tab between Car Owners & Drivers */}
          <div className="pt-4 inline-flex p-1.5 bg-neutral-200/80 rounded-full border border-neutral-300/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('owners')}
              className={`px-5 sm:px-8 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'owners'
                  ? 'bg-neutral-950 text-white shadow-md'
                  : 'text-neutral-700 hover:text-neutral-950'
              }`}
            >
              🚗 For Car Owners (Users)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('drivers')}
              className={`px-5 sm:px-8 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'drivers'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-neutral-700 hover:text-neutral-950'
              }`}
            >
              👨‍✈️ For Drivers (Chauffeurs)
            </button>
          </div>
        </div>

        {/* =========================================================================
            ZIG-ZAG GUIDE: FOR CAR OWNERS (USERS)
           ========================================================================= */}
        {activeTab === 'owners' && (
          <div className="space-y-12 sm:space-y-16">
            {/* STEP 1: Zig (Card Left, Text Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="lg:col-span-6 bg-gradient-to-br from-neutral-900 to-neutral-950 text-white p-6 sm:p-8 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-400">DUTY SCHEDULE</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                    Fixed Rates
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-white/10 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">City Temporary (4 Hours)</div>
                      <div className="text-[11px] text-neutral-400">Shopping, errands & party drops</div>
                    </div>
                    <span className="text-base font-extrabold text-emerald-400 font-sans">₹700</span>
                  </div>
                  <div className="p-3 bg-white/10 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">Full Day City (8 Hours)</div>
                      <div className="text-[11px] text-neutral-400">Meetings & day-long travel</div>
                    </div>
                    <span className="text-base font-extrabold text-emerald-400 font-sans">₹1,100</span>
                  </div>
                  <div className="p-3 bg-white/10 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">Monthly Driver (8h / Day)</div>
                      <div className="text-[11px] text-neutral-400">Dedicated family chauffeur</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-300 font-sans">₹25k–₹30k/mo</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-3">
                <span className="inline-block text-xs font-black font-mono px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  STEP 01 · మొదటి అడుగు
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 font-sans">
                  Choose Your Duty &amp; Time
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                  Decide whether you need an hourly freelance driver (strictly <strong>4, 6, or 8 hours</strong>), an outstation highway driver (₹2,000/day flat), or a monthly full-time chauffeur (in clear negotiable ranges).
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Transparent association fares · Zero surge during rain or night</span>
                </div>
                {handleBook && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleBook}
                      className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>Book a Driver Now</span>
                      <span>→</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 2: Zag (Text Left, Card Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="lg:col-span-6 lg:order-1 order-2 space-y-3">
                <span className="inline-block text-xs font-black font-mono px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  STEP 02 · డ్రైవర్‌ను ఎంచుకోండి
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 font-sans">
                  Pick a Verified Driver Near You
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                  Browse real verified chauffeurs across Hitec City, Gachibowli, Jubilee Hills, and 300+ Hyderabad localities. Filter by transmission skills (Manual, Automatic, Sedans, SUVs, Fortuner) and read verified car owner reviews.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Driving License &amp; Aadhaar authenticated before listing</span>
                </div>
              </div>

              <div className="lg:col-span-6 lg:order-2 order-1 bg-neutral-50 p-6 sm:p-8 rounded-2xl border border-neutral-200 space-y-3">
                <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                    alt="Sample Driver"
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-neutral-900">Verified Driver Profile</h4>
                      <span className="text-xs font-bold text-amber-500">4.9 ★</span>
                    </div>
                    <p className="text-xs text-neutral-500">Kondapur · 8 Yrs Exp · Automatic &amp; Manual</p>
                    <span className="mt-1 inline-block text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Verified LMV License
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 text-center font-mono">
                  📍 Covering all 300+ Greater Hyderabad Localities
                </p>
              </div>
            </div>

            {/* STEP 3: Zig (Card Left, Text Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="lg:col-span-6 bg-amber-50 p-6 sm:p-8 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>Doorstep Handover Checklist</span>
                </div>
                <ul className="text-xs text-amber-900 space-y-2 list-disc pl-4 leading-relaxed">
                  <li><strong>Check Original License:</strong> Inspect driver's physical Driving License before handing over keys.</li>
                  <li><strong>Vehicle Fuel:</strong> Ensure vehicle has adequate fuel/charge and active FASTag.</li>
                  <li><strong>Zero Alcohol:</strong> All drivers adhere to 100% sobriety policy.</li>
                  <li><strong>Direct WhatsApp:</strong> Instant chat and phone call direct to driver with zero middleman.</li>
                </ul>
              </div>

              <div className="lg:col-span-6 space-y-3">
                <span className="inline-block text-xs font-black font-mono px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  STEP 03 · కారు తాళాలు అప్పగించండి
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 font-sans">
                  Call &amp; Hand Over Car Keys Safely
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                  Connect directly with the driver on call or WhatsApp. When they arrive at your doorstep, verify their original driving license. Sit back, relax, and travel in the comfort and privacy of your personal car.
                </p>
              </div>
            </div>

            {/* STEP 4: Zag (Text Left, Card Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="lg:col-span-6 lg:order-1 order-2 space-y-3">
                <span className="inline-block text-xs font-black font-mono px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  STEP 04 · OTP ఫీడ్‌బ్యాక్ ఇవ్వండి
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 font-sans">
                  Pay Direct &amp; Enter Review OTP
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                  Pay the agreed fare directly to the driver via Cash or UPI with <strong>0% platform commission</strong>. After duty completion, ask the driver for their permanent 4-digit Review OTP to submit verified 5-star feedback!
                </p>
                <div className="pt-2">
                  <a
                    href="#drivers"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full text-xs sm:text-sm font-bold transition-all shadow-md"
                  >
                    <span>Browse Verified Drivers Now</span>
                    <span>→</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-6 lg:order-2 order-1 bg-emerald-950 text-white p-6 sm:p-8 rounded-2xl border border-emerald-500/30 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <KeyRound className="w-5 h-5" />
                  <span>Trip Verification via Driver Review OTP</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Only customers who have completed a real trip and received the driver's constant 4-digit OTP can publish reviews. This prevents fake feedback and protects car owners.
                </p>
                <div className="p-3 bg-black/40 rounded-xl border border-emerald-500/20 flex items-center justify-between font-mono text-xs">
                  <span>Driver Permanent Review OTP:</span>
                  <span className="text-emerald-400 font-bold text-base tracking-widest">[4 Digits]</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ZIG-ZAG GUIDE: FOR DRIVERS (CHAUFFEURS)
           ========================================================================= */}
        {activeTab === 'drivers' && (
          <div className="space-y-12 sm:space-y-16">
            {/* STEP 1: Zig (Card Left, Text Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="lg:col-span-6 bg-gradient-to-br from-neutral-900 to-neutral-950 text-white p-6 sm:p-8 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <span className="text-xs font-mono font-bold text-emerald-400">FREE 3-MONTH TRIAL</span>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full">
                    90 Days Free
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Upload Driving License (LMV)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Upload Aadhaar Card (Front/Back)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Select Preferred Hyderabad Area</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-3">
                <span className="inline-block text-xs font-black font-mono px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  STEP 01 · రిజిస్ట్రేషన్ (2 నిమిషాల్లో)
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 font-sans">
                  Register in 2 Minutes Free
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                  Fill in your name, mobile number, driving experience, and upload photos of your valid Driving License and Aadhaar Card. Every driver receives an instant <strong>90-day (3-month) free trial</strong> upon registration!
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Choose Hourly freelance or Monthly permanent duty</span>
                </div>
              </div>
            </div>

            {/* STEP 2: Zag (Text Left, Card Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="lg:col-span-6 lg:order-1 order-2 space-y-3">
                <span className="inline-block text-xs font-black font-mono px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  STEP 02 · 24 గంటల్లో అడ్మిన్ వెరిఫికేషన్
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 font-sans">
                  Admin Verification within 24 Hours
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                  Our Hyderabad admin team reviews your documents for authenticity and road safety standards. Once approved, your profile goes live on the homepage directory and customers in your area can call you directly!
                </p>
                <p className="text-xs text-neutral-500">
                  💡 If any document is unclear, admin provides feedback. In case of rejection, you can re-apply after 3 days.
                </p>
              </div>

              <div className="lg:col-span-6 lg:order-2 order-1 bg-neutral-50 p-6 sm:p-8 rounded-2xl border border-neutral-200 space-y-3">
                <div className="p-4 bg-white rounded-2xl border border-emerald-300 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-950">KYC Status: Approved ✓</h4>
                    <p className="text-xs text-neutral-500">Profile Published across Hyderabad Roster</p>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: Zig (Card Left, Text Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="lg:col-span-6 bg-emerald-900 text-white p-6 sm:p-8 rounded-2xl space-y-3">
                <div className="text-xs font-mono font-bold text-emerald-300">ZERO COMMISSION GUARANTEE</div>
                <div className="text-2xl font-black font-sans">100% Earnings are Yours</div>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  No 25% or 30% platform deductions. The customer pays the full association fare directly to you via Cash or UPI.
                </p>
              </div>

              <div className="lg:col-span-6 space-y-3">
                <span className="inline-block text-xs font-black font-mono px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  STEP 03 · డైరెక్ట్ కస్టమర్ కాల్స్
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 font-sans">
                  Receive Direct Customer Calls
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                  Car owners in your locality contact you directly for hourly city duties (₹700/4h), outstation trips (₹2,000/day), or permanent monthly salaries (₹20,000 – ₹40,000/month).
                </p>
              </div>
            </div>

            {/* STEP 4: Zag (Text Left, Card Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="lg:col-span-6 lg:order-1 order-2 space-y-3">
                <span className="inline-block text-xs font-black font-mono px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  STEP 04 · మీ రివ్యూ OTP ని షేర్ చేయండి
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 font-sans">
                  Share Your Permanent Review OTP
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                  Every driver receives a permanent 4-digit Review OTP in their Driver Dashboard. Share this code with satisfied car owners after completing duty so they can post 5-star ratings to boost your ranking!
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleJoin}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer"
                  >
                    <span>Join as Driver (3 Months Free)</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 lg:order-2 order-1 bg-neutral-900 text-white p-6 sm:p-8 rounded-2xl border border-neutral-700 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <KeyRound className="w-5 h-5" />
                  <span>Permanent Driver Review OTP</span>
                </div>
                <div className="p-4 bg-neutral-800 rounded-xl border border-neutral-700 flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-mono">Your Code:</span>
                  <span className="text-2xl font-black font-mono text-emerald-400 tracking-widest">[XXXX]</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Displayed in your Driver Portal. Never changes, easy to share via WhatsApp or SMS.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
