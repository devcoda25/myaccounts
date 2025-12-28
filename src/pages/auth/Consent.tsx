import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Collapse,
  CssBaseline,
  Divider,
  FormControlLabel,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Consent Screen
 * Route: /auth/consent
 * Purpose: When a client requests scopes that need user approval.
 *
 * Features:
 * - "{AppName} wants to access…"
 * - Scope list with friendly descriptions
 * - Allow / Deny actions
 * - Remember this decision
 *
 * Style rules:
 * - Background: green-only
 * - EVzone actions: orange-only buttons with white text
 */

type ThemeMode = "light" | "dark";

type ScopeItem = {
  key: string;
  title: string;
  desc: string;
  impact: "low" | "medium";
  icon: "secure" | "profile" | "email" | "wallet" | "other";
};

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

// -----------------------------
// Inline icons (CDN-safe)
// -----------------------------
function IconBase({ size = 18, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      {children}
    </svg>
  );
}

function SunIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 20v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 12h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function MoonIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M21 13a8 8 0 0 1-10-10 7.5 7.5 0 1 0 10 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}

function GlobeIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function HelpCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.2 2.4c-.9.3-1.2.8-1.2 1.6v.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}

function ChevronDownIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function ShieldCheckIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function UserIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 22a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function MailIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M4 8l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}

function WalletIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 11h4v6h-4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 7V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function KeyIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="8" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M11 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 12v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 12v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function ScopeIcon({ kind }: { kind: ScopeItem["icon"] }) {
  if (kind === "profile") return <UserIcon size={18} />;
  if (kind === "email") return <MailIcon size={18} />;
  if (kind === "wallet") return <WalletIcon size={18} />;
  if (kind === "secure") return <ShieldCheckIcon size={18} />;
  return <KeyIcon size={18} />;
}

// -----------------------------
// Theme
// -----------------------------
function getStoredMode(): ThemeMode {
  try {
    const v = window.localStorage.getItem("evzone_myaccounts_theme");
    return v === "light" || v === "dark" ? (v as ThemeMode) : "light";
  } catch {
    return "light";
  }
}

function setStoredMode(mode: ThemeMode) {
  try {
    window.localStorage.setItem("evzone_myaccounts_theme", mode);
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
      h6: { fontWeight: 900, letterSpacing: -0.28 },
      subtitle1: { fontWeight: 760 },
      button: { fontWeight: 900, textTransform: "none" },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            border: `1px solid ${isDark ? alpha("#E9FFF7", 0.10) : alpha("#0B1A17", 0.10)}`,
            backgroundImage: "radial-gradient(900px 420px at 12% 0%, rgba(3,205,140,0.14), transparent 60%), radial-gradient(900px 420px at 88% 0%, rgba(3,205,140,0.10), transparent 55%)",
          },
        },
      },
      MuiButton: {
        styleOverrides: { root: { borderRadius: 14, paddingTop: 10, paddingBottom: 10, boxShadow: "none" } },
      },
    },
  });
}

function safeHost(url: string) {
  try {
    const u = new URL(url);
    return u.host;
  } catch {
    return "";
  }
}

