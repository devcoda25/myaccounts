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
    LinearProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Theme } from '@mui/material';

const glassStyle = (theme: Theme) => ({
    bgcolor: alpha(theme.palette.background.paper, 0.6),
    backdropFilter: 'blur(12px)',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '16px',
});

const LIMITS = [
    { label: 'Daily Transaction Limit', used: 1250000, total: 5000000 },
    { label: 'Monthly Withdrawal Limit', used: 4500000, total: 20000000 },
    { label: 'Daily Mobile Money Limit', used: 500000, total: 2000000 },
];

export default function Limits() {
    const navigate = useNavigate();
    const theme = useTheme();

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
                background: `radial-gradient(circle at 20% 10%, ${alpha('#f77f00', 0.05)}, transparent 50%)`,
                zIndex: 0
            }} />

            <Container maxWidth="md" sx={{ pt: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
                <motion.div variants={containerVars} initial="hidden" animate="show">

                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => navigate(-1)} sx={{
                            backdropFilter: 'blur(4px)',
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '10px'
                        }}>
                            <ArrowLeft size={20} />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary' }}>
                                Limits
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                View your transaction and withdrawal limits
                            </Typography>
                        </Box>
                    </Box>

                    <Stack spacing={3}>
                        {LIMITS.map((limit, i) => {
                            const percent = (limit.used / limit.total) * 100;
                            return (
                                <motion.div variants={itemVars} key={i}>
                                    <Paper sx={{ ...glassStyle(theme), p: 4 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="subtitle1" fontWeight={700}>{limit.label}</Typography>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                {Math.round(percent)}% Used
                                            </Typography>
                                        </Box>

                                        <LinearProgress
                                            variant="determinate"
                                            value={percent}
                                            sx={{
                                                height: 10,
                                                borderRadius: 5,
                                                bgcolor: alpha(theme.palette.text.primary, 0.1),
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: percent > 80 ? 'error.main' : percent > 50 ? '#f77f00' : '#03cd8c',
                                                    borderRadius: 5
                                                }
                                            }}
                                        />

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Used: UGX {limit.used.toLocaleString()}
                                            </Typography>
                                            <Typography variant="caption" fontWeight={600}>
                                                Limit: UGX {limit.total.toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </motion.div>
                            );
                        })}

                        <motion.div variants={itemVars}>
                            <Paper sx={{
                                p: 3,
                                borderRadius: '16px',
                                bgcolor: alpha(theme.palette.info.main, 0.08),
                                color: 'info.dark',
                                display: 'flex',
                                gap: 2
                            }}>
                                <AlertCircle size={24} />
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700}>Need higher limits?</Typography>
                                    <Typography variant="caption">
                                        Complete KYC verification to upgrade your account tier and increase your transaction limits.
                                    </Typography>
                                    <Button size="small" sx={{ mt: 1, fontWeight: 700 }} onClick={() => navigate('/app/wallet/kyc')}>
                                        Verify Identity
                                    </Button>
                                </Box>
                            </Paper>
                        </motion.div>
                    </Stack>

                </motion.div>
            </Container>
        </Box>
    );
}
