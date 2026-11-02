## 2026-11-02 - Prevent URL Validation Bypasses
**Vulnerability:** URLs with whitespace (e.g., `\n`) could bypass protocol checks, and loose hostname matching (`.includes()`) allowed SSRF/Open Redirects.
**Learning:** The `URL` constructor ignores whitespace, parsing `javascript://%0A` as valid. Loose matching allows domains like `evzone.com.evil.com`.
**Prevention:** Always strip whitespace (`/[\n\r\t]/g`), enforce an exact protocol allowlist (`['http:', 'https:']`), and use strict matching (`===` or `.endsWith()`) for hostnames.
