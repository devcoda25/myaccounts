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
    alpha,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Search as SearchIcon,
    Sun as SunIcon,
    Moon as MoonIcon,
    Bell,
    User as UserIcon,
    Settings,
    LogOut,
    Shield
} from 'lucide-react';
import { useAuth } from 'react-oidc-context';
import { useNavigate, useLocation } from 'react-router-dom';
import { EVZONE } from '../../theme/evzone';
import NotificationsPopover from './NotificationsPopover';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { formatUserId } from '../../utils/format';
import { LanguageSelector } from '../../i18n';
import { useLanguage } from '../../i18n/LanguageProvider';

interface AppHeaderProps {
    onDrawerToggle?: () => void;
    showMobileToggle?: boolean;
}

export default function AppHeader({ onDrawerToggle, showMobileToggle = false }: AppHeaderProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { toggleMode } = useThemeStore();
    const isDark = theme.palette.mode === 'dark';

    // Use store
    const { user, logout: storeLogout } = useAuthStore();
    const auth = useAuth();
    const { t } = useLanguage();

    const logout = async () => {
        try {
            await storeLogout().catch(err => console.error("API Logout failed (non-critical)", err));
            await auth.signoutRedirect();
        } catch (e) {
            console.error("Logout redirect failed", e);
            await auth.removeUser();
            window.location.href = "/auth/signed-out";
        }
    };

    const notifRef = useRef<HTMLButtonElement>(null);
    const [openNotif, setOpenNotif] = useState(false);
    const handleNotifClick = () => setOpenNotif(true);
    const handleNotifClose = () => setOpenNotif(false);

    // Profile Menu State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    const handleProfileClick = () => {
        setAnchorEl(null);
        navigate('/app/profile');
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
                        placeholder="Search"
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
                {/* Language Selector */}
                <Box sx={{ minWidth: 100 }}>
                    <LanguageSelector variant="minimal" />
                </Box>

                <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                    <IconButton size="small" onClick={toggleMode} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                        {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                    </IconButton>
                </Tooltip>

                <Box>
                    <Tooltip title="Notifications">
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

                <Box sx={{ position: 'relative' }}>
                    <IconButton
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        size="small"
                        aria-controls={openMenu ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={openMenu ? 'true' : undefined}
                    >
                        <Avatar
                            src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.otherNames}&background=random`}
                            sx={{ width: 32, height: 32, border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}` }}
                        />
                    </IconButton>
                    <Menu
                        disableScrollLock
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={openMenu}
                        onClose={() => setAnchorEl(null)}
                        onClick={() => setAnchorEl(null)}
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
                                {user ? `${user.firstName} ${user.otherNames}` : 'Guest'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap display="block">
                                {user?.email || ''}
                            </Typography>
                            {user?.id && (
                                <Typography variant="caption" sx={{ color: EVZONE.orange, fontWeight: 700, fontFamily: 'monospace' }}>
                                    ID: {formatUserId(user.id)}
                                </Typography>
                            )}
                        </Box>
                        <Divider />
                        {user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                            <>
                                <MenuItem onClick={() => { setAnchorEl(null); navigate('/admin'); }} sx={{ py: 1.5, color: EVZONE.orange, fontWeight: 600 }}>
                                    <ListItemIcon><Shield size={18} color={EVZONE.orange} /></ListItemIcon>
                                    {t('admin.dashboard.title')}
                                </MenuItem>
                                <Divider />
                            </>
                        )}
                        <MenuItem onClick={handleProfileClick} sx={{ py: 1.5 }}>
                            <ListItemIcon><UserIcon size={18} /></ListItemIcon>
                            {t('navigation.profile')}
                        </MenuItem>
                        <MenuItem onClick={() => { setAnchorEl(null); navigate('/app/settings'); }} sx={{ py: 1.5 }}>
                            <ListItemIcon><Settings size={18} /></ListItemIcon>
                            {t('navigation.settings')}
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => { setAnchorEl(null); logout(); }} sx={{ py: 1.5, color: 'error.main' }}>
                            <ListItemIcon><LogOut size={18} color={theme.palette.error.main} /></ListItemIcon>
                            {t('navigation.signOut')}
                        </MenuItem>
                    </Menu>
                </Box>
            </Stack>
        </Box>
    );
}
