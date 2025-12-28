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
    Avatar,
    Chip,
    Divider
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Smartphone, Plus, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const glassStyle = (theme: any) => ({
    bgcolor: alpha(theme.palette.background.paper, 0.6),
    backdropFilter: 'blur(12px)',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '16px',
});

const METHODS = [
    { id: '1', type: 'card', brand: 'Visa', number: '•••• 4242', expiry: '12/28', isDefault: true, color: '#1a1f71' },
    { id: '2', type: 'momo', brand: 'MTN Mobile Money', number: '+256 77*** 123', isDefault: false, color: '#ffcc00' },
    { id: '3', type: 'card', brand: 'Mastercard', number: '•••• 8833', expiry: '09/26', isDefault: false, color: '#eb001b' },
];

export default function PaymentMethods() {
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
                background: `radial-gradient(circle at 80% 10%, ${alpha('#03cd8c', 0.05)}, transparent 50%)`,
                zIndex: 0
            }} />

            <Container maxWidth="md" sx={{ pt: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
                <motion.div variants={containerVars} initial="hidden" animate="show">

                    {/* Header */}
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                                    Payment Methods
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Manage your cards and mobile money accounts
                                </Typography>
                            </Box>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<Plus size={18} />}
                            sx={{
                                borderRadius: '12px',
                                bgcolor: '#03cd8c',
                                color: '#fff',
                                fontWeight: 700,
                                boxShadow: `0 4px 12px ${alpha('#03cd8c', 0.3)}`,
                                display: { xs: 'none', sm: 'flex' }
                            }}
                        >
                            Add New
                        </Button>
                    </Box>

                    <Grid container spacing={3}>
                        {METHODS.map((method) => (
                            <Grid item xs={12} sm={6} key={method.id}>
                                <motion.div variants={itemVars}>
                                    <Paper sx={{
                                        ...glassStyle(theme),
                                        p: 3,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] }
                                    }}>
                                        {/* Card Bg Accent */}
                                        <Box sx={{
                                            position: 'absolute', top: -40, right: -40, width: 150, height: 150,
                                            borderRadius: '50%',
                                            background: `radial-gradient(circle, ${alpha(method.color, 0.1)} 0%, transparent 70%)`
                                        }} />

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                            <Box sx={{
                                                width: 48, height: 48, borderRadius: '12px',
                                                bgcolor: alpha(theme.palette.text.primary, 0.05),
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {method.type === 'card' ? <CreditCard size={24} color={method.color} /> : <Smartphone size={24} color={method.color} />}
                                            </Box>
                                            {method.isDefault && (
                                                <Chip label="Default" size="small" sx={{ bgcolor: alpha('#03cd8c', 0.1), color: '#03cd8c', fontWeight: 700, borderRadius: '8px' }} />
                                            )}
                                        </Box>

                                        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, letterSpacing: '0.05em' }}>
                                            {method.number}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            {method.brand} {method.expiry && `• Exp ${method.expiry}`}
                                        </Typography>

                                        <Divider sx={{ mb: 2 }} />

                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button size="small" startIcon={<Edit2 size={16} />} sx={{ borderRadius: '8px', color: 'text.secondary' }}>Edit</Button>
                                            <Button size="small" startIcon={<Trash2 size={16} />} color="error" sx={{ borderRadius: '8px' }}>Remove</Button>
                                        </Box>

                                    </Paper>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>

                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Plus size={18} />}
                        sx={{
                            mt: 3,
                            py: 2,
                            borderStyle: 'dashed',
                            borderWidth: 2,
                            borderRadius: '16px',
                            display: { xs: 'flex', sm: 'none' }
                        }}
                    >
                        Add New Payment Method
                    </Button>

                </motion.div>
            </Container>
        </Box>
    );
}
