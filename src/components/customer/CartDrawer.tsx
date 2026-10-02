import React, { useState } from "react";
import { useCafe } from "../../context/CafeContext";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, MapPin, Store } from "lucide-react";
import confetti from "canvas-confetti";

export const CartDrawer: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    cart, 
    updateCartItemQty, 
    removeFromCart, 
    clearCart, 
    cartSubtotal, 
    cartCgst,
    cartSgst,
    cartTotal, 
    activeTable, 
    config, 
    placeOrder,
    menu,
    addToCart
  } = useCafe();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TypeSafe AI Smart Food Pairing Recommendation
  const suggestedPairing = React.useMemo(() => {
    if (cart.length === 0 || !menu || menu.length === 0) return null;
    const inCartIds = new Set(cart.map((c) => c.menuItemId));
    const inCartCategories = new Set(
      cart
        .map((c) => menu.find((m) => m.id === c.menuItemId)?.category)
        .filter(Boolean)
    );

    let preferredCategory = "Chai & Kaapi";
    if (inCartCategories.has("Chai & Kaapi") || inCartCategories.has("Cold Brews & Shakes")) {
      preferredCategory = "Fusion Desserts";
    }

    const match = menu.find((item) => !inCartIds.has(item.id) && item.inStock && item.category === preferredCategory);
    return match || menu.find((item) => !inCartIds.has(item.id) && item.inStock && item.isPopular) || null;
  }, [cart, menu]);

  if (activeModal !== "cart") return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await placeOrder(customerName.trim() || undefined, customerPhone.trim() || undefined, orderNotes.trim() || undefined);
      
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setActiveModal("order-status");
    } catch (err) {
      console.error("Order error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Cart Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-stone-900 text-base">Your Table Order</h2>
                <div className="flex items-center gap-1 text-xs text-amber-700 font-semibold">
                  <MapPin className="w-3 h-3" />
                  <span>Serving to: {activeTable}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 divide-y divide-stone-100 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-bold text-stone-800">Your table cart is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                  Browse our artisan chai, filter coffee, and delicious desi snacks to order!
                </p>
                <button
                  onClick={() => setActiveModal(null)}
                  className="mt-2 text-xs font-semibold text-amber-700 hover:text-amber-800 underline"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-xs text-stone-500 font-medium">
                    {cart.length} item{cart.length > 1 ? "s" : ""} selected
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3 h-3" /> Clear All
                  </button>
                </div>

                {cart.map((item) => (
                  <div key={item.cartItemId} className="pt-3 flex gap-3 items-start">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-stone-100 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-stone-900 truncate">
                          {item.name}
                        </h4>
                        <span className="text-xs font-bold text-stone-900 ml-2">
                          {config.currencySymbol}{(item.unitPrice * item.quantity).toFixed(0)}
                        </span>
                      </div>

                      {/* Modifiers Pill */}
                      <div className="text-[11px] text-stone-500 space-y-0.5 mt-0.5">
                        {item.selectedSize && <p>Portion: {item.selectedSize}</p>}
                        {item.selectedSugar && <p>Meetha: {item.selectedSugar}</p>}
                        {item.selectedSpice && <p>Spice: {item.selectedSpice}</p>}
                        {item.isJain && <p className="text-amber-800 font-bold">? Jain Preparation</p>}
                        {item.specialNotes && (
                          <p className="italic text-amber-700">"{item.specialNotes}"</p>
                        )}
                      </div>

                      {/* Quantity & Remove Buttons */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 bg-stone-100 px-1.5 py-0.5 rounded-lg border border-stone-200">
                          <button
                            onClick={() => updateCartItemQty(item.cartItemId, -1)}
                            className="p-1 text-stone-600 hover:text-stone-900"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-stone-800 w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItemQty(item.cartItemId, 1)}
                            className="p-1 text-stone-600 hover:text-stone-900"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* TypeSafe AI Culinary Companion Card */}
                {suggestedPairing && (
                  <div className="pt-2">
                    <div className="bg-gradient-to-r from-amber-500/10 via-[#0071e3]/10 to-amber-500/5 border border-[#0071e3]/25 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0071e3]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Chef AI Recommended Pairing</span>
                        </span>
                        <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#0071e3]/15 text-[#0071e3]">
                          TypeSafe AI
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 pt-0.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img 
                            src={suggestedPairing.image} 
                            alt={suggestedPairing.name} 
                            className="w-10 h-10 rounded-xl object-cover bg-stone-100 flex-shrink-0 border border-black/5" 
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-stone-900 truncate">{suggestedPairing.name}</h5>
                            <span className="text-[11px] font-semibold text-emerald-700">
                              {config.currencySymbol}{suggestedPairing.price}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart(suggestedPairing, 1)}
                          className="px-3 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-xs font-semibold shadow-xs flex items-center gap-1 transition-all active:scale-95 flex-shrink-0"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer info */}
                <div className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Aarav"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="98200 12345"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      Kitchen Instructions / Special Requests
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Please bring chai first, extra spicy chutney"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Cart Footer with Pay on Counter Callout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">{config.currencySymbol}{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>CGST ({config.cgstPercent || 2.5}%)</span>
                  <span>{config.currencySymbol}{cartCgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>SGST ({config.sgstPercent || 2.5}%)</span>
                  <span>{config.currencySymbol}{cartSgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-stone-900 pt-1 border-t border-stone-200">
                  <span>Grand Total</span>
                  <span className="text-amber-800">{config.currencySymbol}{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Pay on Counter Notification Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center text-xs text-amber-900 flex items-center justify-center gap-2">
                <Store className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span className="font-semibold">Pay at counter after your meal by showing Order #</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || config.status === "paused" || config.status === "suspended"}
                className={`w-full font-bold py-3.5 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all transform active:scale-95 disabled:opacity-50 ${
                  config.status === "paused" || config.status === "suspended"
                    ? "bg-stone-500 text-stone-200 cursor-not-allowed"
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                }`}
              >
                {config.status === "paused" || config.status === "suspended" ? (
                  <span>Ordering Suspended by Platform Admin</span>
                ) : isSubmitting ? (
                  <span>Sending Order to Kitchen...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Place Order to Kitchen ({activeTable})</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
