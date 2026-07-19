## 2024-07-19 - SSRF/Open Redirect Vulnerability in URL Validation
**Vulnerability:** URL validation and sanitization logic used `.includes('evzone.com')` on the hostname.
**Learning:** Using `.includes()` allows bypasses via subdomains of attacker domains (e.g., `evzone.com.attacker.com`) or suffix bypasses (e.g., `attacker-evzone.com`).
**Prevention:** Use strict equality (`=== 'evzone.com'`) combined with strict suffix matching (`.endsWith('.evzone.com')`) for safe hostname validation.
