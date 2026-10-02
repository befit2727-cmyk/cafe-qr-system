import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const CAFES_DIR = path.join(DATA_DIR, 'cafes');
const REGISTRY_PATH = path.join(CAFES_DIR, 'registry.json');
const LEGACY_STORE_PATH = path.join(DATA_DIR, 'store.json');

try {
  if (!fs.existsSync(CAFES_DIR)) {
    fs.mkdirSync(CAFES_DIR, { recursive: true });
  }
} catch (e) {}

const memoryCache = new Map();

export const TEMPLATES = {
  'chai-cafe': {
    name: 'Specialty Chai & Desi Gourmet',
    tagline: 'Artisan Chai, Filter Kaapi & Street Gourmet',
    currencySymbol: '₹',
    tables: ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Patio 1', 'Baithak 1'],
    logoUrl: '☕',
    menu: [
      {
        id: 'item-chai-1',
        name: 'Adrak Elaichi Kulhad Chai',
        category: 'Chai & Kaapi',
        price: 60,
        description: 'Fresh crushed ginger, cardamom, and thick buffalo milk in an earthen terracotta kulhad.',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isJainAvailable: true,
        isPopular: true,
        inStock: true,
        prepTimeMinutes: 3,
        sugarLevels: ['Standard Sweet', 'Less Sugar', 'Gud (Jaggery)', 'Sugar-Free'],
        calories: 120
      },
      {
        id: 'item-chai-2',
        name: 'South Indian Filter Kaapi',
        category: 'Chai & Kaapi',
        price: 80,
        description: 'Traditional Chikmagalur dark-roast coffee decoction served in a brass davarah tumbler.',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isPopular: true,
        inStock: true,
        prepTimeMinutes: 3,
        sugarLevels: ['Strong & Sweet', 'Less Sugar', 'No Sugar'],
        calories: 110
      },
      {
        id: 'item-chai-3',
        name: 'Bombay Masala Grilled Sandwich',
        category: 'Bombay Sandwiches & Rolls',
        price: 160,
        description: 'Triple-layer sandwich with spiced potatoes, beetroots, crunchy veggies, melted cheese, and mint chutney.',
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isPopular: true,
        inStock: true,
        prepTimeMinutes: 8,
        calories: 440
      },
      {
        id: 'item-chai-4',
        name: 'Mumbai Samosa Pav with Thecha',
        category: 'Desi Nashta & Breakfast',
        price: 90,
        description: 'Crispy aloo samosas in warm ladi pav with spicy garlic thecha and sweet tamarind chutney.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isPopular: true,
        inStock: true,
        prepTimeMinutes: 4,
        calories: 380
      }
    ]
  },
  'italian-bistro': {
    name: 'Italian Bistro & Pizzeria',
    tagline: 'Artisan Wood-Fired Pizza & Handmade Pasta',
    currencySymbol: '₹',
    tables: ['Bistro 1', 'Bistro 2', 'Bistro 3', 'Terrace 1', 'Terrace 2', 'Bar Counter'],
    logoUrl: '🍕',
    menu: [
      {
        id: 'item-it-1',
        name: 'Margherita Burrata Pizza',
        category: 'Wood-Fired Pizza',
        price: 380,
        description: 'San Marzano tomato sauce, fresh artisan burrata, extra virgin olive oil, and sweet Italian basil.',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isPopular: true,
        inStock: true,
        prepTimeMinutes: 12,
        calories: 680
      },
      {
        id: 'item-it-2',
        name: 'Truffle Mushroom Fettuccine',
        category: 'Handmade Pasta',
        price: 340,
        description: 'Fresh pasta ribbons tossed with wild forest mushrooms, black truffle butter, and aged parmesan.',
        image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isPopular: true,
        inStock: true,
        prepTimeMinutes: 10,
        calories: 520
      },
      {
        id: 'item-it-3',
        name: 'Double Espresso Romano',
        category: 'Specialty Coffee',
        price: 140,
        description: 'Rich dark crema espresso pulled over a fresh twist of Sicilian lemon peel.',
        image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isPopular: false,
        inStock: true,
        prepTimeMinutes: 3,
        calories: 10
      }
    ]
  },
  'burger-brew': {
    name: 'Gourmet Burger & Brews',
    tagline: 'Gourmet Smashed Burgers, Loaded Fries & Shakes',
    currencySymbol: '₹',
    tables: ['Booth 1', 'Booth 2', 'Booth 3', 'Table 1', 'Table 2', 'Patio 1'],
    logoUrl: '🍔',
    menu: [
      {
        id: 'item-bg-1',
        name: 'Truffle Smash Cheese Burger',
        category: 'Gourmet Burgers',
        price: 260,
        description: 'Double smashed crispy patties, double cheddar cheese, grilled onions, and truffle aioli on toasted brioche.',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isPopular: true,
        inStock: true,
        prepTimeMinutes: 8,
        calories: 720
      },
      {
        id: 'item-bg-2',
        name: 'Loaded Animal-Style Fries',
        category: 'Sides & Fries',
        price: 180,
        description: 'Golden fries smothered in cheddar cheese sauce, caramelized onions, and signature secret relish.',
        image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isPopular: true,
        inStock: true,
        prepTimeMinutes: 5,
        calories: 480
      },
      {
        id: 'item-bg-3',
        name: 'Salted Caramel Pretzel Shake',
        category: 'Thick Shakes',
        price: 190,
        description: 'Vanilla bean gelato blended with rich salted butter caramel, topped with whipped cream and crushed pretzels.',
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isPopular: true,
        inStock: true,
        prepTimeMinutes: 4,
        calories: 490
      }
    ]
  },
  'bakery-cafe': {
    name: 'Artisan Bakery & Roastery',
    tagline: 'Handmade Sourdough, Viennoiserie & Pour-Overs',
    currencySymbol: '₹',
    tables: ['Window 1', 'Window 2', 'Table 1', 'Table 2', 'Courtyard 1'],
    logoUrl: '🥐',
    menu: [
      {
        id: 'item-bk-1',
        name: 'Butter Flaky Almond Croissant',
        category: 'French Viennoiserie',
        price: 170,
        description: 'Twice-baked French butter croissant filled with frangipane almond cream and toasted almond flakes.',
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isPopular: true,
        inStock: true,
        prepTimeMinutes: 2,
        calories: 360
      },
      {
        id: 'item-bk-2',
        name: 'Cold Drip Ethiopian Yirgacheffe',
        category: 'Pour-Over & Single Origin',
        price: 210,
        description: '12-hour slow cold drip with tasting notes of bergamot, jasmine florals, and wild blueberry.',
        image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isPopular: true,
        inStock: true,
        prepTimeMinutes: 3,
        calories: 5
      }
    ]
  },
  'south-tiffin': {
    name: 'Traditional South Tiffin House',
    tagline: 'Pure Ghee Podi Roast, Steamed Idlis & Kaapi',
    currencySymbol: '₹',
    tables: ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Family 1', 'Family 2'],
    logoUrl: '🥥',
    menu: [
      {
        id: 'item-st-1',
        name: 'Ghee Podi Crispy Roast Dosa',
        category: 'Traditional Dosas',
        price: 130,
        description: 'Golden paper-thin dosa smeared with fragrant Gunpowder podi masala and melted pure cow ghee.',
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isJainAvailable: true,
        isPopular: true,
        inStock: true,
        prepTimeMinutes: 5,
        calories: 340
      },
      {
        id: 'item-st-2',
        name: 'Melt-in-Mouth Ghee Button Idlis',
        category: 'Steamed Tiffin',
        price: 100,
        description: '14 mini button idlis swimming in piping hot aromatic Madras sambar with pure ghee drizzle.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isJainAvailable: true,
        isPopular: true,
        inStock: true,
        prepTimeMinutes: 3,
        calories: 220
      }
    ]
  },
  'asian-boba': {
    name: 'Pan-Asian Dim Sum & Boba House',
    tagline: 'Crystal Dim Sum, Fluffy Baos & Brown Sugar Boba',
    currencySymbol: '₹',
    tables: ['Lounge 1', 'Lounge 2', 'Table 1', 'Table 2', 'Garden 1'],
    logoUrl: '🥟',
    menu: [
      {
        id: 'item-as-1',
        name: 'Edamame Truffle Crystal Dim Sum',
        category: 'Artisan Dim Sum',
        price: 320,
        description: 'Translucent steamed dumplings stuffed with Japanese edamame beans and aromatic white truffle oil.',
        image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isPopular: true,
        inStock: true,
        prepTimeMinutes: 8,
        calories: 190
      },
      {
        id: 'item-as-2',
        name: 'Tiger Brown Sugar Fresh Milk Boba',
        category: 'Signature Boba Tea',
        price: 220,
        description: 'Chewy warm Taiwan tapioca pearls flamed in muscovado brown sugar with chilled organic fresh milk.',
        image: 'https://images.unsplash.com/photo-1558857563-b37fe435e003?auto=format&fit=crop&w=600&q=80',
        isVeg: true,
        isPopular: true,
        inStock: true,
        prepTimeMinutes: 4,
        calories: 330
      }
    ]
  }
};

