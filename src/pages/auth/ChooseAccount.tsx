import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import {
  ArrowRight,
  ChevronRight,
  Globe,
  HelpCircle,
  LogIn,
  Moon,
  MoreVertical,
  ShieldCheck,
  Sun,
  Trash2,
  UserPlus,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts — Account Chooser (v4)
 * Route: /auth/choose-account
 * Style Rules (requested):
 *  - Background: GREEN ONLY
 *  - Buttons: ORANGE ONLY
 *  - Orange filled buttons: WHITE text
 *  - Orange outline buttons: on hover → SOLID orange with WHITE text
 */

type ThemeMode = "light" | "dark";

type OidcClientMeta = {
  name: string;
  subtitle: string;
  logoMark: string;
  requestedScopes: Array<{ key: string; label: string; icon?: "wallet" | "profile" | "email" }>;
};

type RecentAccount = {
  id: string;
  fullName: string;
  handle: string;
  lastUsedLabel?: string;
  badges?: Array<{ label: string; tone: "success" | "warning" | "info" }>;
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

  const bg = isDark ? "#07110F" : "#F4FFFB"; // green-tinted
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
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${isDark ? alpha("#E9FFF7", 0.10) : alpha("#0B1A17", 0.10)}`,
            backgroundColor: isDark ? alpha("#E9FFF7", 0.03) : alpha("#0B1A17", 0.03),
          },
        },
      },
    },
  });
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const first = parts[0]?.[0] ?? "?";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function ScopeIcon({ kind }: { kind?: "wallet" | "profile" | "email" }) {
  if (kind === "wallet") return <Wallet size={16} />;
  if (kind === "profile") return <ShieldCheck size={16} />;
  return <LogIn size={16} />;
}

function readClientFromQuery(): OidcClientMeta {
  const qs = new URLSearchParams(window.location.search);
  const name = qs.get("app") || "EVzone Marketplace";
  const mark = (qs.get("mark") || "E").slice(0, 2).toUpperCase();

  const scopes = (qs.get("scopes") || "openid profile email wallet")
    .split(/[ ,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const scopeCatalog: Record<string, { label: string; icon?: "wallet" | "profile" | "email" }> = {
    openid: { label: "Sign you in (basic identity)", icon: "profile" },
    profile: { label: "View your profile (name, avatar)", icon: "profile" },
    email: { label: "Access your email (for receipts & security)", icon: "email" },
    wallet: { label: "Use your EVzone Wallet for payments", icon: "wallet" },
  };

  const requestedScopes = scopes.map((k) => ({
    key: k,
    label: scopeCatalog[k]?.label || `Permission: ${k}`,
    icon: scopeCatalog[k]?.icon,
  }));

  return {
    name,
    subtitle: "Choose an account to continue securely.",
    logoMark: mark,
    requestedScopes,
  };
}

export default function AccountChooserV4() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [client] = useState<OidcClientMeta>(() => readClientFromQuery());

  const [accounts, setAccounts] = useState<RecentAccount[]>([
    {
      id: "u1",
      fullName: "Ronald Isabirye",
      handle: "ronald@evzone.com",
      lastUsedLabel: "Last used today",
      badges: [
        { label: "2FA Enabled", tone: "success" },
        { label: "Wallet Ready", tone: "info" },
      ],
    },
    {
      id: "u2",
      fullName: "Susan Birungi",
      handle: "+256 761 677 709",
      lastUsedLabel: "Last used 3 days ago",
      badges: [{ label: "Email Verified", tone: "success" }],
    },
    {
      id: "u3",
      fullName: "EV World Ops",
      handle: "ops@evworld.ug",
      lastUsedLabel: "Last used 2 weeks ago",
      badges: [{ label: "Org Admin", tone: "warning" }],
    },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>(accounts[0]?.id ?? null);
  const selected = useMemo(() => accounts.find((a) => a.id === selectedId) ?? null, [accounts, selectedId]);

  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>(
    { open: false, severity: "info", msg: "" }
  );

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuAccountId, setMenuAccountId] = useState<string | null>(null);

  const [removeDialog, setRemoveDialog] = useState<{ open: boolean; account: RecentAccount | null }>({
    open: false,
    account: null,
  });

  useEffect(() => {
    if (accounts.length === 0) {
      const t = window.setTimeout(() => {
        setSnack({ open: true, severity: "info", msg: "No active sessions. Redirecting to Sign In… (demo)" });
      }, 450);
      return () => window.clearTimeout(t);
    }
  }, [accounts.length]);

  const toggleMode = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    setStoredMode(next);
  };

  const closeAccountMenu = () => {
    setMenuAnchor(null);
    setMenuAccountId(null);
  };

  const requestRemove = () => {
    const acct = accounts.find((a) => a.id === menuAccountId) ?? null;
    closeAccountMenu();
    if (!acct) return;
    setRemoveDialog({ open: true, account: acct });
  };

  const confirmRemove = () => {
    const acct = removeDialog.account;
    if (!acct) {
      setRemoveDialog({ open: false, account: null });
      return;
    }

    setAccounts((prev) => prev.filter((x) => x.id !== acct.id));
    setSnack({ open: true, severity: "success", msg: `Removed ${acct.fullName} from this device.` });

    setRemoveDialog({ open: false, account: null });

    setTimeout(() => {
      setSelectedId((curr) => {
        const remaining = accounts.filter((x) => x.id !== acct.id);
        if (remaining.length === 0) return null;
        if (curr === acct.id) return remaining[0].id;
        return curr;
      });
    }, 0);
  };

  const handleContinue = () => {
    if (!selected) {
      setSnack({ open: true, severity: "warning", msg: "Please select an account to continue." });
      return;
    }
    setSnack({ open: true, severity: "success", msg: `Continuing to ${client.name} as ${selected.fullName}…` });
  };

  const handleUseAnother = () => {
    setSnack({ open: true, severity: "info", msg: "Use another account → Redirect to Sign In (demo)." });
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
                    One secure login for all EVzone platforms
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
                  <Stack spacing={2.0}>
                    {/* App Header */}
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }}>
                      <Stack direction="row" spacing={1.4} alignItems="center" flex={1}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 18,
                            display: "grid",
                            placeItems: "center",
                            background: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12),
                            border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                          }}
                        >
                          <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: -0.6 }}>
                            {client.logoMark}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ lineHeight: 1.15 }}>
                            Continue to {client.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {client.subtitle}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          icon={<ShieldCheck size={16} />}
                          label="SSO Ready"
                          variant="outlined"
                          sx={{
                            borderColor: alpha(EVZONE.green, 0.35),
                            backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.12 : 0.08),
                            color: theme.palette.text.primary,
                            fontWeight: 820,
                          }}
                        />
                        <Chip
                          icon={<Wallet size={16} />}
                          label="Wallet"
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

                    <Stack spacing={1.0}>
                      <Typography variant="subtitle1">Choose an account</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Select a recent account on this device. Or sign in with another account.
                      </Typography>
                    </Stack>

                    {/* Accounts */}
                    <Box>
                      {accounts.length === 0 ? (
                        <Box
                          sx={{
                            borderRadius: 20,
                            border: `1px dashed ${alpha(theme.palette.text.primary, 0.25)}`,
                            backgroundColor: alpha(theme.palette.background.paper, 0.6),
                            p: 3,
                          }}
                        >
                          <Stack spacing={1.3}>
                            <Typography variant="h6">No active sessions found</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              This device has no saved EVzone sessions. Sign in to continue.
                            </Typography>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ pt: 1 }}>
                              <Button
                                fullWidth
                                variant="contained"
                                color="secondary"
                                startIcon={<LogIn size={18} />}
                                onClick={handleUseAnother}
                                sx={orangeContainedSx}
                              >
                                Sign In
                              </Button>
                              <Button
                                fullWidth
                                variant="outlined"
                                sx={orangeOutlinedSx}
                                onClick={() => setSnack({ open: true, severity: "info", msg: "Create account (demo)" })}
                              >
                                Create Account
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      ) : (
                        <List disablePadding sx={{ display: "grid", gap: 1.2 }}>
                          {accounts.map((acct, idx) => {
                            const isSelected = acct.id === selectedId;
                            return (
                              <ListItem key={acct.id} disablePadding>
                                <ListItemButton
                                  onClick={() => setSelectedId(acct.id)}
                                  sx={{
                                    p: 1.3,
                                    borderColor: isSelected
                                      ? alpha(EVZONE.green, mode === "dark" ? 0.55 : 0.40)
                                      : undefined,
                                    backgroundColor: isSelected
                                      ? alpha(EVZONE.green, mode === "dark" ? 0.14 : 0.10)
                                      : undefined,
                                    boxShadow: isSelected
                                      ? `0 18px 44px ${alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12)}`
                                      : "none",
                                    transform: isSelected ? "translateY(-1px)" : "translateY(0)",
                                    transition: "all 180ms ease",
                                  }}
                                >
                                  <ListItemAvatar sx={{ minWidth: 50 }}>
                                    <Badge
                                      overlap="circular"
                                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                      badgeContent={
                                        <Box
                                          sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: 99,
                                            backgroundColor: idx === 0 ? EVZONE.green : alpha(theme.palette.text.primary, 0.30),
                                            border: `2px solid ${theme.palette.background.paper}`,
                                          }}
                                        />
                                      }
                                    >
                                      <Avatar
                                        sx={{
                                          width: 42,
                                          height: 42,
                                          fontWeight: 900,
                                          bgcolor: alpha(EVZONE.green, 0.55),
                                          color: "white",
                                        }}
                                      >
                                        {initials(acct.fullName)}
                                      </Avatar>
                                    </Badge>
                                  </ListItemAvatar>

                                  <ListItemText
                                    primary={
                                      <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography sx={{ fontWeight: 900 }}>{acct.fullName}</Typography>
                                        {acct.lastUsedLabel ? (
                                          <Chip
                                            size="small"
                                            label={acct.lastUsedLabel}
                                            sx={{
                                              height: 22,
                                              fontWeight: 780,
                                              borderRadius: 99,
                                              backgroundColor: alpha(theme.palette.text.primary, mode === "dark" ? 0.10 : 0.06),
                                              color: theme.palette.text.secondary,
                                            }}
                                          />
                                        ) : null}
                                      </Stack>
                                    }
                                    secondary={
                                      <Stack spacing={0.6}>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                          {acct.handle}
                                        </Typography>
                                        {acct.badges?.length ? (
                                          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                                            {acct.badges.map((b, i) => (
                                              <Chip
                                                key={i}
                                                size="small"
                                                label={b.label}
                                                sx={{
                                                  height: 22,
                                                  fontWeight: 820,
                                                  borderRadius: 99,
                                                  backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10),
                                                  color: theme.palette.text.primary,
                                                }}
                                              />
                                            ))}
                                          </Stack>
                                        ) : null}
                                      </Stack>
                                    }
                                  />

                                  <Stack direction="row" alignItems="center" spacing={0.6}>
                                    <Tooltip title="More">
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setMenuAnchor(e.currentTarget);
                                          setMenuAccountId(acct.id);
                                        }}
                                        sx={{
                                          border: `1px solid ${alpha(EVZONE.orange, 0.35)}`,
                                          borderRadius: 12,
                                          backgroundColor: alpha(theme.palette.background.paper, 0.55),
                                          color: EVZONE.orange,
                                        }}
                                      >
                                        <MoreVertical size={18} />
                                      </IconButton>
                                    </Tooltip>
                                    <ChevronRight size={18} opacity={0.85} />
                                  </Stack>
                                </ListItemButton>
                              </ListItem>
                            );
                          })}
                        </List>
                      )}
                    </Box>

                    {/* Action area */}
                    {accounts.length > 0 ? (
                      <Stack spacing={1.2} sx={{ mt: 2.0 }}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                          <Button
                            fullWidth
                            variant="contained"
                            color="secondary"
                            endIcon={<ArrowRight size={18} />}
                            onClick={handleContinue}
                            sx={orangeContainedSx}
                          >
                            Continue
                          </Button>

                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleUseAnother}
                            startIcon={<UserPlus size={18} />}
                            sx={orangeOutlinedSx}
                          >
                            Use another account
                          </Button>
                        </Stack>

                        {/* Quick scope preview */}
                        <Box
                          sx={{
                            borderRadius: 18,
                            border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                            backgroundColor: alpha(theme.palette.background.paper, 0.5),
                            p: 1.6,
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 880, mb: 0.7 }}>
                            Requested access (preview)
                          </Typography>
                          <Stack spacing={1}>
                            {client.requestedScopes.slice(0, 3).map((s) => (
                              <Stack key={s.key} direction="row" alignItems="center" spacing={1.1}>
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 12,
                                    display: "grid",
                                    placeItems: "center",
                                    backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10),
                                    border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                                  }}
                                >
                                  <ScopeIcon kind={s.icon} />
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  {s.label}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>
                          <Box sx={{ mt: 1.2 }}>
                            <Button
                              size="small"
                              variant="text"
                              sx={{ color: EVZONE.orange, fontWeight: 900, px: 0 }}
                              onClick={() => setSnack({ open: true, severity: "info", msg: "Details view belongs to /auth/continue." })}
                            >
                              Show details
                            </Button>
                          </Box>
                        </Box>

                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          By continuing, you agree to EVzone Terms and acknowledge the Privacy Policy.
                        </Typography>
                      </Stack>
                    ) : null}
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
                <Button size="small" variant="text" sx={{ color: EVZONE.orange, fontWeight: 820 }} onClick={() => setSnack({ open: true, severity: "info", msg: "Terms (demo)" })}>
                  Terms
                </Button>
                <Button size="small" variant="text" sx={{ color: EVZONE.orange, fontWeight: 820 }} onClick={() => setSnack({ open: true, severity: "info", msg: "Privacy (demo)" })}>
                  Privacy
                </Button>
                <Button size="small" variant="text" sx={{ color: EVZONE.orange, fontWeight: 820 }} onClick={() => setSnack({ open: true, severity: "info", msg: "Help Center (demo)" })}>
                  Help
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Account item menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={closeAccountMenu}
          PaperProps={{
            sx: {
              borderRadius: 16,
              border: `1px solid ${theme.palette.divider}`,
              backgroundImage: "none",
              minWidth: 240,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              closeAccountMenu();
              setSnack({ open: true, severity: "info", msg: "Manage account (demo)" });
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <ShieldCheck size={18} color={EVZONE.orange} />
              <Typography>Manage account</Typography>
            </Stack>
          </MenuItem>
          <MenuItem onClick={requestRemove}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Trash2 size={18} color={EVZONE.orange} />
              <Typography>Remove from this device</Typography>
            </Stack>
          </MenuItem>
        </Menu>

        {/* Remove confirmation */}
        <Dialog
          open={removeDialog.open}
          onClose={() => setRemoveDialog({ open: false, account: null })}
          PaperProps={{
            sx: {
              borderRadius: 20,
              border: `1px solid ${theme.palette.divider}`,
              backgroundImage: "none",
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 950 }}>Remove account from this device?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              This removes the local session for this account. You can still sign in later using your credentials.
            </Typography>
            {removeDialog.account ? (
              <Box
                sx={{
                  mt: 2,
                  borderRadius: 16,
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.6),
                  p: 1.4,
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.35), color: "white", fontWeight: 900 }}>
                    {initials(removeDialog.account.fullName)}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 900 }}>{removeDialog.account.fullName}</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {removeDialog.account.handle}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" onClick={() => setRemoveDialog({ open: false, account: null })} sx={orangeOutlinedSx}>
              Cancel
            </Button>
            <Button variant="contained" color="secondary" onClick={confirmRemove} sx={orangeContainedSx}>
              Remove
            </Button>
          </DialogActions>
        </Dialog>

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
