## 2024-06-15 - Open Redirect via Insecure Domain Validation Bypass

**Vulnerability:**
The `isValidUrl` function in `src/sanitizers/url.ts` previously used `.includes('evzone.com')` on `parsed.hostname` to validate target domains for redirection. This naive substring matching approach is vulnerable to bypasses because attackers can register domains containing the substring (e.g., `evzone.com.attacker.com` or `attackerevzone.com`), allowing Open Redirects and potentially Server-Side Request Forgery (SSRF) when this validation is used to assign targets for `window.location.href`. In addition, using the URL constructor directly without stripping control characters enables parsing bypasses (e.g., with newlines).

**Learning:**
String methods like `.includes()` or `.endsWith()` are notoriously insecure for domain name validation since they do not respect domain boundaries. Additionally, parsing URLs using the `URL` API requires carefully ensuring that preceding invisible whitespace doesn't distort the actual parsed domain properties.

**Prevention:**
Always use exact matching (`===`) or highly restrictive Regular Expressions when validating allowed domains to prevent SSRF and Open Redirects. When supporting dynamic subdomains, the regex must strictly assert domain boundaries (e.g., `/^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i`). Furthermore, always strip whitespace characters such as `\n`, `\r`, `\t` from the input before passing it to `new URL()` to circumvent parser confusion. For untrusted, dynamic redirections, assignments to `window.location.href` must always be wrapped in a conditional ensuring the URL conforms to the strict validation.
