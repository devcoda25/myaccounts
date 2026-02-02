import React, { useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/utils/api";
import { formatUserId } from "@/utils/format";
import { isEmail, validateMaxLength, MAX_LENGTHS } from "@/utils/validation";
import { useNavigate } from "react-router-dom";
import Pagination from '@/components/ui/Pagination';
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
    IconButton,
    useMediaQuery
} from "@mui/material";
import { useThemeStore } from "@/stores/themeStore";
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
    Phone as WhatsAppIcon,
    Trash as TrashIcon,
    Download as DownloadIcon
} from "lucide-react";
import { exportToCsv } from "@/utils/export";
import { useNotification } from "@/context/NotificationContext";

import { BackendUser } from '@/types';

// Types
type ThemeMode = "light" | "dark";

type AccountType = "User" | "Provider" | "Agent" | "Org Admin";
type UserStatus = "Active" | "Locked" | "Disabled";
type Risk = "Low" | "Medium" | "High";

type UserRow = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    type: AccountType;
    status: UserStatus;
    currency: string;
    lastLoginAt?: number;
    risk: Risk;
    mfaEnabled: boolean;
    passkeys: number;
};

type ReAuthMode = "password" | "mfa";
type MfaChannel = "Authenticator" | "SMS" | "WhatsApp" | "Email";

type ActionKind = "LOCK" | "UNLOCK" | "RESET_PASSWORD" | "RESET_MFA" | "FORCE_SIGNOUT" | "DELETE_USER";

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

// [Removed] mfaCodeFor mock

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


