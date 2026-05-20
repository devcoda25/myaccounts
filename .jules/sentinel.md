## 2024-05-20 - URL Validation Bypass via Path Segments and Protocols

**Vulnerability:** Open Redirect and Path Traversal vulnerabilities due to weak URL domain checking (`.includes()`), weak path segment validation (`!segment.includes('/')`), and unsafe fallback mechanisms that allowed arbitrary protocol execution or relative path fallbacks.

**Learning:** Naively checking for unsafe characters (like `/`) or using substring matches (`.includes()`) for domains fails to account for alternative bypasses, such as backslashes `\` for path traversal, attacker domains prefixed/suffixed with trusted strings, or malicious schemas (e.g., `javascript:alert(1)//evzone.com`). Additionally, assigning `window.location.href` without verifying the validated URL can lead to unintended execution.

**Prevention:** Always use strict Regex (e.g., `/^[a-zA-Z0-9-_]+$/`) to validate path segments. For URLs, strictly validate domains using exact matches or well-anchored regexes (e.g., `/^([a-z0-9-]+\.)*(evzone\.com|evzone\.app|evzonemarketplace\.com)$/i`), enforce explicit protocol allowlists (e.g., `https:`, `http:`), and validate the redirect URL just prior to navigation, providing a safe client-side routing fallback if validation fails.
