## 2024-07-20 - [SSRF & Open Redirect] Weak URL validation
**Vulnerability:** Weak domain matching (`.includes('evzone.com')`) in URL validation and sanitization.
**Learning:** `includes` allows domains like `evzone.com.attacker.com` or `attacker-evzone.com`, bypassing domain restrictions.
**Prevention:** Use strict equality (`===`) and strict suffix matching (`.endsWith('.evzone.com')`) for subdomains instead of `includes`. Ensure strict protocol allowlist and whitespace stripping.
