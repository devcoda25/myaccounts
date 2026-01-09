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
import AuthHeader from "@/components/layout/AuthHeader";


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

import { ThemeMode, Severity, AuthState, OrgRole } from "@/types";
import {
  SunIcon,
  MoonIcon,
  GlobeIcon,
  BuildingIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  UserIcon
} from "@/components/icons";
import { api } from "../../utils/api";
import { useAuthStore } from "@/stores/authStore";


const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const THEME_KEY = "evzone_myaccounts_theme";

// ... theme helpers ...
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
  const s = nameOrEmail?.trim() || "EV";
  if (s.includes("@")) {
    const u = s.split("@")[0] || "user";
    return (u.slice(0, 2) || "EV").toUpperCase();
  }
  const parts = s.split(/\s+/);
  const a = parts[0]?.[0] || "E";
  const b = parts[1]?.[0] || parts[0]?.[1] || "V";
  return (a + b).toUpperCase();
}

function readParam(key: string) {
  try {
    const qs = new URLSearchParams(window.location.search);
    return qs.get(key) || null;
  } catch {
    return null;
  }
}

interface InviteDetails {
  email: string;
  role: string;
  orgName: string;
  orgId: string;
  status: string;
  expiresAt: string;
  isValid: boolean;
}

export default function AcceptOrgInvitePage() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const isAuthenticated = !!user;
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const token = readParam("token");
  const [details, setDetails] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  const currentUserEmail = user?.email;
  const isCorrectUser = isAuthenticated && currentUserEmail === details?.email;

  useEffect(() => {
    if (!token) {
      setError("Invalid invite link: No token provided.");
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await api.get<InviteDetails>(`/orgs/public/invites/${token}`);
        setDetails(res);
      } catch (err) {
        setError("Failed to load invite details. It may be invalid or expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [token]);

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

  const accept = async () => {
    const returnTo = `/org-invite/accept?token=${encodeURIComponent(token || '')}`;

    if (!isAuthenticated) {
      navigate(`/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    // Optional: Warn if emails don't match, but allow proceeding if they want to accept with CURRENT account?
    // Usually we block, but let's just warn for now or auto-switch logic?
    // If strict: if (!isCorrectUser) ...

    try {
      await api.post('/orgs/invites/accept', { token });
      setSnack({ open: true, severity: "success", msg: "Invite accepted! Redirecting..." });
      setTimeout(() => {
        navigate(`/app/orgs/${details?.orgId}`);
      }, 1500);
    } catch (e) {
      setSnack({ open: true, severity: "error", msg: "Failed to accept invite." });
    }
  };

  const decline = async () => {
    try {
      await api.post('/orgs/invites/decline', { token });
      setSnack({ open: true, severity: "info", msg: "Invite declined." });
      setDetails(prev => prev ? ({ ...prev, isValid: false, status: 'Declined' }) : null);
    } catch (e) {
      setSnack({ open: true, severity: "error", msg: "Failed to decline invite." });
    }
  };

  const showAccountChooser = () => {
    const returnTo = `/org-invite/accept?token=${encodeURIComponent(token || '')}`;
    navigate(`/auth/choose-account?continue=${encodeURIComponent(returnTo)}`);
  };

  const showSignIn = () => {
    const returnTo = `/org-invite/accept?token=${encodeURIComponent(token || '')}`;
    navigate(`/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const showSignUp = () => {
    const returnTo = `/org-invite/accept?token=${encodeURIComponent(token || '')}`;
    // Pre-fill email if possible? URL param?
    navigate(`/auth/sign-up?returnTo=${encodeURIComponent(returnTo)}&email=${encodeURIComponent(details?.email || '')}`);
  };


  const renderContent = () => {
    if (loading || isAuthLoading) {
      return (
        <Card><CardContent className="p-8"><Typography>Loading invite details...</Typography></CardContent></Card>
      );
    }

    if (error || !details) {
      return (
        <Card>
          <CardContent className="p-8">
            <Alert severity="error">{error || "Invite not found"}</Alert>
            <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/app')}>Go Home</Button>
          </CardContent>
        </Card>
      );
    }

    if (!details.isValid) {
      return (
        <Card>
          <CardContent className="p-8">
            <Alert severity="warning">This invite is no longer valid or has expired.</Alert>
            <Typography sx={{ mt: 2 }}>Status: <b>{details.status}</b></Typography>
            <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/app')}>Go Home</Button>
          </CardContent>
        </Card>
      );
    }

    const isLoggedInSameUser = isAuthenticated && currentUserEmail === details.email;
    const isLoggedInDifferentUser = isAuthenticated && currentUserEmail !== details.email;

    return (
      <Card>
        <CardContent className="p-6 md:p-8">
          <Stack spacing={2.0}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar sx={{ width: 56, height: 56, borderRadius: 18, bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary, fontWeight: 950 }}>
                  {initials(details.orgName)}
                </Avatar>
                <Box>
                  <Typography variant="h5">You have been invited</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Join <b>{details.orgName}</b> on EVzone.
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip icon={<BuildingIcon size={16} />} label={details.orgName} variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                <Chip label={`Role: ${details.role}`} color={details.role === "Admin" || details.role === "Owner" ? "info" : "default"} />
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
                  Invited email: <b>{details.email}</b>
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Token: <b>{token}</b>
                </Typography>
              </Stack>
            </Box>

            {!isAuthenticated && (
              <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                You need to sign in or create an account to accept this invite.
              </Alert>
            )}

            {isLoggedInDifferentUser && (
              <Alert severity="warning" icon={<ShieldCheckIcon size={18} />}>
                You are signed in as <b>{currentUserEmail}</b>. This invite is for <b>{details.email}</b>.
                Accepting will link this organization to your current account.
              </Alert>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} flexWrap="wrap" useFlexGap>
              {!isAuthenticated ? (
                <>
                  <Button variant="contained" sx={orangeContained} onClick={async () => {
                    // Smart Redirection
                    try {
                      const { exists } = await api.post<{ exists: boolean }>('/auth/exists', { email: details.email });
                      const returnTo = `/org-invite/accept?token=${encodeURIComponent(token || '')}`;

                      if (exists) {
                        // Redirect to Sign In
                        navigate(`/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}&email=${encodeURIComponent(details.email)}`);
                      } else {
                        // Redirect to Sign Up
                        navigate(`/auth/sign-up?returnTo=${encodeURIComponent(returnTo)}&email=${encodeURIComponent(details.email)}`);
                      }
                    } catch (e) {
                      // Fallback to manual choice if check fails
                      showSignIn();
                    }
                  }}>
                    Accept Invite
                  </Button>
                </>
              ) : (
                <>
                  {isLoggedInDifferentUser && (
                    <Button variant="outlined" sx={orangeOutlined} onClick={showAccountChooser}>
                      Switch Account
                    </Button>
                  )}
                  <Button variant="contained" color="secondary" sx={orangeContained} endIcon={<ArrowRightIcon size={18} />} onClick={accept}>
                    Accept Invite
                  </Button>
                </>
              )}

              <Button variant="outlined" color="error" onClick={decline} sx={{ borderColor: alpha(theme.palette.error.main, 0.5), color: theme.palette.error.main, "&:hover": { borderColor: theme.palette.error.main, backgroundColor: alpha(theme.palette.error.main, 0.1) } }}>
                Decline
              </Button>
            </Stack>

            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              If you did not expect this invite, decline and contact support.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  };

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
            {renderContent()}
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
