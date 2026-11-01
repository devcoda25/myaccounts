## 2026-11-01 - SSRF and Open Redirect Vulnerability via Loose Hostname Matching
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions used `.includes('evzone.com')` and `.includes('evzone')` for validation, allowing bypasses like `evzone.com.attacker.com`. Additionally, whitespace injection was possible before URL parsing.
**Learning:** The `URL` constructor's hostname property requires exact matching or strict suffix matching to be securely validated. Loose substring matching is insufficient for security controls.
**Prevention:** Always strip whitespace (`replace(/[\n\r\t]/g, '').trim()`), strictly enforce a protocol allowlist (`['http:', 'https:']`), and use exact matching (`===`) or strict suffix matching (`.endsWith()`) for hostnames.