const DEFAULT_8_CAFES = [
  {
    id: 'chai-charcha',
    slug: 'chai-charcha',
    name: 'Chai & Charcha Craft Cafe',
    city: 'Mumbai - Bandra West',
    tagline: 'Specialty Teas, Filter Kaapi & Desi Gourmet',
    logoUrl: '☕',
    currencySymbol: '₹',
    address: 'Plot 14, Linking Road, Bandra West, Mumbai',
    phone: '+91 98201 54321',
    template: 'chai-cafe',
    ownerEmail: 'owner@chaicharcha.com',
    status: 'active',
    plan: 'Premium Pro',
    monthlySales: 184500
  },
  {
    id: 'urban-bistro',
    slug: 'urban-bistro',
    name: 'Urban Bistro & Pizzeria',
    city: 'Bangalore - Indiranagar',
    tagline: 'Artisan Wood-Fired Pizza & Handmade Pasta',
    logoUrl: '🍕',
    currencySymbol: '₹',
    address: 'Shop 4, Indiranagar 100ft Road, Bangalore',
    phone: '+91 98450 12345',
    template: 'italian-bistro',
    ownerEmail: 'owner@urbanbistro.com',
    status: 'active',
    plan: 'Enterprise',
    monthlySales: 242000
  },
  {
    id: 'delhi-burger-shack',
    slug: 'delhi-burger-shack',
    name: 'Delhi Burger & Brew Shack',
    city: 'Delhi - Connaught Place',
    tagline: 'Gourmet Smashed Burgers, Loaded Fries & Shakes',
    logoUrl: '🍔',
    currencySymbol: '₹',
    address: 'Block B, Inner Circle, Connaught Place, New Delhi',
    phone: '+91 98110 44556',
    template: 'burger-brew',
    ownerEmail: 'owner@delhiburger.com',
    status: 'active',
    plan: 'Premium Pro',
    monthlySales: 168000
  },
  {
    id: 'french-press-roastery',
    slug: 'french-press-roastery',
    name: 'The French Press Roastery & Bakery',
    city: 'Pune - Koregaon Park',
    tagline: 'Handmade Sourdough, Viennoiserie & Pour-Overs',
    logoUrl: '🥐',
    currencySymbol: '₹',
    address: 'Lane 7, North Main Road, Koregaon Park, Pune',
    phone: '+91 98230 77889',
    template: 'bakery-cafe',
    ownerEmail: 'owner@frenchpress.com',
    status: 'active',
    plan: 'Standard',
    monthlySales: 139000
  },
  {
    id: 'mylapore-tiffin',
    slug: 'mylapore-tiffin',
    name: 'Mylapore Tiffin & Filter Kaapi',
    city: 'Chennai - Mylapore',
    tagline: 'Pure Ghee Podi Roast, Steamed Idlis & Kaapi',
    logoUrl: '🥥',
    currencySymbol: '₹',
    address: 'North Mada Street, Near Kapaleeshwarar Temple, Chennai',
    phone: '+91 98400 33221',
    template: 'south-tiffin',
    ownerEmail: 'owner@mylaporetiffin.com',
    status: 'active',
    plan: 'Premium Pro',
    monthlySales: 195000
  },
  {
    id: 'himalayan-pine',
    slug: 'himalayan-pine',
    name: 'The Himalayan Pine Cafe',
    city: 'Shimla - The Mall',
    tagline: 'Mountain Hot Chocolate, Fresh Bakes & Warm Soups',
    logoUrl: '🍫',
    currencySymbol: '₹',
    address: 'Near Ridge Heritage Church, Mall Road, Shimla',
    phone: '+91 98160 88990',
    template: 'chai-cafe',
    ownerEmail: 'owner@himalayanpine.com',
    status: 'active',
    plan: 'Standard',
    monthlySales: 94000
  },
  {
    id: 'spice-route-bistro',
    slug: 'spice-route-bistro',
    name: 'Spice Route Dim Sum & Boba House',
    city: 'Hyderabad - Jubilee Hills',
    tagline: 'Crystal Dim Sum, Fluffy Baos & Brown Sugar Boba',
    logoUrl: '🥟',
    currencySymbol: '₹',
    address: 'Road No. 36, Jubilee Hills, Hyderabad',
    phone: '+91 98490 66778',
    template: 'asian-boba',
    ownerEmail: 'owner@spiceroute.com',
    status: 'active',
    plan: 'Enterprise',
    monthlySales: 215000
  },
  {
    id: 'sunset-deck-goa',
    slug: 'sunset-deck-goa',
    name: 'Sunset Deck Beach Shack & Cafe',
    city: 'Goa - Anjuna Beach',
    tagline: 'Smoothie Bowls, Artisanal Cold Brews & Sunset Coolers',
    logoUrl: '🏖️',
    currencySymbol: '₹',
    address: 'South Anjuna Cliff Top, Anjuna, Goa',
    phone: '+91 98221 44332',
    template: 'burger-brew',
    ownerEmail: 'owner@sunsetdeck.com',
    status: 'active',
    plan: 'Premium Pro',
    monthlySales: 154000
  }
];

