import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../../stores/adminAuthStore';
import RouteLoader from '../loading/RouteLoader';
import Error403Page from '../../features/errors/Error403';

interface AdminProtectedRouteProps {
    children: React.ReactElement;
    requiredPermission?: string;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children, requiredPermission }) => {
    const { user, isLoading, checkPermission, refreshAdmin } = useAdminAuthStore();
    const location = useLocation();

    React.useEffect(() => {
        refreshAdmin();
    }, []);

    if (isLoading) {
        return <RouteLoader />;
    }

    // If user is not authenticated at all, redirect to admin login
    if (!user) {
        return <Navigate to="/admin/auth/login" state={{ from: location.pathname + location.search }} replace />;
    }

    // Check if user has admin role
    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
    if (!isAdmin) {
        // User is logged in but not an admin - show access denied
        return <Error403Page />;
    }

    // Check specific permission if required
    if (requiredPermission && !checkPermission(requiredPermission)) {
        return <Error403Page />;
    }

    return children;
};

export default AdminProtectedRoute;
