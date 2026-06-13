
## 2024-03-13 - Dashboard App URL XSS
**Vulnerability:** The dashboard renders dynamic URLs from the API (`app.url`) directly in the `href` attribute of an `<a>` element. If an attacker controls the API response and injects a `javascript:` URL, it could execute malicious scripts when the user clicks the application card.
**Learning:** Dynamic URLs used in `href` or `src` attributes, especially those sourced from external or API data, should always be sanitized to prevent XSS attacks via dangerous schemas like `javascript:` or `data:`.
**Prevention:** Always wrap dynamically sourced URLs with a robust sanitization function like `sanitizeUrl()` before rendering them in anchor tags or image sources.
