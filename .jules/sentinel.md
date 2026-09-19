## 2026-09-19 - SSRF and XSS Vulnerabilities in URL Sanitizers
**Vulnerability:** URL sanitizers allowed arbitrary protocols (e.g., `javascript:`) leading to XSS, and used weak `.includes('evzone.com')` checks enabling SSRF/Open Redirects via malicious domains like `attacker-evzone.com`. They also failed to strip whitespace, permitting newline injections.
**Learning:** The URL constructor successfully parses malicious payloads like `javascript:alert(1)//evzone.com` without errors, and `.includes()` is unsafe for hostname validation.
**Prevention:** Always strip whitespace characters before passing URLs to `new URL()`, enforce explicit protocol allowlists, and use strict equality with `.endsWith()` for subdomain validation.
