
## 2024-05-16 - SSRF and Open Redirect via Weak Domain Validation
**Vulnerability:** Weak domain validation using `.includes('evzone.com')` allowed attackers to bypass URL checks using domains like `evzone.com.attacker.com` or placing the target domain in query parameters.
**Learning:** `.includes()` should never be used for validating hostnames or URLs as it matches substrings anywhere in the string.
**Prevention:** Always use exact matching (`===`) or strict Regex matching (e.g., `/^([a-z0-9-]+\.)*(evzone\.com)$/i`) anchored to the end of the hostname for URL/domain validation.
