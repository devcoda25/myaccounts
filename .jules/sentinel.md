## 2026-09-04 - Fix SSRF and Open Redirect in URL utilities
**Vulnerability:** URL validation used `.includes('evzone.com')` allowing bypasses like `attacker-evzone.com`. Missing whitespace stripping and strict protocol allowlists allowed URL constructor bypasses.
**Learning:** `new URL()` is vulnerable to whitespace injection, and `.includes` for domain matching is an SSRF vector.
**Prevention:** Always strip `\n\r\t`, explicitly allow safe relative paths, and use strict suffix matching for domain validation along with strict protocol checking.
