import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Pagination from '@/components/ui/Pagination';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Grid,
    Button,
    TextField,
    InputAdornment,
    MenuItem,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    useTheme,
    Paper,
    Divider,
    Alert,
    CircularProgress,
    Snackbar
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Wallet as WalletIcon,
    Search as SearchIcon,
    ArrowUpRight,
    ArrowDownLeft,
    ShieldAlert as ShieldIcon,
    Lock as LockIcon,
    Unlock as UnlockIcon,
    Activity,
    CreditCard,
    DollarSign,
    MoreHorizontal,
    RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from "@/utils/api";
import { formatWalletId } from "@/utils/format";
import { exportToCsv } from "@/utils/export";

const EVZONE = { green: "#03cd8c", orange: "#f77f00", red: "#d32f2f" } as const;

type WalletStatus = "Active" | "Frozen" | "Suspended";
type Currency = "UGX" | "USD" | "KES";

interface WalletRow {
    id: string;
    ownerName: string;
    ownerEmail: string;
    balance: number;
    currency: Currency;
    status: WalletStatus;
    lastTx: number;
    riskScore: "Low" | "Medium" | "High";
}

interface WalletStats {
    totalUGX: number;
    totalUSD: number;
    frozenCount: number;
}

export default function WalletsList() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [q, setQ] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState<WalletStatus | "All">("All");

    const [wallets, setWallets] = useState<WalletRow[]>([]);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState<WalletStats>({ totalUGX: 0, totalUSD: 0, frozenCount: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snack, setSnack] = useState({ open: false, msg: "" });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [walletData, statsData] = await Promise.all([
                api<{ wallets: WalletRow[]; total: number }>(`/admin/wallets?skip=${page * rowsPerPage}&take=${rowsPerPage}&query=${q}&status=${statusFilter}`),
                api<WalletStats>('/admin/wallets/stats')
            ]);
            setWallets(walletData.wallets);
            setTotal(walletData.total);
            setStats(statsData);
        } catch (err: unknown) {
            setError((err as Error).message || "Failed to fetch wallets");
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, q, statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleWalletStatus = async (id: string, currentStatus: WalletStatus) => {
        const action = currentStatus === 'Active' ? 'FREEZE' : 'UNFREEZE';
        try {
            await api(`/admin/wallets/${id}/status`, {
                method: 'POST',
                body: JSON.stringify({ action })
            });
            setSnack({ open: true, msg: `Wallet ${action.toLowerCase()}d successfully` });
            fetchData();
        } catch (err: unknown) {
            setSnack({ open: true, msg: (err as Error).message || "Failed to update wallet status" });
        }
    };

    const handleExport = () => {
        if (!wallets.length) return;
        exportToCsv(wallets, `wallets-${Date.now()}.csv`, {
            id: 'Wallet ID',
            ownerName: 'Owner Name',
            ownerEmail: 'Owner Email',
            balance: 'Balance',
            currency: 'Currency',
            status: 'Status',
            lastTx: 'Last Transaction',
            riskScore: 'Risk Score'
        });
        setSnack({ open: true, msg: "Wallets exported successfully" });
    };

    const statusColor = (s: WalletStatus) => {
        if (s === "Active") return EVZONE.green;
        if (s === "Frozen") return EVZONE.red;
        return EVZONE.orange;
    };

    const riskColor = (r: string) => {
        const score = r?.toLowerCase();
        if (score === "high") return EVZONE.red;
        if (score === "medium") return EVZONE.orange;
        return EVZONE.green;
    };

    const StatusChip = ({ status }: { status: WalletStatus }) => {
        const color = statusColor(status);
        return (
            <Chip
                label={status}
                size="small"
                sx={{
                    bgcolor: alpha(color, 0.1),
                    color: color,
                    fontWeight: 700,
                    border: `1px solid ${alpha(color, 0.2)}`
                }}
            />
        );
    };

    const formatCurrency = (amount: number, currency: Currency) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };

    interface StatCardProps {
        title: string;
        value: string | number;
        icon: React.ReactNode;
        color: string;
        subtext?: string;
    }

    const StatCard = ({ title, value, icon, color, subtext }: StatCardProps) => (
        <Paper sx={{
            p: 3,
            borderRadius: '16px',
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(12px)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>{title}</Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary' }}>{value}</Typography>
                </Box>
                <Box sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: alpha(color, 0.1),
                    color: color
                }}>
                    {icon}
                </Box>
            </Stack>
            {subtext && (
                <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
                    {subtext}
                </Typography>
            )}
        </Paper>
    );

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} gutterBottom>Wallets Management</Typography>
                    <Typography variant="body1" color="text.secondary">
                        View total liquidity, manage frozen accounts, and audit wallet balances.
                    </Typography>
                </Box>
                <IconButton onClick={fetchData} disabled={loading} color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </IconButton>
            </Box>

            {/* Error State */}
            {error && (
                <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Stats Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title="Total Liquidity (UGX)"
                        value={formatCurrency(stats.totalUGX, 'UGX')}
                        icon={<WalletIcon size={24} />}
                        color={EVZONE.green}
                        subtext="Across all active & frozen wallets"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title="Total Liquidity (USD)"
                        value={formatCurrency(stats.totalUSD, 'USD')}
                        icon={<DollarSign size={24} />}
                        color={theme.palette.primary.main}
                        subtext="Held in USD wallets"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title="Frozen Wallets"
                        value={stats.frozenCount}
                        icon={<LockIcon size={24} />}
                        color={EVZONE.red}
                        subtext="Requires admin review"
                    />
                </Grid>
            </Grid>

            {/* Wallet List */}
            <Paper sx={{
                borderRadius: '16px',
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(20px)'
            }}>
                {/* Filters */}
                <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder="Search by name, email, or wallet ID..."
                                value={q}
                                onChange={(e) => {
                                    setQ(e.target.value);
                                    setPage(0);
                                }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon size={18} /></InputAdornment>,
                                    sx: { borderRadius: '10px' }
                                }}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                select
                                fullWidth
                                label="Status"
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value as WalletStatus | "All");
                                    setPage(0);
                                }}
                                size="small"
                                InputProps={{ sx: { borderRadius: '10px' } }}
                            >
                                <MenuItem value="All">All Statuses</MenuItem>
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Frozen">Frozen</MenuItem>
                                <MenuItem value="Suspended">Suspended</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Button variant="outlined" startIcon={<Activity size={18} />} fullWidth sx={{ borderRadius: '10px', height: 40, borderColor: theme.palette.divider, color: 'text.primary' }} onClick={handleExport}>
                                Export CSV
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {/* Data Table */}
                <TableContainer sx={{ minHeight: 400, position: 'relative' }}>
                    {loading && (
                        <Box sx={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: alpha(theme.palette.background.paper, 0.4),
                            zIndex: 1
                        }}>
                            <CircularProgress size={40} thickness={4} />
                        </Box>
                    )}
                    <Table>
                        <TableHead sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Wallet ID</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Balance</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Risk</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {wallets.map((w) => (
                                <TableRow key={w.id} hover>
                                    <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.8rem' }}>{formatWalletId(w.id)}</TableCell>
                                    <TableCell>
                                        <Stack>
                                            <Typography variant="subtitle2" fontWeight={600}>{w.ownerName}</Typography>
                                            <Typography variant="caption" color="text.secondary">{w.ownerEmail}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={700}>
                                            {formatCurrency(w.balance, w.currency)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip status={w.status} />
                                    </TableCell>
                                    <TableCell>
                                        <ArrowUpRight size={16} color={riskColor(w.riskScore)} style={{ display: 'inline', marginRight: 4 }} />
                                        <Typography variant="caption" fontWeight={600} color={riskColor(w.riskScore)}>
                                            {w.riskScore}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                            <IconButton size="small" onClick={() => navigate(`/admin/transactions?wallet=${w.id}`)}>
                                                <Activity size={18} />
                                            </IconButton>
                                            {w.status === 'Active' ? (
                                                <IconButton size="small" color="error" onClick={() => toggleWalletStatus(w.id, w.status)}>
                                                    <LockIcon size={18} />
                                                </IconButton>
                                            ) : (
                                                <IconButton size="small" color="success" onClick={() => toggleWalletStatus(w.id, w.status)}>
                                                    <UnlockIcon size={18} />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && wallets.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No wallets found matching your filters.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
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
                </Box>
            </Paper>

            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack({ ...snack, open: false })}
                message={snack.msg}
            />
        </Box>
    );
}
