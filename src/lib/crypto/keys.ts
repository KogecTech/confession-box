// ============================================================
// Confession Box — Key Management
//
// Strategy: We derive an AES-GCM key (not AES-KW) from the user's
// password via PBKDF2. We then manually export the RSA private key
// as PKCS#8 bytes and encrypt those bytes with AES-GCM.
//
// Why not AES-KW + wrapKey()?
//   wrapKey('pkcs8', key, aesKwKey, {name:'AES-KW'}) throws
//   "Data provided to an operation does not meet requirements"
//   in Firefox and some Chrome versions when the RSA key usages
//   don't satisfy the internal wrap policy. AES-GCM encrypt/decrypt
//   on the raw exported bytes is fully cross-browser compatible.
// ============================================================

import { arrayBufferToBase64, base64ToArrayBuffer } from '../utils/base64';

// ── RSA-OAEP keypair ─────────────────────────────────────────

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,  // must be extractable so we can export pkcs8 bytes below
    ['encrypt', 'decrypt'],
  );
}

export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const spki = await window.crypto.subtle.exportKey('spki', publicKey);
  return arrayBufferToBase64(spki);
}

export async function importPublicKey(base64PublicKey: string): Promise<CryptoKey> {
  const spki = base64ToArrayBuffer(base64PublicKey);
  return window.crypto.subtle.importKey(
    'spki',
    spki,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt'],
  );
}

// ── Salt ─────────────────────────────────────────────────────

export function generateSalt(): string {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  return arrayBufferToBase64(salt);
}

// ── PBKDF2 → AES-GCM wrapping key ───────────────────────────
// Derives a 256-bit AES-GCM key from password + salt.
// AES-GCM (not AES-KW) so we can encrypt raw bytes without wrapKey().

export async function deriveWrappingKey(
  password: string,
  base64Salt: string,
): Promise<CryptoKey> {
  const enc = new TextEncoder();

  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: base64ToArrayBuffer(base64Salt),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

// ── Private key wrap (encrypt) ───────────────────────────────
// Export RSA private key as PKCS#8 bytes, then AES-GCM encrypt them.
// Output format: base64( [12-byte IV] + [AES-GCM ciphertext] )

export async function wrapPrivateKey(
  privateKey: CryptoKey,
  wrappingKey: CryptoKey,
): Promise<string> {
  const pkcs8 = await window.crypto.subtle.exportKey('pkcs8', privateKey);

  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    wrappingKey,
    pkcs8,
  );

  const combined = new Uint8Array(12 + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), 12);

  return arrayBufferToBase64(combined);
}

// ── Private key unwrap (decrypt) ─────────────────────────────

export async function unwrapPrivateKey(
  base64WrappedKey: string,
  wrappingKey: CryptoKey,
): Promise<CryptoKey> {
  const combined = new Uint8Array(base64ToArrayBuffer(base64WrappedKey));

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const pkcs8 = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    wrappingKey,
    ciphertext,
  );

  return window.crypto.subtle.importKey(
    'pkcs8',
    pkcs8,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt'],
  );
}