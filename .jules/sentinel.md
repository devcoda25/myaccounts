## 2024-07-09 - [High] Open Redirect / SSRF Bypass via URL validation string matching
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions validated domains using `parsed.hostname.includes('evzone.com')` instead of strict matching.
**Learning:** Using `.includes` for domain validation allows attackers to easily bypass checks by appending the target domain as a subdomain (e.g., `https://evzone.com.attacker.com`). Malicious protocols (`javascript:`) and whitespace parsing bypasses must also be strictly guarded.
**Prevention:** Always validate hostnames using strict equivalence (`===`) or robust regex domain validations that account for subdomains safely. Strip whitespace characters from URLs before parsing to prevent newline or tab injection bypasses.
