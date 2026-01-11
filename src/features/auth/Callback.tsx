import React, { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

export default function Callback() {
    const auth = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate('/app', { replace: true });
        }
        if (auth.error) {
            console.error('OIDC Error:', auth.error);
        }
    }, [auth.isAuthenticated, auth.error, navigate]);

    if (auth.error) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <Typography variant="h5" color="error">Authentication Error</Typography>
                <Typography>{auth.error.message}</Typography>
                <Typography variant="caption" sx={{ mt: 2 }} onClick={() => navigate('/auth/sign-in')}>Return to Sign In</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Signing you in...</Typography>
        </Box>
    );
}
