import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import Header from './components/Header';
import CustomerView from './components/CustomerView';
import DriverPortal from './components/DriverPortal';
import AdminPortal from './components/AdminPortal';
import BookingModal from './components/BookingModal';
import MyBookingsSheet from './components/MyBookingsSheet';
import { initialDrivers } from './data/mockDrivers';
import { Phone } from 'lucide-react';
import { createBookingApi } from './utils/api';

const DEFAULT_BOOKINGS = [
  {
    id: 'HYD-8902',
    driverId: 'drv-01',
    driverName: 'Ramesh Kumar',
    vehicle: 'Manual & Automatic Cars',
    date: '2026-10-12',
    time: '10:00',
    hours: 3,
    pickupAddress: 'Hitec City, Cyber Towers Main Gate, Hyderabad',
    totalCost: 540,
    passengerNotes: 'Airport pickup at RGIA Shamshabad, terminal arrival.',
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'HYD-7411',
    driverId: 'drv-03',
    driverName: 'Shanker',
    vehicle: 'Manual & Automatic Cars',
    date: '2026-10-13',
    time: '15:30',
    hours: 4,
    pickupAddress: 'Gachibowli, Financial District, Hyderabad',
    totalCost: 800,
    passengerNotes: 'Family shopping and dinner at Jubilee Hills.',
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
  },
];

export default function App() {
  // Active Role: 'customer' | 'driver' | 'admin'
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('godrive_role') || 'customer';
  });

  // Bookings / Client Inquiries
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('godrive_bookings');
      return saved ? JSON.parse(saved) : DEFAULT_BOOKINGS;
    } catch {
      return DEFAULT_BOOKINGS;
    }
  });

  // Modals
  const [selectedDriverForBooking, setSelectedDriverForBooking] = useState(null);
  const [isBookingsSheetOpen, setIsBookingsSheetOpen] = useState(false);

  // Sync role to localStorage
  useEffect(() => {
    localStorage.setItem('godrive_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('godrive_bookings', JSON.stringify(bookings));
  }, [bookings]);

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
    setBookings((prev) => [newBooking, ...prev]);
    try {
      await createBookingApi(newBooking);
    } catch (err) {
      console.error('Failed to save booking to backend:', err);
    }
  };

  const handleCancelBooking = (bookingId) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    toast.info(`Booking ${bookingId} has been cancelled.`);
  };

  const [floatingContactOpen, setFloatingContactOpen] = useState(false);

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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {activeRole === 'customer' && (
          <CustomerView
            drivers={initialDrivers}
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
      <footer className="mt-auto py-10 px-4 sm:px-6 lg:px-8 border-t border-neutral-200/80 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-500 font-medium">
          <div className="flex flex-wrap items-center gap-6">
            <a href="#" className="hover:text-neutral-900 transition-colors">
              Privacy policy
            </a>
            <a href="#" className="hover:text-neutral-900 transition-colors">
              Terms of service
            </a>
            <a href="#drivers" className="hover:text-neutral-900 transition-colors">
              Drivers
            </a>
            <a href="#pricing" className="hover:text-neutral-900 transition-colors">
              Pricing
            </a>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className="hover:text-neutral-900 text-neutral-900 font-bold underline underline-offset-4 cursor-pointer transition-colors"
            >
              Admin
            </button>
          </div>

          <div className="flex items-center gap-4 text-neutral-500">
            <a
              href="tel:+919963254183"
              className="hover:text-neutral-900 transition-colors flex items-center gap-1 font-semibold text-neutral-800"
            >
              <Phone className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Helpline: +91 99632 54183</span>
            </a>
            <span>·</span>
            <span>© {new Date().getFullYear()} MANA DRIVERS HYDERABAD</span>
            <span>·</span>
            <span>AADHAAR & LICENSE VERIFIED</span>
          </div>
        </div>
      </footer>

      {/* FLOATING CIRCULAR CONTACT BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setFloatingContactOpen(!floatingContactOpen)}
          className="w-13 h-13 rounded-full bg-white border border-neutral-200 shadow-xl hover:shadow-2xl flex items-center justify-center text-neutral-900 hover:scale-105 transition-all focus:outline-none"
          title="Instant Driver Helpline"
          aria-label="Instant Driver Helpline"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 ring-2 ring-white animate-pulse" />
          <Phone className="w-5 h-5 text-neutral-800" />
        </button>

        {/* Quick Contact Modal */}
        {floatingContactOpen && (
          <div className="absolute bottom-16 right-0 w-80 bg-white rounded-3xl p-5 border border-neutral-200 shadow-2xl text-neutral-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <p className="font-bold text-sm">Mana Drivers Hyderabad</p>
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Available 24/7 for Pickups
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFloatingContactOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <a
                href="tel:+919963254183"
                className="w-full py-2.5 px-4 bg-[#111111] hover:bg-neutral-800 text-white rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Helpline: +91 99632 54183</span>
              </a>

              <a
                href={`https://wa.me/919963254183?text=${encodeURIComponent(
                  'Hello Mana Drivers, I need a verified private driver for my car in Hyderabad.'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <span>WhatsApp Instant Dispatch</span>
              </a>
            </div>

            <p className="text-[10px] text-neutral-400 text-center">
              Cyber Towers · Gachibowli · Jubilee Hills · Banjara Hills
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
