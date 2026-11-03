import { Mail } from 'lucide-react';

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
              Verified Private Car Drivers · Greater Hyderabad
            </span>
          </div>
        </div>

        {/* Center: Essential Links & Social Media Icons */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 font-medium">
            <a href="#services" className="hover:text-white transition-colors">
              Services
            </a>
            <a href="#drivers" className="hover:text-white transition-colors">
              Drivers
            </a>
            <a href="#reviews" className="hover:text-white transition-colors">
              Ratings & Reviews
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

          {/* Requirement 6: Social Media Links (LinkedIn, Instagram, Facebook, YouTube) */}
          <div className="flex items-center gap-4 text-neutral-400">
            <a
              href="https://linkedin.com/company/manadrivers"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:text-white transition-all text-xs flex items-center justify-center"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>
            <a
              href="https://instagram.com/manadrivers"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:text-white transition-all text-xs flex items-center justify-center"
              aria-label="Instagram"
              title="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://facebook.com/manadrivers"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:text-white transition-all text-xs flex items-center justify-center"
              aria-label="Facebook"
              title="Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://youtube.com/@manadrivers"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:text-white transition-all text-xs flex items-center justify-center"
              aria-label="YouTube"
              title="YouTube"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right: Email Support Only (Requirement 1: No personal phone numbers) */}
        <div className="flex flex-col md:items-end gap-1.5 text-xs text-neutral-400">
          <a
            href="mailto:supportmanadrivers@gmail.com"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-white transition-all font-medium"
          >
            <Mail className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>supportmanadrivers@gmail.com</span>
          </a>
          <span className="text-[11px] text-neutral-500 font-normal">
            Official Customer Support Email
          </span>
          <span className="text-[10px] text-neutral-600">
            © {new Date().getFullYear()} manadrivers.com · All Rights Reserved
          </span>
        </div>
      </div>
    </footer>
  );
}
