import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CssBaseline,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import AuthHeader from "../../../../components/headers/AuthHeader";
import { useAuthStore } from "../../../../stores/authStore";
import { useSocialLogin } from "../../../../hooks/useSocialLogin";


/**
 * EVzone My Accounts - Create Account v3
 * Route: /auth/sign-up
 * Update: Google + Apple are ACTIVE and use real brand styling.
 *
 * Important: This creates the EVzone account only. Module onboarding happens later.
 *
 * Global style rules still apply to EVzone actions:
 * - Background: green-only
 * - EVzone buttons: orange-only with white text
 * - Social buttons: brand styling (Google/Apple)
 */

import { ThemeMode } from "../../../../utils/types";
import {
  IconBase,
  ArrowLeftIcon,
  ArrowRightIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  TicketIcon,
  ShieldCheckIcon,
  InfoBadgeIcon,
  GoogleGIcon,
  AppleIcon
} from "../../../../utils/icons";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const COUNTRIES = [
  { code: "UG", label: "Uganda", dial: "+256" },
  { code: "KE", label: "Kenya", dial: "+254" },
  { code: "TZ", label: "Tanzania", dial: "+255" },
  { code: "RW", label: "Rwanda", dial: "+250" },
  { code: "NG", label: "Nigeria", dial: "+234" },
  { code: "ZA", label: "South Africa", dial: "+27" },
  { code: "US", label: "United States", dial: "+1" },
  { code: "GB", label: "United Kingdom", dial: "+44" },
  { code: "CA", label: "Canada", dial: "+1" },
  { code: "AE", label: "UAE", dial: "+971" },
  { code: "IN", label: "India", dial: "+91" },
  { code: "CN", label: "China", dial: "+86" },
];

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
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 14, paddingTop: 10, paddingBottom: 10, boxShadow: "none" },
        },
      },
    },
  });
}

function isEmail(v: string) {
  return /.+@.+\..+/.test(v);
}

function scorePassword(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..5
}

