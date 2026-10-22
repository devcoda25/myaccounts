## 2026-10-22 - URL Validation Bypass
**Vulnerability:** XSS and SSRF via URL parsing bypasses.
**Learning:** Node's URL constructor parses javascript: protocols without error and allows empty hostnames. Also, loose string matching (.includes()) on hostnames can be bypassed (e.g., evzone.com.evil.com).
**Prevention:** Always strip whitespace characters first, strictly enforce protocol allowlists (['http:', 'https:']) before hostname validation, and use exact or strict suffix matching for hostnames (=== or .endsWith()).
