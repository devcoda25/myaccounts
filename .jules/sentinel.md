
## 2024-05-24 - [Open Redirect via Weak Hostname Validation Bypass]
**Vulnerability:** Open Redirect / SSRF
**Learning:** Using `.includes()` on a URL hostname (e.g., `parsed.hostname.includes('evzone.com')`) is insecure and can be bypassed by an attacker registering a domain like `evzone.com.attacker.com` or creating a subdomain `evzone.com` on their domain. Furthermore, assigning `window.location.href` to user-supplied input without strictly validating the domain allows attackers to redirect users to malicious sites, potentially capturing sensitive info or OAuth tokens.
**Prevention:** Always use exact matching or strict regex anchored matching (e.g., `/^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i`) for domain validation. Ensure dynamic redirects assigned to `window.location.href` are first validated using these strict methods. Provide a safe local fallback (like `navigate('/app')`) if validation fails.
