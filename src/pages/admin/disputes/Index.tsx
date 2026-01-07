import React, { useState, useEffect, useCallback } from 'react';
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
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Search as SearchIcon,
    Filter as FilterIcon,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    MoreHorizontal,
    RefreshCw,
    Gavel,
    FileText,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from "../../../utils/api";
import { formatTransactionId } from "../../../utils/format";

const EVZONE = { green: "#03cd8c", orange: "#f77f00", red: "#d32f2f", blue: "#2196f3" } as const;

type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "WON" | "LOST" | "CLOSED";

interface DisputeRow {
    id: string;
    wallet: { id: string; user: { email: string; firstName: string; otherNames: string } };
    amount: number;
    currency: string;
    reason: string;
    status: DisputeStatus;
    createdAt: string;
    reference: string;
    txnId?: string;
}

export default function AdminDisputesList() {
    const theme = useTheme();
    // const navigate = useNavigate(); // Unused
    const [q, setQ] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState<DisputeStatus | "All">("All");

    const [disputes, setDisputes] = useState<DisputeRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snack, setSnack] = useState({ open: false, msg: "" });

    // Review Dialog
    const [reviewOpen, setReviewOpen] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState<DisputeRow | null>(null);
    const [decisionNote, setDecisionNote] = useState("");
    const [processing, setProcessing] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.get<{ disputes: DisputeRow[]; total: number }>(`/admin/disputes?skip=${page * rowsPerPage}&take=${rowsPerPage}&query=${q}&status=${statusFilter}`);
            setDisputes(data.disputes);
            setTotal(data.total);
        } catch (err: unknown) {
            console.error(err);
            // Fallback for demo if backend not ready
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes("404")) {
                setError("Backend endpoint not found. Ensure server is running and updated.");
            } else {
                setError(msg || "Failed to fetch disputes");
            }
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, q, statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleResolve = async (decision: 'WON' | 'LOST') => {
        if (!selectedDispute) return;
        setProcessing(true);
        try {
            await api.post(`/admin/disputes/${selectedDispute.id}/resolve`, {
                decision,
                notes: decisionNote
            });
            setSnack({ open: true, msg: `Dispute marked as ${decision}` });
            setReviewOpen(false);
            fetchData();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to resolve dispute";
            setSnack({ open: true, msg });
        } finally {
            setProcessing(false);
        }
    };

    const statusConfig = (s: DisputeStatus) => {
        if (s === "WON") return { color: EVZONE.green, icon: <CheckCircle size={14} />, label: "Resolved (Won)" };
        if (s === "LOST") return { color: EVZONE.red, icon: <XCircle size={14} />, label: "Resolved (Lost)" };
        if (s === "CLOSED") return { color: theme.palette.text.secondary, icon: <XCircle size={14} />, label: "Closed" };
        if (s === "UNDER_REVIEW") return { color: EVZONE.blue, icon: <Clock size={14} />, label: "Under Review" };
        return { color: EVZONE.orange, icon: <AlertCircle size={14} />, label: "Open" };
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} gutterBottom>Disputes & Chargebacks</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage and resolve user disputes. Review evidence before decision.
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
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder="Search Dispute ID, Reference, or User..."
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
                                    setStatusFilter(e.target.value as DisputeStatus | "All");
                                    setPage(0);
                                }}
                                size="small"
                                InputProps={{ sx: { borderRadius: '10px' } }}
                            >
                                <MenuItem value="All">All Statuses</MenuItem>
                                <MenuItem value="OPEN">Open</MenuItem>
                                <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
                                <MenuItem value="WON">Won</MenuItem>
                                <MenuItem value="LOST">Lost</MenuItem>
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
                                <TableCell sx={{ fontWeight: 700 }}>Dispute ID</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Amount/Reason</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {disputes.map((d) => {
                                const status = statusConfig(d.status);
                                return (
                                    <TableRow key={d.id} hover>
                                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>{formatTransactionId(d.id)}</TableCell>
                                        <TableCell>
                                            <Stack>
                                                <Typography variant="subtitle2" fontWeight={600}>{d.wallet?.user?.firstName} {d.wallet?.user?.otherNames}</Typography>
                                                <Typography variant="caption" color="text.secondary">{d.wallet?.user?.email}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight={700}>
                                                {formatCurrency(d.amount, d.currency)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150, display: 'block' }}>
                                                {d.reason}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{d.reference}</Typography>
                                            {d.txnId && <Typography variant="caption" color="text.secondary">Tx: {formatTransactionId(d.txnId)}</Typography>}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={status.label}
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
                                                {formatDate(d.createdAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<Gavel size={16} />}
                                                onClick={() => {
                                                    setSelectedDispute(d);
                                                    setReviewOpen(true);
                                                }}
                                            >
                                                Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {!loading && disputes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <Stack alignItems="center" spacing={2}>
                                            <FileText size={48} color={theme.palette.text.disabled} />
                                            <Typography variant="body1" color="text.secondary">
                                                No disputes found.
                                            </Typography>
                                        </Stack>
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

            {/* Review Dialog */}
            <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Review Dispute</DialogTitle>
                <DialogContent>
                    {selectedDispute && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <Alert severity="info" icon={<AlertCircle size={18} />}>
                                Resolving this dispute will perform the necessary wallet adjustments automatically.
                            </Alert>
                            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 2 }}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="caption" color="text.secondary">Dispute ID</Typography>
                                    <Typography variant="body2" fontWeight={600}>{formatTransactionId(selectedDispute.id)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                                    <Typography variant="caption" color="text.secondary">Amount</Typography>
                                    <Typography variant="body2" fontWeight={600} color="error">{formatCurrency(selectedDispute.amount, selectedDispute.currency)}</Typography>
                                </Stack>
                            </Box>

                            <TextField
                                label="Resolution Notes"
                                multiline
                                rows={3}
                                fullWidth
                                placeholder="Explain the reason for this decision..."
                                value={decisionNote}
                                onChange={(e) => setDecisionNote(e.target.value)}
                            />

                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleResolve('WON')}
                                    disabled={processing}
                                    sx={{ bgcolor: EVZONE.green, '&:hover': { bgcolor: alpha(EVZONE.green, 0.9) } }}
                                >
                                    Accept Dispute (Refund User)
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleResolve('LOST')}
                                    disabled={processing}
                                    sx={{ bgcolor: EVZONE.red, '&:hover': { bgcolor: alpha(EVZONE.red, 0.9) } }}
                                >
                                    Reject Dispute
                                </Button>
                            </Stack>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setReviewOpen(false)} disabled={processing}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack({ ...snack, open: false })}
                message={snack.msg}
            />
        </Box>
    );
}
