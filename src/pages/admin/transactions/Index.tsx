import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Pagination from "../../../components/common/Pagination";
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
    Avatar,
    CircularProgress,
    Alert,
    Snackbar
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
    MoreHorizontal,
    RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from "../../../utils/api";
import { formatTransactionId } from "../../../utils/format";
import { exportToCsv } from "../../../utils/export";

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

export default function TransactionsList() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [q, setQ] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [typeFilter, setTypeFilter] = useState<TxType | "All">("All");
    const [statusFilter, setStatusFilter] = useState<TxStatus | "All">("All");

    const [txs, setTxs] = useState<Transaction[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snack, setSnack] = useState({ open: false, msg: "" });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api<{ txs: Transaction[]; total: number }>(`/admin/transactions?skip=${page * rowsPerPage}&take=${rowsPerPage}&query=${q}&type=${typeFilter}&status=${statusFilter}`);
            setTxs(data.txs);
            setTotal(data.total);
        } catch (err: unknown) {
            setError((err as Error).message || "Failed to fetch transactions");
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, q, typeFilter, statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleExport = () => {
        if (!txs.length) return;
        // Flatten user object for CSV
        const exportData = txs.map(tx => ({
            ...tx,
            userName: tx.user.name,
            userEmail: tx.user.email,
            date: new Date(tx.date).toLocaleString()
        }));

        exportToCsv(exportData, `transactions-${Date.now()}.csv`, {
            id: 'Transaction ID',
            userName: 'User Name',
            userEmail: 'User Email',
            type: 'Type',
            amount: 'Amount',
            currency: 'Currency',
            status: 'Status',
            date: 'Date',
            description: 'Description'
        });
        setSnack({ open: true, msg: "Transactions exported successfully" });
    };

    const statusConfig = (s: TxStatus) => {
        if (s === "Success") return { color: EVZONE.green, icon: <CheckCircle size={14} /> };
        if (s === "Failed") return { color: EVZONE.red, icon: <XCircle size={14} /> };
        return { color: EVZONE.orange, icon: <Clock size={14} /> };
    };

    const typeConfig = (t: TxType) => {
        const type = t?.toLowerCase();
        if (type === 'deposit' || type === 'refund') return { bg: alpha(EVZONE.green, 0.1), color: EVZONE.green, icon: <ArrowDownLeft size={16} /> };
        if (type === 'withdrawal' || type === 'payment') return { bg: alpha(EVZONE.orange, 0.1), color: EVZONE.orange, icon: <ArrowUpRight size={16} /> };
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
                <Stack direction="row" spacing={2}>
                    <IconButton onClick={fetchData} disabled={loading} color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </IconButton>
                    <Button variant="contained" startIcon={<DownloadIcon size={18} />} sx={{
                        bgcolor: theme.palette.text.primary,
                        color: theme.palette.background.paper,
                        borderRadius: '10px',
                        px: 3
                    }} onClick={handleExport}>
                        Export Report
                    </Button>
                </Stack>
            </Box>

            {/* Error State */}
            {error && (
                <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

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
                        <Grid item xs={6} md={2}>
                            <TextField
                                select
                                fullWidth
                                label="Type"
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value as TxType | "All");
                                    setPage(0);
                                }}
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
                                onChange={(e) => {
                                    setStatusFilter(e.target.value as TxStatus | "All");
                                    setPage(0);
                                }}
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
                            {txs.map((t) => {
                                const status = statusConfig(t.status);
                                const type = typeConfig(t.type);
                                return (
                                    <TableRow key={t.id} hover>
                                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>{formatTransactionId(t.id)}</TableCell>
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

                            {!loading && txs.length === 0 && (
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
