import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    BottomNavigation,
    BottomNavigationAction,
    IconButton,
    useMediaQuery,
    useTheme,
    Stack,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Button
} from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    Shield,
    Users,
    Grid,
    Lock,
    Code,
    HelpCircle,
    FileText,
    LogOut
} from 'lucide-react';
import { alpha } from '@mui/material/styles';
import AppHeader from "@/components/layout/AppHeader";
import { useAuthStore } from '../stores/authStore';
import { useAuth } from "react-oidc-context";

const DRAWER_WIDTH = 280;

const NAV_ITEMS = [
    { label: 'Overview', path: '/app', icon: <LayoutDashboard size={20} /> },
    // { label: 'Wallet', path: 'https://wallet.evzone.app', icon: <Wallet size={20} />, external: true },
    { label: 'Security', path: '/app/security', icon: <Shield size={20} /> },
    // { label: 'Orgs', path: 'https://orgs.evzone.app', icon: <Users size={20} />, external: true },
    { label: 'Apps', path: '/app/apps', icon: <Grid size={20} /> },
];

const SECONDARY_NAV_ITEMS = [
    { label: "Parental Controls", path: "/app/parental-controls", icon: <Lock size={20} /> },
    // { label: "Developer", path: "https://developers.evzone.app", icon: <Code size={20} />, external: true },
    { label: "Support", path: "/app/support", icon: <HelpCircle size={20} /> },
    { label: "Terms", path: "/legal/terms", icon: <FileText size={20} />, external: true },
    { label: "Privacy", path: "/legal/privacy", icon: <Shield size={20} />, external: true },
];

export default function SidebarLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [bottomNavValue, setBottomNavValue] = useState(0);
    const { logout: storeLogout } = useAuthStore();
    const auth = useAuth();
    const logout = async () => {
        try {
            // 1. Clear API Cookies first (ignore errors if already invalid)
            await storeLogout().catch(err => console.error("API Logout failed (non-critical)", err));
            // 2. Then Clear OIDC Session
            await auth.signoutRedirect();
        } catch (e) {
            console.error("Logout redirect failed", e);
            // Fallback: Remove user and go to signed out page manually
            await auth.removeUser();
            window.location.href = "/auth/signed-out";
        }
    };

    // Sync bottom nav state with current path
    useEffect(() => {
        const idx = NAV_ITEMS.findIndex(item =>
            item.path === '/app'
                ? location.pathname === '/app'
                : location.pathname.startsWith(item.path)
        );
        if (idx !== -1) setBottomNavValue(idx);
    }, [location.pathname]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const SidebarContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo Area */}
            <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <img src="/logo.png" alt="EVzone" style={{ height: 32, width: 'auto' }} />
            </Box>

            <Box sx={{ px: 3, mb: 1 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ opacity: 0.7, letterSpacing: "0.05em" }}>
                    MENU
                </Typography>
            </Box>

            {/* Navigation List */}
            <List sx={{ px: 2, flex: 1, overflowY: 'auto' }} disablePadding>
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== "/app" && location.pathname.startsWith(item.path));
                    return (
                        <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setMobileOpen(false);
                                }}
                                selected={isActive}
                                sx={{
                                    borderRadius: "10px",
                                    py: 1.5,
                                    color: isActive ? "primary.main" : "text.secondary",
                                    bgcolor: isActive ? "primary.lighter" : "transparent",
                                    "&.Mui-selected": { bgcolor: "rgba(3, 205, 140, 0.08)" },
                                    "&:hover": { bgcolor: "action.hover" },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: isActive ? "primary.main" : "inherit" }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primaryTypographyProps={{ fontWeight: isActive ? 600 : 500, fontSize: "0.95rem" }} primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}

                {SECONDARY_NAV_ITEMS.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => {
                                if ((item as any).external) {
                                    window.open(item.path, "_blank");
                                } else {
                                    navigate(item.path);
                                    if (isMobile) setMobileOpen(false);
                                }
                            }}
                            sx={{ borderRadius: "10px", py: 1.5, color: "text.secondary" }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>{item.icon}</ListItemIcon>
                            <ListItemText primaryTypographyProps={{ fontWeight: 500, fontSize: "0.95rem" }} primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            {/* Logout Action */}
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    startIcon={<LogOut size={18} />}
                    onClick={logout}
                    sx={{
                        justifyContent: 'flex-start',
                        borderColor: alpha(theme.palette.text.secondary, 0.2),
                        color: theme.palette.text.secondary,
                        "&:hover": { borderColor: theme.palette.text.primary, color: theme.palette.text.primary }
                    }}
                >
                    Sign out
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: DRAWER_WIDTH,
                        border: "none",
                    },
                }}
            >
                {SidebarContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: DRAWER_WIDTH,
                        backgroundColor: alpha(theme.palette.background.paper, 0.4),
                        backdropFilter: 'blur(10px)',
                        borderRight: `1px solid ${theme.palette.divider}`,
                        borderWidth: 0,
                        position: 'fixed',
                        height: '100vh',
                        zIndex: 1200
                    },
                }}
                open
            >
                <Box sx={{
                    height: '100%',
                    borderRight: `1px solid ${theme.palette.divider}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.4),
                    backdropFilter: 'blur(10px)'
                }}>
                    {SidebarContent}
                </Box>
            </Drawer>

            {/* Main Content Area */}
            <Box component="main" sx={{
                flexGrow: 1,
                ml: { md: `${DRAWER_WIDTH}px` },
                width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <AppHeader onDrawerToggle={handleDrawerToggle} showMobileToggle={true} />

                {/* Page Content */}
                <Box sx={{ p: 3, flexGrow: 1, pb: { xs: 10, md: 3 } }}>
                    <Outlet />
                </Box>
            </Box>

            {/* Mobile Bottom Navigation */}
            <Paper sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                display: { xs: 'block', md: 'none' },
                zIndex: 1300,
                borderRadius: '0',
                overflow: 'hidden',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
                borderTop: `1px solid ${theme.palette.divider}`
            }} elevation={3}>
                <BottomNavigation
                    showLabels
                    value={bottomNavValue}
                    onChange={(event, newValue) => {
                        setBottomNavValue(newValue);
                        navigate(NAV_ITEMS[newValue].path);
                    }}
                    sx={{
                        height: 72,
                        bgcolor: alpha(theme.palette.background.paper, 0.94),
                        backdropFilter: 'blur(10px)',
                        '& .MuiBottomNavigationAction-root': {
                            color: 'text.secondary',
                            '&.Mui-selected': {
                                color: 'primary.main',
                            }
                        }
                    }}
                >
                    {NAV_ITEMS.map((item, index) => (
                        <BottomNavigationAction
                            key={item.label}
                            label={item.label}
                            icon={item.icon}
                            sx={{
                                '& .MuiBottomNavigationAction-label': {
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    mt: 0.5
                                }
                            }}
                        />
                    ))}
                </BottomNavigation>
            </Paper>
        </Box>
    );
}
