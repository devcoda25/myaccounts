## 2026-09-06 - [CRITICAL/HIGH] Fix SSRF and Open Redirect in URL Sanitizer
**Vulnerability:** URL validation and sanitization relied on insecure `.includes('domain')` matching, allowing SSRF/Open Redirects via malicious domains.
**Learning:** JavaScript's `new URL()` constructor parses malicious payloads like `javascript:alert(1)//domain.com` with an empty hostname and a `javascript:` protocol.
**Prevention:** Always enforce a strict protocol allowlist (e.g., `['https:', 'http:']`) before evaluating hostnames. Use strict equality (`===`) combined with strict suffix matching (`.endsWith()`) for subdomains. Strip whitespace (`/[\n\r\t]/g`) and explicitly handle safe relative paths.
