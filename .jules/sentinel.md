
## 2024-04-03 - Open Redirect & DOM XSS in Auth Flows
**Vulnerability:** User-controlled `redirect_uri` parameters were directly assigned to `window.location.href` in `src/features/auth/continue/Index.tsx` and `src/features/auth/signed-out/Index.tsx` without proper sanitization. The existing `isValidUrl` check insecurely relied on `.includes('evzone.com')` instead of strict matching.
**Learning:** `window.location.href = url` assignments are dangerous if the URL can contain the `javascript:` schema (XSS) or untrusted domains (Open Redirect). Using `.includes` for domain verification is easily bypassed (e.g., `evzone.com.attacker.com`).
**Prevention:** Always validate domains using exact equality (`===`) or suffix matching (`endsWith`). Ensure the protocol is strictly limited to safe schemas like `http:` or `https:`, or validate relative paths properly (starting with `/` but not `//`).
