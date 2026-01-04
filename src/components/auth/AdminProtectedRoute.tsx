import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../../stores/adminAuthStore';
import RouteLoader from '../loading/RouteLoader';

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

    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
        // Redirect to admin login
        return <Navigate to="/admin/auth/login" state={{ from: location.pathname + location.search }} replace />;
    }

    return children;
};

export default AdminProtectedRoute;
