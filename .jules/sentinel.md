## 2024-05-23 - Insecure Randomness Fallback Pattern
**Vulnerability:** Multiple components (Auth, 2FA, Admin) implemented local 'safe' random number generators that fell back to 'Math.random()' if 'window.crypto' failed, silently downgrading security.
**Learning:** Copy-pasted security logic often diverges or contains subtle flaws. Developers may prioritize 'not crashing' over 'failing securely'.
**Prevention:** Centralize all security primitives (like RNG) in a single, well-tested utility that enforces failure over insecurity.
