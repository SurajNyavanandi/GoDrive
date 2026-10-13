import { useState, useEffect } from 'react';
import {
  Calendar,
  Menu,
  X,
  Compass,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  Car,
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
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Drivers', href: '#drivers' },
    { name: 'Areas', href: '#localities' },
    { name: 'Pricing', href: '#pricing' },
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
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-[#0A0A0A]/95 backdrop-blur-md border-b border-neutral-800 shadow-md'
          : 'bg-[#0A0A0A] border-b border-neutral-850'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Left: Bold Brand Mark (Reference Image 3) */}
          <div className="flex items-center shrink-0">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#FF5500] text-black font-black text-sm flex items-center justify-center tracking-tighter shrink-0">
                MD
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white text-sm sm:text-base tracking-wider uppercase leading-none">
                  MANA <span className="text-[#FF5500]">DRIVER</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-medium mt-1">
                  Drivers for Your Car
                </span>
              </div>
            </a>
          </div>

          {/* Center Links (Reference Image 3: Services, Drivers, Localities, Pricing) */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-xs uppercase tracking-wider font-semibold text-neutral-300 hover:text-white transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#FF5500] after:absolute after:bottom-0 after:left-0 after:transition-all"
              >
                {link.name}
              </a>
            ))}

            {/* Segmented Role Switcher: Hire Driver | Driver Portal */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 p-0.5 rounded-none ml-2">
              <button
                type="button"
                onClick={() => onRoleChange('customer')}
                className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all ${
                  activeRole === 'customer'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Compass className="w-3 h-3 text-[#FF5500]" />
                <span>Hire Driver</span>
              </button>
              <button
                type="button"
                data-role="driver"
                onClick={() => onRoleChange('driver')}
                className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all ${
                  activeRole === 'driver'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-3 h-3 text-[#FF5500]" />
                <span>Driver Portal</span>
                <span className="text-[9px] bg-[#FF5500]/20 text-[#FF5500] px-1.5 py-0.5 font-mono font-bold">₹49</span>
              </button>
            </div>
          </nav>

          {/* Right Action Zone */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* High-Contrast Rectangular Solid Orange CTA */}
            <a
              href="#drivers"
              className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-[#FF5500] hover:bg-[#E04B00] text-black font-black text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              <Car className="w-3.5 h-3.5 text-black" />
              <span>Hire a Driver</span>
            </a>

            {/* Trips Drawer Button */}
            <button
              type="button"
              onClick={onOpenBookings}
              className="relative px-2.5 sm:px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
              aria-label="View trips"
            >
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden md:inline">Trips</span>
              {bookingsCount > 0 && (
                <span className="w-4 h-4 bg-[#FF5500] text-black text-[10px] font-black flex items-center justify-center">
                  {bookingsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0F0F0F] border-b border-neutral-800 px-4 pt-3 pb-6 animate-in slide-in-from-top duration-200">
          <div className="space-y-1 mb-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="flex items-center justify-between py-2.5 px-3 text-xs uppercase tracking-wider font-bold text-neutral-300 hover:text-white hover:bg-neutral-900 border-b border-neutral-900"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              </a>
            ))}
          </div>

          {/* Mobile Role Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900 border border-neutral-800 mb-4">
            <button
              type="button"
              onClick={() => {
                onRoleChange('customer');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold uppercase tracking-wider ${
                activeRole === 'customer'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Hire Driver</span>
            </button>
            <button
              type="button"
              data-role="driver"
              onClick={() => {
                onRoleChange('driver');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold uppercase tracking-wider ${
                activeRole === 'driver'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Driver Portal (List for ₹49)</span>
            </button>
          </div>

          {/* Mobile Quick Action */}
          <a
            href="#drivers"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#FF5500] hover:bg-[#E04B00] text-black font-black text-xs uppercase tracking-wider"
          >
            <Car className="w-4 h-4 text-black" />
            <span>Hire a Driver</span>
          </a>

          <div className="mt-4 pt-3 border-t border-neutral-850 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Telangana Police Verified</span>
            </span>
            <span className="text-neutral-500">Hitec City · RGIA · Banjara</span>
          </div>
        </div>
      )}
    </header>
  );
}
