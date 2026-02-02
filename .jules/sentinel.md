## 2024-10-18 - [Broken XSS Sanitizer Map]
**Vulnerability:** The `htmlEscapes` map in `src/sanitizers/input.ts` was mapping critical characters (`<`, `>`, `&`) to themselves instead of their HTML entities (e.g., `&lt;`). This rendered the `sanitizeInput` function ineffective against XSS attacks.
**Learning:** Even utility functions named "sanitize" must be verified. A visually checking the code might miss subtle typos like `"<": "<"`.
**Prevention:** Always write unit tests for security utility functions that verify the output against known malicious inputs.
