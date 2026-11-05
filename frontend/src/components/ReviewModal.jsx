import { useState, useMemo } from 'react';
import { X, Star, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitReviewApi } from '../utils/api';
import SearchableSelect from './common/SearchableSelect';

export default function ReviewModal({
  isOpen,
  onClose,
  drivers = [],
  initialDriver = null,
  onReviewSubmitted,
}) {
  const [selectedDriverId, setSelectedDriverId] = useState(() => initialDriver?.id || (drivers[0]?.id || ''));
  const [otp, setOtp] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [author, setAuthor] = useState('');
  const [carAndArea, setCarAndArea] = useState('');
  const [tripType, setTripType] = useState('6-Hr City Duty');
  const [title, setTitle] = useState('');
  const [quote, setQuote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initialDriver when changed
  const activeDriver = useMemo(() => {
    return drivers.find((d) => d.id === selectedDriverId) || initialDriver || drivers[0];
  }, [drivers, selectedDriverId, initialDriver]);

  if (!isOpen) return null;

  const driverOptions = drivers.map((d) => ({
    value: d.id,
    label: `${d.name} (${d.location})`,
    sublabel: `${d.rating}★ · ${d.driverType === 'permanent' ? 'Monthly Chauffeur' : 'City & Outstation Driver'}`,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDriverId && !activeDriver?.id) {
      toast.error('Please select a driver to review.');
      return;
    }

    if (!otp || otp.trim().length < 4) {
      toast.error('Please enter the 4-digit Driver Review OTP.');
      return;
    }

    if (!author.trim()) {
      toast.error('Please enter your full name.');
      return;
    }

    if (!title.trim() || !quote.trim()) {
      toast.error('Please provide a review title and detailed comments.');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetDriver = activeDriver;
      const initials = author
        .trim()
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'CU';

      const payload = {
        driverId: targetDriver.id,
        driverName: targetDriver.name,
        otp: otp.trim(),
        rating,
        title: title.trim(),
        quote: quote.trim(),
        author: author.trim(),
        initials,
        carAndArea: carAndArea.trim() || `${targetDriver.location || 'Hyderabad'} · Car Owner`,
        tripType: tripType || 'City Duty',
        date: 'Today',
      };

      const res = await submitReviewApi(payload);
      if (res && res.success) {
        toast.success(`Verified feedback submitted for ${targetDriver.name}! Thank you.`);
        onReviewSubmitted?.(res.data);
        onClose();
        // Reset form
        setOtp('');
        setTitle('');
        setQuote('');
      } else {
        toast.error(res?.message || 'Failed to submit review. Check OTP and try again.');
      }
    } catch (err) {
      toast.error(err.message || 'Verification failed. Please check the 4-digit Driver OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-neutral-900 to-neutral-950 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h3 className="text-base sm:text-lg font-bold font-sans">Verified Driver Feedback</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Enter your driver's permanent 4-digit OTP to submit verified review
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Driver Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5 font-sans">
              Select Driver *
            </label>
            <SearchableSelect
              options={driverOptions}
              value={selectedDriverId}
              onChange={(val) => setSelectedDriverId(val)}
              placeholder="Search driver by name or area..."
              searchPlaceholder="Type driver name or locality..."
            />
          </div>

          {/* OTP Verification Input Box */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="driverOtpInput" className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                Driver Review OTP (4 Digits) *
              </label>
              <span className="text-[10px] font-mono font-bold bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded-full">
                Mandatory
              </span>
            </div>
            <input
              id="driverOtpInput"
              type="text"
              required
              maxLength={6}
              placeholder="e.g. 4821"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full tracking-widest text-center text-lg font-mono font-black py-2.5 bg-white border border-emerald-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
            />
            <p className="text-[11px] text-emerald-800 leading-tight">
              💡 <strong>Trip Verification:</strong> Each Mana Driver has a permanent 4-digit Review OTP shown in their driver dashboard. Please ask your driver for this code upon completing your trip.
            </p>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5 font-sans">
              Overall Rating: {rating} / 5 Stars *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-7 h-7 ${
                        filled ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'
                      } transition-colors`}
                    />
                  </button>
                );
              })}
              <span className="text-xs font-semibold text-neutral-600 ml-2">
                {rating === 5 ? 'Excellent & Highly Recommended' : rating === 4 ? 'Very Good Driver' : rating === 3 ? 'Average Experience' : 'Needs Improvement'}
              </span>
            </div>
          </div>

          {/* User Full Name & Car/Area in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5 font-sans">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                maxLength={50}
                placeholder="e.g. Vikram Reddy"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5 font-sans">
                Area & Car Model
              </label>
              <input
                type="text"
                maxLength={60}
                placeholder="e.g. Hitec City · Fortuner"
                value={carAndArea}
                onChange={(e) => setCarAndArea(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Trip Duty Type */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5 font-sans">
              Duty Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['4-Hr City Duty', '8-Hr Full Day', 'Outstation Trip', 'Monthly Duty'].slice(0, 3).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTripType(type)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    tripType === type
                      ? 'bg-neutral-950 text-white border-neutral-950 shadow-2xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Review Headline Title */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5 font-sans">
              Review Title *
            </label>
            <input
              type="text"
              required
              maxLength={80}
              placeholder="e.g. Punctual, polite and excellent driving in heavy traffic"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Review Detailed Feedback */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5 font-sans">
              Your Feedback & Experience *
            </label>
            <textarea
              required
              rows={3}
              maxLength={500}
              placeholder="Tell others about the driver's punctuality, car handling, knowledge of Hyderabad routes..."
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Verifying & Submitting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Verified Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
