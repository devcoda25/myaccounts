## 2024-05-23 - Missing Content Security Policy
**Vulnerability:** The application lacked a Content Security Policy (CSP), exposing it to XSS and data exfiltration risks.
**Learning:** Single Page Applications (SPAs) without a dedicated backend serving the HTML often miss CSP headers. A `<meta>` tag is a viable alternative but requires careful configuration for dev/prod environments.
**Prevention:** Enforce CSP in `index.html` or via server headers for all new projects. Use `unsafe-inline` pragmatically for React/Vite if strictly necessary but aim for strict CSP where possible.
