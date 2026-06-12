## 2024-06-12 - [Critical] Open Redirect Bypass via .includes() Hostname Validation

**Vulnerability:** The URL sanitizer `isValidUrl` relied on `parsed.hostname.includes('evzone.com')` to validate allowed hosts. An attacker could bypass this check by supplying a malicious hostname that simply contains the string, such as `https://evzone.com.attacker.com` or `javascript:alert(1)//evzone.com`. Additionally, unguarded dynamic URL assignments to `window.location.href` in client-side navigation paths (e.g., in `/auth/continue` and `/auth/signed-out`) allowed malicious user-supplied URIs to execute XSS or open redirect attacks.

**Learning:** String inclusion checks (`.includes()`) on the `hostname` property of the `URL` object are insufficient for secure domain validation and are a common vector for Open Redirect and SSRF bypasses. The JavaScript `URL` constructor's behavior when parsing whitespace or protocols like `javascript:` requires scrubbing whitespace prior to validation. Always strictly validate domain properties instead of checking for substrings. Furthermore, any assignment to `window.location.href` using external inputs must explicitly trigger the validation check and offer a secure routing fallback.

**Prevention:**
1. Use exact matches (`===`) or strict Regex (e.g., `/^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i`) anchored firmly to the start and end of the hostname string for URL domain allowlists.
2. Clean URLs of whitespace characters (e.g., `url.replace(/[\n\r\t]/g, '')`) before parsing with the `URL` constructor to prevent structural injection attacks.
3. Explicitly wrap any `window.location.href` assignments of dynamic or user-supplied URLs in strict validation logic (e.g., `if (isValidUrl(redirectUri))`), and always supply a safe fallback client-side routing option (e.g., `navigate('/app')`).
