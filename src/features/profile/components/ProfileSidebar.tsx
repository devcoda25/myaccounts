import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, Divider, Stack, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { EVZONE } from "@/theme/evzone";
import { LinkIcon, LockIcon, MailIcon, ShieldCheckIcon } from "@/components/icons";



export const ProfileSidebar = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const evOrangeOutlinedSx = {
        borderColor: alpha(EVZONE.orange, 0.65),
        color: EVZONE.orange,
        backgroundColor: alpha(theme.palette.background.paper, 0.20),
        "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
    } as const;

    const navItems = [
        { label: "Profile", icon: <LockIcon size={18} />, route: "/app/profile", activeMatch: "/app/profile" }, // Strict match for profile?
        { label: "Contact", icon: <MailIcon size={18} />, route: "/app/profile/contact" },
        { label: "Linked accounts", icon: <LinkIcon size={18} />, route: "/app/profile/linked-accounts" },
        { label: "Organizations", icon: <LinkIcon size={18} />, external: "https://org.evzone.app" },
        { label: "Wallet", icon: <LinkIcon size={18} />, external: "https://wallet.evzone.app" },
        { label: "Security", icon: <ShieldCheckIcon size={18} />, route: "/app/security" },
    ];

    return (
        <Card>
            <CardContent className="p-4">
                <Stack spacing={1.2}>
                    <Typography sx={{ fontWeight: 950 }}>Navigation</Typography>
                    <Divider />
                    {navItems.map((item) => {
                        // Simple active check: strictly equal if exact match needed, or startsWith for subroutes
                        // For /app/profile, we only want it active if it's exactly /app/profile, to distinguish from /app/profile/contact
                        const isActive = location.pathname === item.route;

                        return (
                            <Button
                                key={item.label}
                                variant={isActive ? "contained" : "text"}
                                color="secondary"
                                startIcon={item.icon}
                                sx={
                                    isActive
                                        ? ({
                                            backgroundColor: EVZONE.orange,
                                            color: "#FFFFFF",
                                            "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92) },
                                            justifyContent: "flex-start",
                                        } as const)
                                        : {
                                            justifyContent: "flex-start",
                                            color: theme.palette.text.primary,
                                            "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.10) },
                                        }
                                }
                                onClick={() => {
                                    if ((item as any).external) {
                                        window.location.href = (item as any).external;
                                    } else {
                                        navigate(item.route!);
                                    }
                                }}
                            >
                                {item.label}
                            </Button>
                        );
                    })}
                    <Divider />
                    <Button
                        variant="outlined"
                        sx={evOrangeOutlinedSx}
                        startIcon={<ShieldCheckIcon size={18} />}
                        onClick={() => navigate('/app/security')}
                    >
                        Security settings
                    </Button>
                </Stack>
            </CardContent>
        </Card >
    );
};
