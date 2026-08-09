## 2024-08-09 - [CRITICAL] Fix SSRF and Open Redirect in URL utilities
**Vulnerability:** isValidUrl and sanitizeUrl used .includes('evzone.com') allowing bypass via malicious domains like attacker-evzone.com. They also failed to restrict protocols, sanitize whitespace, and explicitly support relative paths.
**Learning:** Relying on .includes for domain validation is easily bypassed. The built-in URL constructor doesn't sanitize whitespace before parsing, which can lead to bypasses, and requires separate handling for relative paths.
**Prevention:** Use strict equality and suffix matching (.endsWith) for domains. Always strip whitespace, explicitly handle safe relative URLs before parsing, and enforce strict protocol allowlists.
