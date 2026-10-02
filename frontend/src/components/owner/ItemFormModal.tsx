import React, { useState, useEffect, useRef } from "react";
import { MenuItem } from "../../types";
import { useCafe } from "../../context/CafeContext";
import { X, Upload, Check } from "lucide-react";

interface ItemFormModalProps {
  itemToEdit: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_INDIAN_IMAGES = [
  { name: "Kulhad Chai", url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80" },
  { name: "Filter Kaapi", url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80" },
  { name: "Bombay Sandwich", url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80" },
  { name: "Paneer Kathi Roll", url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80" },
  { name: "Samosa Pav", url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80" },
  { name: "Kanda Poha", url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80" },
  { name: "Peri Peri Fries", url: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80" },
  { name: "Cold Coffee", url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80" },
  { name: "Gulab Jamun", url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80" },
  { name: "Sizzling Brownie", url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80" },
];

export const ItemFormModal: React.FC<ItemFormModalProps> = ({ itemToEdit, isOpen, onClose }) => {
  const { addMenuItem, updateMenuItem, config, menu } = useCafe();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Chai & Kaapi");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [price, setPrice] = useState("120");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [isJainAvailable, setIsJainAvailable] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(5);
  const [calories, setCalories] = useState<string>("");
  const [imageTab, setImageTab] = useState<"preset" | "upload" | "url">("preset");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const existingCategories = Array.from(new Set(menu.map((m) => m.category)));

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategory(itemToEdit.category);
      setPrice(itemToEdit.price.toString());
      setDescription(itemToEdit.description);
      setImage(itemToEdit.image);
      setIsVeg(itemToEdit.isVeg);
      setIsJainAvailable(!!itemToEdit.isJainAvailable);
      setIsPopular(!!itemToEdit.isPopular);
      setInStock(itemToEdit.inStock);
      setPrepTimeMinutes(itemToEdit.prepTimeMinutes);
      setCalories(itemToEdit.calories ? itemToEdit.calories.toString() : "");
    } else {
      setName("");
      setCategory(existingCategories[0] || "Chai & Kaapi");
      setPrice("120");
      setDescription("");
      setImage(PRESET_INDIAN_IMAGES[0].url);
      setIsVeg(true);
      setIsJainAvailable(false);
      setIsPopular(false);
      setInStock(true);
      setPrepTimeMinutes(5);
      setCalories("");
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        setImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCategory = category === "CUSTOM_NEW" ? newCategoryName.trim() || "Desi Specials" : category;
    const finalPrice = parseFloat(price) || 0;

    if (itemToEdit) {
      updateMenuItem({
        ...itemToEdit,
        name: name.trim(),
        category: finalCategory,
        price: finalPrice,
        description: description.trim(),
        image: image || PRESET_INDIAN_IMAGES[0].url,
        isVeg,
        isJainAvailable,
        isPopular,
        inStock,
        prepTimeMinutes: Number(prepTimeMinutes) || 5,
        calories: calories ? parseInt(calories, 10) : undefined
      });
    } else {
      addMenuItem({
        name: name.trim(),
        category: finalCategory,
        price: finalPrice,
        description: description.trim(),
        image: image || PRESET_INDIAN_IMAGES[0].url,
        isVeg,
        isJainAvailable,
        isPopular,
        inStock,
        prepTimeMinutes: Number(prepTimeMinutes) || 5,
        calories: calories ? parseInt(calories, 10) : undefined
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="font-bold text-stone-900 text-base">
              {itemToEdit ? "Edit Dish / Beverage" : "Add New Dish or Beverage"}
            </h3>
            <p className="text-xs text-stone-500">
              Changes update immediately on the customer QR menu
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Image Preview & Selector */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-2">
              Food Item Picture *
            </label>
            
            <div className="flex gap-4 items-start">
              <div className="w-24 h-24 rounded-2xl bg-stone-100 overflow-hidden border border-stone-200 flex-shrink-0 shadow-xs">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setImageTab("preset")}
                    className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                      imageTab === "preset" ? "bg-white text-stone-900 shadow-2xs font-bold" : "text-stone-500"
                    }`}
                  >
                    Preset Photos
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab("upload")}
                    className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                      imageTab === "upload" ? "bg-white text-stone-900 shadow-2xs font-bold" : "text-stone-500"
                    }`}
                  >
                    Upload Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab("url")}
                    className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                      imageTab === "url" ? "bg-white text-stone-900 shadow-2xs font-bold" : "text-stone-500"
                    }`}
                  >
                    Image URL
                  </button>
                </div>

                {imageTab === "preset" && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
                    {PRESET_INDIAN_IMAGES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setImage(preset.url)}
                        className={`w-12 h-12 rounded-xl overflow-hidden border-2 flex-shrink-0 relative transition-all ${
                          image === preset.url ? "border-amber-600 scale-105" : "border-stone-200 opacity-70 hover:opacity-100"
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {imageTab === "upload" && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 border border-dashed border-stone-300 hover:border-amber-600 rounded-xl text-xs text-stone-600 font-semibold flex items-center justify-center gap-2 bg-stone-50 hover:bg-amber-50/50 transition-colors"
                    >
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span>Upload dish photo from phone/PC</span>
                    </button>
                  </div>
                )}

                {imageTab === "url" && (
                  <input
                    type="url"
                    placeholder="https://..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Dish Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Malai Paneer Tikka Sandwich"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500"
              >
                {existingCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="CUSTOM_NEW">+ Add New Category</option>
              </select>

              {category === "CUSTOM_NEW" && (
                <input
                  type="text"
                  placeholder="Type new category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="mt-2 w-full text-xs px-3 py-2 border rounded-xl bg-amber-50 border-amber-300 focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Price & Prep Time & Calories */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Price ({config.currencySymbol}) *
              </label>
              <input
                type="number"
                step="1"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Prep Time (Mins)
              </label>
              <input
                type="number"
                min="1"
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                placeholder="e.g. 280"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Description / Ingredients
            </label>
            <textarea
              rows={2}
              placeholder="Freshly brewed CTC tea, crushed ginger, pure buffalo milk..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Dietary & Badges */}
          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2.5">
            <span className="text-xs font-bold text-stone-700 block">FSSAI Badges & Preparation</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVeg}
                  onChange={(e) => setIsVeg(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="flex items-center gap-1">
                  <div className="w-3.5 h-3.5 bg-white border border-emerald-600 rounded-xs flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </div>
                  <span>Pure Veg</span>
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isJainAvailable}
                  onChange={(e) => setIsJainAvailable(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>? Jain Prep</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Chef Best</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className={inStock ? "text-emerald-700 font-bold" : "text-red-600 font-bold"}>
                  {inStock ? "In Stock" : "Sold Out"}
                </span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-stone-300 rounded-xl text-stone-700 font-bold text-xs hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
            >
              {itemToEdit ? "Save Changes" : "Create Dish"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
