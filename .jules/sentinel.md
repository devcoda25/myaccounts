## 2024-05-24 - Bypass URL Path Validation using Backslashes

**Vulnerability:** The application was using weak path segment validation (`!segment.includes("/")`) to verify OIDC interaction UIDs before passing them to an open redirect destination. This allowed an attacker to bypass the validation using backslashes (e.g., `uid-1234567890123456789\..\..\..\..\etc\passwd`) which bypassed the check and were successfully processed by modern browsers as path traversals.

**Learning:** `String.prototype.includes("/")` is fundamentally insufficient for preventing open redirects or path traversal in environments that support or normalize backslashes (like `window.location.href`). Browsers normalize backslashes to forward slashes during navigation. Additionally, mutating `URL.protocol` to sanitize links silently fails for unsupported/special schemes like `javascript:`.

**Prevention:** Always validate path segments containing dynamic user data using a strict allowlist regex (e.g., `/^[a-zA-Z0-9-_]+$/`). When sanitizing URLs with the `URL` API, explicitly check against a list of allowed protocols instead of attempting to mutate the protocol property.
