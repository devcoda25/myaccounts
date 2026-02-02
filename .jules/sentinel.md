## 2024-05-21 - Broken Input Sanitizer
**Vulnerability:** The `sanitizeInput` function in `src/sanitizers/input.ts` was mapping critical HTML characters (`<`, `>`, `&`) to themselves instead of their escaped entities.
**Learning:** Security utilities must be verified with tests. The existence of a `sanitizeInput` function gave a false sense of security, but it was effectively a no-op for XSS vectors.
**Prevention:** Always write unit tests for security-critical functions. Verify that "sanitized" output is actually safe.
