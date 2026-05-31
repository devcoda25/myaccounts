## 2024-05-24 - Fix Path Traversal / Open Redirect Bypass
**Vulnerability:** Weak path segment validation checking only for forward slashes (`!segment.includes('/')`) allowed backslash (`\`) bypasses, leading to Open Redirect and Path Traversal vulnerabilities when injected into `window.location.href`.
**Learning:** Checking for substrings like `/` or `\` is insufficient because browsers handle backslashes interchangeably with forward slashes in URLs.
**Prevention:** Use a strict regular expression like `/^[a-zA-Z0-9-_]+$/` to explicitly allowlist safe characters rather than blacklisting specific characters.
