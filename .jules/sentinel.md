
## 2024-03-25 - Weak Domain Matching in URL Validator
**Vulnerability:** Weak domain validation using `.includes('evzone.com')` allowed bypassing checks with malicious URLs like `https://evzone.com.attacker.com`. Additionally, naive protocol assignment allowed attackers to bypass logic using schemas like `javascript:`.
**Learning:** `new URL('javascript://%0Aalert(1)//evzone.com')` successfully parses with empty hostname, thus bypassing weak validators.
**Prevention:** Always use exact matching (`===`) or strict Regex matching `/^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i` for domain validation. Always use strict `['http:', 'https:'].includes(url.protocol)` checking instead of protocol mutation.
