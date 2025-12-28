import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    Snackbar,
    Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import {
    Sun as SunIcon,
    Moon as MoonIcon,
    Globe as GlobeIcon,
    User as UserIcon,
    ShieldAlert as ShieldIcon,
    Lock as LockIcon,
    Unlock as UnlockIcon,
    Key as KeyIcon,
    Grip as KeypadIcon,
    Mail as MailIcon,
    MessageSquare as SmsIcon,
    Phone as WhatsAppIcon,
    ArrowLeft as ArrowLeftIcon,
    ClipboardList as ClipboardIcon
} from "lucide-react";

// Types
type Severity = "success" | "info" | "warning" | "error";

type AccountType = "User" | "Provider" | "Agent" | "Org Admin";
type UserStatus = "Active" | "Locked" | "Disabled";
type KycTier = "Unverified" | "Basic" | "Full";
type Risk = "Low" | "Medium" | "High";
type ReAuthMode = "password" | "mfa";
type MfaChannel = "Authenticator" | "SMS" | "WhatsApp" | "Email";
type ActionKind = "LOCK" | "UNLOCK" | "RESET_PASSWORD" | "RESET_MFA" | "FORCE_SIGNOUT";

type UserRecord = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    type: AccountType;
    status: UserStatus;
    kyc: KycTier;
    walletBalance: number;
    currency: string;
    risk: Risk;
    mfaEnabled: boolean;
    passkeys: number;
    createdAt: number;
    lastLoginAt?: number;
    lastPasswordChangeAt?: number;
    linkedGoogle?: boolean;
    linkedApple?: boolean;
    orgs: { id: string; name: string; role: string }[];
    notes: string;
};

const EVZONE = { green: "#03cd8c", orange: "#f77f00" } as const;
const WHATSAPP = { green: "#25D366" } as const;

