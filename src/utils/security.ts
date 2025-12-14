/**
 * Frontend Security Utilities
 * Provides client-side security measures against common attacks
 */

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize string input to prevent XSS attacks
 */
export const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return str;

  return str
    // Remove null bytes
    .replace(/\0/g, '')
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // Remove potential script injections
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    // Trim whitespace
    .trim();
};

/**
 * Sanitize string for safe display (decode safe entities)
 */
export const sanitizeForDisplay = (str: string): string => {
  if (typeof str !== 'string') return str;

  // First escape any raw HTML
  let safe = sanitizeString(str);

  // Then decode safe entities for display
  return safe
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"');
};

/**
 * Deep sanitize object properties
 */
export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item as Record<string, unknown>)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeString(key)] = sanitizeObject(value as Record<string, unknown>);
    }
    return sanitized as T;
  }

  return obj;
};

// ============================================================================
// INPUT VALIDATION
// ============================================================================

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (Indian)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate MongoDB ObjectId format
 */
export const isValidObjectId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  return /^[a-fA-F0-9]{24}$/.test(id);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// ============================================================================
// SUSPICIOUS INPUT DETECTION
// ============================================================================

/**
 * Patterns that indicate potential attacks
 */
const SUSPICIOUS_PATTERNS = [
  // SQL injection patterns
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i,
  // Path traversal
  /\.\.\//,
  // Script injection
  /<script/i,
  // MongoDB operators in user input
  /\$where|\$eval|\$function/i,
];

/**
 * Check if input contains suspicious patterns
 */
export const isSuspiciousInput = (input: string): boolean => {
  if (typeof input !== 'string') return false;

  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(input));
};

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Securely store authentication token
 */
export const storeToken = (token: string): void => {
  try {
    localStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

/**
 * Get stored token
 */
export const getToken = (): string | null => {
  try {
    return localStorage.getItem('authToken');
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
};

/**
 * Remove stored token (logout)
 */
export const removeToken = (): void => {
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedBranch');
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true; // If we can't parse, assume expired
  }
};

// ============================================================================
// RATE LIMITING (Client-side)
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Client-side rate limiting for actions
 */
export const checkRateLimit = (
  action: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetIn: number } => {
  const now = Date.now();
  const record = rateLimitMap.get(action);

  if (!record || now > record.resetTime) {
    // Create new record
    rateLimitMap.set(action, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetIn: windowMs };
  }

  if (record.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetTime - now
    };
  }

  // Increment count
  record.count++;
  return {
    allowed: true,
    remaining: maxAttempts - record.count,
    resetIn: record.resetTime - now
  };
};

// ============================================================================
// SECURE FORM DATA
// ============================================================================

/**
 * Prepare form data with sanitization
 */
export const prepareSecureFormData = <T extends Record<string, unknown>>(
  data: T,
  allowedFields?: string[]
): T => {
  // Filter to allowed fields if specified
  let filtered = data;
  if (allowedFields) {
    filtered = {} as T;
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        (filtered as Record<string, unknown>)[field] = data[field];
      }
    }
  }

  // Check for suspicious input
  for (const [key, value] of Object.entries(filtered)) {
    if (typeof value === 'string' && isSuspiciousInput(value)) {
      console.warn(`Suspicious input detected in field: ${key}`);
    }
  }

  // Sanitize and return
  return sanitizeObject(filtered);
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  sanitizeString,
  sanitizeForDisplay,
  sanitizeObject,
  isValidEmail,
  isValidPhone,
  isValidObjectId,
  validatePassword,
  isSuspiciousInput,
  storeToken,
  getToken,
  removeToken,
  isTokenExpired,
  checkRateLimit,
  prepareSecureFormData,
};
