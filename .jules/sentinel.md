## 2024-05-24 - SSRF and Open Redirect via Weak URL Validation
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions used `.includes('evzone.com')` for hostname validation, which allowed bypasses like `attacker-evzone.com` or `evzone.com.attacker.com`. Additionally, malicious payloads could exploit whitespace injection and the `javascript:` protocol.
**Learning:** Using `.includes()` on hostnames is insecure. JavaScript's `URL` constructor parses `javascript:` protocols without error, which can bypass hostname checks.
**Prevention:** Always use strict equality and strict suffix matching for domain validation. Strip whitespace from URLs, explicitly allow safe relative paths, and enforce strict protocol allowlists before evaluating hostnames.
