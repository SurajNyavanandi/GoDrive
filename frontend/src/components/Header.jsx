import { useState, useEffect } from 'react';
import {
  Calendar,
  Menu,
  X,
  Compass,
  Briefcase,
  Phone,
} from 'lucide-react';

export default function Header({
  activeRole,
  onRoleChange,
  bookingsCount,
  onOpenBookings,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Drivers', href: '#drivers' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Coverage', href: '#localities' },
    { name: 'FAQ', href: '#faq' },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (activeRole !== 'customer') {
      onRoleChange('customer');
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAF9F6]/90 backdrop-blur-md border-b border-neutral-200/80 shadow-xs'
          : 'bg-[#FAF9F6]/80 backdrop-blur-xs border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left: Minimalist Brand (NOVA Reference Style) */}
          <div className="flex items-center shrink-0">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 group"
            >
              <img
                src="https://res.cloudinary.com/dfr0zghtc/image/upload/v1793252025/Minimalist_M_Steering_Wheel_Logo_tmb2mo.png"
                alt="Mana Drivers"
                className="w-8 h-8 rounded-full object-cover border border-neutral-200 shadow-2xs group-hover:scale-105 transition-transform bg-white"
              />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-neutral-950 font-sans">
                  MANA DRIVERS
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] inline-block mb-1" />
              </div>
            </a>
          </div>

          {/* Center Links (Clean text links with subtle hover) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-950 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Zone (NOVA Reference Style) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Region / Status pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-200/60 text-xs font-medium text-neutral-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>HYD · HITEC CITY</span>
            </div>

            {/* Official Support Email Pill */}
            <a
              href="mailto:supportmanadrivers@gmail.com"
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-neutral-200 hover:border-neutral-400 text-xs font-semibold text-neutral-800 transition-all hover:-translate-y-0.5 active:scale-95 shadow-2xs min-h-[38px]"
              title="Official Support Email"
            >
              <span className="text-[#FF5500] font-bold">✉</span>
              <span>supportmanadrivers@gmail.com</span>
            </a>

            {/* Solid Black Pill CTA: Book Driver or Driver Portal */}
            {activeRole === 'customer' ? (
              <a
                href="#drivers"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-neutral-800 active:scale-95 text-white rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 shadow-xs min-h-[44px]"
              >
                <span>Book a driver</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => onRoleChange('customer')}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-neutral-800 active:scale-95 text-white rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 shadow-xs min-h-[44px]"
              >
                <Compass className="w-4 h-4" />
                <span>Customer View</span>
              </button>
            )}

            {/* Role Switcher Pill */}
            <button
              type="button"
              onClick={() => onRoleChange(activeRole === 'customer' ? 'driver' : 'customer')}
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-neutral-100 active:scale-95 border border-neutral-300 rounded-full text-xs font-medium text-neutral-900 transition-all hover:-translate-y-0.5 min-h-[38px]"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>{activeRole === 'customer' ? 'Driver Portal' : 'Find Drivers'}</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 rounded-full bg-white border border-neutral-200 text-neutral-900 hover:bg-neutral-100 active:scale-90 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 bg-[#FAF9F6]/95 backdrop-blur-lg animate-scale-up duration-200 shadow-lg rounded-b-2xl">
            <div className="flex flex-col space-y-2 px-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-base font-medium text-neutral-800 hover:text-neutral-950 py-3 px-4 rounded-xl hover:bg-neutral-100/80 active:bg-neutral-200/60 transition-all flex items-center justify-between min-h-[44px]"
                >
                  <span>{link.name}</span>
                  <span className="text-neutral-400 text-xs">→</span>
                </a>
              ))}

              <div className="pt-3 border-t border-neutral-200/80 flex flex-col gap-2.5">
                <a
                  href="#drivers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3.5 bg-[#111111] hover:bg-neutral-800 active:scale-98 text-white rounded-full text-sm font-semibold transition-all shadow-md min-h-[44px] flex items-center justify-center"
                >
                  Book a Driver
                </a>
                <button
                  type="button"
                  onClick={() => {
                    onRoleChange(activeRole === 'customer' ? 'driver' : 'customer');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-3 bg-white border border-neutral-300 active:scale-98 text-neutral-900 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-2xs min-h-[44px]"
                >
                  <Briefcase className="w-4 h-4 text-[#FF5500]" />
                  <span>{activeRole === 'customer' ? 'Switch to Driver Portal (from ₹49)' : 'Switch to Customer View'}</span>
                </button>
                <a
                  href="mailto:supportmanadrivers@gmail.com"
                  className="text-center py-2 text-xs text-neutral-600 font-medium flex items-center justify-center gap-1.5"
                >
                  <span className="text-[#FF5500]">✉</span>
                  <span>supportmanadrivers@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
