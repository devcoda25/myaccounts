## 2026-10-11 - [XSS Bypass via URL Parsing]
**Vulnerability:** The `URL` constructor allows javascript: protocols with whitespace bypasses (e.g., `javascript://evzone.com/%0Aalert(1)`). This can bypass simple protocol and hostname checks.
**Learning:** JavaScript's `URL` parsing handles the `javascript:` protocol without error and can yield unexpected hostnames. Always enforce an explicit protocol allowlist before verifying the hostname.
**Prevention:** Explicitly strip whitespace (tabs, newlines) from URLs and check against an explicit protocol allowlist (`['http:', 'https:']`) before attempting to parse or validate hostnames.
