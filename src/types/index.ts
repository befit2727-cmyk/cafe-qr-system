export type UserRole = "customer" | "staff" | "owner" | "superadmin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "owner" | "staff";
  cafeId?: string;
  cafeName?: string;
  provider?: "email" | "google";
  avatar?: string;
}

export type Category = 
  | "Chai & Kaapi"
  | "Desi Nashta & Breakfast"
  | "Bombay Sandwiches & Rolls"
  | "Chaat & Street Bites"
  | "Cold Brews & Shakes"
  | "Fusion Desserts";

export interface MenuItemOption {
  name: string;
  extraPrice: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: Category | string;
  price: number;
  description: string;
  image: string;
  isVeg: boolean;
  isJainAvailable?: boolean;
  isGlutenFree?: boolean;
  isPopular?: boolean;
  inStock: boolean;
  prepTimeMinutes: number;
  sizes?: MenuItemOption[];
  milkOptions?: string[];
  sugarLevels?: string[];
  spiceLevels?: string[];
  calories?: number;
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  selectedSize?: string;
  selectedMilk?: string;
  selectedSugar?: string;
  selectedSpice?: string;
  specialNotes?: string;
  isJain?: boolean;
}

export type OrderStatus = "pending" | "preparing" | "served" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid_at_counter";

export interface Order {
  id: string;
  orderNumber: number;
  tableNumber: string;
  items: CartItem[];
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  guestsCount: number;
  date: string;
  timeSlot: string;
  notes?: string;
  tableAssigned?: string;
  status: "confirmed" | "seated" | "completed" | "cancelled";
  createdAt: string;
}

export interface WaiterCall {
  id: string;
  tableNumber: string;
  type: "waiter" | "bill" | "water" | "clean";
  createdAt: string;
  resolved: boolean;
}

export interface CafeMeta {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logoUrl?: string;
  currencySymbol: string;
  address?: string;
  phone?: string;
  template?: string;
  city?: string;
  ownerEmail?: string;
  status?: "active" | "paused" | "suspended";
  plan?: string;
  monthlySales?: number;
  createdAt?: string;
}

export interface CafeConfig {
  id?: string;
  name: string;
  tagline: string;
  currencySymbol: string;
  taxRatePercent: number; // Combined GST (e.g. 5%)
  cgstPercent: number;    // e.g. 2.5%
  sgstPercent: number;    // e.g. 2.5%
  address: string;
  phone: string;
  wifiName: string;
  wifiPassword: string;
  ownerPin: string;
  staffPin: string;
  fssaiNumber: string;     // Indian FSSAI License
  gstin: string;           // Indian GSTIN
  tables: string[];
  logoUrl?: string;
  status?: "active" | "paused" | "suspended";
  plan?: string;
}
