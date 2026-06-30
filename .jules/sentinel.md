## 2026-06-30 - Fix SSRF and Open Redirect in URL Validation
**Vulnerability:** The url sanitization functions relied on .includes() for validation and lacked protocol allowlists, allowing XSS via javascript: URIs and SSRF via subdomains like evzone.com.attacker.com.
**Learning:** When using the JavaScript URL constructor, missing protocol checks can allow javascript: assignment, and simple substring matching for hostnames is insufficient against subdomain bypasses.
**Prevention:** Always use strict protocol allowlists and exact matching or strict Regex for domain validation. Ensure safe relative paths are explicitly allowed to prevent breaking legitimate routing.
