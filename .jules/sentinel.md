## 2024-06-25 - [Path Traversal bypass using backslashes]
**Vulnerability:** Path Traversal / Open Redirect in `PatchOidcResume.tsx` due to weak segment validation `!segment.includes("/")`.
**Learning:** Checking only for forward slashes allows bypasses using backslashes (`\`) or other unexpected characters in path components.
**Prevention:** Always use strict allowlists via Regular Expressions (e.g., `/^[a-zA-Z0-9-_]+$/`) to validate dynamic URL segments.
