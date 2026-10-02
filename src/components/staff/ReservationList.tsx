import React from "react";
import { useCafe } from "../../context/CafeContext";
import { Calendar, Users, Phone, CheckCircle, Clock, MapPin, XCircle } from "lucide-react";

export const ReservationList: React.FC = () => {
  const { reservations, updateReservationStatus, config } = useCafe();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-stone-900 text-base sm:text-lg">Table Reservations</h3>
          <p className="text-xs text-stone-500">Upcoming guest bookings and table allocations</p>
        </div>
        <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200">
          {reservations.length} Bookings
        </span>
      </div>

      {reservations.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
          No table reservations booked yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservations.map((res) => (
            <div
              key={res.id}
              className={`bg-white rounded-2xl p-4 border transition-all shadow-xs space-y-3 ${
                res.status === "seated"
                  ? "border-emerald-300 bg-emerald-50/20"
                  : res.status === "cancelled"
                  ? "border-stone-200 opacity-60"
                  : "border-stone-200 hover:border-amber-400"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{res.guestName}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                    <Phone className="w-3 h-3" />
                    <span>{res.guestPhone}</span>
                  </div>
                </div>

                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  res.status === "confirmed"
                    ? "bg-amber-100 text-amber-800"
                    : res.status === "seated"
                    ? "bg-emerald-100 text-emerald-800"
                    : res.status === "completed"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-stone-200 text-stone-600"
                }`}>
                  {res.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <div className="flex items-center gap-1.5 text-stone-700">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>{res.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-700">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{res.timeSlot}</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-700">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>{res.guestsCount} Guests</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-700">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>{res.tableAssigned || "Unassigned"}</span>
                </div>
              </div>

              {res.notes && (
                <p className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 italic">
                  Note: "{res.notes}"
                </p>
              )}

              {/* Status Actions */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                {res.status === "confirmed" && (
                  <>
                    <button
                      onClick={() => updateReservationStatus(res.id, "cancelled")}
                      className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => updateReservationStatus(res.id, "seated")}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Seat Guests</span>
                    </button>
                  </>
                )}

                {res.status === "seated" && (
                  <button
                    onClick={() => updateReservationStatus(res.id, "completed")}
                    className="w-full py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold"
                  >
                    Mark Dining Completed
                  </button>
                )}

                {res.status === "completed" && (
                  <span className="text-[11px] text-stone-400 font-medium">Reservation finished</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
