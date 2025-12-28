import React, { useState } from 'react';
import {
    Box,
    IconButton,
    InputBase,
    Stack,
    Tooltip,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider,
    Typography,
    useTheme,
    alpha
} from '@mui/material';
import {
    Menu as MenuIcon,
    Search as SearchIcon,
    RefreshCw as RefreshIcon,
    Sun as SunIcon,
    Moon as MoonIcon,
    Bell,
    User,
    Settings,
    LogOut,
    Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../theme/ThemeContext';
import { EVZONE } from '../../theme/evzone';

interface AppHeaderProps {
    onDrawerToggle?: () => void;
    showMobileToggle?: boolean;
}

export default function AppHeader({ onDrawerToggle, showMobileToggle = false }: AppHeaderProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const { mode, toggleMode } = useThemeContext();
    const isDark = mode === 'dark';

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const handleProfileClick = () => {
        navigate('/app/profile');
        handleMenuClose();
    };

    return (
        <Box sx={{
            height: 64,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            bgcolor: alpha(theme.palette.background.default, 0.8),
            backdropFilter: 'blur(12px)'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {showMobileToggle && (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={onDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon size={24} />
                    </IconButton>
                )}

                {/* Search Bar */}
                <Box sx={{
                    position: 'relative',
                    borderRadius: '12px',
                    backgroundColor: alpha(theme.palette.text.primary, 0.04),
                    '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.06) },
                    mr: 2,
                    display: { xs: 'none', sm: 'flex' }, // Hide on mobile for now or adjust
                    alignItems: 'center',
                    px: 2,
                    height: 40,
                    width: { sm: 200, md: 320 },
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.2s'
                }}>
                    <Box sx={{ color: 'text.secondary', mr: 1.5, display: 'flex' }}>
                        <SearchIcon size={18} />
                    </Box>
                    <InputBase
                        placeholder="Search..."
                        sx={{ width: '100%', fontSize: '0.9rem', fontWeight: 500 }}
                    />
                    <Box sx={{
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        gap: 0.5,
                        color: 'text.disabled',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '6px',
                        px: 0.8,
                        py: 0.2,
                        bgcolor: theme.palette.background.paper
                    }}>
                        <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 700 }}>⌘</Typography>
                        <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 700 }}>K</Typography>
                    </Box>
                </Box>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                    <IconButton size="small" onClick={toggleMode} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                        {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                    </IconButton>
                </Tooltip>

                <Tooltip title="Language">
                    <IconButton size="small" sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                        <Globe size={18} />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Notifications">
                    <IconButton onClick={() => navigate('/app/notifications')}>
                        <Bell size={20} />
                    </IconButton>
                </Tooltip>

                <Box>
                    <Tooltip title="Account settings">
                        <IconButton
                            onClick={handleMenuClick}
                            size="small"
                            aria-controls={openMenu ? 'account-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={openMenu ? 'true' : undefined}
                        >
                            <Avatar src="https://i.pravatar.cc/150?u=ronald" sx={{ width: 32, height: 32, border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}` }} />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={openMenu}
                        onClose={handleMenuClose}
                        onClick={handleMenuClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                width: 220,
                                borderRadius: '12px',
                                '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1 },
                                '&:before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <Box sx={{ p: 2, pt: 1.5, pb: 1 }}>
                            <Typography variant="subtitle2" fontWeight={700} noWrap>
                                Ronald Isabirye
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                ronald@evzone.com
                            </Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={handleProfileClick} sx={{ py: 1.5 }}>
                            <ListItemIcon><User size={18} /></ListItemIcon>
                            Profile
                        </MenuItem>
                        <MenuItem onClick={() => { navigate('/app/settings'); handleMenuClose(); }} sx={{ py: 1.5 }}>
                            <ListItemIcon><Settings size={18} /></ListItemIcon>
                            Settings
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => navigate('/auth/sign-in')} sx={{ py: 1.5, color: 'error.main' }}>
                            <ListItemIcon><LogOut size={18} color={theme.palette.error.main} /></ListItemIcon>
                            Sign out
                        </MenuItem>
                    </Menu>
                </Box>
            </Stack>
        </Box>
    );
}
