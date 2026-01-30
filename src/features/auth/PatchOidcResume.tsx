import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

/**
 * PatchOidcResume
 * Catches redirects to /auth/* that are not handled by other routes.
 * Specifically targets OIDC interaction UIDs (long strings) and redirects to /oidc/auth/UID.
 */
export default function PatchOidcResume() {
  const { t } = useTranslation("common"); {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname; // e.g. /auth/xm9I_1K9h90GE_f_dd07P
        const segment = path.replace("/auth/", "");

        console.log("[PatchOidcResume] Inspecting path:", path);

        // Filter out known static routes just in case (though Router scoring should handle them)
        // Interaction UIDs are usually 21+ chars (nanoid)
        if (segment && segment.length > 20 && !segment.includes("/")) {
            const target = `/oidc/auth/${segment}${location.search}${location.hash}`;
            console.log("[PatchOidcResume] redirecting to:", target);
            window.location.href = target;
        } else {
            console.warn("[PatchOidcResume] Path did not match OIDC UID pattern:", segment);
        }
    }, [location]);

    return (
        <div style={{ padding: 40, color: 'white', textAlign: 'center' }}>
            <h1>Checking security session...</h1>
            <p style={{ opacity: 0.7 }}>{location.pathname}</p>
        </div>
    );
}
