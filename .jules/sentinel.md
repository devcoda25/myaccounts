## 2026-02-03 - Broken Input Sanitization
**Vulnerability:** The `sanitizeInput` function had a broken `htmlEscapes` map where special characters like `<` and `>` were mapped to themselves instead of HTML entities. This rendered the sanitization ineffective against XSS attacks.
**Learning:** The developer likely copy-pasted the map keys as values or intended to fill them in later but forgot. Manual implementation of security primitives is error-prone.
**Prevention:** Always verify security utility functions with unit tests that cover malicious payloads. Prefer using established libraries (like `dompurify`) over custom implementations for sanitization.
