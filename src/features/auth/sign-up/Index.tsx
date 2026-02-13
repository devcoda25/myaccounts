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

import { COUNTRIES, type Country } from "./constants";
import { EVZONE } from "@/theme/evzone";
import { supportedLocales, type LocaleCode } from "@/i18n/settings";
import i18n from "i18next";

// Build timezone to dial code mapping dynamically from COUNTRIES
// This ensures we use the actual countries available in our dropdown
const TIMEZONE_COUNTRY_MAP: Record<string, string> = {};

// Helper to find country by timezone approximation
function buildTimezoneMapping() {
  // Known timezone mappings based on common timezones
  const mappings: Record<string, string> = {
    // Africa - East Africa (UG, KE, TZ, RW, ET)
    'Africa/Kampala': '+256', // Uganda
    'Africa/Nairobi': '+254', // Kenya
    'Africa/Dar_es_Salaam': '+255', // Tanzania
    'Africa/Kigali': '+250', // Rwanda
    'Africa/Addis_Ababa': '+251', // Ethiopia
    // Africa - West/South
    'Africa/Lagos': '+234', // Nigeria
    'Africa/Johannesburg': '+27', // South Africa
    'Africa/Accra': '+233', // Ghana
    'Africa/Cairo': '+20', // Egypt
    'Africa/Casablanca': '+212', // Morocco
    // Europe
    'Europe/London': '+44', // UK
    'Europe/Paris': '+33', // France
    'Europe/Berlin': '+49', // Germany
    'Europe/Rome': '+39', // Italy
    'Europe/Madrid': '+34', // Spain
    'Europe/Amsterdam': '+31', // Netherlands
    'Europe/Brussels': '+32', // Belgium
    'Europe/Vienna': '+43', // Austria
    'Europe/Stockholm': '+46', // Sweden
    'Europe/Oslo': '+47', // Norway
    'Europe/Copenhagen': '+45', // Denmark
    'Europe/Helsinki': '+358', // Finland
    'Europe/Warsaw': '+48', // Poland
    'Europe/Prague': '+420', // Czech Republic
    'Europe/Budapest': '+36', // Hungary
    'Europe/Athens': '+30', // Greece
    'Europe/Lisbon': '+351', // Portugal
    'Europe/Dublin': '+353', // Ireland
    'Europe/Zurich': '+41', // Switzerland
    // Americas
    'America/New_York': '+1', // USA
    'America/Los_Angeles': '+1', // USA
    'America/Chicago': '+1', // USA
    'America/Denver': '+1', // USA
    'America/Toronto': '+1', // Canada
    'America/Vancouver': '+1', // Canada
    'America/Mexico_City': '+52', // Mexico
    'America/Sao_Paulo': '+55', // Brazil
    'America/Buenos_Aires': '+54', // Argentina
    'America/Lima': '+51', // Peru
    'America/Bogota': '+57', // Colombia
    'America/Santiago': '+56', // Chile
    // Asia
    'Asia/Shanghai': '+86', // China
    'Asia/Tokyo': '+81', // Japan
    'Asia/Seoul': '+82', // South Korea
    'Asia/Bangkok': '+66', // Thailand
    'Asia/Singapore': '+65', // Singapore
    'Asia/Hong_Kong': '+852', // Hong Kong
    'Asia/Taipei': '+886', // Taiwan
    'Asia/Jakarta': '+62', // Indonesia
    'Asia/Kuala_Lumpur': '+60', // Malaysia
    'Asia/Manila': '+63', // Philippines
    'Asia/Hanoi': '+84', // Vietnam
    'Asia/Dubai': '+971', // UAE
    'Asia/Kolkata': '+91', // India
    // Oceania
    'Australia/Sydney': '+61', // Australia
    'Australia/Melbourne': '+61', // Australia
    'Australia/Perth': '+61', // Australia
    'Australia/Brisbane': '+61', // Australia
    'Pacific/Auckland': '+64', // New Zealand
  };

  // Only keep mappings that exist in our COUNTRIES list
  Object.entries(mappings).forEach(([tz, dial]) => {
    const country = COUNTRIES.find((c: Country) => c.dial === dial);
    if (country) {
      TIMEZONE_COUNTRY_MAP[tz] = dial;
    }
  });
}

// Initialize the mapping
buildTimezoneMapping();

