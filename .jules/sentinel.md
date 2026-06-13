## 2024-03-20 - URL Domain Bypass & Protocol Sanitization Silently Failing
**Vulnerability:**
1. Server-Side Request Forgery (SSRF) and Open Redirect risk due to weak domain validation. The validation check `hostname.includes('evzone.com')` could be bypassed by a domain like `evzone.com.attacker.com` or `attacker-evzone.com`.
2. Cross-Site Scripting (XSS) risk via `javascript:` schemas. Modifying the protocol in JavaScript's `URL` API via `url.protocol = 'https:'` fails silently for special schemas like `javascript:`. If a user inputted `javascript://evzone.com/%0Aalert(1)`, it would pass the domain check but remain a `javascript:` payload because setting `.protocol` has no effect.

**Learning:**
1. Using `.includes()` on domain names is inherently dangerous for allowlists. Always use strict equality (`===`) or `.endsWith('.domain.com')` to ensure boundaries.
2. The `URL` API's properties (like `.protocol`) are not uniformly mutable. For some URL schemes, modifying them does nothing and fails silently, which can defeat sanitization routines that attempt to force protocols to `https:`.

**Prevention:**
1. Instead of attempting to modify an unapproved protocol to `https:`, explicitly validate the protocol against an allowlist (e.g., `['http:', 'https:']`) and reject the URL completely if it does not match.
2. For domain validation, strictly use `hostname === 'domain.com' || hostname.endsWith('.domain.com')` instead of `.includes()`.
