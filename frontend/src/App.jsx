import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import Header from './components/Header';
import CustomerView from './components/CustomerView';
import DriverPortal from './components/DriverPortal';
import BookingModal from './components/BookingModal';
import MyBookingsSheet from './components/MyBookingsSheet';
import { initialDrivers } from './data/mockDrivers';
import { Phone } from 'lucide-react';

const DEFAULT_BOOKINGS = [
  {
    id: 'HYD-8902',
    driverId: 'drv-01',
    driverName: 'Ramesh Kumar',
    vehicle: 'Maruti Suzuki Dzire',
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
    driverId: 'drv-02',
    driverName: 'Suresh Patil',
    vehicle: 'Hyundai Creta',
    date: '2026-10-13',
    time: '15:30',
    hours: 4,
    pickupAddress: 'Road No. 36, Jubilee Hills, Hyderabad',
    totalCost: 1000,
    passengerNotes: 'Family shopping and dinner at Banjara Hills.',
    status: 'Accepted',
    createdAt: new Date().toISOString(),
  },
];

export default function App() {
  // Active Role: 'customer' | 'driver'
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('godrive_role') || 'customer';
  });

  // Custom Registered Drivers (Persisted)
  const [customDrivers, setCustomDrivers] = useState(() => {
    try {
      const saved = localStorage.getItem('godrive_custom_drivers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Bookings / Client Inquiries (Persisted)
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

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('godrive_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('godrive_custom_drivers', JSON.stringify(customDrivers));
  }, [customDrivers]);

  useEffect(() => {
    localStorage.setItem('godrive_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Live driver availability status overrides (persisted)
  const [driverStatuses, setDriverStatuses] = useState(() => {
    try {
      const saved = localStorage.getItem('manadriver_statuses');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('manadriver_statuses', JSON.stringify(driverStatuses));
  }, [driverStatuses]);

  const handleToggleDriverStatus = (driverId, newStatus) => {
    setDriverStatuses((prev) => ({
      ...prev,
      [driverId]: newStatus,
    }));
    toast.success(`Driver status updated to: ${newStatus}`);
  };

  // Combined drivers with live status applied
  const allDrivers = [...initialDrivers, ...customDrivers].map((driver) => ({
    ...driver,
    status: driverStatuses[driver.id] || driver.status || 'Available',
  }));

  // Handlers
  const handleRoleChange = (role) => {
    setActiveRole(role);
  };

  const handleOpenBooking = (driver) => {
    setSelectedDriverForBooking(driver);
  };

  const handleCloseBooking = () => {
    setSelectedDriverForBooking(null);
  };

  const handleBookingConfirmed = (newBooking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleCancelBooking = (bookingId) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    toast.info(`Booking ${bookingId} has been cancelled.`);
  };

  const handleAcceptBooking = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Accepted' } : b))
    );
    toast.success(`Booking ${bookingId} accepted in Hyderabad!`);
  };

  const handleDeclineBooking = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Declined' } : b))
    );
    toast.info(`Booking ${bookingId} declined.`);
  };

  const handleRegisterDriver = (newDriver) => {
    setCustomDrivers((prev) => [newDriver, ...prev]);
  };

  const [floatingContactOpen, setFloatingContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] flex flex-col selection:bg-neutral-900 selection:text-white font-sans">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme="light"
      />

      {/* Header */}
      <Header
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        bookingsCount={bookings.length}
        onOpenBookings={() => setIsBookingsSheetOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {activeRole === 'customer' ? (
          <CustomerView
            drivers={allDrivers}
            onOpenBooking={handleOpenBooking}
            onSwitchToDriver={() => handleRoleChange('driver')}
          />
        ) : (
          <DriverPortal
            bookings={bookings}
            onAcceptBooking={handleAcceptBooking}
            onDeclineBooking={handleDeclineBooking}
            onRegisterDriver={handleRegisterDriver}
            totalDriversCount={allDrivers.length}
            customDrivers={customDrivers}
            allDrivers={allDrivers}
            onToggleDriverStatus={handleToggleDriverStatus}
          />
        )}
      </main>

      {/* =========================================================================
          NOVA EDITORIAL MINIMALIST FOOTER (REFERENCE IMAGE PAGE 7)
         ========================================================================= */}
      <footer className="mt-auto py-10 px-4 sm:px-6 lg:px-8 border-t border-neutral-200/80 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-500 font-medium">
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-neutral-900 transition-colors">Privacy policy</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Terms of service</a>
            <a href="#services" className="hover:text-neutral-900 transition-colors">Services</a>
            <a href="#drivers" className="hover:text-neutral-900 transition-colors">Drivers</a>
            <a href="#pricing" className="hover:text-neutral-900 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} MANA DRIVER HYDERABAD</span>
            <span>·</span>
            <span>POLICE VERIFIED CHAUFFEURS</span>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          FLOATING CIRCULAR CONTACT BUTTON (PINNED BOTTOM-RIGHT - REFERENCE PAGES 1-7)
         ========================================================================= */}
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

        {/* Quick Contact Modal / Popover */}
        {floatingContactOpen && (
          <div className="absolute bottom-16 right-0 w-80 bg-white rounded-3xl p-5 border border-neutral-200 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 text-neutral-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <p className="font-bold text-sm">Mana Driver Hyderabad</p>
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
                href="tel:+919876543210"
                className="w-full py-2.5 px-4 bg-[#111111] hover:bg-neutral-800 text-white rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Helpline: +91 98765 43210</span>
              </a>

              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(
                  'Hello Mana Driver, I need a verified private driver for my car in Hyderabad.'
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

      {/* Trips Bottom Sheet / Modal */}
      <MyBookingsSheet
        isOpen={isBookingsSheetOpen}
        onClose={() => setIsBookingsSheetOpen(false)}
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
      />
    </div>
  );
}
