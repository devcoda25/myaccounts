import React, { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    IconButton,
    LinearProgress,
    Paper,
    Snackbar,
    Stack,
    Typography,
    useTheme
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import {
    ShieldCheck as ShieldIcon,
    Wallet as WalletIcon,
    Bell as BellIcon,
    Plug as PlugIcon,
    ArrowRight as ArrowRightIcon,
    LayoutDashboard,
    Zap,
    Users,
    Activity,
    Lock,
    Settings,
    ChevronRight,
    ArrowUpRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Types
type Health = "Operational" | "Degraded" | "Maintenance";

type AuditEvent = {
    id: string;
    at: number;
    actor: string;
    action: string;
    target: string;
    ip: string;
    result: "Success" | "Failed";
    risk: "Low" | "Medium" | "High";
};

const EVZONE = { green: "#03cd8c", orange: "#f77f00" } as const;

// Helpers
function timeAgo(ts: number) {
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60000);
    if (min < 1) return "Just now";
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hr ago`;
    const d = Math.floor(hr / 24);
    return `${d} day${d === 1 ? "" : "s"} ago`;
}

function healthBadge(health: Health) {
    if (health === "Operational") return { tone: EVZONE.green, label: "Operational" };
    return { tone: EVZONE.orange, label: health };
}

function mkEvents(): AuditEvent[] {
    const now = Date.now();
    return [
        { id: "A-1001", at: now - 1000 * 60 * 3, actor: "admin@evzone.com", action: "Revoke API key", target: "key_01", ip: "197.157.x.x", result: "Success", risk: "Medium" },
        { id: "A-1002", at: now - 1000 * 60 * 15, actor: "secops@evzone.com", action: "Lock account", target: "user: john@example.com", ip: "102.90.x.x", result: "Success", risk: "High" },
        { id: "A-1003", at: now - 1000 * 60 * 40, actor: "admin@evzone.com", action: "Change org role", target: "org_004 member", ip: "41.90.x.x", result: "Success", risk: "Low" },
        { id: "A-1004", at: now - 1000 * 60 * 80, actor: "admin@evzone.com", action: "Sign-in attempt", target: "admin@evzone.com", ip: "197.157.x.x", result: "Failed", risk: "Medium" },
    ];
}

export default function AdminDashboard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>({ open: false, severity: "info", msg: "" });
    const [events] = useState<AuditEvent[]>(() => mkEvents());
    const isDark = theme.palette.mode === 'dark';

    const services = useMemo(() => {
        const now = Date.now();
        return [
            { key: "auth", name: "Auth", icon: <ShieldIcon size={18} />, health: "Operational" as Health, updatedAt: now - 1000 * 60 * 2 },
            { key: "wallet", name: "Wallet", icon: <WalletIcon size={18} />, health: "Degraded" as Health, updatedAt: now - 1000 * 60 * 5 },
            { key: "notifications", name: "Notifications", icon: <BellIcon size={18} />, health: "Operational" as Health, updatedAt: now - 1000 * 60 * 4 },
            { key: "integrations", name: "Integrations", icon: <PlugIcon size={18} />, health: "Operational" as Health, updatedAt: now - 1000 * 60 * 6 },
        ];
    }, []);

    const containerVars = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVars = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    const StatsCard = ({ title, value, hint, icon, color }: { title: string; value: string; hint: string; icon: React.ReactNode; color: string }) => (
        <Paper sx={{
            p: 3,
            borderRadius: '16px',
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(12px)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
                borderColor: alpha(color, 0.5)
            }
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{
                    width: 44, height: 44,
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: alpha(color, 0.1),
                    border: `1px solid ${alpha(color, 0.2)}`,
                    color: color
                }}>
                    {icon}
                </Box>
                {hint.includes("Review") && <Chip size="small" label="Action" color="warning" sx={{ height: 24 }} />}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5, color: 'text.primary' }}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {title}
            </Typography>
            <Typography variant="caption" sx={{ color: color, mt: 1, display: 'block', fontWeight: 600 }}>
                {hint}
            </Typography>
        </Paper>
    );

    return (
        <Box sx={{ minHeight: '100%', pb: { xs: 12, md: 8 } }}>
            <motion.div variants={containerVars} initial="hidden" animate="show">

                {/* Header Section */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <motion.div variants={itemVars}>
                        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5, color: 'text.primary' }}>
                            Admin Dashboard
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            System overview and security posture.
                        </Typography>
                    </motion.div>

                    <motion.div variants={itemVars} style={{ display: 'flex', gap: 12 }}>
                        <Button variant="outlined" startIcon={<BellIcon size={18} />} sx={{ borderRadius: '10px', color: 'text.primary', borderColor: 'divider' }}>
                            Alerts (3)
                        </Button>
                    </motion.div>
                </Box>

                <Grid container spacing={3}>
                    {/* Left Main Column */}
                    <Grid item xs={12} lg={8}>

                        {/* Hero Card - System Status */}
                        <motion.div variants={itemVars}>
                            <Paper sx={{
                                p: 0,
                                mb: 3,
                                position: 'relative',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                background: `linear-gradient(135deg, ${isDark ? '#0B1A17' : '#FFFFFF'} 0%, ${isDark ? '#07110F' : '#F4FFFB'} 100%)`,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.shadows[4]
                            }}>
                                <Box sx={{
                                    position: 'absolute', top: -80, right: -20, width: 250, height: 250,
                                    borderRadius: '50%', background: `radial-gradient(circle, ${alpha(EVZONE.green, 0.15)} 0%, transparent 70%)`, filter: 'blur(50px)'
                                }} />

                                <Box sx={{ p: { xs: 3, md: 4 }, position: 'relative', zIndex: 2 }}>
                                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-start' }} spacing={3}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Activity size={16} /> System Status
                                            </Typography>
                                            <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, letterSpacing: '-0.02em', color: 'text.primary' }}>
                                                Operational
                                            </Typography>
                                            <Chip label="All systems nominal" size="small" sx={{
                                                bgcolor: alpha(EVZONE.green, 0.1),
                                                color: EVZONE.green,
                                                fontWeight: 600,
                                                borderRadius: '8px',
                                                border: `1px solid ${alpha(EVZONE.green, 0.2)}`
                                            }} />
                                        </Box>

                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="h4" sx={{ fontWeight: 800 }}>99.9%</Typography>
                                                <Typography variant="caption" color="text.secondary">Uptime (30d)</Typography>
                                            </Box>
                                            <Divider orientation="vertical" flexItem />
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="h4" sx={{ fontWeight: 800 }}>12ms</Typography>
                                                <Typography variant="caption" color="text.secondary">Avg Latency</Typography>
                                            </Box>
                                        </Stack>
                                    </Stack>

                                    <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                                        <Button variant="contained" size="large" onClick={() => navigate('/admin/users')} sx={{
                                            borderRadius: '12px',
                                            px: 3,
                                            bgcolor: EVZONE.green,
                                            color: '#fff',
                                            fontWeight: 700,
                                            boxShadow: `0 8px 16px ${alpha(EVZONE.green, 0.25)}`,
                                            '&:hover': { bgcolor: alpha(EVZONE.green, 0.9) }
                                        }}>
                                            Manage Users
                                        </Button>
                                        <Button variant="outlined" size="large" onClick={() => navigate('/admin/audit')} sx={{
                                            borderRadius: '12px',
                                            px: 3,
                                            borderColor: alpha(theme.palette.text.primary, 0.2),
                                            color: 'text.primary',
                                            '&:hover': { borderColor: theme.palette.text.primary, bgcolor: alpha(theme.palette.text.primary, 0.05) }
                                        }}>
                                            View Logs
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>
                        </motion.div>

                        {/* Quick Stats Grid */}
                        <motion.div variants={itemVars}>
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                <Grid item xs={12} sm={6} lg={3}>
                                    <StatsCard title="Active Users" value="1,240" hint="+12% this week" icon={<Users size={20} />} color={EVZONE.green} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={3}>
                                    <StatsCard title="Security Events" value="3" hint="Requires Review" icon={<ShieldIcon size={20} />} color="#B42318" />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={3}>
                                    <StatsCard title="Wallet Disputes" value="7" hint="Open Cases" icon={<WalletIcon size={20} />} color={EVZONE.orange} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={3}>
                                    <StatsCard title="Admin Sessions" value="4" hint="Online Now" icon={<Lock size={20} />} color={theme.palette.primary.main} />
                                </Grid>
                            </Grid>
                        </motion.div>

                    </Grid>

                    {/* Right Column: Health & Activity */}
                    <Grid item xs={12} lg={4}>

                        {/* Services Health */}
                        <motion.div variants={itemVars}>
                            <Paper sx={{
                                p: 3,
                                mb: 3,
                                borderRadius: '16px',
                                bgcolor: alpha(theme.palette.background.paper, 0.6),
                                border: `1px solid ${theme.palette.divider}`,
                                backdropFilter: 'blur(12px)'
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6" fontWeight={600} color="text.primary">Service Health</Typography>
                                    <IconButton size="small"><ArrowUpRight size={16} /></IconButton>
                                </Box>

                                <Stack spacing={2}>
                                    {services.map((s) => {
                                        const badge = healthBadge(s.health);
                                        return (
                                            <Box key={s.key} sx={{
                                                p: 1.5,
                                                borderRadius: '12px',
                                                bgcolor: alpha(theme.palette.background.paper, 0.4),
                                                border: `1px solid ${alpha(theme.palette.divider, 0.8)}`
                                            }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Box sx={{ color: badge.tone }}>{s.icon}</Box>
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight={600}>{s.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">Updated {timeAgo(s.updatedAt)}</Typography>
                                                        </Box>
                                                    </Stack>
                                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: badge.tone, boxShadow: `0 0 8px ${badge.tone}` }} />
                                                </Stack>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            </Paper>
                        </motion.div>

                        {/* Recent Activity List */}
                        <motion.div variants={itemVars}>
                            <Paper sx={{
                                p: 3,
                                borderRadius: '16px',
                                bgcolor: alpha(theme.palette.background.paper, 0.6),
                                border: `1px solid ${theme.palette.divider}`,
                                backdropFilter: 'blur(12px)'
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6" fontWeight={600} color="text.primary">Audit Log</Typography>
                                    <IconButton size="small" onClick={() => navigate('/admin/audit')}><ArrowRightIcon size={16} /></IconButton>
                                </Box>

                                <Stack spacing={3}>
                                    {events.map((e) => (
                                        <Box key={e.id} sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{
                                                mt: 0.5,
                                                width: 8, height: 8, borderRadius: '50%',
                                                bgcolor: e.risk === 'High' ? '#B42318' : e.risk === 'Medium' ? EVZONE.orange : EVZONE.green
                                            }} />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                                                    {e.action}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {e.actor} • {timeAgo(e.at)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', bgcolor: alpha(theme.palette.divider, 0.1), px: 0.5, borderRadius: 0.5 }}>
                                                    {e.target}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Stack>

                                <Divider sx={{ my: 3 }} />
                                <Button fullWidth endIcon={<ChevronRight size={16} />} onClick={() => navigate('/admin/audit')} sx={{
                                    justifyContent: 'space-between',
                                    color: 'text.secondary',
                                    textTransform: 'none',
                                    '&:hover': { color: 'text.primary', bgcolor: 'transparent' }
                                }}>
                                    View all activity
                                </Button>
                            </Paper>
                        </motion.div>

                    </Grid>
                </Grid>
            </motion.div>

            {/* Shared Snackbar */}
            <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={isDark ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
