import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthHeader from "../../../components/headers/AuthHeader";
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { useTranslation } from "react-i18next";
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
    Snackbar,
    Stack,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import { EVZONE } from "../../../theme/evzone";

// Types
import { Severity } from "../../../utils/types";
import {
    EyeIcon,
    EyeOffIcon,
    LockIcon,
    ArrowRightIcon,
    PhoneIcon,
    MailIcon
} from "../../../utils/icons";

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

export default function AdminLogin() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const { t } = useTranslation();
    const { login } = useAdminAuth();

    const [identifier, setIdentifier] = useState("admin@evzone.com");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    // lockout
    const [attempts, setAttempts] = useState(0);
    const [lockUntil, setLockUntil] = useState<number | null>(null);
    const isLocked = lockUntil !== null && Date.now() < lockUntil;
    const secondsLeft = isLocked ? Math.max(1, Math.ceil((lockUntil! - Date.now()) / 1000)) : 0;

    const [banner, setBanner] = useState<{ severity: "error" | "warning" | "info" | "success"; msg: string } | null>(null);
    const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

    useEffect(() => {
        if (!isLocked) return;
        const t = window.setInterval(() => setBanner({ severity: "error", msg: `Too many attempts. Try again in ${secondsLeft}s.` }), 800);
        return () => window.clearInterval(t);
    }, [isLocked, secondsLeft]);

    // Green-only background
    const pageBg =
        isDark
            ? "radial-gradient(1200px 600px at 12% 6%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 10%, rgba(3,205,140,0.16), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
            : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.18), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.12), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

    const orangeContainedSx = {
        backgroundColor: EVZONE.orange,
        color: "#FFFFFF",
        boxShadow: `0 18px 48px ${alpha(EVZONE.orange, isDark ? 0.28 : 0.20)}`,
        "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
        "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
    } as const;

    const orangeTextSx = {
        color: EVZONE.orange,
        fontWeight: 900,
        "&:hover": { backgroundColor: alpha(EVZONE.orange, isDark ? 0.14 : 0.10) },
    } as const;

    const submit = async () => {
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

        try {
            const success = await login(id);
            if (success) {
                setSnack({ open: true, severity: "success", msg: `Admin signed in as ${maskIdentifier(id)}.` });
                navigate("/admin/dashboard");
            } else {
                const next = attempts + 1;
                setAttempts(next);

                if (next >= 3) {
                    setLockUntil(Date.now() + 30_000);
                    setBanner({ severity: "error", msg: "Too many failed attempts. Locked for 30 seconds." });
                } else {
                    setBanner({ severity: "error", msg: "Invalid credentials. Try admin@evzone.com or staff@evzone.com" });
                }
            }
        } catch (err) {
            setBanner({ severity: "error", msg: "Login failed due to system error." });
        }
    };

    return (
        <Box className="min-h-screen" sx={{ background: pageBg }}>
            {/* Unified Auth Header */}
            <AuthHeader
                title="EVzone Admin"
                subtitle="Sign in to manage the platform"
            />

            {/* Body */}
            <Box className="mx-auto max-w-lg px-4 py-8 md:px-6 md:py-24">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                    <Card>
                        <CardContent className="p-5 md:p-8">
                            <Stack spacing={2.4}>
                                <Stack spacing={0.6}>
                                    <Typography variant="h4" sx={{ color: isDark ? "text.primary" : "#000000" }}>{t('auth.sign_in.title')}</Typography>
                                    <Typography variant="body2" sx={{ color: isDark ? theme.palette.text.secondary : "#000000" }}>
                                        Enter your admin credentials to continue.
                                    </Typography>
                                </Stack>

                                {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                                <Stack spacing={1.6}>
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
                                        <Button variant="text" sx={orangeTextSx} onClick={() => navigate("/admin/auth/forgot-password")}>
                                            {t('auth.sign_in.forgot_password')}
                                        </Button>
                                    </Stack>

                                    <Button fullWidth variant="contained" endIcon={<ArrowRightIcon size={18} />} onClick={submit} disabled={isLocked} sx={orangeContainedSx}>
                                        {isLocked ? `Try again in ${secondsLeft}s` : t('auth.sign_in.sign_in_btn')}
                                    </Button>

                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                        By signing in, you agree to EVzone Terms and acknowledge the Privacy Policy.
                                    </Typography>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </motion.div>

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
                    variant={isDark ? "filled" : "standard"}
                    sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}
                >
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
