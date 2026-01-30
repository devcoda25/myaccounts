import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Phone,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { motion } from "framer-motion";
import AuthHeader from "@/components/layout/AuthHeader";
import { EVZONE } from "@/theme/evzone";
import { api } from "@/utils/api";

/**
 * EVzone My Accounts - Sign In with OTP
 * Route: /auth/sign-in/otp
 * Requirements:
 * - Premium light + dark mode toggle (persisted)
 * - Background: green-only
 * - Buttons: orange-only with white text (outlined hover -> solid orange + white text)
 * - OTP: 6 digits, resend with cooldown, change identifier, help link
 */

type Step = "request" | "verify";

function isEmail(v: string) {
  return /.+@.+\..+/.test(v);
}

function maskIdentifier(v: string) {
  const s = v.trim();
  if (!s) return "";
  if (isEmail(s)) {
    const [u, d] = s.split("@");
    const safeU = u.length <= 2 ? u[0] + "*" : u.slice(0, 2) + "***";
    return `${safeU}@${d}`;
  }
  return s.length > 6 ? `${s.slice(0, 3)}***${s.slice(-3)}` : s;
}

export default function SignInOtpPage() {
  const { t } = useTranslation("common"); {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [step, setStep] = useState<Step>("request");
  const [identifier, setIdentifier] = useState("example@mail.com");
  const [cooldown, setCooldown] = useState(0);
  const [banner, setBanner] = useState<{ severity: "error" | "warning" | "info" | "success"; msg: string } | null>(null);

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [helpOpen, setHelpOpen] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>(
    { open: false, severity: "info", msg: "" }
  );

  // Green-only background
  const pageBg =
    isDark
      ? "radial-gradient(1200px 600px at 12% 6%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 10%, rgba(3,205,140,0.16), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.18), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.12), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  // Orange-only buttons
  const orangeContainedSx = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, isDark ? 0.28 : 0.20)}`,
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

  const orangeTextSx = {
    color: EVZONE.orange,
    fontWeight: 900,
    "&:hover": {
      backgroundColor: alpha(EVZONE.orange, isDark ? 0.14 : 0.10),
    },
  } as const;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setBanner(null);

    const id = identifier.trim();
    if (!id) {
      setBanner({ severity: "warning", msg: "Enter your email or phone number." });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/otp/request", { identifier: id });

      setCooldown(30);
      setStep("verify");
      setOtp(["", "", "", "", "", ""]);

      // Focus first OTP field after transition
      window.setTimeout(() => inputRefs.current[0]?.focus(), 250);

      setSnack({
        open: true,
        severity: "success",
        msg: `Code sent to ${maskIdentifier(id)}.`,
      });
    } catch (err: unknown) {
      setBanner({ severity: "error", msg: (err as Error).message || "Failed to send code." });
    } finally {
      setLoading(false);
    }
  };

  const changeIdentifier = () => {
    setBanner(null);
    setStep("request");
    setOtp(["", "", "", "", "", ""]);
  };

  const onOtpChange = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });

    if (v && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const onOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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
    window.setTimeout(() => inputRefs.current[lastIndex]?.focus(), 0);
  };

  const verifyCode = async () => {
    setBanner(null);
    const code = otp.join("");
    if (code.length < 6) {
      setBanner({ severity: "warning", msg: "Enter the 6-digit code." });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/otp/login", { identifier, code });

      setSnack({ open: true, severity: "success", msg: "Signed in successfully." });

      // Redirect to dashboard or return url
      const returnUrl = new URLSearchParams(window.location.search).get("return_url") || "/app/dashboard";
      navigate(returnUrl);
    } catch (err: unknown) {
      setBanner({ severity: "error", msg: (err as Error).message || "Incorrect code or expired." });
    } finally {
      setLoading(false);
    }
  };

  const resendCode = () => {
    if (cooldown > 0) return;
    sendCode();
  };

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>
      {/* Top Bar - Replace with AuthHeader */}
      <AuthHeader title={t("EVzone My Accounts")} subtitle={t("Sign in with a one-time code")} />

      {/* Body */}
      <Box className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
          {/* Left: Trust */}
          <motion.div
            className="md:col-span-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card>
              <CardContent className="p-5 md:p-6">
                <Stack spacing={1.2}>
                  <Typography variant="h6">Fast and secure OTP sign-in</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    We send a short code to your email or phone. Enter it here to continue.
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Stack spacing={1.1}>
                    <Stack direction="row" spacing={1.1} alignItems="center">
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 14,
                          display: "grid",
                          placeItems: "center",
                          backgroundColor: alpha(EVZONE.green, isDark ? 0.16 : 0.10),
                          border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                        }}
                      >
                        <ShieldCheck size={18} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 900 }}>Protected sessions</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          OTP sign-in issues secure tokens.
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1.1} alignItems="center">
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 14,
                          display: "grid",
                          placeItems: "center",
                          backgroundColor: alpha(EVZONE.green, isDark ? 0.16 : 0.10),
                          border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                        }}
                      >
                        <KeyRound size={18} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 900 }}>No password required</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Great for quick access on new devices.
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 1 }} />

                  <Button
                    variant="outlined"
                    startIcon={<ArrowLeft size={18} />}
                    sx={orangeOutlinedSx}
                    onClick={() => navigate("/auth/sign-in")}
                  >
                    Back to password sign-in
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: OTP flow */}
          <motion.div
            className="md:col-span-7"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <Card>
              <CardContent className="p-5 md:p-7">
                <Stack spacing={2.0}>
                  <Stack spacing={0.6}>
                    <Typography variant="h6">Sign in with OTP</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Enter your email or phone. We will send a 6-digit code.
                    </Typography>
                  </Stack>

                  {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                  {step === "request" ? (
                    <Stack spacing={1.4}>
                      <TextField
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        label="Email or phone"
                        placeholder="name@example.com or +256..."
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {identifier.trim().startsWith("+") || /\d/.test(identifier.trim().slice(0, 1)) ? (
                                <Phone size={18} />
                              ) : (
                                <Mail size={18} />
                              )}
                            </InputAdornment>
                          ),
                        }}
                      />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="secondary"
                          endIcon={<ArrowRight size={18} />}
                          disabled={loading}
                          onClick={sendCode}
                          sx={orangeContainedSx}
                        >
                          {loading ? "Sending..." : "Send code"}
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => setHelpOpen(true)}
                          sx={orangeOutlinedSx}
                        >
                          Delivery help
                        </Button>
                      </Stack>

                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Tip: For demo, the OTP is <b>123456</b>.
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack spacing={1.4}>
                      <Box
                        sx={{
                          borderRadius: 18,
                          border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                          backgroundColor: alpha(theme.palette.background.paper, 0.45),
                          p: 1.4,
                        }}
                      >
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                          <Box>
                            <Typography sx={{ fontWeight: 900 }}>Code sent</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              Enter the 6-digit code sent to <b>{maskIdentifier(identifier)}</b>.
                            </Typography>
                          </Box>
                          <Button variant="text" sx={orangeTextSx} onClick={changeIdentifier}>
                            Change
                          </Button>
                        </Stack>
                      </Box>

                      <Box className="grid grid-cols-6 gap-2">
                        {otp.map((digit, i) => (
                          <TextField
                            key={i}
                            value={digit}
                            onChange={(e) => onOtpChange(i, e.target.value)}
                            onKeyDown={(e) => onOtpKeyDown(i, e)}
                            onPaste={i === 0 ? onOtpPaste : undefined}
                            inputRef={(el) => {
                              inputRefs.current[i] = el;
                            }}
                            inputProps={{
                              inputMode: "numeric",
                              maxLength: 1,
                              style: {
                                textAlign: "center",
                                fontSize: 18,
                                fontWeight: 900,
                                letterSpacing: 0.4,
                              },
                            }}
                          />
                        ))}
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="secondary"
                          endIcon={<ArrowRight size={18} />}
                          disabled={loading}
                          onClick={verifyCode}
                          sx={orangeContainedSx}
                        >
                          {loading ? "Verifying..." : "Verify and sign in"}
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={resendCode}
                          disabled={cooldown > 0}
                          sx={orangeOutlinedSx}
                        >
                          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                        </Button>
                      </Stack>

                      <Button variant="text" sx={orangeTextSx} onClick={() => setHelpOpen(true)}>
                        Need help receiving the code?
                      </Button>
                    </Stack>
                  )}

                  <Divider />

                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    By signing in, you agree to EVzone Terms and acknowledge the Privacy Policy.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Footer */}
        <Box className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between" sx={{ opacity: 0.92 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            © {new Date().getFullYear()} EVzone Group
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

      {/* Help dialog */}
      <Dialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 20,
            border: `1px solid ${theme.palette.divider}`,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 950 }}>OTP delivery help</DialogTitle>
        <DialogContent>
          <Stack spacing={1.2}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              If you are not receiving the code, try the steps below.
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              • Confirm your email or phone is correct.
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              • Check spam or promotions folders (email).
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              • Ensure your phone has network coverage (SMS).
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              • Wait a moment, then use Resend.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => setHelpOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={orangeContainedSx}
            onClick={() => {
              setHelpOpen(false);
              navigate("/auth/account-recovery-help");
            }}
          >
            Contact support
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
          variant={isDark ? "filled" : "standard"}
          sx={{
            borderRadius: 16,
            border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
            backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.92) : alpha(theme.palette.background.paper, 0.96),
            color: theme.palette.text.primary,
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
