import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AuthHeader from "@/components/layout/AuthHeader";

import {
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    Typography,
    useTheme
} from "@mui/material";
import { motion } from "framer-motion";
import { EVZONE } from "@/theme/evzone";
import { ArrowLeftIcon, ShieldIcon } from '@/components/icons';
import { alpha } from "@mui/material/styles";

export default function AdminForgotPassword() {
    const { t } = useTranslation("common");
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";


    const pageBg =
        isDark
            ? "radial-gradient(1200px 600px at 12% 6%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 10%, rgba(3,205,140,0.16), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
            : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.18), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.12), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

    const orangeContainedSx = {
        backgroundColor: EVZONE.orange,
        color: "#FFFFFF",
        boxShadow: `0 18px 48px ${alpha(EVZONE.orange, isDark ? 0.28 : 0.20)}`,
        "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
        "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
    } as const;

    return (
        <Box className="min-h-screen" sx={{ background: pageBg }}>
            <AuthHeader title={t("EVzone Admin")} subtitle={t("Sign in to manage the platform")} />

            <Box className="mx-auto max-w-lg px-4 py-8 md:px-6 md:py-24">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                    <Card>
                        <CardContent className="p-5 md:p-8">
                            <Stack spacing={3} alignItems="center" textAlign="center">
                                <Box sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    backgroundColor: alpha(EVZONE.orange, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: EVZONE.orange,
                                    mb: 1
                                }}>
                                    <ShieldIcon size={32} />
                                </Box>

                                <Typography variant="h4" fontWeight={800} sx={{ color: isDark ? "text.primary" : "#000000" }}>
                                    Contact Super Admin
                                </Typography>

                                <Typography variant="body1" sx={{ color: isDark ? theme.palette.text.secondary : "#000000" }}>
                                    Admin passwords cannot be reset automatically.<br />
                                    Please contact a Super Administrator or the IT Security Team to request a password reset for your account.
                                </Typography>

                                <Box sx={{ width: '100%', pt: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<ArrowLeftIcon size={18} />}
                                        onClick={() => navigate("/admin/auth/login")}
                                        sx={orangeContainedSx}
                                    >
                                        Back to Sign In
                                    </Button>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </motion.div>
            </Box>
        </Box>
    );
}
