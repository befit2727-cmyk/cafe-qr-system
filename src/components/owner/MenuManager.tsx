import React, { useState, useMemo, useEffect } from "react";
import { MenuItem } from "../../types";
import { useCafe } from "../../context/CafeContext";
import { ItemFormModal } from "./ItemFormModal";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Flame, 
  Leaf, 
  WheatOff, 
  Check, 
  X,
  Coffee
} from "lucide-react";

export const MenuManager: React.FC = () => {
  const { menu, deleteMenuItem, toggleItemStock, config, activeCafeId } = useCafe();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // When cafe changes, reset category filter & search query
  useEffect(() => {
    setSelectedCategory("All");
    setSearchQuery("");
  }, [activeCafeId]);

  // If selected category is no longer valid, reset to "All"
  useEffect(() => {
    if (selectedCategory !== "All") {
      const exists = menu.some((item) => item.category === selectedCategory);
      if (!exists) {
        setSelectedCategory("All");
      }
    }
  }, [menu, selectedCategory]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menu.map((i) => i.category)));
    return ["All", ...cats];
  }, [menu]);

  const filteredItems = useMemo(() => {
    return menu.filter((item) => {
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [menu, selectedCategory, searchQuery]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the menu?`)) {
      deleteMenuItem(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h3 className="font-bold text-stone-900 text-lg">Menu Items Management</h3>
          <p className="text-xs text-stone-500">
            {menu.length} total items in your cafe catalog
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish / Drink</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search items to edit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl text-xs border border-stone-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c
                  ? "bg-espresso-900 text-amber-400 shadow-xs"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Items Table / Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
              !item.inStock ? "border-stone-200 bg-stone-50/70" : "border-stone-200 hover:border-amber-300"
            }`}
          >
            <div>
              <div className="flex gap-3 items-start">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover bg-stone-100 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-stone-900 text-sm truncate">
                      {item.name}
                    </h4>
                    <span className="font-extrabold text-stone-900 text-xs ml-2">
                      {config.currencySymbol}{item.price.toFixed(2)}
                    </span>
                  </div>

                  <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md mt-0.5 inline-block border border-amber-200/60">
                    {item.category}
                  </span>

                  <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-1">
                    <span>⏱️ {item.prepTimeMinutes}m</span>
                    {item.calories && <span>🔥 {item.calories} kcal</span>}
                    {item.isVeg && <span className="text-emerald-700 font-semibold">🌱 Veg</span>}
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
              
              {/* Instant In-Stock Toggle */}
              <button
                onClick={() => toggleItemStock(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  item.inStock
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {item.inStock ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In Stock</span>
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5 text-red-600" />
                    <span>Sold Out</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(item)}
                  title="Edit item details"
                  className="p-1.5 rounded-lg text-stone-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  title="Delete from menu"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Item Form Modal */}
      <ItemFormModal
        itemToEdit={editingItem}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

    </div>
  );
};
