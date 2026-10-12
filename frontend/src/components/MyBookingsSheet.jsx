import { X, Calendar, MapPin, Car, Trash2, CheckCircle2 } from 'lucide-react';

export default function MyBookingsSheet({ isOpen, onClose, bookings, onCancelBooking }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white border-2 border-neutral-900 text-neutral-950 max-h-[90vh] flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-neutral-900 bg-neutral-950 text-white">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#FF5500] font-black">
              [ ITINERARY & DISPATCH ]
            </div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
              My Trips ({bookings.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close trips list"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {bookings.length === 0 ? (
            <div className="p-8 text-center bg-neutral-50 border border-neutral-300">
              <p className="text-sm text-neutral-900 font-black uppercase tracking-wider">No Bookings Yet</p>
              <p className="text-xs text-neutral-500 mt-1">
                Choose a verified driver from the roster and click "Book Now" to schedule a ride.
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 bg-white border border-neutral-300 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-[#FF5500]">{booking.id}</span>
                      <span className="text-[10px] bg-neutral-900 text-white px-2 py-0.5 font-bold uppercase tracking-wider">
                        {booking.status}
                      </span>
                    </div>
                    <h3 className="font-black text-neutral-950 text-sm uppercase tracking-tight mt-1">
                      {booking.driverName}
                    </h3>
                    <p className="text-xs text-neutral-600 flex items-center gap-1.5 mt-0.5 font-medium">
                      <Car className="w-3.5 h-3.5 text-[#FF5500]" />
                      <span>{booking.vehicle}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-neutral-950 font-mono">₹{booking.totalCost}</span>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">{booking.hours} Hours</p>
                  </div>
                </div>

                <div className="text-xs text-neutral-700 space-y-1 bg-neutral-100 p-3 border border-neutral-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span className="font-semibold text-neutral-950">{booking.date} at {booking.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span className="truncate">{booking.pickupAddress}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Driver confirmed</span>
                  </span>
                  <button
                    onClick={() => onCancelBooking(booking.id)}
                    className="text-xs text-neutral-400 hover:text-rose-600 transition-colors flex items-center gap-1 font-semibold uppercase tracking-wider"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel</span>
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
