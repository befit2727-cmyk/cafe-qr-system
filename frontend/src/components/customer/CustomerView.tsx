import React, { useState, useMemo, useEffect } from "react";
import { useCafe } from "../../context/CafeContext";
import { MenuItemCard } from "./MenuItemCard";
import { ItemModal } from "./ItemModal";
import { CartDrawer } from "./CartDrawer";
import { OrderStatusModal } from "./OrderStatusModal";
import { WaiterCallModal } from "./WaiterCallModal";
import { ReservationModal } from "./ReservationModal";
import { Hero3DCanvas } from "../3d/Hero3DCanvas";
import { Cafe3DFloorMap } from "../3d/Cafe3DFloorMap";
import { Dish3DInspector } from "../3d/Dish3DInspector";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Flame, 
  ShoppingBag, 
  Sparkles, 
  Calendar, 
  Bell, 
  UtensilsCrossed, 
  Move3d, 
  MapPin 
} from "lucide-react";

export const CustomerView: React.FC = () => {
  const { 
    menu, 
    config, 
    activeCafeId,
    activeTable, 
    cartCount, 
    cartTotal, 
    setActiveModal, 
    currentTableOrders,
    selectedItemFor3D,
    setSelectedItemFor3D,
    viewMode3D,
    setViewMode3D,
    setRole
  } = useCafe();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [filterJainOnly, setFilterJainOnly] = useState(false);
  const [filterPopularOnly, setFilterPopularOnly] = useState(false);

  // When active cafe changes, reset all category & search filters so all dishes of new cafe are visible
  useEffect(() => {
    setSelectedCategory("All");
    setSearchQuery("");
    setFilterVegOnly(false);
    setFilterJainOnly(false);
    setFilterPopularOnly(false);
  }, [activeCafeId]);

  // If selected category is no longer present in this cafe's menu, safely reset to "All"
  useEffect(() => {
    if (selectedCategory !== "All") {
      const exists = menu.some((item) => item.category === selectedCategory);
      if (!exists) {
        setSelectedCategory("All");
      }
    }
  }, [menu, selectedCategory]);

  // Extract unique categories from menu
  const categories = useMemo(() => {
    const cats = Array.from(new Set(menu.map((i) => i.category)));
    return ["All", ...cats];
  }, [menu]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menu.filter((item) => {
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
      if (filterVegOnly && !item.isVeg) return false;
      if (filterJainOnly && !item.isJainAvailable) return false;
      if (filterPopularOnly && !item.isPopular) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [menu, selectedCategory, filterVegOnly, filterJainOnly, filterPopularOnly, searchQuery]);

  return (
    <div className="min-h-screen pb-24 sm:pb-16 bg-[#f5f5f7]">
      
      {/* Super Admin Restriction Alert Banner */}
      {(config.status === "paused" || config.status === "suspended") && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-3 shadow-md border-b border-red-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-xs sm:text-sm font-black tracking-wide">
                  ONLINE ORDERING TEMPORARILY SUSPENDED
                </p>
                <p className="text-[11px] text-red-100 font-medium">
                  This cafe branch's digital ordering has been placed on hold by the platform vendor. Please order directly with counter staff.
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-black/30 uppercase px-2 py-1 rounded font-mono font-bold tracking-wider text-red-200">
              Admin Suspended
            </span>
          </div>
        </div>
      )}

      {/* Hero Welcome Banner - Apple Cinematic Stage */}
      <section className="relative bg-[#000000] text-white pt-14 pb-8 sm:pt-20 sm:pb-12 px-4 sm:px-6 overflow-hidden text-center">
        {/* Apple subtle radial light spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#0071e3]/20 via-white/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-[#2997ff] px-4 py-1.5 rounded-full text-xs font-medium border border-white/10 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Contactless Table Dining • {config.name}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
            Crafted with obsession.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2997ff] via-white to-[#86868b]">
              Delivered to your table.
            </span>
          </h1>

          <p className="text-[#86868b] text-sm sm:text-lg font-normal max-w-xl mx-auto leading-relaxed">
            Order directly to <span className="font-semibold text-white">{activeTable}</span>. Savor the craft, pay at counter whenever you're ready.
          </p>

          {/* Quick Action Pills - Apple Keynote Style */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveModal("cart")}
              className="px-7 py-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs sm:text-sm font-medium transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Order Now {cartCount > 0 ? `(${cartCount})` : ""}</span>
            </button>
            <button
              onClick={() => setActiveModal("booking")}
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-medium transition-all border border-white/15 backdrop-blur-md active:scale-95 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#2997ff]" />
              <span>Table Reservation</span>
            </button>
            <button
              onClick={() => setActiveModal("waiter-call")}
              className="px-5 py-3 text-[#2997ff] hover:underline text-xs sm:text-sm font-medium transition-all flex items-center gap-1"
            >
              <span>Call Waiter</span>
              <span className="text-base">&rsaquo;</span>
            </button>
          </div>

          {/* Centered 3D Experience Canvas */}
          <div className="w-full max-w-md mx-auto pt-4 flex justify-center">
            <Hero3DCanvas />
          </div>
        </div>
      </section>

      {/* 3D Floor Map vs Menu View Switcher Bar (Apple Segmented Dock) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 relative z-20">
        <div className="bg-white/90 backdrop-blur-2xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-black/[0.08] p-1.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-1.5 w-full sm:w-auto bg-[#e8e8ed]/80 p-1 rounded-full">
            <button
              onClick={() => setViewMode3D(false)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-full text-xs font-medium transition-all ${
                !viewMode3D
                  ? "bg-white text-[#1d1d1f] shadow-xs"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Full Menu</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                !viewMode3D ? "bg-black/5 text-[#1d1d1f]" : "bg-transparent text-[#86868b]"
              }`}>
                {filteredItems.length}
              </span>
            </button>

            <button
              onClick={() => setViewMode3D(true)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-full text-xs font-medium transition-all ${
                viewMode3D
                  ? "bg-white text-[#1d1d1f] shadow-xs"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              }`}
            >
              <Move3d className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>3D Floor Plan</span>
              <span className="text-[10px] bg-[#0071e3]/10 text-[#0071e3] font-medium px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#86868b] font-medium px-5 pb-1 sm:pb-0">
            <MapPin className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>Active Table: <strong className="text-[#1d1d1f] font-semibold">{activeTable}</strong></span>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        
        <AnimatePresence mode="wait">
          {viewMode3D ? (
            /* 3D Cafe Floor Plan View with Motion Entrance */
            <motion.div
              key="floor-plan-view"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#1d1d1f] text-xl flex items-center gap-2">
                    <span>Interactive 3D Floor Plan</span>
                    <span className="text-xs font-normal bg-[#0071e3]/10 text-[#0071e3] px-2.5 py-0.5 rounded-full">
                      Live Seating
                    </span>
                  </h3>
                  <p className="text-xs text-[#86868b] mt-0.5">
                    Rotate, pan, and click on any table to select your seat. Glowing rings indicate current real-time table status.
                  </p>
                </div>
                <button
                  onClick={() => setViewMode3D(false)}
                  className="hidden sm:flex items-center gap-1 text-xs font-medium text-[#0071e3] hover:underline"
                >
                  <span>Back to Menu</span>
                  <span>&rarr;</span>
                </button>
              </div>

              <Cafe3DFloorMap />
            </motion.div>
          ) : (
            /* Standard Menu View with Motion Layout */
            <motion.div
              key="menu-grid-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Search & Dietary Filters Bar */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]" />
                    <input
                      type="text"
                      placeholder="Search menu, drinks, appetizers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-8 py-2.5 bg-white rounded-full text-xs sm:text-sm border border-black/[0.08] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] text-[#1d1d1f] placeholder:text-[#86868b] transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Quick Dietary Toggle Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    <button
                      onClick={() => setFilterPopularOnly(!filterPopularOnly)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                        filterPopularOnly
                          ? "bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-xs"
                          : "bg-white text-[#86868b] border-black/[0.08] hover:text-[#1d1d1f]"
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Popular</span>
                    </button>

                    <button
                      onClick={() => setFilterVegOnly(!filterVegOnly)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                        filterVegOnly
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-[#86868b] border-black/[0.08] hover:text-[#1d1d1f]"
                      }`}
                    >
                      <div className="w-3.5 h-3.5 bg-white rounded-xs border border-emerald-600 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-600" />
                      </div>
                      <span>Veg</span>
                    </button>

                    <button
                      onClick={() => setFilterJainOnly(!filterJainOnly)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                        filterJainOnly
                          ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                          : "bg-white text-[#86868b] border-black/[0.08] hover:text-[#1d1d1f]"
                      }`}
                    >
                      <span>🥬 Jain</span>
                    </button>
                  </div>

                </div>

                {/* Category Horizontal Scroll Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? "bg-[#1d1d1f] text-white shadow-xs"
                          : "bg-white text-[#86868b] border border-black/[0.06] hover:text-[#1d1d1f] hover:border-black/[0.15]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Grid with Motion.dev layout animation */}
              <div>
                <div className="flex justify-between items-end mb-5">
                  <div>
                    <span className="text-[11px] font-semibold text-[#0071e3] tracking-widest uppercase block mb-0.5">Explore Selection</span>
                    <h3 className="font-semibold text-[#1d1d1f] text-2xl sm:text-3xl tracking-tight">
                      {selectedCategory === "All" ? "Authentic Cafe Menu" : selectedCategory}
                    </h3>
                  </div>
                  <span className="text-xs text-[#86868b] font-medium bg-white px-3 py-1 rounded-full border border-black/[0.06] shadow-2xs">
                    {filteredItems.length} dish{filteredItems.length === 1 ? "" : "es"}
                  </span>
                </div>

                {filteredItems.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-xl mx-auto">
                      ☕
                    </div>
                    <h4 className="font-bold text-stone-900">No dishes found</h4>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Try clearing your search query or dietary filters to view all available menu items.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All");
                        setFilterVegOnly(false);
                        setFilterJainOnly(false);
                        setFilterPopularOnly(false);
                      }}
                      className="mt-2 text-xs font-bold text-amber-700 underline"
                    >
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                  >
                    {filteredItems.map((item) => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Professional Customer Footer with Subtle Admin Gate Link */}
      <footer className="mt-14 border-t border-stone-200/80 bg-white/70 backdrop-blur-xs py-8 px-4 text-xs text-stone-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-bold text-stone-800">{config.name} • Contactless Dining</p>
            <p className="text-[11px] text-stone-400 mt-0.5">{config.address || "Craft Cafe & Artisan Roasters"} • {config.phone}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <span className="text-stone-600 font-medium">FSSAI Hygiene Certified</span>
            <span>•</span>
            <span className="text-stone-600 font-medium">Daily Fresh Bakes</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setRole("superadmin")}
              className="text-stone-400 hover:text-stone-700 transition-colors underline cursor-pointer"
              title="Platform Vendor / Super Admin Login Gate"
            >
              Admin Access
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Bottom Cart Bar for Mobile */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom-6">
          <button
            onClick={() => setActiveModal("cart")}
            className="w-full bg-gradient-to-r from-espresso-900 to-stone-900 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border border-stone-700/60 transition-transform active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {cartCount}
              </div>
              <div className="text-left">
                <span className="text-xs text-stone-300 block">Serving to {activeTable}</span>
                <span className="text-sm font-bold text-white">View Cart • Pay on Counter</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-amber-400">
                {config.currencySymbol}{cartTotal.toFixed(2)}
              </span>
              <div className="p-1.5 rounded-lg bg-white/10 text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* 3D Dish 360 Inspector Modal */}
      <Dish3DInspector
        item={selectedItemFor3D}
        isOpen={!!selectedItemFor3D}
        onClose={() => setSelectedItemFor3D(null)}
      />

      {/* Modals */}
      <ItemModal />
      <CartDrawer />
      <OrderStatusModal />
      <WaiterCallModal />
      <ReservationModal />

    </div>
  );
};
