## 2024-05-18 - [Fix Open Redirect / SSRF bypass]
**Vulnerability:** Weak URL validation in `isValidUrl` allowed open redirect and SSRF by exploiting loose hostname checking (`parsed.hostname.includes('evzone.com')`) and ignoring whitespace/protocol bugs.
**Learning:** Using `includes` on hostnames is dangerous as it allows domains like `evzone.com.attacker.com` or `attacker-evzone.com`. Furthermore, `new URL()` behavior with whitespace or unknown protocols (like `javascript:`) can circumvent naive checks.
**Prevention:** Always use strict regex matching for allowed domains (e.g., `/^([a-z0-9-]+\.)*(domain\.com)$/i`) and validate protocols against an explicit allowlist. Strip whitespace before parsing, and explicitly handle safe relative paths if required by the application.
