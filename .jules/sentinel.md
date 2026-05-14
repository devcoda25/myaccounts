# Sentinel Journal

## 2026-02-14 - Flawed Domain Validation
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions used `includes('evzone.com')` for domain validation. This allowed attackers to bypass checks by using domains like `evil-evzone.com` or `evzone.com.attacker.com`.
**Learning:** Simple string matching (`includes`, `indexOf`) is insufficient for domain validation. It fails to account for subdomains and malicious domain registration tricks.
**Prevention:** Always use strict equality checks or parse the hostname and check if it ends with `.yourdomain.com` (ensuring the dot is present). Use helper functions like `isEvzoneDomain` to centralize and enforce this logic.
