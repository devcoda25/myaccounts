import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Recovery Code Entry
 * Route: /auth/recovery-code
 *
 * Features:
 * - Single-use recovery code input
 * - Guidance on where to find codes
 * - After success → strongly prompt to regenerate recovery codes
 */

type ThemeMode = "light" | "dark";

type Step = "entry" | "success";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

// -----------------------------
// Inline icons
// -----------------------------
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

function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function ArrowLeftIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
      fontFamily:
        "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
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
            backgroundImage:
              "radial-gradient(900px 420px at 12% 0%, rgba(3,205,140,0.14), transparent 60%), radial-gradient(900px 420px at 88% 0%, rgba(3,205,140,0.10), transparent 55%)",
          },
        },
      },
      MuiButton: { styleOverrides: { root: { borderRadius: 14, paddingTop: 10, paddingBottom: 10, boxShadow: "none" } } },
    },
  });
}

function normalizeCode(s: string) {
  return s
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
}

export default function RecoveryCodeEntryPage() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [step, setStep] = useState<Step>("entry");
  const [code, setCode] = useState("EVZ-REC-1A2B3C");
  const [banner, setBanner] = useState<{ severity: "error" | "warning" | "info" | "success"; msg: string } | null>(null);

  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>(
    { open: false, severity: "info", msg: "" }
  );

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

  const verify = () => {
    setBanner(null);
    const v = normalizeCode(code);
    if (!v) {
      setBanner({ severity: "warning", msg: "Enter your recovery code." });
      return;
    }

    // Demo accepted code
    if (v !== "EVZ-REC-1A2B3C") {
      setBanner({ severity: "error", msg: "Invalid recovery code. Try another code from your list." });
      return;
    }

    setStep("success");
    setSnack({ open: true, severity: "success", msg: "Recovery code accepted." });
  };

  const regenerate = () => {
    setSnack({ open: true, severity: "info", msg: "Navigate to /app/security/recovery-codes (regenerate)" });
  };

  const continueNext = () => {
    setSnack({ open: true, severity: "info", msg: "Continue → proceed to the sensitive action / app (demo)." });
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
                    Recovery code
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                  <IconButton
                    onClick={toggleMode}
                    size="small"
                    sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.35)}`, borderRadius: 12, backgroundColor: alpha(theme.palette.background.paper, 0.6), color: EVZONE.orange }}
                  >
                    {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Language">
                  <IconButton
                    size="small"
                    sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.35)}`, borderRadius: 12, backgroundColor: alpha(theme.palette.background.paper, 0.6), color: EVZONE.orange }}
                  >
                    <GlobeIcon size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Help">
                  <IconButton
                    size="small"
                    onClick={() => setSnack({ open: true, severity: "info", msg: "Recovery code help (demo)" })}
                    sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.35)}`, borderRadius: 12, backgroundColor: alpha(theme.palette.background.paper, 0.6), color: EVZONE.orange }}
                  >
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
            {/* Left guidance */}
            <motion.div className="md:col-span-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
                <CardContent className="p-5 md:p-6">
                  <Stack spacing={1.2}>
                    <Typography variant="h6">Use a recovery code</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Recovery codes are single-use backups when you can’t access your authenticator, SMS, or email.
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={0.8}>
                      <Typography sx={{ fontWeight: 900 }}>Where to find your codes</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        • The list you downloaded when enabling MFA
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        • A secure password manager
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        • Printed backup sheet stored safely
                      </Typography>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Alert severity="warning">
                      Each recovery code can be used only once.
                    </Alert>

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Demo recovery code: <b>EVZ-REC-1A2B3C</b>
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right form */}
            <motion.div className="md:col-span-7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  {step === "success" ? (
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ color: EVZONE.green }}>
                          <CheckCircleIcon size={22} />
                        </Box>
                        <Typography variant="h6">Recovery code accepted</Typography>
                      </Stack>

                      <Alert severity="warning">
                        Strongly recommended: regenerate your recovery codes now. This used code is no longer valid.
                      </Alert>

                      <Box
                        sx={{
                          borderRadius: 18,
                          border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                          backgroundColor: alpha(theme.palette.background.paper, 0.45),
                          p: 1.4,
                        }}
                      >
                        <Stack spacing={1.2}>
                          <Typography sx={{ fontWeight: 900 }}>Next steps</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Generate a fresh list of recovery codes and store them safely.
                          </Typography>
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={regenerate}>
                              Regenerate recovery codes
                            </Button>
                            <Button variant="outlined" sx={orangeOutlinedSx} onClick={continueNext} endIcon={<ArrowRightIcon size={18} />}>
                              Continue
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  ) : (
                    <Stack spacing={2.0}>
                      <Stack spacing={0.6}>
                        <Typography variant="h6">Enter recovery code</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Type a single-use recovery code from your saved list.
                        </Typography>
                      </Stack>

                      {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                      <TextField
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        label="Recovery code"
                        placeholder="EVZ-REC-XXXXXX"
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <KeyIcon size={18} />
                            </InputAdornment>
                          ),
                        }}
                        helperText="Tip: Codes are case-insensitive. Hyphens are optional."
                      />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button
                          variant="contained"
                          color="secondary"
                          sx={orangeContainedSx}
                          onClick={verify}
                          endIcon={<ArrowRightIcon size={18} />}
                        >
                          Verify recovery code
                        </Button>
                        <Button
                          variant="outlined"
                          sx={orangeOutlinedSx}
                          onClick={() => setSnack({ open: true, severity: "info", msg: "Back to /auth/mfa" })}
                          startIcon={<ArrowLeftIcon size={18} />}
                        >
                          Back to MFA
                        </Button>
                      </Stack>

                      <Button variant="text" sx={orangeTextSx} onClick={() => setSnack({ open: true, severity: "info", msg: "Contact support (demo)" })}>
                        I can’t access my recovery codes
                      </Button>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Box>

          {/* Footer */}
          <Box className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between" sx={{ opacity: 0.92 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              © {new Date().getFullYear()} EVzone Group.
            </Typography>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => setSnack({ open: true, severity: "info", msg: "Open Terms (demo)" })}>
                Terms
              </Button>
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => setSnack({ open: true, severity: "info", msg: "Open Privacy (demo)" })}>
                Privacy
              </Button>
            </Stack>
          </Box>
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
              backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.92) : alpha(theme.palette.background.paper, 0.96),
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
