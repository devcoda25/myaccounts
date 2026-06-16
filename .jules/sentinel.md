## 2024-05-20 - Fix Open Redirect Bypass
**Vulnerability:** Open redirect and SSRF bypass in `isValidUrl` utility due to use of `.includes()` and missing whitespace stripping.
**Learning:** Using `.includes('evzone.com')` for domain validation is easily bypassed by domains like `evzone.com.attacker.com`. Furthermore, the JavaScript `URL` constructor can be manipulated with newlines or tabs (e.g., `javascript:\nalert(1)`) to bypass validation.
**Prevention:** Always validate domains using exact matches or strict anchor-based Regular Expressions (`/^...$/`). Always strip whitespace characters like `\n`, `\r`, and `\t` from URLs before parsing them with `new URL()` to ensure accurate protocol/domain extraction.
