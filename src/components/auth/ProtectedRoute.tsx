import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        // Redirect to login but save the current location
        return <Navigate to="/auth/sign-in" state={{ from: location.pathname + location.search }} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
