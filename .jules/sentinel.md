# Sentinel's Journal

## 2026-02-10 - URL Sanitization Bypass
**Vulnerability:** The `sanitizeUrl` function in `src/sanitizers/url.ts` parsed URLs using `new URL()` but failed to validate the protocol, allowing `javascript:`, `vbscript:`, and `data:` schemes which could lead to XSS.
**Learning:** `new URL()` only parses; it does not validate safety. Relying on parsing alone is insufficient for security. Developers often assume "parsing succeeded" means "URL is safe".
**Prevention:** Always explicitly allowlist protocols (e.g., `http:`, `https:`) when accepting user-provided URLs. Never rely on the absence of an error from a parser.
