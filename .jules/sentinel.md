## 2026-08-31 - SSRF and Open Redirect Bypass via .includes()
**Vulnerability:** URL validation used .includes('evzone.com') for domain matching, allowing bypasses with malicious domains like 'attacker-evzone.com' or 'evzone.com.attacker.com'. Additionally, URL parsing without stripping whitespace could allow protocol injection bypasses.
**Learning:** Never use .includes() for domain validation. Whitespace must be stripped before URL parsing. Safe relative paths must be explicitly allowed before passing to new URL() as relative paths throw a TypeError.
**Prevention:** Use strict equality (=== 'domain.com') combined with strict suffix matching (.endsWith('.domain.com')) for subdomains. Always strip whitespace and enforce a strict protocol allowlist.
