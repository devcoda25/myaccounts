
## 2024-11-20 - [Fix Open Redirect / Path Traversal via Weak Validation]
**Vulnerability:** In `src/features/auth/PatchOidcResume.tsx`, the `!segment.includes("/")` check was intended to ensure an OIDC identifier doesn't contain path slashes. However, this weak denylist approach allowed backslashes (e.g. `\..\..\evil.com`), leading to Open Redirect and potential Path Traversal vulnerabilities when injected into URLs.
**Learning:** Checking for the absence of specific characters (denylisting) in path parameters or URLs is generally insufficient and easily bypassed due to differing path separators or URL parsing behaviors across runtimes and browsers.
**Prevention:** Always use strict allowlist validation (e.g., regex `^[a-zA-Z0-9-_]+$`) for dynamically constructed paths or URLs when standard identifiers like UIDs are expected.
