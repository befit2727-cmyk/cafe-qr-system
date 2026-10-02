import React, { useRef } from "react";
import { MenuItem } from "../../types";
import { useCafe } from "../../context/CafeContext";
import { Plus, Clock, Flame, Move3d } from "lucide-react";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { config, addToCart, setSelectedItemForModal, setActiveModal, setSelectedItemFor3D } = useCafe();
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion.dev 3D Tilt Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 280, damping: 22 });
  const mouseYSpring = useSpring(y, { stiffness: 280, damping: 22 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["9deg", "-9deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-9deg", "9deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const hasOptions = (item.sizes && item.sizes.length > 0) || 
                     (item.sugarLevels && item.sugarLevels.length > 0) || 
                     (item.spiceLevels && item.spiceLevels.length > 0) ||
                     item.isJainAvailable;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.inStock) return;

    if (hasOptions) {
      setSelectedItemForModal(item);
      setActiveModal("item-customizer");
    } else {
      addToCart(item, 1);
    }
  };

  const handle3DClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItemFor3D(item);
  };

  const handleCardClick = () => {
    if (!item.inStock) return;
    setSelectedItemForModal(item);
    setActiveModal("item-customizer");
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 900
      }}
      whileHover={{ scale: 1.02, z: 15 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className={`group bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
        !item.inStock
          ? "border-black/[0.04] opacity-50 grayscale-[50%]"
          : "border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:border-black/[0.12]"
      }`}
    >
      {/* Food Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f5f5f7]">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {item.isVeg ? (
            <div className="w-5 h-5 bg-white/95 backdrop-blur-md rounded-md border border-emerald-600 flex items-center justify-center shadow-2xs" title="Pure Vegetarian">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            </div>
          ) : (
            <div className="w-5 h-5 bg-white/95 backdrop-blur-md rounded-md border border-red-600 flex items-center justify-center shadow-2xs" title="Non-Vegetarian">
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-red-600" />
            </div>
          )}

          {item.isPopular && (
            <span className="bg-[#1d1d1f]/90 backdrop-blur-md text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
              <Flame className="w-3 h-3 fill-amber-400 text-amber-400" /> Popular
            </span>
          )}

          {item.isJainAvailable && (
            <span className="bg-white/90 backdrop-blur-md text-[#1d1d1f] border border-black/[0.08] text-[10px] font-medium px-2.5 py-0.5 rounded-full shadow-2xs">
              Jain
            </span>
          )}
        </div>

        {/* 3D Inspect Badge & Prep Time */}
        <div className="absolute bottom-3 inset-x-3 flex justify-between items-center z-10">
          <button
            onClick={handle3DClick}
            className="bg-[#1d1d1f]/85 hover:bg-black text-[#2997ff] backdrop-blur-md text-[10px] font-medium px-3 py-1 rounded-full flex items-center gap-1 border border-white/10 shadow-xs transition-all hover:scale-105"
            title="Inspect in interactive 3D"
          >
            <Move3d className="w-3 h-3 text-[#2997ff]" />
            <span>3D View</span>
          </button>

          <div className="bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#2997ff]" /> {item.prepTimeMinutes}m
          </div>
        </div>

        {!item.inStock && (
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-[#1d1d1f] text-white font-medium text-xs px-3.5 py-1.5 rounded-full tracking-wide shadow-lg border border-white/15">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Item Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-semibold text-[#1d1d1f] text-base group-hover:text-[#0071e3] transition-colors line-clamp-1">
              {item.name}
            </h3>
          </div>
          <p className="text-xs text-[#86868b] mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/[0.04]">
          <div>
            <span className="text-[10px] text-[#86868b] font-medium uppercase tracking-wider block">Price</span>
            <div className="text-base font-semibold text-[#1d1d1f]">
              {config.currencySymbol}{item.price.toFixed(0)}
            </div>
          </div>

          <button
            onClick={handleAddClick}
            disabled={!item.inStock}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium shadow-xs transition-all ${
              !item.inStock
                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                : "bg-[#0071e3] hover:bg-[#0077ed] text-white active:scale-95"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{hasOptions ? "Customize" : "Add"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
