import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Globe,
  HelpCircle,
  Inbox,
  Mail,
  Moon,
  Pencil,
  ShieldCheck,
  Sun,
  Timer,
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Verify Email
 * Route: /auth/verify-email
 * Requirements (consistent with prior pages):
 * - Premium light + dark mode toggle (persisted)
 * - Background: green-only
 * - Buttons: orange-only with white text (outlined hover -> solid orange + white text)
 *
 * Features:
 * - OTP entry OR open email app + resend link
 * - Change email
 * - Countdown + resend
 * - Success state -> continue
 */

type ThemeMode = "light" | "dark";

type Step = "verify" | "success";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
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
      h4: { fontWeight: 930, letterSpacing: -0.7 },
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
    },
  });
}

function isEmail(v: string) {
  return /.+@.+\..+/.test(v);
}

function maskEmail(email: string) {
  const e = email.trim();
  if (!e || !isEmail(e)) return e;
  const [u, d] = e.split("@");
  const safeU = u.length <= 2 ? u[0] + "*" : u.slice(0, 2) + "***";
  return `${safeU}@${d}`;
}

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [step, setStep] = useState<Step>("verify");

  const [email, setEmail] = useState("ronald@evzone.com");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [cooldown, setCooldown] = useState(30);
  const [banner, setBanner] = useState<{ severity: "error" | "warning" | "info" | "success"; msg: string } | null>(null);

  const [changeOpen, setChangeOpen] = useState(false);
  const [newEmail, setNewEmail] = useState(email);

  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>(
    { open: false, severity: "info", msg: "" }
  );

  const toggleMode = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    setStoredMode(next);
  };

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

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    // initial focus
    window.setTimeout(() => otpRefs.current[0]?.focus(), 250);
  }, []);

  const onOtpChange = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
    if (v && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const onOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const onOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();

    const chars = text.split("");
    setOtp((prev) => {
      const next = [...prev];
      for (let i = 0; i < 6; i++) next[i] = chars[i] || "";
      return next;
    });

    const lastIndex = Math.min(5, text.length - 1);
    window.setTimeout(() => otpRefs.current[lastIndex]?.focus(), 0);
  };

  const resend = () => {
    if (cooldown > 0) return;
    setCooldown(30);
    setSnack({ open: true, severity: "success", msg: `Verification code resent to ${maskEmail(email)}. (Demo code: 111111)` });
  };

  const openEmailApp = () => {
    setSnack({ open: true, severity: "info", msg: "Open email app (demo). Check your inbox for the verification code." });
  };

  const verify = () => {
    setBanner(null);
    const code = otp.join("");
    if (code.length < 6) {
      setBanner({ severity: "warning", msg: "Enter the 6-digit code." });
      return;
    }
    // Demo: accept 111111
    if (code !== "111111") {
      setBanner({ severity: "error", msg: "Incorrect code. Please try again." });
      return;
    }

    setStep("success");
    setSnack({ open: true, severity: "success", msg: "Email verified successfully." });
  };

  const saveEmailChange = () => {
    setBanner(null);
    const e = newEmail.trim();
    if (!isEmail(e)) {
      setBanner({ severity: "warning", msg: "Enter a valid email address." });
      return;
    }
    setEmail(e);
    setOtp(["", "", "", "", "", ""]);
    setCooldown(30);
    setChangeOpen(false);
    setSnack({ open: true, severity: "success", msg: `Email updated. Code sent to ${maskEmail(e)}. (Demo: 111111)` });
    window.setTimeout(() => otpRefs.current[0]?.focus(), 250);
  };

  const continueNext = () => {
    navigate("/auth/verify-phone");
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
                    Verify your email
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
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Language">
                  <IconButton
                    size="small"
                    sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.35)}`, borderRadius: 12, backgroundColor: alpha(theme.palette.background.paper, 0.6), color: EVZONE.orange }}
                  >
                    <Globe size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Help">
                  <IconButton
                    size="small"
                    onClick={() => navigate("/auth/account-recovery-help")}
                    sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.35)}`, borderRadius: 12, backgroundColor: alpha(theme.palette.background.paper, 0.6), color: EVZONE.orange }}
                  >
                    <HelpCircle size={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Body */}
        <Box className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
          <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
            {/* Left: helper */}
            <motion.div className="md:col-span-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
                <CardContent className="p-5 md:p-6">
                  <Stack spacing={1.2}>
                    <Typography variant="h6">Check your inbox</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      We sent a 6-digit verification code to <b>{maskEmail(email)}</b>. Enter it here to continue.
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={1.1}>
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <Inbox size={18} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>Open your email</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Check inbox, spam, and promotions.
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <Timer size={18} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>Resend if needed</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            You can resend after the cooldown.
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="outlined" startIcon={<Mail size={18} />} sx={orangeOutlinedSx} onClick={openEmailApp}>
                        Open email app
                      </Button>
                      <Button variant="outlined" startIcon={<Pencil size={18} />} sx={orangeOutlinedSx} onClick={() => { setNewEmail(email); setChangeOpen(true); }}>
                        Change email
                      </Button>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Demo code: <b>111111</b>
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right: verify */}
            <motion.div className="md:col-span-7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  {step === "success" ? (
                    <Stack spacing={2.0}>
                      <Stack spacing={0.8}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CheckCircle2 size={24} color={EVZONE.green} />
                          <Typography variant="h6">Email verified</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Your email <b>{maskEmail(email)}</b> is verified. You can now continue.
                        </Typography>
                      </Stack>
                      <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.6 }}>
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1.1} alignItems="center">
                            <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                              <ShieldCheck size={18} />
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 900 }}>Next steps</Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Continue to verify phone or set your password.
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </Box>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="contained" color="secondary" endIcon={<ArrowRight size={18} />} sx={orangeContainedSx} onClick={continueNext}>
                          Continue
                        </Button>
                        <Button variant="outlined" startIcon={<ArrowLeft size={18} />} sx={orangeOutlinedSx} onClick={() => navigate("/auth/sign-in")}>
                          Back
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack spacing={2.0}>
                      <Stack spacing={0.6}>
                        <Typography variant="h6">Verify email</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Enter the 6-digit code we sent to <b>{maskEmail(email)}</b>.
                        </Typography>
                      </Stack>

                      {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                      <Box className="grid grid-cols-6 gap-2">
                        {otp.map((digit, i) => (
                          <TextField
                            key={i}
                            value={digit}
                            onChange={(e) => onOtpChange(i, e.target.value)}
                            onKeyDown={(e) => onOtpKeyDown(i, e)}
                            onPaste={i === 0 ? onOtpPaste : undefined}
                            inputRef={(el) => { otpRefs.current[i] = el; }}
                            inputProps={{
                              inputMode: "numeric",
                              maxLength: 1,
                              style: { textAlign: "center", fontSize: 18, fontWeight: 900, letterSpacing: 0.4 },
                            }}
                          />
                        ))}
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="contained" color="secondary" endIcon={<ArrowRight size={18} />} sx={orangeContainedSx} onClick={verify}>
                          Verify email
                        </Button>
                        <Button variant="outlined" onClick={resend} disabled={cooldown > 0} sx={orangeOutlinedSx} startIcon={<Timer size={18} />}>
                          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                        </Button>
                      </Stack>

                      <Button variant="text" sx={orangeTextSx} onClick={() => navigate("/auth/account-recovery-help")}>
                        Didn’t receive the email?
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
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/terms", "_blank")}>
                Terms
              </Button>
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/privacy", "_blank")}>
                Privacy
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Change email dialog */}
        <Dialog
          open={changeOpen}
          onClose={() => setChangeOpen(false)}
          PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}
        >
          <DialogTitle sx={{ fontWeight: 950 }}>Change email</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Update your email address. We will send a new verification code.
              </Typography>
              <TextField
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                label="New email"
                placeholder="name@example.com"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={18} />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => setChangeOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={saveEmailChange}>
              Save & send code
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
