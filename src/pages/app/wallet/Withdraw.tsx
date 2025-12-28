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
    Alert,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { ArrowLeft, Landmark, Smartphone, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const glassStyle = (theme: any) => ({
    bgcolor: alpha(theme.palette.background.paper, 0.6),
    backdropFilter: 'blur(12px)',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '16px',
});

const SAVED_ACCOUNTS = [
    { id: '1', type: 'bank', name: 'Stanbic Bank', detail: '**** 4545', holder: 'Ronald Isabirye', icon: <Landmark size={20} /> },
    { id: '2', type: 'momo', name: 'MTN Mobile Money', detail: '+256 77*** 123', holder: 'Ronald I.', icon: <Smartphone size={20} /> },
];

export default function Withdraw() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [amount, setAmount] = useState('');
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

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

            {/* Background decoration - Orange accent for Withdraw */}
            <Box sx={{
                position: 'absolute', top: 0, right: 0, width: '100%', height: '400px',
                background: `radial-gradient(circle at 10% 10%, ${alpha('#f77f00', 0.05)}, transparent 50%)`,
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
                                Withdraw
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Transfer funds to your bank or mobile money
                            </Typography>
                        </Box>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Left Col */}
                        <Grid item xs={12} md={7}>
                            <Stack spacing={3}>

                                {/* Available Balance */}
                                <motion.div variants={itemVars}>
                                    <Paper sx={{
                                        p: 2, borderRadius: '12px',
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <Typography variant="body2" fontWeight={600} color="primary.dark">Available Balance</Typography>
                                        <Typography variant="h6" fontWeight={800} color="primary.dark">UGX 1,250,420</Typography>
                                    </Paper>
                                </motion.div>

                                {/* Amount Input */}
                                <motion.div variants={itemVars}>
                                    <Paper sx={{ ...glassStyle(theme), p: 3 }}>
                                        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                                            WITHDRAWAL AMOUNT
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
                                                        <Typography variant="h3" fontWeight={700} sx={{ color: amount ? '#f77f00' : 'text.disabled' }}>
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

                                {/* Destination Selection */}
                                <motion.div variants={itemVars}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" fontWeight={700}>Destination</Typography>
                                        <Button startIcon={<ArrowRight size={16} />} size="small" sx={{ borderRadius: '8px' }}>Manage Accounts</Button>
                                    </Box>

                                    <Stack spacing={1.5}>
                                        {SAVED_ACCOUNTS.map((acc) => {
                                            const isSelected = selectedAccount === acc.id;
                                            return (
                                                <Paper
                                                    key={acc.id}
                                                    onClick={() => setSelectedAccount(acc.id)}
                                                    sx={{
                                                        ...glassStyle(theme),
                                                        p: 2,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                        transition: 'all 0.2s',
                                                        borderColor: isSelected ? '#f77f00' : theme.palette.divider,
                                                        bgcolor: isSelected ? alpha('#f77f00', 0.05) : alpha(theme.palette.background.paper, 0.6),
                                                        '&:hover': { transform: 'scale(1.01)', borderColor: isSelected ? '#f77f00' : alpha(theme.palette.text.primary, 0.2) }
                                                    }}
                                                >
                                                    <Box sx={{
                                                        width: 48, height: 48, borderRadius: '12px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        bgcolor: isSelected ? '#f77f00' : alpha(theme.palette.action.active, 0.08),
                                                        color: isSelected ? '#fff' : theme.palette.text.primary
                                                    }}>
                                                        {acc.icon}
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight={700}>{acc.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{acc.detail} • {acc.holder}</Typography>
                                                    </Box>
                                                    <Box sx={{
                                                        width: 20, height: 20, borderRadius: '50%',
                                                        border: `2px solid ${isSelected ? '#f77f00' : theme.palette.divider}`,
                                                        bgcolor: isSelected ? '#f77f00' : 'transparent',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        {isSelected && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#fff' }} />}
                                                    </Box>
                                                </Paper>
                                            );
                                        })}
                                    </Stack>
                                </motion.div>

                            </Stack>
                        </Grid>

                        {/* Right Col: Summary */}
                        <Grid item xs={12} md={5}>
                            <motion.div variants={itemVars}>
                                <Paper sx={{ ...glassStyle(theme), p: 3, position: 'sticky', top: 100 }}>
                                    <Typography variant="h6" fontWeight={700} gutterBottom>Review</Typography>

                                    <Stack spacing={2} sx={{ my: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography color="text.secondary">Withdrawal</Typography>
                                            <Typography fontWeight={600}>UGX {Number(amount).toLocaleString() || '0'}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography color="text.secondary">Service Fee</Typography>
                                            <Typography fontWeight={600} color="error.main">UGX 1,500</Typography>
                                        </Box>
                                        <Divider />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="h6" fontWeight={700}>Total Deducted</Typography>
                                            <Typography variant="h6" fontWeight={700}>
                                                UGX {(Number(amount) + 1500).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Alert severity="info" sx={{ mb: 2, borderRadius: '8px' }}>
                                        Funds will arrive within 30 minutes.
                                    </Alert>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={!amount || !selectedAccount}
                                        sx={{
                                            bgcolor: '#f77f00',
                                            color: '#fff',
                                            py: 1.5,
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            boxShadow: `0 8px 20px ${alpha('#f77f00', 0.3)}`,
                                            '&:hover': { bgcolor: alpha('#f77f00', 0.9) },
                                            '&:disabled': { bgcolor: alpha(theme.palette.action.disabledBackground, 0.5) }
                                        }}
                                    >
                                        Confirm Withdrawal
                                    </Button>
                                </Paper>
                            </motion.div>
                        </Grid>
                    </Grid>
                </motion.div>
            </Container>
        </Box>
    );
}
