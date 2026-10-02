import { MenuItem, CafeConfig, Order, Reservation } from "../types";

export const initialConfig: CafeConfig = {
  name: "Chai & Charcha Craft Cafe",
  tagline: "Specialty Teas, Filter Kaapi & Desi Gourmet",
  currencySymbol: "\u20B9",
  taxRatePercent: 5, // Indian Restaurant GST Rate
  cgstPercent: 2.5,
  sgstPercent: 2.5,
  address: "Plot 14, Linking Road, Bandra West, Mumbai",
  phone: "+91 98201 54321",
  wifiName: "ChaiCharcha_Guest5G",
  wifiPassword: "",
  ownerPin: "",
  staffPin: "",
  fssaiNumber: "11523019000842",
  gstin: "27AABCT1332L1ZV",
  tables: [
    "Table 1", "Table 2", "Table 3", "Table 4", 
    "Table 5", "Table 6", "Table 7", "Table 8",
    "Patio 1", "Patio 2", "Baithak 1", "Baithak 2"
  ],
  logoUrl: "\u2615"
};

export const initialMenuItems: MenuItem[] = [
  {
    id: "in-item-1",
    name: "Adrak Elaichi Kulhad Chai",
    category: "Chai & Kaapi",
    price: 60,
    description: "Slow-brewed Assam CTC infused with fresh hand-crushed ginger, green cardamom, and full-cream buffalo milk in an earthen terracotta kulhad.",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    isVeg: true,
    isJainAvailable: true,
    isPopular: true,
    inStock: true,
    prepTimeMinutes: 3,
    sizes: [
      { name: "Single Kulhad", extraPrice: 0 },
      { name: "Cutting Kettle (Serves 3)", extraPrice: 90 }
    ],
    sugarLevels: ["Standard Sweet", "Less Sugar", "Gud (Jaggery)", "Sugar-Free"],
    calories: 120
  },
  {
    id: "in-item-2",
    name: "South Indian Filter Kaapi",
    category: "Chai & Kaapi",
    price: 80,
    description: "Authentic Chikmagalur dark-roast coffee decoction frothed high with frothy buffalo milk, served in traditional brass davarah and tumbler.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    isVeg: true,
    isJainAvailable: true,
    isPopular: true,
    inStock: true,
    prepTimeMinutes: 3,
    sugarLevels: ["Strong & Sweet", "Less Sugar", "No Sugar"],
    calories: 110
  },
  {
    id: "in-item-3",
    name: "Irani Dum Chai with Bun Maska",
    category: "Chai & Kaapi",
    price: 120,
    description: "Legendary Irani cafe style condensed-milk dum tea paired with a warm, soft Brun Pav generously slathered with Amul salted butter.",
    image: "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=600&q=80",
    isVeg: true,
    isJainAvailable: true,
    isPopular: true,
    inStock: true,
    prepTimeMinutes: 4,
    calories: 320
  },
  {
    id: "in-item-4",
    name: "Kashmiri Shahi Kahwa",
    category: "Chai & Kaapi",
    price: 110,
    description: "Exotic green tea steeped with whole cinnamon, green cardamom, roasted almond flakes, and pure Kashmir saffron strands.",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    isVeg: true,
    isGlutenFree: true,
    isJainAvailable: true,
    inStock: true,
    prepTimeMinutes: 3,
    calories: 45
  },
  {
    id: "in-item-5",
    name: "Classic Desi Cold Coffee",
    category: "Cold Brews & Shakes",
    price: 140,
    description: "Thick, frothy coffee shaken with chocolate drizzle, chilled milk, and topped with a scoop of vanilla bean ice cream.",
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
    isVeg: true,
    isPopular: true,
    inStock: true,
    prepTimeMinutes: 4,
    sizes: [
      { name: "Regular (300ml)", extraPrice: 0 },
      { name: "Monster Mug (500ml)", extraPrice: 50 }
    ],
    calories: 280
  },
  {
    id: "in-item-6",
    name: "Kesar Pista Badam Shake",
    category: "Cold Brews & Shakes",
    price: 160,
    description: "Royal chilled milkshake infused with saffron, crushed California pistachios, almonds, and cardamom extract.",
    image: "https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&w=600&q=80",
    isVeg: true,
    isGlutenFree: true,
    isJainAvailable: true,
    inStock: true,
    prepTimeMinutes: 3,
    calories: 310
  },
  {
    id: "in-item-7",
    name: "Bombay Masala Grilled Sandwich",
    category: "Bombay Sandwiches & Rolls",
    price: 160,
    description: "Triple-layer toasted sandwich stuffed with spiced potatoes, beetroots, cucumber, bell peppers, melted Amul cheese, and spicy mint-coriander chutney.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80",
    isVeg: true,
    isPopular: true,
    inStock: true,
    prepTimeMinutes: 8,
    spiceLevels: ["Medium Spicy", "Extra Spicy", "Mild"],
    calories: 440
  },
  {
    id: "in-item-8",
    name: "Tandoori Paneer Tikka Kathi Roll",
    category: "Bombay Sandwiches & Rolls",
    price: 190,
    description: "Flaky paratha layered with charcoal-smoked malai paneer tikka, crunchy lachha onions, tangy chaat masala, and mint dip.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    isVeg: true,
    isJainAvailable: true,
    isPopular: true,
    inStock: true,
    prepTimeMinutes: 9,
    calories: 490
  },
  {
    id: "in-item-9",
    name: "Old Delhi Butter Chicken Kathi Roll",
    category: "Bombay Sandwiches & Rolls",
    price: 230,
    description: "Juicy tandoori chicken tikka tossed in rich makhani gravy with bell peppers, wrapped in an egg-coated handmade laccha paratha.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    isVeg: false,
    isPopular: true,
    inStock: true,
    prepTimeMinutes: 10,
    calories: 580
  },
  {
    id: "in-item-10",
    name: "Mumbai Samosa Pav with Thecha",
    category: "Desi Nashta & Breakfast",
    price: 90,
    description: "Two crispy Punjabi aloo samosas stuffed in fresh ladi pav with spicy garlic thecha, sweet tamarind chutney, and fried green chilli.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    isVeg: true,
    isPopular: true,
    inStock: true,
    prepTimeMinutes: 4,
    calories: 380
  },
  {
    id: "in-item-11",
    name: "Indori Kanda Poha with Ratlami Sev",
    category: "Desi Nashta & Breakfast",
    price: 110,
    description: "Steamed flattened rice tossed with turmeric, crunchy roasted peanuts, mustard seeds, fresh lemon juice, and spicy Ratlami sev.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    isVeg: true,
    isGlutenFree: true,
    inStock: true,
    prepTimeMinutes: 5,
    calories: 260
  },
  {
    id: "in-item-12",
    name: "Cheese Chilli Garlic Toast",
    category: "Desi Nashta & Breakfast",
    price: 140,
    description: "Golden toasted sourdough loaded with roasted garlic butter, green chillies, fresh coriander, and bubbling melted mozzarella.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
    isVeg: true,
    isPopular: true,
    inStock: true,
    prepTimeMinutes: 6,
    calories: 340
  },
  {
    id: "in-item-13",
    name: "Dahi Papdi Samosa Chaat",
    category: "Chaat & Street Bites",
    price: 140,
    description: "Crushed hot samosa layered with spiced ragda chickpeas, sweet creamy dahi, date-tamarind saunth, spicy mint thecha, and crispy nylon sev.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    isVeg: true,
    isPopular: true,
    inStock: true,
    prepTimeMinutes: 5,
    calories: 390
  },
  {
    id: "in-item-14",
    name: "Cafe Special Peri Peri Fries",
    category: "Chaat & Street Bites",
    price: 130,
    description: "Crispy skin-on potato fries dusted with hot African-Indian peri peri masala, served with tandoori mayo dip.",
    image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80",
    isVeg: true,
    isGlutenFree: true,
    isJainAvailable: true,
    inStock: true,
    prepTimeMinutes: 6,
    calories: 310
  },
  {
    id: "in-item-15",
    name: "Gulab Jamun Rabdi Cheesecake",
    category: "Fusion Desserts",
    price: 180,
    description: "Rich baked cheesecake with a saffron-cardamom biscuit base, stuffed with warm mini gulab jamuns and topped with thickened pistachio rabdi.",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80",
    isVeg: true,
    isPopular: true,
    inStock: true,
    prepTimeMinutes: 2,
    calories: 420
  },
  {
    id: "in-item-16",
    name: "Sizzling Brownie with Ice Cream",
    category: "Fusion Desserts",
    price: 210,
    description: "Gooey Belgian chocolate fudge walnut brownie served on a scorching iron sizzler plate with vanilla ice cream and streaming hot chocolate ganache.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    isVeg: true,
    isPopular: true,
    inStock: true,
    prepTimeMinutes: 5,
    calories: 510
  }
];

