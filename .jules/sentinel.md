## 2026-10-31 - [Strict URL Sanitization and Validation]
**Vulnerability:** URL validation bypass using whitespace injection and loose hostname matching allowing XSS and SSRF.
**Learning:** Using `.includes('evzone.com')` for validation can be bypassed by `evzone.com.evil.com`. `new URL()` parses `javascript:` without throwing and might not extract the expected hostname when bypassed by whitespace.
**Prevention:** Clean input by replacing whitespace/newlines before parsing, validate against strict protocol allowlists (`['http:', 'https:']`), and use strict equality (`===`) or strict suffix matching (`.endsWith('.evzone.com')`) for domains.
