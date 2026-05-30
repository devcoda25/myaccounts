
## 2026-05-30 - Open Redirect via Weak Domain Validation

**Vulnerability:** User-provided `redirectUri` parameters were assigned directly to `window.location.href` after a flawed `.includes('evzone.com')` domain check, allowing Open Redirects to bypasses like `evzone.com.attacker.com`.
**Learning:** Using `.includes()` on hostnames is an anti-pattern for security checks, as attackers can construct subdomains or domains containing the target string to bypass the validation. Furthermore, the `URL` parsing logic does not throw on valid relative paths, causing strict parsers to reject legitimate navigation.
**Prevention:** Always validate hostnames using exact matching (`===`) or strict, anchored regular expressions (`/^([a-z0-9-]+\.)*(evzone\.com)$/i`). Explicitly allow safe relative paths using regex `/^\/(?!\/|\.|\\)/`. Validate parameters dynamically before they are assigned to sinks like `window.location.href`.
