## 2026-10-06 - XSS in URL Sanitizer
**Vulnerability:** `javascript:` URLs were incorrectly allowed through due to missing protocol allowlisting.
**Learning:** `new URL()` parses unsafe protocols without error, requiring explicit allowlists before hostname validation.
**Prevention:** Always enforce strict protocol allowlists and strip whitespace characters before processing URLs.
