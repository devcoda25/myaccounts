## 2024-05-18 - Insecure URL Validation (SSRF & Open Redirect)
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` utilities used `.includes('evzone.com')` and lacked strict protocol checks, allowing bypasses like `attacker-evzone.com`, `javascript:alert(1)`, and SSRF risks.
**Learning:** Using `.includes` for domain validation is extremely risky as it matches prefixes and suffixes maliciously registered by attackers. `new URL()` also silently accepts dangerous protocols like `javascript:`.
**Prevention:** Always use strict equality (`=== 'domain.com'`) or strict suffix matching (`.endsWith('.domain.com')`) for hostnames. Implement explicit protocol allowlists (e.g., `http:`, `https:`, `mailto:`, `tel:`) and handle safe relative paths explicitly after stripping whitespace (`\n\r\t`).
