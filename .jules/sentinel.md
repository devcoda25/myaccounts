## 2024-06-24 - [Domain Validation Vulnerability]
**Vulnerability:** Weak domain validation using `.includes('evzone.com')` allows SSRF and Open Redirect bypasses (e.g., `evzone.com.attacker.com`), and missing protocol allowlists permit XSS via `javascript:` URIs.
**Learning:** Using `String.prototype.includes` or `endsWith` for URL hostname validation is prone to circumvention. Also, `new URL()` happily parses `javascript:` URIs, rendering hostname checks ineffective if the protocol isn't validated first.
**Prevention:** Always use strict domain Regex matching (e.g., `/^([a-z0-9-]+\.)*evzone\.com$/i`) or exact matching (`===`). Additionally, explicitly enforce allowed protocols (`http:`, `https:`, etc.) and ensure whitespaces are stripped prior to URL parsing.
