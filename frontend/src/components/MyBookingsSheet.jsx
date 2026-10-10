import { X, Calendar, MapPin, Car, Trash2, CheckCircle2 } from 'lucide-react';

export default function MyBookingsSheet({ isOpen, onClose, bookings, onCancelBooking }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl text-slate-900 max-h-[88vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="sm:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto my-3 shrink-0" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">My Bookings</h2>
            <p className="text-xs text-slate-500">{bookings.length} scheduled trips</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Close trips list"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {bookings.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-sm text-slate-800 font-semibold">No Bookings Yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Pick a driver from the home screen and click "Book Now" to schedule a ride.
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600">{booking.id}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                        {booking.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{booking.driverName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Car className="w-3.5 h-3.5 text-blue-600" />
                      <span>{booking.vehicle}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900 tabular-nums">₹{booking.totalCost}</span>
                    <p className="text-[11px] text-slate-500">{booking.hours} Hours</p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-medium text-slate-900">{booking.date} at {booking.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span className="truncate">{booking.pickupAddress}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Driver confirmed</span>
                  </span>
                  <button
                    onClick={() => onCancelBooking(booking.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Cancel Trip</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
