/**
 * Server-Side Authentication & Request Validation Service
 * Enforces strict input schema, data typing, length constraints,
 * RFC email validation, and protection against injection/DoS payloads.
 */

// RFC 5322 compliant email regex for strict server-side validation
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// System usernames allowed for admin/demo backwards compatibility
const ALLOWED_SYSTEM_USERNAMES = new Set([
  'admin@cafesaas.com',
  'owner@chaicharcha.com',
  'owner@urbanbistro.com',
  'owner@delhiburger.com',
  'owner@frenchpress.com',
  'owner@mylaporetiffin.com',
  'owner@himalayanpine.com',
  'owner@spiceroute.com',
  'owner@sunsetdeck.com'
]);

/**
 * Validates and sanitizes login input payload.
 *
 * @param {any} body - Incoming req.body
 * @returns {{ valid: boolean, error?: string, sanitized?: { email: string, password: string } }}
 */
export function validateLoginInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      valid: false,
      error: 'Invalid request body. JSON object expected.'
    };
  }

  const { email, password } = body;

  // 1. Email validation
  if (typeof email !== 'string') {
    return {
      valid: false,
      error: 'Email must be a valid string.'
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  if (cleanEmail.length === 0) {
    return {
      valid: false,
      error: 'Email is required.'
    };
  }

  // RFC 5321 length limit: max 254 chars; minimum 3 chars (e.g. a@b)
  if (cleanEmail.length < 3 || cleanEmail.length > 254) {
    return {
      valid: false,
      error: 'Email length must be between 3 and 254 characters.'
    };
  }

  // Check for dangerous control characters, null bytes, or script tags
  if (/[\x00-\x1F\x7F<>]/.test(cleanEmail)) {
    return {
      valid: false,
      error: 'Email contains illegal or potentially malicious characters.'
    };
  }

  // Validate format
  if (!EMAIL_REGEX.test(cleanEmail) && !ALLOWED_SYSTEM_USERNAMES.has(cleanEmail)) {
    return {
      valid: false,
      error: 'Please enter a valid email address (e.g., name@domain.com).'
    };
  }

  // 2. Password validation
  if (typeof password !== 'string') {
    return {
      valid: false,
      error: 'Password must be a valid string.'
    };
  }

  if (password.length === 0) {
    return {
      valid: false,
      error: 'Password is required.'
    };
  }

  // Enforce minimum 6 characters to prevent trivial attacks
  if (password.length < 6) {
    return {
      valid: false,
      error: 'Password must be at least 6 characters long.'
    };
  }

  // Enforce maximum 128 characters to protect against hashing CPU starvation (DoS)
  if (password.length > 128) {
    return {
      valid: false,
      error: 'Password exceeds maximum allowed length of 128 characters.'
    };
  }

  // Reject null bytes in password
  if (password.includes('\0')) {
    return {
      valid: false,
      error: 'Password contains illegal characters.'
    };
  }

  return {
    valid: true,
    sanitized: {
      email: cleanEmail,
      password: password
    }
  };
}

/**
 * Validates user/account creation input payload.
 *
 * @param {any} body - Incoming account data
 * @returns {{ valid: boolean, error?: string, sanitized?: any }}
 */
export function validateCreateAccountInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, error: 'Invalid request body.' };
  }

  const { name, email, password, role = 'owner', cafeId, cafeName } = body;

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return { valid: false, error: 'Name must be between 2 and 100 characters.' };
  }

  const loginCheck = validateLoginInput({ email, password });
  if (!loginCheck.valid) {
    return loginCheck;
  }

  const validRoles = ['superadmin', 'owner', 'staff'];
  if (!validRoles.includes(role)) {
    return { valid: false, error: `Role must be one of: ${validRoles.join(', ')}.` };
  }

  return {
    valid: true,
    sanitized: {
      name: name.trim().replace(/[<>]/g, ''),
      email: loginCheck.sanitized.email,
      password: loginCheck.sanitized.password,
      role,
      cafeId: typeof cafeId === 'string' ? cafeId.trim() : null,
      cafeName: typeof cafeName === 'string' ? cafeName.trim() : null
    }
  };
}
