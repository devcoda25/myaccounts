import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  CssBaseline,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  HelpCircle,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts — Continue to App (v4)
 * Route: /auth/continue
 * Style Rules (requested):
 *  - Background: GREEN ONLY
 *  - Buttons: ORANGE ONLY
 *  - Orange filled buttons: WHITE text
 *  - Orange outline buttons: on hover → SOLID orange with WHITE text
 */

type ThemeMode = "light" | "dark";

type ScopeKey = "openid" | "profile" | "email" | "wallet" | string;

type ScopeItem = {
  key: ScopeKey;
  title: string;
  summary: string;
  details: string[];
  icon: "profile" | "email" | "wallet" | "secure";
  impact?: "low" | "medium";
};

type ClientContext = {
  name: string;
  logoMark: string;
  brandHint?: string;
  redirectUri: string;
  scopes: ScopeItem[];
};

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
  grey: "#a6a6a6",
  greyLight: "#f2f2f2",
} as const;

function getStoredMode(): ThemeMode {
  try {
    const v = window.localStorage.getItem("evzone_myaccounts_theme");
    return (v === "light" || v === "dark") ? (v as ThemeMode) : "light";
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
      fontFamily:
        "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
      h4: { fontWeight: 920, letterSpacing: -0.6 },
      h6: { fontWeight: 880, letterSpacing: -0.25 },
      subtitle1: { fontWeight: 740 },
      button: { fontWeight: 880, textTransform: "none" },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            paddingTop: 10,
            paddingBottom: 10,
            boxShadow: "none",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            border: `1px solid ${isDark ? alpha("#E9FFF7", 0.10) : alpha("#0B1A17", 0.10)}`,
            // GREEN-only glow
            backgroundImage:
              "radial-gradient(900px 420px at 12% 0%, rgba(3,205,140,0.14), transparent 60%), radial-gradient(900px 420px at 88% 0%, rgba(3,205,140,0.10), transparent 55%)",
          },
        },
      },
    },
  });
}

function ScopeIcon({ kind }: { kind: ScopeItem["icon"] }) {
  if (kind === "wallet") return <Wallet size={16} />;
  if (kind === "email") return <Mail size={16} />;
  if (kind === "profile") return <UserRound size={16} />;
  return <ShieldCheck size={16} />;
}

