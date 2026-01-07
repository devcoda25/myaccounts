import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';

// Lazy load admin pages
const AdminDashboard = React.lazy(() => import('../features/admin/dashboard/Index'));
const UsersList = React.lazy(() => import('../features/admin/users/Index'));
const UserDetail = React.lazy(() => import('../features/admin/users/UserDetail'));
const UserSessions = React.lazy(() => import('../features/admin/users/UserSessions'));
const WalletsList = React.lazy(() => import('../features/admin/wallets/Index'));
const TransactionsList = React.lazy(() => import('../features/admin/transactions/Index'));
const DisputesList = React.lazy(() => import('../features/admin/disputes/Index'));
const AuditLogs = React.lazy(() => import('../features/admin/audit/Index'));
const Administrators = React.lazy(() => import('../features/admin/administrators/Index'));
const AdminApps = React.lazy(() => import('../features/admin/apps/Index'));
const AdminAppDetail = React.lazy(() => import('../features/admin/apps/AppDetail'));
const AdminProfile = React.lazy(() => import('../features/admin/profile/Index'));
const KycQueue = React.lazy(() => import('../features/admin/kyc/Index'));
const OrgsList = React.lazy(() => import('../features/admin/orgs/Index'));
const OrgDetail = React.lazy(() => import('../features/admin/orgs/OrgDetail'));
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
                <Route path="wallets" element={<WalletsList />} />
                <Route path="transactions" element={<TransactionsList />} />
                <Route path="disputes" element={<DisputesList />} />
                <Route path="audit" element={<AuditLogs />} />
                <Route path="administrators" element={<Administrators />} />
                <Route path="apps" element={<AdminApps />} />
                <Route path="apps/:clientId" element={<AdminAppDetail />} />
                <Route path="kyc" element={<KycQueue />} />
                <Route path="orgs" element={<OrgsList />} />
                <Route path="orgs/:orgId" element={<OrgDetail />} />
                <Route path="status" element={<Status />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
}
