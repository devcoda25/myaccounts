
import React, { useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Button,
    alpha,
    useTheme,
    Badge,
    Tooltip
} from '@mui/material';
import {
    Bell,
    Check,
    Clock,
    Settings,
    ShieldAlert,
    Info,
    CheckCircle2,
    X,
    MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EVZONE } from '../../theme/evzone';
import { useThemeContext } from '../../theme/ThemeContext';

interface Notification {
    id: string;
    title: string;
    description: string;
    time: string;
    type: 'security' | 'info' | 'success' | 'warning';
    read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'New Device Sign-in',
        description: 'New login detected from Chrome (Windows) in Kampala, UG.',
        time: '2 mins ago',
        type: 'security',
        read: false,
    },
    {
        id: '2',
        title: 'Wallet Top-up Successful',
        description: 'Your deposit of UGX 500,000 has been confirmed.',
        time: '1 hr ago',
        type: 'success',
        read: false,
    },
    {
        id: '3',
        title: 'System Update',
        description: 'EVzone My Accounts will undergo maintenance tonight at 2 AM.',
        time: '5 hrs ago',
        type: 'info',
        read: true,
    },
    {
        id: '4',
        title: 'Profile Incomplete',
        description: 'Please add a recovery phone number to secure your account.',
        time: '1 day ago',
        type: 'warning',
        read: true,
    }
];

interface NotificationsPopoverProps {
    onClose: () => void;
}

export default function NotificationsPopover({ onClose }: NotificationsPopoverProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const { mode } = useThemeContext();
    const isDark = mode === 'dark';

    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleDismiss = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleItemClick = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'security': return <ShieldAlert size={20} color={theme.palette.error.main} />;
            case 'success': return <CheckCircle2 size={20} color={EVZONE.green} />;
            case 'warning': return <Info size={20} color={theme.palette.warning.main} />;
            default: return <MessageSquare size={20} color={theme.palette.info.main} />;
        }
    };

    const getBgColor = (type: Notification['type']) => {
        switch (type) {
            case 'security': return alpha(theme.palette.error.main, 0.1);
            case 'success': return alpha(EVZONE.green, 0.1);
            case 'warning': return alpha(theme.palette.warning.main, 0.1);
            default: return alpha(theme.palette.info.main, 0.1);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Box sx={{ width: 360, maxHeight: 500, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight={800}>Notifications</Typography>
                    {unreadCount > 0 && (
                        <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }} />
                    )}
                </Box>
                <Box>
                    <Tooltip title="Mark all as read">
                        <IconButton size="small" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                            <Check size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Settings">
                        <IconButton size="small" onClick={() => { navigate('/app/notifications'); onClose(); }}>
                            <Settings size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Close">
                        <IconButton size="small" onClick={onClose}>
                            <X size={16} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* List */}
            <List sx={{ overflowY: 'auto', flex: 1, p: 0 }}>
                {notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.secondary }}>
                        <Bell size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                        <Typography variant="body2">No notifications</Typography>
                    </Box>
                ) : (
                    notifications.map((n) => (
                        <ListItem
                            key={n.id}
                            alignItems="flex-start"
                            button
                            onClick={() => handleItemClick(n.id)}
                            sx={{
                                px: 2,
                                py: 1.5,
                                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                backgroundColor: n.read ? 'transparent' : alpha(theme.palette.primary.main, mode === 'dark' ? 0.08 : 0.04),
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.text.primary, 0.03),
                                    '& .dismiss-btn': { opacity: 1 }
                                }
                            }}
                        >
                            <ListItemAvatar sx={{ mt: 0.5, minWidth: 44 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: getBgColor(n.type), border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                    {getIcon(n.type)}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: n.read ? 600 : 800, lineHeight: 1.2, pr: 2 }}>
                                            {n.title}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Clock size={10} /> {n.time}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.8125rem', lineHeight: 1.3 }}>
                                        {n.description}
                                    </Typography>
                                }
                            />
                            <IconButton
                                size="small"
                                className="dismiss-btn"
                                onClick={(e) => handleDismiss(n.id, e)}
                                sx={{
                                    position: 'absolute',
                                    right: 4,
                                    bottom: 4,
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    color: theme.palette.text.disabled,
                                    '&:hover': { color: theme.palette.error.main }
                                }}
                            >
                                <X size={14} />
                            </IconButton>
                        </ListItem>
                    ))
                )}
            </List>

            {/* Footer */}
            <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                <Button fullWidth size="small" sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }} onClick={() => { navigate('/app/notifications'); onClose(); }}>
                    View All Notifications
                </Button>
            </Box>
        </Box>
    );
}
