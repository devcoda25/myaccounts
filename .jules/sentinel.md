## 2026-05-16 - [Strict Domain Validation]
**Vulnerability:** Open redirect / SSRF bypass in URL validation due to using `.includes('evzone.com')`.
**Learning:** Using string inclusion like `.includes()` for domain validation allows bypasses such as `evzone.com.attacker.com`.
**Prevention:** Always use strict regex matching (e.g., `/^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i`) or exact matching when validating domains.
