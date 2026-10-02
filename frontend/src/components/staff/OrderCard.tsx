import React from "react";
import { Order } from "../../types";
import { useCafe } from "../../context/CafeContext";
import { Clock, ChefHat, Check, ArrowRight, X, AlertCircle, Printer, Store } from "lucide-react";

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const { updateOrderStatus, markOrderPaidAtCounter, config } = useCafe();

  const elapsedMinutes = Math.floor(
    (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)
  );

  const isUrgent = elapsedMinutes > 15;
  const isModerate = elapsedMinutes > 8;

  // Print Indian KOT (Kitchen Order Ticket) formatted slip
  const handlePrintKOT = () => {
    const kotWindow = window.open("", "_blank", "width=320,height=500");
    if (!kotWindow) return;

    const itemsRows = order.items
      .map(
        (i) => `
        <tr>
          <td style="font-weight:bold; font-size:14px; padding:4px 0;">${i.quantity}x</td>
          <td style="font-size:13px; padding:4px 0;">
            <strong>${i.name}</strong>
            ${i.selectedSize ? `<br/><small>Size: ${i.selectedSize}</small>` : ""}
            ${i.selectedSugar ? `<br/><small>Sugar: ${i.selectedSugar}</small>` : ""}
            ${i.selectedSpice ? `<br/><small>Spice: ${i.selectedSpice}</small>` : ""}
            ${i.isJain ? `<br/><strong style="color:red;">*** JAIN PREP ***</strong>` : ""}
            ${i.specialNotes ? `<br/><em>Note: "${i.specialNotes}"</em>` : ""}
          </td>
        </tr>`
      )
      .join("");

    kotWindow.document.write(`
      <html>
        <head>
          <title>KOT #${order.orderNumber} - ${order.tableNumber}</title>
          <style>
            body { font-family: monospace; padding: 10px; width: 280px; margin: 0 auto; color: #000; }
            h2, h3, p { text-align: center; margin: 2px 0; }
            hr { border-top: 1px dashed #000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; }
          </style>
        </head>
        <body>
          <h2>*** KITCHEN ORDER TICKET ***</h2>
          <h3>${config.name}</h3>
          <p><strong>${order.tableNumber}</strong> | KOT #${order.orderNumber}</p>
          <p>Time: ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          ${order.customerName ? `<p>Guest: ${order.customerName}</p>` : ""}
          <p>Payment: <strong>Pay on Counter</strong></p>
          <hr/>
          <table>
            <thead>
              <tr style="border-bottom:1px solid #000; text-align:left;">
                <th>QTY</th>
                <th>ITEM & INSTRUCTIONS</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          <hr/>
          ${order.notes ? `<p><strong>Order Note:</strong> "${order.notes}"</p><hr/>` : ""}
          <p style="text-align:center; font-size:11px;">Powered by CafeQR</p>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    kotWindow.document.close();
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all shadow-xs flex flex-col justify-between overflow-hidden ${
      order.status === "pending"
        ? "border-amber-400 ring-2 ring-amber-100"
        : order.status === "preparing"
        ? "border-blue-300"
        : "border-stone-200"
    }`}>
      
      {/* Card Header */}
      <div className={`p-3.5 flex items-center justify-between border-b ${
        order.status === "pending"
          ? "bg-amber-50/80 border-amber-200"
          : order.status === "preparing"
          ? "bg-blue-50/80 border-blue-200"
          : "bg-stone-50 border-stone-200"
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-stone-900 text-sm bg-white px-2 py-0.5 rounded-lg border border-stone-200 shadow-2xs">
            #{order.orderNumber}
          </span>
          <span className="font-bold text-amber-900 text-sm">
            {order.tableNumber}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {order.paymentStatus === "paid_at_counter" ? (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              ? Paid at Counter
            </span>
          ) : (
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Store className="w-3 h-3 text-amber-700" />
              Pay on Counter
            </span>
          )}

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            isUrgent
              ? "bg-red-100 text-red-700 animate-pulse"
              : isModerate
              ? "bg-amber-100 text-amber-700"
              : "bg-stone-100 text-stone-600"
          }`}>
            <Clock className="w-3 h-3" />
            <span>{elapsedMinutes}m</span>
          </span>
        </div>
      </div>

      {/* Card Items Body */}
      <div className="p-4 space-y-3 flex-1">
        {order.customerName && order.customerName !== "Guest" && (
          <p className="text-xs text-stone-500 font-medium">
            Guest: <span className="text-stone-800 font-bold">{order.customerName}</span>
            {order.customerPhone && <span className="ml-1 text-[11px] font-mono">({order.customerPhone})</span>}
          </p>
        )}

        <div className="space-y-2 divide-y divide-stone-100">
          {order.items.map((item) => (
            <div key={item.cartItemId} className="pt-2 first:pt-0">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-stone-900 leading-tight">
                  <span className="text-amber-700 font-extrabold mr-1.5">{item.quantity}x</span>
                  {item.name}
                </span>
                <span className="text-xs text-stone-500 font-medium ml-2">
                  {config.currencySymbol}{(item.unitPrice * item.quantity).toFixed(0)}
                </span>
              </div>

              {/* Modifiers & Jain indicator */}
              <div className="text-[11px] text-stone-500 pl-4 space-y-0.5 mt-0.5">
                {item.isJain && (
                  <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded text-[10px] mr-1.5 inline-block">
                    Jain Prep
                  </span>
                )}
                {item.selectedSize && <span className="mr-2 font-medium">Size: {item.selectedSize}</span>}
                {item.selectedSugar && <span className="mr-2 font-medium">Sugar: {item.selectedSugar}</span>}
                {item.selectedSpice && <span className="font-medium">Spice: {item.selectedSpice}</span>}
                {item.specialNotes && (
                  <p className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded mt-1 border border-amber-200/60 inline-block">
                    Note: "{item.specialNotes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-900">
            <span className="font-bold flex items-center gap-1 mb-0.5">
              <AlertCircle className="w-3.5 h-3.5" /> Table Instructions:
            </span>
            "{order.notes}"
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintKOT}
            title="Print Kitchen Order Ticket (KOT)"
            className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-400 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-black text-stone-800">
            {config.currencySymbol}{order.totalAmount.toFixed(0)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {order.status === "pending" && (
            <>
              <button
                onClick={() => updateOrderStatus(order.id, "cancelled")}
                title="Cancel order"
                className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-stone-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateOrderStatus(order.id, "preparing")}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 transition-all"
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Cooking</span>
              </button>
            </>
          )}

          {order.status === "preparing" && (
            <button
              onClick={() => updateOrderStatus(order.id, "served")}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 transition-all"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Mark Served</span>
            </button>
          )}

          {order.status === "served" && (
            <button
              onClick={() => {
                markOrderPaidAtCounter(order.id);
                updateOrderStatus(order.id, "completed");
              }}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Paid at Counter & Close</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
