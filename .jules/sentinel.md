## 2026-10-07 - Prevent XSS in URL sanitization
**Vulnerability:** The `sanitizeUrl` function failed to enforce a strict protocol allowlist, allowing `javascript:` payloads to bypass sanitization. The `isValidUrl` function was susceptible to whitespace injection bypasses.
**Learning:** The `URL` constructor parses `javascript:` protocols without throwing an error and may misinterpret hostnames if whitespaces are present.
**Prevention:** Always explicitly strip whitespace characters (e.g., `url.replace(/[\n\r\t]/g, '').trim()`) and enforce a strict protocol allowlist (e.g., `['http:', 'https:']`) before performing any URL validation, sanitization, or hostname extraction.
