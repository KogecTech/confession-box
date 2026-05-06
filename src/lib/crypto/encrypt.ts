// ============================================================
// Confession Box — Message Encryption
//
// Hybrid encryption flow:
//   1. Generate a fresh random AES-GCM 256-bit key for this message
//   2. Generate a random 96-bit IV (initialization vector)
//   3. Encrypt the plaintext with AES-GCM → ciphertext
//   4. Encrypt the AES key with the RECIPIENT's RSA public key → encryptedKey
//   5. Encrypt the AES key with OUR OWN RSA public key → encryptedKeyForSelf
//      (so we can decrypt our own sent messages in history)
//
// The server only ever sees the encrypted blobs — never the AES key or plaintext.
// ============================================================

import { arrayBufferToBase64 } from '../utils/base64';
import { importPublicKey } from './keys';
import type { MessagePayload } from '../../types';

export async function encryptMessage(
  plaintext: string,
  recipientPublicKeyBase64: string,
  ownPublicKeyBase64: string,
): Promise<MessagePayload> {
  const enc = new TextEncoder();

  // Step 1: Generate a fresh AES-GCM key for this message only
  const aesKey = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // must be extractable so we can wrap it with RSA
    ['encrypt', 'decrypt'],
  );

  // Step 2: Generate a random 96-bit IV (12 bytes — standard for AES-GCM)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Step 3: Encrypt the plaintext with AES-GCM
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    enc.encode(plaintext),
  );

  // Step 4: Export the raw AES key bytes so we can encrypt them with RSA
  const rawAesKey = await window.crypto.subtle.exportKey('raw', aesKey);

  // Step 5: Import recipient's public key and encrypt the AES key for them
  const recipientPublicKey = await importPublicKey(recipientPublicKeyBase64);
  const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    recipientPublicKey,
    rawAesKey,
  );

  // Step 6: Import our own public key and encrypt the AES key for ourselves
  const ownPublicKey = await importPublicKey(ownPublicKeyBase64);
  const encryptedKeyForSelfBuffer = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    ownPublicKey,
    rawAesKey,
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertextBuffer),
    iv: arrayBufferToBase64(iv.buffer),
    encryptedKey: arrayBufferToBase64(encryptedKeyBuffer),
    encryptedKeyForSelf: arrayBufferToBase64(encryptedKeyForSelfBuffer),
  };
}