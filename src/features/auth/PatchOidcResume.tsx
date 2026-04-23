import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

/**
 * PatchOidcResume
 * Catches redirects to /auth/* that are not handled by other routes.
 * Specifically targets OIDC interaction UIDs (long strings) and redirects to /oidc/auth/UID.
 */
export default function PatchOidcResume() {
  const { t } = useTranslation("common");
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const segment = path.replace("/auth/", "");

    console.log("[PatchOidcResume] Inspecting path:", path);

    // Ensure the segment and search/hash do not contain path traversal sequences
    // or invalid protocol schemes to prevent Open Redirects / SSRF.
    if (segment && segment.length > 20 && !segment.includes("/")) {
      const target = `/oidc/auth/${segment}${location.search}${location.hash}`;

      // Reject any target that contains a backslash or double slash which could be used for protocol-relative bypass
      if (target.includes("\\") || target.includes("//")) {
        console.error("[PatchOidcResume] Rejected potentially unsafe redirect target:", target);
        return;
      }

      console.log("[PatchOidcResume] redirecting to:", target);
      window.location.href = target;
    } else {
      console.warn("[PatchOidcResume] Path did not match OIDC UID pattern:", segment);
    }
  }, [location]);

  return (
    <div style={{ padding: 40, color: 'white', textAlign: 'center' }}>
      <h1>{t("auth.checkingSession", "Checking security session...")}</h1>
      <p style={{ opacity: 0.7 }}>{location.pathname}</p>
    </div>
  );
}
