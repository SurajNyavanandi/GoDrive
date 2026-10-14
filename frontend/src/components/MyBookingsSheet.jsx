import { X, Calendar, MapPin, Trash2, CheckCircle2 } from 'lucide-react';

export default function MyBookingsSheet({ isOpen, onClose, bookings, onCancelBooking }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-3xl border border-neutral-200 text-neutral-950 max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-neutral-100">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              TRIP ITINERARY
            </p>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-950 font-sans">
              Scheduled Trips ({bookings.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-950 flex items-center justify-center transition-colors"
            aria-label="Close trips list"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-4 overflow-y-auto">
          {bookings.length === 0 ? (
            <div className="p-10 text-center bg-neutral-50 rounded-2xl border border-neutral-200/80">
              <p className="text-sm text-neutral-900 font-bold">No Bookings Yet</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                Select a verified chauffeur from the directory and click "Book Driver" to schedule a ride.
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 bg-white rounded-2xl border border-neutral-200/80 space-y-3 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-neutral-400">{booking.id}</span>
                      <span className="text-[10px] bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full font-medium">
                        {booking.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-neutral-950 text-base font-sans mt-1">
                      {booking.driverName}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-neutral-950 font-sans">₹{booking.totalCost}</span>
                    <p className="text-[11px] text-neutral-400">{booking.hours} {typeof booking.hours === 'number' ? 'Hours' : ''}</p>
                  </div>
                </div>

                <div className="text-xs text-neutral-600 space-y-1.5 bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="font-medium text-neutral-900">{booking.date} at {booking.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{booking.pickupAddress}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Driver confirmed</span>
                  </span>
                  <button
                    onClick={() => onCancelBooking(booking.id)}
                    className="text-xs text-neutral-400 hover:text-rose-600 transition-colors font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel trip</span>
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
