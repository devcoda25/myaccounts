import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  History
} from "lucide-react";

import AuthHeader from "@/components/layout/AuthHeader";
import { EVZONE } from "@/theme/evzone";

/**
 * EVzone My Accounts - Redesigned Signed Out Page
 * Route: /auth/signed-out
 */

export default function SignedOutPage() {
  const { t } = useTranslation("common"); {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [searchParams] = useSearchParams();

  const appName = searchParams.get("app") || "EVzone Portal";
  const redirectUri = searchParams.get("redirect_uri") || "";

  const pageBg = isDark
    ? "radial-gradient(1200px 600px at 12% 6%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 10%, rgba(3,205,140,0.16), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
    : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.18), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.12), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeContainedSx = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    borderRadius: 14,
    px: 3,
    py: 1.2,
    fontWeight: 800,
    textTransform: 'none',
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, isDark ? 0.28 : 0.20)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
  } as const;

  const orangeOutlinedSx = {
    borderColor: alpha(EVZONE.orange, 0.70),
    color: EVZONE.orange,
    borderRadius: 14,
    px: 3,
    py: 1.2,
    fontWeight: 800,
    textTransform: 'none',
    backgroundColor: alpha(theme.palette.background.paper, 0.35),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const orangeTextSx = {
    color: EVZONE.orange,
    fontWeight: 900,
    textTransform: "none",
    "&:hover": { backgroundColor: alpha(EVZONE.orange, isDark ? 0.14 : 0.10) },
  } as const;

  const signInAgain = () => navigate("/auth/sign-in");

  const returnToApp = () => {
    if (redirectUri) {
      window.location.href = redirectUri;
    } else {
      navigate("/auth/sign-in");
    }
  };

  const safeHost = (url: string) => {
    try {
      return new URL(url).host;
    } catch {
      return "";
    }
  };

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>
      {/* Unified Auth Header */}
      <AuthHeader title={t("EVzone Accounts")} subtitle={t("Successfully signed out")} />

      {/* Body */}
      <Box className="mx-auto max-w-5xl px-4 py-12 md:px-6">
        <Box className="grid gap-6 md:grid-cols-12">
          {/* Left - Context Detail (Premium side) */}
          <motion.div
            className="hidden md:block md:col-span-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{
              height: '100%',
              borderRadius: 24,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundImage: "radial-gradient(900px 420px at 12% 0%, rgba(3,205,140,0.14), transparent 60%)",
            }}>
              <CardContent className="p-7">
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h5" fontWeight={900} gutterBottom>
                      See you soon!
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      You have successfully ended your secure session. For your security, we recommend closing this browser tab.
                    </Typography>
                  </Box>

                  <Divider />

                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Box sx={{ p: 1, borderRadius: 12, bgcolor: alpha(EVZONE.green, 0.1), color: EVZONE.green }}>
                        <History size={20} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>Security Audit</Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Your sign-out was logged and all local credentials were purged.
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Box sx={{ p: 1, borderRadius: 12, bgcolor: alpha(EVZONE.green, 0.1), color: EVZONE.green }}>
                        <RefreshCw size={20} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>Fast Sign-In</Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Use your Passkey or Google account to jump back in anytime.
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right - Main Action Card */}
          <motion.div
            className="md:col-span-7"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Card sx={{
              borderRadius: 24,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}>
              <CardContent className="p-7 md:p-9">
                <Stack spacing={4}>
                  <Stack direction="row" spacing={2.5} alignItems="center">
                    <Box sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 20,
                      display: "grid",
                      placeItems: "center",
                      backgroundColor: alpha(EVZONE.green, 0.1),
                      color: EVZONE.green,
                      boxShadow: `0 8px 32px ${alpha(EVZONE.green, 0.1)}`
                    }}>
                      <CheckCircle size={32} />
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight={900}>You're signed out</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Your access to EVzone services on this device is now locked.
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{
                    borderRadius: 20,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.40),
                    p: 3
                  }}>
                    <Stack spacing={1.5}>
                      <Typography variant="subtitle1" fontWeight={900}>What's next?</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        You can sign back in to **{appName}** or visit your profile later.
                      </Typography>
                      {redirectUri && (
                        <Box sx={{
                          mt: 1,
                          px: 2,
                          py: 1,
                          borderRadius: 10,
                          bgcolor: alpha(theme.palette.text.primary, 0.04),
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Typography variant="caption" sx={{ opacity: 0.6 }}>Destination:</Typography>
                          <Typography variant="caption" fontWeight={700}>{safeHost(redirectUri)}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={orangeContainedSx}
                      endIcon={<ArrowRight size={20} />}
                      onClick={signInAgain}
                    >
                      Sign in again
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={orangeOutlinedSx}
                      startIcon={<ArrowLeft size={20} />}
                      onClick={returnToApp}
                    >
                      Return to App
                    </Button>
                  </Stack>

                  <Alert severity="info" sx={{ borderRadius: 12 }}>
                    To protect your information, clear your browser cache if using a public computer.
                  </Alert>

                  <Stack direction="row" justifyContent="center" spacing={3}>
                    <Button variant="text" sx={orangeTextSx} onClick={() => navigate("/auth/forgot-password")}>
                      Reset Password
                    </Button>
                    <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto' }} />
                    <Button variant="text" sx={orangeTextSx} onClick={() => navigate("/auth/account-recovery-help")}>
                      Get Help
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Footer */}
        <Box className="mt-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between" sx={{ px: 2 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, opacity: 0.7 }}>
            © {new Date().getFullYear()} EVzone Group
          </Typography>
          <Stack direction="row" spacing={3}>
            <Typography variant="caption" sx={{ cursor: 'pointer', "&:hover": { color: EVZONE.orange } }} onClick={() => window.open("/legal/terms", "_blank")}>Terms</Typography>
            <Typography variant="caption" sx={{ cursor: 'pointer', "&:hover": { color: EVZONE.orange } }} onClick={() => window.open("/legal/privacy", "_blank")}>Privacy</Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