function timeAgo(ts?: number) {
    if (!ts) return "Never";
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60000);
    if (min < 1) return "Just now";
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hr ago`;
    const d = Math.floor(hr / 24);
    return `${d} day${d === 1 ? "" : "s"} ago`;
}

function statusTone(s: UserStatus) {
    if (s === "Active") return EVZONE.green;
    if (s === "Locked") return EVZONE.orange;
    return "#667085";
}

function riskTone(r: Risk) {
    if (r === "High") return "#B42318";
    if (r === "Medium") return EVZONE.orange;
    return EVZONE.green;
}

function kycTone(k: KycTier) {
    if (k === "Full") return EVZONE.green;
    if (k === "Basic") return EVZONE.orange;
    return "#B42318";
}

function mkTempPassword() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = new Uint8Array(10);
    try {
        window.crypto.getRandomValues(bytes);
    } catch {
        for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    const s = Array.from(bytes)
        .map((b) => alphabet[b % alphabet.length])
        .join("");
    return `EVZ-${s.slice(0, 4)}-${s.slice(4, 8)}`;
}

function mfaCodeFor(channel: MfaChannel) {
    if (channel === "Authenticator") return "654321";
    if (channel === "SMS") return "222222";
    if (channel === "WhatsApp") return "333333";
    return "111111";
}

function buildDemoUsers(): UserRecord[] {
    const now = Date.now();
    return [
        {
            id: "u_1001",
            name: "Ronald Isabirye",
            email: "ronald.isabirye@gmail.com",
            phone: "+256761677709",
            type: "User",
            status: "Active",
            kyc: "Full",
            walletBalance: 1250000,
            currency: "UGX",
            risk: "Low",
            mfaEnabled: true,
            passkeys: 2,
            createdAt: now - 1000 * 60 * 60 * 24 * 320,
            lastLoginAt: now - 1000 * 60 * 12,
            lastPasswordChangeAt: now - 1000 * 60 * 60 * 24 * 40,
            linkedGoogle: true,
            linkedApple: false,
            orgs: [
                { id: "org_001", name: "EVzone Group", role: "Owner" },
                { id: "org_018", name: "EV Charging Partners", role: "Viewer" },
            ],
            notes: "VIP account. Handle with care.",
        },
        {
            id: "u_1003",
            name: "Mark Kasibante",
            email: "mark.kasibante@example.com",
            phone: "+256700000000",
            type: "User",
            status: "Locked",
            kyc: "Unverified",
            walletBalance: 0,
            currency: "UGX",
            risk: "High",
            mfaEnabled: false,
            passkeys: 0,
            createdAt: now - 1000 * 60 * 60 * 24 * 120,
            lastLoginAt: now - 1000 * 60 * 60 * 20,
            lastPasswordChangeAt: now - 1000 * 60 * 60 * 24 * 110,
            linkedGoogle: false,
            linkedApple: false,
            orgs: [],
            notes: "Locked due to suspicious login attempts.",
        },
    ];
}

const InfoRow = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => {
    const theme = useTheme();
    return (
        <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.text.primary, 0.05), color: theme.palette.text.secondary }}>
                {icon}
            </Avatar>
            <Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{label}</Typography>
                <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
            </Box>
        </Stack>
    );
}

export default function AdminUserDetailPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();
    const isDark = theme.palette.mode === 'dark';

    const [users, setUsers] = useState<UserRecord[]>(() => buildDemoUsers());
    const user = useMemo(() => users.find((u) => u.id === userId) || users[0], [users, userId]); // Fallback to first user for demo if not found, or use placeholder logic

    const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

    const [actionOpen, setActionOpen] = useState(false);
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [kind, setKind] = useState<ActionKind | null>(null);
    const [reason, setReason] = useState("");
    const [notifyUser, setNotifyUser] = useState(true);

    const [reauthMode, setReauthMode] = useState<ReAuthMode>("password");
    const [adminPassword, setAdminPassword] = useState("");
    const [mfaChannel, setMfaChannel] = useState<MfaChannel>("SMS");
    const [otp, setOtp] = useState("");

    const [tempPassword, setTempPassword] = useState<string | null>(null);

    const orangeContained = {
        backgroundColor: EVZONE.orange,
        color: "#FFFFFF",
        boxShadow: `0 18px 48px ${alpha(EVZONE.orange, isDark ? 0.28 : 0.18)}`,
        "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
        borderRadius: 3
    } as const;

    const orangeOutlined = {
        borderColor: alpha(EVZONE.orange, 0.70),
        color: EVZONE.orange,
        backgroundColor: alpha(theme.palette.background.paper, 0.35),
        "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
        borderRadius: 3
    } as const;

    const openAction = (k: ActionKind) => {
        if (!user) return;
        setKind(k);
        setStep(0);
        setReason("");
        setNotifyUser(true);
        setReauthMode("password");
        setAdminPassword("");
        setMfaChannel("SMS");
        setOtp("");
        setTempPassword(null);
        setActionOpen(true);
    };

    const closeAction = () => {
        setActionOpen(false);
        setKind(null);
    };

    const actionTitle = (k: ActionKind) => {
        if (k === "LOCK") return "Lock account";
        if (k === "UNLOCK") return "Unlock account";
        if (k === "RESET_PASSWORD") return "Reset password";
        if (k === "RESET_MFA") return "Reset MFA";
        return "Force sign out";
    };

    const validateStep0 = () => {
        if (reason.trim().length < 8) {
            setSnack({ open: true, severity: "warning", msg: "Please provide a reason (at least 8 characters)." });
            return false;
        }
        return true;
    };

    const validateReauth = () => {
        if (reauthMode === "password") {
            if (adminPassword !== "EVzone123!") {
                setSnack({ open: true, severity: "error", msg: "Re-auth failed (demo). Incorrect password." });
                return false;
            }
            return true;
        }
        if (otp.trim() !== mfaCodeFor(mfaChannel)) {
            setSnack({ open: true, severity: "error", msg: "Re-auth failed (demo). Incorrect code." });
            return false;
        }
        return true;
    };

    const applyAction = () => {
        if (!user || !kind) return;
        if (!validateReauth()) return;

        setUsers((prev) =>
            prev.map((u) => {
                if (u.id !== user.id) return u;
                if (kind === "LOCK") return { ...u, status: "Locked" };
                if (kind === "UNLOCK") return { ...u, status: "Active" };
                if (kind === "RESET_MFA") return { ...u, mfaEnabled: false };
                return u;
            })
        );

        if (kind === "RESET_PASSWORD") {
            const tmp = mkTempPassword();
            setTempPassword(tmp);
            setStep(2);
            setSnack({ open: true, severity: "success", msg: "Temporary password created (demo)." });
            return;
        }

        setSnack({ open: true, severity: "success", msg: `${actionTitle(kind)} applied for ${user.name}.` });
        closeAction();
    };

    const StatusChip = ({ s }: { s: UserStatus }) => {
        const tone = statusTone(s);
        return <Chip size="small" label={s} sx={{ fontWeight: 900, border: `1px solid ${alpha(tone, 0.35)}`, color: tone, backgroundColor: alpha(tone, 0.10) }} />;
    };
    const RiskChip = ({ r }: { r: Risk }) => {
        const tone = riskTone(r);
        return <Chip size="small" label={r} sx={{ fontWeight: 900, border: `1px solid ${alpha(tone, 0.35)}`, color: tone, backgroundColor: alpha(tone, 0.10) }} />;
    };
    const KycChip = ({ k }: { k: KycTier }) => {
        const tone = kycTone(k);
        return <Chip size="small" label={k} sx={{ fontWeight: 900, border: `1px solid ${alpha(tone, 0.35)}`, color: tone, backgroundColor: alpha(tone, 0.10) }} />;
    };

    if (!user && userId && userId !== 'u_1001') {
        // In a real app we'd fetch and loading state, but for demo:
        return (
            <Box sx={{ p: 4 }}>
                <Typography variant="h5">Start with demo user u_1001 or u_1003</Typography>
                <Button onClick={() => navigate('/admin/users')}>Back to list</Button>
            </Box>
        )
    }

    // Use the demo logic which falls back to first user if filtered
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
                <Card sx={{ borderRadius: 6 }}>
                    <CardContent className="p-5 md:p-7">
                        <Stack spacing={1.2}>
                            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                                <Stack direction="row" spacing={1.2} alignItems="center">
                                    <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(EVZONE.green, 0.16), color: theme.palette.text.primary, borderRadius: 18 }}>
                                        <UserIcon size={18} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5">{user.name}</Typography>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                            {user.id} • {user.type}
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                            <StatusChip s={user.status} />
                                            <KycChip k={user.kyc} />
                                            <RiskChip r={user.risk} />
                                            <Chip size="small" variant="outlined" label={`MFA: ${user.mfaEnabled ? "On" : "Off"}`} />
                                        </Stack>
                                    </Box>
                                </Stack>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                                    <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon size={18} />} onClick={() => navigate('/admin/users')}>
                                        Back
                                    </Button>
                                    <Button variant="outlined" sx={orangeOutlined} onClick={() => setSnack({ open: true, severity: "info", msg: `Navigate to /admin/users/${user.id}/sessions (demo).` })}>
                                        Sessions
                                    </Button>
                                    {user.status === "Locked" ? (
                                        <Button variant="contained" sx={orangeContained} startIcon={<UnlockIcon size={18} />} onClick={() => openAction("UNLOCK")}>
                                            Unlock
                                        </Button>
                                    ) : (
                                        <Button variant="contained" sx={orangeContained} startIcon={<LockIcon size={18} />} onClick={() => openAction("LOCK")}>
                                            Lock
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>

                            <Divider />

                            <Alert severity={user.risk === "High" ? "warning" : "info"} icon={<ShieldIcon size={18} />} sx={{ borderRadius: 3 }}>
                                Sensitive actions require admin re-authentication and are recorded in audit logs.
                            </Alert>
                        </Stack>
                    </CardContent>
                </Card>

                <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                    <Box className="md:col-span-12 lg:col-span-7">
                        <Card sx={{ borderRadius: 6 }}>
                            <CardContent className="p-5 md:p-7">
                                <Stack spacing={2}>
                                    <Typography variant="h6">Profile and contacts</Typography>
                                    <Divider />

                                    <InfoRow label="Email" value={user.email || "-"} icon={<MailIcon size={18} />} />
                                    <InfoRow label="Phone" value={user.phone || "-"} icon={<SmsIcon size={18} />} />
                                    <InfoRow label="Created" value={new Date(user.createdAt).toLocaleString()} icon={<ClipboardIcon size={18} />} />
                                    <InfoRow label="Last login" value={timeAgo(user.lastLoginAt)} icon={<ClipboardIcon size={18} />} />
                                    <InfoRow label="Last password change" value={timeAgo(user.lastPasswordChangeAt)} icon={<KeyIcon size={18} />} />

                                    <Divider />

                                    <Typography sx={{ fontWeight: 950 }}>Linked providers</Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        <Chip size="small" variant="outlined" label={`Google: ${user.linkedGoogle ? "Linked" : "Not linked"}`} />
                                        <Chip size="small" variant="outlined" label={`Apple: ${user.linkedApple ? "Linked" : "Not linked"}`} />
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box className="md:col-span-12 lg:col-span-5">
                        <Stack spacing={2.2}>
                            {/* Internal Notes */}
                            <Card sx={{ borderRadius: 6 }}>
                                <CardContent className="p-5 md:p-7">
                                    <Typography sx={{ fontWeight: 950, mb: 2 }}>Admin notes</Typography>
                                    <TextField value={user.notes} fullWidth multiline minRows={3} placeholder="Add internal notes" onChange={() => setSnack({ open: true, severity: "info", msg: "Editing notes (demo)." })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block' }}>
                                        Notes are internal. They are never shown to the user.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Box>
                </Box>
            </Stack>

            {/* Action Dialog */}
            <Dialog open={actionOpen} onClose={closeAction} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 6 } }}>
                <DialogTitle sx={{ fontWeight: 950 }}>
                    {kind ? actionTitle(kind) : "Action"}
                </DialogTitle>
                <DialogContent>
                    {/* Simplified logic since this is repetitive with UsersList, could be extracted to invalid shared component later */}
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {step === 0 && (
                            <>
                                <TextField
                                    label="Reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder='Example: "Suspicious activity"'
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                                <Button variant="contained" sx={orangeContained} onClick={() => { if (validateStep0()) setStep(1); }}>Continue</Button>
                            </>
                        )}
                        {step === 1 && (
                            <>
                                <Typography>Re-enter admin password (demo: EVzone123!)</Typography>
                                <TextField
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    type="password"
                                    fullWidth
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                                <Button variant="contained" sx={orangeContained} onClick={applyAction}>Confirm</Button>
                            </>
                        )}
                        {step === 2 && (
                            <Alert severity="success" sx={{ borderRadius: 3 }}>
                                Temp Password: <b>{tempPassword}</b>
                            </Alert>
                        )}
                    </Stack>
                </DialogContent>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={isDark ? "filled" : "standard"} sx={{ borderRadius: 16 }}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </motion.div>
    );
}
