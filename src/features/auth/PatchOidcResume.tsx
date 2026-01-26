import { useEffect } from "react";
import { useParams } from "react-router-dom";

/**
 * PatchOidcResume
 * Catches redirects to /auth/:uid (missing /oidc prefix)
 * and corrects them to /oidc/auth/:uid
 */
export default function PatchOidcResume() {
    const { uid } = useParams();

    useEffect(() => {
        if (uid) {
            console.log("[PatchOidcResume] Correction redirect to:", `/oidc/auth/${uid}`);
            window.location.href = `/oidc/auth/${uid}`;
        }
    }, [uid]);

    return null;
}
