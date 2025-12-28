import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    BottomNavigation,
    BottomNavigationAction,
    IconButton,
    useMediaQuery,
    useTheme,
    Stack
} from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    Shield,
    Users,
    Grid
} from 'lucide-react';
import { alpha } from '@mui/material/styles';

import AppDrawer from '../components/drawers/AppDrawer';
import AppHeader from '../components/headers/AppHeader';

const DRAWER_WIDTH = 280;

const NAV_ITEMS = [
    { label: 'Overview', path: '/app', icon: <LayoutDashboard size={20} /> },
    { label: 'Wallet', path: '/app/wallet', icon: <Wallet size={20} /> },
    { label: 'Security', path: '/app/security', icon: <Shield size={20} /> },
    { label: 'Orgs', path: '/app/orgs', icon: <Users size={20} /> },
    { label: 'Apps', path: '/app/apps', icon: <Grid size={20} /> },
];

export default function SidebarLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [bottomNavValue, setBottomNavValue] = useState(0);

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



    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Component-based Drawer (Mobile + Desktop) */}
            <AppDrawer mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />

            {/* Main Content Area */}
            <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <AppHeader onDrawerToggle={handleDrawerToggle} showMobileToggle={true} />

                {/* Page Content */}
                <Box sx={{ p: 3, flexGrow: 1 }}>
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
                            icon={
                                // Clone the icon to apply conditional sizing/color if strictly needed,
                                // but MUI handles color via the wrapper.
                                item.icon
                            }
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
