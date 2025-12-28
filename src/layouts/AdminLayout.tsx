import React, { useState } from 'react';
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
    useMediaQuery
} from '@mui/material';
import {
    ShieldCheck as ShieldIcon,
    LayoutDashboard as LayoutIcon,
    ClipboardList as ClipboardIcon,
    LogOut as LogOutIcon,
    RefreshCw as RefreshIcon,
    FileText as FileTextIcon,
    Building2 as BuildingIcon
} from 'lucide-react';
import AppHeader from '../components/headers/AppHeader';

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

    const menuItems = [
        { label: "Dashboard", icon: <LayoutIcon size={18} />, route: "/admin/dashboard" },
        { label: "Users", icon: <ShieldIcon size={18} />, route: "/admin/users" },
        { label: "Organizations", icon: <BuildingIcon size={18} />, route: "/admin/orgs" },
        { label: "KYC Requests", icon: <FileTextIcon size={18} />, route: "/admin/kyc" },
        { label: "Wallets", icon: <RefreshIcon size={18} />, route: "/admin/wallets" },
        { label: "Transactions", icon: <ClipboardIcon size={18} />, route: "/admin/transactions" },
        { label: "Audit logs", icon: <ClipboardIcon size={18} />, route: "/admin/audit" },
        { label: "System status", icon: <ShieldIcon size={18} />, route: "/admin/status" },
    ];

    const pageBg =
        isDark
            ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
            : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo Area */}
            <Box sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: 14, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${EVZONE.green} 0%, rgba(3,205,140,0.75) 100%)` }}>
                        <Typography sx={{ color: "#fff", fontWeight: 950, letterSpacing: -0.4 }}>EV</Typography>
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 950, lineHeight: 1.05 }}>EVzone Admin</Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Portal</Typography>
                    </Box>
                </Stack>
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
                                        ? ({ backgroundColor: EVZONE.orange, color: "#FFFFFF", "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92) }, justifyContent: "flex-start", borderRadius: 3, py: 1.2 } as const)
                                        : ({ justifyContent: "flex-start", color: theme.palette.text.primary, "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.10) }, borderRadius: 3, py: 1.2 } as const)
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
                            borderRadius: 3
                        }}
                        onClick={() => navigate('/auth/sign-in')}
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
                <AppHeader onDrawerToggle={handleDrawerToggle} showMobileToggle={true} />

                {/* Page Content */}
                <Box sx={{ p: { xs: 2, md: 4 } }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
