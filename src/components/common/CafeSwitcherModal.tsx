import React, { useState } from "react";
import { useCafe } from "../../context/CafeContext";
import { 
  Store, 
  Plus, 
  Check, 
  X, 
  ExternalLink, 
  Sparkles, 
  Coffee, 
  Pizza, 
  Utensils, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Crown,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CafeSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CafeSwitcherModal: React.FC<CafeSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { 
    activeCafeId, 
    registeredCafes, 
    switchCafe, 
    onboardCafe, 
    config,
    currentUser,
    setRole 
  } = useCafe();

  const isSuperAdmin = currentUser?.role === "superadmin";

  const [isCreating, setIsCreating] = useState(false);
  const [newCafeName, setNewCafeName] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<"chai-cafe" | "italian-bistro" | "burger-brew">("chai-cafe");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreateCafe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCafeName.trim()) return;

    setIsSubmitting(true);
    try {
      await onboardCafe({
        name: newCafeName.trim(),
        tagline: newTagline.trim() || undefined,
        template: selectedTemplate
      });
      setIsCreating(false);
      setNewCafeName("");
      setNewTagline("");
      onClose();
    } catch (err) {
      console.error("Failed to onboard cafe", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const templates = [
    {
      id: "chai-cafe",
      name: "Specialty Chai & Desi Cafe",
      icon: "☕",
      desc: "Earthen Kulhad Chai, Filter Kaapi, Bombay Sandwiches, Samosa Pav, and fusion desserts.",
      accent: "from-amber-600 to-amber-700"
    },
    {
      id: "italian-bistro",
      name: "Italian Bistro & Pizzeria",
      icon: "🍕",
      desc: "Artisan Wood-Fired Neapolitan Pizzas, Handmade Truffle Pastas, and Roman Espresso.",
      accent: "from-emerald-600 to-emerald-700"
    },
    {
      id: "burger-brew",
      name: "Gourmet Burgers & Brews",
      icon: "🍔",
      desc: "Double smashed truffle burgers, loaded animal-style fries, thick milkshakes, and cold brews.",
      accent: "from-orange-600 to-red-600"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-stone-900 text-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">SaaS Platform Manager</h3>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-stone-400">Switch or onboard client cafe branches across India</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {!isSuperAdmin ? (
            <div className="text-center py-8 px-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto text-2xl shadow-lg">
                <Crown className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-white">Super Admin Authorization Required</h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                  The Multi-Cafe SaaS Platform is managed exclusively under Platform Super Admin. Please authenticate with master credentials to switch or onboard cafe clients.
                </p>
              </div>
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setRole("superadmin");
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>Authenticate as Super Admin</span>
                </button>
              </div>
            </div>
          ) : !isCreating ? (
            <>
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 p-4 rounded-2xl border border-amber-800/40 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Ready for Multi-Client Sales
                  </span>
                  <p className="text-xs text-stone-300">
                    Each cafe has its own isolated menu, live orders, kitchen display, and table QR codes.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Cafe</span>
                </button>
              </div>

              {/* Registered Cafes List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Available Cafes ({registeredCafes.length})
                </h4>

                <div className="space-y-2">
                  {registeredCafes.map((cafe) => {
                    const isActive = cafe.slug === activeCafeId;
                    return (
                      <div
                        key={cafe.id}
                        onClick={() => {
                          switchCafe(cafe.slug);
                          onClose();
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isActive
                            ? "bg-amber-950/30 border-amber-500 ring-1 ring-amber-500/50"
                            : "bg-stone-800/50 border-stone-800 hover:border-stone-700 hover:bg-stone-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-center text-xl shadow-xs">
                            {cafe.logoUrl || "☕"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-sm text-white">{cafe.name}</h5>
                              {isActive && (
                                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-amber-500/30">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-400 line-clamp-1">{cafe.tagline}</p>
                            <span className="text-[10px] text-stone-500 mt-0.5 block font-mono">
                              Slug: ?cafe={cafe.slug}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isActive ? (
                            <div className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-xs">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          ) : (
                            <span className="text-xs text-stone-400 hover:text-white flex items-center gap-1 font-semibold">
                              <span>Switch</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Create New Cafe Form */
            <form onSubmit={handleCreateCafe} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  Onboard a New Cafe Client
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-stone-400 hover:text-white underline"
                >
                  Back to list
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Cafe / Restaurant Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Chimney Cafe, Delhi"
                  value={newCafeName}
                  onChange={(e) => setNewCafeName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Tagline / Subtitle (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wood-Fired Oven & Specialty Brews"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2">
                  Select Starter Menu & Theme Template *
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {templates.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl.id as any)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        selectedTemplate === tmpl.id
                          ? "bg-stone-800 border-amber-500 ring-1 ring-amber-500/50"
                          : "bg-stone-950/60 border-stone-800 hover:border-stone-700"
                      }`}
                    >
                      <span className="text-2xl p-1 bg-stone-900 rounded-xl border border-stone-800">
                        {tmpl.icon}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-xs text-white">{tmpl.name}</h5>
                          {selectedTemplate === tmpl.id && (
                            <span className="text-[10px] font-bold text-amber-400">Selected</span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                          {tmpl.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newCafeName.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? "Onboarding..." : "Create & Launch Cafe"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
