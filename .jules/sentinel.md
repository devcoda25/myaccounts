## 2024-05-02 - Insecure Domain Validation via `.includes()`
**Vulnerability:** Open Redirect and Server-Side Request Forgery (SSRF) bypass due to weak domain validation. The `isValidUrl` function checked if a domain was allowed using `.includes('evzone.com')`. An attacker could bypass this by registering a domain like `evzone.com.attacker.com` or `not-evzone.com`.
**Learning:** The `.includes()` method is inherently insecure for validating domain names or origins because it matches substrings anywhere in the input.
**Prevention:** Always use exact matching (`===`) or strict suffix matching (`.endsWith('.evzone.com')` combined with `=== 'evzone.com'`) when validating domains, hostnames, or origins.