function parseScopes(raw: string): string[] {
  return raw
    .split(/[ ,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildScopeItems(keys: string[]): ScopeItem[] {
  const map: Record<string, Omit<ScopeItem, "key">> = {
    openid: {
      title: "Sign you in",
      desc: "Confirm your identity so you can use this app. Your password is never shared.",
      impact: "low",
      icon: "secure",
    },
    profile: {
      title: "Basic profile",
      desc: "Share your name and avatar to personalize your experience.",
      impact: "low",
      icon: "profile",
    },
    email: {
      title: "Email address",
      desc: "Used for receipts, security alerts, and account recovery.",
      impact: "low",
      icon: "email",
    },
    phone: {
      title: "Phone number",
      desc: "Used for security verification and account recovery.",
      impact: "medium",
      icon: "other",
    },
    wallet: {
      title: "EVzone Wallet",
      desc: "Allow this app to initiate wallet actions you approve (payments, deposits).",
      impact: "medium",
      icon: "wallet",
    },
  };

  return keys.map((k) => {
    const base = map[k] || {
      title: `Permission: ${k}`,
      desc: "This app requested an additional permission. You can revoke access later.",
      impact: "medium",
      icon: "other" as const,
    };
    return { key: k, ...base };
  });
}

export default function ConsentScreenPage() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const qs = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const appName = qs.get("app") || "EVzone Marketplace";
  const mark = (qs.get("mark") || appName.slice(0, 1) || "E").slice(0, 2).toUpperCase();
  const redirectUri = qs.get("redirect_uri") || "https://example.com/callback";
  const clientId = qs.get("client_id") || "client_demo";
  const rawScopes = qs.get("scopes") || "openid profile email wallet";

  const scopeKeys = useMemo(() => parseScopes(rawScopes), [rawScopes]);
  const scopes = useMemo(() => buildScopeItems(scopeKeys), [scopeKeys]);

  const [remember, setRemember] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>({
    open: false,
    severity: "info",
    msg: "",
  });

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 6%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 10%, rgba(3,205,140,0.16), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.18), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.12), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeContainedSx = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.20)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
  } as const;

  const orangeOutlinedSx = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.35),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const orangeTextSx = {
    color: EVZONE.orange,
    fontWeight: 900,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, mode === "dark" ? 0.14 : 0.10) },
  } as const;

  const toggleMode = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    setStoredMode(next);
  };

  const onAllow = () => {
    if (remember) {
      try {
        window.localStorage.setItem(`evzone_consent_${clientId}_${scopeKeys.join("_")}`, "allow");
      } catch {
        // ignore
      }
    }
    setSnack({ open: true, severity: "success", msg: `Allowed. Returning to ${safeHost(redirectUri) || "the app"} (demo).` });
  };

  const onDeny = () => {
    if (remember) {
      try {
        window.localStorage.setItem(`evzone_consent_${clientId}_${scopeKeys.join("_")}`, "deny");
      } catch {
        // ignore
      }
    }
    setSnack({ open: true, severity: "info", msg: "Denied. Returning to the app (demo)." });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box className="min-h-screen" sx={{ background: pageBg }}>
        {/* Top bar */}
        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box className="mx-auto max-w-5xl px-4 py-3 md:px-6">
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1.2}>
                <Box sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(135deg, rgba(3,205,140,1) 0%, rgba(3,205,140,0.82) 55%, rgba(3,205,140,0.62) 100%)",
                  boxShadow: `0 14px 40px ${alpha(isDark ? "#000" : "#0B1A17", 0.22)}`,
                }}>
                  <Typography sx={{ color: "white", fontWeight: 900, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ lineHeight: 1.1 }}>EVzone My Accounts</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Consent required</Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                  <IconButton onClick={toggleMode} size="small" sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.35)}`, borderRadius: 12, backgroundColor: alpha(theme.palette.background.paper, 0.6), color: EVZONE.orange }}>
                    {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Language">
                  <IconButton size="small" sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.35)}`, borderRadius: 12, backgroundColor: alpha(theme.palette.background.paper, 0.6), color: EVZONE.orange }}>
                    <GlobeIcon size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Help">
                  <IconButton size="small" onClick={() => setSnack({ open: true, severity: "info", msg: "Help Center (demo)." })} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.35)}`, borderRadius: 12, backgroundColor: alpha(theme.palette.background.paper, 0.6), color: EVZONE.orange }}>
                    <HelpCircleIcon size={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Content */}
        <Box className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card>
              <CardContent className="p-5 md:p-7">
                <Stack spacing={2.0}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Stack direction="row" spacing={1.4} alignItems="center">
                      <Box sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 20,
                        display: "grid",
                        placeItems: "center",
                        backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12),
                        border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                      }}>
                        <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: -0.8 }}>{mark}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ lineHeight: 1.15 }}>
                          {appName} wants to access your account
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Review the permissions below. You can revoke access anytime in My Accounts.
                        </Typography>
                      </Box>
                    </Stack>

                    <Box sx={{
                      borderRadius: 16,
                      border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                      backgroundColor: alpha(theme.palette.background.paper, 0.45),
                      px: 1.5,
                      py: 1.2,
                      minWidth: { xs: "100%", md: 300 },
                    }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Redirect destination</Typography>
                      <Typography sx={{ fontWeight: 900 }}>{safeHost(redirectUri) || "unknown"}</Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Stack spacing={1.2}>
                    <Typography sx={{ fontWeight: 900 }}>Requested permissions</Typography>

                    <Stack spacing={1.1}>
                      {scopes.map((s) => (
                        <Box
                          key={s.key}
                          sx={{
                            borderRadius: 18,
                            border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                            backgroundColor: alpha(theme.palette.background.paper, 0.40),
                            p: 1.4,
                          }}
                        >
                          <Stack direction="row" spacing={1.2} alignItems="flex-start">
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 14,
                                display: "grid",
                                placeItems: "center",
                                backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10),
                                border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                                flex: "0 0 auto",
                              }}
                            >
                              <ScopeIcon kind={s.icon} />
                            </Box>
                            <Box flex={1}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                <Typography sx={{ fontWeight: 900 }}>{s.title}</Typography>
                                <Box
                                  sx={{
                                    px: 1,
                                    py: 0.3,
                                    borderRadius: 999,
                                    backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.14 : 0.10),
                                    border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                                  }}
                                >
                                  <Typography variant="caption" sx={{ fontWeight: 900, color: theme.palette.text.primary }}>
                                    {s.impact === "medium" ? "Medium impact" : "Low impact"}
                                  </Typography>
                                </Box>
                              </Stack>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.4 }}>
                                {s.desc}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.6, display: "block" }}>
                                Scope: <b>{s.key}</b>
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>

                    <Button
                      variant="text"
                      sx={{ ...orangeTextSx, alignSelf: "flex-start" }}
                      endIcon={<ChevronDownIcon size={18} />}
                      onClick={() => setDetailsOpen((v) => !v)}
                    >
                      {detailsOpen ? "Hide details" : "Show details"}
                    </Button>

                    <Collapse in={detailsOpen} unmountOnExit>
                      <Box sx={{
                        borderRadius: 18,
                        border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                        backgroundColor: alpha(theme.palette.background.paper, 0.35),
                        p: 1.4,
                      }}>
                        <Stack spacing={1}>
                          <Typography sx={{ fontWeight: 900 }}>What happens next</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            If you allow, this app receives a secure token with these permissions.
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Your password is never shared with the app.
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            You can revoke access later in <b>My Accounts → Apps & Permissions</b>.
                          </Typography>
                        </Stack>
                      </Box>
                    </Collapse>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                          sx={{ color: alpha(EVZONE.orange, 0.7), "&.Mui-checked": { color: EVZONE.orange } }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          Remember this decision for future requests
                        </Typography>
                      }
                    />

                    <Alert severity="info">
                      Tip: If you don’t trust this app, press Deny.
                    </Alert>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={onAllow}>
                        Allow
                      </Button>
                      <Button variant="outlined" sx={orangeOutlinedSx} onClick={onDeny}>
                        Deny
                      </Button>
                    </Stack>

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      By continuing, you agree to EVzone Terms and acknowledge the Privacy Policy.
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <Box className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between" sx={{ opacity: 0.92 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group.</Typography>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => setSnack({ open: true, severity: "info", msg: "Open Terms (demo)." })}>Terms</Button>
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => setSnack({ open: true, severity: "info", msg: "Open Privacy (demo)." })}>Privacy</Button>
            </Stack>
          </Box>
        </Box>

        <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.92) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
