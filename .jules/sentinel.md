## 2026-11-05 - Insecure URL Validation using .includes()
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions used loosely matched methods like `.includes('evzone.com')` for hostname validation, allowing SSRF and Open Redirect bypasses (e.g., `attacker-evzone.com`).
**Learning:** Checking for substrings in hostnames is a critical flaw that compromises protocol allowlisting and domain verification, unique to how `evzone.com` verification was implemented here.
**Prevention:** Always use exact matching (`===`) or strict suffix matching (`.endsWith()` for subdomains) when validating hostnames against trusted domains.
