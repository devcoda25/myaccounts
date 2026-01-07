import React from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Grid,
    Stack,
    useTheme,
    IconButton,
    Divider,
    Chip,
    Avatar
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useThemeStore } from "@/stores/themeStore";
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Share2, AlertTriangle, Download, Clock, CreditCard } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { Theme } from '@mui/material/styles';

const glassStyle = (theme: Theme) => ({
    bgcolor: alpha(theme.palette.background.paper, 0.6),
    backdropFilter: 'blur(12px)',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '16px',
});

const MOCK_TXN = {
    id: 'TXN-8839201',
    amount: 45000,
    currency: 'UGX',
    type: 'debit',
    title: 'Netflix Subscription',
    date: 'Dec 26, 2025',
    time: '10:23 AM',
    status: 'success',
    method: 'Visa •••• 4242',
    reference: 'NFLX-UG-JD92',
    fees: 0
};

export default function WalletTransactionDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const theme = useTheme();
    const { mode } = useThemeStore();

    const containerVars = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVars = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <Box sx={{ minHeight: '100%', position: 'relative', pb: { xs: 12, md: 6 } }}>

            {/* Background decoration */}
            <Box sx={{
                position: 'absolute', top: 0, right: 0, width: '100%', height: '400px',
                background: `radial-gradient(circle at 50% 10%, ${alpha('#03cd8c', 0.05)}, transparent 50%)`,
                zIndex: 0
            }} />

            <Container maxWidth="sm" sx={{ pt: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
                <motion.div variants={containerVars} initial="hidden" animate="show">

                    {/* Header */}
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => navigate(-1)} sx={{
                            backdropFilter: 'blur(4px)',
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '10px'
                        }}>
                            <ArrowLeft size={20} />
                        </IconButton>
                        <Typography variant="h6" fontWeight={700}>Transaction Details</Typography>
                    </Box>

                    <motion.div variants={itemVars}>
                        <Paper sx={{ ...glassStyle(theme), p: 4, mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                            <Avatar sx={{
                                width: 64, height: 64, mb: 2,
                                bgcolor: alpha('#03cd8c', 0.1),
                                color: '#03cd8c'
                            }}>
                                <CheckCircle2 size={32} />
                            </Avatar>

                            <Typography variant="h5" fontWeight={800} gutterBottom>
                                - {MOCK_TXN.currency} {MOCK_TXN.amount.toLocaleString()}
                            </Typography>

                            <Typography variant="body1" color="text.secondary" fontWeight={500} gutterBottom>
                                {MOCK_TXN.title}
                            </Typography>

                            <Chip
                                label="Successful"
                                size="small"
                                sx={{
                                    bgcolor: alpha('#03cd8c', 0.1),
                                    color: '#03cd8c',
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    mt: 1
                                }}
                            />
                        </Paper>
                    </motion.div>

                    <motion.div variants={itemVars}>
                        <Paper sx={{ ...glassStyle(theme), p: 0, overflow: 'hidden' }}>
                            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.action.active, 0.03) }}>
                                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" letterSpacing="0.05em">DETAILS</Typography>
                            </Box>
                            <Stack divider={<Divider />} sx={{ p: 0 }}>
                                {[
                                    { label: 'Date', value: MOCK_TXN.date, icon: <Clock size={16} /> },
                                    { label: 'Time', value: MOCK_TXN.time },
                                    { label: 'Payment Method', value: MOCK_TXN.method, icon: <CreditCard size={16} /> },
                                    { label: 'Transaction ID', value: id || MOCK_TXN.id, copy: true },
                                    { label: 'Reference', value: MOCK_TXN.reference, copy: true },
                                    { label: 'Fees', value: `${MOCK_TXN.currency} ${MOCK_TXN.fees}` },
                                ].map((row, i) => (
                                    <Box key={i} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {row.icon} {row.label}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600} align="right">
                                            {row.value}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    </motion.div>

                    <motion.div variants={itemVars}>
                        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                            <Button fullWidth variant="outlined" startIcon={<Share2 size={18} />} sx={{ borderRadius: '12px', py: 1.5 }}>
                                Share Receipt
                            </Button>
                            <Button fullWidth variant="text" startIcon={<AlertTriangle size={18} />} color="error" sx={{ borderRadius: '12px', py: 1.5 }}>
                                Report Issue
                            </Button>
                        </Box>
                    </motion.div>

                </motion.div>
            </Container>
        </Box>
    );
}
