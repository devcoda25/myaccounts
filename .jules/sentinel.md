## 2024-05-24 - SSRF and XSS Bypass via URL Constructor
**Vulnerability:** `isValidUrl` and `sanitizeUrl` were using `.includes('evzone.com')` and lacked strict protocol checks, allowing XSS via `javascript:` and SSRF via domains like `attacker-evzone.com`.
**Learning:** The URL constructor successfully parses malicious payloads like `javascript:alert(1)//evzone.com`. Furthermore, `.includes()` validation allows subdomain and suffix bypasses. Newlines and tabs in URLs can bypass standard validations.
**Prevention:** Always strip whitespace first. Ensure strict exact domain matching or `.endsWith('.domain.com')` for subdomains. Enforce strict protocol allowlists BEFORE checking hostnames.
