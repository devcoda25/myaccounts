
## 2024-10-27 - [Path Traversal via Backslash in Validation]
**Vulnerability:** A path validation check in `PatchOidcResume` used `!segment.includes("/")` which could be bypassed using backslashes `\` leading to potential path traversal or open redirect.
**Learning:** The URL parser might treat `\` differently or as a valid path character, rendering simple exclusion checks insufficient.
**Prevention:** Always use an allow-list regex (e.g., `/^[a-zA-Z0-9-_]+$/`) instead of a block-list string exclusion to validate path segments.
