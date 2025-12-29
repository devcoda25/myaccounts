import React, { useState, useEffect } from "react";
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Avatar,
    Divider,
    useTheme,
    Drawer,
    IconButton,
    useMediaQuery,
} from "@mui/material";
import {
    LayoutDashboard,
    Wallet,
    Shield,
    Users,
    Grid,
    Settings,
    HelpCircle,
    Menu,
    Bell,
    Code,
    Lock,
    FileText
} from "lucide-react";
import { alpha } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";

// Drawer width consistent with original
const DRAWER_WIDTH = 280;

interface AppDrawerProps {
    mobileOpen: boolean;
    onDrawerToggle: () => void;
}

const NAV_ITEMS = [
    { label: "Overview", path: "/app", icon: <LayoutDashboard size={20} /> },
    { label: "Wallet", path: "/app/wallet", icon: <Wallet size={20} /> },
    { label: "Security", path: "/app/security", icon: <Shield size={20} /> },
    { label: "Orgs", path: "/app/orgs", icon: <Users size={20} /> },
    { label: "Apps", path: "/app/apps", icon: <Grid size={20} /> },
];

const SECONDARY_NAV_ITEMS = [
    { label: "Parental Controls", path: "/app/parental-controls", icon: <Lock size={20} /> },
    { label: "Developer", path: "/app/developer", icon: <Code size={20} /> },
    { label: "Support", path: "/app/support", icon: <HelpCircle size={20} /> },
    { label: "Terms", path: "/legal/terms", icon: <FileText size={20} />, external: true },
    { label: "Privacy", path: "/legal/privacy", icon: <Shield size={20} />, external: true },
];

import { useTranslation } from "react-i18next";

export default function AppDrawer({ mobileOpen, onDrawerToggle }: AppDrawerProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const SidebarContent = (
        <React.Fragment>
            {/* Logo Area */}
            <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <img src="/logo.png" alt="EVzone" style={{ height: 32, width: 'auto' }} />
            </Box>

            <Box sx={{ px: 3, mb: 2 }}>
                <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="text.secondary"
                    sx={{ opacity: 0.7, letterSpacing: "0.05em" }}
                >
                    MENU
                </Typography>
            </Box>

            {/* Navigation List */}
            <List sx={{ px: 2 }}>
                {NAV_ITEMS.map((item) => {
                    const isActive =
                        location.pathname === item.path ||
                        (item.path !== "/app" && location.pathname.startsWith(item.path));
                    return (
                        <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) onDrawerToggle();
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
                                <ListItemIcon
                                    sx={{ minWidth: 40, color: isActive ? "primary.main" : "inherit" }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primaryTypographyProps={{ fontWeight: isActive ? 600 : 500, fontSize: "0.95rem" }}
                                    primary={item.label}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* Secondary Nav */}
            <List sx={{ px: 2, pb: 2 }}>
                {SECONDARY_NAV_ITEMS.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => {
                                if ((item as any).external) {
                                    window.open(item.path, "_blank");
                                } else {
                                    navigate(item.path);
                                }
                            }}
                            sx={{ borderRadius: "10px", py: 1.5, color: "text.secondary" }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>{item.icon}</ListItemIcon>
                            <ListItemText
                                primaryTypographyProps={{ fontWeight: 500, fontSize: "0.95rem" }}
                                primary={item.label}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

        </React.Fragment>
    );

    return (
        <>
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: DRAWER_WIDTH,
                        borderRadius: "0", // Removed roundness as requested
                        border: "none",
                    },
                }}
            >
                {SidebarContent}
            </Drawer>

            {/* Desktop Sidebar */}
            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 }, display: { xs: "none", md: "block" } }}
            >
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: "none", md: "block" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: DRAWER_WIDTH,
                            borderRight: "1px solid",
                            borderColor: "divider",
                        },
                    }}
                    open
                >
                    {SidebarContent}
                </Drawer>
            </Box>
        </>
    );
}
