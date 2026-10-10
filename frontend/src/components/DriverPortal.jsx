import { useState } from 'react';
import {
  UserPlus,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import DriverAvatar3D from './DriverAvatar3D';
import { HYDERABAD_LOCALITIES } from '../data/mockDrivers';

export default function DriverPortal({
  bookings,
  onAcceptBooking,
  onDeclineBooking,
  onRegisterDriver,
  totalDriversCount,
}) {
  const [activeTab, setActiveTab] = useState('inquiries');

  // Simple driver sign-up form in Hyderabad
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
      toast.error('Please enter your full name and car model');
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
        location: `${formData.location.trim()}, Hyderabad`,
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
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Hyderabad Bookings</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {bookings.filter((b) => b.status === 'Confirmed').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Completed Trips</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1 tabular-nums">
            {bookings.filter((b) => b.status === 'Accepted').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Hyderabad Drivers</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1 tabular-nums">
            {totalDriversCount}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Avg Hyderabad Pay</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            ₹220/hr
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 max-w-md mx-auto sm:mx-0">
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'inquiries'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>Customer Requests ({bookings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'register'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5 text-blue-600" />
          <span>Join as a Driver</span>
        </button>
      </div>

      {/* Tab 1: Customer Requests */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Hyderabad Booking Inquiries</h2>
            <span className="text-xs text-slate-500">Live requests from car owners</span>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Booking Requests Right Now</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When customers book a driver across Hyderabad, requests appear here so you can accept them.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-600">{booking.id}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            booking.status === 'Accepted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : booking.status === 'Declined'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">Requested: {booking.driverName}</h4>
                      <p className="text-xs text-slate-500">{booking.vehicle}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-slate-900 tabular-nums">₹{booking.totalCost}</span>
                      <p className="text-[11px] text-slate-500">{booking.hours} hours trip</p>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-medium text-slate-900">{booking.date} at {booking.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span className="truncate">{booking.pickupAddress}</span>
                    </div>
                    {booking.passengerNotes && (
                      <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                        Note: "{booking.passengerNotes}"
                      </div>
                    )}
                  </div>

                  {/* Accept / Decline */}
                  {booking.status === 'Confirmed' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onAcceptBooking(booking.id)}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Hyderabad Trip</span>
                      </button>
                      <button
                        onClick={() => onDeclineBooking(booking.id)}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
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
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Driver Sign Up in Hyderabad</h2>
            <p className="text-xs text-slate-600 mt-1">
              Add your profile to start receiving direct booking calls from car owners across Hyderabad.
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. S. Venkatesh"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Car You Drive</label>
                <input
                  type="text"
                  required
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  placeholder="e.g. Swift Dzire, Innova, Ertiga"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Car Type</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Small Car">Small Car</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rate per Hour (₹)</label>
                <input
                  type="number"
                  min="100"
                  max="1500"
                  required
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Driving Experience</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g. 6 yrs"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hyderabad Operating Area</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {HYDERABAD_LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98490 12345"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* 3D Avatar Character Style Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Select Your 3D Profile Avatar Style</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'suit', label: 'Executive' },
                  { id: 'cap', label: 'Cap Driver' },
                  { id: 'female', label: 'Female Driver' },
                  { id: 'casual', label: 'City Driver' },
                ].map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarType: av.id })}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      formData.avatarType === av.id
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <DriverAvatar3D type={av.id} name={av.label} size="sm" />
                    <span className="text-[10px] font-semibold text-slate-700">{av.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Short line about your driving experience</label>
              <textarea
                rows="2"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="e.g. 8 years experienced driver in Hitec City, non-smoker, clean traffic record."
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {isSubmitting ? 'Registering...' : 'Submit & Add My Profile in Hyderabad'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
