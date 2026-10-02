import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const ACCOUNTS_PATH = path.join(DATA_DIR, 'accounts.json');

const SECRET_KEY = process.env.SAAS_JWT_SECRET || 'antigravity_cafe_saas_ultra_secret_key_2026';

// Precomputed constant dummy salt and hash for timing-attack mitigation (prevents user enumeration via response timing)
const DUMMY_SALT = '0123456789abcdef0123456789abcdef';
const DUMMY_HASH = crypto.scryptSync('dummy_timing_defense_constant_secret_string', DUMMY_SALT, 64).toString('hex');

function hashPassword(password, salt) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') return false;

  // Transparently handle legacy plain password migration safely
  if (!stored.includes(':')) {
    try {
      const bufA = Buffer.from(crypto.createHash('sha256').update(password).digest('hex'));
      const bufB = Buffer.from(crypto.createHash('sha256').update(stored).digest('hex'));
      return crypto.timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }

  const [salt, originalHash] = stored.split(':');
  if (!salt || !originalHash) return false;

  try {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const bufA = Buffer.from(hash, 'hex');
    const bufB = Buffer.from(originalHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(`${header}.${body}`).digest('base64url');
  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

class AuthStore {
  constructor() {
    this.accounts = this.loadAccounts();
  }

  loadAccounts() {
    if (fs.existsSync(ACCOUNTS_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(ACCOUNTS_PATH, 'utf8'));
      } catch (e) {
        console.error('Error reading accounts.json:', e);
      }
    }

    // Default Seed Accounts: 1 Super Admin + 8 Cafe Owners
    const defaultAccounts = [
      {
        id: 'usr-admin-1',
        name: 'Platform Administrator (Vendor)',
        email: 'admin@cafesaas.com',
        password: hashPassword('admin123'),
        role: 'superadmin',
        cafeId: null,
        cafeName: 'All Cafes (Platform Master)',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-owner-1',
        name: 'Aarav Sharma (Owner)',
        email: 'owner@chaicharcha.com',
        password: hashPassword('chai123'),
        role: 'owner',
        cafeId: 'chai-charcha',
        cafeName: 'Chai & Charcha Craft Cafe',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-owner-2',
        name: 'Matteo Rossi & Priya (Owner)',
        email: 'owner@urbanbistro.com',
        password: hashPassword('bistro123'),
        role: 'owner',
        cafeId: 'urban-bistro',
        cafeName: 'Urban Bistro & Pizzeria',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-owner-3',
        name: 'Kabir Malhotra (Owner)',
        email: 'owner@delhiburger.com',
        password: hashPassword('burger123'),
        role: 'owner',
        cafeId: 'delhi-burger-shack',
        cafeName: 'Delhi Burger & Brew Shack',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-owner-4',
        name: 'Ananya Deshmukh (Owner)',
        email: 'owner@frenchpress.com',
        password: hashPassword('coffee123'),
        role: 'owner',
        cafeId: 'french-press-roastery',
        cafeName: 'The French Press Roastery',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-owner-5',
        name: 'S. Ramanathan (Owner)',
        email: 'owner@mylaporetiffin.com',
        password: hashPassword('kaapi123'),
        role: 'owner',
        cafeId: 'mylapore-tiffin',
        cafeName: 'Mylapore Tiffin & Filter Kaapi',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-owner-6',
        name: 'Tenzin & Sunita (Owner)',
        email: 'owner@himalayanpine.com',
        password: hashPassword('pine123'),
        role: 'owner',
        cafeId: 'himalayan-pine',
        cafeName: 'The Himalayan Pine Cafe',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-owner-7',
        name: 'Rohan Varma (Owner)',
        email: 'owner@spiceroute.com',
        password: hashPassword('dimsum123'),
        role: 'owner',
        cafeId: 'spice-route-bistro',
        cafeName: 'Spice Route Dim Sum House',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-owner-8',
        name: 'Zack & Maya (Owner)',
        email: 'owner@sunsetdeck.com',
        password: hashPassword('sunset123'),
        role: 'owner',
        cafeId: 'sunset-deck-goa',
        cafeName: 'Sunset Deck Beach Shack',
        createdAt: new Date().toISOString()
      }
    ];

    this.saveAccounts(defaultAccounts);
    return defaultAccounts;
  }

  saveAccounts(accounts) {
    this.accounts = accounts;
    try {
      const dir = path.dirname(ACCOUNTS_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(ACCOUNTS_PATH, JSON.stringify(accounts, null, 2), 'utf8');
    } catch (e) {
      console.warn("Notice: Account file write skipped in read-only environment:", e.message);
    }
  }

  authenticate(email, password) {
    const rawEmail = (email || '').toLowerCase().trim();
    // Normalize aliases
    const cleanEmail = rawEmail === 'owner@chai-charcha.com' ? 'owner@chaicharcha.com' : rawEmail;
    let user = this.accounts.find(a => a.email.toLowerCase() === cleanEmail);

    if (!user) {
      if (cleanEmail === 'admin' || cleanEmail === 'superadmin') {
        user = this.accounts.find(a => a.role === 'superadmin');
      } else if (cleanEmail.startsWith('owner')) {
        user = this.accounts.find(a => a.role === 'owner');
      }
    }

    if (!user) {
      verifyPassword(password, `${DUMMY_SALT}:${DUMMY_HASH}`);
      return null;
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return null;
    }

    // Auto-migrate legacy unhashed passwords to salt:scrypt format
    if (!user.password.includes(':')) {
      user.password = hashPassword(password);
      this.saveAccounts(this.accounts);
    }

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      cafeId: user.cafeId,
      cafeName: user.cafeName
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cafeId: user.cafeId,
        cafeName: user.cafeName
      }
    };
  }

  createAccount({ name, email, password, role = 'owner', cafeId, cafeName }) {
    const cleanEmail = email.toLowerCase().trim();
    if (this.accounts.some(a => a.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email: cleanEmail,
      password: hashPassword(password),
      role,
      cafeId,
      cafeName,
      createdAt: new Date().toISOString()
    };

    this.accounts.push(newUser);
    this.saveAccounts(this.accounts);
    return newUser;
  }

  getAllAccounts() {
    return this.accounts.map(({ password, ...rest }) => rest);
  }
}

export const authStore = new AuthStore();
export { verifyToken, signToken };
