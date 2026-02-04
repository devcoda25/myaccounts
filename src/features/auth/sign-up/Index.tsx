import React, { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Switch,
  TextField,
  Typography,
  CircularProgress
} from "@mui/material";
import { useAuth } from "react-oidc-context";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import AuthHeader from "@/components/layout/AuthHeader";
import { useAuthStore } from "@/stores/authStore";
import { useSocialLogin } from "@/hooks/useSocialLogin";
import { useNotification } from "@/context/NotificationContext";

import {
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
} from "@/components/icons";

import { COUNTRIES } from "./constants";
import { EVZONE } from "@/theme/evzone";

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
function submitOidcInteractionLogin(uid: string, email: string, password: string) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `/oidc/interaction/${encodeURIComponent(uid)}/login`; // SAME ORIGIN (accounts)

  const e = document.createElement("input");
  e.type = "hidden";
  e.name = "email";
  e.value = email;

  const p = document.createElement("input");
  p.type = "hidden";
  p.name = "password";
  p.value = password;

  form.appendChild(e);
  form.appendChild(p);

  document.body.appendChild(form);
  form.submit();
}


export default function SignUpPageV3() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

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

  const { showNotification } = useNotification();

  // Detect location
  React.useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes("Nairobi") || tz.includes("Kampala")) setCountryCode("+256");
      else if (tz.includes("New_York") || tz.includes("America")) setCountryCode("+1");
      else if (tz.includes("London") || tz.includes("Europe")) setCountryCode("+44");
    } catch (e) {
      // ignore
    }
  }, []);

  const pageBg =
    isDark
      ? "radial-gradient(1200px 600px at 12% 6%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 10%, rgba(3,205,140,0.16), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.18), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.12), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  // OIDC Integration
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const auth = useAuth();

  React.useEffect(() => {
    if (!uid && !auth.isAuthenticated && !auth.isLoading && !auth.activeNavigator && !auth.error) {
      auth.signinRedirect().catch(console.error);
    }
  }, [uid, auth]);

  // Error Handling: If OIDC fails, show error and allow retry
  if (auth.error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: pageBg, p: 4 }}>
        <Typography variant="h5" color="error" gutterBottom>{t("auth.error.title")}</Typography>
        <Typography color="text.secondary" align="center" sx={{ mb: 3, maxWidth: 400 }}>
          {auth.error.message || t("auth.error.sessionFailed")}
        </Typography>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          {t("auth.error.retry")}
        </Button>
      </Box>
    );
  }

  // Anti-Flicker: Loading state
  if (!uid && !auth.error && (auth.isLoading || auth.isAuthenticated)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: pageBg }}>
        <CircularProgress />
        <Typography sx={{ mt: 2, color: theme.palette.text.secondary }}>{t("auth.loading.session")}</Typography>
      </Box>
    );
  }

  // EVzone buttons
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
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const orangeTextSx = {
    color: EVZONE.orange,
    fontWeight: 900,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, isDark ? 0.14 : 0.10) },
  } as const;

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
  const pwLabel = pwScore <= 1 ? t("password.weak") : pwScore === 2 ? t("password.fair") : pwScore === 3 ? t("password.good") : pwScore === 4 ? t("password.strong") : t("password.veryStrong");

  const validate = () => {
    const fn = firstName.trim();
    const ln = otherNames.trim();
    const e = email.trim();
    const p = phone.trim();

    if (!fn) return t("auth.signUp.validation.firstNameRequired");
    if (!ln) return t("auth.signUp.validation.otherNamesRequired");
    if (!e && !p) return t("auth.signUp.validation.emailOrPhoneRequired");
    if (e && !isEmail(e)) return t("auth.signUp.validation.validEmailRequired");
    if (!acceptTerms) return t("auth.signUp.validation.termsRequired");

    if (!createWithOtp) {
      if (!password) return t("auth.signUp.validation.passwordRequired");
      if (password.length < 8) return t("auth.signUp.validation.passwordMinLength");
      if (password !== confirm) return t("auth.signUp.validation.passwordsDoNotMatch");
    }

    return null;
  };

  const { register, user } = useAuthStore();
  const { initGoogleCustomLogin, initAppleLogin, isGoogleLoading, isAppleLoading } = useSocialLogin();

  React.useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from || "/app";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const onContinue = async () => {
    const err = validate();
    if (err) {
      showNotification({
        type: "warning",
        title: t("auth.notification.registrationInfo"),
        message: err
      });
      return;
    }

    try {
      const selectedCountry = COUNTRIES.find(c => c.dial === countryCode);
      await register({
        firstName,
        otherNames,
        email,
        phoneNumber: phone ? `${countryCode}${phone}` : undefined,
        country: selectedCountry?.code,
        password,
        inviteCode,
        acceptTerms
      });

      localStorage.setItem('pending_verification_email', email);

      if (uid && !createWithOtp) {
        showNotification({
          type: "success",
          title: t("auth.notification.accountCreated"),
          message: t("auth.notification.accountCreatedSuccess")
        });
        submitOidcInteractionLogin(uid, email, password);
        return;
      }

      showNotification({
        type: "success",
        title: t("auth.notification.verifyEmail"),
        message: t("auth.notification.verifyEmailSuccess")
      });
      navigate("/auth/verify-email");

    } catch (e: any) {
      showNotification({
        type: "error",
        title: t("auth.notification.registrationFailed"),
        message: e.message || t("auth.notification.registrationFailedMessage")
      });
    }
  };

  const onGoogle = () => initGoogleCustomLogin();
  const onApple = () => initAppleLogin();

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>
      <AuthHeader
        title={t("header.title")}
        subtitle={t("header.subtitle")}
      />

      <Box className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
          <motion.div className="hidden md:block md:col-span-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card>
              <CardContent className="p-5 md:p-6">
                <Stack spacing={1.2}>
                  <Typography variant="h6">{t("auth.signUp.sectionTitle")}</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {t("auth.signUp.sectionSubtitle")}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={1.1}>
                    <Stack direction="row" spacing={1.1} alignItems="center">
                      <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, isDark ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                        <ShieldCheckIcon size={18} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 900 }}>{t("auth.signUp.secureIdentity")}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {t("auth.signUp.secureIdentityDesc")}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1.1} alignItems="center">
                      <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, isDark ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                        <InfoBadgeIcon size={18} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 900 }}>{t("auth.signUp.clearPermissions")}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {t("auth.signUp.clearPermissionsDesc")}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Button variant="outlined" startIcon={<ArrowLeftIcon size={18} />} sx={orangeOutlinedSx} onClick={() => navigate(uid ? `/auth/sign-in?uid=${uid}` : "/auth/sign-in")}>
                    {t("auth.signUp.backToSignIn")}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div className="md:col-span-7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            <Card>
              <CardContent className="p-5 md:p-7">
                <Stack spacing={2.0}>
                  <Stack spacing={0.6}>
                    <Typography variant="h6">{t("auth.signUp.createAccount")}</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {t("auth.signUp.getStarted")}
                    </Typography>
                  </Stack>

                  <Stack spacing={1}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GoogleGIcon size={18} />}
                        onClick={onGoogle}
                        disabled={isGoogleLoading}
                        sx={{ ...googleBtnSx, borderRadius: 14, textTransform: "none", fontWeight: 800 }}
                      >
                        {isGoogleLoading ? t("auth.common.loading") : t("auth.signUp.continueWithGoogle")}
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AppleIcon size={18} />}
                        onClick={onApple}
                        disabled={isAppleLoading}
                        sx={{ ...appleBtnSx, borderRadius: 14, textTransform: "none", fontWeight: 800 }}
                      >
                        {isAppleLoading ? t("auth.common.loading") : t("auth.signUp.continueWithApple")}
                      </Button>
                    </Stack>
                    <Divider>{t("auth.common.or")}</Divider>
                  </Stack>

                  <Stack spacing={1.4}>
                    <Box className="grid gap-3 md:grid-cols-2">
                      <TextField
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        label={t("auth.signUp.firstName")}
                        placeholder={t("auth.signUp.firstNamePlaceholder")}
                        fullWidth
                        InputProps={{ startAdornment: <InputAdornment position="start"><UserIcon size={18} /></InputAdornment> }}
                      />
                      <TextField
                        value={otherNames}
                        onChange={(e) => setOtherNames(e.target.value)}
                        label={t("auth.signUp.otherNames")}
                        placeholder={t("auth.signUp.otherNamesPlaceholder")}
                        fullWidth
                        InputProps={{ startAdornment: <InputAdornment position="start"><UserIcon size={18} /></InputAdornment> }}
                      />
                    </Box>

                    <Box className="grid gap-3 md:grid-cols-2">
                      <TextField
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        label={t("auth.signUp.email")}
                        placeholder={t("auth.signUp.emailPlaceholder")}
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
                        <FormControl size="small" sx={{ width: 100, zIndex: 1 }}>
                          <Select
                            value={countryCode}
                            onChange={(e: SelectChangeEvent<string>) => setCountryCode(e.target.value)}
                            renderValue={(selected) => <Typography variant="body2">{selected}</Typography>}
                            IconComponent={(props) => (
                              <ArrowRightIcon {...props} sx={{ transform: 'rotate(90deg)' }} />
                            )}
                            MenuProps={{
                              anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                              transformOrigin: { vertical: 'top', horizontal: 'left' },
                              PaperProps: {
                                sx: { maxHeight: 300 }
                              }
                            }}
                          >
                            {COUNTRIES.map((c) => (
                              <MenuItem key={c.code} value={c.dial}>
                                <Stack direction="row" justifyContent="space-between" width="100%" alignItems="center">
                                  <Typography variant="body2">{c.label}</Typography>
                                  <Typography variant="caption" color="text.secondary">{c.dial}</Typography>
                                </Stack>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          label={t("auth.signUp.phone")}
                          placeholder={t("auth.signUp.phonePlaceholder")}
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

                    <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={1}>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>{t("auth.signUp.createWithOtp")}</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {t("auth.signUp.createWithOtpDesc")}
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
                            label={t("auth.signUp.createPassword")}
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
                            label={t("auth.signUp.confirmPassword")}
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
                          <Box sx={{ flex: 1, height: 10, borderRadius: 999, backgroundColor: alpha(EVZONE.green, isDark ? 0.14 : 0.10), overflow: "hidden", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                            <Box sx={{ width: `${(pwScore / 5) * 100}%`, height: "100%", backgroundColor: EVZONE.orange, transition: "width 180ms ease" }} />
                          </Box>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 900 }}>
                            {pwLabel}
                          </Typography>
                        </Stack>
                      </Box>
                    ) : (
                      <Alert severity="info">{t("auth.signUp.otpInfo")}</Alert>
                    )}

                    <TextField
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      label={t("auth.signUp.inviteCode")}
                      placeholder={t("auth.signUp.inviteCodePlaceholder")}
                      fullWidth
                      InputProps={{ startAdornment: <InputAdornment position="start"><TicketIcon size={18} /></InputAdornment> }}
                    />

                    <FormControlLabel
                      control={<Checkbox checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} sx={{ color: alpha(EVZONE.orange, 0.7), "&.Mui-checked": { color: EVZONE.orange } }} />}
                      label={<Typography variant="body2">{t("auth.signUp.termsAgreement")}</Typography>}
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button fullWidth variant="contained" color="secondary" endIcon={<ArrowRightIcon size={18} />} onClick={onContinue} sx={orangeContainedSx}>
                        {t("auth.signUp.continue")}
                      </Button>
                      <Button fullWidth variant="outlined" startIcon={<ArrowLeftIcon size={18} />} onClick={() => navigate(uid ? `/auth/sign-in?uid=${uid}` : "/auth/sign-in")} sx={orangeOutlinedSx}>
                        {t("auth.signUp.switchToSignIn")}
                      </Button>
                    </Stack>

                    <Divider />

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {t("auth.signUp.verifyContactInfo")}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        <Box className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between" sx={{ opacity: 0.92 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group</Typography>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/terms", "_blank")}>{t("auth.common.terms")}</Button>
            <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/privacy", "_blank")}>{t("auth.common.privacy")}</Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
