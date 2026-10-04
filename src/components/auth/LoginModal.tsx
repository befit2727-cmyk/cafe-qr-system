import React, { useState, useEffect } from "react";
import { useCafe } from "../../context/CafeContext";
import { 
  Lock, 
  Mail, 
  KeyRound, 
  X, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Crown, 
  Store,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldAlert,
  RotateCcw,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { promptGoogleLogin, isGoogleAuthAvailable } from "../../services/googleAuth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Google 4-Color SVG Icon
export const GoogleLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>
);

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { 
    login, 
    loginWithGoogle, 
    currentUser, 
    logout, 
    config, 
    activeCafeId, 
    setRole,
    securityStatus,
    refreshSecurity,
    resetSecurityLimits 
  } = useCafe();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync security status on open
  useEffect(() => {
    if (isOpen) {
      refreshSecurity();
      setError(null);
    }
  }, [isOpen, refreshSecurity]);

  // Periodic tick for lockout countdown
  useEffect(() => {
    if (!isOpen || securityStatus.lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      refreshSecurity();
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, securityStatus.lockoutRemaining, refreshSecurity]);

  if (!isOpen) return null;

  const isDailyLimitReached = !securityStatus.allowed;
  const isLockedOut = securityStatus.lockoutRemaining > 0;
  const isActionDisabled = isDailyLimitReached || isLockedOut || loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isActionDisabled) return;

    setError(null);
    setLoading(true);

    try {
      const ok = await login(email, password);
      if (ok) {
        onClose();
      } else {
        refreshSecurity();
        const updatedSec = securityStatus;
        if (!updatedSec.allowed) {
          setError(`Daily Limit Reached: Maximum 5 logins per day used. Google Security Shield active.`);
        } else if (updatedSec.lockoutRemaining > 0) {
          setError(`Too many failed attempts. Temporary lockout active (${updatedSec.lockoutRemaining}s remaining).`);
        } else {
          const left = updatedSec.maxFailedAttempts - updatedSec.failedAttempts;
          setError(`Invalid email or password. ${left} attempt${left === 1 ? "" : "s"} remaining before lockout.`);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Login failed. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isActionDisabled) return;
    setError(null);
    setLoading(true);

    try {
      const adminEmails = ["mayankkaushik361865@gmail.com", "admin@cafesaas.com", "superadmin@cafesaas.com"];
      let googleData: {
        idToken?: string;
        email?: string;
        name?: string;
        role?: "superadmin" | "owner" | "staff" | "customer";
        avatar?: string;
      } = {
        role: "customer",
        email: "customer@cafeguest.com",
        name: "Guest Customer"
      };

      if (isGoogleAuthAvailable()) {
        try {
          const userInfo = await promptGoogleLogin();
          const isUserAdmin = adminEmails.includes(userInfo.email.toLowerCase().trim());
          googleData = {
            idToken: userInfo.idToken,
            email: userInfo.email,
            name: userInfo.name,
            role: isUserAdmin ? "superadmin" : "customer",
            avatar: userInfo.avatar
          };
        } catch (e: any) {
          console.warn("Google popup dismissed, continuing as customer:", e.message);
        }
      }

      const ok = await loginWithGoogle(googleData);
      if (ok) {
        onClose();
      } else {
        refreshSecurity();
        setError("Google authentication was unsuccessful.");
      }
    } catch (err: any) {
      setError(err?.message || "Google authentication was cancelled.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        className="bg-[#1e1f20] text-[#e3e3e3] rounded-[28px] w-full max-w-md overflow-hidden shadow-2xl border border-[#444746]/60 flex flex-col max-h-[94vh]"
      >
        {/* Google Top Bar */}
        <div className="pt-6 px-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GoogleLogo className="w-6 h-6" />
            <span className="text-xs font-medium text-[#c4c7c5] tracking-wide">Google Account</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#c4c7c5] hover:text-white hover:bg-[#2d2e30] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="px-6 pb-6 overflow-y-auto flex-1 space-y-4">
          {currentUser ? (
            /* Logged In Google Profile View */
            <div className="bg-[#2a2b2d] p-6 rounded-2xl border border-[#444746]/70 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#4285F4] via-[#34A853] to-[#FBBC05] p-0.5 mx-auto shadow-md">
                <div className="w-full h-full rounded-full bg-[#1e1f20] flex items-center justify-center text-xl font-bold text-white">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0).toUpperCase()
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-lg text-white">{currentUser.name}</h4>
                <p className="text-xs text-[#9aa0a6] mt-0.5">{currentUser.email}</p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 bg-[#172b4d] text-[#8ab4f8] text-[11px] px-3 py-1 rounded-full font-medium border border-[#8ab4f8]/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {currentUser.role === "superadmin" ? "Master Platform Vendor (Super Admin)" : `Cafe Owner • ${currentUser.cafeName || currentUser.cafeId}`}
                  </span>
                </div>
              </div>

              {/* Security Shield Usage Summary */}
              <div className="bg-[#1e1f20] p-3 rounded-xl border border-[#444746]/50 text-left space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#c4c7c5] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8ab4f8]" />
                    Daily Login Limit
                  </span>
                  <span className="font-semibold text-[#8ab4f8]">{securityStatus.dailyCount} / {securityStatus.dailyLimit} used today</span>
                </div>
                <div className="flex items-center gap-1 pt-0.5">
                  {[1, 2, 3, 4, 5].map((slot) => (
                    <div 
                      key={slot} 
                      className={`h-1.5 flex-1 rounded-full transition-all ${slot <= securityStatus.dailyCount ? "bg-[#8ab4f8]" : "bg-[#444746]"}`} 
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="px-5 py-2.5 bg-transparent hover:bg-[#37393b] text-[#f28b82] rounded-full text-xs font-medium border border-[#f28b82]/40 transition-all"
                >
                  Sign Out
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#001d35] rounded-full text-xs font-semibold transition-all shadow-sm"
                >
                  Continue to App
                </button>
              </div>
            </div>
          ) : (
            /* Google Sign-In Form & Quota Protection */
            <>
              {/* Header Title in Google Clean Sans */}
              <div className="text-center space-y-1 pt-1">
                <h2 className="text-2xl font-normal text-white tracking-tight">Sign in</h2>
                <p className="text-xs text-[#9aa0a6]">
                  to continue to <strong className="text-[#e3e3e3]">{config.name} Portal</strong>
                </p>
              </div>

              {/* Lockout from Failed Attempts */}
              {isLockedOut && (
                <div className="bg-[#5c0000]/40 border border-[#f28b82]/50 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-[#f6aea9] animate-pulse">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#f28b82]" />
                  <span>
                    Account locked due to 5 failed attempts. Please wait <strong>{securityStatus.lockoutRemaining}s</strong> before trying again.
                  </span>
                </div>
              )}

              {/* General Error Notification */}
              {!isDailyLimitReached && !isLockedOut && error && (
                <div className="bg-[#3e2723]/60 border border-[#ff8a65]/40 rounded-2xl p-3 flex items-center gap-2 text-xs text-[#ffccbc] animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#ff8a65]" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google 1-Tap Sign-In Button (Official White Style) */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isActionDisabled}
                className="w-full bg-white hover:bg-[#f8f9fa] active:bg-[#e8eaed] text-[#3c4043] font-medium py-3 px-4 rounded-full flex items-center justify-center gap-3 text-xs sm:text-sm shadow-sm transition-all border border-[#dadce0] active:scale-[0.99] disabled:opacity-40"
              >
                <GoogleLogo className="w-4 h-4" />
                <span className="font-semibold text-[#1f1f1f]">Continue with Google</span>
              </button>

              {/* Google Divider */}
              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-[#444746] w-full" />
                <span className="bg-[#1e1f20] px-3 text-[11px] text-[#9aa0a6] uppercase tracking-wider font-medium absolute">
                  or sign in with email
                </span>
              </div>

              {/* Google Material Outlined Text Inputs */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#c4c7c5] mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      disabled={isActionDisabled}
                      placeholder={`owner@${activeCafeId}.com`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#131314] border border-[#5f6368] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#747775] focus:outline-none focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] transition-all disabled:opacity-40"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-[#c4c7c5]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setError("Please contact your system administrator or platform support to reset your credentials.")}
                      className="text-[11px] text-[#8ab4f8] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={isActionDisabled}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#131314] border border-[#5f6368] rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-[#747775] focus:outline-none focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] transition-all disabled:opacity-40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#9aa0a6] hover:text-white p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isActionDisabled}
                    className="w-full py-3 bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#001d35] font-semibold rounded-full text-xs sm:text-sm shadow transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {loading ? "Verifying..." : "Sign in"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>



              {/* Google Clean Footer */}
              <div className="pt-3 border-t border-[#444746]/40 flex flex-wrap items-center justify-between text-[11px] text-[#747775]">
                <span>English (United States)</span>
                <div className="flex items-center gap-3">
                  <span className="hover:text-[#c4c7c5] cursor-pointer">Help</span>
                  <span className="hover:text-[#c4c7c5] cursor-pointer">Privacy</span>
                  <span className="hover:text-[#c4c7c5] cursor-pointer">Terms</span>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
