// Google OAuth Routes for Backend
import { authStore, verifyToken } from './authStore.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(state = '') {
  const crypto = await import('crypto');
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
  
  if (payload.aud !== GOOGLE_CLIENT_ID) {
    throw new Error('Token audience mismatch');
  }

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
 * Handle Google ID token authentication (from frontend One Tap)
 */
export async function handleGoogleIdToken(req, res) {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: 'ID token required' });
    }

    const result = await authStore.authenticateWithGoogle(idToken);
    
    // Set secure HTTP-only cookie
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    res.json({ user: result.user });
  } catch (error) {
    console.error('Google ID token auth error:', error);
    res.status(401).json({ message: error.message || 'Google authentication failed' });
  }
}

/**
 * Handle Google OAuth callback (authorization code flow)
 */
export async function handleGoogleCallback(req, res) {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code required' });
    }

    const tokens = await exchangeCodeForTokens(code);
    const googleUser = await verifyGoogleIdToken(tokens.id_token);
    
    const result = await authStore.authenticateWithGoogle(tokens.id_token);
    
    // Set secure HTTP-only cookie
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    // Redirect to frontend with success
    res.redirect(`${FRONTEND_URL}/auth/success`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${FRONTEND_URL}/auth/error?message=${encodeURIComponent(error.message)}`);
  }
}

/**
 * Initiate Google OAuth flow
 */
export function initiateGoogleAuth(req, res) {
  const crypto = require('crypto');
  const state = crypto.randomBytes(32).toString('base64url');
  
  // Store state in session/cookie for CSRF protection
  res.cookie('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes
    path: '/'
  });

  const authUrl = getGoogleAuthUrl(state);
  res.redirect(authUrl);
}

/**
 * Get current session
 */
export function getSession(req, res) {
  const token = req.cookies?.auth_token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ user: null });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ user: null });
  }

  res.json({ user: payload });
}

/**
 * Sign out
 */
export function signOut(req, res) {
  res.clearCookie('auth_token', { path: '/' });
  res.clearCookie('google_oauth_state', { path: '/' });
  res.json({ success: true });
}