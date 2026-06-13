## 2026-02-13 - Hostname Spoofing via Loose Validation
**Vulnerability:** The `isValidUrl` utility used `hostname.includes('evzone.com')`, which allowed malicious domains like `malicious-evzone.com` or `evzone.com.attacker.com` to bypass validation.
**Learning:** Using `String.prototype.includes()` for URL validation is insecure as it does not enforce structural constraints on the hostname.
**Prevention:** Always validate hostnames by checking for exact matches or strictly validating the suffix (e.g., `hostname === domain || hostname.endsWith('.' + domain)`).
