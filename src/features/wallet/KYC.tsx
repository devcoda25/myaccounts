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
    Chip,
    Divider
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ShieldCheck, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Theme } from '@mui/material';

const glassStyle = (theme: Theme) => ({
    bgcolor: alpha(theme.palette.background.paper, 0.6),
    backdropFilter: 'blur(12px)',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '16px',
});

const TIERS = [
    { level: 1, label: 'Basic', limits: '5M UGX / day', req: 'Phone Verification', active: true },
    { level: 2, label: 'Verified', limits: '50M UGX / day', req: 'National ID / Passport', active: false },
    { level: 3, label: 'Enterprise', limits: 'Unlimited', req: 'Business Registration', active: false },
];

export default function KYC() {
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
                background: `radial-gradient(circle at 50% 10%, ${alpha('#03cd8c', 0.05)}, transparent 50%)`,
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
                                Identity Verification
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Verify your identity to unlock higher limits
                            </Typography>
                        </Box>
                    </Box>

                    <Stack spacing={3}>
                        {TIERS.map((tier) => (
                            <motion.div variants={itemVars} key={tier.level}>
                                <Paper sx={{
                                    ...glassStyle(theme),
                                    p: 3,
                                    borderColor: tier.active ? '#03cd8c' : theme.palette.divider,
                                    bgcolor: tier.active ? alpha('#03cd8c', 0.02) : undefined
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{
                                                width: 40, height: 40, borderRadius: '10px',
                                                bgcolor: tier.active ? alpha('#03cd8c', 0.1) : alpha(theme.palette.action.active, 0.05),
                                                color: tier.active ? '#03cd8c' : theme.palette.text.secondary,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 800
                                            }}>
                                                L{tier.level}
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" fontWeight={700}>{tier.label} Tier</Typography>
                                                <Typography variant="caption" color="text.secondary">{tier.limits}</Typography>
                                            </Box>
                                        </Box>
                                        {tier.active ? (
                                            <Chip label="Current Level" size="small" sx={{ bgcolor: '#03cd8c', color: '#fff', fontWeight: 700, borderRadius: '8px' }} icon={<CheckCircle2 size={14} color="white" />} />
                                        ) : (
                                            <Button variant="outlined" size="small" endIcon={<UploadCloud size={16} />} sx={{ borderRadius: '8px' }}>Upgrade</Button>
                                        )}
                                    </Box>

                                    <Divider sx={{ mb: 2 }} />

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                                        <ShieldCheck size={16} />
                                        Required: <span style={{ fontWeight: 600, color: theme.palette.text.primary }}>{tier.req}</span>
                                    </Box>
                                </Paper>
                            </motion.div>
                        ))}
                    </Stack>

                </motion.div>
            </Container>
        </Box>
    );
}
