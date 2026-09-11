## 2026-09-11 - Fix SSRF and XSS in URL Utilities
**Vulnerability:** `isValidUrl` used `.includes('evzone.com')` which allows bypasses like `attacker-evzone.com` (SSRF). `sanitizeUrl` allowed any parseable protocol (e.g., `javascript:`), leading to XSS.
**Learning:** URL validation requires strict equality or `.endsWith` for subdomains, and strict allowlists for protocols to prevent XSS. Whitespace stripping is crucial before URL parsing.
**Prevention:** Always use strict protocol allowlists and strict hostname boundary checks.
