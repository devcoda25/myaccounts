## 2026-10-09 - Prevent javascript: protocol bypass in URL sanitization

**Vulnerability:** The `sanitizeUrl` function in `src/sanitizers/url.ts` did not enforce a protocol allowlist and relied on parsing the hostname to conditionally upgrade to HTTPS. This allowed arbitrary protocols like `javascript:` to pass through completely unsanitized, leading to potential Cross-Site Scripting (XSS).
**Learning:** Using `new URL(url)` parses the `javascript:` protocol without throwing an error, resulting in an empty hostname. To prevent XSS bypasses, a strict protocol allowlist (e.g., `['http:', 'https:']`) must be explicitly enforced before performing any hostname validation.
**Prevention:** Always strip whitespace characters first to prevent newline or tab injection bypasses. Then, explicitly validate that the parsed URL's protocol is strictly within the allowed list (`http:` or `https:`) before returning the parsed string. Return an empty string if the protocol is unauthorized.
