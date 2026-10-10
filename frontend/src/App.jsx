import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import Header from './components/Header';
import CustomerView from './components/CustomerView';
import DriverPortal from './components/DriverPortal';
import BookingModal from './components/BookingModal';
import MyBookingsSheet from './components/MyBookingsSheet';
import { initialDrivers } from './data/mockDrivers';
import { triggerDirectRazorpay } from './utils/razorpay';

const DEFAULT_BOOKINGS = [
  {
    id: 'HYD-8902',
    driverId: 'drv-01',
    driverName: 'Ramesh Kumar',
    vehicle: 'Maruti Suzuki Dzire',
    date: '2026-10-10',
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
    date: '2026-10-11',
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

  // Pro Access Paywall State (Persisted)
  const [isProUnlocked, setIsProUnlocked] = useState(() => {
    return localStorage.getItem('godrive_pro_unlocked') === 'true';
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
    localStorage.setItem('godrive_pro_unlocked', String(isProUnlocked));
  }, [isProUnlocked]);

  useEffect(() => {
    localStorage.setItem('godrive_custom_drivers', JSON.stringify(customDrivers));
  }, [customDrivers]);

  useEffect(() => {
    localStorage.setItem('godrive_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Combined drivers
  const allDrivers = [...initialDrivers, ...customDrivers];

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

  const handlePaymentSuccess = () => {
    setIsProUnlocked(true);
  };

  const handleTriggerPayment = () => {
    triggerDirectRazorpay({ onPaymentSuccess: handlePaymentSuccess });
  };

  const handleResetPro = () => {
    setIsProUnlocked(false);
    toast.info('Drivers locked again for Hyderabad demo testing.');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col selection:bg-blue-600/15 selection:text-blue-700">
      {/* Light Theme Toaster */}
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
        isProUnlocked={isProUnlocked}
        bookingsCount={bookings.length}
        onOpenBookings={() => setIsBookingsSheetOpen(true)}
        onOpenRazorpay={handleTriggerPayment}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {activeRole === 'customer' ? (
          <CustomerView
            drivers={allDrivers}
            isProUnlocked={isProUnlocked}
            onOpenBooking={handleOpenBooking}
            onOpenRazorpay={handleTriggerPayment}
            onResetPro={handleResetPro}
          />
        ) : (
          <DriverPortal
            bookings={bookings}
            onAcceptBooking={handleAcceptBooking}
            onDeclineBooking={handleDeclineBooking}
            onRegisterDriver={handleRegisterDriver}
            totalDriversCount={allDrivers.length}
          />
        )}
      </main>

      {/* Simple Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
              G
            </div>
            <span className="font-bold text-slate-800">GoDrive Hyderabad</span>
            <span aria-hidden="true">·</span>
            <span>Private driver network for Hyderabad, Telangana</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Hitec City & Gachibowli</span>
            <span aria-hidden="true">·</span>
            <span>Banjara & Jubilee Hills</span>
            <span aria-hidden="true">·</span>
            <span>RGIA Shamshabad Airport</span>
          </div>

          <p>© {new Date().getFullYear()} GoDrive Hyderabad. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals & Bottom Sheets */}
      <BookingModal
        driver={selectedDriverForBooking}
        isOpen={Boolean(selectedDriverForBooking)}
        onClose={handleCloseBooking}
        onBookingConfirmed={handleBookingConfirmed}
      />

      <MyBookingsSheet
        isOpen={isBookingsSheetOpen}
        onClose={() => setIsBookingsSheetOpen(false)}
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
      />
    </div>
  );
}
