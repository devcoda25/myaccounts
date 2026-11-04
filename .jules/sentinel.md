## 2026-11-04 - URL Validation Bypass via includes() and Unrestricted Protocols
**Vulnerability:** URL sanitization allows `javascript:` URIs to bypass checks and hostnames are validated using loosely matched `.includes('evzone.com')` instead of strict suffix matching, enabling SSRF and Open Redirect bypasses via domains like `evzone.com.attacker.com`.
**Learning:** Using the URL constructor parses protocols like `javascript:` without throwing errors, leaving the hostname empty and bypassing basic string containment checks.
**Prevention:** Always enforce a strict protocol allowlist (e.g., `['http:', 'https:']`) before hostname validation, and use `===` or `.endsWith()` for exact hostname matching.
