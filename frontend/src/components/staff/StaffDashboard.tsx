import React, { useState } from "react";
import { useCafe } from "../../context/CafeContext";
import { OrderCard } from "./OrderCard";
import { ReservationList } from "./ReservationList";
import { 
  ChefHat, 
  Clock, 
  Bell, 
  Calendar, 
  Utensils, 
  Volume2, 
  VolumeX, 
  Check, 
  RotateCcw,
  Sparkles
} from "lucide-react";

export const StaffDashboard: React.FC = () => {
  const { 
    orders, 
    waiterCalls, 
    resolveWaiterCall, 
    soundEnabled, 
    setSoundEnabled, 
    reservations,
    config
  } = useCafe();

  const [activeTab, setActiveTab] = useState<"orders" | "reservations">("orders");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const pendingCalls = waiterCalls.filter((c) => !c.resolved);
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const servedOrders = orders.filter((o) => o.status === "served");
  const completedOrders = orders.filter((o) => o.status === "completed");

  const displayOrders = orders.filter((o) => {
    if (filterStatus === "all") return o.status !== "completed" && o.status !== "cancelled";
    return o.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-stone-100/70 pb-16">
      
      {/* Super Admin Suspension Banner */}
      {(config.status === "paused" || config.status === "suspended") && (
        <div className="bg-red-950 border-b border-red-800 text-red-200 px-4 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span className="font-bold">CAFE SERVICE SUSPENDED BY PLATFORM VENDOR: New customer online orders are blocked.</span>
          </div>
          <span className="bg-red-900/60 font-mono text-[10px] px-2 py-0.5 rounded text-red-200 uppercase font-bold">
            Administrative Hold
          </span>
        </div>
      )}

      {/* Top Staff Subheader */}
      <div className="bg-espresso-900 text-white border-b border-stone-800 px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-600 rounded-xl shadow-xs">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white leading-tight">
                Kitchen & Service Display System
              </h2>
              <p className="text-xs text-stone-400">
                Live incoming orders and table requests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                soundEnabled
                  ? "bg-stone-800 text-amber-400 border-stone-700 hover:bg-stone-700"
                  : "bg-red-950 text-red-300 border-red-800"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? "Audio Chimes On" : "Audio Muted"}</span>
            </button>

            {/* Tab switch */}
            <div className="bg-stone-800 p-1 rounded-xl flex gap-1 border border-stone-700">
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "orders"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                Orders ({orders.filter(o => o.status === 'pending' || o.status === 'preparing').length})
              </button>
              <button
                onClick={() => setActiveTab("reservations")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "reservations"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                Reservations ({reservations.filter(r => r.status === 'confirmed').length})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Urgent Waiter Call Alerts */}
        {pendingCalls.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 animate-bounce text-red-600" />
              Active Table Requests ({pendingCalls.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {pendingCalls.map((call) => (
                <div
                  key={call.id}
                  className="bg-red-50 border border-red-300 rounded-2xl p-3.5 flex items-center justify-between shadow-xs animate-in zoom-in-95"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <div>
                      <h4 className="font-extrabold text-red-950 text-sm">
                        {call.tableNumber}
                      </h4>
                      <p className="text-xs text-red-700 font-medium">
                        {call.type === "bill" ? "Bill Request" :
                         call.type === "water" ? "Water / Cutlery" :
                         call.type === "clean" ? "Table Cleaning" : "Waiter Call"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => resolveWaiterCall(call.id)}
                    className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "orders" ? (
          <div className="space-y-6">
            
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <button
                onClick={() => setFilterStatus("pending")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  filterStatus === "pending"
                    ? "bg-amber-100/80 border-amber-400 ring-2 ring-amber-300"
                    : "bg-white border-stone-200 hover:border-amber-300"
                }`}
              >
                <div className="flex justify-between items-center text-xs font-bold text-stone-500">
                  <span>New Orders</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                </div>
                <div className="text-2xl font-black text-amber-700 mt-1">
                  {pendingOrders.length}
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">Awaiting Kitchen</p>
              </button>

              <button
                onClick={() => setFilterStatus("preparing")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  filterStatus === "preparing"
                    ? "bg-blue-100/80 border-blue-400 ring-2 ring-blue-300"
                    : "bg-white border-stone-200 hover:border-blue-300"
                }`}
              >
                <div className="flex justify-between items-center text-xs font-bold text-stone-500">
                  <span>In Cooking</span>
                  <ChefHat className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-blue-700 mt-1">
                  {preparingOrders.length}
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">Being Prepared</p>
              </button>

              <button
                onClick={() => setFilterStatus("served")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  filterStatus === "served"
                    ? "bg-indigo-100/80 border-indigo-400 ring-2 ring-indigo-300"
                    : "bg-white border-stone-200 hover:border-indigo-300"
                }`}
              >
                <div className="flex justify-between items-center text-xs font-bold text-stone-500">
                  <span>Served</span>
                  <Utensils className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-indigo-700 mt-1">
                  {servedOrders.length}
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">At Table / Dining</p>
              </button>

              <button
                onClick={() => setFilterStatus("all")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  filterStatus === "all"
                    ? "bg-stone-200 border-stone-400 ring-2 ring-stone-300"
                    : "bg-white border-stone-200 hover:border-stone-400"
                }`}
              >
                <div className="flex justify-between items-center text-xs font-bold text-stone-500">
                  <span>All Active</span>
                  <Sparkles className="w-3.5 h-3.5 text-stone-600" />
                </div>
                <div className="text-2xl font-black text-stone-900 mt-1">
                  {pendingOrders.length + preparingOrders.length + servedOrders.length}
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">Active Tickets</p>
              </button>
            </div>

            {/* Orders Cards Grid */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <span>Active Kitchen Queue</span>
                  {filterStatus !== "all" && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-semibold">
                      Filtered: {filterStatus}
                    </span>
                  )}
                </h3>

                {filterStatus !== "all" && (
                  <button
                    onClick={() => setFilterStatus("all")}
                    className="text-xs text-amber-700 hover:underline font-semibold"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {displayOrders.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl mx-auto">
                    ?
                  </div>
                  <h4 className="font-bold text-stone-900">All caught up!</h4>
                  <p className="text-xs text-stone-500">
                    No active tickets right now in this status. New table scans will chime automatically.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          <ReservationList />
        )}

      </div>
    </div>
  );
};
