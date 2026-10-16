## 2026-10-16 - Insecure URL Validation and Sanitization
**Vulnerability:** The `isValidUrl` and `sanitizeUrl` functions used loose `.includes()` checks for hostnames (e.g., `parsed.hostname.includes('evzone.com')`) and did not strip whitespace before parsing, allowing SSRF/Open Redirect bypasses (e.g., `https://evil-evzone.com` or ` javascript:alert(1)`).
**Learning:** URL constructors parse protocols like `javascript:` without throwing errors. Using `.includes()` for domains is highly susceptible to subdomain or suffix injection bypasses.
**Prevention:** Always use strict exact matching (`===`) or strict suffix matching (`.endsWith('.domain.com')`) for hostnames, enforce explicit protocol allowlists, and strip whitespace characters before parsing.
