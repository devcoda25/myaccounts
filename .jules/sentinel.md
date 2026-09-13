## 2026-09-13 - SSRF and Protocol Injection via Insecure URL Parsing
**Vulnerability:** URL sanitization and validation functions used `.includes()` for hostname validation (allowing bypasses like `attacker-evzone.com`) and did not restrict protocols strictly before property access, allowing `javascript:` protocol injection.
**Learning:** The `new URL()` parser successfully parses `javascript:alert(1)//evzone.com` leaving the hostname blank and `protocol` as `javascript:`. Using `.includes('domain')` is insufficient for domain boundaries.
**Prevention:** Always strip whitespace, strictly enforce a protocol allowlist (e.g., `['https:', 'http:']`), and use strict equality (`===`) with suffix matching (`.endsWith('.domain.com')`) for subdomains when validating URLs.
