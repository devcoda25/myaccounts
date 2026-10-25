## 2026-10-25 - [Strict URL Validation]
**Vulnerability:** Loose string matching using `.includes()` in URL hostnames.
**Learning:** Whitespace stripping and exact hostname matching are required for correct URL validation.
**Prevention:** Always strip whitespaces, enforce protocol allowlist, and use strict exact (`===`) or suffix (`.endsWith()` prefix) matching for hostnames.
