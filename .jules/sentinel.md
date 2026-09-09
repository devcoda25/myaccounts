## 2026-09-09 - [CRITICAL] Fix URL validation bypasses
**Vulnerability:** URL validation could be bypassed using whitespace injection (`\njavascript:alert(1)`), `hostname.includes('evzone.com')` allowed SSRF via `attacker.com/evzone.com` or `evzone.com.attacker.com`, and `sanitizeUrl` didn't restrict protocols.
**Learning:** `new URL()` happily parses malicious `javascript:` URIs with whitespace, and `.includes()` is dangerous for hostname validation.
**Prevention:** Always strip whitespace before parsing, use strict `===` or `.endsWith('.domain.com')` for hostnames, and enforce explicit protocol allowlists.
