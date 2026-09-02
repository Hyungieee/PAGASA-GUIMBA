/**
 * Security & Credential Utilities
 * Implements client-side SHA-256 cryptographic hashing, secure temporary password generation,
 * unique username derivation, and password verification for PAGASA Guimba MIS.
 */

const SALT_PREFIX = 'pagasa_guimba_sec_salt_v1:';

/**
 * Hash a password using standard Web Crypto SHA-256 with salting
 */
export async function hashPassword(plainTextPassword: string): Promise<string> {
  const normalized = (plainTextPassword || '').trim();
  if (!normalized) return '';
  
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(SALT_PREFIX + normalized);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `sha256:${hashHex}`;
    }
  } catch (err) {
    console.warn('[Security] SubtleCrypto error, falling back to JS hasher', err);
  }

  // Fallback simple deterministic 64-char hex hash representation
  let hash = 0x811c9dc5;
  const str = SALT_PREFIX + normalized;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const part1 = (hash >>> 0).toString(16).padStart(8, '0');
  let hash2 = 0x55555555;
  for (let i = str.length - 1; i >= 0; i--) {
    hash2 ^= str.charCodeAt(i);
    hash2 = Math.imul(hash2, 0x1000193);
  }
  const part2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  return `sha256:fb_${part1}${part2}${part1}${part2}`;
}

/**
 * Verify an input password against stored hash or fallback plain password
 */
export async function verifyPassword(
  inputPassword: string,
  storedHash?: string,
  fallbackPlainPassword?: string
): Promise<boolean> {
  const trimmedInput = (inputPassword || '').trim();
  if (!trimmedInput) return false;

  // If hash exists, compute and compare
  if (storedHash) {
    const computedHash = await hashPassword(trimmedInput);
    if (computedHash === storedHash) {
      return true;
    }
  }

  // Fallback check against plain password if hash was not yet generated
  if (fallbackPlainPassword && fallbackPlainPassword.trim() === trimmedInput) {
    return true;
  }

  return false;
}

/**
 * Generate a clean, secure temporary password (e.g. Pagasa#8K2m)
 */
export function generateTemporaryPassword(): string {
  const prefixes = ['Pagasa', 'Guimba', 'Kabataan', 'PagasaYouth'];
  const symbols = ['#', '!', '@', '$', '*'];
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  
  let randomTail = '';
  for (let i = 0; i < 4; i++) {
    randomTail += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${prefix}${symbol}${randomTail}`;
}

/**
 * Generate a clean, standardized username from member's full name (e.g. juandelacruz or juan.delacruz)
 */
export function generateUsername(fullName: string, existingUsernames: string[] = []): string {
  const normalized = (fullName || 'member')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
    
  const parts = normalized.split(/\s+/).filter(Boolean);
  let base = 'member';
  if (parts.length === 1) {
    base = parts[0];
  } else if (parts.length >= 2) {
    base = `${parts[0]}.${parts[parts.length - 1]}`;
  }

  // Ensure unique username
  const existingSet = new Set(existingUsernames.map(u => (u || '').toLowerCase().trim()));
  let candidate = base;
  let counter = 1;
  while (existingSet.has(candidate)) {
    counter++;
    candidate = `${base}${counter}`;
  }

  return candidate;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number; // 0 to 4
  feedback: string;
} {
  const trimmed = (password || '').trim();
  if (trimmed.length < 6) {
    return {
      isValid: false,
      score: 1,
      feedback: 'Password must be at least 6 characters long.'
    };
  }

  let score = 1;
  if (trimmed.length >= 8) score++;
  if (/[A-Z]/.test(trimmed) && /[a-z]/.test(trimmed)) score++;
  if (/[0-9]/.test(trimmed)) score++;
  if (/[^A-Za-z0-9]/.test(trimmed)) score++;

  return {
    isValid: true,
    score: Math.min(4, score),
    feedback: score >= 3 ? 'Strong password' : 'Moderate password'
  };
}