class CafeStore {
  constructor() {
    this.registry = this.loadRegistry();
  }

  loadRegistry() {
    if (fs.existsSync(REGISTRY_PATH)) {
      try {
        const data = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
        if (data && data.length >= 8) {
          return data;
        }
      } catch (e) {
        console.error('Error loading registry:', e);
      }
    }

    // Seed the 8 cafes
    this.saveRegistry(DEFAULT_8_CAFES);
    DEFAULT_8_CAFES.forEach(cafe => {
      this.initCafeFile(cafe);
    });
    return DEFAULT_8_CAFES;
  }

  saveRegistry(registry) {
    this.registry = registry;
    try {
      fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf8');
    } catch (e) {}
  }

  initCafeFile(meta) {
    const filePath = path.join(CAFES_DIR, `${meta.slug}.json`);
    if (fs.existsSync(filePath)) return;

    if (meta.slug === 'chai-charcha' && fs.existsSync(LEGACY_STORE_PATH)) {
      try {
        const legacy = JSON.parse(fs.readFileSync(LEGACY_STORE_PATH, 'utf8'));
        fs.writeFileSync(filePath, JSON.stringify(legacy, null, 2), 'utf8');
        return;
      } catch {}
    }

    const tmplKey = meta.template || 'chai-cafe';
    const tmpl = TEMPLATES[tmplKey] || TEMPLATES['chai-cafe'];

    const cafeData = {
      config: {
        id: meta.slug,
        name: meta.name,
        tagline: meta.tagline || tmpl.tagline,
        currencySymbol: meta.currencySymbol || tmpl.currencySymbol,
        taxRatePercent: 5,
        cgstPercent: 2.5,
        sgstPercent: 2.5,
        address: meta.address,
        phone: meta.phone,
        wifiName: `${meta.slug.replace(/-/g, '')}_Guest`,
        wifiPassword: 'welcomeguest',
        ownerPin: '1234',
        staffPin: '0000',
        fssaiNumber: '11523019000842',
        gstin: '27AABCT1332L1ZV',
        tables: tmpl.tables,
        logoUrl: meta.logoUrl || tmpl.logoUrl
      },
      menu: tmpl.menu.map((m, i) => ({ ...m, id: `${meta.slug}-item-${i + 1}` })),
      orders: [
        {
          id: `ord-${meta.slug}-1`,
          orderNumber: 301,
          tableNumber: tmpl.tables[0],
          items: [
            {
              cartItemId: 'c1',
              menuItemId: `${meta.slug}-item-1`,
              name: tmpl.menu[0].name,
              image: tmpl.menu[0].image,
              quantity: 2,
              unitPrice: tmpl.menu[0].price
            }
          ],
          subtotal: tmpl.menu[0].price * 2,
          cgstAmount: Math.round(tmpl.menu[0].price * 2 * 0.025),
          sgstAmount: Math.round(tmpl.menu[0].price * 2 * 0.025),
          taxAmount: Math.round(tmpl.menu[0].price * 2 * 0.05),
          totalAmount: Math.round(tmpl.menu[0].price * 2 * 1.05),
          status: 'preparing',
          paymentStatus: 'pending',
          customerName: 'Rahul Verma',
          createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        }
      ],
      reservations: [],
      waiterCalls: []
    };

    fs.writeFileSync(filePath, JSON.stringify(cafeData, null, 2), 'utf8');
  }

