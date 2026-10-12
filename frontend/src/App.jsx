import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import Header from './components/Header';
import CustomerView from './components/CustomerView';
import DriverPortal from './components/DriverPortal';
import BookingModal from './components/BookingModal';
import MyBookingsSheet from './components/MyBookingsSheet';
import { initialDrivers } from './data/mockDrivers';
import { ShieldCheck, ArrowUpRight, Zap } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A0A0A] flex flex-col selection:bg-[#FF5500] selection:text-black">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
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
          />
        )}
      </main>

      {/* =========================================================================
          7. MINIMALIST INDUSTRIAL FOOTER (REFERENCE IMAGE AESTHETIC)
          Multi-column clean layout with brand statement, coverage zones,
          trust badges, and driver onboarding link.
         ========================================================================= */}
      <footer className="bg-[#0A0A0A] border-t border-neutral-800 text-white mt-auto pt-14 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Top Multi-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Column 1: Brand Statement (4 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#FF5500] text-black font-black text-sm flex items-center justify-center">
                  MD
                </div>
                <span className="font-black text-lg uppercase tracking-wider text-white">
                  MAA <span className="text-[#FF5500]">DRIVER</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed font-normal">
                Trained, verified drivers for your personal car in Hyderabad.
                Driver arrives in 30 minutes for office rides, RGIA airport trips, and safe family travel across Telangana.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-[11px] font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span>Police Verified</span>
                </div>
                <div className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-[11px] font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span>No Surge Fees</span>
                </div>
              </div>
            </div>

            {/* Column 2: Hyderabad Coverage Zones (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-[#FF5500] font-black">
                [ PICKUP AREAS ]
              </h4>
              <ul className="space-y-2 text-xs text-neutral-400 font-medium">
                <li>Hitec City (20 mins)</li>
                <li>Gachibowli Financial District (25 mins)</li>
                <li>Banjara Hills (30 mins)</li>
                <li>Jubilee Hills (25 mins)</li>
                <li>RGIA Airport Shamshabad (35 mins)</li>
                <li>Madhapur & Kondapur (20 mins)</li>
              </ul>
            </div>

            {/* Column 3: Services (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-[#FF5500] font-black">
                [ QUICK LINKS ]
              </h4>
              <ul className="space-y-2 text-xs text-neutral-400 font-medium">
                <li><a href="#services" className="hover:text-white transition-colors">City Driving</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Airport Pickup</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Outstation Trips</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Simple Pricing</a></li>
                <li><a href="#drivers" className="hover:text-white transition-colors">Find Drivers</a></li>
              </ul>
            </div>

            {/* Column 4: Quick Action & Driver Onboarding (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-[#FF5500] font-black">
                [ FOR DRIVERS ]
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Join Maa Driver for ₹49. First 3 months free homepage listing, then ₹99/month. Direct calls and 0% commission.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveRole('driver');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 px-3 bg-[#FF5500] hover:bg-[#E04B00] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
              >
                <span>Join for ₹49</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Divider & Copyright */}
          <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
            <p>© {new Date().getFullYear()} MAA DRIVER HYDERABAD. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-4">
              <span>TELANGANA TRANSPORT ACT COMPLIANT</span>
              <span>·</span>
              <span>HYDERABAD, INDIA</span>
            </div>
          </div>
        </div>
      </footer>

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
