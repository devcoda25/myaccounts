## 2026-05-11 - Fix URL sanitization bypasses
**Vulnerability:** Weak domain validation and protocol allowlisting in URL sanitizers allowed Open Redirects (via `.includes()`) and XSS (via `javascript:` schemas).
**Learning:** URL API silently allows dangerous protocols if not explicitly allowlisted, and `.includes()` on hostnames is insecure against attacker subdomains.
**Prevention:** Use exact domain matching or `.endsWith()` for domain validation, and strictly allowlist safe protocols like `http:` and `https:`.
