import { Compass, Briefcase, Calendar, Sparkles } from 'lucide-react';

export default function MobileBottomNav({
  activeRole,
  onRoleChange,
  isProUnlocked,
  bookingsCount,
  onOpenBookings,
  onOpenRazorpay,
}) {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg">
      <div className="grid grid-cols-4 items-center h-14">
        {/* Tab 1: Hire a Driver */}
        <button
          onClick={() => onRoleChange('customer')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeRole === 'customer' ? 'text-blue-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Hire Driver</span>
        </button>

        {/* Tab 2: My Trips */}
        <button
          onClick={onOpenBookings}
          className="relative flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <div className="relative">
            <Calendar className="w-5 h-5" />
            {bookingsCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                {bookingsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">My Trips</span>
        </button>

        {/* Tab 3: Driver Portal */}
        <button
          onClick={() => onRoleChange('driver')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeRole === 'driver' ? 'text-blue-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Driver Portal</span>
        </button>

        {/* Tab 4: Unlock ₹300 */}
        <button
          onClick={onOpenRazorpay}
          className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Sparkles className={`w-5 h-5 ${isProUnlocked ? 'text-emerald-600' : 'text-blue-600'}`} />
          <span className="text-[10px] tracking-tight font-medium">
            {isProUnlocked ? 'Unlocked' : '₹300 Pass'}
          </span>
        </button>
      </div>
    </nav>
  );
}
