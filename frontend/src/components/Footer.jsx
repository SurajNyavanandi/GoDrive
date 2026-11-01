import { Mail, Phone } from 'lucide-react';

export default function Footer({ onSwitchToDriver }) {
  return (
    <footer className="w-full bg-[#0A0A0A] text-white border-t border-neutral-800/80 font-sans py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand Logo & Minimal Tagline */}
        <div className="flex items-center gap-3">
          <img
            src="https://res.cloudinary.com/dfr0zghtc/image/upload/v1793252025/Minimalist_M_Steering_Wheel_Logo_tmb2mo.png"
            alt="Mana Drivers"
            className="w-8 h-8 rounded-full object-cover border border-white/20 bg-white"
          />
          <div>
            <span className="font-bold text-sm tracking-tight text-white font-sans block">
              MANA DRIVERS
            </span>
            <span className="text-[10px] text-neutral-400 block">
              Verified Private Car Drivers · Hyderabad
            </span>
          </div>
        </div>

        {/* Center: Essential Links */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-400 font-medium">
          <a href="#services" className="hover:text-white transition-colors">
            Services
          </a>
          <a href="#drivers" className="hover:text-white transition-colors">
            Drivers
          </a>
          <a href="#reviews" className="hover:text-white transition-colors">
            Reviews
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
          <button
            type="button"
            onClick={onSwitchToDriver}
            className="text-emerald-400 hover:text-emerald-300 transition-colors font-bold cursor-pointer"
          >
            Driver Portal
          </button>
        </div>

        {/* Right: Phone, Email & Copyright (Matches Google Business Profile) */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
          <a
            href="tel:+919963254183"
            className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors font-medium"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>099632 54183</span>
          </a>
          <span>·</span>
          <a
            href="mailto:supportmanadrivers@gmail.com"
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>supportmanadrivers@gmail.com</span>
          </a>
          <span>·</span>
          <span className="text-neutral-500">© {new Date().getFullYear()} manadrivers.com</span>
        </div>
      </div>
    </footer>
  );
}

