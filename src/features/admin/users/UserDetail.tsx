import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/utils/api";
import { formatUserId } from "@/utils/format";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import { useThemeStore } from "@/stores/themeStore";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import {
    User as UserIcon,
    Globe as GlobeIcon,
    Mail as MailIcon,
    MessageSquare as SmsIcon,
    ArrowLeft as ArrowLeftIcon,
    Shield as ShieldIcon,
    Lock as LockIcon,
    Unlock as UnlockIcon,
    Key as KeyIcon,
    ClipboardList as ClipboardIcon
} from "lucide-react";
import { BackendUser } from '@/types';
import { useNotification } from "@/context/NotificationContext";

// Types
type AccountType = "User" | "Provider" | "Agent" | "Org Admin";
type UserStatus = "Active" | "Locked" | "Disabled";
type Risk = "Low" | "Medium" | "High";
type ActionKind = "LOCK" | "UNLOCK" | "RESET_PASSWORD" | "FORCE_SIGNOUT";

type UserRecord = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    country?: string;
    type: AccountType;
    status: UserStatus;
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

export default function AdminUserDetail() {
  const { t } = useTranslation("common"); {
    const { userId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const { mode } = useThemeStore();
    const isDark = theme.palette.mode === 'dark';
    const { showNotification } = useNotification();

    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<UserRecord | null>(null);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        api<BackendUser>(`/users/${userId}`)
            .then((u) => {
                const rec: UserRecord = {
                    id: u.id,
                    name: `${u.firstName || ''} ${u.otherNames || ''}`.trim() || 'No Name',
                    email: u.email,
                    phone: u.phoneNumber || u.contacts?.find((c) => c.type === 'PHONE' && c.isPrimary)?.value || u.contacts?.find((c) => c.type === 'PHONE')?.value,
                    country: u.country,
                    type: u.role === 'SUPER_ADMIN' ? 'Org Admin' : u.role === 'ADMIN' ? 'Agent' : 'User',
                    status: (u.emailVerified || u.phoneVerified) ? 'Active' : 'Disabled',
                    walletBalance: 0,
                    currency: 'USD',
                    risk: 'Low',
                    mfaEnabled: u.twoFactorEnabled,
                    passkeys: 0,
                    createdAt: new Date(u.createdAt).getTime(),
                    lastLoginAt: u.sessions && u.sessions[0] ? new Date(u.sessions[0].createdAt).getTime() : undefined,
                    lastPasswordChangeAt: u.auditLogs?.find((l) => l.action === 'password_change')?.createdAt
                        ? new Date(u.auditLogs.find((l) => l.action === 'password_change')!.createdAt).getTime()
                        : undefined,
                    linkedGoogle: u.credentials?.some((c) => c.providerType === 'google'),
                    linkedApple: u.credentials?.some((c) => c.providerType === 'apple'),
                    orgs: u.memberships?.map((m) => ({ id: m.organization.id, name: m.organization.name, role: m.role })) || [],
                    notes: ''
                };
                setUser(rec);
            })
            .catch((err: unknown) => {
                console.error(err);
                showNotification({ type: "error", title: "Load Failed", message: "Failed to load user details." });
            })
            .finally(() => setLoading(false));
    }, [userId]);

    const [actionOpen, setActionOpen] = useState(false);
    const [step, setStep] = useState<0 | 1>(0);
    const [kind, setKind] = useState<ActionKind | null>(null);
    const [reason, setReason] = useState("");
    const [adminPassword, setAdminPassword] = useState("");

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
        setKind(k);
        setStep(0);
        setReason("");
        setAdminPassword("");
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
        return "Force sign out";
    };

    const applyAction = async () => {
        if (!user || !kind) return;
        if (adminPassword !== "superadmin-secure-pw") {
            showNotification({ type: "error", title: "Auth Failed", message: "Invalid admin password." });
            return;
        }

        try {
            if (kind === 'LOCK') {
                await api(`/users/${user.id}`, { method: 'PATCH', body: JSON.stringify({ emailVerified: false }) });
                showNotification({ type: "success", title: "Account Locked", message: "User account has been locked." });
            } else if (kind === 'UNLOCK') {
                await api(`/users/${user.id}`, { method: 'PATCH', body: JSON.stringify({ emailVerified: true }) });
                showNotification({ type: "success", title: "Account Unlocked", message: "User account has been unlocked." });
            } else if (kind === 'FORCE_SIGNOUT') {
                await api(`/admin/users/${user.id}/revoke-sessions`, { method: 'POST' });
                showNotification({ type: "success", title: "Sessions Revoked", message: "All user sessions have been ended." });
            }
            closeAction();
        } catch (e: any) {
            showNotification({ type: "error", title: "Action Failed", message: e.message || "Operation failed." });
        }
    };

    if (loading) return <Box sx={{ p: 4 }}>Loading...</Box>;
    if (!user) return <Box sx={{ p: 4 }}><Typography>User not found</Typography></Box>;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
                <Card sx={{ borderRadius: 6 }}>
                    <CardContent className="p-5 md:p-7">
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
                            <Stack direction="row" spacing={1.2} alignItems="center">
                                <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(EVZONE.green, 0.16), color: theme.palette.text.primary, borderRadius: 18 }}>
                                    <UserIcon size={18} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5">{user.name}</Typography>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{formatUserId(user.id)} • {user.type}</Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={1.2}>
                                <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon size={18} />} onClick={() => navigate('/admin/users')}>{t("auth.common.back")}<//Button>
                                <Button variant="contained" sx={orangeContained} onClick={() => openAction(user.status === "Locked" ? "UNLOCK" : "LOCK")}>
                                    {user.status === "Locked" ? "Unlock" : "Lock"}
                                </Button>
                            </Stack>
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
                                    <InfoRow label="Country" value={user.country || "-"} icon={<GlobeIcon size={18} />} />
                                    <InfoRow label="Last login" value={timeAgo(user.lastLoginAt)} icon={<ClipboardIcon size={18} />} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Stack>

            <Dialog open={actionOpen} onClose={closeAction} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 6 } }}>
                <DialogTitle sx={{ fontWeight: 950 }}>{kind ? actionTitle(kind) : "Action"}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {step === 0 && (
                            <>
                                <TextField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth multiline minRows={3} />
                                <Button variant="contained" sx={orangeContained} onClick={() => setStep(1)}>{t("auth.common.continue")}<//Button>
                            </>
                        )}
                        {step === 1 && (
                            <>
                                <Typography variant="body2">Confirm admin password to proceed.</Typography>
                                <TextField value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} type="password" fullWidth />
                                <Button variant="contained" sx={orangeContained} onClick={applyAction}>Confirm</Button>
                            </>
                        )}
                    </Stack>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
