# Sentinel's Journal

## 2026-02-12 - Weak URL Validation Pattern
**Vulnerability:** Found `isValidUrl` using `hostname.includes('evzone.com')` instead of strict checking. This allowed domains like `evzone.com.evil.com` to bypass validation.
**Learning:** `String.prototype.includes()` is insufficient for security boundaries like domain validation. It's a common oversight when trying to allow subdomains.
**Prevention:** Always validate hostnames using strict equality (`=== 'domain.com'`) OR checking for a suffix (`.endsWith('.domain.com')`) to securely allow subdomains.
