## 2024-05-24 - URL Validation SSRF
**Vulnerability:** Weak domain validation using .includes() and missing protocol allowlists.
**Learning:** Subdomain matching requires strict suffix checks.
**Prevention:** Use strict equality, suffix matching, and protocol allowlists.
