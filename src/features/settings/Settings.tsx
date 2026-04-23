import React from "react";
import { useTranslation } from "react-i18next";

import {
    Box,
    Card,
    CardContent,
    CssBaseline,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
    Bell,
    ChevronRight,
    FileText,
    Globe,
    Lock,
    Moon,
    Shield,
    Sun,
    User,
    HelpCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "@/stores/themeStore";
import { EVZONE } from "@/theme/evzone";
import { api } from "@/utils/api";

function IconBase({ size = 18, children }: { size?: number; children: React.ReactNode }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            style={{ display: "block" }}
        >
            {children}
        </svg>
    );
}

export default function SettingsPage() {
    const { t } = useTranslation("translation");
    const navigate = useNavigate();
    const theme = useTheme();
    const { mode, toggleMode } = useThemeStore();
    const isDark = mode === "dark";

    const pageBg =
        mode === "dark"
            ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
            : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

    const SETTINGS_GROUPS = [
        {
            title: t("settings.groups.account"),
            items: [
                {
                    label: t("settings.items.personalProfile"),
                    desc: t("settings.items.personalProfileDesc"),
                    icon: <User size={20} />,
                    onClick: () => navigate("/app/profile"),
                },
                {
                    label: t("settings.items.security"),
                    desc: t("settings.items.securityDesc"),
                    icon: <Shield size={20} />,
                    onClick: () => navigate("/app/security"),
                },
                {
                    label: t("settings.items.notifications"),
                    desc: t("settings.items.notificationsDesc"),
                    icon: <Bell size={20} />,
                    onClick: () => navigate("/app/notifications"),
                },
            ],
        },
        {
            title: t("settings.groups.privacyLegal"),
            items: [
                {
                    label: t("settings.items.privacyCenter"),
                    desc: t("settings.items.privacyCenterDesc"),
                    icon: <Lock size={20} />,
                    onClick: () => navigate("/app/privacy/consents"),
                },
                {
                    label: t("settings.items.termsOfService"),
                    desc: t("settings.items.termsOfServiceDesc"),
                    icon: <FileText size={20} />,
                    onClick: () => window.open("/legal/terms", "_blank"),
                },
                {
                    label: t("settings.items.privacyPolicy"),
                    desc: t("settings.items.privacyPolicyDesc"),
                    icon: <FileText size={20} />,
                    onClick: () => window.open("/legal/privacy", "_blank"),
                },
            ],
        },
        {
            title: t("settings.groups.appPreferences"),
            items: [
                {
                    label: t("settings.items.appearance"),
                    desc: isDark ? t("settings.items.appearanceDescDark") : t("settings.items.appearanceDescLight"),
                    icon: isDark ? <Moon size={20} /> : <Sun size={20} />,
                    onClick: () => {
                        toggleMode();
                        const newMode = isDark ? "light" : "dark";
                        api("/users/me/settings", {
                            method: "PATCH",
                            body: JSON.stringify({ theme: newMode })
                        }).catch(console.error);
                    },
                    action: (
                        <Box
                            sx={{
                                width: 36,
                                height: 20,
                                borderRadius: 10,
                                bgcolor: isDark ? EVZONE.green : alpha(theme.palette.text.secondary, 0.3),
                                position: "relative",
                                transition: "all 0.2s",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: "50%",
                                    bgcolor: "#fff",
                                    position: "absolute",
                                    top: 2,
                                    left: isDark ? 18 : 2,
                                    transition: "all 0.2s",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                }}
                            />
                        </Box>
                    ),
                },

            ],
        },
        {
            title: t("settings.groups.support"),
            items: [
                {
                    label: t("settings.items.helpSupport"),
                    desc: t("settings.items.helpSupportDesc"),
                    icon: <HelpCircle size={20} />,
                    onClick: () => navigate("/app/support"),
                },
            ],
        },
    ];

    return (
        <>
            <CssBaseline />
            <Box className="min-h-screen" sx={{ background: pageBg }}>
                <Box className="mx-auto max-w-3xl px-4 py-8 md:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                            {t("settings.title")}
                        </Typography>
                        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
                            {t("settings.subtitle")}
                        </Typography>

                        <Stack spacing={4}>
                            {SETTINGS_GROUPS.map((group) => (
                                <Box key={group.title}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontWeight: 800,
                                            color: theme.palette.text.secondary,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            ml: 1,
                                            mb: 1,
                                            display: "block",
                                        }}
                                    >
                                        {group.title}
                                    </Typography>
                                    <Card
                                        sx={{
                                            borderRadius: 3,
                                            overflow: "hidden",
                                            border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                                            bgcolor: alpha(theme.palette.background.paper, 0.6),
                                            backdropFilter: "blur(12px)",
                                        }}
                                    >
                                        <List disablePadding>
                                            {group.items.map((item, index) => (
                                                <React.Fragment key={item.label}>
                                                    <ListItem disablePadding>
                                                        <ListItemButton
                                                            onClick={item.onClick}
                                                            sx={{
                                                                py: 2,
                                                                px: 2.5,
                                                                "&:hover": {
                                                                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                                                                },
                                                            }}
                                                        >
                                                            <ListItemIcon
                                                                sx={{
                                                                    minWidth: 44,
                                                                    color: theme.palette.text.primary,
                                                                }}
                                                            >
                                                                {item.icon}
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={
                                                                    <Typography
                                                                        variant="body1"
                                                                        sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                                                                    >
                                                                        {item.label}
                                                                    </Typography>
                                                                }
                                                                secondary={
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{ color: theme.palette.text.secondary }}
                                                                    >
                                                                        {item.desc}
                                                                    </Typography>
                                                                }
                                                            />
                                                            {(item as any).action || (
                                                                <ChevronRight size={18} color={theme.palette.text.disabled} />
                                                            )}
                                                        </ListItemButton>
                                                    </ListItem>
                                                    {index < group.items.length - 1 && (
                                                        <Divider sx={{ ml: 8.5 }} />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    </Card>
                                </Box>
                            ))}
                        </Stack>
                    </motion.div>
                </Box>
            </Box>
        </>
    );
}
