## 2026-10-16 - [Strict Hostname and Protocol Validation]
**Vulnerability:** Loose URL validation using .includes() allowed SSRF/Open Redirect bypasses. Missing whitespace stripping and protocol allowlists allowed newline injection and javascript: protocol XSS bypasses.
**Learning:** Using .includes() on hostnames is insecure because it matches sub-strings anywhere. The URL constructor parses javascript: without throwing an error, making strict protocol allowlists and whitespace stripping necessary before any validation or usage.
**Prevention:** Always use exact matching (===) or strict suffix matching (.endsWith()) for hostnames. Always strip whitespace characters and enforce strict protocol allowlists like ['http:', 'https:'] explicitly.
