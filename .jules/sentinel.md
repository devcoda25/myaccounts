## 2025-02-23 - [High] Fix Open Redirect / SSRF bypass in URL validation

**Vulnerability:** Weak URL hostname validation using `.includes('evzone.com')` allowed attackers to bypass checks by registering domains like `evzone.com.attacker.com` or creating malicious subdomains on third-party services that happen to contain the target string. Also, not checking for protocol beforehand when evaluating URL correctness enabled the usage of `javascript:` to inject XSS inside `isValidUrl`.

**Learning:** When validating domain names, `.includes()` is extremely vulnerable to bypasses. Additionally, the standard URL constructor parses `javascript:alert(1)//evzone.com` as a `javascript:` protocol with an empty hostname instead of failing, and omitting strict protocol validation opens up client-side bypasses. Similarly, relative URL logic needs robust path checking so it does not incorrectly pass malicious protocol relative URLs like `//attacker.com`.

**Prevention:** Always use strict regex domain validation like `/^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i` or exact matching. Always validate protocol schemas before considering a URL as safe. Filter whitespace characters `/[\n\r\t]/g` before URL parsing.
