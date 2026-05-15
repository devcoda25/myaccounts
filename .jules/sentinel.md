## 2024-05-24 - URL Validation Bypass via Substring Matching

**Vulnerability:**
The `isValidUrl` and `sanitizeUrl` functions used `.includes('evzone.com')` and `.includes('evzone')` to check if a domain was trusted. This is a critical vulnerability that allows SSRF (Server-Side Request Forgery) and Open Redirect bypasses, because an attacker can register a domain like `evzone.com.attacker.com` or `attacker-evzone.com` to bypass the validation. Furthermore, `sanitizeUrl` lacked protocol allowlisting before returning the sanitized output, exposing the application to XSS via `javascript:` and other unsupported schemas. When catching errors during `URL` parsing, `sanitizeUrl` returned `''`, which broke valid relative URLs and led to potential functional regressions.

**Learning:**
Validating hostnames using simple substring matching (`.includes`) is inherently flawed and a classic vector for authentication bypasses, Open Redirects, and SSRF. Additionally, URL sanitizers must explicitly allowlist known safe protocols (e.g., `http:`, `https:`) because modifying `protocol` on unsupported schemas (like `javascript:`) via the `URL` API silently fails or does not provide the expected safety, rendering the result still exploitable.

**Prevention:**
Always validate domain names using exact string matching (`===`) or suffix matching (`.endsWith('.trusteddomain.com')`) against a strict allowlist. When handling generic URL strings, explicitly verify and restrict the `protocol` property to `http:` and `https:`, and gracefully fallback to safely validating relative URLs to ensure functional correctness without sacrificing security.
