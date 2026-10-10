import { Compass, Briefcase, Calendar, Sparkles, Check } from 'lucide-react';

export default function Header({
  activeRole,
  onRoleChange,
  isProUnlocked,
  bookingsCount,
  onOpenBookings,
  onOpenRazorpay,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand Logo (Left) */}
          <div className="flex items-center shrink-0">
            <a href="/" className="flex items-center gap-1.5 group">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center tracking-tight shadow-xs">
                G
              </div>
              <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                Go<span className="text-blue-600">Drive</span>
              </span>
            </a>
          </div>

          {/* Center: Compact Segmented Switcher */}
          <div className="flex items-center p-0.5 sm:p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => onRoleChange('customer')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap ${
                activeRole === 'customer'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
              <span className="hidden xs:inline sm:inline">Hire Driver</span>
              <span className="xs:hidden sm:hidden">Hire</span>
            </button>

            <button
              type="button"
              onClick={() => onRoleChange('driver')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap ${
                activeRole === 'driver'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
              <span className="hidden xs:inline sm:inline">Driver Portal</span>
              <span className="xs:hidden sm:hidden">Portal</span>
            </button>
          </div>

          {/* Right Action Zone */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {isProUnlocked ? (
              <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">All Unlocked</span>
                <span className="sm:hidden">Unlocked</span>
              </span>
            ) : (
              <button
                onClick={onOpenRazorpay}
                className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all"
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Unlock (₹300)</span>
                <span className="sm:hidden">₹300</span>
              </button>
            )}

            {/* My Trips Button */}
            <button
              onClick={onOpenBookings}
              className="relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 text-[11px] sm:text-xs font-semibold"
              aria-label="View bookings"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Trips</span>
              {bookingsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {bookingsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
