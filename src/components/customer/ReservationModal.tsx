import React, { useState } from "react";
import { useCafe } from "../../context/CafeContext";
import { X, Calendar, Users, Clock, CheckCircle, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export const ReservationModal: React.FC = () => {
  const { activeModal, setActiveModal, createReservation, config } = useCafe();

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestsCount, setGuestsCount] = useState(2);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState("01:00 PM");
  const [notes, setNotes] = useState("");
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  if (activeModal !== "booking") return null;

  const timeSlots = [
    "09:00 AM", "10:30 AM", "12:00 PM", 
    "01:30 PM", "03:00 PM", "04:30 PM", 
    "06:00 PM", "07:30 PM", "08:30 PM"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) return;

    createReservation({
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail.trim() || undefined,
      guestsCount,
      date,
      timeSlot,
      notes: notes.trim() || undefined
    });

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    setConfirmedBookingId(`RES-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleClose = () => {
    setConfirmedBookingId(null);
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Book a Table</h3>
              <p className="text-xs text-stone-500 font-medium">{config.name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedBookingId ? (
          <div className="py-6 text-center space-y-4 bg-emerald-50 rounded-2xl border border-emerald-200 p-6 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-emerald-950 text-lg">Table Reserved!</h4>
              <p className="text-xs text-emerald-800 mt-1">
                We have saved a table for your party. We look forward to hosting you!
              </p>
            </div>

            <div className="bg-white rounded-xl p-3.5 border border-emerald-100 text-left text-xs space-y-1.5 shadow-2xs">
              <div className="flex justify-between text-stone-500">
                <span>Confirmation Code</span>
                <span className="font-mono font-bold text-emerald-800">{confirmedBookingId}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Party Size:</span>
                <span className="font-semibold">{guestsCount} Guests</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Date & Time:</span>
                <span className="font-semibold">{date} at {timeSlot}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Name:</span>
                <span className="font-semibold">{guestName}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Done & Return to Menu
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Miller"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Party Size (Number of Guests)
              </label>
              <div className="flex gap-2">
                {[1, 2, 4, 6, 8].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setGuestsCount(count)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      guestsCount === count
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {count} {count === 8 ? "8+" : ""}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500"
                >
                  {timeSlots.map((ts) => (
                    <option key={ts} value={ts}>{ts}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Special Occasion or Seating Requests
              </label>
              <input
                type="text"
                placeholder="e.g., Birthday, patio seating, high chair"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-md text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirm Table Reservation</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
