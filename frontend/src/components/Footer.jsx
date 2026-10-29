import { Phone, Mail, MapPin, ShieldCheck, ArrowUpRight, Check, Heart } from 'lucide-react';

export default function Footer({ onSwitchToDriver, onOpenBookings }) {
  return (
    <footer className="w-full bg-neutral-950 text-white border-t border-neutral-800 font-sans">
      {/* TOP CALL TO ACTION STRIP */}
      <div className="w-full bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-b border-neutral-800/80 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>HYDERABAD DOORSTEP PICKUP IN 30 MINS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Need a Professional Driver for Your Car?
            </h2>
            <p className="text-sm text-neutral-400 max-w-xl">
              Book verified hourly or monthly chauffeurs in Hitec City, Gachibowli, Jubilee Hills, and RGIA Airport. Pay directly with ₹0 extra commission.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="#drivers"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#FF5500] hover:bg-[#E04B00] active:scale-95 text-white rounded-full text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-[#FF5500]/25 hover:shadow-xl hover:shadow-[#FF5500]/40 text-center"
            >
              Book Driver Now
            </a>
            <button
              type="button"
              onClick={onSwitchToDriver}
              className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/20 text-white rounded-full text-xs sm:text-sm font-semibold transition-all text-center"
            >
              Driver Registration (3 Months Free)
            </button>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER LINKS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 text-xs">
        {/* COLUMN 1: BRAND IDENTITY & SAFETY */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/dfr0zghtc/image/upload/v1793252025/Minimalist_M_Steering_Wheel_Logo_tmb2mo.png"
              alt="Mana Drivers"
              className="w-9 h-9 rounded-full object-cover border border-white/20 bg-white"
            />
            <div>
              <span className="font-bold text-lg tracking-tight text-white font-sans block">
                MANA DRIVERS
              </span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-medium">
                HYDERABAD CHAUFFEURS
              </span>
            </div>
          </div>

          <p className="text-neutral-400 leading-relaxed text-xs">
            Hyderabad's premier platform for verified private car drivers. Hire daily hourly chauffeurs or permanent monthly family drivers with doorstep arrival.
          </p>

          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2 text-neutral-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Aadhaar & Police Verified</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300 font-medium">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero Commission on Fare Payments</span>
            </div>
          </div>

          <div className="pt-2 space-y-1.5 text-neutral-300">
            <a
              href="tel:+919963254183"
              className="flex items-center gap-2 hover:text-white transition-colors text-xs font-semibold"
            >
              <Phone className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Helpline: +91 99632 54183</span>
            </a>
            <a
              href="mailto:support@manadrivers.in"
              className="flex items-center gap-2 hover:text-white transition-colors text-xs font-medium text-neutral-400"
            >
              <Mail className="w-3.5 h-3.5 text-neutral-400" />
              <span>support@manadrivers.in</span>
            </a>
          </div>
        </div>

        {/* COLUMN 2: OUR CHAUFFEUR SERVICES */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans border-b border-neutral-800 pb-2">
            Driver Services
          </h3>
          <ul className="space-y-2.5 text-neutral-400">
            <li>
              <a href="#drivers" className="hover:text-white transition-colors flex items-center justify-between group">
                <span>Hourly In-City Commute</span>
                <span className="text-[10px] text-neutral-500 group-hover:text-amber-400 font-mono">₹160 - ₹180/hr</span>
              </a>
            </li>
            <li>
              <a href="#drivers" className="hover:text-white transition-colors flex items-center justify-between group">
                <span>Monthly Permanent Chauffeur</span>
                <span className="text-[10px] text-neutral-500 group-hover:text-amber-400 font-mono">₹18k - ₹22k/mo</span>
              </a>
            </li>
            <li>
              <a href="#drivers" className="hover:text-white transition-colors flex items-center justify-between group">
                <span>RGIA Airport Pickup & Drop</span>
                <span className="text-[10px] text-neutral-500 group-hover:text-emerald-400 font-mono">Flat ₹600 - ₹800</span>
              </a>
            </li>
            <li>
              <a href="#drivers" className="hover:text-white transition-colors flex items-center justify-between group">
                <span>Outstation Highway Trips</span>
                <span className="text-[10px] text-neutral-500 group-hover:text-white font-mono">₹1,400 - ₹1,800/day</span>
              </a>
            </li>
            <li>
              <a href="#drivers" className="hover:text-white transition-colors flex items-center justify-between group">
                <span>Night Driving & Events</span>
                <span className="text-[10px] text-emerald-400 font-semibold">24/7 Available</span>
              </a>
            </li>
          </ul>
        </div>

        {/* COLUMN 3: HYDERABAD LOCALITIES */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans border-b border-neutral-800 pb-2">
            Hyderabad Localities
          </h3>
          <div className="flex flex-wrap gap-1.5 pt-1">
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
              'RGIA Airport',
              'Kompally',
              'LB Nagar',
            ].map((loc) => (
              <a
                key={loc}
                href="#drivers"
                className="px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all text-[11px]"
              >
                {loc}
              </a>
            ))}
          </div>
        </div>

        {/* COLUMN 4: FOR DRIVERS & LEGAL */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans border-b border-neutral-800 pb-2">
            For Drivers & Legal
          </h3>
          <ul className="space-y-2.5 text-neutral-400">
            <li>
              <button
                type="button"
                onClick={onSwitchToDriver}
                className="hover:text-white transition-colors flex items-center gap-1.5 text-left text-emerald-400 font-semibold"
              >
                <span>Driver Registration (3 Months Free)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={onSwitchToDriver}
                className="hover:text-white transition-colors text-left"
              >
                Driver Login Portal
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={onOpenBookings}
                className="hover:text-white transition-colors text-left"
              >
                My Scheduled Trips & Bookings
              </button>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Terms & Conditions of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Driver Background Check Code
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM COPYRIGHT BAR */}
      <div className="w-full bg-neutral-950 border-t border-neutral-900 py-6 px-4 sm:px-6 lg:px-8 text-neutral-500 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} MANA DRIVERS HYDERABAD. All rights reserved.</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-neutral-400">
              Made with <Heart className="w-3 h-3 text-[#FF5500] fill-[#FF5500]" /> for Hyderabad Car Owners
            </span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400 font-medium">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Operational in 24 Hyderabad Zones</span>
            </div>
            <span>·</span>
            <span>Cyber Towers, Hitec City, Hyderabad - 500081</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
