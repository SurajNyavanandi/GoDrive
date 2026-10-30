import { useState, useEffect } from 'react';
import { Menu, X, Compass, Briefcase } from 'lucide-react';

export default function Header({
  activeRole,
  onRoleChange,
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

  const isLightHeader = activeRole === 'admin' || activeRole === 'driver';

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLightHeader
          ? 'bg-white/95 backdrop-blur-md border-b border-neutral-200/90 shadow-2xs text-neutral-950'
          : scrolled
          ? 'bg-[#0A0A0A]/90 backdrop-blur-md border-b border-neutral-800/80 shadow-lg text-white'
          : 'bg-transparent border-b border-transparent text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left: Minimalist Brand Logo & Name */}
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
                className={`w-8 h-8 rounded-full object-cover border shadow-xs group-hover:scale-105 transition-transform bg-white ${
                  isLightHeader ? 'border-neutral-300' : 'border-white/20'
                }`}
              />
              <div className="flex items-center gap-1.5">
                <span className={`font-bold text-lg sm:text-xl tracking-tight font-sans ${
                  isLightHeader ? 'text-neutral-950' : 'text-white'
                }`}>
                  MANA DRIVERS
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] inline-block mb-1" />
              </div>
            </a>
          </div>

          {/* Center Links: Minimalist Terms */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-sm font-medium transition-colors ${
                  isLightHeader
                    ? 'text-neutral-700 hover:text-neutral-950'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action: Clean Single CTA Button */}
          <div className="flex items-center gap-3 shrink-0">
            {activeRole === 'customer' ? (
              <a
                href="#drivers"
                className={`hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 shadow-xs min-h-[44px] ${
                  isLightHeader
                    ? 'bg-neutral-950 text-white hover:bg-neutral-800'
                    : 'bg-white text-neutral-950 hover:bg-neutral-200'
                }`}
              >
                <span>Book Driver</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => onRoleChange('customer')}
                className={`hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 shadow-xs min-h-[44px] ${
                  isLightHeader
                    ? 'bg-neutral-950 text-white hover:bg-neutral-800'
                    : 'bg-white text-neutral-950 hover:bg-neutral-200'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Customer View</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onRoleChange(activeRole === 'customer' ? 'driver' : 'customer')}
              className={`hidden lg:inline-flex items-center gap-1.5 px-4 py-2 backdrop-blur-md border active:scale-95 rounded-full text-xs font-semibold transition-all hover:-translate-y-0.5 min-h-[38px] ${
                isLightHeader
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-950'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>{activeRole === 'customer' ? 'Driver Portal' : 'Find Drivers'}</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-3 rounded-full backdrop-blur-md border active:scale-90 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isLightHeader
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-950'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden py-4 border-t backdrop-blur-xl animate-scale-up duration-200 shadow-xl rounded-b-2xl ${
            isLightHeader
              ? 'bg-white/98 border-neutral-200 text-neutral-950'
              : 'bg-[#0A0A0A]/95 border-neutral-800 text-white'
          }`}>
            <div className="flex flex-col space-y-1.5 px-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`text-base font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-between min-h-[44px] ${
                    isLightHeader
                      ? 'text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100'
                      : 'text-neutral-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{link.name}</span>
                  <span className="text-neutral-400 text-xs">→</span>
                </a>
              ))}

              <div className={`pt-3 border-t flex flex-col gap-2.5 ${isLightHeader ? 'border-neutral-200' : 'border-neutral-800'}`}>
                <a
                  href="#drivers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3.5 bg-neutral-950 hover:bg-neutral-800 active:scale-98 text-white rounded-full text-sm font-bold transition-all shadow-md min-h-[44px] flex items-center justify-center"
                >
                  Book Driver
                </a>
                <button
                  type="button"
                  onClick={() => {
                    onRoleChange(activeRole === 'customer' ? 'driver' : 'customer');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-center py-3 border active:scale-98 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                    isLightHeader
                      ? 'bg-neutral-100 border-neutral-300 text-neutral-950 hover:bg-neutral-200'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-[#FF5500]" />
                  <span>{activeRole === 'customer' ? 'Switch to Driver Portal' : 'Switch to Customer View'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
