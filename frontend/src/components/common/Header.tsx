import React, { useState } from "react";
import { useCafe } from "../../context/CafeContext";
import { ShoppingBag, Bell, Calendar, Wifi, MapPin, Clock, Volume2, VolumeX, Sparkles } from "lucide-react";

export const Header: React.FC = () => {
  const { 
    config, 
    activeTable, 
    setActiveTable, 
    cartCount, 
    setActiveModal, 
    currentTableOrders, 
    soundEnabled, 
    setSoundEnabled,
    role,
    isSocketConnected
  } = useCafe();

  const [showTableSelect, setShowTableSelect] = useState(false);
  const [showWifiPopup, setShowWifiPopup] = useState(false);

  const activeTableOrder = currentTableOrders.find(
    (o) => o.status === "pending" || o.status === "preparing" || o.status === "served"
  );

  return (
    <header className="sticky top-0 z-30 bg-[#f5f5f7]/85 backdrop-blur-xl border-b border-black/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* Cafe Brand & Table Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center text-xl shadow-xs">
              {config.logoUrl || "☕"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-[#1d1d1f] tracking-tight text-base sm:text-lg leading-tight">
                  {config.name}
                </h1>
                <button
                  onClick={() => setShowWifiPopup(!showWifiPopup)}
                  className="text-[#86868b] hover:text-[#1d1d1f] p-1 rounded-full relative transition-colors"
                  title="Cafe Wi-Fi"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  {showWifiPopup && (
                    <div className="absolute left-0 top-full mt-2 w-52 bg-[#1d1d1f]/95 backdrop-blur-xl text-white text-xs rounded-2xl p-3.5 shadow-2xl z-50 border border-white/10 animate-in fade-in">
                      <p className="font-semibold text-[#2997ff] mb-1.5 flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5" /> Free Cafe Wi-Fi
                      </p>
                      <p className="text-neutral-300 text-[11px]">Network: <span className="font-mono text-white font-medium">{config.wifiName}</span></p>
                      <p className="text-neutral-300 text-[11px] mt-0.5">Password: <span className="font-mono text-[#2997ff] font-medium">{config.wifiPassword || "Ask at Counter"}</span></p>
                    </div>
                  )}
                </button>
              </div>

              {/* Table Badge */}
              <div className="relative inline-block mt-0.5">
                <button
                  onClick={() => setShowTableSelect(!showTableSelect)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#1d1d1f] hover:bg-black/10 transition-colors bg-black/5 px-2.5 py-0.5 rounded-full border border-black/[0.04]"
                >
                  <MapPin className="w-3 h-3 text-[#0071e3]" />
                  <span>{activeTable}</span>
                  <span className="text-[10px] text-[#0071e3] font-normal underline ml-0.5">change</span>
                </button>

                {showTableSelect && (
                  <div className="absolute left-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-black/[0.08] p-2 z-50 max-h-56 overflow-y-auto">
                    <p className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider px-2.5 py-1">
                      Select Table
                    </p>
                    {config.tables.map((tbl) => (
                      <button
                        key={tbl}
                        onClick={() => {
                          setActiveTable(tbl);
                          setShowTableSelect(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-xl flex items-center justify-between transition-colors ${
                          activeTable === tbl
                            ? "bg-[#0071e3] font-medium text-white shadow-xs"
                            : "text-[#1d1d1f] hover:bg-black/5"
                        }`}
                      >
                        <span>{tbl}</span>
                        {activeTable === tbl && <span className="text-white text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Live Socket Sync Badge */}
            {isSocketConnected && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-700 rounded-full border border-emerald-500/20 text-[11px] font-medium" title="Real-time WebSocket active">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Sync</span>
              </div>
            )}
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute audio chimes" : "Enable audio chimes"}
              className={`p-2 rounded-full border transition-colors hidden sm:flex items-center justify-center ${
                soundEnabled
                  ? "border-black/[0.08] bg-black/5 text-[#1d1d1f] hover:bg-black/10"
                  : "border-red-200 bg-red-50 text-red-500"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Active Order Tracker Pill */}
            {activeTableOrder && (
              <button
                onClick={() => setActiveModal("order-status")}
                className="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-emerald-500/25 transition-all shadow-xs animate-pulse"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Order #{activeTableOrder.orderNumber}:</span>
                <span className="capitalize">{activeTableOrder.status}</span>
              </button>
            )}

            {/* Call Waiter / Bill Button */}
            <button
              onClick={() => setActiveModal("waiter-call")}
              className="flex items-center gap-1.5 bg-black/5 hover:bg-black/10 text-[#1d1d1f] px-3.5 py-1.5 rounded-full text-xs font-medium border border-black/[0.04] transition-all"
            >
              <Bell className="w-3.5 h-3.5 text-[#1d1d1f]" />
              <span className="hidden sm:inline">Call Waiter</span>
            </button>

            {/* Reservation Button */}
            <button
              onClick={() => setActiveModal("booking")}
              className="flex items-center gap-1.5 bg-black/5 hover:bg-black/10 text-[#1d1d1f] px-3.5 py-1.5 rounded-full text-xs font-medium border border-black/[0.04] transition-all hidden md:flex"
            >
              <Calendar className="w-3.5 h-3.5 text-[#1d1d1f]" />
              <span>Book Table</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setActiveModal("cart")}
              className="relative flex items-center gap-2 bg-[#0071e3] hover:bg-[#0077ed] text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-xs transition-all active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-white text-[#0071e3] font-bold px-1.5 py-0.2 rounded-full text-[11px] shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
