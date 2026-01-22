import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';

// Lazy load admin pages
const AdminDashboard = React.lazy(() => import('../features/admin/dashboard/Index'));
const UsersList = React.lazy(() => import('../features/admin/users/Index'));
const UserDetail = React.lazy(() => import('../features/admin/users/UserDetail'));
const UserSessions = React.lazy(() => import('../features/admin/users/UserSessions'));

const DisputesList = React.lazy(() => import('../features/admin/disputes/Index'));
const AuditLogs = React.lazy(() => import('../features/admin/audit/Index'));
const Administrators = React.lazy(() => import('../features/admin/administrators/Index'));
const AdminApps = React.lazy(() => import('../features/admin/apps/Index'));
const AdminAppDetail = React.lazy(() => import('../features/admin/apps/AppDetail'));
const AdminProfile = React.lazy(() => import('../features/admin/profile/Index'));


const Status = React.lazy(() => import('../features/status/Index'));

export default function AdminRouter() {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UsersList />} />
                <Route path="users/:userId" element={<UserDetail />} />
                <Route path="users/:userId/sessions" element={<UserSessions />} />

                <Route path="disputes" element={<DisputesList />} />
                <Route path="audit" element={<AuditLogs />} />
                <Route path="administrators" element={<Administrators />} />
                <Route path="apps" element={<AdminApps />} />
                <Route path="apps/:clientId" element={<AdminAppDetail />} />


                <Route path="status" element={<Status />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
}
