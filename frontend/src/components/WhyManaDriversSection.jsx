import {
  ShieldCheck,
  Percent,
  Car,
  Clock,
  MapPin,
  Sparkles,
  Users,
  Award,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function WhyManaDriversSection({ onBookNow, onBecomeDriver }) {
  const benefits = [
    {
      icon: Percent,
      title: '₹0 Commission (Direct Pay)',
      highlight: '100% to Driver',
      description: 'You pay the driver directly via PhonePe, Google Pay, Paytm, or Cash. No platform cuts, no surge pricing, and no hidden trip taxes.',
      tag: 'Customer & Driver Favorite',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      icon: ShieldCheck,
      title: 'Aadhaar & License Verified',
      highlight: '100% Background Checked',
      description: 'Every driver on Mana Drivers has their physical Aadhaar, driver license credentials, and address verified before any trip dispatch.',
      tag: 'Safety First',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      icon: Car,
      title: 'Personal Car Privacy & Comfort',
      highlight: 'Your Vehicle, Your Rules',
      description: 'Travel in the comfort, hygiene, and privacy of your personal car with your family, pets, and luggage without relying on dirty or surge-priced cabs.',
      tag: 'Pure Comfort',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      icon: Clock,
      title: 'Clear Hourly Slots (4, 6, 8 Hrs)',
      highlight: 'No Complicated Math',
      description: 'Choose 4-hour quick errands, 6-hour outings, or 8-hour full day city duties. Fixed starting rates with transparent overtime if you need more time.',
      tag: 'Flexible Duty',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      icon: Award,
      title: 'All Transmissions: Manual, Auto & EV',
      highlight: 'Expert Handling',
      description: 'Our drivers have 5+ years of verified driving experience across compact hatchbacks, sedans, luxury SUVs, and modern electric cars.',
      tag: 'Any Car Model',
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    {
      icon: MapPin,
      title: '30-Min Doorstep Dispatch',
      highlight: '300+ Hyderabad Areas',
      description: 'From Hitec City, Gachibowli, and Jubilee Hills to Kompally and Shamshabad Airport, verified local drivers arrive right at your doorstep.',
      tag: 'Citywide Coverage',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200'
    },
    {
      icon: Users,
      title: 'Monthly Dedicated Chauffeurs',
      highlight: 'Negotiable Salary Ranges',
      description: 'Hire permanent monthly family drivers for 4h (₹20k–₹25k), 8h (₹25k–₹30k), or 12h (₹30k–₹40k) daily shifts with 1 weekly off.',
      tag: 'Long-term Solution',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      icon: Lock,
      title: 'OTP-Verified Honest Reviews',
      highlight: 'No Fake Ratings',
      description: 'Customers can only submit feedback after entering the driver’s permanent registration OTP, ensuring 100% genuine verified reviews.',
      tag: 'Trust & Authenticity',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
    }
  ];

  return (
    <section id="why-us" className="w-full bg-[#FAF9F6] py-16 sm:py-24 border-b border-neutral-200 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>USES & ADVANTAGES OF MANA DRIVERS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 font-sans">
            Why Thousands of Hyderabad Car Owners Choose Mana Drivers
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            We solve the biggest pains of city travel—traffic exhaustion, parking hassles, night-time driving, and cab cancellations—while giving you complete peace of mind in your own vehicle.
          </p>
        </div>

        {/* 8 Benefits Infinite Carousel */}
        <div className="w-full overflow-hidden mask-gradient-x py-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-marquee-carousel gap-6">
            {/* First Set of 8 Benefit Cards */}
            {benefits.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={`benefit-a-${idx}`}
                  className="w-[300px] sm:w-[350px] shrink-0 bg-white rounded-3xl p-6 border border-neutral-200/90 hover:border-neutral-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-neutral-950 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5 text-[#FF5500]" />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                        {item.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-neutral-950 font-sans tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs font-bold text-emerald-600 font-sans mt-0.5">
                        {item.highlight}
                      </p>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center gap-1.5 text-xs font-semibold text-neutral-900 group-hover:text-[#FF5500] transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Verified Service Benefit</span>
                  </div>
                </div>
              );
            })}

            {/* Duplicated Set of 8 Benefit Cards for Smooth Seamless Infinite Loop */}
            {benefits.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={`benefit-b-${idx}`}
                  aria-hidden="true"
                  className="w-[300px] sm:w-[350px] shrink-0 bg-white rounded-3xl p-6 border border-neutral-200/90 hover:border-neutral-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-neutral-950 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5 text-[#FF5500]" />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                        {item.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-neutral-950 font-sans tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs font-bold text-emerald-600 font-sans mt-0.5">
                        {item.highlight}
                      </p>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center gap-1.5 text-xs font-semibold text-neutral-900 group-hover:text-[#FF5500] transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Verified Service Benefit</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Direct Action Banner */}
        <div className="rounded-3xl bg-neutral-950 text-white p-8 sm:p-12 border border-neutral-800 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight">
              Ready to experience relaxed travel in your car?
            </h3>
            <p className="text-sm sm:text-base text-neutral-300 max-w-xl">
              Get an experienced, verified Hyderabad driver at your doorstep in under 30 minutes. 4, 6, or 8-hour duty slots with direct UPI pay.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
            {onBookNow && (
              <button
                type="button"
                onClick={onBookNow}
                className="w-full sm:w-auto px-8 py-4 bg-[#FF5500] hover:bg-[#e04b00] active:scale-95 text-white font-bold rounded-full text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book a Driver Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {onBecomeDriver && (
              <button
                type="button"
                onClick={onBecomeDriver}
                className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md text-white font-bold rounded-full text-sm border border-white/20 transition-all flex items-center justify-center cursor-pointer"
              >
                <span>Apply as Driver (3-Mo Free)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
