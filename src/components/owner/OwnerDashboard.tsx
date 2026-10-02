import React, { useState } from "react";
import { useCafe } from "../../context/CafeContext";
import { AnalyticsView } from "./AnalyticsView";
import { MenuManager } from "./MenuManager";
import { QRStudio } from "./QRStudio";
import { SettingsView } from "./SettingsView";
import { 
  BarChart3, 
  Coffee, 
  QrCode, 
  Settings, 
  ShieldCheck, 
  ExternalLink 
} from "lucide-react";

export const OwnerDashboard: React.FC = () => {
  const { config, setRole } = useCafe();
  const [activeTab, setActiveTab] = useState<"analytics" | "menu" | "qr" | "settings">("analytics");

  return (
    <div className="min-h-screen bg-stone-100/60 pb-16">
      
      {/* Super Admin Suspension Banner */}
      {(config.status === "paused" || config.status === "suspended") && (
        <div className="bg-red-950 border-b border-red-800 text-red-200 px-4 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span className="font-bold">BRANCH ACCOUNT SUSPENDED: Your cafe service has been placed on hold by the Platform Super Admin. Contact your vendor to reactivate.</span>
          </div>
          <span className="bg-red-900/60 font-mono text-[10px] px-2 py-0.5 rounded text-red-200 uppercase font-bold">
            Delinquent / On Hold
          </span>
        </div>
      )}

      {/* Owner Top Subheader */}
      <div className="bg-espresso-900 text-white border-b border-stone-800 px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-600 rounded-xl shadow-xs">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white leading-tight">
                  Cafe Owner Control Center
                </h2>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Master Admin
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {config.name} • {config.tagline}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-stone-800 p-1 rounded-xl flex gap-1 border border-stone-700 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "analytics"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("menu")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "menu"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Menu Items</span>
            </button>

            <button
              onClick={() => setActiveTab("qr")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "qr"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Studio</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "settings"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {activeTab === "analytics" && <AnalyticsView />}
        {activeTab === "menu" && <MenuManager />}
        {activeTab === "qr" && <QRStudio />}
        {activeTab === "settings" && <SettingsView />}
      </div>

    </div>
  );
};
