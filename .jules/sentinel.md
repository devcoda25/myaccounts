## 2024-04-14 - Fix Open Redirect and Path Traversal bypass via Backslashes
**Vulnerability:** Open Redirect and Path Traversal due to weak URL segment validation using string exclusion (`!segment.includes('/')`). Attackers could bypass this using backslashes (`\`).
**Learning:** Bypassing directory/path separator checks is possible in URLs if only forward slashes are blocked, as backslashes can still be interpreted by browsers for navigation.
**Prevention:** Use a strict regex allowlist (`/^[a-zA-Z0-9-_]+$/`) to validate path segments rather than relying on weak exclusion techniques.
