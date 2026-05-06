// ============================================================
// Confession Box — In-Memory Private Key Store
//
// The RSA private key NEVER touches disk, localStorage, or
// sessionStorage. It lives only in this module-level variable
// for the duration of the browser session.
//
// It is set after login/register (unwrapped from the server blob)
// and cleared on logout or page unload.
// ============================================================

let _privateKey: CryptoKey | null = null;

export function setPrivateKey(key: CryptoKey): void {
  _privateKey = key;
}

export function getPrivateKey(): CryptoKey | null {
  return _privateKey;
}

export function clearPrivateKey(): void {
  _privateKey = null;
}