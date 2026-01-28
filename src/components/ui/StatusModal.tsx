import React from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
    Stack,
    alpha,
    useTheme,
    IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    Info,
    X
} from 'lucide-react';
import { EVZONE } from '../../theme/evzone';

export type StatusType = 'success' | 'error' | 'warning' | 'info';

interface StatusModalProps {
    open: boolean;
    type: StatusType;
    title: string;
    message: string;
    onClose: () => void;
    actionText?: string;
    onAction?: () => void;
}

const statusConfig = {
    success: {
        icon: CheckCircle,
        color: EVZONE.green,
        bg: alpha(EVZONE.green, 0.1),
    },
    error: {
        icon: AlertCircle,
        color: '#FF4D4D',
        bg: alpha('#FF4D4D', 0.1),
    },
    warning: {
        icon: AlertTriangle,
        color: EVZONE.orange,
        bg: alpha(EVZONE.orange, 0.1),
    },
    info: {
        icon: Info,
        color: '#4DA3FF',
        bg: alpha('#4DA3FF', 0.1),
    },
};

export const StatusModal: React.FC<StatusModalProps> = ({
    open,
    type,
    title,
    message,
    onClose,
    actionText = 'Got it',
    onAction
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const config = statusConfig[type];
    const Icon = config.icon;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: {
                    borderRadius: 6, // 24px
                    background: isDark
                        ? 'rgba(11, 26, 23, 0.85)'
                        : 'rgba(255, 255, 255, 0.90)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${isDark ? alpha('#E9FFF7', 0.1) : alpha('#0B1A17', 0.1)}`,
                    overflow: 'hidden',
                    boxShadow: `0 32px 64px ${alpha('#000000', isDark ? 0.4 : 0.1)}`,
                },
            }}
            TransitionComponent={({ children, ...props }) => (
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            style={{ display: 'flex', justifyContent: 'center' }}
                        >
                            <Box {...props}>{children}</Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        >
            <Box sx={{ position: 'relative', p: 4, pt: 6, textAlign: 'center' }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        color: theme.palette.text.secondary,
                        '&:hover': { color: theme.palette.text.primary, bgcolor: alpha(theme.palette.text.primary, 0.05) }
                    }}
                >
                    <X size={20} />
                </IconButton>

                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '24px',
                        bgcolor: config.bg,
                        color: config.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                    }}
                >
                    <Icon size={40} strokeWidth={2.5} />
                </Box>

                <Typography variant="h5" sx={{ mb: 1, fontWeight: 950 }}>
                    {title}
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        color: theme.palette.text.secondary,
                        mb: 4,
                        px: 2,
                        lineHeight: 1.6
                    }}
                >
                    {message}
                </Typography>

                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={onAction || onClose}
                        sx={{
                            bgcolor: config.color,
                            color: '#FFFFFF',
                            py: 1.5,
                            borderRadius: 3,
                            fontWeight: 800,
                            boxShadow: `0 12px 24px ${alpha(config.color, 0.3)}`,
                            '&:hover': {
                                bgcolor: alpha(config.color, 0.9),
                                boxShadow: `0 16px 32px ${alpha(config.color, 0.4)}`,
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        {actionText}
                    </Button>
                </Stack>
            </Box>
        </Dialog>
    );
};
