## 2026-11-08 - URL Sanitization SSRF/XSS Bypass
**Vulnerability:** URL sanitization utilities used loosely matched `.includes()` for hostname validation and allowed unstripped whitespace and unrestricted protocols, permitting SSRF and XSS bypasses (such as `evzone.com.evil.com` and `javascript://%250Aalert(1)//evzone.com`).
**Learning:** The URL constructor will parse the `javascript:` protocol without errors, often resulting in an empty hostname. Without strict protocol checking and exact suffix matching, malicious payloads can evade standard sanitizers.
**Prevention:** Always strip whitespace characters first, enforce an explicit protocol allowlist (such as `['http:', 'https:']`), and use strict hostname matching (such as `===` and `.endsWith()`) instead of `.includes()`.
