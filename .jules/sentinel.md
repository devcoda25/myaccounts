## 2026-10-05 - Prevent XSS and SSRF Bypasses in URL Parsing
**Vulnerability:** The `URL` constructor parses `javascript:` protocols without throwing an error, often resulting in an empty or unexpected hostname that can bypass naive validation, enabling XSS. Newlines and tabs can also be used to bypass validation before the URL constructor handles the string.
**Learning:** Naive URL validation using just `URL` constructor and checking hostname can be bypassed using unsupported protocols or newline injection.
**Prevention:** Always enforce a strict protocol allowlist (`['http:', 'https:']`) explicitly before performing any hostname validation or returning a parsed URL, and strip whitespace characters (`/[\n\r\t]/g`) first to prevent newline or tab injection bypasses.
