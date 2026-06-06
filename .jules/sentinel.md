
## 2024-06-06 - URL Parsing Bypasses in Redirects and Path Traversal
**Vulnerability:** Open Redirect / SSRF (via hostname `.includes()` bypass) and Path Traversal (via backslash `/` exclusion bypass).
**Learning:** Checking for safe domains using `hostname.includes('evzone.com')` allows bypasses like `evzone.com.attacker.com`. Additionally, relying on `!segment.includes('/')` for path traversal prevention is flawed because backslashes `\` or other encoded sequences can bypass it. Using `new URL()` alone doesn't prevent `javascript:` protocols from bypassing hostname checks.
**Prevention:** Use exact strict regex matching (`/^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i`) for domain validation. Remove whitespaces (`[\n\r\t]`) before parsing URLs. Explicitly allowlist protocols (`http:`, `https:`). For path segments, use a strict alphanumeric and dash/underscore allowlist (`/^[a-zA-Z0-9-_]+$/`) rather than blocking specific characters.
