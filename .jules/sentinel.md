## 2024-11-20 - URL Sanitizer Protocol Mutation Bypass and SSRF Vulnerability
**Vulnerability:** XSS via `javascript:` schemas and SSRF bypass via `.includes()` domain validation.
**Learning:** The JS `URL` API silently fails to mutate the protocol property for special schemas (like `javascript:`). Using `.includes()` to validate domains allows bypasses like `evzone.com.attacker.com`.
**Prevention:** Always explicitly validate domains using `===` or `.endsWith()`. Reject unapproved protocols using an allowlist (`http:`, `https:`) instead of relying on protocol mutation.
