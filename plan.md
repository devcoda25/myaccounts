1. **Fix `src/sanitizers/url.ts`**:
   - Update `isValidUrl` to correctly validate trusted domains (`evzone.com`, `evzone.app`, `evzonemarketplace.com`) and prevent SSRF/Open Redirects using exact matching or `.endsWith()`.
   - Update `sanitizeUrl` to effectively mitigate XSS by ensuring only `http:` and `https:` protocols are allowed, rejecting `javascript:` and other potentially unsafe schemes. Allow safe relative paths, while rejecting protocol-relative URLs (`//`).

2. **Fix `src/features/auth/continue/Index.tsx`**:
   - Apply the updated `sanitizeUrl` or `isValidUrl` validation to `ctx.redirectUri` before setting `window.location.href = ctx.redirectUri` to prevent Open Redirects.

3. **Complete pre commit steps**
   - Complete pre commit steps to make sure proper testing, verifications, reviews and reflections are done.
