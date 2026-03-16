
## 2023-11-20 - SSRF and XSS Bypass via Insecure URL Validation
**Vulnerability:** The application used `.includes()` for domain validation and silently failed to change the protocol of `javascript:` URLs because modifying the protocol on non-HTTP URLs can fail silently in the `URL` API. This allowed SSRF (e.g. `evzone.com.attacker.com`) and XSS.
**Learning:** Never use `.includes()` for domain validation since it matches partial hostnames. Always use exact matches or `.endsWith()`. Also, instead of mutating dangerous protocols to safe ones, reject unapproved protocols immediately via an allowlist, as mutating protocols on schemas like `javascript:` does not work.
**Prevention:** Use strictly formatted URL validation using `.endsWith` and `.hostname ===`, and always check protocols using an allowlist before attempting to sanitize them.
