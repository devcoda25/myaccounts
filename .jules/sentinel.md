
## 2025-02-13 - [Strict URL Validation]
**Vulnerability:** The URL validation logic used `.includes()` for validating the domain, which allowed for bypasses like `https://evzone.com.attacker.com` leading to SSRF or Open Redirects. Also didn't strip out whitespaces which can bypass the protocol check in URL constructors.
**Learning:** Using `.includes()` on URL domains is an anti-pattern. Also, URL constructors handle whitespaces and tabs in URLs unpredictably, which can bypass checks.
**Prevention:** Always use regex for strict domain matching (e.g. `^([a-z0-9-]+\.)*domain\.com$`) and strip whitespaces `\n\r\t` before passing to a `URL()` constructor.
