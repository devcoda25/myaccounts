## 2024-11-20 - [HIGH] Fix SSRF / Open Redirect bypass in URL validation
**Vulnerability:** `isValidUrl` and `sanitizeUrl` used loose `.includes('evzone.com')` checking, allowing bypasses like `attacker-evzone.com` or `evzone.com.attacker.com`. Additionally, it didn't handle safe relative paths or newline injection.
**Learning:** Never use `.includes` for domain validation. Always strip whitespaces before parsing and handle relative paths correctly.
**Prevention:** Use strict equality `===` or suffix matching `.endsWith('.domain.com')` for domains. Always enforce a strict protocol allowlist.
