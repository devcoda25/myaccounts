## 2026-10-14 - Fix Insecure URL Validation and Sanitization
**Vulnerability:** Loose string matching (`.includes`) in URL hostnames allowed SSRF and Open Redirect bypasses (e.g. `attacker.com/evzone.com` or `evzone.com.attacker.com`). Missing protocol enforcement in `sanitizeUrl` permitted `javascript:` XSS injection.
**Learning:** The URL constructor successfully parses the `javascript:` protocol. Loose matching like `hostname.includes` is easily bypassed with subdomains or malicious TLD extensions.
**Prevention:** Always explicitly strip whitespace (`/[\n\r\t]/g`), enforce strict protocol allowlists (`['http:', 'https:']`), and use strict exact (`===`) or suffix (`.endsWith`) matching for domain validation.
