import React, { useState } from "react";
import { useCafe } from "../../context/CafeContext";
import { QRCodeSVG } from "qrcode.react";
import { X, QrCode, Printer, ExternalLink, Smartphone, Copy, Check, Download, Share2 } from "lucide-react";

interface TableQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TableQRModal: React.FC<TableQRModalProps> = ({ isOpen, onClose }) => {
  const { config, activeCafeId } = useCafe();
  const [selectedTable, setSelectedTable] = useState(config.tables[0] || "Table 1");
  const [customHost, setCustomHost] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "http://localhost:3000";
  });
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getTableUrl = (tbl: string) => `${customHost}/?cafe=${encodeURIComponent(activeCafeId)}&table=${encodeURIComponent(tbl)}`;
  const currentUrl = getTableUrl(selectedTable);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download QR code as PNG image so user can send it to anyone on WhatsApp
  const handleDownloadPNG = () => {
    const svgElement = document.getElementById("active-table-qr-svg");
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 460;
      if (ctx) {
        // White background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header text
        ctx.fillStyle = "#1c1512";
        ctx.font = "bold 20px serif";
        ctx.textAlign = "center";
        ctx.fillText(config.name, 200, 38);

        ctx.font = "bold 15px sans-serif";
        ctx.fillStyle = "#b85a3c";
        ctx.fillText(`${selectedTable} • Scan to Order`, 200, 65);

        // Draw QR
        ctx.drawImage(img, 60, 85, 280, 280);

        // Footer note
        ctx.font = "12px sans-serif";
        ctx.fillStyle = "#666666";
        ctx.fillText("Point Camera to View Menu & Order", 200, 395);
        ctx.fillText("Pay on Counter after meal", 200, 420);

        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `${config.name.toLowerCase().replace(/\s+/g, "-")}-${selectedTable.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
        a.click();
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
  };

  const handleShareWhatsApp = () => {
    const text = `*${config.name}*%0AHere is the digital menu & ordering link for *${selectedTable}*:%0A${encodeURIComponent(currentUrl)}%0A%0AScan or click to view the full menu and order!`;
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
              <QrCode className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base sm:text-lg">
                Table QR Codes (Scan & Share)
              </h3>
              <p className="text-xs text-stone-500">
                Scan with phone camera or download image to send on WhatsApp!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Table Selector Pills */}
          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
              Choose Table:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {config.tables.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTable(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedTable === t
                      ? "bg-amber-600 text-white shadow-xs scale-105"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* QR Display Box */}
          <div className="bg-stone-50 rounded-3xl p-5 sm:p-6 border border-stone-200 flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left">
            
            {/* The High-Res QR Code */}
            <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-amber-300 shadow-md inline-block flex-shrink-0">
              <QRCodeSVG
                id="active-table-qr-svg"
                value={currentUrl}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Information & Action */}
            <div className="space-y-3 max-w-sm">
              <div className="inline-block bg-espresso-900 text-amber-300 font-extrabold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                {selectedTable}
              </div>

              <div>
                <h4 className="font-serif font-bold text-stone-900 text-lg">
                  {config.name}
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Scan karte hi phone browser mein <strong>Pura Menu</strong> khul jayega! Koi app install nahi karni padegi.
                </p>
              </div>

              {/* Download PNG & WhatsApp Share Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleDownloadPNG}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download QR Photo (PNG)</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 flex items-center gap-1.5 shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Wi-Fi & Live Host Guide */}
          <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/80 space-y-2 text-xs text-amber-950">
            <h5 className="font-bold flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-700" />
              <span>Dusre Phone Se Scan Kaise Karein? (Local Wi-Fi vs Live Website)</span>
            </h5>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              1. <strong>Abhi turant phone se test karne ke liye:</strong> Niche "Use Wi-Fi IP" dabayein aur apne mobile camera se screen par QR scan karein (Phone aur Laptop ek hi Wi-Fi par hone chahiye).<br/>
              2. <strong>Kisi door baithe cafe owner ko bhejne ke liye:</strong> Is app ko <strong>Vercel</strong> par free mein live host karein (jaise <code>https://apna-cafe.vercel.app</code>). Fir aapka QR code duniya mein koi bhi scan karega toh pura menu khulega!
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={customHost}
                onChange={(e) => setCustomHost(e.target.value)}
                placeholder="https://your-cafe.app or http://localhost:3000"
                className="flex-1 text-xs px-3 py-2 border rounded-xl bg-white font-mono focus:outline-none focus:border-amber-500"
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setCustomHost(window.location.origin)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-[11px] font-semibold text-stone-700"
                >
                  Use Current Domain ({window.location.host})
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-espresso-900 hover:bg-stone-900 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print All Table Tent Cards (A4)</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
