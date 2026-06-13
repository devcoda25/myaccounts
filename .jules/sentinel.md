## 2024-05-09 - Open Redirect via Weak URL Validation
**Vulnerability:** The `isValidUrl` function in `src/sanitizers/url.ts` used `.includes('evzone.com')` to validate URLs, making it vulnerable to Open Redirect and SSRF attacks. An attacker could bypass the check using domains like `evzone.com.attacker.com`.
**Learning:** String inclusion checks like `.includes()` are insufficient for validating domain names because they match substrings anywhere in the hostname.
**Prevention:** Always use exact matching (`===`) or suffix matching (`.endsWith()`) when validating domains, ensuring boundaries are correct (e.g., matching `.evzone.com` instead of just `evzone.com`).