export const sampleInitialOrders: Order[] = [
  {
    id: "ord-201",
    orderNumber: 201,
    tableNumber: "Table 3",
    items: [
      {
        cartItemId: "c1",
        menuItemId: "in-item-1",
        name: "Adrak Elaichi Kulhad Chai",
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
        quantity: 2,
        unitPrice: 60,
        selectedSugar: "Less Sugar",
        specialNotes: "Make it extra kadak with more ginger"
      },
      {
        cartItemId: "c2",
        menuItemId: "in-item-7",
        name: "Bombay Masala Grilled Sandwich",
        image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80",
        quantity: 1,
        unitPrice: 160,
        selectedSpice: "Medium Spicy"
      }
    ],
    subtotal: 280,
    cgstAmount: 7,
    sgstAmount: 7,
    taxAmount: 14,
    totalAmount: 294,
    status: "preparing",
    paymentStatus: "paid_at_counter",
    customerName: "Aarav Sharma",
    customerPhone: "+91 98201 11223",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString()
  },
  {
    id: "ord-202",
    orderNumber: 202,
    tableNumber: "Table 5",
    items: [
      {
        cartItemId: "c3",
        menuItemId: "in-item-2",
        name: "South Indian Filter Kaapi",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
        quantity: 2,
        unitPrice: 80
      },
      {
        cartItemId: "c4",
        menuItemId: "in-item-14",
        name: "Cafe Special Peri Peri Fries",
        image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80",
        quantity: 1,
        unitPrice: 130
      }
    ],
    subtotal: 290,
    cgstAmount: 7.25,
    sgstAmount: 7.25,
    taxAmount: 14.50,
    totalAmount: 304.50,
    status: "pending",
    paymentStatus: "pending",
    customerName: "Priya Patel",
    customerPhone: "+91 97654 32109",
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  }
];

export const sampleReservations: Reservation[] = [
  {
    id: "res-101",
    guestName: "Rohan Verma",
    guestPhone: "+91 98112 34567",
    guestEmail: "rohan.verma@example.com",
    guestsCount: 4,
    date: new Date().toISOString().split("T")[0],
    timeSlot: "05:30 PM",
    notes: "Chai & Charcha corner table, evening meetup",
    tableAssigned: "Table 4",
    status: "confirmed",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: "res-102",
    guestName: "Ananya Iyer",
    guestPhone: "+91 99401 98765",
    guestsCount: 2,
    date: new Date().toISOString().split("T")[0],
    timeSlot: "07:00 PM",
    notes: "Filter coffee & desserts, anniversary",
    tableAssigned: "Baithak 1",
    status: "confirmed",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  }
];
