// ============================================================
// WhisperBox — Message Decryption
//
// Flow for RECEIVED messages:
//   1. Decrypt `encryptedKey` with our RSA private key → raw AES key bytes
//   2. Import those bytes as an AES-GCM CryptoKey
//   3. Decrypt `ciphertext` with the AES key + iv → plaintext
//
// Flow for SENT messages (reading own history):
//   Same, but use `encryptedKeyForSelf` instead of `encryptedKey`
//   (both were encrypted with RSA-OAEP, so the decryption logic is identical)
// ============================================================

import { base64ToArrayBuffer } from '../utils/base64';
import { getPrivateKey } from './session';
import type { MessagePayload } from '../../types';

export async function decryptMessage(
  payload: MessagePayload,
  isSentByMe: boolean,
): Promise<string> {
  const privateKey = getPrivateKey();
  if (!privateKey) throw new Error('No private key in session');

  const dec = new TextDecoder();

  // Step 1: Pick which encrypted AES key to use
  // - If I sent this message, use encryptedKeyForSelf (encrypted with my public key)
  // - If I received this message, use encryptedKey (encrypted with my public key by sender)
  const encryptedKeyBase64 = isSentByMe
    ? payload.encryptedKeyForSelf
    : payload.encryptedKey;

  // Step 2: Decrypt the AES key using our RSA private key
  const rawAesKey = await window.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    base64ToArrayBuffer(encryptedKeyBase64),
  );

  // Step 3: Import the raw bytes back as an AES-GCM key
  const aesKey = await window.crypto.subtle.importKey(
    'raw',
    rawAesKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );

  // Step 4: Decrypt the ciphertext with AES-GCM + IV
  const plaintextBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToArrayBuffer(payload.iv) },
    aesKey,
    base64ToArrayBuffer(payload.ciphertext),
  );

  return dec.decode(plaintextBuffer);
}