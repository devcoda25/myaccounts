## 2026-10-28 - Fix insecure URL validation
**Vulnerability:** URL validation loosely matches domain names using `.includes()`, allowing SSRF or Open Redirect via subdomains of attacker domains (e.g., `evil-evzone.com`). URLs also aren't stripped of whitespace before parsing, potentially bypassing `new URL()` validation.
**Learning:** `new URL()` handles whitespace incorrectly in some contexts, and `.includes()` is dangerous for hostname validation as it doesn't strictly assert the domain suffix.
**Prevention:** Use exact match or strict suffix matching (`.endsWith('.domain.com')`) for hostnames, explicitly allowlist protocols, and strip whitespace characters before parsing URLs.
