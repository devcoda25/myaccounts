## 2024-05-18 - Fix URL Validation and Sanitization Bypasses

**Vulnerability:** URL validation and sanitization using `.includes()` allowed domain bypasses (e.g., `evzone.com.attacker.com`) and failed to reject malicious schemas (e.g., `javascript:`) because changing `url.protocol` fails silently on special schemas.
**Learning:** Checking for safe domains using string `.includes()` leaves code vulnerable to SSRF and Open Redirect, while special URL schemas cannot be mutated to `https:` simply by setting `url.protocol`.
**Prevention:** Always validate domains using exact matches or `.endsWith()`, and explicitly allowlist safe protocols (e.g., `http:`, `https:`) while rejecting unauthorized ones outright.
