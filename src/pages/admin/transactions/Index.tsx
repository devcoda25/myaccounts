import React, { useState, useMemo } from 'react';
import {
    Box,
    Card,
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
    Avatar
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Search as SearchIcon,
    Filter as FilterIcon,
    Download as DownloadIcon,
    CheckCircle,
    XCircle,
    Clock,
    MoreHorizontal
} from 'lucide-react';

const EVZONE = { green: "#03cd8c", orange: "#f77f00", red: "#d32f2f", blue: "#2196f3" } as const;

type TxType = "Deposit" | "Withdrawal" | "Transfer" | "Payment" | "Refund";
type TxStatus = "Success" | "Failed" | "Pending";
type Currency = "UGX" | "USD";

interface Transaction {
    id: string;
    user: { name: string; email: string };
    type: TxType;
    amount: number;
    currency: Currency;
    status: TxStatus;
    date: number;
    description: string;
}

// Mock Data
function mkTransactions(): Transaction[] {
    const now = Date.now();
    return [
        { id: "TX-998811", user: { name: "Ronald Isabirye", email: "ronald@example.com" }, type: "Deposit", amount: 500000, currency: "UGX", status: "Success", date: now - 1000 * 60 * 10, description: "Mobile Money Deposit" },
        { id: "TX-998812", user: { name: "Ronald Isabirye", email: "ronald@example.com" }, type: "Payment", amount: -25000, currency: "UGX", status: "Success", date: now - 1000 * 60 * 30, description: "EV Charging - Station 4" },
        { id: "TX-998813", user: { name: "Mary I. Naiga", email: "mary@example.com" }, type: "Withdrawal", amount: -100000, currency: "UGX", status: "Pending", date: now - 1000 * 60 * 60 * 2, description: "Withdraw to Airtel Money" },
        { id: "TX-998814", user: { name: "Mark Kasibante", email: "mark@example.com" }, type: "Payment", amount: -50000, currency: "UGX", status: "Failed", date: now - 1000 * 60 * 60 * 5, description: "Insufficient Funds" },
        { id: "TX-998815", user: { name: "EV Operator Ltd", email: "finance@evop.com" }, type: "Transfer", amount: 250000, currency: "UGX", status: "Success", date: now - 1000 * 60 * 60 * 24, description: "Settlement from Aggregator" },
    ];
}

export default function TransactionsList() {
    const theme = useTheme();
    const [q, setQ] = useState("");
    const [typeFilter, setTypeFilter] = useState<TxType | "All">("All");
    const [statusFilter, setStatusFilter] = useState<TxStatus | "All">("All");
    const [txs] = useState<Transaction[]>(mkTransactions);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        return txs.filter(t => {
            if (typeFilter !== "All" && t.type !== typeFilter) return false;
            if (statusFilter !== "All" && t.status !== statusFilter) return false;
            if (!s) return true;
            return (
                t.id.toLowerCase().includes(s) ||
                t.user.name.toLowerCase().includes(s) ||
                t.user.email.toLowerCase().includes(s)
            );
        });
    }, [txs, q, typeFilter, statusFilter]);

    const statusConfig = (s: TxStatus) => {
        if (s === "Success") return { color: EVZONE.green, icon: <CheckCircle size={14} /> };
        if (s === "Failed") return { color: EVZONE.red, icon: <XCircle size={14} /> };
        return { color: EVZONE.orange, icon: <Clock size={14} /> };
    };

    const typeConfig = (t: TxType) => {
        if (t === 'Deposit' || t === 'Refund') return { bg: alpha(EVZONE.green, 0.1), color: EVZONE.green, icon: <ArrowDownLeft size={16} /> };
        if (t === 'Withdrawal' || t === 'Payment') return { bg: alpha(EVZONE.orange, 0.1), color: EVZONE.orange, icon: <ArrowUpRight size={16} /> };
        return { bg: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, icon: <ArrowUpRight size={16} /> }; // Transfer
    };

    const formatCurrency = (amount: number, currency: Currency) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Math.abs(amount));
    };

    const formatDate = (ts: number) => {
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(ts));
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} gutterBottom>Transactions Registry</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Comprehensive log of all platform financial movements.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<DownloadIcon size={18} />} sx={{
                    bgcolor: theme.palette.text.primary,
                    color: theme.palette.background.paper,
                    borderRadius: '10px',
                    px: 3
                }}>
                    Export Report
                </Button>
            </Box>

            {/* Main Content */}
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
                        <Grid item xs={12} md={5}>
                            <TextField
                                fullWidth
                                placeholder="Search tx ID, user..."
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon size={18} /></InputAdornment>,
                                    sx: { borderRadius: '10px' }
                                }}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                select
                                fullWidth
                                label="Type"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value as any)}
                                size="small"
                                InputProps={{ sx: { borderRadius: '10px' } }}
                            >
                                <MenuItem value="All">All Types</MenuItem>
                                <MenuItem value="Deposit">Deposit</MenuItem>
                                <MenuItem value="Withdrawal">Withdrawal</MenuItem>
                                <MenuItem value="Payment">Payment</MenuItem>
                                <MenuItem value="Transfer">Transfer</MenuItem>
                                <MenuItem value="Refund">Refund</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={6} md={2}>
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
                                <MenuItem value="Success">Success</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Failed">Failed</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </Box>

                {/* Table */}
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Transaction ID</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((t) => {
                                const status = statusConfig(t.status);
                                const type = typeConfig(t.type);
                                return (
                                    <TableRow key={t.id} hover>
                                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{t.id}</TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                                                    {t.user.name.charAt(0)}
                                                </Avatar>
                                                <Stack>
                                                    <Typography variant="subtitle2" fontWeight={600}>{t.user.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{t.user.email}</Typography>
                                                </Stack>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={type.icon}
                                                label={t.type}
                                                size="small"
                                                sx={{ bgcolor: type.bg, color: type.color, fontWeight: 700, border: 'none' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight={700} sx={{
                                                color: t.amount > 0 ? EVZONE.green : 'text.primary'
                                            }}>
                                                {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount, t.currency)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={t.status}
                                                icon={status.icon}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(status.color, 0.1),
                                                    color: status.color,
                                                    fontWeight: 700,
                                                    border: `1px solid ${alpha(status.color, 0.2)}`
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(t.date)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small">
                                                <MoreHorizontal size={18} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No transactions found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}
