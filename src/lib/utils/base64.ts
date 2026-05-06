// ============================================================
// WhisperBox — Base64 Utilities
//
// IMPORTANT: crypto.getRandomValues() returns a Uint8Array.
// Calling .buffer on it gives the FULL underlying ArrayBuffer
// which may be larger than the typed array (shared buffer issue).
// Always use the typed array directly, never .buffer on a subview.
// ============================================================

export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  // Accept both ArrayBuffer and Uint8Array to avoid the .buffer subview trap
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}