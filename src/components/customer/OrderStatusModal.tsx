import React from "react";
import { useCafe } from "../../context/CafeContext";
import { X, CheckCircle, Clock, ChefHat, Utensils, Receipt, Sparkles, Store, Share2 } from "lucide-react";
import { OrderStatus } from "../../types";

export const OrderStatusModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    currentTableOrders, 
    activeTable, 
    config
  } = useCafe();

  if (activeModal !== "order-status") return null;

  const steps: { key: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "pending", label: "Order Placed", icon: Clock },
    { key: "preparing", label: "In Kitchen", icon: ChefHat },
    { key: "served", label: "Served to Table", icon: Utensils },
    { key: "completed", label: "Paid & Done", icon: CheckCircle }
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case "pending": return 0;
      case "preparing": return 1;
      case "served": return 2;
      case "completed": return 3;
      case "cancelled": return -1;
      default: return 0;
    }
  };

  const handleShareWhatsApp = (order: typeof currentTableOrders[0]) => {
    const sym = config.currencySymbol || "₹";
    const itemsList = order.items.map(i => `${i.quantity}x ${i.name} - ${sym}${(i.unitPrice * i.quantity).toFixed(0)}`).join("%0A");
    const message = `*${config.name} - Table Bill*%0AOrder %23${order.orderNumber} | ${order.tableNumber}%0A---------------------------%0A${itemsList}%0A---------------------------%0ASubtotal: ${sym}${order.subtotal.toFixed(2)}%0ACGST (2.5%): ${sym}${order.cgstAmount.toFixed(2)}%0ASGST (2.5%): ${sym}${order.sgstAmount.toFixed(2)}%0A*Grand Total: ${sym}${order.totalAmount.toFixed(2)}*%0APayment: Pay at Counter%0AFSSAI: ${config.fssaiNumber}`;
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Live Order Status</h3>
              <p className="text-xs text-stone-500 font-medium">{activeTable}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {currentTableOrders.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm font-semibold text-stone-700">No active orders found for {activeTable}.</p>
              <p className="text-xs text-stone-500">Scan our QR or browse the menu to order!</p>
            </div>
          ) : (
            currentTableOrders.map((order) => {
              const currentStepIdx = getStepIndex(order.status);

              return (
                <div key={order.id} className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-4 shadow-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">
                          Order #{order.orderNumber}
                        </span>
                        {order.paymentStatus === "paid_at_counter" ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ✓ Paid at Counter
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Store className="w-3 h-3 text-amber-700" />
                            Pay on Counter
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 block">
                        Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      order.status === "completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : order.status === "preparing"
                        ? "bg-amber-100 text-amber-800 animate-pulse"
                        : order.status === "served"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-stone-200 text-stone-700"
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Step Tracker */}
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-1 relative">
                      {steps.map((s, idx) => {
                        const Icon = s.icon;
                        const isDone = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div key={s.key} className="flex flex-col items-center text-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCurrent
                                ? "bg-amber-600 text-white ring-4 ring-amber-100 shadow-sm scale-110"
                                : isDone
                                ? "bg-emerald-600 text-white"
                                : "bg-stone-200 text-stone-500"
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] mt-1.5 font-medium leading-tight ${
                              isDone ? "text-stone-900 font-bold" : "text-stone-400"
                            }`}>
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pay on counter notice */}
                  {order.paymentStatus !== "paid_at_counter" && (
                    <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2 text-xs text-amber-950">
                      <Store className="w-4 h-4 text-amber-700 flex-shrink-0" />
                      <div>
                        <span className="font-bold">Pay at Counter: </span>
                        <span>Show <strong>Order #{order.orderNumber}</strong> at the billing counter when leaving (Cash, UPI, or Card).</span>
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="bg-white rounded-xl p-3 border border-stone-200/60 divide-y divide-stone-100">
                    {order.items.map((item) => (
                      <div key={item.cartItemId} className="py-2 flex justify-between items-start text-xs">
                        <div>
                          <div className="font-semibold text-stone-800">
                            {item.quantity}x {item.name}
                          </div>
                          {(item.selectedSize || item.selectedSugar || item.selectedSpice || item.isJain || item.specialNotes) && (
                            <div className="text-[11px] text-stone-500">
                              {[
                                item.selectedSize, 
                                item.selectedSugar, 
                                item.selectedSpice, 
                                item.isJain ? "Jain" : "",
                                item.specialNotes
                              ].filter(Boolean).join(" • ")}
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-stone-900">
                          {config.currencySymbol}{(item.unitPrice * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    ))}

                    <div className="pt-2 space-y-1 text-[11px] text-stone-500">
                      <div className="flex justify-between">
                        <span>CGST (2.5%)</span>
                        <span>{config.currencySymbol}{order.cgstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST (2.5%)</span>
                        <span>{config.currencySymbol}{order.sgstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-stone-900 pt-1 border-t border-stone-100">
                        <span>Grand Total</span>
                        <span className="text-amber-800 font-extrabold text-sm">
                          {config.currencySymbol}{order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Bill share */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleShareWhatsApp(order)}
                      className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Save / Share on WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
