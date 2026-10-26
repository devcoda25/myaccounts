## 2026-10-26 - Fix URL validation bypass using includes
**Vulnerability:** URL validation and sanitization functions used loosely matched `includes` (e.g. `parsed.hostname.includes('evzone.com')`), allowing SSRF/Open Redirect bypasses via attacker subdomains (e.g., `https://evzone.com.evil.com`).
**Learning:** Never use `includes` for hostname validation when checking allowed domains, as it matches anywhere in the string.
**Prevention:** Always use strict exact matching (`===`) or suffix matching (`endsWith`), and strip whitespace/newlines before parsing URLs.
