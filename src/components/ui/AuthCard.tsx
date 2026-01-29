/**
 * Auth Card Component
 * Reusable card wrapper for authentication pages
 */

import React from 'react';
import { Box, Card, CardContent, SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';

interface AuthCardProps {
    children: React.ReactNode;
    maxWidth?: string | number;
    className?: string;
    sx?: SxProps<Theme>;
}

export function AuthCard({
    children,
    maxWidth = '6xl',
    className,
    sx,
}: AuthCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <Card className={className} sx={{ borderRadius: '4px', ...sx }}>
                <CardContent className="p-5 md:p-7">{children}</CardContent>
            </Card>
        </motion.div>
    );
}

/**
 * Info Card Component
 * For displaying informational content
 */
interface InfoCardProps {
    title: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}

export function InfoCard({ title, children, action }: InfoCardProps) {
    return (
        <Box
            sx={{
                borderRadius: 18,
                border: '1px solid',
                borderColor: alpha('#000000', 0.10),
                backgroundColor: alpha('#ffffff', 0.45),
                p: 1.5,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                }}
            >
                <Box sx={{ fontWeight: 950 }}>{title}</Box>
                {action}
            </Box>
            {children}
        </Box>
    );
}

/**
 * Loading Overlay Component
 */
interface LoadingOverlayProps {
    loading: boolean;
    children: React.ReactNode;
}

export function LoadingOverlay({ loading, children }: LoadingOverlayProps) {
    return (
        <Box sx={{ position: 'relative' }}>
            {children}
            {loading && (
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(255,255,255,0.5)',
                        display: 'grid',
                        placeItems: 'center',
                        zIndex: 1,
                    }}
                >
                    {/* Loading spinner would go here */}
                </Box>
            )}
        </Box>
    );
}
