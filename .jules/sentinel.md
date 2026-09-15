## 2026-09-15 - SSRF and Open Redirect vulnerability due to loose domain validation
**Vulnerability:** The URL validation logic used `.includes('evzone.com')` to check the hostname, which allowed bypasses via subdomains (e.g., `attacker-evzone.com`) and malicious subdomains (e.g., `evzone.com.attacker.com`). It also failed to strip whitespace before parsing, risking newline/tab injections.
**Learning:** Using `.includes()` on hostnames is never secure for URL validation as it permits broader string matches than intended.
**Prevention:** Always validate hostnames using strict equality (`===` for exact domain match) combined with strict suffix matching (`.endsWith('.domain.com')` for subdomains), and strip whitespace prior to URL parsing.
