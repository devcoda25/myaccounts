## 2025-02-18 - SSRF and XSS via Weak URL Validation
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` utilities used `.includes('evzone.com')` for domain verification and lacked strict protocol allowlists, enabling SSRF/Open Redirects via domains like `attacker-evzone.com` and XSS via `javascript:` protocols.
**Learning:** `new URL()` parses malicious payloads like `javascript:alert(1)` without error. Using `.includes()` for hostname validation allows trivial bypasses. Relative paths cause `new URL()` to throw `TypeError`, requiring explicit safe handling.
**Prevention:** Always enforce a strict protocol allowlist BEFORE checking hostnames, use strict equality or `.endsWith('.domain.com')` for subdomains, strip whitespace before parsing, and explicitly handle safe relative paths.
