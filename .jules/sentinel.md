## 2024-08-15 - Insecure URL Validation
**Vulnerability:** URL validation used `.includes('evzone.com')` for hostnames allowing SSRF bypasses (`evzone.com.attacker.com`), and URL sanitization lacked protocol allowlisting allowing XSS (`javascript:alert(1)`).
**Learning:** `new URL()` handles `javascript:` fine and doesn't inherently sanitize protocols. Using `.includes()` for domains is extremely dangerous as it matches partial strings anywhere in the host.
**Prevention:** Always validate hostnames using strict equality or `.endsWith('.domain.com')` (with the dot). Always use an explicit array allowlist for allowed protocols. Always strip whitespace from URLs before passing to `new URL()`.
