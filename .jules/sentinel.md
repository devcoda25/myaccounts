## 2024-05-18 - [CRITICAL] Fix URL validation bypass (SSRF/Open Redirect)
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions used naive `.includes('evzone')` and lacked protocol allowlisting, allowing bypasses like `evzone.com.attacker.com` or `javascript:`.
**Learning:** Validating URLs with string matching like `.includes()` without anchoring leads to trivial SSRF/Open Redirects. Furthermore, the `URL` constructor allows dangerous protocols by default.
**Prevention:** Always use strict regex matching (e.g. anchored to the TLD) for domains and strictly allowlist protocols when sanitizing URLs.
