## 2026-08-25 - [SSRF/Open Redirect bypass in URL validation]
**Vulnerability:** URL validation used `.includes('evzone.com')` for hostname checks, allowing bypasses via malicious domains like `evzone.com.attacker.com` or `attacker.com/evzone.com`.
**Learning:** Using `.includes()` on hostnames is insecure as it matches anywhere in the string.
**Prevention:** Use strict equality (`===`) combined with strict suffix matching (`.endsWith('.domain.com')`) for subdomains, and enforce strict protocol allowlists before evaluating hostnames.
