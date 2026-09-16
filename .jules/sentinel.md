## 2026-09-16 - URL Sanitization Bypass
**Vulnerability:** The `sanitizeUrl` function allows bypasses like `javascript:alert(1)` because it fails to enforce a protocol allowlist. Furthermore, `isValidUrl` uses `.includes('evzone.com')` which allows attacker domains like `attacker-evzone.com`.
**Learning:** The URL constructor can parse `javascript:alert(1)//evzone.com` with a javascript protocol and empty hostname, bypassing hostname checks. `.includes` is too permissive for domain validation.
**Prevention:** Use a strict protocol allowlist first. Validate domains using strict equality and `.endsWith` for subdomains. Strip whitespace characters before parsing to prevent newline injection.
