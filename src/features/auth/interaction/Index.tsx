import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

/**
 * Interaction Dispatcher
 * OIDC provider sends users to /interaction/:uid (frontend route).
 * This component redirects to the OIDC interaction endpoint on the SAME ORIGIN:
 *   /oidc/interaction/:uid
 * so the backend can decide whether to show login/consent and continue the flow.
 */
export default function InteractionDispatcher() {
  const { uid } = useParams<{ uid: string }>();

  useEffect(() => {
    if (!uid) return;

    // ✅ Same-origin relative redirect
    const target = `/oidc/interaction/${uid}`;
    window.location.replace(target);
  }, [uid]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100%",
        background: "#04110D",
        color: "#FFFFFF",
      }}
    >
      <CircularProgress size={40} sx={{ color: "#03cd8c" }} />
      <Typography sx={{ mt: 2.5, color: "rgba(233, 255, 247, 0.70)", fontWeight: 500 }}>
        Verifying security context...
      </Typography>
    </Box>
  );
}
