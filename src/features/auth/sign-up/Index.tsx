import React, { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";


import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
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
        <Typography variant="h5" color="error" gutterBottom>Authentication Error</Typography>
        <Typography color="text.secondary" align="center" sx={{ mb: 3, maxWidth: 400 }}>
          {auth.error.message || "Failed to initialize secure session."}
        </Typography>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  // Anti-Flicker: Loading state
  if (!uid && !auth.error && (auth.isLoading || auth.isAuthenticated)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: pageBg }}>
        <CircularProgress />
        <Typography sx={{ mt: 2, color: theme.palette.text.secondary }}>Initializing secure session...</Typography>
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
        title: "Registration Info",
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
          title: "Account Created",
          message: "Account created successfully! Signing you in securely..."
        });
        submitOidcInteractionLogin(uid, email, password);
        return;
      }

      showNotification({
        type: "success",
        title: "Verify Your Email",
        message: "Account created! Please check your inbox for the verification link."
      });
      navigate("/auth/verify-email");

    } catch (e: any) {
      showNotification({
        type: "error",
        title: "Registration Failed",
        message: e.message || "Failed to create account. Please try again."
      });
    }
  };

  const onGoogle = () => initGoogleCustomLogin();
  const onApple = () => initAppleLogin();

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>
      <AuthHeader
        title="EVzone Accounts"
        subtitle="Create your EVzone Identity"
      />

      <Box className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
          <motion.div className="hidden md:block md:col-span-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card>
              <CardContent className="p-5 md:p-6">
                <Stack spacing={1.2}>
                  <Typography variant="h6">Account Creation</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Create your single secure ID for all EVzone services.
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={1.1}>
                    <Stack direction="row" spacing={1.1} alignItems="center">
                      <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, isDark ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                        <ShieldCheckIcon size={18} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 900 }}>Secure Identity</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Bank-grade security for your assets.
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1.1} alignItems="center">
                      <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, isDark ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                        <InfoBadgeIcon size={18} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 900 }}>Clear Permissions</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          You control your data sharing.
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Button variant="outlined" startIcon={<ArrowLeftIcon size={18} />} sx={orangeOutlinedSx} onClick={() => navigate(uid ? `/auth/sign-in?uid=${uid}` : "/auth/sign-in")}>
                    Back to Sign In
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
                    <Typography variant="h6">Create Account</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Get started with EVzone
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
                        {isGoogleLoading ? "Loading..." : "Continue with Google"}
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AppleIcon size={18} />}
                        onClick={onApple}
                        disabled={isAppleLoading}
                        sx={{ ...appleBtnSx, borderRadius: 14, textTransform: "none", fontWeight: 800 }}
                      >
                        {isAppleLoading ? "Loading..." : "Continue with Apple"}
                      </Button>
                    </Stack>
                    <Divider>or</Divider>
                  </Stack>

                  <Stack spacing={1.4}>
                    <Box className="grid gap-3 md:grid-cols-2">
                      <TextField
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        label="First Name"
                        placeholder="e.g. Jane"
                        fullWidth
                        InputProps={{ startAdornment: <InputAdornment position="start"><UserIcon size={18} /></InputAdornment> }}
                      />
                      <TextField
                        value={otherNames}
                        onChange={(e) => setOtherNames(e.target.value)}
                        label="Other Names"
                        placeholder="e.g. Doe"
                        fullWidth
                        InputProps={{ startAdornment: <InputAdornment position="start"><UserIcon size={18} /></InputAdornment> }}
                      />
                    </Box>

                    <Box className="grid gap-3 md:grid-cols-2">
                      <TextField
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        label="Email Address"
                        placeholder="name@example.com"
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
                          renderValue={(selected) => <Typography variant="body2">{selected}</Typography>}
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
                          label="Phone Number"
                          placeholder="700 000 000"
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
                          <Typography sx={{ fontWeight: 900 }}>Create with One-Time Code</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            No password required. We'll verify your phone.
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
                            label="Create Password"
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
                            label="Confirm Password"
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
                      <Alert severity="info">You will receive an OTP to verify your account.</Alert>
                    )}

                    <TextField
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      label="Invite Code (Optional)"
                      placeholder="e.g. EVZ-123"
                      fullWidth
                      InputProps={{ startAdornment: <InputAdornment position="start"><TicketIcon size={18} /></InputAdornment> }}
                    />

                    <FormControlLabel
                      control={<Checkbox checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} sx={{ color: alpha(EVZONE.orange, 0.7), "&.Mui-checked": { color: EVZONE.orange } }} />}
                      label={<Typography variant="body2">I agree to the Terms of Service and Privacy Policy.</Typography>}
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button fullWidth variant="contained" color="secondary" endIcon={<ArrowRightIcon size={18} />} onClick={onContinue} sx={orangeContainedSx}>
                        Continue
                      </Button>
                      <Button fullWidth variant="outlined" startIcon={<ArrowLeftIcon size={18} />} onClick={() => navigate(uid ? `/auth/sign-in?uid=${uid}` : "/auth/sign-in")} sx={orangeOutlinedSx}>
                        Switch to Sign In
                      </Button>
                    </Stack>

                    <Divider />

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Verify your contact info in the next step.
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
            <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/terms", "_blank")}>Terms</Button>
            <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/privacy", "_blank")}>Privacy</Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
