## 2023-10-25 - [CRITICAL] Fix URL validation vulnerabilities
**Vulnerability:** `isValidUrl` and `sanitizeUrl` were vulnerable to SSRF/Open Redirects because `.includes('evzone.com')` matched malicious domains like `attacker-evzone.com`, and `sanitizeUrl` did not restrict protocols, allowing XSS via `javascript:` URIs.
**Learning:** Naive `.includes()` checks for domain validation are easily bypassed, and missing protocol restrictions on URL sanitization lead to direct XSS when parsing malicious payloads.
**Prevention:** Use strict equality (`===`) and suffix matching (`.endsWith('.domain.com')`) for hostnames, always enforce a strict protocol allowlist, and explicitly handle safe relative URLs after stripping whitespaces.
