## 2026-02-25 - Loose Hostname Validation in URL Sanitizer
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions used `.includes('evzone')` to validate hostnames, allowing attacker-controlled domains like `attacker-evzone.com` or `evzone.com.evil.com` to bypass security checks.
**Learning:** Checking for substrings in hostnames is insecure because attackers can register domains containing the target string. Always validate against a strict allowlist of exact domains or use `.endsWith()` with a leading dot for subdomains.
**Prevention:** Use a centralized helper function with strict logic (e.g., `isEvzoneDomain`) to validate domains against a known list of trusted domains.