export default function AdminUsersList() {
    const { t } = useTranslation("common");
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { mode } = useThemeStore();
    const isDark = mode === 'dark';
    const { showNotification } = useNotification();

    const [q, setQ] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [statusFilter, setStatusFilter] = useState<UserStatus | "All">("All");
    const [typeFilter, setTypeFilter] = useState<AccountType | "All">("All");
    const [riskFilter, setRiskFilter] = useState<Risk | "All">("All");

    const [selected, setSelected] = useState<Record<string, boolean>>({});

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<UserRow[]>([]);
    const [total, setTotal] = useState(0);

    // Use ref to track in-flight requests and prevent race conditions
    const fetchUsersRef = useRef<{ controller: AbortController | null; timestamp: number }>({ controller: null, timestamp: 0 });

    const mapUserToRow = (u: BackendUser): UserRow => {

        return {
            id: u.id,
            name: `${u.firstName || ''} ${u.otherNames || ''}`.trim() || 'Unknown',
            email: u.email,
            phone: u.phoneNumber,
            type: u.role === 'SUPER_ADMIN' ? 'Org Admin' : u.role === 'ADMIN' ? 'Agent' : 'User',
            status: u.emailVerified ? 'Active' : 'Disabled',

            currency: 'UGX',
            risk: 'Low',
            mfaEnabled: u.twoFactorEnabled,
            passkeys: 0
        };
    };

    const fetchUsers = async () => {
        // Cancel any in-flight request to prevent race conditions
        if (fetchUsersRef.current.controller) {
            fetchUsersRef.current.controller.abort();
        }

        const controller = new AbortController();
        fetchUsersRef.current.controller = controller;

        setLoading(true);
        try {
            const skip = page * rowsPerPage;
            const rParams: any = {};
            if (q) rParams.query = q;

            if (typeFilter !== 'All') {
                if (typeFilter === 'Org Admin') rParams.role = 'SUPER_ADMIN';
                else if (typeFilter === 'Agent') rParams.role = 'ADMIN';
                else if (typeFilter === 'User') rParams.role = 'USER';
            }

            if (statusFilter !== 'All') {
                if (statusFilter === 'Active') rParams.status = 'Active';
                if (statusFilter === 'Disabled') rParams.status = 'Disabled';
                if (statusFilter === 'Locked') rParams.status = 'Disabled';
            }

            const queryStr = new URLSearchParams(rParams).toString();
            const url = `/users?skip=${skip}&take=${rowsPerPage}&${queryStr}`;

            const res = await api<{ users: BackendUser[]; total: number }>(url, {
                signal: controller.signal
            });

            if (res && Array.isArray(res.users)) {
                setRows(res.users.map(mapUserToRow));
                setTotal(res.total || 0);
            }
        } catch (err: unknown) {
            // Ignore aborted requests
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }
            console.error(err);
            showNotification({ type: 'error', title: 'Load Failed', message: 'Failed to load users' });
        } finally {
            setLoading(false);
            fetchUsersRef.current.controller = null;
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [page, rowsPerPage, q, typeFilter, statusFilter, riskFilter]);

    const handleExport = () => {
        if (!rows.length) return;
        exportToCsv(rows, `users-${Date.now()}.csv`, {
            id: 'User ID',
            name: 'Full Name',
            email: 'Email',
            phone: 'Phone',
            type: 'Account Type',
            status: 'Status',
            walletBalance: 'Balance',
            currency: 'Currency',
            risk: 'Risk Score'
        });
        setRows(rows); // or exportToCsv returns what it does
        showNotification({ type: "success", title: "Export Ready", message: "User directory exported successfully" });
    };

    // Action dialog
    const [actionOpen, setActionOpen] = useState(false);
    const [pending, setPending] = useState<PendingAction | null>(null);
    const [step, setStep] = useState<0 | 1>(0);
    const [reason, setReason] = useState("");
    const [notifyUser, setNotifyUser] = useState(true);
    const [reauthMode, setReauthMode] = useState<ReAuthMode>("password");
    const [adminPassword, setAdminPassword] = useState("");
    const [mfaChannel, setMfaChannel] = useState<MfaChannel>("Authenticator");
    const [otp, setOtp] = useState("");
    const [generatedTempPassword, setGeneratedTempPassword] = useState<string | null>(null);
    const [codeSent, setCodeSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown > 0) {
            const t = setTimeout(() => setCooldown(c => c - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [cooldown]);

    const requestChallenge = async () => {
        try {
            const channelMap: Record<string, 'sms' | 'whatsapp' | 'email'> = {
                'SMS': 'sms',
                'WhatsApp': 'whatsapp',
                'Email': 'email'
            };
            const c = channelMap[mfaChannel];
            if (!c) return;

            await api('/auth/mfa/challenge/send', { method: 'POST', body: JSON.stringify({ channel: c }) });
            setCodeSent(true);
            setCooldown(30);
            showNotification({ type: "success", title: "Code Sent", message: `Code sent to ${mfaChannel}` });
        } catch (err: any) {
            showNotification({ type: "error", title: "Send Failed", message: err.message || "Failed to send code" });
        }
    };

    // Create User Dialog
    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newType, setNewType] = useState<AccountType>("User");
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
        setMfaChannel("Authenticator");
        setCodeSent(false);
        setCooldown(0);
        setOtp("");
        setGeneratedTempPassword(null);
        setActionOpen(true);
    };

    const closeAction = () => {
        setActionOpen(false);
        setPending(null);
        // Reset form state to prevent stale data on next open
        setStep(0);
        setReason("");
        setNotifyUser(true);
        setReauthMode("password");
        setAdminPassword("");
        setMfaChannel("Authenticator");
        setCodeSent(false);
        setCooldown(0);
        setOtp("");
        setGeneratedTempPassword(null);
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
        if (k === "DELETE_USER") return "Delete User";
        return "Force sign out";
    };

    const actionSeverity = (k: ActionKind): "info" | "warning" | "error" => {
        if (k === "LOCK") return "warning";
        if (k === "UNLOCK") return "info";
        if (k === "RESET_PASSWORD") return "warning";
        if (k === "RESET_MFA") return "warning";
        if (k === "DELETE_USER") return "error";
        return "warning";
    };

    const validateStep0 = () => {
        if (!pending) return false;
        if (reason.trim().length < 8) {
            showNotification({ type: "warning", title: "Validation Error", message: "Please provide a reason (at least 8 characters)." });
            return false;
        }
        return true;
    };

    // [Removed] validateReauth (using real backend check now)

    const applyAction = async () => {
        if (!pending || !pendingUser) return;

        try {
            // Re-auth first
            if (reauthMode === "password") {
                // Verify password via backend - reusing general verify-password or a specific admin one?
                // Assuming /auth/verify-password works for current user (the admin)
                await api('/auth/verify-password', { method: 'POST', body: JSON.stringify({ password: adminPassword }) });
            } else {
                const channelMap: Record<string, 'authenticator' | 'sms' | 'whatsapp' | 'email'> = {
                    'Authenticator': 'authenticator',
                    'SMS': 'sms',
                    'WhatsApp': 'whatsapp',
                    'Email': 'email'
                };
                const c = channelMap[mfaChannel];
                await api('/auth/mfa/challenge/verify', { method: 'POST', body: JSON.stringify({ code: otp, channel: c }) });
            }

            // If re-auth success, proceed with action
            if (pending.kind === 'DELETE_USER') {
                await api(`/users/${pending.userId}`, { method: 'DELETE' });
                showNotification({
                    type: "success",
                    title: "User Deleted",
                    message: `User ${pendingUser.name} deleted.`
                });
                // Close modal first, then reload to ensure clean state after deletion
                closeAction();
                setTimeout(() => window.location.reload(), 300);
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else if (pending.kind === 'LOCK') {
                await api(`/users/${pending.userId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ emailVerified: false })
                });
                showNotification({ type: "success", title: "User Locked", message: "User locked (disabled)." });
                fetchUsers();
            } else if (pending.kind === 'UNLOCK') {
                await api(`/users/${pending.userId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ emailVerified: true })
                });
                showNotification({ type: "success", title: "User Unlocked", message: "User unlocked (enabled)." });
                fetchUsers();
            } else if (pending.kind === 'FORCE_SIGNOUT') {
                await api(`/admin/users/${pending.userId}/revoke-sessions`, { method: 'POST' });
                showNotification({ type: "success", title: "Sessions Revoked", message: "User sessions revoked." });
            } else if (pending.kind === 'RESET_PASSWORD' && generatedTempPassword) {
                await api(`/admin/users/${pending.userId}/reset-password`, {
                    method: 'POST',
                    body: JSON.stringify({ password: generatedTempPassword })
                });
                showNotification({ type: "success", title: "Password Reset", message: "User password reset." });
            } else {
                showNotification({ type: "info", title: "Action Simulated", message: `${actionTitle(pending.kind)} simulated (not implemented).` });
            }
        } catch (err: any) {
            console.error(err);
            showNotification({ type: "error", title: "Action Failed", message: (err as Error).message || "Action failed" });
        }

        closeAction();
    };

    const handleCreateUser = async () => {
        // Validate inputs
        if (!newName.trim() || !newEmail.trim()) {
            showNotification({ type: "warning", title: "Validation Error", message: "Name and email are required." });
            return;
        }

        // Validate email format
        if (!isEmail(newEmail)) {
            showNotification({ type: "warning", title: "Validation Error", message: "Please enter a valid email address." });
            return;
        }

        // Validate field lengths
        const nameValidation = validateMaxLength(newName.trim(), MAX_LENGTHS.firstName + MAX_LENGTHS.otherNames);
        if (!nameValidation.valid) {
            showNotification({ type: "warning", title: "Validation Error", message: nameValidation.error });
            return;
        }

        if (newPhone && !validateMaxLength(newPhone, MAX_LENGTHS.phone).valid) {
            showNotification({ type: "warning", title: "Validation Error", message: "Phone number too long." });
            return;
        }

        const nameParts = newName.trim().split(' ');
        const firstName = nameParts[0];
        const otherNames = nameParts.slice(1).join(' ') || '.'; // Backend might require otherNames

        let role = 'USER';
        if (newType === 'Org Admin') role = 'SUPER_ADMIN';
        if (newType === 'Agent') role = 'ADMIN';
        // Provider -> USER for now

        try {
            await api('/users/create', {
                method: 'POST',
                body: JSON.stringify({
                    firstName,
                    otherNames,
                    email: newEmail,
                    phone: newPhone || undefined,
                    role,
                    password: 'Password123!', // Temporary password or auto-generate?
                    // Ideally we send an invite. For now, hardcode a known temp pw or generate one.
                    // Let's use a standard one and notify.
                    acceptTerms: true
                })
            });
            showNotification({ type: "success", title: "User Created", message: `User ${newName} created successfully.` });
            setCreateOpen(false);
            fetchUsers(); // Refresh list

            // Reset form
            setNewName("");
            setNewEmail("");
            setNewPhone("");
            setNewType("User");

        } catch (err: unknown) {
            console.error(err);
            showNotification({ type: "error", title: "Creation Failed", message: (err as Error).message || "Failed to create user" });
        }
    };

    const filtered = rows; // Server-side filtering is active

    const RowActions = ({ r }: { r: UserRow }) => (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Button variant="outlined" sx={orangeOutlined} startIcon={<EyeIcon size={18} />} onClick={() => navigate(`/admin/users/${r.id}`)}>
                View
            </Button>
            <Button variant="outlined" sx={orangeOutlined} startIcon={<UsersIcon size={18} />} onClick={() => navigate(`/admin/users/${r.id}/sessions`)}>
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
            <Button variant="outlined" color="warning" startIcon={<RotateCwIcon size={18} />} onClick={() => openAction("RESET_PASSWORD", r.id)} sx={{ borderColor: theme.palette.warning.main, color: theme.palette.warning.main }}>
                Reset PW
            </Button>
            <Button variant="outlined" color="error" startIcon={<TrashIcon size={18} />} onClick={() => openAction("DELETE_USER", r.id)} sx={{ borderColor: theme.palette.error.main, color: theme.palette.error.main, '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}>
                Delete
            </Button>
        </Stack>
    );

    const statusChip = (s: UserStatus) => {
        const tone = statusTone(s);
        return <Chip size="small" label={s} sx={{ fontWeight: 900, border: `1px solid ${alpha(tone, 0.35)}`, color: tone, backgroundColor: alpha(tone, 0.10) }} />;
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
                                        <Button variant="outlined" sx={orangeOutlined} startIcon={<DownloadIcon size={18} />} onClick={handleExport}>
                                            Export CSV
                                        </Button>
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

                    <Card sx={{ borderRadius: 6, overflow: 'hidden' }}>
                        {!isMobile ? (
                            <TableContainer>
                                <Table sx={{ minWidth: 800 }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.55) }}>
                                            <TableCell sx={{ fontWeight: 950 }}>User</TableCell>
                                            <TableCell sx={{ fontWeight: 950 }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 950 }}>Status</TableCell>

                                            <TableCell sx={{ fontWeight: 950 }}>Risk</TableCell>
                                            <TableCell sx={{ fontWeight: 950 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filtered
                                            .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                                            .map((r) => (
                                                <TableRow key={r.id} hover>
                                                    <TableCell>
                                                        <Stack>
                                                            <Typography sx={{ fontWeight: 900 }}>{r.name}</Typography>
                                                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{r.email || r.phone}</Typography>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>{r.type}</TableCell>
                                                    <TableCell>{statusChip(r.status)}</TableCell>

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
                        ) : (
                            <Stack spacing={0} divider={<Divider />}>
                                {filtered
                                    .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                                    .map((r) => (
                                        <Box key={r.id} sx={{ p: 2 }}>
                                            <Stack spacing={1.5}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                    <Stack spacing={0.5}>
                                                        <Typography variant="subtitle2" fontWeight={700}>{r.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{r.email || r.phone}</Typography>
                                                    </Stack>
                                                    {statusChip(r.status)}
                                                </Stack>

                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Chip size="small" label={r.type} variant="outlined" />

                                                    {riskChip(r.risk)}
                                                </Stack>

                                                {/* Mobile Actions */}
                                                <Box sx={{ pt: 1 }}>
                                                    <RowActions r={r} />
                                                </Box>
                                            </Stack>
                                        </Box>
                                    ))}
                                {filtered.length === 0 && (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                                            No users found matching your filters.
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        )}
                        <Divider />
                        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                            <Pagination
                                page={page}
                                count={total}
                                rowsPerPage={rowsPerPage}
                                onPageChange={setPage}
                                onRowsPerPageChange={(n) => {
                                    setRowsPerPage(n);
                                    setPage(0);
                                }}
                            />
                        </CardContent>
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
                            {pendingUser ? `${actionTitle(pending!.kind)} for ${pendingUser.name} (${formatUserId(pendingUser.id)}).` : ""}
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
                                        helperText="Demo password: superadmin-secure-pw"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, mt: 2 }}
                                    />
                                ) : (
                                    <>
                                        <Typography sx={{ fontWeight: 950, mt: 1 }}>Choose channel</Typography>
                                        <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            <Button variant={mfaChannel === "Authenticator" ? "contained" : "outlined"} sx={mfaChannel === "Authenticator" ? orangeContained : orangeOutlined} startIcon={<KeypadIcon size={18} />} onClick={() => { setMfaChannel("Authenticator"); setCodeSent(false); }}>
                                                Authenticator
                                            </Button>
                                            <Button variant={mfaChannel === "SMS" ? "contained" : "outlined"} sx={mfaChannel === "SMS" ? orangeContained : orangeOutlined} startIcon={<SmsIcon size={18} />} onClick={() => { setMfaChannel("SMS"); setCodeSent(false); }}>
                                                SMS
                                            </Button>
                                            <Button
                                                variant={mfaChannel === "WhatsApp" ? "contained" : "outlined"}
                                                startIcon={<WhatsAppIcon size={18} />}
                                                onClick={() => { setMfaChannel("WhatsApp"); setCodeSent(false); }}
                                                sx={
                                                    mfaChannel === "WhatsApp"
                                                        ? ({ backgroundColor: WHATSAPP.green, color: "#fff", "&:hover": { backgroundColor: alpha(WHATSAPP.green, 0.92) }, borderRadius: 3 } as const)
                                                        : ({ borderColor: alpha(WHATSAPP.green, 0.7), color: WHATSAPP.green, "&:hover": { backgroundColor: WHATSAPP.green, borderColor: WHATSAPP.green, color: "#fff" }, borderRadius: 3 } as const)
                                                }
                                            >
                                                WhatsApp
                                            </Button>
                                            <Button variant={mfaChannel === "Email" ? "contained" : "outlined"} sx={mfaChannel === "Email" ? orangeContained : orangeOutlined} startIcon={<MailIcon size={18} />} onClick={() => { setMfaChannel("Email"); setCodeSent(false); }}>
                                                Email
                                            </Button>
                                        </Box>

                                        {mfaChannel !== "Authenticator" && (
                                            <Button
                                                disabled={cooldown > 0}
                                                onClick={requestChallenge}
                                                fullWidth
                                                variant="outlined"
                                                sx={{ mt: 2, borderRadius: 3, borderColor: theme.palette.divider }}
                                            >
                                                {cooldown > 0 ? `Resend in ${cooldown}s` : codeSent ? "Resend Code" : "Send Code"}
                                            </Button>
                                        )}

                                        <TextField
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            label="6-digit code"
                                            placeholder="123456"
                                            fullWidth
                                            InputProps={{ startAdornment: (<InputAdornment position="start"><KeypadIcon size={18} /></InputAdornment>) }}
                                            helperText={mfaChannel === "Authenticator" ? "Open Authenticator app" : codeSent ? "Code sent." : "Request a code first"}
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

        </Box>
    );
}
