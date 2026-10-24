import * as Crypto from 'expo-crypto';

/**
 * Password hashing with expo-crypto.
 *
 * Limitation (documented on purpose): Expo Go has no native bcrypt/scrypt/PBKDF2, so this uses a
 * salted, iterated SHA-256 chain (a simple key-stretching scheme). It never stores the password and
 * makes every hash unique per user, but it is weaker than bcrypt/argon2. That is acceptable here
 * because the database lives only on the user's own phone. The stored value is prefixed with the
 * scheme version ("v1$") so a stronger scheme can be introduced later without breaking old accounts.
 */
const SCHEME = 'v1';
const ITERATIONS = 600; // expo-crypto digests are async native calls; keep login responsive.

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

const sha256 = (input: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);

/** 16 random bytes (hex) from the platform CSPRNG. */
export function generateSalt(): string {
  return toHex(Crypto.getRandomBytes(16));
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  let digest = await sha256(`${salt}:${password}`);
  for (let i = 0; i < ITERATIONS; i++) {
    digest = await sha256(`${digest}${salt}${password}`);
  }
  return `${SCHEME}$${digest}`;
}

/** Constant-time comparison so response time does not reveal how many characters matched. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyPassword(
  password: string,
  salt: string,
  storedHash: string,
): Promise<boolean> {
  return safeEqual(await hashPassword(password, salt), storedHash);
}
