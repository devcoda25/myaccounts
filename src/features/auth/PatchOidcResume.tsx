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

    // Ensure the segment is only alphanumeric (and possibly dashes/underscores), preventing path traversal and open redirects
    const uidPattern = /^[a-zA-Z0-9_-]{21,}$/;

    if (segment && uidPattern.test(segment)) {
      const target = `/oidc/auth/${segment}${location.search}${location.hash}`;
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
