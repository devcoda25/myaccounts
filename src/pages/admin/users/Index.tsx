import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    InputAdornment,
    MenuItem,
    Snackbar,
    Stack,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useTheme,
    IconButton
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    Users as UsersIcon,
    Search as SearchIcon,
    ShieldAlert as ShieldIcon,
    Lock as LockIcon,
    Unlock as UnlockIcon,
    Key as KeyIcon,
    RotateCw as RotateCwIcon,
    ArrowRight as ArrowRightIcon,
    Eye as EyeIcon,
    Grip as KeypadIcon,
    MessageSquare as SmsIcon,
    Mail as MailIcon,
    Phone as WhatsAppIcon
} from "lucide-react";

// Types
type ThemeMode = "light" | "dark";
type Severity = "success" | "info" | "warning" | "error";

type AccountType = "User" | "Provider" | "Agent" | "Org Admin";
type UserStatus = "Active" | "Locked" | "Disabled";
type KycTier = "Unverified" | "Basic" | "Full";
type Risk = "Low" | "Medium" | "High";

type UserRow = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    type: AccountType;
    status: UserStatus;
    kyc: KycTier;
    walletBalance: number;
    currency: string;
    lastLoginAt?: number;
    risk: Risk;
    mfaEnabled: boolean;
    passkeys: number;
};

type ReAuthMode = "password" | "mfa";
type MfaChannel = "Authenticator" | "SMS" | "WhatsApp" | "Email";

type ActionKind = "LOCK" | "UNLOCK" | "RESET_PASSWORD" | "RESET_MFA" | "FORCE_SIGNOUT";

type PendingAction = {
    kind: ActionKind;
    userId: string;
};

const EVZONE = { green: "#03cd8c", orange: "#f77f00" } as const;
const WHATSAPP = { green: "#25D366" } as const;

// Helpers
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

function uid(prefix: string) {
    return `${prefix}_${Math.random().toString(16).slice(2)}`;
}

function mfaCodeFor(channel: MfaChannel) {
    if (channel === "Authenticator") return "654321";
    if (channel === "SMS") return "222222";
    if (channel === "WhatsApp") return "333333";
    return "111111";
}

function riskTone(r: Risk) {
    if (r === "High") return "#B42318";
    if (r === "Medium") return EVZONE.orange;
    return EVZONE.green;
}

function statusTone(s: UserStatus) {
    if (s === "Active") return EVZONE.green;
    if (s === "Locked") return EVZONE.orange;
    return "#667085";
}

function kycTone(t: KycTier) {
    if (t === "Full") return EVZONE.green;
    if (t === "Basic") return EVZONE.orange;
    return "#B42318";
}

