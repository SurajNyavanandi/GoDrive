import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import Header from './components/Header';
import CustomerView from './components/CustomerView';
import DriverPortal from './components/DriverPortal';
import AdminPortal from './components/AdminPortal';
import BookingModal from './components/BookingModal';
import MyBookingsSheet from './components/MyBookingsSheet';
import { Mail, Phone, Copy, Check } from 'lucide-react';
import { fetchAdminBookingsApi, createBookingApi, fetchPublicDrivers } from './utils/api';
import { initialDrivers } from './data/mockDrivers';

import Footer from './components/Footer';

export default function App() {
  // Active Role: 'customer' | 'driver' | 'admin'
  const [activeRole, setActiveRole] = useState(() => {
    // Check URL param first (?role=driver or ?role=admin)
    try {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'driver' || urlRole === 'admin') return urlRole;
      if (params.get('action') === 'apply') return 'driver';
      if (window.location.hash === '#driver-portal' || window.location.hash === '#apply') return 'driver';
    } catch {
      // fallback
    }
    return localStorage.getItem('godrive_role') || 'customer';
  });

  // Pure in-memory array state for testing mode (resets on refresh)
  const [drivers, setDrivers] = useState(() => initialDrivers.filter((d) => d.isApproved !== false));
  const [bookings, setBookings] = useState([]);
  const [selectedDriverForBooking, setSelectedDriverForBooking] = useState(null);
  const [isBookingsSheetOpen, setIsBookingsSheetOpen] = useState(false);
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

  // Load live dynamic drivers & bookings from backend database on mount
  useEffect(() => {
    let isMounted = true;
    async function loadLiveData() {
      try {
        const [driversData, bookingsRes] = await Promise.all([
          fetchPublicDrivers(),
          fetchAdminBookingsApi().catch(() => ({ data: [] })),
        ]);
        if (isMounted) {
          if (Array.isArray(driversData)) {
            setDrivers(driversData);
          }
          if (bookingsRes && Array.isArray(bookingsRes.data)) {
            setBookings(bookingsRes.data);
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

  // URL Path, Query Parameters & Hash Deep Linking for Google Ads & Meta Ads:
  // e.g. https://manadrivers.com/book OR https://manadrivers.com/?action=book
  //      https://manadrivers.com/hourly OR https://manadrivers.com/?service=hourly
  //      https://manadrivers.com/outstation OR https://manadrivers.com/?service=outstation
  //      https://manadrivers.com/monthly OR https://manadrivers.com/?service=monthly
  //      https://manadrivers.com/apply OR https://manadrivers.com/?role=driver
  //      https://manadrivers.com/?utm_source=google&utm_medium=cpc&utm_campaign=hyderabad_drivers&gclid=...
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

      // 2. Instant Booking Trigger via path, param or hash
      const actionParam = urlParams.get('action');
      if (actionParam === 'book' || pathname === '/book' || hash === '#book') {
        setTimeout(() => {
          setSelectedDriverForBooking(drivers[0] || initialDrivers[0]);
        }, 400);
      }
    } catch (e) {
      console.warn('URL param parse error:', e);
    }
  }, [drivers]);

  // Global Keyboard Shortcut: Ctrl + Shift + S or Cmd + Shift + S to toggle Admin Console
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (driver) => {
    setSelectedDriverForBooking(driver);
  };

  const handleCloseBooking = () => {
    setSelectedDriverForBooking(null);
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

      // Safe trigger for Google Ads & Meta Pixel conversion tracking if configured
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
    } catch (err) {
      console.error('Failed to save booking to backend:', err);
      setBookings((prev) => [newBooking, ...prev]);
    }
  };

  const handleCancelBooking = (bookingId) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    toast.info(`Booking ${bookingId} has been cancelled.`);
  };

  const [floatingContactOpen, setFloatingContactOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('supportmanadrivers@gmail.com');
    setEmailCopied(true);
    toast.success('Support email copied to clipboard!');
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('099632 54183');
    setPhoneCopied(true);
    toast.success('Phone number copied to clipboard!');
    setTimeout(() => setPhoneCopied(false), 2000);
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

      {/* Main Content Area - Full width edge-to-edge for hero section */}
      <main className="flex-1 w-full pt-0">
        {activeRole === 'customer' && (
          <CustomerView
            drivers={drivers}
            initialService={initialService}
            onOpenBooking={handleOpenBooking}
            onSwitchToDriver={() => handleRoleChange('driver')}
          />
        )}

        {activeRole === 'driver' && (
          <DriverPortal onBackToHome={() => handleRoleChange('customer')} />
        )}

        {activeRole === 'admin' && (
          <AdminPortal onBackToHome={() => handleRoleChange('customer')} />
        )}
      </main>

      {/* FOOTER */}
      <Footer
        onSwitchToDriver={() => handleRoleChange('driver')}
      />

      {/* FLOATING CIRCULAR SUPPORT BUTTON (EMAIL & PHONE) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setFloatingContactOpen(!floatingContactOpen)}
          className="w-13 h-13 rounded-full bg-white border border-neutral-200 shadow-xl hover:shadow-2xl flex items-center justify-center text-neutral-900 hover:scale-105 transition-all focus:outline-none cursor-pointer"
          title="Direct Support (Phone & Email)"
          aria-label="Direct Support"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 ring-2 ring-white animate-pulse" />
          <Phone className="w-5 h-5 text-neutral-800" />
        </button>

        {/* Quick Contact & Verification Modal (Matches Google Business Profile) */}
        {floatingContactOpen && (
          <div className="absolute bottom-16 right-0 w-80 bg-white rounded-3xl p-5 border border-neutral-200 shadow-2xl text-neutral-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <p className="font-bold text-sm tracking-tight text-neutral-950 font-sans">Mana Drivers Support</p>
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Hyderabad Dispatch & Helpdesk
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFloatingContactOpen(false)}
                aria-label="Close modal"
                className="text-neutral-400 hover:text-neutral-900 p-1 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Direct Call Link (Matches Google Business Profile Phone: 099632 54183) */}
              <a
                href="tel:+919963254183"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 transition-all shadow-xs cursor-pointer tracking-tight"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-100" />
                  <span>Call: 099632 54183</span>
                </div>
                <span className="text-[10px] bg-emerald-800/40 px-2 py-0.5 rounded-md font-mono">24/7</span>
              </a>

              {/* Direct Email Link */}
              <a
                href="mailto:supportmanadrivers@gmail.com"
                className="w-full py-2.5 px-4 bg-neutral-950 hover:bg-neutral-800 text-white rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 transition-all shadow-xs cursor-pointer tracking-tight"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#FF5500]" />
                  <span>supportmanadrivers@gmail.com</span>
                </div>
              </a>

              {/* Copy Phone / Email Row */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="py-2 px-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {phoneCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-neutral-500" />
                      <span>Copy Phone</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="py-2 px-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {emailCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-neutral-500" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-neutral-400 text-center leading-tight">
              Service Area: Hyderabad, Telangana · Available 24 Hours
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
