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
              href="mailto:support@manadrivers.in"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200 hover:border-neutral-400 text-xs font-semibold text-neutral-800 transition-colors shadow-2xs"
              title="Official Support Email"
            >
              <span className="text-[#FF5500] font-bold">✉</span>
              <span>support@manadrivers.in</span>
            </a>

            {/* Trips Button */}
            <button
              type="button"
              onClick={onOpenBookings}
              className="relative p-2.5 rounded-full bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 transition-colors"
              title="View Scheduled Trips"
              aria-label="View Scheduled Trips"
            >
              <Calendar className="w-4 h-4" />
              {bookingsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#111111] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {bookingsCount}
                </span>
              )}
            </button>

            {/* Solid Black Pill CTA: Book Driver or Driver Portal */}
            {activeRole === 'customer' ? (
              <a
                href="#drivers"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-neutral-800 text-white rounded-full text-sm font-medium transition-all shadow-xs"
              >
                <span>Book a driver</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => onRoleChange('customer')}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-neutral-800 text-white rounded-full text-sm font-medium transition-all shadow-xs"
              >
                <Compass className="w-4 h-4" />
                <span>Customer View</span>
              </button>
            )}

            {/* Role Switcher Pill */}
            <button
              type="button"
              onClick={() => onRoleChange(activeRole === 'customer' ? 'driver' : 'customer')}
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-full text-xs font-medium text-neutral-900 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>{activeRole === 'customer' ? 'Driver Portal' : 'Find Drivers'}</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full bg-white border border-neutral-200 text-neutral-900 hover:bg-neutral-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 bg-[#FAF9F6] animate-in fade-in duration-150">
            <div className="flex flex-col space-y-3 px-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-base font-medium text-neutral-800 hover:text-neutral-950 py-2 px-3 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  {link.name}
                </a>
              ))}

              <div className="pt-3 border-t border-neutral-200 flex flex-col gap-2">
                <a
                  href="#drivers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 bg-[#111111] text-white rounded-full text-sm font-medium"
                >
                  Book a Driver
                </a>
                <button
                  type="button"
                  onClick={() => {
                    onRoleChange(activeRole === 'customer' ? 'driver' : 'customer');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 bg-white border border-neutral-300 text-neutral-900 rounded-full text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-[#FF5500]" />
                  <span>{activeRole === 'customer' ? 'Switch to Driver Portal (from ₹49)' : 'Switch to Customer View'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
