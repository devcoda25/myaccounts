## 2024-06-04 - Insecure Domain Validation
**Vulnerability:** Weak domain validation using `.includes()` allows bypasses (e.g. `evzone.com.attacker.com`).
**Learning:** Using string manipulation methods like `.includes()` for hostname validation can easily be bypassed to create Server-Side Request Forgery (SSRF) and Open Redirect vulnerabilities.
**Prevention:** Always use exact matching or strict Regex to validate domain names against an allowlist.