export default function SignUpPageV3() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [firstName, setFirstName] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+256");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [createWithOtp, setCreateWithOtp] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [banner, setBanner] = useState<{ severity: "error" | "warning" | "info" | "success"; msg: string } | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>({ open: false, severity: "info", msg: "" });

  // Detect location
  React.useEffect(() => {
    // Simple heuristic or fetch could go here. 
    // For now, we'll try to guess based on timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes("Nairobi") || tz.includes("Kampala")) setCountryCode("+256"); // Default/Fallback
      else if (tz.includes("New_York") || tz.includes("America")) setCountryCode("+1");
      else if (tz.includes("London") || tz.includes("Europe")) setCountryCode("+44");
      // Add more heuristics as needed or fetch from IP API
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleMode = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    setStoredMode(next);
  };

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 6%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 10%, rgba(3,205,140,0.16), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.18), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.12), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  // EVzone buttons
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

  // Brand button styles
  const googleBtnSx = {
    borderColor: "#DADCE0",
    backgroundColor: "#FFFFFF",
    color: "#3C4043",
    "&:hover": { backgroundColor: "#F8F9FA", borderColor: "#DADCE0" },
    "&:active": { backgroundColor: "#F1F3F4" },
  } as const;

  const appleBtnSx = {
    borderColor: "#000000",
    backgroundColor: "#000000",
    color: "#FFFFFF",
    "&:hover": { backgroundColor: "#111111", borderColor: "#111111" },
    "&:active": { backgroundColor: "#1B1B1B" },
  } as const;

  const pwScore = scorePassword(password);
  const pwLabel = pwScore <= 1 ? "Weak" : pwScore === 2 ? "Fair" : pwScore === 3 ? "Good" : pwScore === 4 ? "Strong" : "Very strong";

  const validate = () => {
    const fn = firstName.trim();
    const ln = otherNames.trim();
    const e = email.trim();
    const p = phone.trim();

    if (!fn) return "Enter your first name.";
    if (!ln) return "Enter your other names.";
    if (!e && !p) return "Provide at least an email or phone number.";
    if (e && !isEmail(e)) return "Enter a valid email address.";
    if (!acceptTerms) return "You must accept the Terms and Privacy Policy.";

    if (!createWithOtp) {
      if (!password) return "Create a password.";
      if (password.length < 8) return "Password must be at least 8 characters.";
      if (password !== confirm) return "Passwords do not match.";
    }

    return null;
  };

  const { register, user } = useAuthStore();
  const { initGoogleLogin, initGoogleCustomLogin, initAppleLogin, isGoogleLoading, isAppleLoading, renderGoogleButton, isGoogleScriptLoaded } = useSocialLogin();

  React.useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from || "/app";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // React.useEffect(() => {
  //   if (isGoogleScriptLoaded) {
  //     renderGoogleButton('google-signup-btn', 'signup_with');
  //   }
  // }, [isGoogleScriptLoaded, renderGoogleButton]);

  const onContinue = async () => {
    setBanner(null);
    const err = validate();
    if (err) {
      setBanner({ severity: "warning", msg: err });
      return;
    }

    try {
      const response = await register({
        firstName,
        otherNames,
        email,
        phoneNumber: phone ? `${countryCode}${phone}` : undefined,
        password,
        inviteCode,
        acceptTerms
      });

      // Save email for verification page
      localStorage.setItem('pending_verification_email', email);

      setSnack({ open: true, severity: "success", msg: "Account created! Please verify your email." });
      navigate("/auth/verify-email");
    } catch (e: any) {
      setBanner({ severity: "error", msg: e.message || "Failed to create account. Please try again." });
    }
  };

  const onGoogle = () => initGoogleCustomLogin();
  const onApple = () => initAppleLogin();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="min-h-screen" sx={{ background: pageBg }}>
        {/* Unified Auth Header */}
        <AuthHeader
          title={t('app_name')}
          subtitle={t('auth.sign_up.subtitle')}
        />

        {/* Body */}
        <Box className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
          <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
            {/* Left */}
            <motion.div className="md:col-span-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
                <CardContent className="p-5 md:p-6">
                  <Stack spacing={1.2}>
                    <Typography variant="h6">{t('auth.sign_up.account_creation_only')}</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {t('auth.sign_up.account_creation_desc')}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Stack spacing={1.1}>
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <ShieldCheckIcon size={18} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>{t('auth.sign_up.secure_identity')}</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {t('auth.sign_up.secure_identity_desc')}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <InfoBadgeIcon size={18} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>{t('auth.sign_up.clear_permissions')}</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {t('auth.sign_up.clear_permissions_desc')}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Button variant="outlined" startIcon={<ArrowLeftIcon size={18} />} sx={orangeOutlinedSx} onClick={() => navigate("/auth/sign-in")}>
                      {t('auth.sign_up.back_to_signin')}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right */}
            <motion.div className="md:col-span-7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={2.0}>
                    <Stack spacing={0.6}>
                      <Typography variant="h6">{t('auth.sign_up.form_title')}</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {t('auth.sign_up.form_subtitle')}
                      </Typography>
                    </Stack>

                    {/* Social sign-up (brand styling) */}
                    <Stack spacing={1}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        {/* <div id="google-signup-btn" style={{ width: '100%', height: 44 }}></div> */}

                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<GoogleGIcon size={18} />}
                          onClick={onGoogle}
                          disabled={isGoogleLoading}
                          sx={{
                            borderColor: "#DADCE0",
                            backgroundColor: "#FFFFFF",
                            color: "#3C4043",
                            "&:hover": { backgroundColor: "#F8F9FA", borderColor: "#DADCE0" },
                            "&:active": { backgroundColor: "#F1F3F4" },
                            borderRadius: 14,
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          {isGoogleLoading ? t('auth.sign_up.loading') : t('auth.sign_up.continue_google')}
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<AppleIcon size={18} />}
                          onClick={onApple}
                          disabled={isAppleLoading}
                          sx={{
                            borderColor: "#000000",
                            backgroundColor: "#000000",
                            color: "#FFFFFF",
                            "&:hover": { backgroundColor: "#111111", borderColor: "#111111" },
                            "&:active": { backgroundColor: "#1B1B1B" },
                            borderRadius: 14,
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          {isAppleLoading ? t('auth.sign_up.loading') : t('auth.sign_up.continue_apple')}
                        </Button>
                      </Stack>
                      <Divider>{t('auth.sign_in.or')}</Divider>
                    </Stack>

                    {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                    <Stack spacing={1.4}>
                      <Box className="grid gap-3 md:grid-cols-2">
                        <TextField
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          label={t('auth.sign_up.first_name')}
                          placeholder={t('auth.sign_up.first_name_placeholder')}
                          fullWidth
                          InputProps={{ startAdornment: <InputAdornment position="start"><UserIcon size={18} /></InputAdornment> }}
                        />
                        <TextField
                          value={otherNames}
                          onChange={(e) => setOtherNames(e.target.value)}
                          label={t('auth.sign_up.other_names')}
                          placeholder={t('auth.sign_up.other_names_placeholder')}
                          fullWidth
                          InputProps={{ startAdornment: <InputAdornment position="start"><UserIcon size={18} /></InputAdornment> }}
                        />
                      </Box>

                      <Box className="grid gap-3 md:grid-cols-2">
                        <TextField
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          label={t('auth.sign_up.email_label')}
                          placeholder={t('auth.sign_up.email_placeholder')}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MailIcon size={18} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            sx={{ width: 100, borderRadius: 1.5, '.MuiSelect-select': { display: 'flex', alignItems: 'center' } }}
                            renderValue={(selected) => (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Typography variant="body2">{selected}</Typography>
                              </Stack>
                            )}
                          >
                            {COUNTRIES.map((c) => (
                              <MenuItem key={c.code} value={c.dial}>
                                <Stack direction="row" justifyContent="space-between" width="100%">
                                  <Typography variant="body2">{c.label}</Typography>
                                  <Typography variant="caption" color="text.secondary">{c.dial}</Typography>
                                </Stack>
                              </MenuItem>
                            ))}
                          </Select>
                          <TextField
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            label={t('auth.sign_up.phone_label')}
                            placeholder={t('auth.sign_up.phone_placeholder')}
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneIcon size={18} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>
                      </Box>

                      {/* OTP toggle */}
                      <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={1}>
                          <Box>
                            <Typography sx={{ fontWeight: 900 }}>{t('auth.sign_up.create_otp_title')}</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              {t('auth.sign_up.create_otp_desc')}
                            </Typography>
                          </Box>
                          <Switch checked={createWithOtp} onChange={(e) => setCreateWithOtp(e.target.checked)} color="secondary" />
                        </Stack>
                      </Box>

                      {!createWithOtp ? (
                        <Box>
                          <Box className="grid gap-3 md:grid-cols-2">
                            <TextField
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              label={t('auth.sign_up.password_label')}
                              type={showPw ? "text" : "password"}
                              fullWidth
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockIcon size={18} />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setShowPw((v) => !v)} sx={{ color: EVZONE.orange }}>
                                      {showPw ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                            <TextField
                              value={confirm}
                              onChange={(e) => setConfirm(e.target.value)}
                              label={t('auth.sign_up.confirm_password_label')}
                              type={showConfirm ? "text" : "password"}
                              fullWidth
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockIcon size={18} />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setShowConfirm((v) => !v)} sx={{ color: EVZONE.orange }}>
                                      {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Box>

                          <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mt: 1.2 }}>
                            <Box sx={{ flex: 1, height: 10, borderRadius: 999, backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.14 : 0.10), overflow: "hidden", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                              <Box sx={{ width: `${(pwScore / 5) * 100}%`, height: "100%", backgroundColor: EVZONE.orange, transition: "width 180ms ease" }} />
                            </Box>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 900 }}>
                              {pwLabel}
                            </Typography>
                          </Stack>

                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {t('auth.sign_up.password_hint')}
                          </Typography>
                        </Box>
                      ) : (
                        <Alert severity="info">{t('auth.sign_up.otp_info')}</Alert>
                      )}

                      <TextField
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        label={t('auth.sign_up.invite_code_label')}
                        placeholder={t('auth.sign_up.invite_code_placeholder')}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TicketIcon size={18} />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <FormControlLabel
                        control={<Checkbox checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} sx={{ color: alpha(EVZONE.orange, 0.7), "&.Mui-checked": { color: EVZONE.orange } }} />}
                        label={<Typography variant="body2">{t('auth.sign_up.terms_checkbox')}</Typography>}
                      />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button fullWidth variant="contained" color="secondary" endIcon={<ArrowRightIcon size={18} />} onClick={onContinue} sx={orangeContainedSx}>
                          {t('auth.sign_up.continue_btn')}
                        </Button>
                        <Button fullWidth variant="outlined" startIcon={<ArrowLeftIcon size={18} />} onClick={() => navigate("/auth/sign-in")} sx={orangeOutlinedSx}>
                          {t('auth.sign_up.sign_in_instead')}
                        </Button>
                      </Stack>

                      <Divider />

                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {t('auth.sign_up.next_step_verification')}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Box>

          {/* Footer */}
          <Box className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between" sx={{ opacity: 0.92 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group.</Typography>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/terms", "_blank")}>{t('auth.terms')}</Button>
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/privacy", "_blank")}>{t('auth.privacy')}</Button>
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
