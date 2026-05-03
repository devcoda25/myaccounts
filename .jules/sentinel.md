
## 2024-05-03 - Fix URL Sanitization bypasses (SSRF, Open Redirect, XSS)
**Vulnerability:** The URL sanitizer functions (`isValidUrl`, `sanitizeUrl`) previously used a weak string inclusion check (`.includes('evzone.com')`) for validation, making them vulnerable to SSRF and Open Redirect bypasses via domains like `evzone.com.attacker.com`. Additionally, `sanitizeUrl` lacked explicit schema validation, allowing execution of unapproved protocols like `javascript:` leading to XSS.
**Learning:** Checking subdomains with `.includes()` or `.indexOf()` is fundamentally insecure. Furthermore, modifying the `protocol` property on a `URL` object fails silently for special schemas like `javascript:`.
**Prevention:** Always use strict origin/domain matching using exact equality (`===`) or exact suffix matching with a leading dot (`.endsWith('.evzone.com')`). Explicitly allowlist acceptable schemes (`http:`, `https:`) and block any unexpected ones.
