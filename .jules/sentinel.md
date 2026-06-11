## 2024-11-20 - [Path Traversal bypass via backslashes in URL segments]
**Vulnerability:** Open Redirect and Path Traversal bypass when assigning to `window.location.href`.
**Learning:** Checking for forward slashes (`!segment.includes('/')`) is insufficient to prevent path traversal because attackers can use backslashes (`..\..\..\malicious`) which bypass the check but are interpreted as valid path separators by the browser.
**Prevention:** Always prevent these by strictly validating dynamic segments against a safe character allowlist regex like `/^[a-zA-Z0-9-_]+$/`.
