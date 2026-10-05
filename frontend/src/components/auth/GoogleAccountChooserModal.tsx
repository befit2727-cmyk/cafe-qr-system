import React, { useState } from "react";
import { X, UserPlus, Check, Key, Shield, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { GoogleLogo } from "./LoginModal";
import { 
  getGoogleClientId, 
  setCustomGoogleClientId, 
  promptGoogleLogin 
} from "../../services/googleAuth";

export interface GoogleSelectedAccount {
  email: string;
  name: string;
  role?: "superadmin" | "owner" | "staff" | "customer";
  avatar?: string;
  idToken?: string;
}

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: GoogleSelectedAccount) => Promise<void> | void;
  targetRole?: "superadmin" | "customer";
}

export const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  targetRole
}) => {
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showConfigureClientId, setShowConfigureClientId] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [clientIdInput, setClientIdInput] = useState(getGoogleClientId());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const adminEmails = ["mayankkaushik361865@gmail.com", "admin@cafesaas.com", "superadmin@cafesaas.com"];

  const handleSelectPredefined = async (email: string, name: string, preferredRole?: "superadmin" | "customer") => {
    setLoading(true);
    setError(null);
    try {
      const isEmailAdmin = adminEmails.includes(email.toLowerCase().trim());
      const role = preferredRole || (isEmailAdmin ? "superadmin" : "customer");
      await onSelectAccount({
        email,
        name,
        role
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to sign in with chosen account.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const cleanEmail = customEmail.toLowerCase().trim();
      const isEmailAdmin = adminEmails.includes(cleanEmail);
      const role = targetRole === "superadmin" ? (isEmailAdmin ? "superadmin" : "customer") : (isEmailAdmin ? "superadmin" : "customer");
      await onSelectAccount({
        email: cleanEmail,
        name: customName.trim() || cleanEmail.split("@")[0],
        role
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to sign in with account.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClientIdAndTriggerNative = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedId = clientIdInput.trim();
    if (!trimmedId) {
      setError("Please paste a valid Google Client ID.");
      return;
    }
    setCustomGoogleClientId(trimmedId);
    setShowConfigureClientId(false);

    // Immediately trigger native Google account chooser
    setLoading(true);
    try {
      const userInfo = await promptGoogleLogin();
      const isEmailAdmin = adminEmails.includes(userInfo.email.toLowerCase().trim());
      await onSelectAccount({
        email: userInfo.email,
        name: userInfo.name,
        avatar: userInfo.avatar,
        idToken: userInfo.idToken,
        role: isEmailAdmin ? "superadmin" : "customer"
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Google native sign-in popup cancelled or closed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        className="bg-[#1f1f20] text-[#e3e3e3] rounded-[28px] w-full max-w-sm overflow-hidden shadow-2xl border border-[#444746]/70 flex flex-col font-sans"
      >
        {/* Google Header */}
        <div className="pt-6 px-6 pb-4 flex items-center justify-between border-b border-[#343638]">
          <div className="flex items-center gap-2.5">
            <GoogleLogo className="w-6 h-6" />
            <span className="text-xs font-semibold tracking-wide text-[#c4c7c5]">Google</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#9aa0a6] hover:text-white hover:bg-[#2e3032] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chooser Content */}
        <div className="p-6 space-y-4">
          <div className="text-left space-y-1">
            <h3 className="text-xl font-normal text-white tracking-tight">Choose an account</h3>
            <p className="text-xs text-[#9aa0a6]">
              to continue to <span className="text-[#8ab4f8] font-medium">Cafe SaaS Platform</span>
            </p>
          </div>

          {error && (
            <div className="bg-[#5c1d1d]/60 border border-[#f28b82]/40 rounded-xl p-3 text-xs text-[#f6aea9]">
              {error}
            </div>
          )}

          {!showAddAccount && !showConfigureClientId && (
            <div className="space-y-1 divide-y divide-[#2d2f31]">
              {/* Account 1: Mayank Kaushik */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSelectPredefined("mayankkaushik361865@gmail.com", "Mayank Kaushik", "superadmin")}
                className="w-full text-left p-3 rounded-2xl hover:bg-[#2d2e30] active:bg-[#37393b] flex items-center gap-3.5 transition-all group cursor-pointer disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4285F4] to-[#34A853] p-0.5 flex-shrink-0 shadow-sm">
                  <div className="w-full h-full rounded-full bg-[#1e1f20] flex items-center justify-center font-bold text-sm text-white">
                    M
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white truncate group-hover:text-[#8ab4f8] transition-colors">
                      Mayank Kaushik
                    </span>
                    <span className="text-[10px] bg-[#1a3826] text-[#81c995] px-2 py-0.5 rounded-full font-medium border border-[#81c995]/30 flex-shrink-0">
                      Super Admin
                    </span>
                  </div>
                  <p className="text-xs text-[#9aa0a6] truncate mt-0.5">mayankkaushik361865@gmail.com</p>
                </div>
              </button>

              {/* Account 2: Guest Customer */}
              {targetRole !== "superadmin" && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSelectPredefined("customer@cafeguest.com", "Guest Customer", "customer")}
                  className="w-full text-left p-3 rounded-2xl hover:bg-[#2d2e30] active:bg-[#37393b] flex items-center gap-3.5 transition-all group cursor-pointer disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-full bg-[#34A853]/20 border border-[#34A853]/50 flex items-center justify-center font-bold text-sm text-[#81c995] flex-shrink-0">
                    C
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white truncate group-hover:text-[#8ab4f8] transition-colors">
                        Guest Customer
                      </span>
                      <span className="text-[10px] bg-[#1a2f4c] text-[#8ab4f8] px-2 py-0.5 rounded-full font-medium border border-[#8ab4f8]/30 flex-shrink-0">
                        Customer
                      </span>
                    </div>
                    <p className="text-xs text-[#9aa0a6] truncate mt-0.5">customer@cafeguest.com</p>
                  </div>
                </button>
              )}

              {/* Use Another Account Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowAddAccount(true)}
                className="w-full text-left p-3 rounded-2xl hover:bg-[#2d2e30] active:bg-[#37393b] flex items-center gap-3.5 transition-all group cursor-pointer disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-[#2a2b2d] border border-[#444746] flex items-center justify-center text-[#c4c7c5] flex-shrink-0 group-hover:border-[#8ab4f8] group-hover:text-[#8ab4f8] transition-colors">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm text-[#e3e3e3] group-hover:text-white transition-colors">
                    Use another account
                  </span>
                  <p className="text-xs text-[#9aa0a6] truncate mt-0.5">Sign in with a different Gmail address</p>
                </div>
              </button>
            </div>
          )}

          {/* Form to enter another account */}
          {showAddAccount && (
            <form onSubmit={handleCustomAccountSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-[#c4c7c5] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mayank Kaushik"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#131314] border border-[#5f6368] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#747775] focus:outline-none focus:border-[#8ab4f8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#c4c7c5] mb-1">Google Email (Gmail)</label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-[#131314] border border-[#5f6368] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#747775] focus:outline-none focus:border-[#8ab4f8]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAccount(false)}
                  className="flex-1 py-2 rounded-full border border-[#5f6368] text-xs font-medium text-[#c4c7c5] hover:bg-[#2d2e30]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-full bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#001d35] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Form to configure Google Cloud OAuth Client ID */}
          {showConfigureClientId && (
            <form onSubmit={handleSaveClientIdAndTriggerNative} className="space-y-3 pt-1">
              <div className="bg-[#182a46]/50 border border-[#8ab4f8]/30 rounded-xl p-3 text-xs text-[#c4e7ff] space-y-1">
                <p className="font-semibold text-[#8ab4f8] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  Connect Google Cloud Client ID
                </p>
                <p className="text-[11px] text-[#9aa0a6] leading-relaxed">
                  Apne Google Cloud Console ka Web OAuth Client ID yahan paste karein. Isse browser/phone ke real saved Google accounts ka official popup direct open hoga.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#c4c7c5] mb-1">
                  Google Client ID (.apps.googleusercontent.com)
                </label>
                <input
                  type="text"
                  required
                  placeholder="your-client-id.apps.googleusercontent.com"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  className="w-full bg-[#131314] border border-[#5f6368] rounded-xl px-3 py-2 text-xs text-white placeholder-[#747775] focus:outline-none focus:border-[#8ab4f8]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfigureClientId(false)}
                  className="flex-1 py-2 rounded-full border border-[#5f6368] text-xs font-medium text-[#c4c7c5] hover:bg-[#2d2e30]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-full bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#001d35] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Save & Open Real Popup</span>
                </button>
              </div>
            </form>
          )}

          {/* Toggle for Native Client ID config */}
          {!showAddAccount && !showConfigureClientId && (
            <div className="pt-2 border-t border-[#343638] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowConfigureClientId(true)}
                className="text-[11px] text-[#8ab4f8] hover:underline flex items-center gap-1.5"
              >
                <Key className="w-3 h-3" />
                <span>Connect Phone's Native Google OAuth</span>
              </button>
            </div>
          )}
        </div>

        {/* Google Terms Footer */}
        <div className="bg-[#171718] px-6 py-3.5 border-t border-[#343638] text-[10px] text-[#80868b] leading-relaxed">
          To continue, Google will share your name, email address, and profile picture with Cafe QR Platform.
        </div>
      </motion.div>
    </div>
  );
};
