import React, { useState, useEffect } from "react";
import { useCafe } from "../../context/CafeContext";
import { X, Plus, Minus, Clock, Flame } from "lucide-react";

export const ItemModal: React.FC = () => {
  const { 
    selectedItemForModal, 
    setSelectedItemForModal, 
    activeModal, 
    setActiveModal, 
    addToCart, 
    config 
  } = useCafe();

  const item = selectedItemForModal;

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [sizeExtraPrice, setSizeExtraPrice] = useState<number>(0);
  const [selectedSugar, setSelectedSugar] = useState<string>("");
  const [selectedSpice, setSelectedSpice] = useState<string>("");
  const [isJain, setIsJain] = useState(false);
  const [specialNotes, setSpecialNotes] = useState<string>("");

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSpecialNotes("");
      setIsJain(false);

      if (item.sizes && item.sizes.length > 0) {
        setSelectedSize(item.sizes[0].name);
        setSizeExtraPrice(item.sizes[0].extraPrice);
      } else {
        setSelectedSize("");
        setSizeExtraPrice(0);
      }

      if (item.sugarLevels && item.sugarLevels.length > 0) {
        setSelectedSugar(item.sugarLevels[0]);
      } else {
        setSelectedSugar("");
      }

      if (item.spiceLevels && item.spiceLevels.length > 0) {
        setSelectedSpice(item.spiceLevels[0]);
      } else {
        setSelectedSpice("");
      }
    }
  }, [item]);

  if (activeModal !== "item-customizer" || !item) return null;

  const unitTotal = item.price + sizeExtraPrice;
  const totalPrice = unitTotal * quantity;

  const handleAddToCart = () => {
    addToCart(item, quantity, {
      size: selectedSize,
      sugar: selectedSugar,
      spice: selectedSpice,
      isJain,
      notes: specialNotes.trim() || undefined,
      extraPrice: sizeExtraPrice
    });
    setActiveModal(null);
    setSelectedItemForModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header Image */}
        <div className="relative h-56 sm:h-64 w-full bg-stone-100 flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => {
              setActiveModal(null);
              setSelectedItemForModal(null);
            }}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 flex gap-2">
            <span className="bg-black/60 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-300" /> Prep: {item.prepTimeMinutes} mins
            </span>
            {item.isPopular && (
              <span className="bg-amber-600/90 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                <Flame className="w-3.5 h-3.5 fill-white" /> Chef Special
              </span>
            )}
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <div className="flex justify-between items-baseline">
              <div className="flex items-center gap-2">
                {item.isVeg ? (
                  <div className="w-4 h-4 bg-white rounded-sm border-2 border-emerald-600 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  </div>
                ) : (
                  <div className="w-4 h-4 bg-white rounded-sm border-2 border-red-600 flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-red-600" />
                  </div>
                )}
                <h2 className="text-xl font-bold text-stone-900">{item.name}</h2>
              </div>

              <span className="text-lg font-extrabold text-amber-700">
                {config.currencySymbol}{unitTotal.toFixed(0)}
              </span>
            </div>
            <p className="text-stone-600 text-xs sm:text-sm mt-1.5 leading-relaxed">{item.description}</p>
          </div>

          {/* Size Choice */}
          {item.sizes && item.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                Portion Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {item.sizes.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => {
                      setSelectedSize(s.name);
                      setSizeExtraPrice(s.extraPrice);
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all ${
                      selectedSize === s.name
                        ? "border-amber-600 bg-amber-50 text-amber-900 shadow-xs"
                        : "border-stone-200 text-stone-700 hover:border-stone-300"
                    }`}
                  >
                    <span>{s.name}</span>
                    {s.extraPrice > 0 && (
                      <span className="text-amber-700 font-medium">
                        +{config.currencySymbol}{s.extraPrice.toFixed(0)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sweetness Preference */}
          {item.sugarLevels && item.sugarLevels.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                Sugar / Meetha Preference
              </label>
              <div className="flex flex-wrap gap-2">
                {item.sugarLevels.map((sugar) => (
                  <button
                    key={sugar}
                    type="button"
                    onClick={() => setSelectedSugar(sugar)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedSugar === sugar
                        ? "border-amber-600 bg-amber-50 text-amber-900"
                        : "border-stone-200 text-stone-700"
                    }`}
                  >
                    {sugar}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Spice Level */}
          {item.spiceLevels && item.spiceLevels.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                Teekha / Spice Level
              </label>
              <div className="flex flex-wrap gap-2">
                {item.spiceLevels.map((spice) => (
                  <button
                    key={spice}
                    type="button"
                    onClick={() => setSelectedSpice(spice)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedSpice === spice
                        ? "border-amber-600 bg-amber-50 text-amber-900"
                        : "border-stone-200 text-stone-700"
                    }`}
                  >
                    {spice}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Jain Preparation Toggle */}
          {item.isJainAvailable && (
            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-950 block">Jain Preparation</span>
                <p className="text-[11px] text-amber-800">Prepared without onion, garlic, or root veggies</p>
              </div>
              <input
                type="checkbox"
                checked={isJain}
                onChange={(e) => setIsJain(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
              Instructions for Kitchen / Halwai
            </label>
            <input
              type="text"
              placeholder="e.g. Extra kadak chai, green chutney on side, crispy toast"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-800"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white border border-stone-200 px-2 py-1.5 rounded-xl shadow-xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-1 rounded-lg hover:bg-stone-100 disabled:opacity-30 text-stone-700"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-stone-900 w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 rounded-lg hover:bg-stone-100 text-stone-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-5 rounded-2xl shadow-md flex items-center justify-between text-sm transition-all transform active:scale-95"
          >
            <span>Add to Table Order</span>
            <span>{config.currencySymbol}{totalPrice.toFixed(0)}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
