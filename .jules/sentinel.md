
## 2024-05-05 - [CRITICAL] Fix URL validation bypass
**Vulnerability:** Weak domain validation using `.includes('evzone.com')` allowed domain spoofing (e.g., `evzone.com.attacker.com`), leading to Open Redirect or SSRF.
**Learning:** Always use strict equality (`===`) or `.endsWith()` with a leading dot when validating trusted domains to prevent prefix/suffix spoofing.
**Prevention:** Utilize rigorous domain parsing and strict allowlisting rather than broad substring matching.
