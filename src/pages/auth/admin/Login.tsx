import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthHeader from "../../../components/headers/AuthHeader";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CssBaseline,
    Divider,
    FormControlLabel,
    IconButton,
    InputAdornment,
    LinearProgress,
    Snackbar,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";
import {
    Loader2
} from "lucide-react";

// Types
import { ThemeMode, Severity } from "../../../utils/types";
import {
    IconBase,
    SunIcon,
    MoonIcon,
    GlobeIcon,
    EyeIcon,
    EyeOffIcon,
    LockIcon,
    UserIcon,
    ArrowRightIcon,
    ShieldIcon,
    GoogleGIcon,
    AppleIcon,
    FingerprintIcon,
    PhoneIcon,
    MailIcon
} from "../../../utils/icons";

const EVZONE = {
    green: "#03cd8c",
    orange: "#f77f00",
} as const;

const THEME_KEY = "evzone_myaccounts_theme";

// -----------------------------
// Theme
// -----------------------------
function getStoredMode(): ThemeMode {
    try {
        const v = window.localStorage.getItem(THEME_KEY);
        return v === "light" || v === "dark" ? (v as ThemeMode) : "light";
    } catch {
        return "light";
    }
}

function setStoredMode(mode: ThemeMode) {
    try {
        window.localStorage.setItem(THEME_KEY, mode);
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
            h4: { fontWeight: 950, letterSpacing: -0.9 },
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
                styleOverrides: { root: { borderRadius: 14, boxShadow: "none" } },
            },
        },
    });
}

// -----------------------------
// Helpers
// -----------------------------
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

function supportsPasskeys() {
    try {
        const w = window as any;
        return !!w.PublicKeyCredential;
    } catch {
        return false;
    }
}

function safeRandomBytes(n: number): Uint8Array {
    const out = new Uint8Array(n);
    try {
        window.crypto.getRandomValues(out);
    } catch {
        for (let i = 0; i < n; i++) out[i] = Math.floor(Math.random() * 256);
    }
    return out;
}

async function tryWebAuthnGet(): Promise<{ ok: boolean; message: string }> {
    try {
        const nav: any = navigator as any;
        if (!nav?.credentials?.get) return { ok: false, message: "WebAuthn is not available." };

        await nav.credentials.get({
            publicKey: {
                challenge: safeRandomBytes(32),
                timeout: 60000,
                userVerification: "preferred",
            },
        });

        return { ok: true, message: "Passkey verified. Admin session established (demo)." };
    } catch (e: any) {
        const name = e?.name || "Error";
        return { ok: false, message: `${name}: passkey prompt was cancelled or not allowed in this environment.` };
    }
}

