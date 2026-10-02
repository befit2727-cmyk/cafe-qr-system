import React, { useState } from "react";
import { useCafe } from "../../context/CafeContext";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Printer, Plus, Trash2, ExternalLink, Wifi, Store } from "lucide-react";

export const QRStudio: React.FC = () => {
  const { config, updateConfig, activeCafeId } = useCafe();
  const [selectedTable, setSelectedTable] = useState<string>(config.tables[0] || "Table 1");
  const [newTableName, setNewTableName] = useState("");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://mycafe.com";
  const getTableUrl = (table: string) => `${baseUrl}/?cafe=${encodeURIComponent(activeCafeId)}&table=${encodeURIComponent(table)}`;

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    const name = newTableName.trim();
    if (!config.tables.includes(name)) {
      updateConfig({
        ...config,
        tables: [...config.tables, name]
      });
      setSelectedTable(name);
      setNewTableName("");
    }
  };

  const handleRemoveTable = (tableName: string) => {
    if (config.tables.length <= 1) {
      alert("At least one table is required.");
      return;
    }
    const updated = config.tables.filter((t) => t !== tableName);
    updateConfig({
      ...config,
      tables: updated
    });
    if (selectedTable === tableName) {
      setSelectedTable(updated[0]);
    }
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-600" />
            Table QR Code Studio & Stand Generator
          </h3>
          <p className="text-xs text-stone-500">
            Generate printable QR tent cards for dining tables. Customers scan with camera to order, and pay at the counter.
          </p>
        </div>

        <button
          onClick={handlePrintAll}
          className="bg-espresso-900 hover:bg-stone-900 text-amber-300 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Print All Table Tent Cards (A4)</span>
        </button>
      </div>

      {/* Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Table Selector & Add Table */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-stone-900 text-sm">Active Tables ({config.tables.length})</h4>
          </div>

          <form onSubmit={handleAddTable} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Baithak 3, Patio 2"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              className="flex-1 text-xs px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
            {config.tables.map((tbl) => (
              <div
                key={tbl}
                onClick={() => setSelectedTable(tbl)}
                className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                  selectedTable === tbl
                    ? "bg-amber-100 border border-amber-300 font-bold text-amber-900 shadow-2xs"
                    : "bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <QrCode className="w-3.5 h-3.5 text-amber-600" />
                  <span>{tbl}</span>
                </div>

                <div className="flex items-center gap-1">
                  {config.tables.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTable(tbl);
                      }}
                      className="p-1 text-stone-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Table Stand Live Preview Card */}
        <div className="lg:col-span-2 bg-stone-100/70 p-6 rounded-3xl border border-stone-200 flex flex-col items-center justify-center">
          
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Live Preview for {selectedTable}
            </span>
          </div>

          {/* Physical Tent Card Mockup */}
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2.5 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900" />

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-2xl shadow-sm mb-1.5">
                {config.logoUrl || "☕"}
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-lg">{config.name}</h3>
              <p className="text-[11px] text-stone-500">{config.tagline}</p>
            </div>

            {/* High Res QR Box */}
            <div className="bg-stone-50 p-4 rounded-2xl border-2 border-dashed border-amber-300 inline-block shadow-inner">
              <QRCodeSVG
                value={getTableUrl(selectedTable)}
                size={180}
                level="H"
                includeMargin={true}
                className="mx-auto"
              />
            </div>

            <div>
              <div className="inline-block bg-espresso-900 text-amber-300 font-extrabold text-sm px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                {selectedTable}
              </div>
              <h4 className="font-bold text-stone-900 text-xs mt-2 uppercase tracking-wide">
                Scan With Phone Camera to Order
              </h4>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-amber-800 font-semibold mt-1">
                <Store className="w-3.5 h-3.5 text-amber-700" />
                <span>Order from Table • Pay at Counter</span>
              </div>
            </div>

            {/* Wi-Fi details */}
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center justify-center gap-2">
              <Wifi className="w-3.5 h-3.5 text-amber-700" />
              <span>Free Wi-Fi: <strong>{config.wifiName}</strong>{config.wifiPassword ? <> / Pass: <strong>{config.wifiPassword}</strong></> : " (Ask at Counter)"}</span>
            </div>

            {config.fssaiNumber && (
              <p className="text-[9px] text-stone-400 font-mono">
                FSSAI Lic: {config.fssaiNumber}
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-5">
            <a
              href={getTableUrl(selectedTable)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
              <span>Test Table Customer View</span>
            </a>

            <button
              onClick={handlePrintAll}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print All Tables (A4)</span>
            </button>
          </div>

        </div>

      </div>

      {/* Hidden Print Layout */}
      <div id="print-tent-cards" className="hidden print:grid print:grid-cols-2 print:gap-6 print:p-4 print:block">
        {config.tables.map((table) => (
          <div
            key={table}
            className="break-inside-avoid border-2 border-stone-800 rounded-3xl p-6 text-center space-y-4 bg-white mb-6"
          >
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-1">{config.logoUrl || "☕"}</div>
              <h2 className="font-serif font-black text-xl text-stone-900">{config.name}</h2>
              <p className="text-xs text-stone-600">{config.tagline}</p>
            </div>

            <div className="p-3 border-2 border-stone-800 inline-block rounded-2xl">
              <QRCodeSVG
                value={getTableUrl(table)}
                size={160}
                level="H"
                includeMargin={true}
              />
            </div>

            <div>
              <div className="inline-block bg-stone-900 text-white font-black text-base px-5 py-1.5 rounded-full uppercase tracking-wider">
                {table}
              </div>
              <p className="text-xs font-bold text-stone-900 uppercase tracking-wide mt-2">
                Point Phone Camera at QR Code to Order
              </p>
              <p className="text-[10px] text-stone-800 font-bold">
                Instant Table Service • Pay at Counter After Meal
              </p>
            </div>

            <div className="border-t border-stone-300 pt-2 text-[10px] text-stone-700">
              Free Wi-Fi: <strong>{config.wifiName}</strong>{config.wifiPassword ? <> • Password: <strong>{config.wifiPassword}</strong></> : " • Ask at Counter"}
              {config.fssaiNumber && <span className="block mt-0.5">FSSAI: {config.fssaiNumber}</span>}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
