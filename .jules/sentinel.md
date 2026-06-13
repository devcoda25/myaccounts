
## 2023-10-27 - URL Sanitization Bypass via Schema Mutation and Substring Matching
**Vulnerability:** XSS, Open Redirect, and SSRF bypass in URL sanitization functions (`isValidUrl`, `sanitizeUrl`).
**Learning:** Modifying `url.protocol` fails silently for special schemas like `javascript:`. If you try `parsed.protocol = 'https:'` on a `javascript:` URL, it remains `javascript:`. Additionally, validating domains using `.includes('domain.com')` allows bypasses like `attacker.domain.com.evil.com`.
**Prevention:** Always validate protocols using a strict allowlist (e.g., `['http:', 'https:'].includes(...)`) rather than attempting to coerce them. Always validate domains using exact matching (`===`) or `.endsWith('.domain.com')`.
