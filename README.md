# Confession Box 🔐

> End-to-end encrypted messaging. The server is architecturally blind — it stores and forwards only encrypted blobs. All cryptographic operations happen exclusively in the browser.

**Live Demo:** https://confession-box-nu.vercel.app/ 
**Stack:** Next.js 14 · Web Crypto API · WebSocket · Tailwind CSS · TypeScript

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│                                                          │
│  ┌──────────┐    ┌─────────────┐    ┌────────────────┐  │
│  │   Auth   │    │  Crypto     │    │   WebSocket    │  │
│  │  Context │    │  Layer      │    │   Manager      │  │
│  │          │    │             │    │                │  │
│  │ JWT mem  │    │ RSA-OAEP    │    │ wss://...      │  │
│  │ refresh  │    │ AES-GCM     │    │ reconnect      │  │
│  │ token    │    │ PBKDF2      │    │ backoff        │  │
│  └────┬─────┘    └──────┬──────┘    └───────┬────────┘  │
│       │                 │                   │            │
│       └─────────────────┴───────────────────┘            │
│                         │                                │
│              ┌──────────▼──────────┐                     │
│              │    Private Key      │                     │
│              │  (memory only —     │                     │
│              │  never touches      │                     │
│              │  disk or network)   │                     │
│              └─────────────────────┘                     │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS / WSS
                          │ (encrypted blobs only)
┌─────────────────────────▼───────────────────────────────┐
│                     SERVER (WhisperBox API)               │
│                                                          │
│  Stores: wrapped_private_key, public_key, ciphertext     │
│  Never sees: plaintext, raw private key, AES keys        │
└──────────────────────────────────────────────────────────┘
```

---

## Encryption Flow

### Why Hybrid Encryption?

RSA-OAEP alone can only encrypt ~214 bytes. AES-GCM alone requires a secure key exchange. The solution — use both:

- **AES-GCM** (256-bit) encrypts the message — fast, handles any size
- **RSA-OAEP** (2048-bit) encrypts the AES key — secure key exchange without a shared secret

This is the same approach used by Signal, PGP, and TLS.

### Registration

```
1. Generate RSA-OAEP 2048-bit keypair              (browser)
2. Generate random 128-bit PBKDF2 salt             (browser)
3. Derive AES-GCM key from password + salt         (PBKDF2, 100k iterations)
4. Export RSA private key as PKCS#8 bytes
5. Encrypt PKCS#8 bytes with AES-GCM              → wrapped_private_key
6. Export RSA public key as SPKI base64            → public_key
7. POST /auth/register { public_key, wrapped_private_key, pbkdf2_salt }
   ↳ Server stores blobs verbatim — cannot decrypt them
```

### Login (Session Restore)

```
1. POST /auth/login → receive wrapped_private_key + pbkdf2_salt
2. Re-derive AES-GCM key from password + salt
3. Decrypt wrapped_private_key → raw PKCS#8 bytes
4. Import as RSA-OAEP CryptoKey (extractable: false)
5. Store CryptoKey in module-level variable (memory only)
   ↳ Key is destroyed on logout or tab close
```

### Sending a Message

```
1. GET /users/{recipientId}/public-key
2. Generate random AES-GCM 256-bit key + 96-bit IV
3. Encrypt plaintext with AES-GCM               → ciphertext
4. Encrypt AES key with recipient's RSA pubkey  → encryptedKey
5. Encrypt AES key with own RSA pubkey          → encryptedKeyForSelf
6. WS: message.send { to, payload: { ciphertext, iv, encryptedKey, encryptedKeyForSelf } }
   ↳ Server stores & forwards — never decrypts
```

### Receiving a Message

```
1. WS: message.receive { payload: { ciphertext, iv, encryptedKey, ... } }
2. Decrypt encryptedKey with own RSA private key → raw AES key bytes
3. Import AES key bytes as AES-GCM CryptoKey
4. Decrypt ciphertext with AES-GCM key + iv     → plaintext
5. Render in UI
```

---

## Key Management

| Key | Algorithm | Lives | Never |
|---|---|---|---|
| RSA keypair | RSA-OAEP 2048-bit | Public key on server; private key in memory | Private key on disk or server |
| Wrapping key | AES-GCM 256-bit (PBKDF2) | Derived on login, used once | Stored anywhere |
| Message key | AES-GCM 256-bit | Generated per message, wrapped in payload | Stored in plaintext |
| PBKDF2 salt | 128-bit random | Server (as base64 blob) | Used without the password |

---

## Token Management

```
access_token  → memory only (React state)          expires: 15 min
refresh_token → sessionStorage                      cleared on tab close

Proactive refresh at 14-minute mark via setTimeout
WS close 4001 → refresh token → reconnect
WS close 4003 → redirect to login immediately
```

---

## Security Decisions

| Decision | Rationale |
|---|---|
| Web Crypto API only | No third-party crypto libs — reduces attack surface, auditable |
| AES-GCM over AES-KW | `wrapKey()` has inconsistent browser behaviour; manual encrypt/decrypt of PKCS#8 bytes is fully cross-browser |
| `extractable: false` on private key | CryptoKey object can decrypt but cannot be exported after import |
| PBKDF2 100,000 iterations | NIST minimum recommendation for password-based key derivation |
| access_token in memory | Never touches localStorage or cookies — cleared on tab close |
| Fresh AES key per message | Compromise of one message key doesn't affect others |

---

## Known Limitations & Trade-offs

| Limitation | Explanation |
|---|---|
| No forward secrecy | Long-lived RSA keys — past messages could be decrypted if private key is compromised. Signal solves this with Double Ratchet — out of scope. |
| No cross-device support | Private key derived from password per session. Second device needs the same password + the server blob. No device-specific key enrollment. |
| `sessionStorage` for refresh token | Accessible to JS. An `httpOnly` cookie via a BFF would be ideal for production. |
| No message deletion | Backend has no delete endpoint. |
| Conversation list doesn't auto-sort | List re-fetches on mount only. Requires page refresh to see new conversations at top. |
| No typing indicators | WebSocket protocol has no typing event — would require backend support. |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login|register     # Auth pages
│   └── (app)/
│       ├── layout.tsx            # Auth guard + WS provider + mobile routing
│       ├── inbox/page.tsx        # Empty state
│       └── conversations/[userId]/page.tsx  # Chat thread
├── lib/
│   ├── crypto/
│   │   ├── keys.ts               # Key gen, PBKDF2, wrap/unwrap
│   │   ├── encrypt.ts            # Hybrid message encryption
│   │   ├── decrypt.ts            # Message decryption
│   │   └── session.ts            # In-memory private key store
│   ├── api/                      # Typed fetch wrappers
│   └── websocket/socket.ts       # WS manager with reconnect + backoff
├── hooks/                        # useAuth, useMessages, useWebSocket, useConversations
├── context/                      # AuthContext, WebSocketContext
└── components/                   # UI, auth forms, conversation list, message thread
```

---

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> Requires a modern browser with Web Crypto API support (Chrome 37+, Firefox 34+, Safari 11+)

---

## API

Backend: `https://whisperbox.koyeb.app`  
Docs: `https://whisperbox.koyeb.app/docs`

---

*Built for Stage 4B — Frontend Wizards. All encryption happens on the client. The server is blind.*