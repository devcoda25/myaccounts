## 2024-05-15 - Patch Path Traversal and Open Redirect in PatchOidcResume
**Vulnerability:** The route checking in `PatchOidcResume.tsx` was vulnerable to path traversal and open redirect because it used a weak string exclusion check (`!segment.includes("/")`) to validate the OIDC UID segment. This could be bypassed using backslashes (e.g., `\\`).
**Learning:** Checking for the absence of specific characters is a weak form of validation and prone to bypasses, especially when dealing with URLs and paths where different representations might be interpreted similarly by the browser or server.
**Prevention:** Always use strict allowlist validation (e.g., matching a safe character regex like `/^[a-zA-Z0-9-_]+$/`) instead of denylist approaches like string exclusions.
