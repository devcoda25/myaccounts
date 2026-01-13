import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { BACKEND_URL } from "@/config";
import { Box, CircularProgress, Typography } from "@mui/material";

/**
 * Interaction Dispatcher
 * Handles the initial redirection from OIDC Provider (server) to Client (browser).
 * The OIDC Provider sends the user to /interaction/:uid.
 * This component catches that route and redirects the browser to the API's interaction endpoint.
 * The API will then check the interaction state and redirect back to the correct specific auth page (login/consent).
 */
export default function InteractionDispatcher() {
    const { uid } = useParams();

    useEffect(() => {
        if (uid) {
            // Remove /api/v1 suffix if present to get the root API URL
            // The interaction controller is mounted at /interaction/:uid, NOT /api/v1/interaction/:uid
            const interactionBaseUrl = BACKEND_URL.replace(/\/api\/v1\/?$/, '');
            const target = `${interactionBaseUrl}/interaction/${uid}`;

            // Use replace to avoid history stack issues
            window.location.replace(target);
        }
    }, [uid]);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100%',
            background: '#04110D', // Safe dark background
            color: '#FFFFFF'
        }}>
            <CircularProgress size={40} sx={{ color: '#03cd8c' }} />
            <Typography sx={{ mt: 2.5, color: 'rgba(233, 255, 247, 0.70)', fontWeight: 500 }}>
                Verifying security context...
            </Typography>
        </Box>
    );
}
