## 2024-05-15 - Strict Domain Validation & SSRF Prevention
**Vulnerability:** URL validation was vulnerable to SSRF/Open Redirect by using loose `.includes()` checks and mishandling relative vs absolute URLs.
**Learning:** Validating domains with `.includes('domain.com')` allows bypasses via subdomains like `domain.com.attacker.com`. Relative URL parsing requires specific rules to avoid protocol-less bypasses.
**Prevention:** Always strictly validate domain boundaries using exact matching or strict regex (`/^([a-z0-9-]+\.)*domain\.com$/i`) and strip hidden characters before parsing.
