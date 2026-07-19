## 2024-07-19 - SSRF and Open Redirect in URL Handling
**Vulnerability:** Weak domain validation in `isValidUrl` using `.includes('evzone.com')` allowed bypasses via malicious domains (e.g., `attacker.com/?q=evzone.com` or `evzone.com.attacker.com`). Lack of validation on `window.location.href` assignments enabled Open Redirect.
**Learning:** Using broad string matching for hostnames is insecure. `window.location.href` must be wrapped in rigorous validation conditions, falling back to safe internal routes.
**Prevention:** Use strict equality combined with strict suffix matching (`.endsWith('.evzone.com')`) for hostnames. Ensure protocol whitelists are enforced on parsed URLs. Always validate dynamic assignment to location.href.
