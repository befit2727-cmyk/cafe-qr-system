import React, { useState } from "react";
import { useCafe } from "../../context/CafeContext";
import { X, Bell, Receipt, Droplets, Sparkles, Check } from "lucide-react";
import { WaiterCall } from "../../types";

export const WaiterCallModal: React.FC = () => {
  const { activeModal, setActiveModal, activeTable, callWaiter } = useCafe();
  const [calledType, setCalledType] = useState<string | null>(null);

  if (activeModal !== "waiter-call") return null;

  const handleCall = (type: WaiterCall["type"], label: string) => {
    callWaiter(type);
    setCalledType(label);
    setTimeout(() => {
      setCalledType(null);
      setActiveModal(null);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Call Table Service</h3>
              <p className="text-xs text-stone-500 font-medium">{activeTable}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {calledType ? (
          <div className="py-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-emerald-900 text-sm">Server Notified!</h4>
            <p className="text-xs text-emerald-700">
              A staff member is on the way to {activeTable} for {calledType}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => handleCall("waiter", "Assistance")}
              className="p-3.5 rounded-2xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50/50 flex items-center gap-3 transition-all text-left group"
            >
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Call Waiter / Server</h4>
                <p className="text-[11px] text-stone-500">Need recommendations or help with your order</p>
              </div>
            </button>

            <button
              onClick={() => handleCall("bill", "Bill & Payment")}
              className="p-3.5 rounded-2xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50/50 flex items-center gap-3 transition-all text-left group"
            >
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Request Bill & Check</h4>
                <p className="text-[11px] text-stone-500">Pay by card, cash, or digital tap at table</p>
              </div>
            </button>

            <button
              onClick={() => handleCall("water", "Water & Cutlery")}
              className="p-3.5 rounded-2xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50/50 flex items-center gap-3 transition-all text-left group"
            >
              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Refill Water / Extra Cutlery</h4>
                <p className="text-[11px] text-stone-500">Water glasses, napkins, straws, or utensils</p>
              </div>
            </button>

            <button
              onClick={() => handleCall("clean", "Table Cleaning")}
              className="p-3.5 rounded-2xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50/50 flex items-center gap-3 transition-all text-left group"
            >
              <div className="p-2 bg-stone-100 text-stone-700 rounded-xl group-hover:bg-stone-800 group-hover:text-white transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Clean / Clear Table</h4>
                <p className="text-[11px] text-stone-500">Clear empty plates or wipe surface</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
