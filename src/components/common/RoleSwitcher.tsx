import React, { useState } from "react";
import { useCafe } from "../../context/CafeContext";
import { UserRole } from "../../types";
import { Shield, ChefHat, Smartphone, KeyRound, X, Check, Coffee, QrCode, Store, Crown, LogIn, LogOut, User, Sparkles } from "lucide-react";
import { TableQRModal } from "./TableQRModal";
import { CafeSwitcherModal } from "./CafeSwitcherModal";
import { LoginModal, GoogleLogo } from "../auth/LoginModal";

export const RoleSwitcher: React.FC = () => {
  const { 
    role, 
    setRole, 
    config, 
    activeTable, 
    setActiveTable, 
    currentUser, 
    loginWithPin,
    logout, 
    showLoginModal, 
    setShowLoginModal 
  } = useCafe();
  const [showPinModal, setShowPinModal] = useState<UserRole | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCafeModal, setShowCafeModal] = useState(false);

  const handleRoleClick = (targetRole: UserRole) => {
    if (targetRole === role) return;

    if (targetRole === "customer") {
      setRole("customer");
      return;
    }

    if (targetRole === "superadmin") {
      setRole("superadmin");
      return;
    }

    setShowPinModal(targetRole);
    setPinInput("");
    setPinError(false);
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pinInput.trim();

    if (showPinModal === "staff") {
      const isStaffMatch = clean === (config.staffPin || "0000");
      if (isStaffMatch) {
        await loginWithPin(clean, "staff");
        setRole("staff");
        setShowPinModal(null);
      } else {
        setPinError(true);
      }
    } else if (showPinModal === "owner") {
      const isOwnerMatch = clean === (config.ownerPin || "1234");
      if (isOwnerMatch) {
        await loginWithPin(clean, "owner");
        setRole("owner");
        setShowPinModal(null);
      } else {
        setPinError(true);
      }
    }
  };

  const handleSaaSClick = () => {
    // SaaS platform is strictly under Super Admin
    if (currentUser?.role === "superadmin") {
      setShowCafeModal(true);
    } else {
      setRole("superadmin");
    }
  };

  return (
    <>
      <div className="bg-[#161617]/85 backdrop-blur-xl text-[#d6d6d7] text-xs px-4 sm:px-8 py-2 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shadow-xs sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-white tracking-tight">
            <span className="text-sm"></span>
            <span className="hidden sm:inline font-medium text-[11px] text-[#86868b] uppercase tracking-wider">Mode</span>
          </span>
          <div className="inline-flex bg-white/[0.08] p-0.5 rounded-full border border-white/[0.06]">
            <button
              onClick={() => handleRoleClick("customer")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                role === "customer"
                  ? "bg-white text-black shadow-xs"
                  : "text-[#a1a1a6] hover:text-white"
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>Customer</span>
            </button>
            <button
              onClick={() => handleRoleClick("staff")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                role === "staff"
                  ? "bg-white text-black shadow-xs"
                  : "text-[#a1a1a6] hover:text-white"
              }`}
            >
              <ChefHat className="w-3 h-3" />
              <span>Kitchen</span>
            </button>
            <button
              onClick={() => handleRoleClick("owner")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                role === "owner"
                  ? "bg-white text-black shadow-xs"
                  : "text-[#a1a1a6] hover:text-white"
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Owner</span>
            </button>
            <button
              onClick={() => handleRoleClick("superadmin")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                role === "superadmin"
                  ? "bg-[#0071e3] text-white shadow-xs"
                  : "text-[#a1a1a6] hover:text-[#2997ff]"
              }`}
              title="Super Admin Vendor Master Portal"
            >
              <Crown className="w-3 h-3" />
              <span>Super Admin</span>
            </button>
          </div>
        </div>

        {/* Quick Access: Sign In, Cafe Switcher, Table Selector & Table QR Codes */}
        <div className="flex items-center gap-2">
          {/* User Sign In / Account Status */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10 text-xs">
              {currentUser.provider === "google" ? (
                <GoogleLogo className="w-3.5 h-3.5 flex-shrink-0" />
              ) : (
                <User className="w-3 h-3 text-[#8ab4f8]" />
              )}
              <span className="text-[#8ab4f8] font-medium max-w-[85px] truncate text-[11px]">
                {currentUser.role === "superadmin" ? "Master Admin" : currentUser.name.split(" ")[0]}
              </span>
              <button
                onClick={logout}
                title="Sign Out"
                className="text-[#86868b] hover:text-red-400 ml-1 transition-colors"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 bg-white hover:bg-[#f8f9fa] text-[#1f1f1f] font-medium px-3.5 py-1 rounded-full border border-[#dadce0] shadow-xs transition-all text-xs active:scale-95"
              title="Sign In with Google or Email (Max 5/day)"
            >
              <GoogleLogo className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-semibold text-[#1f1f1f]">Sign In</span>
            </button>
          )}

          {/* SaaS Platform Button - Under Super Admin Protection */}
          <button
            onClick={handleSaaSClick}
            className={`flex items-center gap-1.5 font-medium px-3 py-1 rounded-full border shadow-xs transition-all text-xs active:scale-95 ${
              currentUser?.role === "superadmin"
                ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30"
                : "bg-white/5 hover:bg-white/10 text-[#d6d6d7] hover:text-white border-white/10"
            }`}
            title="SaaS Platform Master (Protected under Super Admin)"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="max-w-[110px] truncate hidden xs:inline font-medium">SaaS Platform</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full font-mono font-bold">
              Super Admin
            </span>
          </button>

          {/* Quick Table QR Codes button */}
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-1 rounded-full border border-white/15 shadow-xs transition-all text-xs active:scale-95"
          >
            <QrCode className="w-3 h-3" />
            <span className="hidden sm:inline">Table QRs</span>
            <span className="sm:hidden">QRs</span>
          </button>

          {role === "customer" && (
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[#86868b] text-[11px]">Table:</span>
              <select
                value={activeTable}
                onChange={(e) => setActiveTable(e.target.value)}
                aria-label="Select table to simulate"
                className="bg-white/10 text-white text-xs font-medium px-2 py-0.5 rounded-full border border-white/10 focus:outline-none focus:border-[#0071e3] cursor-pointer"
              >
                {config.tables.map((t) => (
                  <option key={t} value={t} className="bg-[#161617] text-white">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Login / Auth Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Multi-Cafe SaaS Switcher Modal */}
      <CafeSwitcherModal
        isOpen={showCafeModal}
        onClose={() => setShowCafeModal(false)}
      />

      {/* Modal showing all table QR codes ready to scan */}
      <TableQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />

      {/* PIN Security Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-stone-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-lg">
                    {showPinModal === "owner" ? "Owner Portal Access" : "Staff / Kitchen Access"}
                  </h3>
                  <p className="text-xs text-stone-500">Enter secure access PIN</p>
                </div>
              </div>
              <button
                onClick={() => setShowPinModal(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  autoFocus
                  maxLength={6}
                  placeholder="Enter 4-digit PIN"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className="w-full text-center tracking-widest text-2xl font-bold py-3 px-4 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-stone-50 text-stone-900"
                />
                {pinError && (
                  <p className="text-xs text-red-500 mt-2 text-center font-medium">
                    Incorrect security PIN. Access denied.
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(null)}
                  className="flex-1 py-2.5 border border-stone-300 rounded-xl text-stone-700 font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 flex items-center justify-center gap-1 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Unlock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