export default function AdminLogin() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
    const theme = useMemo(() => buildTheme(mode), [mode]);
    const isDark = mode === "dark";

    const [identifier, setIdentifier] = useState("admin@evzone.com");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    // lockout
    const [attempts, setAttempts] = useState(0);
    const [lockUntil, setLockUntil] = useState<number | null>(null);
    const isLocked = lockUntil !== null && Date.now() < lockUntil;
    const secondsLeft = isLocked ? Math.max(1, Math.ceil((lockUntil! - Date.now()) / 1000)) : 0;

    // passkeys
    const [passkeySupported, setPasskeySupported] = useState<boolean | null>(null);
    const [passkeyBusy, setPasskeyBusy] = useState(false);

    const [banner, setBanner] = useState<{ severity: "error" | "warning" | "info" | "success"; msg: string } | null>(null);
    const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

    useEffect(() => {
        let mounted = true;
        (async () => {
            const supports = supportsPasskeys();
            if (!supports) {
                if (mounted) setPasskeySupported(false);
                return;
            }
            try {
                const w = window as any;
                const fn = w.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable;
                if (typeof fn === "function") {
                    const ok = await fn.call(w.PublicKeyCredential);
                    if (mounted) setPasskeySupported(!!ok);
                } else {
                    if (mounted) setPasskeySupported(true);
                }
            } catch {
                if (mounted) setPasskeySupported(true);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!isLocked) return;
        const t = window.setInterval(() => setBanner({ severity: "error", msg: `Too many attempts. Try again in ${secondsLeft}s.` }), 800);
        return () => window.clearInterval(t);
    }, [isLocked, secondsLeft]);

    const toggleMode = () => {
        const next: ThemeMode = isDark ? "light" : "dark";
        setMode(next);
        setStoredMode(next);
    };

    // Green-only background
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
        borderColor: alpha(EVZONE.orange, 0.70),
        color: EVZONE.orange,
        backgroundColor: alpha(theme.palette.background.paper, 0.35),
        "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
    } as const;

    const orangeTextSx = {
        color: EVZONE.orange,
        fontWeight: 900,
        "&:hover": { backgroundColor: alpha(EVZONE.orange, mode === "dark" ? 0.14 : 0.10) },
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

    const onGoogle = () => setSnack({ open: true, severity: "info", msg: "Google sign-in: redirecting (demo)." });
    const onApple = () => setSnack({ open: true, severity: "info", msg: "Apple sign-in: redirecting (demo)." });

    const onPasskey = async () => {
        setBanner(null);
        if (passkeySupported === false) {
            setSnack({ open: true, severity: "warning", msg: "Passkeys are not supported on this device/browser." });
            return;
        }

        setPasskeyBusy(true);
        try {
            const res = await tryWebAuthnGet();
            setSnack({ open: true, severity: res.ok ? "success" : "warning", msg: res.message });
            if (res.ok) {
                navigate("/admin/dashboard");
            } else {
                setBanner({ severity: "info", msg: "If passkeys are unavailable here, use password or Google/Apple." });
            }
        } finally {
            setPasskeyBusy(false);
        }
    };

    const { t } = useTranslation();

    const submit = () => {
        setBanner(null);

        const id = identifier.trim();
        if (!id) {
            setBanner({ severity: "warning", msg: "Enter your email or phone number." });
            return;
        }
        if (!password) {
            setBanner({ severity: "warning", msg: "Enter your password." });
            return;
        }

        if (isLocked) {
            setBanner({ severity: "error", msg: `Too many failed attempts. Try again in ${secondsLeft}s.` });
            return;
        }

        const ok = id.toLowerCase() === "admin@evzone.com" && password === "EVzone123!";

        if (!ok) {
            const next = attempts + 1;
            setAttempts(next);

            if (next >= 3) {
                setLockUntil(Date.now() + 30_000);
                setBanner({ severity: "error", msg: "Too many failed attempts. Locked for 30 seconds." });
                return;
            }

            setBanner({ severity: "error", msg: "Invalid credentials. Please try again." });
            return;
        }

        setAttempts(0);
        setLockUntil(null);

        if (rememberMe) {
            try {
                window.localStorage.setItem("evzone_admin_device_session", "true");
            } catch {
                // ignore
            }
        }

        setSnack({ open: true, severity: "success", msg: `Admin signed in as ${maskIdentifier(id)}.` });
        navigate("/admin/dashboard");
    };

    const passkeyChip =
        passkeySupported === null ? (
            <Chip size="small" variant="outlined" label="Checking passkey support…" />
        ) : passkeySupported ? (
            <Chip size="small" color="success" label="Passkeys supported" />
        ) : (
            <Chip size="small" color="warning" label="Passkeys unavailable" />
        );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box className="min-h-screen" sx={{ background: pageBg }}>
                {/* Unified Auth Header */}
                <AuthHeader
                    title="EVzone Admin"
                    subtitle="Sign in to manage the platform"
                />

                {/* Body */}
                <Box className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
                    <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                        {/* Left */}
                        <motion.div className="md:col-span-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                            <Card>
                                <CardContent className="p-5 md:p-6">
                                    <Stack spacing={1.2}>
                                        <Typography variant="h6">Admin access only</Typography>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                            This portal is for EVzone staff and approved organization admins.
                                        </Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Stack spacing={1.1}>
                                            <FeatureRow icon={<ShieldIcon size={18} />} title="Audit logged" desc="All admin actions are recorded." bg={EVZONE.green} />
                                            <FeatureRow icon={<FingerprintIcon size={18} />} title="Passkeys" desc="Use your device lock to sign in securely." bg={EVZONE.green} />
                                            <FeatureRow icon={<LockIcon size={18} />} title="Step-up auth" desc="Sensitive actions require re-auth." bg={EVZONE.green} />
                                        </Stack>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                            Demo admin: <b>admin@evzone.com</b> with password <b>EVzone123!</b>
                                        </Typography>
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
                                            <Typography variant="h4">{t('auth.sign_in')}</Typography>
                                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                                Use passkey, Google/Apple, or your admin credentials.
                                            </Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                                {passkeyChip}
                                                <Chip size="small" variant="outlined" label="Admin scope" />
                                            </Stack>
                                        </Stack>

                                        {/* Social + passkeys */}
                                        <Stack spacing={1}>
                                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                                                <Button fullWidth variant="outlined" startIcon={<GoogleGIcon size={18} />} onClick={onGoogle} sx={{ ...googleBtnSx, borderRadius: 14, fontWeight: 800 }}>
                                                    Continue with Google
                                                </Button>
                                                <Button fullWidth variant="contained" startIcon={<AppleIcon size={18} />} onClick={onApple} sx={{ ...appleBtnSx, borderRadius: 14, fontWeight: 800 }}>
                                                    Continue with Apple
                                                </Button>
                                            </Stack>

                                            {/* Passkey button: outlined + hover fills orange */}
                                            <Button fullWidth variant="outlined" startIcon={<FingerprintIcon size={18} />} onClick={onPasskey} disabled={passkeySupported === false || passkeyBusy} sx={orangeOutlinedSx}>
                                                {passkeyBusy ? "Waiting for passkey…" : "Continue with Passkey"}
                                            </Button>

                                            {passkeyBusy ? (
                                                <Box>
                                                    <LinearProgress />
                                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                                        If the prompt does not appear, use password.
                                                    </Typography>
                                                </Box>
                                            ) : null}

                                            <Divider>or</Divider>
                                        </Stack>

                                        {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                                        <Stack spacing={1.4}>
                                            <TextField
                                                value={identifier}
                                                onChange={(e) => setIdentifier(e.target.value)}
                                                label="Email or phone"
                                                placeholder={t('auth.email_placeholder')}
                                                fullWidth
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">{identifier.trim().startsWith("+") || /\d/.test(identifier.trim().slice(0, 1)) ? <PhoneIcon size={18} /> : <MailIcon size={18} />}</InputAdornment>
                                                    ),
                                                }}
                                            />

                                            <TextField
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                label={t('auth.password_placeholder')}
                                                type={showPassword ? "text" : "password"}
                                                fullWidth
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <LockIcon size={18} />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton size="small" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"} sx={{ color: EVZONE.orange }}>
                                                                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />

                                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between">
                                                <FormControlLabel
                                                    control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} sx={{ color: alpha(EVZONE.orange, 0.7), "&.Mui-checked": { color: EVZONE.orange } }} />}
                                                    label={<Typography variant="body2">Remember this device</Typography>}
                                                />
                                                <Button variant="text" sx={orangeTextSx} onClick={() => navigate("/auth/forgot-password")}>
                                                    {t('auth.forgot_password')}
                                                </Button>
                                            </Stack>

                                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                                                <Button fullWidth variant="contained" endIcon={<ArrowRightIcon size={18} />} onClick={submit} disabled={isLocked} sx={orangeContainedSx}>
                                                    {isLocked ? `Try again in ${secondsLeft}s` : t('auth.sign_in')}
                                                </Button>
                                                <Button fullWidth variant="outlined" sx={orangeOutlinedSx} onClick={() => setSnack({ open: true, severity: "info", msg: "Request access from your org admin (demo)." })}>
                                                    Request access
                                                </Button>
                                            </Stack>

                                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                                By signing in, you agree to EVzone Terms and acknowledge the Privacy Policy.
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Box>

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

                <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                    <Alert
                        onClose={() => setSnack((s) => ({ ...s, open: false }))}
                        severity={snack.severity}
                        variant={mode === "dark" ? "filled" : "standard"}
                        sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}
                    >
                        {snack.msg}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
}

function FeatureRow({ icon, title, desc, bg }: { icon: React.ReactNode; title: string; desc: string; bg: string }) {
    const theme = useTheme();
    return (
        <Stack direction="row" spacing={1.1} alignItems="center">
            <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(bg, 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                {icon}
            </Box>
            <Box>
                <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {desc}
                </Typography>
            </Box>
        </Stack>
    );
}
