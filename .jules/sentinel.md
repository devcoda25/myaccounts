## 2024-05-20 - [Fix Insecure URL Validation SSRF/Open Redirect]
**Vulnerability:** URL validation utility used `.includes('evzone.com')`, allowing bypasses via `attacker-evzone.com`. Did not prevent `javascript:` protocol in sanitizeUrl.
**Learning:** `URL.hostname` `.includes()` is dangerous; `javascript:alert(1)//domain.com` bypasses validation when protocol isn't strictly checked first.
**Prevention:** Use strict hostname equality + `.endsWith('.domain.com')` for subdomains and enforce explicit protocol allowlists *before* hostname evaluation.
