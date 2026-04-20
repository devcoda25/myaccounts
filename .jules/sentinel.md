## 2024-05-18 - [HIGH] Fix XSS vulnerability in URL handling
**Vulnerability:** DOM-based XSS was possible via dynamic URL injection (e.g., app links in the dashboard) if an attacker could control the `url` returned by an API and provide a `javascript:` or `data:` schema. Also, strict URL domain checking was missing, making SSRF or phishing redirects possible via prefix/suffix bypassing (e.g. `evzone.com.evil.com`).
**Learning:** React does not automatically prevent `javascript:` protocols in `href` props. Additionally, string `includes` checks for domains are insufficient and prone to suffix/prefix vulnerabilities. Dynamic URLs rendered into `<a href>` attributes must always be strictly validated or sanitized to strip dangerous protocols.
**Prevention:**
1. Always apply `sanitizeUrl` (which explicitly blocks `javascript:`, `data:`, `vbscript:`, `file:`) to any untrusted or dynamic URLs assigned to `href`, `src`, or `action` attributes.
2. Use exact host matching or `endsWith` when verifying domain names in `isValidUrl` instead of `.includes()`.
