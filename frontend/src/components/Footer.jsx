import { Mail, Heart } from 'lucide-react';

export default function Footer({ onSwitchToDriver, onOpenBookings }) {
  return (
    <footer className="w-full bg-[#0A0A0A] text-white border-t border-neutral-800 font-sans">
      {/* TOP CALL TO ACTION STRIP */}
      <div className="w-full bg-[#111111] border-b border-neutral-800 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>HYDERABAD DOORSTEP PICKUP IN 30 MINS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Need a Professional Driver for Your Car?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
              Book verified hourly or monthly chauffeurs in Hitec City, Gachibowli, Jubilee Hills, and RGIA Airport. Pay directly with ₹0 extra commission.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="#drivers"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#FF5500] hover:bg-[#E04B00] active:scale-95 text-white rounded-full text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-[#FF5500]/25 text-center min-h-[44px] flex items-center justify-center"
            >
              Book Driver Now
            </a>
            <button
              type="button"
              onClick={onSwitchToDriver}
              className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/20 text-white rounded-full text-xs sm:text-sm font-semibold transition-all text-center min-h-[44px] flex items-center justify-center"
            >
              Driver Registration (3 Months Free)
            </button>
          </div>
        </div>
      </div>

      {/* 2-COLUMN MAIN FOOTER TOP DIVISION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 border-b border-neutral-800">
        {/* LEFT DIVISION: Brand Mark, Bio, Action Button, Categorized Links */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://res.cloudinary.com/dfr0zghtc/image/upload/v1793252025/Minimalist_M_Steering_Wheel_Logo_tmb2mo.png"
                alt="Mana Drivers"
                className="w-10 h-10 rounded-full object-cover border border-white/20 bg-white"
              />
              <div>
                <span className="font-bold text-xl tracking-tight text-white font-sans block">
                  MANA DRIVERS
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-medium">
                  HYDERABAD CHAUFFEURS
                </span>
              </div>
            </div>

            <p className="text-neutral-400 leading-relaxed text-xs sm:text-sm max-w-md">
              Supporting your daily travel with verified chauffeurs, seamless doorstep arrival, and complete key handover safety every day.
            </p>

            <div>
              <a
                href="#drivers"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-200 transition-all min-h-[40px]"
              >
                Book Chauffeur
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-2 text-xs">
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Quick Links
              </h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#drivers" className="hover:text-white transition-colors">Drivers</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Company
              </h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#localities" className="hover:text-white transition-colors">Coverage</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Support
              </h4>
              <ul className="space-y-2 text-neutral-400">
                <li><button type="button" onClick={onOpenBookings} className="hover:text-white transition-colors text-left">My Bookings</button></li>
                <li><button type="button" onClick={onSwitchToDriver} className="hover:text-white transition-colors text-left text-emerald-400">Driver Portal</button></li>
                <li><a href="mailto:supportmanadrivers@gmail.com" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT DIVISION: Minimalist Official Support & City Hubs */}
        <div className="space-y-8 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF5500] block">
              OFFICIAL HYDERABAD SUPPORT
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              Always Here to Help You Drive Safe
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Have questions about driver verification or hourly packages? Reach out to our 24/7 dedicated support team.
            </p>

            <a
              href="mailto:supportmanadrivers@gmail.com"
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#111111] hover:bg-neutral-800 border border-neutral-800 rounded-full text-xs font-bold text-white transition-all shadow-xs"
            >
              <Mail className="w-4 h-4 text-[#FF5500]" />
              <span>supportmanadrivers@gmail.com</span>
            </a>
          </div>

          <div className="space-y-3 pt-4 border-t border-neutral-800">
            {/* Physical Address Hub Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#111111] p-4 rounded-2xl border border-neutral-800 space-y-1">
                <span className="font-bold text-white uppercase text-[10px] tracking-wider block">HITEC CITY HUB</span>
                <p className="text-neutral-400 text-[11px]">Cyber Towers, Hitec City, Hyderabad - 500081</p>
              </div>

              <div className="bg-[#111111] p-4 rounded-2xl border border-neutral-800 space-y-1">
                <span className="font-bold text-white uppercase text-[10px] tracking-wider block">FINANCIAL DISTRICT HUB</span>
                <p className="text-neutral-400 text-[11px]">Gachibowli Main Rd, Hyderabad - 500032</p>
              </div>
            </div>

            {/* Rounded Social Icon Badges */}
            <div className="flex items-center gap-2 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-[#111111] border border-neutral-800 hover:border-white text-neutral-300 hover:text-white flex items-center justify-center text-xs transition-all">
                𝕏
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#111111] border border-neutral-800 hover:border-white text-neutral-300 hover:text-white flex items-center justify-center text-xs transition-all">
                f
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#111111] border border-neutral-800 hover:border-white text-neutral-300 hover:text-white flex items-center justify-center text-xs transition-all">
                in
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM COPYRIGHT BAR */}
      <div className="w-full bg-[#0A0A0A] py-6 px-4 sm:px-6 lg:px-8 text-neutral-500 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} MANA DRIVERS HYDERABAD. All rights reserved.</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-neutral-400">
              Made with <Heart className="w-3 h-3 text-[#FF5500] fill-[#FF5500]" /> for Hyderabad Car Owners
            </span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400 font-medium">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111111] border border-neutral-800 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Operational across 24 Hyderabad Localities</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
