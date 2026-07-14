## 2026-07-14 - Open Redirect via Weak URL Validation
**Vulnerability:** The application was vulnerable to Open Redirect and SSRF due to a weak `isValidUrl` validation (`parsed.hostname.includes('evzone.com')`), which allowed domains like `not-evzone.com` to bypass checks.
**Learning:** Naive substring matching on URL hostnames is insecure. Moreover, the URL constructor does not automatically handle relative paths, causing safe internal redirects to fail if not accounted for.
**Prevention:** Always use strict domain matching (`===` or `.endsWith`), strip whitespace characters to prevent bypasses, and explicitly allow safe relative paths before passing input to the `URL` constructor.