  getCafePath(slug) {
    return path.join(CAFES_DIR, `${slug}.json`);
  }

  getCafe(slug) {
    if (!slug) slug = 'chai-charcha';
    if (memoryCache.has(slug)) {
      return memoryCache.get(slug);
    }

    const filePath = this.getCafePath(slug);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (data.config) {
          if (!data.config.currencySymbol || data.config.currencySymbol === '?') {
            data.config.currencySymbol = '₹';
          }
          const foundMeta = this.registry.find(c => c.slug === slug || c.id === slug);
          if (foundMeta) {
            data.config.status = foundMeta.status || 'active';
            data.config.plan = foundMeta.plan || 'Premium Pro';
          }
        }
        memoryCache.set(slug, data);
        return data;
      } catch (e) {
        console.error(`Error reading ${slug}.json:`, e);
      }
    }

    const foundMeta = this.registry.find(c => c.slug === slug || c.id === slug);
    if (foundMeta) {
      this.initCafeFile(foundMeta);
      return this.getCafe(slug);
    }

    return this.getCafe('chai-charcha');
  }

  saveCafe(slug, data) {
    memoryCache.set(slug, data);
    try {
      const filePath = this.getCafePath(slug);
      const tmpPath = filePath + '.tmp';
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tmpPath, filePath);
    } catch (e) {}
  }

  getAllCafes() {
    return this.registry;
  }

  createCafe({ name, slug, tagline, phone, address, currencySymbol, template = 'chai-cafe', logoUrl, ownerEmail }) {
    if (!slug) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    
    if (this.registry.some(c => c.slug === slug)) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const tmpl = TEMPLATES[template] || TEMPLATES['chai-cafe'];
    const newMeta = {
      id: slug,
      slug,
      name,
      city: address ? address.split(',')[0] : 'Commercial District',
      tagline: tagline || tmpl.tagline,
      logoUrl: logoUrl || tmpl.logoUrl,
      currencySymbol: currencySymbol || tmpl.currencySymbol,
      address: address || 'Main High Street Boulevard',
      phone: phone || '+91 98000 00000',
      template,
      ownerEmail: ownerEmail || `owner@${slug}.com`,
      status: 'active',
      plan: 'Premium Pro',
      monthlySales: 0,
      createdAt: new Date().toISOString()
    };

    this.registry.push(newMeta);
    this.saveRegistry(this.registry);
    this.initCafeFile(newMeta);
    return { meta: newMeta, data: this.getCafe(slug) };
  }

  toggleCafeStatus(slug, status) {
    this.registry = this.registry.map(c => c.slug === slug ? { ...c, status } : c);
    this.saveRegistry(this.registry);

    const cafeData = this.getCafe(slug);
    if (cafeData && cafeData.config) {
      cafeData.config.status = status;
      this.saveCafe(slug, cafeData);
    }
    return this.registry.find(c => c.slug === slug);
  }
}

export const cafeStore = new CafeStore();
