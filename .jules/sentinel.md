## 2025-02-11 - Insecure URL Validation Utilities
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions in `src/sanitizers/url.ts` used loose string matching (`includes('evzone.com')`), allowing bypasses via domains like `attacker-evzone.com` or `evzone.com.attacker.com`. Additionally, `sanitizeUrl` did not filter dangerous protocols like `javascript:`.
**Learning:** Helper functions intended for security must be rigorously tested with attack vectors. Loose string matching is insufficient for domain validation.
**Prevention:** Use strict equality checks or parsing (e.g., `new URL()`) and validate `hostname` and `protocol` against allowlists. Ensure test coverage includes both valid cases and known bypass attempts.
