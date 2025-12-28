import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Stack,
    InputAdornment,
    useTheme,
    IconButton,
    Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Smartphone, Building, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Reusable glass style (can be extracted to theme utilities later)
const glassStyle = (theme: any) => ({
    bgcolor: alpha(theme.palette.background.paper, 0.6),
    backdropFilter: 'blur(12px)',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '16px',
});

const PAYMENT_METHODS = [
    { id: 'momo', label: 'Mobile Money', icon: <Smartphone size={24} />, desc: 'MTN / Airtel' },
    { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard size={24} />, desc: 'Visa / Mastercard' },
    { id: 'bank', label: 'Bank Transfer', icon: <Building size={24} />, desc: 'Direct Deposit' },
];

export default function AddFunds() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

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
                background: `radial-gradient(circle at 90% 10%, ${alpha('#03cd8c', 0.06)}, transparent 50%)`,
                zIndex: 0
            }} />

            <Container maxWidth="md" sx={{ pt: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
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
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary' }}>
                                Add Funds
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Top up your EVzone wallet securely
                            </Typography>
                        </Box>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Left Col: Inputs */}
                        <Grid item xs={12} md={7}>
                            <Stack spacing={3}>

                                {/* Amount Input */}
                                <motion.div variants={itemVars}>
                                    <Paper sx={{ ...glassStyle(theme), p: 3 }}>
                                        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                                            ENTER AMOUNT
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            variant="standard"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Typography variant="h3" fontWeight={700} sx={{ color: amount ? '#03cd8c' : 'text.disabled' }}>
                                                            UGX
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                                disableUnderline: true,
                                                sx: { fontSize: '2.5rem', fontWeight: 800, color: 'text.primary' }
                                            }}
                                        />
                                    </Paper>
                                </motion.div>

                                {/* Method Selection */}
                                <motion.div variants={itemVars}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Payment Method</Typography>
                                    <Stack spacing={1.5}>
                                        {PAYMENT_METHODS.map((method) => {
                                            const isSelected = selectedMethod === method.id;
                                            return (
                                                <Paper
                                                    key={method.id}
                                                    onClick={() => setSelectedMethod(method.id)}
                                                    sx={{
                                                        ...glassStyle(theme),
                                                        p: 2,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                        transition: 'all 0.2s',
                                                        borderColor: isSelected ? '#03cd8c' : theme.palette.divider,
                                                        bgcolor: isSelected ? alpha('#03cd8c', 0.05) : alpha(theme.palette.background.paper, 0.6),
                                                        '&:hover': { transform: 'scale(1.01)', borderColor: isSelected ? '#03cd8c' : alpha(theme.palette.text.primary, 0.2) }
                                                    }}
                                                >
                                                    <Box sx={{
                                                        width: 48, height: 48, borderRadius: '12px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        bgcolor: isSelected ? '#03cd8c' : alpha(theme.palette.action.active, 0.08),
                                                        color: isSelected ? '#fff' : theme.palette.text.primary
                                                    }}>
                                                        {method.icon}
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight={700}>{method.label}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{method.desc}</Typography>
                                                    </Box>
                                                    {isSelected && <CheckCircle2 size={24} color="#03cd8c" />}
                                                    {!isSelected && <ChevronRight size={20} color={theme.palette.text.secondary} />}
                                                </Paper>
                                            );
                                        })}
                                    </Stack>
                                </motion.div>

                            </Stack>
                        </Grid>

                        {/* Right Col: Summary & Action */}
                        <Grid item xs={12} md={5}>
                            <motion.div variants={itemVars}>
                                <Paper sx={{ ...glassStyle(theme), p: 3, position: 'sticky', top: 100 }}>
                                    <Typography variant="h6" fontWeight={700} gutterBottom>Summary</Typography>

                                    <Stack spacing={2} sx={{ my: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography color="text.secondary">Amount</Typography>
                                            <Typography fontWeight={600}>UGX {Number(amount).toLocaleString() || '0'}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography color="text.secondary">Fee</Typography>
                                            <Typography fontWeight={600}>UGX 0</Typography>
                                        </Box>
                                        <Divider />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="h6" fontWeight={700}>Total</Typography>
                                            <Typography variant="h6" fontWeight={700} sx={{ color: '#03cd8c' }}>
                                                UGX {Number(amount).toLocaleString() || '0'}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={!amount || !selectedMethod}
                                        sx={{
                                            bgcolor: '#03cd8c',
                                            color: '#fff',
                                            py: 1.5,
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            boxShadow: `0 8px 20px ${alpha('#03cd8c', 0.3)}`,
                                            '&:hover': { bgcolor: alpha('#03cd8c', 0.9) },
                                            '&:disabled': { bgcolor: alpha(theme.palette.action.disabledBackground, 0.5) }
                                        }}
                                    >
                                        Confirm & Pay
                                    </Button>

                                    <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 2 }}>
                                        Payments are secure and encrypted.
                                    </Typography>
                                </Paper>
                            </motion.div>
                        </Grid>
                    </Grid>
                </motion.div>
            </Container>
        </Box>
    );
}
