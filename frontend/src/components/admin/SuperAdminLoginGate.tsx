import React, { useState, useEffect } from "react";
import { useCafe } from "../../context/CafeContext";
import { 
  Lock, 
  KeyRound, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  ShieldAlert,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  Shield
} from "lucide-react";
import { motion } from "motion/react";
import { GoogleLogo } from "../auth/LoginModal";
import { promptGoogleLogin, isGoogleAuthAvailable } from "../../services/googleAuth";

interface SuperAdminLoginGateProps {
  onSuccess?: () => void;
}

export const SuperAdminLoginGate: React.FC<SuperAdminLoginGateProps> = ({ onSuccess }) => {
  const { 
    login, 
    loginWithGoogle, 
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

  // Sync security status on mount
  useEffect(() => {
    refreshSecurity();
  }, [refreshSecurity]);

  // Lockout tick
  useEffect(() => {
    if (securityStatus.lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      refreshSecurity();
    }, 1000);
    return () => clearInterval(timer);
  }, [securityStatus.lockoutRemaining, refreshSecurity]);

  const isDailyLimitReached = !securityStatus.allowed;
  const isLockedOut = securityStatus.lockoutRemaining > 0;
  const isActionDisabled = isDailyLimitReached || isLockedOut || loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isActionDisabled) return;

    setError(null);
    setLoading(true);

    try {
      const ok = await login(email.trim(), password.trim());
      if (ok) {
        if (onSuccess) onSuccess();
      } else {
        refreshSecurity();
        const sec = securityStatus;
        if (!sec.allowed) {
          setError("Daily login limit reached (5 logins/day maximum). Google Security Shield active.");
        } else if (sec.lockoutRemaining > 0) {
          setError(`Too many failed attempts. Temporary lockout active (${sec.lockoutRemaining}s remaining).`);
        } else {
          const left = sec.maxFailedAttempts - sec.failedAttempts;
          setError(`Access Denied: Invalid email or password. ${left} attempt${left === 1 ? "" : "s"} remaining before lockout.`);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Connection to master authentication server failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAdminLogin = async () => {
    if (isActionDisabled) return;
    setError(null);
    setLoading(true);
    try {
      let email = "admin@cafesaas.com";
      let name = "Platform Super Admin (Google Verified)";
      let avatar: string | undefined;

      if (isGoogleAuthAvailable()) {
        const userInfo = await promptGoogleLogin();
        email = userInfo.email;
        name = `${userInfo.name} (Super Admin)`;
        avatar = userInfo.avatar;
      }

      const ok = await loginWithGoogle({ 
        role: "superadmin", 
        email, 
        name,
        avatar
      });
      if (ok && onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || "Google Administrator verification failed.");
    } finally {
      setLoading(false);
    }
  };




  const handleReturnToCafe = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("admin");
    url.searchParams.delete("role");
    window.history.replaceState({}, "", url.toString());
    setRole("customer");
  };

  return (
    <div className="min-h-screen bg-[#131314] text-[#e3e3e3] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Subtle Ambient Google Blue Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8ab4f8]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-[#1e1f20] border border-[#444746]/60 rounded-[28px] p-6 sm:p-8 shadow-2xl relative z-10 space-y-5"
      >
        {/* Google Workspace Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <GoogleLogo className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-[#172b4d] text-[#8ab4f8] border border-[#8ab4f8]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Google Workspace Admin Console</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-normal text-white mt-2 tracking-tight">
              Sign in
            </h1>
            <p className="text-xs text-[#9aa0a6] mt-0.5">
              to access SaaS Platform Master Vendor Portal
            </p>
          </div>
        </div>

        {/* Google Security Shield - Daily Quota Indicator */}
        <div className="bg-[#172b4d]/60 border border-[#8ab4f8]/30 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#8ab4f8] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Security Shield Quota
            </span>
            <span className="font-semibold text-white px-2 py-0.5 bg-[#8ab4f8]/20 rounded-full border border-[#8ab4f8]/30 text-[11px]">
              {securityStatus.remainingToday} of 5 logins left today
            </span>
          </div>

          {/* 5-Slot Quota Visualizer */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {[1, 2, 3, 4, 5].map((slot) => {
              const isUsed = slot <= securityStatus.dailyCount;
              return (
                <div
                  key={slot}
                  title={`Login slot ${slot} of 5 ${isUsed ? "(used today)" : "(available)"}`}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    isUsed ? "bg-[#8ab4f8]" : "bg-[#444746]/70 border border-[#5f6368]"
                  }`}
                />
              );
            })}
          </div>
          <p className="text-[10px] text-[#9aa0a6] text-right">
            Daily limit: 5 sign-ins per 24 hours
          </p>
        </div>

        {/* Daily Limit Reached Alert */}
        {isDailyLimitReached && (
          <div className="bg-[#5c0000]/40 border border-[#f28b82]/50 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-[#f6aea9] animate-in fade-in">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-[#f28b82] mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">Daily Login Limit Reached (5/5)</p>
              <p className="text-[11px] text-[#f6aea9]/90 leading-relaxed">
                Google Security Shield has locked further sign-ins on this device for today.
                {securityStatus.timeUntilSlotAvailable && ` Resets in ${securityStatus.timeUntilSlotAvailable}.`}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    resetSecurityLimits();
                    refreshSecurity();
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8ab4f8] hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Limit (Demo Mode)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lockout from Failed Attempts */}
        {isLockedOut && (
          <div className="bg-[#5c0000]/40 border border-[#f28b82]/50 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-[#f6aea9] animate-pulse">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#f28b82]" />
            <span>
              Account locked due to failed attempts. Please wait <strong>{securityStatus.lockoutRemaining}s</strong> before trying again.
            </span>
          </div>
        )}

        {/* General Error Alert */}
        {!isDailyLimitReached && !isLockedOut && error && (
          <div className="bg-[#3e2723]/60 border border-[#ff8a65]/40 rounded-2xl p-3 text-xs text-[#ffccbc] flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#ff8a65]" />
            <span>{error}</span>
          </div>
        )}

        {/* Continue with Google Admin Button */}
        <button
          type="button"
          onClick={handleGoogleAdminLogin}
          disabled={isActionDisabled}
          className="w-full bg-white hover:bg-[#f8f9fa] active:bg-[#e8eaed] text-[#3c4043] font-medium py-3 px-4 rounded-full flex items-center justify-center gap-3 text-xs sm:text-sm shadow-sm transition-all border border-[#dadce0] active:scale-[0.99] disabled:opacity-40"
        >
          <GoogleLogo className="w-4 h-4" />
          <span className="font-semibold text-[#1f1f1f]">Continue with Google Admin</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center py-0.5">
          <div className="border-t border-[#444746] w-full" />
          <span className="bg-[#1e1f20] px-3 text-[11px] text-[#9aa0a6] uppercase tracking-wider font-medium absolute">
            or sign in with admin email
          </span>
        </div>


        {/* Master Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-medium text-[#c4c7c5] mb-1">
              Administrator email
            </label>
            <input 
              type="email"
              required
              disabled={isActionDisabled}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cafesaas.com"
              className="w-full bg-[#131314] border border-[#5f6368] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#747775] focus:outline-none focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] transition-all disabled:opacity-40"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#c4c7c5] mb-1">
              Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                required
                disabled={isActionDisabled}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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

          {/* Action Row */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isActionDisabled}
              className="w-full py-3 bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#001d35] rounded-full text-xs sm:text-sm font-semibold shadow transition-all disabled:opacity-40 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? "Authenticating..." : "Sign in to Console"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Return Link & Footer */}
        <div className="text-center pt-1 space-y-3">
          <button
            type="button"
            onClick={handleReturnToCafe}
            className="text-xs text-[#9aa0a6] hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Cafe Menu</span>
          </button>

          <div className="border-t border-[#444746]/40 pt-3 flex items-center justify-between text-[11px] text-[#747775]">
            <span>English (United States)</span>
            <div className="flex items-center gap-3">
              <span className="hover:text-[#c4c7c5] cursor-pointer">Help</span>
              <span className="hover:text-[#c4c7c5] cursor-pointer">Privacy</span>
              <span className="hover:text-[#c4c7c5] cursor-pointer">Terms</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
