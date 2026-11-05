## 2026-11-05 - [SSRF & XSS Bypass in URL Sanitization]
**Vulnerability:** URL validation used loose matching (`.includes('evzone.com')`) allowing SSRF via attacker domains (e.g., `attacker-evzone.com`). It also allowed dangerous protocols like `javascript:` leading to XSS.
**Learning:** The `URL` constructor parses `javascript:` without throwing errors, and `.includes()` on hostnames is prone to substring bypasses.
**Prevention:** Always use strict exact matching or `.endsWith()` for hostnames, explicitly allowlist `http:` and `https:` protocols, and strip whitespace characters before parsing URLs.