// Country to language mapping for auto-detection
const COUNTRY_LANGUAGE_MAP: Record<string, LocaleCode> = {
  // Africa
  'KE': 'en', // Kenya - English (official)
  'UG': 'en', // Uganda - English (official)
  'TZ': 'sw', // Tanzania - Swahili
  'NG': 'en', // Nigeria - English
  'ZA': 'en', // South Africa - English
  'RW': 'en', // Rwanda - English
  'ET': 'en', // Ethiopia - English
  'GH': 'en', // Ghana - English
  'EG': 'ar', // Egypt - Arabic
  'MA': 'ar', // Morocco - Arabic
  // Europe
  'GB': 'en', // UK - English
  'US': 'en', // USA - English
  'CA': 'en', // Canada - English
  'FR': 'fr', // France - French
  'DE': 'ge', // Germany - German
  'IT': 'en', // Italy - English (for now)
  'ES': 'es', // Spain - Spanish
  'NL': 'en', // Netherlands - English
  'BE': 'en', // Belgium - English
  'AT': 'ge', // Austria - German
  'SE': 'en', // Sweden - English
  'NO': 'en', // Norway - English
  'DK': 'en', // Denmark - English
  'FI': 'en', // Finland - English
  'PL': 'en', // Poland - English
  'CZ': 'en', // Czech - English
  'HU': 'en', // Hungary - English
  'GR': 'en', // Greece - English
  'PT': 'pt', // Portugal - Portuguese
  'IE': 'en', // Ireland - English
  'CH': 'ge', // Switzerland - German
  // Americas
  'MX': 'es', // Mexico - Spanish
  'BR': 'pt', // Brazil - Portuguese
  'AR': 'es', // Argentina - Spanish
  'PE': 'es', // Peru - Spanish
  'CO': 'es', // Colombia - Spanish
  'CL': 'es', // Chile - Spanish
  // Asia
  'CN': 'zh-CN', // China - Chinese Simplified
  'TW': 'zh-TW', // Taiwan - Chinese Traditional
  'HK': 'zh-CN', // Hong Kong - Chinese Simplified
  'JP': 'ja', // Japan - Japanese
  'KR': 'ko', // South Korea - Korean
  'TH': 'th', // Thailand - Thai
  'SG': 'en', // Singapore - English
  'ID': 'id', // Indonesia - Indonesian
  'MY': 'ms', // Malaysia - Malay
  'PH': 'en', // Philippines - English
  'VN': 'en', // Vietnam - English (for now)
  'AE': 'ar', // UAE - Arabic
  'IN': 'hi', // India - Hindi
  // Oceania
  'AU': 'en', // Australia - English
  'NZ': 'en', // New Zealand - English
};

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

  // Detect location, country code, and language
  React.useEffect(() => {
    const detectCountryAndLanguage = () => {
      try {
        // Debug: Log detected timezone
        const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log('Detected timezone:', detectedTz);

        // First try timezone detection
        let detectedDialCode = TIMEZONE_COUNTRY_MAP[detectedTz];

        // Special handling for Uganda - check for East Africa timezone variants
        if (detectedTz.includes('London') || detectedTz.includes('Europe')) {
          // If timezone is UK/Europe but user might be in Uganda via VPN or misconfigured system
          // Check browser locale for UG
          const locale = navigator.language || '';
          if (locale.includes('UG') || locale.toLowerCase().includes('uganda')) {
            detectedDialCode = '+256';
          }
        }

        if (detectedDialCode) {
          // Find the country in our list
          const country = COUNTRIES.find((c: Country) => c.dial === detectedDialCode);
          if (country) {
            setCountryCode(country.dial);

            // Auto-detect language based on country
            const languageCode = COUNTRY_LANGUAGE_MAP[country.code];
            if (languageCode) {
              const isSupported = supportedLocales.some(l => l.code === languageCode);
              if (isSupported) {
                i18n.changeLanguage(languageCode);
              }
            }
            return;
          }
        }

        // Fallback to browser locale detection
        const browserLocale = navigator.language || 'en-US';
        console.log('Browser locale:', browserLocale);

        // Try to match country code from locale (e.g., en-US -> US, en-UG -> UG)
        const localeParts = browserLocale.split(/[-_]/);
        if (localeParts.length >= 2) {
          const localeCountry = localeParts[1].toUpperCase();
          const country = COUNTRIES.find((c: Country) => c.code === localeCountry);
          if (country) {
            setCountryCode(country.dial);

            const languageCode = COUNTRY_LANGUAGE_MAP[country.code];
            if (languageCode) {
              const isSupported = supportedLocales.some(l => l.code === languageCode);
              if (isSupported) {
                i18n.changeLanguage(languageCode);
              }
            }
            return;
          }
        }

        // Check for Uganda specifically in various ways
        const ugandaCountry = COUNTRIES.find((c: Country) => c.code === 'UG');
        if (ugandaCountry) {
          // If any indicator suggests Uganda, use it
          if (browserLocale.toLowerCase().includes('ug') ||
            detectedTz.includes('Kampala') ||
            detectedTz.includes('East_Africa')) {
            setCountryCode(ugandaCountry.dial);
            return;
          }
        }

        // Default to Uganda (since this is an EV-ZONE app)
        setCountryCode('+256');
      } catch (e) {
        console.error('Country detection error:', e);
        // Default to Uganda on error
        setCountryCode('+256');
      }
    };

    detectCountryAndLanguage();
  }, []);

  const pageBg =
    isDark
      ? "radial-gradient(1200px 600px at 12% 6%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 10%, rgba(3,205,140,0.16), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

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
      const selectedCountry = COUNTRIES.find((c: Country) => c.dial === countryCode);
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

      <Box className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
        <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
          <motion.div className="md:col-span-12" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
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
                        <FormControl size="small" sx={{ zIndex: 10 }}>
                          <Select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            displayEmpty
                            MenuProps={{
                              anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                              transformOrigin: { vertical: 'top', horizontal: 'left' },
                              PaperProps: {
                                sx: { maxHeight: 400, zIndex: 9999 }
                              },
                              disablePortal: true
                            }}
                          >
                            {COUNTRIES.map((c: Country) => (
                              <MenuItem key={c.code} value={c.dial}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box component="img" src={c.flagUrl} alt={c.label} sx={{ width: 28, height: 'auto', borderRadius: 0.5 }} />
                                  <Typography>{c.label}</Typography>
                                  <Typography sx={{ color: 'text.secondary', ml: 'auto' }}>{c.dial}</Typography>
                                </Box>
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
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        startIcon={<ArrowLeftIcon size={18} />}
                        sx={{ ...orangeOutlinedSx, borderRadius: 14, textTransform: "none", fontWeight: 800, py: 1.5 }}
                      >
                        {t("auth.common.back")}
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={onContinue}
                        endIcon={<ArrowRightIcon size={18} />}
                        sx={{ ...orangeContainedSx, borderRadius: 14, textTransform: "none", fontWeight: 800, py: 1.5 }}
                      >
                        {t("auth.signUp.continue")}
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}
