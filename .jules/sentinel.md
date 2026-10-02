## 2026-10-02 - [Fix XSS via javascript: protocol]
**Vulnerability:** The URL sanitizer and hostname extractor parsed the javascript: protocol without throwing an error, leading to an empty hostname and XSS bypasses.
**Learning:** The URL constructor allows javascript: protocols silently.
**Prevention:** Enforce strict protocol allowlists and strip whitespace before URL parsing.