export default function AdminUsersListPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isDark = theme.palette.mode === 'dark';

    const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState<UserStatus | "All">("All");
    const [typeFilter, setTypeFilter] = useState<AccountType | "All">("All");
    const [kycFilter, setKycFilter] = useState<KycTier | "All">("All");
    const [riskFilter, setRiskFilter] = useState<Risk | "All">("All");

    const [selected, setSelected] = useState<Record<string, boolean>>({});

    const [rows, setRows] = useState<UserRow[]>(() => {
        const now = Date.now();
        return [
            { id: "u_1001", name: "Ronald Isabirye", email: "ronald.isabirye@gmail.com", phone: "+256761677709", type: "User", status: "Active", kyc: "Full", walletBalance: 1250000, currency: "UGX", lastLoginAt: now - 1000 * 60 * 10, risk: "Low", mfaEnabled: true, passkeys: 2 },
            { id: "u_1002", name: "Mary I. Naiga", email: "naigamaryimmaculate@gmail.com", phone: "+256704169173", type: "Provider", status: "Active", kyc: "Basic", walletBalance: 220000, currency: "UGX", lastLoginAt: now - 1000 * 60 * 60 * 3, risk: "Medium", mfaEnabled: true, passkeys: 0 },
            { id: "u_1003", name: "Mark Kasibante", email: "mark.kasibante@example.com", phone: "+256700000000", type: "User", status: "Locked", kyc: "Unverified", walletBalance: 0, currency: "UGX", lastLoginAt: now - 1000 * 60 * 60 * 20, risk: "High", mfaEnabled: false, passkeys: 0 },
            { id: "u_1004", name: "Susan Birungi", email: "susan.birungi@example.com", phone: "+256710000000", type: "User", status: "Active", kyc: "Basic", walletBalance: 78000, currency: "UGX", lastLoginAt: now - 1000 * 60 * 60 * 6, risk: "Low", mfaEnabled: false, passkeys: 1 },
            { id: "u_1005", name: "EV Charging Operator", email: "operator@evzone.com", phone: "+256720000000", type: "Org Admin", status: "Active", kyc: "Full", walletBalance: 9100000, currency: "UGX", lastLoginAt: now - 1000 * 60 * 45, risk: "Medium", mfaEnabled: true, passkeys: 3 },
            { id: "u_1006", name: "Field Agent Kampala", email: "agent.kla@evzone.com", phone: "+256730000000", type: "Agent", status: "Disabled", kyc: "Full", walletBalance: 0, currency: "UGX", lastLoginAt: now - 1000 * 60 * 60 * 24 * 12, risk: "Low", mfaEnabled: true, passkeys: 0 },
        ];
    });

    // Action dialog
    const [actionOpen, setActionOpen] = useState(false);
    const [pending, setPending] = useState<PendingAction | null>(null);
    const [step, setStep] = useState<0 | 1>(0);
    const [reason, setReason] = useState("");
    const [notifyUser, setNotifyUser] = useState(true);
    const [reauthMode, setReauthMode] = useState<ReAuthMode>("password");
    const [adminPassword, setAdminPassword] = useState("");
    const [mfaChannel, setMfaChannel] = useState<MfaChannel>("SMS");
    const [otp, setOtp] = useState("");
    const [generatedTempPassword, setGeneratedTempPassword] = useState<string | null>(null);

    // Create User Dialog
    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newType, setNewType] = useState<AccountType>("User");
    const [newKyc, setNewKyc] = useState<KycTier>("Unverified");
    const [newNotify, setNewNotify] = useState(true);


    const orangeContained = {
        backgroundColor: EVZONE.orange,
        color: "#FFFFFF",
        boxShadow: `0 18px 48px ${alpha(EVZONE.orange, isDark ? 0.28 : 0.18)}`,
        "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
        borderRadius: 3
    } as const;

    const greenContained = {
        backgroundColor: EVZONE.green,
        color: "#FFFFFF",
        boxShadow: `0 18px 48px ${alpha(EVZONE.green, isDark ? 0.24 : 0.16)}`,
        "&:hover": { backgroundColor: alpha(EVZONE.green, 0.92), color: "#FFFFFF" },
        borderRadius: 3
    } as const;

    const orangeOutlined = {
        borderColor: alpha(EVZONE.orange, 0.70),
        color: EVZONE.orange,
        backgroundColor: alpha(theme.palette.background.paper, 0.35),
        "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
        borderRadius: 3
    } as const;

    const openAction = (kind: ActionKind, userId: string) => {
        setPending({ kind, userId });
        setStep(0);
        setReason("");
        setNotifyUser(true);
        setReauthMode("password");
        setAdminPassword("");
        setMfaChannel("SMS");
        setOtp("");
        setGeneratedTempPassword(null);
        setActionOpen(true);
    };

    const closeAction = () => {
        setActionOpen(false);
        setPending(null);
    };

    const pendingUser = useMemo(() => {
        if (!pending) return null;
        return rows.find((r) => r.id === pending.userId) || null;
    }, [pending, rows]);

    const actionTitle = (k: ActionKind) => {
        if (k === "LOCK") return "Lock account";
        if (k === "UNLOCK") return "Unlock account";
        if (k === "RESET_PASSWORD") return "Reset password";
        if (k === "RESET_MFA") return "Reset MFA";
        return "Force sign out";
    };

    const actionSeverity = (k: ActionKind): "info" | "warning" | "error" => {
        if (k === "LOCK") return "warning";
        if (k === "UNLOCK") return "info";
        if (k === "RESET_PASSWORD") return "warning";
        if (k === "RESET_MFA") return "warning";
        return "warning";
    };

    const validateStep0 = () => {
        if (!pending) return false;
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
        if (!pending || !pendingUser) return;
        if (!validateReauth()) return;

        setRows((prev) => {
            return prev.map((u) => {
                if (u.id !== pending.userId) return u;

                if (pending.kind === "LOCK") return { ...u, status: "Locked" };
                if (pending.kind === "UNLOCK") return { ...u, status: "Active" };
                if (pending.kind === "RESET_MFA") return { ...u, mfaEnabled: false };
                if (pending.kind === "RESET_PASSWORD") return u; // state change could be added
                if (pending.kind === "FORCE_SIGNOUT") return u;
                return u;
            });
        });

        if (pending.kind === "RESET_PASSWORD") {
            const tmp = mkTempPassword();
            setGeneratedTempPassword(tmp);
            setSnack({ open: true, severity: "success", msg: `Temporary password generated: ${tmp} (demo).` });
        } else {
            setSnack({ open: true, severity: "success", msg: `${actionTitle(pending.kind)} applied for ${pendingUser.name}.` });
        }

        setSnack({
            open: true,
            severity: "info",
            msg: notifyUser ? "User will be notified (demo)." : "No user notification (demo).",
        });

        closeAction();
    };

    const handleCreateUser = () => {
        if (!newName.trim() || !newEmail.trim()) {
            setSnack({ open: true, severity: "warning", msg: "Name and email are required." });
            return;
        }

        const newUser: UserRow = {
            id: uid("u"),
            name: newName,
            email: newEmail,
            phone: newPhone || undefined,
            type: newType,
            status: "Active",
            kyc: newKyc,
            walletBalance: 0,
            currency: "UGX",
            risk: "Low",
            mfaEnabled: false,
            passkeys: 0,
            lastLoginAt: undefined
        };

        setRows((prev) => [newUser, ...prev]);
        setSnack({ open: true, severity: "success", msg: `User ${newName} created successfully.` });
        setCreateOpen(false);

        // Reset form
        setNewName("");
        setNewEmail("");
        setNewPhone("");
        setNewType("User");
        setNewKyc("Unverified");
    };

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        return rows
            .filter((r) => (statusFilter === "All" ? true : r.status === statusFilter))
            .filter((r) => (typeFilter === "All" ? true : r.type === typeFilter))
            .filter((r) => (kycFilter === "All" ? true : r.kyc === kycFilter))
            .filter((r) => (riskFilter === "All" ? true : r.risk === riskFilter))
            .filter((r) =>
                !s
                    ? true
                    : [r.id, r.name, r.email || "", r.phone || "", r.type, r.status, r.kyc]
                        .join(" ")
                        .toLowerCase()
                        .includes(s)
            );
    }, [rows, q, statusFilter, typeFilter, kycFilter, riskFilter]);

    const RowActions = ({ r }: { r: UserRow }) => (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Button variant="outlined" sx={orangeOutlined} startIcon={<EyeIcon size={18} />} onClick={() => navigate(`/admin/users/${r.id}`)}>
                View
            </Button>
            <Button variant="outlined" sx={orangeOutlined} startIcon={<UsersIcon size={18} />} onClick={() => setSnack({ open: true, severity: "info", msg: `Navigate to /admin/users/${r.id}/sessions (demo).` })}>
                Sessions
            </Button>
            {r.status === "Locked" ? (
                <Button variant="contained" sx={orangeContained} startIcon={<UnlockIcon size={18} />} onClick={() => openAction("UNLOCK", r.id)}>
                    Unlock
                </Button>
            ) : (
                <Button variant="contained" sx={orangeContained} startIcon={<LockIcon size={18} />} onClick={() => openAction("LOCK", r.id)}>
                    Lock
                </Button>
            )}
        </Stack>
    );

    const statusChip = (s: UserStatus) => {
        const tone = statusTone(s);
        return <Chip size="small" label={s} sx={{ fontWeight: 900, border: `1px solid ${alpha(tone, 0.35)}`, color: tone, backgroundColor: alpha(tone, 0.10) }} />;
    };
    const kycChip = (k: KycTier) => {
        const tone = kycTone(k);
        return <Chip size="small" label={k} sx={{ fontWeight: 900, border: `1px solid ${alpha(tone, 0.35)}`, color: tone, backgroundColor: alpha(tone, 0.10) }} />;
    };
    const riskChip = (r: Risk) => {
        const tone = riskTone(r);
        return <Chip size="small" label={r} sx={{ fontWeight: 900, border: `1px solid ${alpha(tone, 0.35)}`, color: tone, backgroundColor: alpha(tone, 0.10) }} />;
    };

    return (
        <Box className="min-h-screen">
            {/* Body */}
            <Box>
                <Stack spacing={2.2}>
                    <Card sx={{ borderRadius: 6 }}>
                        <CardContent className="p-5 md:p-7">
                            <Stack spacing={1.2}>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                                    <Box>
                                        <Typography variant="h5">Users directory</Typography>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                            Manage users, providers, agents, and admins.
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1.2}>
                                        <Button variant="contained" sx={greenContained} startIcon={<UsersIcon size={18} />} onClick={() => setCreateOpen(true)}>
                                            Create user
                                        </Button>
                                    </Stack>
                                </Stack>

                                <Divider />

                                <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ xs: "stretch", md: "center" }}>
                                    <TextField
                                        placeholder="Search users..."
                                        size="small"
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon size={18} /></InputAdornment>) }}
                                        fullWidth
                                        sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    />
                                    <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                                        <MenuItem value="All">All</MenuItem>
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Locked">Locked</MenuItem>
                                        <MenuItem value="Disabled">Disabled</MenuItem>
                                    </TextField>
                                    <TextField select size="small" label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                                        <MenuItem value="All">All</MenuItem>
                                        <MenuItem value="User">User</MenuItem>
                                        <MenuItem value="Provider">Provider</MenuItem>
                                        <MenuItem value="Agent">Agent</MenuItem>
                                        <MenuItem value="Org Admin">Org Admin</MenuItem>
                                    </TextField>
                                    <TextField select size="small" label="KYC" value={kycFilter} onChange={(e) => setKycFilter(e.target.value as any)} sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                                        <MenuItem value="All">All</MenuItem>
                                        <MenuItem value="Unverified">Unverified</MenuItem>
                                        <MenuItem value="Basic">Basic</MenuItem>
                                        <MenuItem value="Full">Full</MenuItem>
                                    </TextField>
                                    <TextField select size="small" label="Risk" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value as any)} sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                                        <MenuItem value="All">All</MenuItem>
                                        <MenuItem value="Low">Low</MenuItem>
                                        <MenuItem value="Medium">Medium</MenuItem>
                                        <MenuItem value="High">High</MenuItem>
                                    </TextField>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card sx={{ borderRadius: 6 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.55) }}>
                                        <TableCell sx={{ fontWeight: 950 }}>User</TableCell>
                                        <TableCell sx={{ fontWeight: 950 }}>Type</TableCell>
                                        <TableCell sx={{ fontWeight: 950 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 950 }}>KYC</TableCell>
                                        <TableCell sx={{ fontWeight: 950 }}>Risk</TableCell>
                                        <TableCell sx={{ fontWeight: 950 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.map((r) => (
                                        <TableRow key={r.id} hover>
                                            <TableCell>
                                                <Stack>
                                                    <Typography sx={{ fontWeight: 900 }}>{r.name}</Typography>
                                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{r.email || r.phone}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>{r.type}</TableCell>
                                            <TableCell>{statusChip(r.status)}</TableCell>
                                            <TableCell>{kycChip(r.kyc)}</TableCell>
                                            <TableCell>{riskChip(r.risk)}</TableCell>
                                            <TableCell>
                                                <RowActions r={r} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filtered.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                                                    No users found matching your filters.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Stack>
            </Box>

            {/* Dialogs */}
            <Dialog open={actionOpen} onClose={closeAction} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 6 } }}>
                <DialogTitle sx={{ fontWeight: 950 }}>
                    {pending ? actionTitle(pending.kind) : "Action"}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={1.2} sx={{ mt: 1 }}>
                        <Alert severity={pending ? actionSeverity(pending.kind) : "info"} icon={<ShieldIcon size={18} />} sx={{ borderRadius: 3 }}>
                            {pendingUser ? `${actionTitle(pending!.kind)} for ${pendingUser.name} (${pendingUser.id}).` : ""}
                        </Alert>

                        <Tabs
                            value={step}
                            onChange={(_, v) => setStep(v)}
                            variant="fullWidth"
                            sx={{ borderRadius: 4, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}
                        >
                            <Tab label="Details" />
                            <Tab label="Confirm" />
                        </Tabs>

                        {step === 0 ? (
                            <Stack spacing={1.2} sx={{ mt: 2 }}>
                                <TextField
                                    label="Reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder='Example: "Suspicious login activity"'
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    helperText="Required. Used in audit logs."
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                                <FormControlLabel control={<Checkbox checked={notifyUser} onChange={(e) => setNotifyUser(e.target.checked)} />} label={<Typography sx={{ fontWeight: 900 }}>Notify user</Typography>} />

                                <Divider />

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                                    <Button variant="outlined" sx={orangeOutlined} onClick={closeAction}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        sx={greenContained}
                                        endIcon={<ArrowRightIcon size={18} />}
                                        onClick={() => {
                                            if (!validateStep0()) return;
                                            setStep(1);
                                        }}
                                    >
                                        Continue
                                    </Button>
                                </Stack>

                                {pending?.kind === "RESET_PASSWORD" ? (
                                    <Alert severity="info" icon={<KeyIcon size={18} />} sx={{ borderRadius: 3 }}>
                                        You can generate a temporary password or send a reset link (implementation later).
                                    </Alert>
                                ) : null}
                            </Stack>
                        ) : (
                            <Stack spacing={1.2} sx={{ mt: 2 }}>
                                <Typography sx={{ fontWeight: 950 }}>Admin re-auth</Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                    Sensitive actions require re-authentication (demo).
                                </Typography>

                                <Tabs
                                    value={reauthMode === "password" ? 0 : 1}
                                    onChange={(_, v) => setReauthMode(v === 0 ? "password" : "mfa")}
                                    variant="fullWidth"
                                    sx={{ borderRadius: 4, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}
                                >
                                    <Tab label="Password" />
                                    <Tab label="MFA" />
                                </Tabs>

                                {reauthMode === "password" ? (
                                    <TextField
                                        value={adminPassword}
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        label="Admin password"
                                        type="password"
                                        fullWidth
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><LockIcon size={18} /></InputAdornment>) }}
                                        helperText="Demo password: EVzone123!"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, mt: 2 }}
                                    />
                                ) : (
                                    <>
                                        <Typography sx={{ fontWeight: 950, mt: 1 }}>Choose channel</Typography>
                                        <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            <Button variant={mfaChannel === "Authenticator" ? "contained" : "outlined"} sx={mfaChannel === "Authenticator" ? orangeContained : orangeOutlined} startIcon={<KeypadIcon size={18} />} onClick={() => setMfaChannel("Authenticator")}>
                                                Authenticator
                                            </Button>
                                            <Button variant={mfaChannel === "SMS" ? "contained" : "outlined"} sx={mfaChannel === "SMS" ? orangeContained : orangeOutlined} startIcon={<SmsIcon size={18} />} onClick={() => setMfaChannel("SMS")}>
                                                SMS
                                            </Button>
                                            <Button
                                                variant={mfaChannel === "WhatsApp" ? "contained" : "outlined"}
                                                startIcon={<WhatsAppIcon size={18} />}
                                                onClick={() => setMfaChannel("WhatsApp")}
                                                sx={
                                                    mfaChannel === "WhatsApp"
                                                        ? ({ backgroundColor: WHATSAPP.green, color: "#fff", "&:hover": { backgroundColor: alpha(WHATSAPP.green, 0.92) }, borderRadius: 3 } as const)
                                                        : ({ borderColor: alpha(WHATSAPP.green, 0.7), color: WHATSAPP.green, "&:hover": { backgroundColor: WHATSAPP.green, borderColor: WHATSAPP.green, color: "#fff" }, borderRadius: 3 } as const)
                                                }
                                            >
                                                WhatsApp
                                            </Button>
                                            <Button variant={mfaChannel === "Email" ? "contained" : "outlined"} sx={mfaChannel === "Email" ? orangeContained : orangeOutlined} startIcon={<MailIcon size={18} />} onClick={() => setMfaChannel("Email")}>
                                                Email
                                            </Button>
                                        </Box>

                                        <TextField
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            label="6-digit code"
                                            placeholder="123456"
                                            fullWidth
                                            InputProps={{ startAdornment: (<InputAdornment position="start"><KeypadIcon size={18} /></InputAdornment>) }}
                                            helperText={`Demo code for ${mfaChannel}: ${mfaCodeFor(mfaChannel)}`}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, mt: 2 }}
                                        />
                                    </>
                                )}

                                <Divider sx={{ my: 1 }} />

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                                    <Button variant="outlined" sx={orangeOutlined} onClick={() => setStep(0)}>
                                        Back
                                    </Button>
                                    <Button variant="contained" sx={orangeContained} startIcon={<ShieldIcon size={18} />} onClick={applyAction}>
                                        Confirm
                                    </Button>
                                </Stack>

                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                    Action is recorded in audit logs with your reason.
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </DialogContent>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 6 } }}>
                <DialogTitle sx={{ fontWeight: 950 }}>Create new user</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Full Name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            label="Email Address"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            label="Phone Number (Optional)"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />

                        <Stack direction="row" spacing={2}>
                            <TextField
                                select
                                label="Account Type"
                                value={newType}
                                onChange={(e) => setNewType(e.target.value as AccountType)}
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            >
                                <MenuItem value="User">User</MenuItem>
                                <MenuItem value="Provider">Provider</MenuItem>
                                <MenuItem value="Agent">Agent</MenuItem>
                                <MenuItem value="Org Admin">Org Admin</MenuItem>
                            </TextField>

                            <TextField
                                select
                                label="Initial KYC"
                                value={newKyc}
                                onChange={(e) => setNewKyc(e.target.value as KycTier)}
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            >
                                <MenuItem value="Unverified">Unverified</MenuItem>
                                <MenuItem value="Basic">Basic</MenuItem>
                                <MenuItem value="Full">Full</MenuItem>
                            </TextField>
                        </Stack>

                        <FormControlLabel
                            control={<Checkbox checked={newNotify} onChange={(e) => setNewNotify(e.target.checked)} />}
                            label={<Typography variant="body2">Send welcome email with setup instructions</Typography>}
                        />

                        <Divider />

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} justifyContent="flex-end">
                            <Button variant="outlined" sx={orangeOutlined} onClick={() => setCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="contained" sx={greenContained} onClick={handleCreateUser}>
                                Create Account
                            </Button>
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={isDark ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box >
    );
}
