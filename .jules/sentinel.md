# Sentinel's Journal

## 2024-05-22 - Hardcoded Demo Credentials
**Vulnerability:** Found hardcoded "Demo password" helper texts and a hardcoded default password for new users in the source code.
**Learning:** The codebase contains remnants of a "demo" or "prototype" phase where security was bypassed for convenience. These artifacts were left in potential production paths.
**Prevention:** Thorough code review for "demo", "test", or "password" strings before release. Ensure no hardcoded credentials exist even in "unused" features.
