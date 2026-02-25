## 2026-02-25 - [Loose URL Validation Vulnerability]
**Vulnerability:** Loose hostname matching (e.g., `hostname.includes('evzone.com')`) in `isValidUrl` allowed malicious domains like `attacker-evzone.com` or `evzone.com.attacker.com` to bypass validation, potentially leading to open redirects or SSRF.
**Learning:** `String.prototype.includes()` is insufficient for security validation of domains. Always validate exact matches or strict subdomain patterns (e.g., `endsWith('.domain.com')`).
**Prevention:** Use a dedicated `isAllowedHostname` helper that enforces exact match or strict subdomain checks against an allowlist of trusted domains.
