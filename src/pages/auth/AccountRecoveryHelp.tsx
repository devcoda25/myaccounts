import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Account Recovery Help
 * Route: /auth/account-recovery-help
 * Features:
 * • Guided troubleshooting: no email received, phone changed, lost MFA
 * • Contact support CTA
 *
 * Style rules:
 * • Background: green-only
 * • Buttons: orange-only with white text (outlined hover -> solid orange + white text)
 */

type ThemeMode = "light" | "dark";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const WHATSAPP = { green: "#25D366" } as const;

// -----------------------------
// Inline icons
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

function CheckCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="m8.5 12 2.3 2.3L15.8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

// -----------------------------
// Theme helpers
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
      MuiButton: { styleOverrides: { root: { borderRadius: 14, paddingTop: 10, paddingBottom: 10, boxShadow: "none" } } },
    },
  });
}

type HelpItem = {
  key: string;
  title: string;
  bullets: string[];
  primaryCta?: { label: string; action: string };
  secondaryCta?: { label: string; action: string };
};

export default function AccountRecoveryHelpPage() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [openKey, setOpenKey] = useState<string>("no_email");
  const [supportOpen, setSupportOpen] = useState(false);

  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>({ open: false, severity: "info", msg: "" });

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 6%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 10%, rgba(3,205,140,0.16), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.18), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.12), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeContainedSx = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.20)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
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

  const items: HelpItem[] = [
    {
      key: "no_email",
      title: "I didn’t receive the email",
      bullets: [
        "Check Spam/Promotions folders.",
        "Confirm the email address is correct.",
        "Wait 2 to 5 minutes, then resend.",
        "If you used a phone number, try SMS or WhatsApp instead.",
      ],
      primaryCta: { label: "Resend reset instructions", action: "go_forgot" },
      secondaryCta: { label: "Contact support", action: "support" },
    },
    {
      key: "phone_changed",
      title: "My phone number changed",
      bullets: [
        "Try using your email to reset your password.",
        "If you no longer have access to the email, use Account Recovery with support.",
        "Have a document or proof ready if support requests verification.",
      ],
      primaryCta: { label: "Use email reset", action: "go_forgot" },
      secondaryCta: { label: "Contact support", action: "support" },
    },
    {
      key: "lost_mfa",
      title: "I lost my MFA device",
      bullets: [
        "Use a recovery code if you saved them.",
        "If you don’t have recovery codes, contact support.",
        "After login, regenerate recovery codes and enable MFA again.",
      ],
      primaryCta: { label: "Use recovery code", action: "go_recovery" },
      secondaryCta: { label: "Contact support", action: "support" },
    },
    {
      key: "locked_out",
      title: "I’m locked out or rate-limited",
      bullets: [
        "Wait for the timer to expire, then try again.",
        "Avoid repeated requests to prevent blocking.",
        "If this persists, contact support with your identifier (email/phone).",
      ],
      primaryCta: { label: "Go to sign in", action: "go_signin" },
      secondaryCta: { label: "Contact support", action: "support" },
    },
  ];

  const runAction = (action: string) => {
    if (action === "go_forgot") {
      setSnack({ open: true, severity: "info", msg: "Navigate to /auth/forgot-password" });
      return;
    }
    if (action === "go_recovery") {
      setSnack({ open: true, severity: "info", msg: "Navigate to /auth/recovery-code" });
      return;
    }
    if (action === "go_signin") {
      setSnack({ open: true, severity: "info", msg: "Navigate to /auth/sign-in" });
      return;
    }
    if (action === "support") {
      setSupportOpen(true);
      return;
    }
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
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(135deg, rgba(3,205,140,1) 0%, rgba(3,205,140,0.82) 55%, rgba(3,205,140,0.62) 100%)",
                    boxShadow: `0 14px 40px ${alpha(isDark ? "#000" : "#0B1A17", 0.22)}`,
                  }}
                >
                  <Typography sx={{ color: "white", fontWeight: 900, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ lineHeight: 1.1 }}>EVzone My Accounts</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Account recovery help</Typography>
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
                  <IconButton size="small" onClick={() => setSnack({ open: true, severity: "info", msg: "You are already in recovery help." })} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.35)}`, borderRadius: 12, backgroundColor: alpha(theme.palette.background.paper, 0.6), color: EVZONE.orange }}>
                    <HelpCircleIcon size={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Body */}
        <Box className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
          <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
            {/* Left: quick actions */}
            <motion.div className="md:col-span-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
                <CardContent className="p-5 md:p-6">
                  <Stack spacing={1.2}>
                    <Typography variant="h6">Quick actions</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Use these shortcuts to get back into your account quickly.
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={1.2}>
                      <Button variant="contained" color="secondary" sx={orangeContainedSx} endIcon={<ArrowRightIcon size={18} />} onClick={() => runAction("go_forgot")}>
                        Reset password
                      </Button>
                      <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => runAction("go_recovery")}>
                        Use recovery code
                      </Button>
                      <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => runAction("go_signin")}>
                        Go to sign in
                      </Button>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Alert severity="info">
                      If you suspect your account is compromised, reset your password and enable MFA immediately.
                    </Alert>

                    <Button variant="text" sx={orangeTextSx} onClick={() => setSupportOpen(true)}>
                      Contact support
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right: guided troubleshooting */}
            <motion.div className="md:col-span-7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.4}>
                    <Stack spacing={0.6}>
                      <Typography variant="h6">Guided troubleshooting</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Choose the issue that matches your situation.
                      </Typography>
                    </Stack>

                    <Divider />

                    <Stack spacing={1.2}>
                      {items.map((it) => {
                        const open = openKey === it.key;
                        return (
                          <Box
                            key={it.key}
                            sx={{
                              borderRadius: 18,
                              border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                              backgroundColor: alpha(theme.palette.background.paper, 0.40),
                              overflow: "hidden",
                            }}
                          >
                            <Button
                              fullWidth
                              variant="text"
                              onClick={() => setOpenKey(open ? "" : it.key)}
                              sx={{
                                justifyContent: "space-between",
                                px: 2,
                                py: 1.5,
                                color: theme.palette.text.primary,
                                fontWeight: 900,
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box sx={{ color: EVZONE.green }}>
                                  <CheckCircleIcon size={18} />
                                </Box>
                                <Typography sx={{ fontWeight: 900 }}>{it.title}</Typography>
                              </Stack>
                              <Box sx={{ color: EVZONE.orange }}>
                                <ChevronDownIcon size={18} />
                              </Box>
                            </Button>

                            {open ? (
                              <Box sx={{ px: 2, pb: 2 }}>
                                <Divider sx={{ mb: 1.4 }} />
                                <Stack spacing={0.8}>
                                  {it.bullets.map((b, idx) => (
                                    <Typography key={idx} variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                      • {b}
                                    </Typography>
                                  ))}
                                </Stack>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ mt: 1.6 }}>
                                  {it.primaryCta ? (
                                    <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={() => runAction(it.primaryCta!.action)} endIcon={<ArrowRightIcon size={18} />}>
                                      {it.primaryCta.label}
                                    </Button>
                                  ) : null}
                                  {it.secondaryCta ? (
                                    <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => runAction(it.secondaryCta!.action)}>
                                      {it.secondaryCta.label}
                                    </Button>
                                  ) : null}
                                </Stack>
                              </Box>
                            ) : null}
                          </Box>
                        );
                      })}
                    </Stack>

                    <Divider />

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      If none of the options apply, contact support and provide the email/phone you used on your account.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Box>

          {/* Footer */}
          <Box className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between" sx={{ opacity: 0.92 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group.</Typography>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => setSnack({ open: true, severity: "info", msg: "Open Terms (demo)" })}>Terms</Button>
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => setSnack({ open: true, severity: "info", msg: "Open Privacy (demo)" })}>Privacy</Button>
            </Stack>
          </Box>
        </Box>

        {/* Support dialog */}
        <Dialog open={supportOpen} onClose={() => setSupportOpen(false)} PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Contact support</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Share the email/phone you used, and what happened. For security, do not share your password.
              </Typography>
              <Box sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.55), p: 1.2 }}>
                <Stack spacing={0.8}>
                  <Typography sx={{ fontWeight: 900 }}>Support channels (demo)</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    • Email: support@evzone.com
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ color: WHATSAPP.green }}>
                      <WhatsAppIcon size={18} />
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      WhatsApp: +256 700 000 000
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    • Phone: +256 700 000 000
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={{ borderColor: alpha(EVZONE.orange, 0.65), color: EVZONE.orange, "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" } }} onClick={() => setSupportOpen(false)}>
              Close
            </Button>
            <Button variant="contained" color="secondary" sx={{ backgroundColor: EVZONE.orange, color: "#FFFFFF", "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92) } }} onClick={() => { setSupportOpen(false); setSnack({ open: true, severity: "success", msg: "Support request submitted (demo)." }); }}>
              Submit support request
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.92) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
