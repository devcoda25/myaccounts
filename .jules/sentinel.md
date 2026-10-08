## 2026-10-08 - XSS Bypass in Avatar URL Sanitizer due to Custom Domain Logic
**Vulnerability:** `sanitizeUrl` returned unaltered `javascript:` payloads because the HTTPS enforcement was conditionally tied to the `evzone` domain.
**Learning:** Tying protocol sanitization directly to domain-specific business logic (e.g., forcing HTTPS only for `evzone`) creates a blind spot where other protocols like `javascript:` bypass checks entirely if the domain doesn't match.
**Prevention:** Always enforce a strict default-deny protocol allowlist (e.g., `['http:', 'https:']`) independently of and before any domain-specific business logic.
