## 2024-07-23 - Strict URL Validation
**Vulnerability:** URL sanitizers and validators were using `.includes('evzone.com')`, which allows bypasses like `evzone.com.attacker.com` or `attackerevzone.com`. Additionally, malicious payload evaluation (e.g. `javascript:`) was possible.
**Learning:** Never use `.includes` for domain validation. The javascript `URL` object allows malicious payloads to parse without error. Whitespace can be used to bypass URL checking.
**Prevention:** Always enforce a strict protocol allowlist (`['http:', 'https:']`) and use strict equality (`===`) combined with strict suffix matching (`.endsWith('.evzone.com')`) for hostnames. Strip whitespace before parsing and handle safe relative paths explicitly.
