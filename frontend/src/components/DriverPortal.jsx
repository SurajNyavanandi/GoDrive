import { useState } from 'react';
import {
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { HYDERABAD_LOCALITIES } from '../data/mockDrivers';

export default function DriverPortal({
  bookings,
  onAcceptBooking,
  onDeclineBooking,
  onRegisterDriver,
  totalDriversCount,
}) {
  const [activeTab, setActiveTab] = useState('inquiries');

  // Driver sign-up form
  const [formData, setFormData] = useState({
    name: '',
    vehicle: '',
    category: 'Sedan',
    hourlyRate: 200,
    location: 'Hitec City, Hyderabad',
    experience: 5,
    phone: '',
    avatarType: 'suit',
    bio: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.vehicle.trim()) {
      toast.error('Please enter your full name and vehicle model');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newDriver = {
        id: `drv-hyd-${Date.now()}`,
        name: formData.name.trim(),
        vehicle: formData.vehicle.trim(),
        category: formData.category,
        rating: 5.0,
        trips: 0,
        hourlyRate: Number(formData.hourlyRate) || 200,
        location: `${formData.location.trim()}`,
        status: 'Available',
        isPro: false,
        experience: Number(formData.experience) || 3,
        phone: formData.phone.trim() || '+91 98490 00000',
        avatarType: formData.avatarType || 'suit',
        bio: formData.bio.trim() || 'Verified professional private driver operating across Hyderabad & Telangana.',
      };

      onRegisterDriver(newDriver);
      setIsSubmitting(false);
      toast.success(`Welcome to GoDrive Hyderabad, ${formData.name}! Your profile is now live.`);
      setFormData({
        name: '',
        vehicle: '',
        category: 'Sedan',
        hourlyRate: 200,
        location: 'Hitec City, Hyderabad',
        experience: 5,
        phone: '',
        avatarType: 'suit',
        bio: '',
      });
      setActiveTab('inquiries');
    }, 500);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Portal Header */}
      <div className="border-b border-neutral-200 pb-5">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] font-black mb-1">
          [ DRIVER OPERATIONS & DISPATCH ]
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
          Hyderabad Driver Portal
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Review customer dispatch inquiries and register your chauffeur credentials on our verified roster.
        </p>
      </div>

      {/* Overview Stat Strip (Industrial Swiss Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-neutral-200">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
            BOOKING REQUESTS
          </p>
          <p className="text-3xl font-black text-neutral-950 mt-1 font-mono">
            {bookings.filter((b) => b.status === 'Confirmed').length}
          </p>
        </div>
        <div className="p-5 bg-white border border-neutral-200">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
            CONFIRMED TRIPS
          </p>
          <p className="text-3xl font-black text-emerald-600 mt-1 font-mono">
            {bookings.filter((b) => b.status === 'Accepted').length}
          </p>
        </div>
        <div className="p-5 bg-white border border-neutral-200">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
            VERIFIED CHAUFFEURS
          </p>
          <p className="text-3xl font-black text-neutral-950 mt-1 font-mono">
            {totalDriversCount}
          </p>
        </div>
        <div className="p-5 bg-[#FF5500] text-black border border-black">
          <p className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-black">
            AVG HYD RATE
          </p>
          <p className="text-3xl font-black text-black mt-1 font-mono">
            ₹220/hr
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-4">
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'inquiries'
              ? 'bg-neutral-950 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#FF5500]" />
          <span>Customer Requests ({bookings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'register'
              ? 'bg-neutral-950 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5 text-[#FF5500]" />
          <span>Join as a Driver</span>
        </button>
      </div>

      {/* Tab 1: Customer Requests */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-tight text-neutral-950">
              Live Booking Inquiries
            </h2>
            <span className="text-xs text-neutral-500 font-mono">TELANGANA DISPATCH FEED</span>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center bg-white border border-neutral-200 space-y-2">
              <Calendar className="w-10 h-10 text-neutral-300 mx-auto" />
              <h3 className="text-base font-black uppercase tracking-tight text-neutral-950">
                No Booking Requests Right Now
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                When customers book a driver across Hyderabad, requests appear here so you can accept them.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-5 bg-white border border-neutral-200 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-[#FF5500]">{booking.id}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider ${
                            booking.status === 'Accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : booking.status === 'Declined'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-neutral-950 mt-1">
                        Driver: {booking.driverName}
                      </h4>
                      <p className="text-xs text-neutral-500">{booking.vehicle}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-neutral-950 font-mono">₹{booking.totalCost}</span>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">{booking.hours} hrs</p>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="space-y-1.5 text-xs text-neutral-700 bg-neutral-50 p-3 border border-neutral-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#FF5500]" />
                      <span className="font-semibold text-neutral-950">{booking.date} at {booking.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#FF5500]" />
                      <span className="truncate">{booking.pickupAddress}</span>
                    </div>
                    {booking.passengerNotes && (
                      <div className="text-[11px] text-neutral-600 pt-1 border-t border-neutral-200">
                        Note: "{booking.passengerNotes}"
                      </div>
                    )}
                  </div>

                  {/* Accept / Decline */}
                  {booking.status === 'Confirmed' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onAcceptBooking(booking.id)}
                        className="flex-1 py-2 px-3 bg-neutral-950 hover:bg-[#FF5500] hover:text-black text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Trip</span>
                      </button>
                      <button
                        onClick={() => onDeclineBooking(booking.id)}
                        className="py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Driver Sign Up Form */}
      {activeTab === 'register' && (
        <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white border border-neutral-200">
          <div className="mb-6 pb-4 border-b border-neutral-200">
            <h2 className="text-xl font-black uppercase tracking-tight text-neutral-950">
              Driver Onboarding in Hyderabad
            </h2>
            <p className="text-xs text-neutral-600 mt-1">
              Join the GoDrive verified private driver roster. Receive direct booking calls and zero platform cuts.
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikram Reddy"
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98490 12345"
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Primary Car Experience</label>
                <input
                  type="text"
                  required
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  placeholder="e.g. Honda City / Innova"
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Car Class</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Small Car">Small Car / Hatchback</option>
                  <option value="Luxury">Luxury Chauffeur</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Hourly Rate (₹)</label>
                <input
                  type="number"
                  min="120"
                  max="600"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Years of Driving Exp</label>
                <input
                  type="number"
                  min="1"
                  max="35"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Hyderabad Base Location</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-950 focus:outline-none focus:border-[#FF5500]"
              >
                {HYDERABAD_LOCALITIES.map((loc) => (
                  <option key={loc} value={`${loc}, Hyderabad`}>
                    {loc}, Hyderabad
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Short Profile Bio</label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="e.g. 8 years corporate chauffeur experience in Hitec City and RGIA airport runs. Clean driving record."
                className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2 text-xs text-neutral-950 focus:outline-none focus:border-[#FF5500]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-[#FF5500] hover:bg-[#E04B00] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>{isSubmitting ? 'Registering...' : 'Submit Profile to Hyderabad Roster'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
