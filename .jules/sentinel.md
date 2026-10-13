## 2026-10-13 - Strict Hostname Validation Pattern
**Vulnerability:** URL sanitization used loosely matched methods like .includes('evzone.com') for hostnames (allowing evzone.com.attacker.com bypasses).
**Learning:** Loose substring matches on hostnames allow SSRF and Open Redirect bypasses.
**Prevention:** Always use exact matching (===) or strict suffix matching (.endsWith()) for subdomains, and ensure protocols are strictly checked.
