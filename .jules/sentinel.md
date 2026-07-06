## 2024-05-16 - [CRITICAL] Fix Open Redirect and XSS in URL Validation
**Vulnerability:** URL validation used `.includes()` for hostname checks, allowing bypasses like `evzone.com.attacker.com`. URL sanitization didn't restrict protocols, allowing `javascript:` URIs.
**Learning:** Always use strict domain regexes or exact matching for hostnames and explicit allowlists for protocols when parsing URLs.
**Prevention:** Ensure URL sanitization functions strip whitespace, allowlist protocols, and use exact/regex matching for domains.