function parseScopes(raw: string | null): string[] {
  if (!raw) return ["openid", "profile", "email", "wallet"];
  return raw
    .split(/[ ,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function safeHost(url: string) {
  try {
    const u = new URL(url);
    return u.host;
  } catch {
    return "";
  }
}

function buildScopeCatalog(keys: string[]): ScopeItem[] {
  const has = (k: string) => keys.includes(k);

  const items: ScopeItem[] = [];

  if (has("openid")) {
    items.push({
      key: "openid",
      title: "Sign you in",
      summary: "Confirm your identity so you can access this EVzone app.",
      details: [
        "A secure ID token is issued for this app.",
        "Your password is never shared with the app.",
        "You can sign out anytime from My Accounts.",
      ],
      icon: "secure",
      impact: "low",
    });
  }

  if (has("profile")) {
    items.push({
      key: "profile",
      title: "Basic profile",
      summary: "Share your name and avatar to personalize your experience.",
      details: [
        "Name and profile photo (if available).",
        "Preferred language and region (if set).",
        "Profile can be updated in My Accounts.",
      ],
      icon: "profile",
      impact: "low",
    });
  }

  if (has("email")) {
    items.push({
      key: "email",
      title: "Email access",
      summary: "Used for receipts, security alerts, and account recovery.",
      details: [
        "Email address and verification status.",
        "No access to your inbox messages.",
        "You can change your email later in My Accounts.",
      ],
      icon: "email",
      impact: "low",
    });
  }

  if (has("wallet")) {
    items.push({
      key: "wallet",
      title: "EVzone Wallet",
      summary: "Allow this app to use your wallet for faster payments.",
      details: [
        "The app can request wallet payments you approve.",
        "Sensitive actions may require re-authentication.",
        "You can review and revoke access anytime.",
      ],
      icon: "wallet",
      impact: "medium",
    });
  }

  keys
    .filter((k) => !["openid", "profile", "email", "wallet"].includes(k))
    .forEach((k) =>
      items.push({
        key: k,
        title: `Additional permission: ${k}`,
        summary: "This app requested an additional permission.",
        details: ["Permission details are provided by the app owner.", "You can revoke app access in My Accounts."],
        icon: "secure",
        impact: "medium",
      })
    );

  return items;
}

export default function ContinueToAppV4() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>(
    { open: false, severity: "info", msg: "" }
  );

  const [ctx] = useState<ClientContext>(() => {
    const qs = new URLSearchParams(window.location.search);
    const name = qs.get("app") || "EVzone Marketplace";
    const logoMark = (qs.get("mark") || "E").slice(0, 2).toUpperCase();
    const redirectUri = qs.get("redirect_uri") || "https://evzonemarketplace.com/auth/callback";
    const scopeKeys = parseScopes(qs.get("scopes"));

    return {
      name,
      logoMark,
      brandHint: qs.get("brand") || "First-party EVzone app",
      redirectUri,
      scopes: buildScopeCatalog(scopeKeys),
    };
  });

  const redirectHost = safeHost(ctx.redirectUri);

  useEffect(() => {
    if (!ctx.name || !ctx.redirectUri) {
      setSnack({ open: true, severity: "warning", msg: "Missing app context. This request may be invalid." });
    }
  }, [ctx.name, ctx.redirectUri]);

  const toggleMode = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    setStoredMode(next);
  };

  const onCancel = () => {
    navigate("/app");
  };

  const onContinue = () => {
    setSnack({ open: true, severity: "success", msg: `Continuing to ${ctx.name}…` });
    setTimeout(() => {
      window.location.href = ctx.redirectUri;
    }, 800);
  };

  // GREEN-only page background
  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 6%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 10%, rgba(3,205,140,0.16), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.18), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.12), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  // ORANGE-only buttons
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
    "&:hover": {
      borderColor: EVZONE.orange,
      backgroundColor: EVZONE.orange,
      color: "#FFFFFF",
    },
  } as const;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box className="min-h-screen" sx={{ background: pageBg }}>
        {/* Top Bar */}
        <Box className="w-full" sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box className="mx-auto max-w-5xl px-4 py-3 md:px-6">
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1.2}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    background:
                      "linear-gradient(135deg, rgba(3,205,140,1) 0%, rgba(3,205,140,0.82) 55%, rgba(3,205,140,0.62) 100%)",
                    boxShadow: `0 14px 40px ${alpha(isDark ? "#000" : "#0B1A17", 0.22)}`,
                  }}
                >
                  <Typography sx={{ color: "white", fontWeight: 900, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ lineHeight: 1.1 }}>
                    EVzone My Accounts
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Review requested access before continuing
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                  <IconButton
                    onClick={toggleMode}
                    size="small"
                    sx={{
                      border: `1px solid ${alpha(EVZONE.orange, 0.35)}`,
                      borderRadius: 12,
                      backgroundColor: alpha(theme.palette.background.paper, 0.6),
                      color: EVZONE.orange,
                    }}
                  >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Language">
                  <IconButton
                    size="small"
                    sx={{
                      border: `1px solid ${alpha(EVZONE.orange, 0.35)}`,
                      borderRadius: 12,
                      backgroundColor: alpha(theme.palette.background.paper, 0.6),
                      color: EVZONE.orange,
                    }}
                  >
                    <Globe size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Help">
                  <IconButton
                    size="small"
                    sx={{
                      border: `1px solid ${alpha(EVZONE.orange, 0.35)}`,
                      borderRadius: 12,
                      backgroundColor: alpha(theme.palette.background.paper, 0.6),
                      color: EVZONE.orange,
                    }}
                  >
                    <HelpCircle size={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Content */}
        <Box className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
          <Stack spacing={3}>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={2.2}>
                    {/* App Header */}
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      alignItems={{ xs: "flex-start", md: "center" }}
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={1.4} alignItems="center">
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 20,
                            display: "grid",
                            placeItems: "center",
                            background: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12),
                            border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                          }}
                        >
                          <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: -0.8 }}>
                            {ctx.logoMark}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ lineHeight: 1.15 }}>
                            {ctx.name} is requesting sign-in
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {ctx.brandHint} • Redirect destination: <b>{redirectHost || "unknown"}</b>
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          icon={<Lock size={16} />}
                          label="Secure redirect"
                          variant="outlined"
                          sx={{
                            borderColor: alpha(EVZONE.green, 0.35),
                            backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.12 : 0.08),
                            color: theme.palette.text.primary,
                            fontWeight: 820,
                          }}
                        />
                        <Chip
                          icon={<BadgeCheck size={16} />}
                          label="PKCE Protected"
                          variant="outlined"
                          sx={{
                            borderColor: alpha(EVZONE.green, 0.35),
                            backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.10 : 0.06),
                            color: theme.palette.text.primary,
                            fontWeight: 820,
                          }}
                        />
                      </Stack>
                    </Stack>

                    <Divider />

                    {/* Summary */}
                    <Stack spacing={1}>
                      <Typography variant="subtitle1">What this app will be allowed to do</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        EVzone apps use secure tokens. Your password is never shared. You can review and revoke access anytime in
                        My Accounts.
                      </Typography>
                    </Stack>

                    {/* Scope Summary */}
                    <Box
                      sx={{
                        borderRadius: 20,
                        border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                        backgroundColor: alpha(theme.palette.background.paper, 0.55),
                        p: 1.8,
                      }}
                    >
                      <Stack spacing={1.2}>
                        {ctx.scopes.slice(0, 3).map((s) => {
                          const iconBg = alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10);
                          return (
                            <Stack
                              key={s.key}
                              direction="row"
                              spacing={1.2}
                              alignItems="flex-start"
                              sx={{
                                p: 1.2,
                                borderRadius: 16,
                                border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                                backgroundColor: alpha(theme.palette.background.paper, 0.40),
                              }}
                            >
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 14,
                                  display: "grid",
                                  placeItems: "center",
                                  backgroundColor: iconBg,
                                  border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                                  flex: "0 0 auto",
                                }}
                              >
                                <ScopeIcon kind={s.icon} />
                              </Box>
                              <Box flex={1}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                  <Typography sx={{ fontWeight: 900 }}>{s.title}</Typography>
                                  <Chip
                                    size="small"
                                    label={s.impact === "medium" ? "Medium impact" : "Low impact"}
                                    sx={{
                                      height: 22,
                                      fontWeight: 820,
                                      borderRadius: 99,
                                      backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.14 : 0.10),
                                      color: theme.palette.text.primary,
                                    }}
                                  />
                                </Stack>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  {s.summary}
                                </Typography>
                              </Box>
                            </Stack>
                          );
                        })}

                        {ctx.scopes.length > 3 ? (
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            +{ctx.scopes.length - 3} more permission(s). Use “Show details” to review.
                          </Typography>
                        ) : null}

                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setDetailsOpen((v) => !v)}
                          endIcon={detailsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          sx={{ color: EVZONE.orange, fontWeight: 900, px: 0, alignSelf: "flex-start" }}
                        >
                          {detailsOpen ? "Hide details" : "Show details"}
                        </Button>

                        <Collapse in={detailsOpen} unmountOnExit>
                          <Box
                            sx={{
                              mt: 1,
                              borderRadius: 18,
                              border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                              backgroundColor: alpha(theme.palette.background.paper, 0.35),
                              p: 1.6,
                            }}
                          >
                            <Stack spacing={1.2}>
                              {ctx.scopes.map((s) => (
                                <Box key={s.key}>
                                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Box
                                        sx={{
                                          width: 30,
                                          height: 30,
                                          borderRadius: 12,
                                          display: "grid",
                                          placeItems: "center",
                                          backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.14 : 0.10),
                                          border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                                        }}
                                      >
                                        <ScopeIcon kind={s.icon} />
                                      </Box>
                                      <Typography sx={{ fontWeight: 900 }}>{s.title}</Typography>
                                    </Stack>
                                    <Chip
                                      size="small"
                                      label={s.key}
                                      sx={{
                                        height: 22,
                                        fontWeight: 820,
                                        borderRadius: 99,
                                        backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.14 : 0.10),
                                        color: theme.palette.text.primary,
                                      }}
                                    />
                                  </Stack>
                                  <Stack spacing={0.5} sx={{ mt: 0.9, pl: 0.4 }}>
                                    {s.details.map((d, i) => (
                                      <Typography key={i} variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                        • {d}
                                      </Typography>
                                    ))}
                                  </Stack>
                                  <Divider sx={{ my: 1.2 }} />
                                </Box>
                              ))}

                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1.2}
                                alignItems={{ xs: "stretch", sm: "center" }}
                                justifyContent="space-between"
                              >
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                  You can manage app access later in <b>My Accounts → Apps & Permissions</b>.
                                </Typography>
                                <Button size="small" variant="outlined" endIcon={<ExternalLink size={16} />} sx={orangeOutlinedSx} onClick={() => navigate("/app/security")}>
                                  Manage permissions
                                </Button>
                              </Stack>
                            </Stack>
                          </Box>
                        </Collapse>
                      </Stack>
                    </Box>

                    {/* Action bar */}
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.2}
                      alignItems={{ xs: "stretch", sm: "center" }}
                      justifyContent="space-between"
                    >
                      <Button
                        variant="text"
                        startIcon={<ArrowLeft size={18} />}
                        sx={{ color: EVZONE.orange, fontWeight: 860, alignSelf: { xs: "stretch", sm: "flex-start" } }}
                        onClick={onCancel}
                      >
                        Cancel
                      </Button>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", sm: "auto" } }}>
                        <Button fullWidth variant="outlined" onClick={() => navigate("/auth/choose-account")} sx={orangeOutlinedSx}>
                          Switch account
                        </Button>
                        <Button fullWidth variant="contained" color="secondary" endIcon={<ArrowRight size={18} />} onClick={onContinue} sx={orangeContainedSx}>
                          Continue
                        </Button>
                      </Stack>
                    </Stack>

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      By continuing, you agree to EVzone Terms and acknowledge the Privacy Policy.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Footer */}
            <Box className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between" sx={{ opacity: 0.92 }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                © {new Date().getFullYear()} EVzone Group. Secure sign-in across EVzone platforms.
              </Typography>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Button size="small" variant="text" sx={{ color: EVZONE.orange, fontWeight: 820 }} onClick={() => window.open("/legal/terms", "_blank")}>
                  Terms
                </Button>
                <Button size="small" variant="text" sx={{ color: EVZONE.orange, fontWeight: 820 }} onClick={() => window.open("/legal/privacy", "_blank")}>
                  Privacy
                </Button>
                <Button size="small" variant="text" sx={{ color: EVZONE.orange, fontWeight: 820 }} onClick={() => navigate("/auth/account-recovery-help")}>
                  Help
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Snackbar
          open={snack.open}
          autoHideDuration={3400}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            severity={snack.severity}
            variant={mode === "dark" ? "filled" : "standard"}
            sx={{
              borderRadius: 16,
              border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
              backgroundColor:
                mode === "dark" ? alpha(theme.palette.background.paper, 0.92) : alpha(theme.palette.background.paper, 0.96),
              color: theme.palette.text.primary,
            }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
