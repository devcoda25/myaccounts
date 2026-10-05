## 2026-10-05 - [CRITICAL] Prevent URL Parsing Bypasses with Whitespace

**Vulnerability:** URL sanitization utilities relied on the URL constructor, which accepts whitespace and newlines before protocols like javascript:, allowing bypasses.
**Learning:** The URL constructor strips some whitespace but allows others before parsing the protocol. This can bypass naive checks if not stripped before parsing or if the protocol isn't strictly validated.
**Prevention:** Always strip whitespace characters explicitly using exactly url.replace(/[\n\r\t]/g, '').trim() before passing URLs to the URL constructor, and strictly validate against an allowlist like ['http:', 'https:'].
