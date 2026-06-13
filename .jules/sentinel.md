## 2024-04-20 - [Fix weak URL validation vulnerable to SSRF / Open Redirect]
**Vulnerability:** The \`isValidUrl\` function and \`sanitizeUrl\` function in \`src/sanitizers/url.ts\` use \`includes()\` for domain matching, allowing bypasses like \`evzone.com.attacker.com\` or \`attacker.com/evzone.com\`.
**Learning:** Checking for substrings using \`.includes\` on hostname is a common vulnerability leading to Open Redirect and SSRF vulnerabilities.
**Prevention:** Always use strict matching such as exact match (\`===\`) or \`.endsWith()\` making sure to also prefix the required domain with a dot or slash depending on the comparison (or just exact equality if subdomains aren't needed or must be explicitly handled).
