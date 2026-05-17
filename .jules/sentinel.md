## 2024-05-15 - Open Redirect and Path Traversal bypass
**Vulnerability:** Open Redirect in `window.location.href = redirectUri` and Path Traversal bypass via backslashes in URL segment validation `!segment.includes("/")`.
**Learning:** Checking for substrings like `!segment.includes("/")` is insufficient because path traversal can also occur using backslashes `\`. Also, unsanitized assignment to `window.location.href` leads to Open Redirect vulnerabilities.
**Prevention:** Always validate URL segments using a strict allowlist regex (e.g., `/^[a-zA-Z0-9-_]+$/`) instead of weak exclusion checks. For URL redirects, use a robust `isValidUrl` validator to verify the destination host against trusted domains.
