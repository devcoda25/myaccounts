import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CssBaseline,
  Divider,
  IconButton,
  Snackbar,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Accept Organization Invite (Public)
 * Route: /org-invite/accept
 *
 * Features:
 * - Shows org name + invited role
 * - Accept and continue
 * - If not logged in: redirect to sign-in then return
 * - If logged in as different user: account chooser
 */

import { ThemeMode, Severity, AuthState, OrgRole } from "../../utils/types";
import {
  SunIcon,
  MoonIcon,
  GlobeIcon,
  BuildingIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  UserIcon
} from "../../utils/icons";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const THEME_KEY = "evzone_myaccounts_theme";

// -----------------------------
// Theme helpers
// -----------------------------
function getStoredMode(): ThemeMode {
  try {
    const v = window.localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? (v as ThemeMode) : "light";
  } catch {
    return "light";
  }
}

function setStoredMode(mode: ThemeMode) {
  try {
    window.localStorage.setItem(THEME_KEY, mode);
  } catch {
    // ignore
  }
}

function buildTheme(mode: ThemeMode) {
  const isDark = mode === "dark";
  const bg = isDark ? "#07110F" : "#F4FFFB";
  const paper = isDark ? "#0B1A17" : "#FFFFFF";
  const textPrimary = isDark ? "#E9FFF7" : "#0B1A17";
  const textSecondary = isDark ? alpha("#E9FFF7", 0.74) : alpha("#0B1A17", 0.70);

  return createTheme({
    palette: {
      mode,
      primary: { main: EVZONE.green },
      secondary: { main: EVZONE.orange },
      background: { default: bg, paper },
      text: { primary: textPrimary, secondary: textSecondary },
      divider: isDark ? alpha("#E9FFF7", 0.12) : alpha("#0B1A17", 0.10),
    },
    shape: { borderRadius: 18 },
    typography: {
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      h5: { fontWeight: 950, letterSpacing: -0.5 },
      h6: { fontWeight: 900, letterSpacing: -0.28 },
      button: { fontWeight: 900, textTransform: "none" },
    },
    components: {
      MuiButton: { styleOverrides: { root: { borderRadius: 14, textTransform: "none", boxShadow: "none" } } },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            border: `1px solid ${isDark ? alpha("#E9FFF7", 0.10) : alpha("#0B1A17", 0.10)}`,
            backgroundImage:
              "radial-gradient(900px 420px at 10% 0%, rgba(3,205,140,0.12), transparent 60%), radial-gradient(900px 420px at 90% 0%, rgba(3,205,140,0.10), transparent 55%)",
          },
        },
      },
    },
  });
}

function initials(nameOrEmail: string) {
  const s = nameOrEmail.trim();
  if (s.includes("@")) {
    const u = s.split("@")[0] || "user";
    return (u.slice(0, 2) || "EV").toUpperCase();
  }
  const parts = s.split(/\s+/);
  const a = parts[0]?.[0] || "E";
  const b = parts[1]?.[0] || parts[0]?.[1] || "V";
  return (a + b).toUpperCase();
}

function readParam(key: string, fallback: string) {
  try {
    const qs = new URLSearchParams(window.location.search);
    return qs.get(key) || fallback;
  } catch {
    return fallback;
  }
}

// --- lightweight self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as any;
    if (w.__EVZONE_ACCEPT_INVITE_TESTS_RAN__) return;
    w.__EVZONE_ACCEPT_INVITE_TESTS_RAN__ = true;
    const assert = (name: string, cond: boolean) => {
      if (!cond) throw new Error(`Test failed: ${name}`);
    };
    assert("initials", initials("ronald@evworld.africa").length === 2);
  } catch (e) {
    // ignore
  }
}

