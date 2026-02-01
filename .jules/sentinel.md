## 2026-02-01 - Broken Custom Input Sanitizer
**Vulnerability:** Found a custom `sanitizeInput` function that was ineffective because it replaced dangerous characters with themselves (e.g., `.replace(/</g, '<')`), leaving the application vulnerable to XSS.
**Learning:** The custom implementation attempted to escape HTML entities but failed due to incorrect replacement strings. It seems untested.
**Prevention:** Avoid writing custom sanitizers. Use established libraries like `DOMPurify` or ensure comprehensive unit tests exist for any security-critical utility functions.
