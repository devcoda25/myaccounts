## 2024-10-24 - [CRITICAL SSRF/Open Redirect in URL Validator]
**Vulnerability:** URL validation bypass due to `.includes('evzone.com')` allowing malicious hostnames like `attacker-evzone.com`. Relative paths and whitespaces were unhandled leading to injection/routing errors.
**Learning:** `new URL()` does not throw on `javascript:alert(1)//domain.com` and creates an empty hostname, bypassing checks. Loose `.includes()` allows substring bypass. Unstripped whitespace bypasses validators.
**Prevention:** Always strip whitespaces (`replace(/[\n\r\t]/g, '').trim()`), explicitly allow safe relative paths, strictly allowlist protocols, and use strict equality (`===`) or strict suffix (`.endsWith('.')`) for subdomains.
