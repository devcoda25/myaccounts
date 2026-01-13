import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Divider,
    Drawer,
    Stack,
    Typography,
    useTheme,
    alpha,
    useMediaQuery,
    Paper,
    BottomNavigation,
    BottomNavigationAction
} from '@mui/material';
import {
    ShieldCheck as ShieldIcon,
    LayoutDashboard as LayoutIcon,
    ClipboardList as ClipboardIcon,
    LogOut as LogOutIcon,
    RefreshCw as RefreshIcon,
    FileText as FileTextIcon,
    Building2 as BuildingIcon,
    Gavel as GavelIcon
} from 'lucide-react';
import AdminHeader from "@/components/layout/AdminHeader";
import { useAdminAuthStore } from '../stores/adminAuthStore';

const EVZONE = { green: "#03cd8c", orange: "#f77f00" } as const;
const SIDEBAR_WIDTH = 260;

export default function AdminLayout() {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const isDark = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // State for Bottom Navigation
    const [bottomNavValue, setBottomNavValue] = useState(0);

    const { checkPermission, user, isLoading, logout } = useAdminAuthStore();
    const isAuthenticated = !!user;

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/admin/auth/login');
        }
    }, [isLoading, isAuthenticated, navigate]);

    if (isLoading) {
        return null; // Or a loading spinner
    }

    const menuItems = [
        { label: "Dashboard", icon: <LayoutIcon size={18} />, route: "/admin/dashboard", permission: "view_dashboard" },
        { label: "Users", icon: <ShieldIcon size={18} />, route: "/admin/users", permission: "manage_users" },

        { label: "KYC Requests", icon: <FileTextIcon size={18} />, route: "/admin/kyc", permission: "view_kyc" },

        { label: "Disputes", icon: <GavelIcon size={18} />, route: "/admin/disputes", permission: "view_disputes" },
        { label: "Apps", icon: <LayoutIcon size={18} />, route: "/admin/apps", permission: "manage_apps" },
        { label: "Audit logs", icon: <ClipboardIcon size={18} />, route: "/admin/audit", permission: "view_audit_logs" },
        { label: "Administrators", icon: <ShieldIcon size={18} />, route: "/admin/administrators", permission: "manage_admins" }, // New
        { label: "System status", icon: <ShieldIcon size={18} />, route: "/admin/status", permission: "view_status" },
    ].filter(item => checkPermission(item.permission));

    // Sync bottom nav state with current path
    React.useEffect(() => {
        const foundIdx = menuItems.findIndex(item => location.pathname.startsWith(item.route));
        if (foundIdx !== -1) setBottomNavValue(foundIdx);
    }, [location.pathname, menuItems]);

    const handleDrawerClose = () => {
        setIsClosing(true);
        setMobileOpen(false);
    };

    const handleDrawerTransitionEnd = () => {
        setIsClosing(false);
    };

    const handleDrawerToggle = () => {
        if (!isClosing) {
            setMobileOpen(!mobileOpen);
        }
    };

    const pageBg =
        isDark
            ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
            : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo Area */}
            {/* Logo Area */}
            <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <img src="/logo.png" alt="EVzone" style={{ height: 32, width: 'auto' }} />
            </Box>

            {/* Nav Items */}
            <Box sx={{ px: 2, flex: 1, overflowY: 'auto' }}>
                <Stack spacing={0.5}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.route);
                        return (
                            <Button
                                key={item.label}
                                variant={isActive ? "contained" : "text"}
                                color="secondary"
                                startIcon={item.icon}
                                sx={
                                    isActive
                                        ? ({ backgroundColor: EVZONE.orange, color: "#FFFFFF", "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92) }, justifyContent: "flex-start", borderRadius: "10px", py: 1.5 } as const)
                                        : ({ justifyContent: "flex-start", color: theme.palette.text.primary, "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.10) }, borderRadius: "10px", py: 1.5 } as const)
                                }
                                onClick={() => {
                                    navigate(item.route);
                                    if (isMobile) setMobileOpen(false);
                                }}
                            >
                                {item.label}
                            </Button>
                        );
                    })}
                </Stack>
            </Box>

            {/* Bottom Actions */}
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Stack spacing={1}>
                    <Button variant="outlined" startIcon={<LogOutIcon size={18} />}
                        sx={{
                            borderColor: alpha(EVZONE.orange, 0.65),
                            color: EVZONE.orange,
                            backgroundColor: alpha(theme.palette.background.paper, 0.20),
                            "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
                            justifyContent: "flex-start",
                            borderRadius: "10px",
                            py: 1.5
                        }}
                        onClick={logout}
                    >
                        Sign out
                    </Button>
                </Stack>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: pageBg }}>
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onTransitionEnd={handleDrawerTransitionEnd}
                onClose={handleDrawerClose}
                ModalProps={{ keepMounted: true }} // Better open performance on mobile
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: SIDEBAR_WIDTH,
                        backgroundColor: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(10px)',
                        borderRight: `1px solid ${theme.palette.divider}`
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: SIDEBAR_WIDTH,
                        backgroundColor: alpha(theme.palette.background.paper, 0.4),
                        backdropFilter: 'blur(10px)',
                        borderRight: `1px solid ${theme.palette.divider}`,
                        borderWidth: 0, // Handled by box border
                        position: 'fixed',
                        height: '100vh'
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
                    {drawerContent}
                </Box>
            </Drawer>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ml: { md: `${SIDEBAR_WIDTH}px` },
                    width: { xs: '100%', md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header (Top Bar) */}
                <AdminHeader onDrawerToggle={handleDrawerToggle} showMobileToggle={true} />

                {/* Page Content */}
                <Box sx={{ p: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
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
                        navigate(menuItems[newValue].route);
                    }}
                    sx={{
                        height: 72 + (typeof window !== 'undefined' && /iPhone|iPod|iPad/.test(navigator.userAgent) ? 10 : 0), // Extra padding for iOS home indicator if needed
                        pb: typeof window !== 'undefined' && /iPhone|iPod|iPad/.test(navigator.userAgent) ? 2 : 0,
                        bgcolor: alpha(theme.palette.background.paper, 0.94),
                        backdropFilter: 'blur(10px)',
                        '& .MuiBottomNavigationAction-root': {
                            color: 'text.secondary',
                            '&.Mui-selected': {
                                color: EVZONE.green,
                                '& .MuiSvgIcon-root, & svg': {
                                    filter: `drop-shadow(0 0 6px ${alpha(EVZONE.green, 0.4)})`
                                }
                            }
                        }
                    }}
                >
                    {menuItems.slice(0, 5).map((item) => ( // Show first 5 items
                        <BottomNavigationAction
                            key={item.label}
                            label={item.label}
                            icon={item.icon}
                            sx={{
                                '& .MuiBottomNavigationAction-label': {
                                    fontSize: '0.65rem',
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
