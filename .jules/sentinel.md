## 2024-05-24 - Strict Regex Validation for Dynamic Path Segments
**Vulnerability:** Open Redirect and Path Traversal bypasses were possible due to weak URL path segment validation (using `!segment.includes('/')`). Attackers could use backslashes or other unsafe characters to bypass this weak check.
**Learning:** Checking for the absence of specific unsafe characters (like `/`) is insufficient for validating dynamic URL segments, as other characters (like `\`) can sometimes be interpreted similarly by browsers or servers, leading to bypasses.
**Prevention:** Always use strict validation with a safe character allowlist regex (e.g., `/^[a-zA-Z0-9-_]+$/`) for dynamic path segments to prevent Open Redirect and Path Traversal vulnerabilities.
