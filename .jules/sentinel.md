
## 2024-05-18 - Fix SSRF/XSS vulnerabilities in URL sanitizers
**Vulnerability:** Weak URL validation in `isValidUrl` using `.includes('evzone.com')` allowed SSRF and Open Redirect bypasses via crafted domains like `evzone.com.attacker.com`. Additionally, `sanitizeUrl` failed to reject unapproved protocols (like `javascript:`) because modifying `parsed.protocol` fails silently, returning the unapproved URL untouched.
**Learning:** Checking domains with `.includes()` is inherently vulnerable to SSRF bypasses. The JavaScript `URL` API silently ignores protocol mutation on special schemas (like `javascript:`).
**Prevention:** Always validate domains using exact matching (`===`) or `.endsWith('.domain.com')` against a strict allowlist. When sanitizing protocols, explicitly reject unapproved ones instead of attempting to mutate them.
