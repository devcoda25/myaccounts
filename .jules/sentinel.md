## 2024-05-24 - Strict Regex for URL Segment Validation
**Vulnerability:** Weak path segment validation (e.g. `!segment.includes('/')`) allows for path traversal and open redirects via backslashes and other special characters.
**Learning:** Checking for the absence of specific characters like slashes is not sufficient for sanitizing URL segments. Attackers can bypass this using backslashes which browsers may normalize.
**Prevention:** Always use strict character allowlists (e.g., `/^[a-zA-Z0-9-_]+$/`) to validate dynamic URL segments before using them in redirects.
