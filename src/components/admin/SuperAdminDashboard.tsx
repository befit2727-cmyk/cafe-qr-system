import React, { useState, useEffect } from "react";
import { useCafe } from "../../context/CafeContext";
import { API_BASE } from "../../services/api";
import { DEFAULT_CAFES } from "../../data/defaultCafes";
import { CafeSwitcherModal } from "../common/CafeSwitcherModal";
import { 
  Crown, 
  Store, 
  TrendingUp, 
  Users, 
  Layers, 
  Plus, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle, 
  ArrowUpRight, 
  QrCode, 
  ChefHat, 
  Settings,
  Search,
  Building2,
  DollarSign,
  Sparkles,
  ArrowRight,
  LogOut
} from "lucide-react";

export const SuperAdminDashboard: React.FC = () => {
  const { 
    currentUser, 
    switchCafe, 
    setRole, 
    onboardCafe, 
    registeredCafes,
    config,
    logout
  } = useCafe();

  const [cafes, setCafes] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>({
    totalCafes: 8,
    activeCafesCount: 8,
    totalPlatformRevenue: 0,
    totalOrdersCount: 0,
    totalTablesCount: 53,
    monthlyRecurringRevenue: 23992
  });
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCafeSwitcher, setShowCafeSwitcher] = useState(false);
  const [newCafe, setNewCafe] = useState({
    name: "",
    city: "",
    ownerEmail: "",
    ownerPassword: "",
    template: "chai-cafe",
    plan: "Premium Pro"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch superadmin overview & cafe list
  const loadData = async () => {
    try {
      const token = localStorage.getItem("saas_auth_token");
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [ovRes, cafesRes] = await Promise.all([
        fetch(`${API_BASE}/admin/overview`, { headers }),
        fetch(`${API_BASE}/admin/cafes`, { headers })
      ]);

      if (ovRes.ok && ovRes.headers.get("content-type")?.includes("application/json")) {
        setOverview(await ovRes.json());
      }
      if (cafesRes.ok && cafesRes.headers.get("content-type")?.includes("application/json")) {
        const data = await cafesRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setCafes(data);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not load admin stats from server, using local data", e);
    }
    setCafes(registeredCafes.length > 0 ? registeredCafes : DEFAULT_CAFES);
  };

  useEffect(() => {
    loadData();
  }, [registeredCafes]);

  const handleToggleStatus = async (slug: string, currentStatus: string) => {
    const nextStatus = currentStatus === "paused" ? "active" : "paused";
    setCafes((prev) => prev.map((c) => (c.slug === slug ? { ...c, status: nextStatus } : c)));
    try {
      const token = localStorage.getItem("saas_auth_token");
      await fetch(`${API_BASE}/admin/cafes/${slug}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCafe.name.trim()) return;
    setIsSubmitting(true);
    const slug = newCafe.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const localCreatedCafe = {
      id: slug,
      slug,
      name: newCafe.name.trim(),
      city: newCafe.city.trim() || "Mumbai",
      tagline: "Specialty Gourmet & Artisan Drinks",
      logoUrl: "🏪",
      currencySymbol: "₹",
      address: `${newCafe.city || "Mumbai"} City Center`,
      phone: "+91 98000 11122",
      template: newCafe.template || "chai-cafe",
      ownerEmail: newCafe.ownerEmail || `owner@${slug}.com`,
      status: "active",
      plan: newCafe.plan || "Premium Pro",
      monthlySales: 0
    };
    setCafes((prev) => [localCreatedCafe, ...prev]);

    try {
      const token = localStorage.getItem("saas_auth_token");
      await fetch(`${API_BASE}/admin/cafes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newCafe)
      });
    } catch (e) {
      console.warn("Server create failed, cafe created in local state", e);
    } finally {
      setShowCreateModal(false);
      setIsSubmitting(false);
      setNewCafe({
        name: "",
        city: "",
        ownerEmail: "",
        ownerPassword: "",
        template: "chai-cafe",
        plan: "Premium Pro"
      });
    }
  };

  const handleLoginAsCafe = async (slug: string) => {
    await switchCafe(slug);
    setRole("owner");
  };

  const filtered = cafes.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.city && c.city.toLowerCase().includes(search.toLowerCase())) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-20">
      
      {/* Top Super Admin Nav Bar */}
      <div className="border-b border-stone-800 bg-stone-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl text-stone-950 shadow-md">
              <Crown className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-white">SaaS Platform Vendor Master</h2>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-stone-400">Managing 8+ Live Client Cafes across India</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowCafeSwitcher(true)}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-stone-700 flex items-center gap-1.5"
              title="Quick Switch Active Cafe Branch"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Switch Cafe</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-xl text-xs font-extrabold shadow-lg flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Onboard New Cafe</span>
            </button>

            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete("admin");
                url.searchParams.delete("role");
                window.history.replaceState({}, "", url.toString());
                setRole("customer");
              }}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-stone-700"
            >
              <span>Exit to Cafe</span>
            </button>

            <button
              onClick={() => {
                logout();
                const url = new URL(window.location.href);
                url.searchParams.delete("admin");
                url.searchParams.delete("role");
                window.history.replaceState({}, "", url.toString());
                setRole("customer");
              }}
              className="px-3 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-red-200 rounded-xl text-xs font-bold transition-all border border-red-800/60 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        
        {/* Metric Highlight Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-stone-900/80 border border-stone-800 p-5 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-stone-400">
              <span className="text-xs font-bold uppercase tracking-wider">Onboarded Cafes</span>
              <Store className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {overview.totalCafes} <span className="text-xs text-emerald-400 font-semibold font-mono">({overview.activeCafesCount} Active)</span>
            </div>
            <p className="text-[11px] text-stone-500">Commercial restaurant deployments</p>
          </div>

          <div className="bg-stone-900/80 border border-stone-800 p-5 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-stone-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Tables</span>
              <Layers className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {overview.totalTablesCount}
            </div>
            <p className="text-[11px] text-stone-500">QR codes generated and serving</p>
          </div>

          <div className="bg-stone-900/80 border border-stone-800 p-5 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-stone-400">
              <span className="text-xs font-bold uppercase tracking-wider">Estimated MRR</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {config.currencySymbol}{overview.monthlyRecurringRevenue?.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-emerald-500 font-semibold">@ ₹2,999/mo per cafe subscription</p>
          </div>

          <div className="bg-stone-900/80 border border-stone-800 p-5 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-stone-400">
              <span className="text-xs font-bold uppercase tracking-wider">Platform GMV</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {config.currencySymbol}{(overview.totalPlatformRevenue || 1289000).toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-stone-500">Processed order gross volume</p>
          </div>
        </div>

        {/* Cafe Management Directory */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg text-white">Client Cafe Accounts Directory</h3>
              <p className="text-xs text-stone-400">Manage individual credentials, menus, tables, and subscription access</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by cafe name or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((cafe) => {
              const isPaused = cafe.status === "paused";
              return (
                <div 
                  key={cafe.slug}
                  className="bg-stone-900/70 border border-stone-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-stone-700 transition-all shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-center text-2xl shadow-xs flex-shrink-0">
                          {cafe.logoUrl || "☕"}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white leading-tight">{cafe.name}</h4>
                          <p className="text-[11px] text-stone-400 mt-0.5">{cafe.city || cafe.address}</p>
                          <span className="text-[10px] text-stone-500 font-mono">Slug: {cafe.slug}</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        isPaused 
                          ? "bg-red-500/10 text-red-400 border-red-500/30" 
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}>
                        {isPaused ? "PAUSED" : "ACTIVE"}
                      </span>
                    </div>

                    <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800/80 space-y-1.5 text-xs">
                      <div className="flex justify-between text-stone-400">
                        <span>Owner Login:</span>
                        <span className="font-mono text-stone-200">{cafe.ownerEmail || `owner@${cafe.slug}.com`}</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>Active Tables:</span>
                        <span className="font-semibold text-white">{cafe.tablesCount || 6} Tables</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>SaaS Subscription:</span>
                        <span className="font-semibold text-amber-400">{cafe.plan || "Premium Pro"} (₹2,999/mo)</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Customer QR View */}
                      <button
                        onClick={async () => {
                          await switchCafe(cafe.slug);
                          setRole("customer");
                        }}
                        className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all text-xs flex items-center gap-1"
                        title="View Customer QR Menu"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Menu</span>
                      </button>

                      {/* Staff Kitchen Display */}
                      <button
                        onClick={async () => {
                          await switchCafe(cafe.slug);
                          setRole("staff");
                        }}
                        className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all text-xs flex items-center gap-1"
                        title="View Kitchen Display"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Kitchen</span>
                      </button>

                      {/* Toggle status / restriction */}
                      <button
                        onClick={() => handleToggleStatus(cafe.slug, cafe.status || "active")}
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isPaused 
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                            : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                        }`}
                        title={isPaused ? "Resume & Remove Restrictions" : "Suspend & Restrict Orders"}
                      >
                        {isPaused ? (
                          <>
                            <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Activate</span>
                          </>
                        ) : (
                          <>
                            <PauseCircle className="w-3.5 h-3.5 text-red-400" />
                            <span>Restrict</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Manage as Owner */}
                    <button
                      onClick={() => handleLoginAsCafe(cafe.slug)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl text-xs flex items-center gap-1 transition-all shadow-xs"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Onboard New Cafe Client Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Onboard a New Cafe Client</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-white text-xs">
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">Cafe Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Chimney Bistro"
                  value={newCafe.name}
                  onChange={(e) => setNewCafe({ ...newCafe, name: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">City / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai - Khar West"
                  value={newCafe.city}
                  onChange={(e) => setNewCafe({ ...newCafe, city: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Owner Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="owner@copperchimney.com"
                    value={newCafe.ownerEmail}
                    onChange={(e) => setNewCafe({ ...newCafe, ownerEmail: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Owner Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newCafe.ownerPassword}
                    onChange={(e) => setNewCafe({ ...newCafe, ownerPassword: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Starter Template *</label>
                <select
                  value={newCafe.template}
                  onChange={(e) => setNewCafe({ ...newCafe, template: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="chai-cafe">☕ Specialty Chai & Desi Gourmet</option>
                  <option value="italian-bistro">🍕 Italian Bistro & Neapolitan Pizzeria</option>
                  <option value="burger-brew">🍔 Gourmet Burgers, Loaded Fries & Shakes</option>
                  <option value="bakery-cafe">🥐 French Bakery & Single-Origin Roastery</option>
                  <option value="south-tiffin">🥥 Traditional South Indian Tiffin</option>
                  <option value="asian-boba">🥟 Pan-Asian Dim Sum & Boba House</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold rounded-xl shadow-lg transition-all"
                >
                  {isSubmitting ? "Onboarding..." : "Launch Client Cafe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Cafe Switcher Modal */}
      <CafeSwitcherModal
        isOpen={showCafeSwitcher}
        onClose={() => setShowCafeSwitcher(false)}
      />

    </div>
  );
};
