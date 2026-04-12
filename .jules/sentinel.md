## 2024-05-24 - [CRITICAL] Fix URL validation bypass (SSRF/Open Redirect)
**Vulnerability:** `isValidUrl` used `parsed.hostname.includes('evzone.com')` which allows domains like `evzone.com.attacker.com`. `sanitizeUrl` also allowed malicious schemes like `javascript:` by only checking `parsed.protocol !== 'https:'`.
**Learning:** Using `.includes` for domain validation is insecure. Modifying `.protocol` for `javascript:` URLs does not sanitize them properly due to JavaScript `URL` API limitations.
**Prevention:** Always use exact domain matching or strict `.endsWith` for domain validation. Always use an explicit allowlist of protocols and reject all others.
