## 2026-02-15 - [Insecure Hostname Validation]
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions used `.includes('evzone.com')` and `.includes('evzone')` respectively, which allowed spoofed domains like `evzone.com.attacker.com` or `attacker-evzone.com` to bypass validation.
**Learning:** Substring matching on hostnames is insecure because attackers can register domains containing the target string.
**Prevention:** Always use strict equality for root domains (e.g., `=== 'evzone.com'`) and `.endsWith('.evzone.com')` for subdomains.
