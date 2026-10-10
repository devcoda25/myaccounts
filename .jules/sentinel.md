## 2026-10-10 - XSS bypass in URL Validation
**Vulnerability:** The URL constructor parses the javascript: protocol without throwing an error, resulting in an empty hostname and bypassing hostname checks.
**Learning:** URL validation must enforce a strict protocol allowlist explicitly before performing any hostname validation.
**Prevention:** Strip whitespace to prevent newline/tab bypasses and enforce explicit protocol allowlists (e.g. ['http:', 'https:']) on parsed URLs.
