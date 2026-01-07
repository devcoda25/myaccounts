import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Valid lazy imports
const AdminLogin = lazy(() => import('../features/admin/auth/Login'));
const AdminForgotPassword = lazy(() => import('../features/admin/auth/ForgotPassword'));

export default function AdminAuthRouter() {
    return (
        <Routes>
            <Route path="login" element={<AdminLogin />} />
            <Route path="forgot-password" element={<AdminForgotPassword />} />
            <Route path="*" element={<Navigate to="login" replace />} />
        </Routes>
    );
}
