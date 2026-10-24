## 2026-10-24 - Fix SSRF and Open Redirect in loosely matched hostname
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions used loosely matched `parsed.hostname.includes('evzone.com')` allowing bypasses (e.g. `attacker.com/?q=evzone.com`).
**Learning:** Never use `.includes()` to validate domains. A payload of `evzone.com.attacker.com` or an attacker-controlled query parameter easily bypasses this filter. Also, always strip whitespaces (newlines/tabs) before validation.
**Prevention:** Use exact match (`===`) or strict suffix matching (`.endsWith('.domain.com')`) to validate hostnames, and proactively sanitize tabs and newlines before passing strings to the `URL` constructor.
