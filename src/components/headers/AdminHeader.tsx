import React, { useState, useRef } from 'react';
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
    Sun as SunIcon,
    Moon as MoonIcon,
    Bell,
    User,
    Settings,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../theme/ThemeContext';
import { EVZONE } from '../../theme/evzone';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import NotificationsPopover from './NotificationsPopover';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

interface AdminHeaderProps {
    onDrawerToggle?: () => void;
    showMobileToggle?: boolean;
}

export default function AdminHeader({ onDrawerToggle, showMobileToggle = false }: AdminHeaderProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const { mode, toggleMode } = useThemeContext();
    const { user, logout } = useAdminAuth();
    const isDark = mode === 'dark';

    const notifRef = useRef<HTMLButtonElement>(null);
    const [openNotif, setOpenNotif] = useState(false);
    const handleNotifClick = () => setOpenNotif(true);
    const handleNotifClose = () => setOpenNotif(false);

    // Profile Menu State
    const anchorRef = useRef<HTMLButtonElement>(null);
    const [openMenu, setOpenMenu] = useState(false);

    const handleMenuClick = () => {
        setOpenMenu(true);
    };
    const handleMenuClose = () => {
        setOpenMenu(false);
    };
    const handleProfileClick = () => {
        navigate('/admin/profile');
        handleMenuClose();
    };

    const { t } = useTranslation();

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
                    display: { xs: 'none', sm: 'flex' },
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
                        placeholder={t('header.search')}
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

                <LanguageSwitcher />

                <Box>
                    <Tooltip title={t('header.notifications')}>
                        <IconButton ref={notifRef} onClick={handleNotifClick}>
                            <Bell size={20} />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        disableScrollLock
                        anchorEl={notifRef.current}
                        open={openNotif}
                        onClose={handleNotifClose}
                        onClick={handleNotifClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                borderRadius: '12px',
                                minWidth: 360,
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
                        <Box onClick={(e) => e.stopPropagation()}>
                            <NotificationsPopover onClose={handleNotifClose} />
                        </Box>
                    </Menu>
                </Box>

                <Box>
                    <IconButton
                        ref={anchorRef}
                        onClick={handleMenuClick}
                        size="small"
                        aria-controls={openMenu ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={openMenu ? 'true' : undefined}
                    >
                        <Avatar sx={{ width: 32, height: 32, border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>A</Avatar>
                    </IconButton>
                    <Menu
                        disableScrollLock
                        anchorEl={anchorRef.current}
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
                                {user?.name || "Admin User"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                {user?.role || "Role"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {user?.email || "admin@evzone.com"}
                            </Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={handleProfileClick} sx={{ py: 1.5 }}>
                            <ListItemIcon><User size={18} /></ListItemIcon>
                            {t('header.profile')}
                        </MenuItem>
                        <MenuItem onClick={() => { navigate('/admin/settings'); handleMenuClose(); }} sx={{ py: 1.5 }}>
                            <ListItemIcon><Settings size={18} /></ListItemIcon>
                            {t('header.settings')}
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => { handleMenuClose(); logout(); }} sx={{ py: 1.5, color: 'error.main' }}>
                            <ListItemIcon><LogOut size={18} color={theme.palette.error.main} /></ListItemIcon>
                            {t('auth.sign_out')}
                        </MenuItem>
                    </Menu>
                </Box>
            </Stack>
        </Box>
    );
}
