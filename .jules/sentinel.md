## 2023-10-27 - [Strict URL Validation]
**Vulnerability:** Open Redirect and SSRF in URL validation
**Learning:** Naive use of `.includes()` for domain checking in `isValidUrl` allows bypasses like `https://attacker-evzone.com`. Furthermore, parsing malicious URLs without sanitization or protocol constraints enables `javascript:` bypasses or relative path abuses.
**Prevention:** Always use exact matching or strict Regex to validate domains. Strip whitespaces to prevent protocol-related bypasses, explicitly allowsafe relative paths, and whitelist allowable protocols.
