## 2024-10-27 - Strict Validation for URLs and Path Segments
**Vulnerability:** Open Redirect and Path Traversal bypasses were possible because URL validation relied on `.includes()` and path segment validation merely excluded `/`. Bypasses like backslashes (`\`) could be used.
**Learning:** Using `String.prototype.includes()` for security-critical validation is prone to bypasses (e.g., `attacker.com?evzone.com`). Special characters in path segments can bypass simple substring exclusion.
**Prevention:** Always use strict regex or exact string matching for domains and path segments. Validate dynamic path segments against an allowlist like `/^[a-zA-Z0-9-_]+$/`.
