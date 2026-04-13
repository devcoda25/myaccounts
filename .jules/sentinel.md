
## 2024-04-13 - Path Traversal / Open Redirect in PatchOidcResume
**Vulnerability:** Weak path segment validation allowed bypass using backslashes.
**Learning:** Using !segment.includes('/') is insufficient to prevent path traversal/open redirect, as attackers can use backslashes.
**Prevention:** Always validate dynamic segments against a strict allowlist regex like /^[a-zA-Z0-9-_]+$/.
