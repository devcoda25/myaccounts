
## 2024-05-24 - URL Validation Weaknesses (Open Redirect & XSS)
**Vulnerability:** Weak URL validation in `isValidUrl` and `sanitizeUrl` using `.includes()` for domains (Open Redirect bypass like `evzone.com.attacker.com`) and not explicitly rejecting unapproved protocols in `URL` object manipulation (XSS via `javascript:` schema).
**Learning:** Using `.includes()` on domains or failing to explicitly allowlist protocols in sanitizers can easily lead to bypasses, especially when `URL` parsing logic silently accepts or keeps `javascript:` protocols. Modifying `parsed.protocol` doesn't throw on special schemes.
**Prevention:** Always use exact matching or `.endsWith('.trusted.com')` for domain validation. Always use an explicit allowlist (like `http:`, `https:`) when sanitizing URLs, explicitly rejecting any unapproved protocol.
