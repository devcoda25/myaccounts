import React, { useState, useMemo } from 'react';
import Pagination from "../../../components/common/Pagination";
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
    Alert
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
    MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

// Mock Data
function mkWallets(): WalletRow[] {
    const now = Date.now();
    return [
        { id: "w_8823_x99", ownerName: "Ronald Isabirye", ownerEmail: "ronald@example.com", balance: 1250000, currency: "UGX", status: "Active", lastTx: now - 1000 * 60 * 5, riskScore: "Low" },
        { id: "w_1102_a22", ownerName: "Mary I. Naiga", ownerEmail: "mary@example.com", balance: 45000, currency: "UGX", status: "Active", lastTx: now - 1000 * 60 * 60 * 2, riskScore: "Low" },
        { id: "w_9912_b33", ownerName: "Mark Kasibante", ownerEmail: "mark@example.com", balance: 0, currency: "UGX", status: "Frozen", lastTx: now - 1000 * 60 * 60 * 24 * 5, riskScore: "High" },
        { id: "w_7721_c44", ownerName: "EV Operator Ltd", ownerEmail: "finance@evop.com", balance: 15400.50, currency: "USD", status: "Active", lastTx: now - 1000 * 60 * 30, riskScore: "Medium" },
        { id: "w_3321_d55", ownerName: "John Doe", ownerEmail: "john@example.com", balance: 200, currency: "UGX", status: "Suspended", lastTx: now - 1000 * 60 * 60 * 24 * 10, riskScore: "Medium" },
    ];
}

export default function WalletsList() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [q, setQ] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState<WalletStatus | "All">("All");
    const [wallets, setWallets] = useState<WalletRow[]>(mkWallets);

    const stats = useMemo(() => {
        const totalUGX = wallets.filter(w => w.currency === 'UGX').reduce((acc, w) => acc + w.balance, 0);
        const totalUSD = wallets.filter(w => w.currency === 'USD').reduce((acc, w) => acc + w.balance, 0);
        const frozenCount = wallets.filter(w => w.status === 'Frozen').length;
        return { totalUGX, totalUSD, frozenCount };
    }, [wallets]);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        return wallets.filter(w => {
            if (statusFilter !== "All" && w.status !== statusFilter) return false;
            if (!s) return true;
            return (
                w.ownerName.toLowerCase().includes(s) ||
                w.ownerEmail.toLowerCase().includes(s) ||
                w.id.toLowerCase().includes(s)
            );
        });
    }, [wallets, q, statusFilter]);

    const statusColor = (s: WalletStatus) => {
        if (s === "Active") return EVZONE.green;
        if (s === "Frozen") return EVZONE.red;
        return EVZONE.orange;
    };

    const riskColor = (r: string) => {
        if (r === "High") return EVZONE.red;
        if (r === "Medium") return EVZONE.orange;
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

    const StatCard = ({ title, value, icon, color, subtext }: any) => (
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
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800} gutterBottom>Wallets Management</Typography>
                <Typography variant="body1" color="text.secondary">
                    View total liquidity, manage frozen accounts, and audit wallet balances.
                </Typography>
            </Box>

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
                                onChange={(e) => setQ(e.target.value)}
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
                                onChange={(e) => setStatusFilter(e.target.value as any)}
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
                            <Button variant="outlined" startIcon={<Activity size={18} />} fullWidth sx={{ borderRadius: '10px', height: 40, borderColor: theme.palette.divider, color: 'text.primary' }}>
                                Export CSV
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {/* Data Table */}
                <TableContainer>
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
                            {filtered
                                .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                                .map((w) => (
                                    <TableRow key={w.id} hover>
                                        <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{w.id}</TableCell>
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
                                                    <IconButton size="small" color="error">
                                                        <LockIcon size={18} />
                                                    </IconButton>
                                                ) : (
                                                    <IconButton size="small" color="success">
                                                        <UnlockIcon size={18} />
                                                    </IconButton>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {filtered.length === 0 && (
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
                        count={filtered.length}
                        rowsPerPage={rowsPerPage}
                        onPageChange={setPage}
                        onRowsPerPageChange={(n) => {
                            setRowsPerPage(n);
                            setPage(0);
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
}
