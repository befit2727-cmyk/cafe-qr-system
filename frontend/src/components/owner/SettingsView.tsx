import React, { useState, useRef } from "react";
import { useCafe } from "../../context/CafeContext";
import { CafeConfig } from "../../types";
import { 
  Settings, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  Lock, 
  Wifi, 
  Check, 
  Globe, 
  ShieldCheck,
  Store
} from "lucide-react";

export const SettingsView: React.FC = () => {
  const { config, updateConfig, exportDatabase, importDatabase, resetToDefaults } = useCafe();

  const [formData, setFormData] = useState<CafeConfig>(config);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currencyOptions = [
    { symbol: "?", label: "? (Indian Rupee - INR)" },
    { symbol: "$", label: "$ (USD / CAD / AUD)" },
    { symbol: "€", label: "€ (EUR Euro)" },
    { symbol: "£", label: "£ (GBP Pound)" },
    { symbol: "AED", label: "AED (UAE Dirham)" },
    { symbol: "SAR", label: "SAR (Saudi Riyal)" },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExport = () => {
    const jsonStr = exportDatabase();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formData.name.toLowerCase().replace(/\s+/g, "-")}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabase(content);
      if (success) {
        alert("Cafe database imported successfully!");
        window.location.reload();
      } else {
        alert("Failed to import database. Please verify the JSON format.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm("Reset all dishes, orders, and settings back to default Indian cafe template?")) {
      resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
          <div>
            <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-600" />
              Cafe Branding & Billing Settings
            </h3>
            <p className="text-xs text-stone-500">
              Configure cafe details, FSSAI license, GSTIN, tax rates, and security PINs
            </p>
          </div>

          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>

        {/* Cafe Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Cafe Business Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500 font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Tagline / Subheading
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Counter Billing Model Callout */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950">
              Payment Model: Pay on Counter
            </h4>
            <p className="text-[11px] text-amber-800">
              Customers scan QR to order dishes directly to their table. When finished, they pay the cashier directly at the billing counter (Cash, Card, or UPI).
            </p>
          </div>
        </div>

        {/* Indian Tax & Regulatory (GST & FSSAI) */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
          <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            FSSAI & GST Compliance (Printed on WhatsApp & Table Invoices)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                FSSAI License No.
              </label>
              <input
                type="text"
                placeholder="e.g. 11523019000842"
                value={formData.fssaiNumber}
                onChange={(e) => setFormData({ ...formData, fssaiNumber: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-xl bg-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                placeholder="e.g. 27AABCT1332L1ZV"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-xl bg-white font-mono uppercase focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                  CGST (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.cgstPercent}
                  onChange={(e) => setFormData({ ...formData, cgstPercent: Number(e.target.value) })}
                  className="w-full text-xs px-2.5 py-2 border rounded-xl bg-white focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                  SGST (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.sgstPercent}
                  onChange={(e) => setFormData({ ...formData, sgstPercent: Number(e.target.value) })}
                  className="w-full text-xs px-2.5 py-2 border rounded-xl bg-white focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Branding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Currency Symbol *
            </label>
            <select
              value={formData.currencySymbol}
              onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500 font-bold"
            >
              {currencyOptions.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Logo Icon / Emoji
            </label>
            <input
              type="text"
              maxLength={4}
              value={formData.logoUrl || "☕"}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500 text-center font-bold"
            />
          </div>
        </div>

        {/* Wi-Fi Setup */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-3">
          <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-amber-700" />
            Customer Wi-Fi Credentials (Shown on digital menu & QR table stands)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                Wi-Fi Network Name (SSID)
              </label>
              <input
                type="text"
                value={formData.wifiName}
                onChange={(e) => setFormData({ ...formData, wifiName: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-xl bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                Wi-Fi Password
              </label>
              <input
                type="text"
                value={formData.wifiPassword}
                onChange={(e) => setFormData({ ...formData, wifiPassword: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-xl bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Security Access PINs */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
          <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-700" />
            Portal Security & Access PINs
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                Owner Portal PIN (Default: 1234)
              </label>
              <input
                type="text"
                maxLength={6}
                value={formData.ownerPin}
                onChange={(e) => setFormData({ ...formData, ownerPin: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-xl bg-white font-mono tracking-widest font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                Kitchen / Staff Portal PIN (Default: 0000)
              </label>
              <input
                type="text"
                maxLength={6}
                value={formData.staffPin}
                onChange={(e) => setFormData({ ...formData, staffPin: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-xl bg-white font-mono tracking-widest font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

      </form>

      {/* Backup & Selling Tools */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
        <div>
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-600" />
            White-Label & Cafe Onboarding Tools
          </h3>
          <p className="text-xs text-stone-500">
            Export or import whole cafe catalogs to onboard new Indian cafes in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleExport}
            className="p-4 rounded-xl border border-stone-200 hover:border-amber-400 bg-stone-50 hover:bg-amber-50/50 flex flex-col items-center justify-center text-center gap-2 transition-all group"
          >
            <Download className="w-5 h-5 text-amber-700 group-hover:scale-110 transition-transform" />
            <div>
              <h5 className="font-bold text-xs text-stone-900">Export Cafe Backup</h5>
              <p className="text-[10px] text-stone-500">Save full menu & settings as JSON</p>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-xl border border-stone-200 hover:border-blue-400 bg-stone-50 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center gap-2 transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <Upload className="w-5 h-5 text-blue-700 group-hover:scale-110 transition-transform" />
            <div>
              <h5 className="font-bold text-xs text-stone-900">Import Cafe JSON</h5>
              <p className="text-[10px] text-stone-500">Restore or load another cafe profile</p>
            </div>
          </button>

          <button
            onClick={handleReset}
            className="p-4 rounded-xl border border-stone-200 hover:border-red-400 bg-stone-50 hover:bg-red-50/50 flex flex-col items-center justify-center text-center gap-2 transition-all group"
          >
            <RotateCcw className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
            <div>
              <h5 className="font-bold text-xs text-stone-900">Reset to Indian Cafe</h5>
              <p className="text-[10px] text-stone-500">Restore default Chai & Snacks menu</p>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
};
