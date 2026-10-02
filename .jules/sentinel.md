## 2026-10-02 - Fix URL validation bypass
**Vulnerability:** The URL parser doesn't catch JavaScript URLs with whitespace and carriage returns bypass, allowing XSS.
**Learning:** The URL constructor will trim spaces but won't trim newlines and tabs from protocol schemes, leaving `javascript:` functional. In addition, the URL constructor will parse the javascript: protocol without throwing an error, often resulting in an empty hostname, bypassing hostname validation checks if the protocol isn't checked first.
**Prevention:** Always strip whitespace characters using `url.replace(/[\n\r\t]/g, '').trim()` first and enforce a strict protocol allowlist (e.g., `['http:', 'https:']`) explicitly before performing any hostname validation.