export default function AcceptOrgInvitePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [authState, setAuthState] = useState<AuthState>("not_logged_in");

  // Invite details (simulate query params)
  const token = readParam("token", "inv_ab12cd34");
  const orgName = readParam("org", "EV World");
  const role = readParam("role", "Member") as OrgRole;
  const invitedEmail = readParam("email", "finance@evworld.africa");
  const appName = readParam("app", "EVzone");
  const inviter = readParam("by", "Ronald");

  const currentUserEmail = authState === "logged_in_different_user" ? "someoneelse@gmail.com" : invitedEmail;

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    if (typeof window !== "undefined") runSelfTestsOnce();
  }, []);

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeContained = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.18)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
  } as const;

  const orangeOutlined = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const toggleMode = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    setStoredMode(next);
  };

  const accept = () => {
    const returnTo = `/org-invite/accept?token=${encodeURIComponent(token)}`;

    if (authState === "not_logged_in") {
      navigate(`/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    if (authState === "logged_in_different_user") {
      navigate(`/auth/choose-account?continue=${encodeURIComponent(returnTo)}`);
      return;
    }

    setSnack({ open: true, severity: "success", msg: "Invite accepted." });
    setTimeout(() => {
      navigate(`/app/orgs/${encodeURIComponent(orgName)}`);
    }, 1000);
  };

  const decline = () => {
    setSnack({ open: true, severity: "info", msg: "Invite declined." });
  };

  const showAccountChooser = () => {
    const returnTo = `/org-invite/accept?token=${encodeURIComponent(token)}`;
    navigate(`/auth/choose-account?continue=${encodeURIComponent(returnTo)}`);
  };

  const showSignIn = () => {
    const returnTo = `/org-invite/accept?token=${encodeURIComponent(token)}`;
    navigate(`/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const authHint =
    authState === "not_logged_in"
      ? "You are not signed in. Accepting will send you to sign in first."
      : authState === "logged_in_different_user"
        ? `You are signed in as ${currentUserEmail}. This invite is for ${invitedEmail}.`
        : `You are signed in as ${currentUserEmail}.`;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="min-h-screen" sx={{ background: pageBg }}>
        {/* Top bar */}
        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)", backgroundColor: alpha(theme.palette.background.default, 0.72) }}>
          <Box className="mx-auto max-w-5xl px-4 py-3 md:px-6">
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box sx={{ width: 40, height: 40, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(3,205,140,1) 0%, rgba(3,205,140,0.75) 100%)", boxShadow: `0 14px 40px ${alpha(isDark ? "#000" : "#0B1A17", 0.20)}` }}>
                  <Typography sx={{ color: "white", fontWeight: 950, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05 }}>EVzone</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Organization invite</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                  <IconButton size="small" onClick={toggleMode} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Language">
                  <IconButton size="small" sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    <GlobeIcon size={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Body */}
        <Box className="mx-auto max-w-5xl px-4 py-10 md:px-6">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              {/* Demo control */}
              <Card>
                <CardContent className="p-5">
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.4} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Box>
                      <Typography sx={{ fontWeight: 950 }}>Demo controls</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Simulate auth flow: not logged in, logged in, or different user.
                      </Typography>
                    </Box>
                    <TextField select label="Auth state" value={authState} onChange={(e) => setAuthState(e.target.value as AuthState)} sx={{ minWidth: 260 }}>
                      <MenuItem value="not_logged_in">Not logged in</MenuItem>
                      <MenuItem value="logged_in_same_user">Logged in as invited user</MenuItem>
                      <MenuItem value="logged_in_different_user">Logged in as different user</MenuItem>
                    </TextField>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 md:p-8">
                  <Stack spacing={2.0}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Avatar sx={{ width: 56, height: 56, borderRadius: 18, bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary, fontWeight: 950 }}>
                          {initials(orgName)}
                        </Avatar>
                        <Box>
                          <Typography variant="h5">You have been invited</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Join <b>{orgName}</b> on {appName}.
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip icon={<BuildingIcon size={16} />} label={orgName} variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                        <Chip label={`Role: ${role}`} color={role === "Admin" || role === "Owner" ? "info" : "default"} />
                      </Stack>
                    </Stack>

                    <Divider />

                    <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                      <Stack spacing={0.8}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <UserIcon size={18} />
                          <Typography sx={{ fontWeight: 950 }}>Invite details</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Invited email: <b>{invitedEmail}</b>
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Invited by: <b>{inviter}</b>
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Token: <b>{token}</b>
                        </Typography>
                      </Stack>
                    </Box>

                    <Alert severity={authState === "logged_in_different_user" ? "warning" : "info"} icon={<ShieldCheckIcon size={18} />}>
                      {authHint}
                    </Alert>

                    {authState === "logged_in_different_user" ? (
                      <Button variant="outlined" sx={orangeOutlined} onClick={showAccountChooser} startIcon={<UserIcon size={18} />}>
                        Choose another account
                      </Button>
                    ) : authState === "not_logged_in" ? (
                      <Button variant="outlined" sx={orangeOutlined} onClick={showSignIn} startIcon={<UserIcon size={18} />}>
                        Sign in
                      </Button>
                    ) : null}

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="contained" color="secondary" sx={orangeContained} endIcon={<ArrowRightIcon size={18} />} onClick={accept}>
                        Accept and continue
                      </Button>
                      <Button variant="outlined" sx={orangeOutlined} onClick={decline}>
                        Decline
                      </Button>
                    </Stack>

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      If you did not expect this invite, decline and contact support.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Box sx={{ opacity: 0.92 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group.</Typography>
              </Box>
            </Stack>
          </motion.div>
        </Box>

        <Snackbar open={snack.open} autoHideDuration={3200} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
