## 2026-08-26 - URL Sanitization Bypass
**Vulnerability:** URL validation and sanitization functions used `.includes()` for domain checking, allowing SSRF/Open Redirects via attacker domains (e.g., `attacker-evzone.com`). Additionally, `sanitizeUrl` allowed any parsable URL protocol (like `javascript:`), leading to XSS.
**Learning:** The URL constructor parses `javascript:alert(1)//evzone.com` with an empty hostname and a `javascript:` protocol. Blacklisting protocols or only checking domains is insufficient; explicit protocol allowlists and strict hostname equality/suffix checks are required.
**Prevention:** Always enforce strict protocol allowlists and use strict equality/suffix matching for hostnames instead of `.includes()`.
