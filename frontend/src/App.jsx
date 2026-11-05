import { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import Header from './components/Header';
import CustomerView from './components/CustomerView';
import DriverPortal from './components/DriverPortal';
import AdminPortal from './components/AdminPortal';
import BookingModal from './components/BookingModal';
import MyBookingsSheet from './components/MyBookingsSheet';
import ConversionSuccessView from './components/ConversionSuccessView';
import ReviewModal from './components/ReviewModal';
import { Mail, MessageCircle, Copy, Check, Star, Car, X, ShieldCheck } from 'lucide-react';
import { fetchAdminBookingsApi, createBookingApi, fetchPublicDrivers, fetchPricingSettingsApi } from './utils/api';
import { initialDrivers } from './data/mockDrivers';
import Footer from './components/Footer';

export default function App() {
  // Current URL Path for Google & Meta Ads tracking
  const [currentPath, setCurrentPath] = useState(() => {
    try {
      return window.location.pathname.toLowerCase();
    } catch {
      return '/';
    }
  });

  // Active Role: 'customer' | 'driver' | 'admin'
  const [activeRole, setActiveRole] = useState(() => {
    try {
      const pathname = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'driver' || urlRole === 'admin') return urlRole;
      if (params.get('action') === 'apply' || pathname === '/driver/signup' || pathname === '/apply') return 'driver';
      if (window.location.hash === '#driver-portal' || window.location.hash === '#apply') return 'driver';
    } catch {
      // fallback
    }
    return localStorage.getItem('godrive_role') || 'customer';
  });

  // Dynamic drivers, bookings & pricing settings from backend database
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pricingSettings, setPricingSettings] = useState(null);
  const [selectedDriverForBooking, setSelectedDriverForBooking] = useState(null);
  const [isBookingsSheetOpen, setIsBookingsSheetOpen] = useState(false);
  const [isGlobalReviewOpen, setIsGlobalReviewOpen] = useState(false);
  const [lastConfirmedBooking, setLastConfirmedBooking] = useState(null);

  const [initialService] = useState(() => {
    try {
      const pathname = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const serviceParam = params.get('service');
      if (serviceParam) return serviceParam.toLowerCase();
      if (pathname === '/hourly' || pathname === '/city') return 'hourly';
      if (pathname === '/outstation') return 'outstation';
      if (pathname === '/monthly' || pathname === '/permanent') return 'monthly';
    } catch (err) {
      console.warn('Error reading service URL param:', err);
    }
    return 'all';
  });

  // URL Navigation helper to support Meta Ads & Google Ads landing & conversion URLs
  const navigateTo = useCallback((path, role = null) => {
    try {
      window.history.pushState({}, '', path);
      setCurrentPath(path.toLowerCase());
      if (role) {
        setActiveRole(role);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.warn('Navigation error:', err);
    }
  }, []);

  // Listen to browser popstate (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      try {
        const path = window.location.pathname.toLowerCase();
        setCurrentPath(path);
        if (path === '/driver/signup' || path === '/apply') {
          setActiveRole('driver');
        } else if (path === '/book') {
          setActiveRole('customer');
          setSelectedDriverForBooking(drivers[0] || initialDrivers[0]);
        } else if (path === '/reviews') {
          setIsGlobalReviewOpen(true);
        }
      } catch (err) {
        console.warn('Popstate error:', err);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [drivers]);

  // Load live dynamic drivers, bookings & pricing settings from backend database on mount
  useEffect(() => {
    let isMounted = true;
    async function loadLiveData() {
      try {
        const [driversData, bookingsRes, pricingData] = await Promise.all([
          fetchPublicDrivers(),
          fetchAdminBookingsApi().catch(() => ({ data: [] })),
          fetchPricingSettingsApi().catch(() => null),
        ]);
        if (isMounted) {
          if (Array.isArray(driversData)) {
            setDrivers(driversData);
          }
          if (bookingsRes && Array.isArray(bookingsRes.data)) {
            setBookings(bookingsRes.data);
          }
          if (pricingData) {
            setPricingSettings(pricingData);
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic data from backend:', err);
      }
    }
    loadLiveData();
    return () => {
      isMounted = false;
    };
  }, [activeRole]);

  // URL Path, Query Parameters & UTM Attribution Capture for Google Ads & Meta Ads:
  useEffect(() => {
    try {
      const pathname = window.location.pathname.toLowerCase();
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;

      // 1. Capture UTM & Ad Click IDs for Google Ads (gclid, gbraid, wbraid) & Meta Ads (fbclid)
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');
      const gclid = urlParams.get('gclid');
      const fbclid = urlParams.get('fbclid');

      if (utmSource || gclid || fbclid) {
        const attribution = {
          utm_source: utmSource || '',
          utm_medium: utmMedium || '',
          utm_campaign: utmCampaign || '',
          utm_term: urlParams.get('utm_term') || '',
          utm_content: urlParams.get('utm_content') || '',
          gclid: gclid || '',
          fbclid: fbclid || '',
          timestamp: new Date().toISOString(),
          landingUrl: window.location.href,
        };
        sessionStorage.setItem('mana_ad_attribution', JSON.stringify(attribution));
      }

      // 2. Direct Landing URL actions
      setTimeout(() => {
        if (pathname === '/book' || urlParams.get('action') === 'book' || hash === '#book') {
          setSelectedDriverForBooking(drivers[0] || initialDrivers[0]);
        } else if (pathname === '/reviews' || hash === '#reviews') {
          setIsGlobalReviewOpen(true);
        } else if (pathname === '/driver/signup' || pathname === '/apply') {
          setActiveRole('driver');
        }
      }, 300);
    } catch (e) {
      console.warn('URL param parse error:', e);
    }
  }, [drivers]);

  // Global Keyboard Shortcut: Ctrl + Shift + S to toggle Admin Console
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        setActiveRole((prev) => {
          const next = prev === 'admin' ? 'customer' : 'admin';
          toast.success(next === 'admin' ? 'Admin Console unlocked' : 'Switched to Customer View');
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync role to localStorage
  useEffect(() => {
    localStorage.setItem('godrive_role', activeRole);
  }, [activeRole]);

  // Handlers
  const handleRoleChange = (role) => {
    setActiveRole(role);
    if (role === 'driver') {
      window.history.pushState({}, '', '/driver/signup');
      setCurrentPath('/driver/signup');
    } else if (role === 'customer') {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (driver) => {
    setSelectedDriverForBooking(driver || drivers[0] || initialDrivers[0]);
    try {
      window.history.pushState({}, '', '/book');
      setCurrentPath('/book');
    } catch {
      // ignore
    }
  };

  const handleCloseBooking = () => {
    setSelectedDriverForBooking(null);
    if (currentPath === '/book') {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
    }
  };

  const handleBookingConfirmed = async (newBooking) => {
    try {
      // Attach ad attribution if present
      let bookingWithAttribution = { ...newBooking };
      try {
        const storedAttribution = sessionStorage.getItem('mana_ad_attribution');
        if (storedAttribution) {
          bookingWithAttribution.adAttribution = JSON.parse(storedAttribution);
        }
      } catch {
        // ignore
      }

      // Safe trigger for Google Ads & Meta Pixel conversion tracking
      if (typeof window !== 'undefined') {
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'conversion', {
            event_category: 'DriverBooking',
            event_label: newBooking.tripType || 'Driver Booking',
            value: newBooking.estimatedFare || 700,
            currency: 'INR',
          });
        }
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'Purchase', {
            content_name: newBooking.tripType || 'Driver Booking',
            currency: 'INR',
            value: newBooking.estimatedFare || 700,
          });
        }
      }

      const res = await createBookingApi(bookingWithAttribution);
      const savedBooking = res.booking || bookingWithAttribution;
      setBookings((prev) => [savedBooking, ...prev]);
      setLastConfirmedBooking(savedBooking);

      // Route to /booking-success for Google & Meta Ads tracking
      window.history.pushState({}, '', '/booking-success');
      setCurrentPath('/booking-success');
      toast.success('Your driver booking has been confirmed!');
    } catch (err) {
      console.error('Failed to save booking to backend:', err);
      setBookings((prev) => [newBooking, ...prev]);
      setLastConfirmedBooking(newBooking);
      window.history.pushState({}, '', '/booking-success');
      setCurrentPath('/booking-success');
    }
  };

  const handleCancelBooking = (bookingId) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    toast.info(`Booking ${bookingId} has been cancelled.`);
  };

  // Floating Helpdesk Modal State (NO personal number)
  const [floatingContactOpen, setFloatingContactOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('supportmanadrivers@gmail.com');
    setEmailCopied(true);
    toast.success('Support email copied to clipboard!');
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] flex flex-col selection:bg-neutral-900 selection:text-white font-sans">
      {/* Toast Notifications */}
      <Toaster position="top-right" richColors closeButton theme="light" />

      {/* Header */}
      <Header
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        bookingsCount={bookings.length}
        onOpenBookings={() => setIsBookingsSheetOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-0">
        {/* Dedicated Google / Meta Ads Conversion Page: /booking-success */}
        {currentPath === '/booking-success' ? (
          <ConversionSuccessView
            type="booking"
            booking={lastConfirmedBooking}
            onBackToHome={() => navigateTo('/', 'customer')}
            onOpenBookings={() => setIsBookingsSheetOpen(true)}
          />
        ) : currentPath === '/driver/success' ? (
          /* Dedicated Google / Meta Ads Conversion Page: /driver/success */
          <ConversionSuccessView
            type="driver"
            onBackToHome={() => navigateTo('/', 'customer')}
            onOpenDriverLogin={() => navigateTo('/driver/signup', 'driver')}
          />
        ) : (
          <>
            {activeRole === 'customer' && (
              <CustomerView
                drivers={drivers}
                initialService={initialService}
                onOpenBooking={handleOpenBooking}
                onSwitchToDriver={() => handleRoleChange('driver')}
                pricingSettings={pricingSettings}
              />
            )}

            {activeRole === 'driver' && (
              <DriverPortal
                onBackToHome={() => handleRoleChange('customer')}
                pricingSettings={pricingSettings}
              />
            )}

            {activeRole === 'admin' && (
              <AdminPortal
                onBackToHome={() => handleRoleChange('customer')}
                pricingSettings={pricingSettings}
                onPricingUpdated={(newPricing) => setPricingSettings(newPricing)}
              />
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <Footer
        onSwitchToDriver={() => handleRoleChange('driver')}
      />

      {/* FLOATING 24/7 HELPDESK & REVIEW BUTTON (NO PERSONAL NUMBER) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setFloatingContactOpen(!floatingContactOpen)}
          className="w-13 h-13 rounded-full bg-neutral-950 text-white shadow-xl hover:shadow-2xl flex items-center justify-center hover:scale-105 transition-all focus:outline-none cursor-pointer border border-neutral-800"
          title="Direct Support & Driver Review"
          aria-label="Direct Support & Review"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute top-2 right-2 ring-2 ring-neutral-950 animate-pulse" />
          <MessageCircle className="w-6 h-6 text-[#FF5500]" />
        </button>

        {/* Quick Helpdesk & Review Modal (Personal phone number completely removed) */}
        {floatingContactOpen && (
          <div className="absolute bottom-16 right-0 w-84 bg-white rounded-3xl p-5 border border-neutral-200 shadow-2xl text-neutral-900 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <p className="font-bold text-sm tracking-tight text-neutral-950 font-sans flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Mana Drivers Helpdesk</span>
                </p>
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Hyderabad 24/7 Dispatch Desk
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFloatingContactOpen(false)}
                aria-label="Close modal"
                className="text-neutral-400 hover:text-neutral-900 p-1 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* WhatsApp Live Dispatch Chat */}
              <a
                href="https://wa.me/?text=Hello%20Mana%20Drivers%2C%20I%20need%20a%20verified%20driver%20in%20Hyderabad"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 transition-all shadow-xs cursor-pointer tracking-tight"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-100" />
                  <span>WhatsApp Dispatch</span>
                </div>
                <span className="text-[10px] bg-emerald-800/50 px-2 py-0.5 rounded-md font-mono">24/7 Live</span>
              </a>

              {/* Official Support Email */}
              <a
                href="mailto:supportmanadrivers@gmail.com"
                className="w-full py-2.5 px-4 bg-neutral-950 hover:bg-neutral-800 text-white rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 transition-all shadow-xs cursor-pointer tracking-tight"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#FF5500]" />
                  <span>supportmanadrivers@gmail.com</span>
                </div>
              </a>

              {/* OTP Verified Review Button */}
              <button
                type="button"
                onClick={() => {
                  setFloatingContactOpen(false);
                  setIsGlobalReviewOpen(true);
                }}
                className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Submit Review with Driver OTP</span>
                </div>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md font-bold">Verified</span>
              </button>

              {/* Quick Book Driver CTA */}
              <button
                type="button"
                onClick={() => {
                  setFloatingContactOpen(false);
                  handleOpenBooking(drivers[0]);
                }}
                className="w-full py-2.5 px-4 bg-[#FF5500] hover:bg-[#e04b00] text-white rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 transition-all shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  <span>Book a Driver (30-Min Arrival)</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold">₹0 Fee</span>
              </button>

              {/* Copy Support Email */}
              <button
                type="button"
                onClick={handleCopyEmail}
                className="w-full py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {emailCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied support email!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Copy Support Email</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[10px] text-neutral-400 text-center leading-tight">
              Coverage: All 300+ areas in Hyderabad · Direct Driver UPI Pay
            </p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        driver={selectedDriverForBooking}
        isOpen={Boolean(selectedDriverForBooking)}
        onClose={handleCloseBooking}
        onBookingConfirmed={handleBookingConfirmed}
        pricingSettings={pricingSettings}
      />

      {/* Global OTP-Verified Review Modal */}
      <ReviewModal
        isOpen={isGlobalReviewOpen}
        onClose={() => setIsGlobalReviewOpen(false)}
        drivers={drivers}
        onReviewSubmitted={() => {
          toast.success('Your driver review was submitted successfully!');
        }}
      />

      {/* Trips Bottom Sheet */}
      <MyBookingsSheet
        isOpen={isBookingsSheetOpen}
        onClose={() => setIsBookingsSheetOpen(false)}
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
      />
    </div>
  );
}
