## 2026-10-22 - [CRITICAL] Fix URL validation SSRF/Open Redirect bypass

**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions used loosely matched `parsed.hostname.includes('evzone.com')` for validation. This allows attackers to bypass checks using domains like `evzone.com.attacker.com`. Also, lack of whitespace stripping could lead to newline injection bypasses.
**Learning:** `.includes()` on hostnames is insufficient for security boundaries and allows trivial bypasses.
**Prevention:** Always use strict exact matching (`===`) or strict suffix matching (`.endsWith()` with a dot separator) for hostname validation, and strip whitespaces before parsing URLs.
