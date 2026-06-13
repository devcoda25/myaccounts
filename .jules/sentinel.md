## 2024-11-06 - XSS Vulnerability in Dynamic Links
**Vulnerability:** Dynamic URLs from an API response were passed directly to `href` attributes in React components (e.g., `<Paper component="a" href={app.url}>`). This allowed potential XSS if the API returned a payload like `javascript:alert(1)`.
**Learning:** React does not automatically escape dynamic `href` or `src` values. Any unvalidated URL injected into these attributes can execute arbitrary JavaScript in the user's browser context.
**Prevention:** Always wrap dynamic URLs injected into DOM attributes with a sanitizer like `sanitizeUrl()` to strip dangerous schemas (e.g., `javascript:`, `vbscript:`, `data:text/html`).
