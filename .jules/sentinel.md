## 2026-10-10 - Prevent XSS and URL parsing bypass via whitespace injection
**Vulnerability:** URL parsing functions were vulnerable to whitespace injection (e.g., `\njavascript:...`) and lacked strict protocol enforcement in `sanitizeUrl` and `extractHostname`, potentially allowing XSS or hostname extraction bypasses.
**Learning:** The `URL` constructor parsing can be bypassed if malicious whitespace is present, or if `javascript:` protocols are parsed without explicitly rejecting them, as they may result in empty hostnames.
**Prevention:** Always explicitly strip whitespace (`/[\n\r\t]/g`) before parsing URLs and strictly enforce a protocol allowlist (`['http:', 'https:']`) before further processing.
