import React from 'react';
import { useTranslation } from "react-i18next";
import { Box, Card, CardContent, Typography, useTheme, alpha } from '@mui/material';
import { Users as UsersIcon, Wallet as WalletIcon, Lock as LockIcon, Shield as ShieldIcon } from 'lucide-react';
import { EVZONE } from '../styles';

interface SummaryStatsProps {
    summary: {
        supervised: number;
        pendingApprovals: number;
        blocked: number;
        unverified: number;
    };
}

const Stat = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => {
    const theme = useTheme();

    return (
        <Card sx={{ borderRadius: "4px", height: '100%' }}>
            <CardContent className="p-4">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 950, mt: 0.5 }}>
                            {value}
                        </Typography>
                    </Box>
                    <Box sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "4px", // Wallet Match: 4px
                        display: 'grid',
                        placeItems: 'center',
                        backgroundColor: alpha(EVZONE.green, 0.1),
                        color: theme.palette.text.primary,
                        border: `1px solid ${alpha(theme.palette.text.primary, 0.05)}`
                    }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default function SummaryStats({ summary }: SummaryStatsProps) {
    return (
        <Box className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat title="Children supervised" value={`${summary.supervised}`} icon={<UsersIcon size={20} />} />
            <Stat title="Approvals pending" value={`${summary.pendingApprovals}`} icon={<WalletIcon size={20} />} />
            <Stat title="Blocked attempts" value={`${summary.blocked}`} icon={<LockIcon size={20} />} />
            <Stat title="Unverified guardians" value={`${summary.unverified}`} icon={<ShieldIcon size={20} />} />
        </Box>
    );
}
