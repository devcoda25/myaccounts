import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';

// Lazy load admin pages
const AdminDashboard = React.lazy(() => import('../pages/admin/dashboard/Index'));
const UsersList = React.lazy(() => import('../pages/admin/users/Index'));
const UserDetail = React.lazy(() => import('../pages/admin/users/UserDetail'));
const UserSessions = React.lazy(() => import('../pages/admin/users/UserSessions'));
const WalletsList = React.lazy(() => import('../pages/admin/wallets/Index'));
const TransactionsList = React.lazy(() => import('../pages/admin/transactions/Index'));
const AuditLogs = React.lazy(() => import('../pages/admin/audit/Index'));
const AdminProfile = React.lazy(() => import('../pages/admin/profile/Index'));
const KycQueue = React.lazy(() => import('../pages/admin/kyc/Index'));
const OrgsList = React.lazy(() => import('../pages/admin/orgs/Index'));
const OrgDetail = React.lazy(() => import('../pages/admin/orgs/OrgDetail'));
const Status = React.lazy(() => import('../pages/status/Index'));

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
                <Route path="audit" element={<AuditLogs />} />
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
