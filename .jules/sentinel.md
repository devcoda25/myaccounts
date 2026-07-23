## 2024-07-23 - URL Sanitization and Open Redirect Prevent
**Vulnerability:** The URL sanitizer and validator allowed `.includes('evzone.com')` which permitted `evzone.com.attacker.com`, and `sanitizeUrl` didn't strictly validate other protocols which permitted `javascript:` execution.
**Learning:** Strict equality or explicit subdomain checking and protocol allowlisting is necessary for security. Also whitespace needs to be trimmed first.
**Prevention:** Always use strict domain matching (`=== 'domain.com' || endsWith('.domain.com')`) and explicit protocol arrays in URL processing.
