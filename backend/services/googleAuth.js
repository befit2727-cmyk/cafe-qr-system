import crypto from 'crypto';
import fetch from 'node-fetch';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(state = '') {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state: state || crypto.randomBytes(16).toString('hex'),
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code) {
  const params = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

/**
 * Verify Google ID token and extract user info
 */
export async function verifyGoogleIdToken(idToken) {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  
  if (!response.ok) {
    throw new Error('Invalid ID token');
  }

  const payload = await response.json();
  
  // Verify the token is for our client
  if (payload.aud !== GOOGLE_CLIENT_ID) {
    throw new Error('Token audience mismatch');
  }

  // Verify token hasn't expired
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    throw new Error('Token expired');
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    emailVerified: payload.email_verified === 'true',
  };
}

/**
 * Generate secure random state for CSRF protection
 */
export function generateState() {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Verify state parameter (CSRF protection)
 */
export function verifyState(receivedState, storedState) {
  if (!receivedState || !storedState) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedState),
      Buffer.from(storedState)
    );
  } catch {
    return false;
  }
}