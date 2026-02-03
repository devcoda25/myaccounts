## 2024-05-22 - Incomplete URL Sanitization
**Vulnerability:** The `sanitizeUrl` utility relied on `new URL()` throwing an error to detect invalid URLs, but `javascript:alert(1)` is a valid URL and was not blocked.
**Learning:** `new URL()` is a parser, not a validator. It accepts any valid URI scheme including dangerous ones like `javascript:`, `vbscript:`, `data:`.
**Prevention:** Always strictly whitelist allowed protocols (e.g., `http:`, `https:`) when sanitizing URLs.
