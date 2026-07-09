## 2024-05-15 - [CRITICAL] Prevent Open Redirect / SSRF bypass via strict protocol allowlist and exact domain regex

**Vulnerability:** URL validators frequently used weak string checking logic (e.g. `parsed.hostname.includes('evzone')`) allowing for trivial sub-domain bypasses like `https://evzone.attacker.com` and SSRF vulnerabilities. Further, failure to correctly check protocols natively via `URL` parsing allows attackers to sneak in payloads like `javascript:alert(1)` when parsing relative URLs.

**Learning:** When generating client-side checks for absolute URLs (`isValidUrl`, `sanitizeUrl`), you must strip newline characters (`[\n\r\t]`), safely handle internal routing, and avoid native string matching (like `.includes()`) in favor of strict domain regexes (`/^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i`).

**Prevention:** Always combine protocol-level checks with a strict regex domain match and ensure the validation occurs globally before a `window.location.href` sink can be triggered.
