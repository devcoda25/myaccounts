import React, { useState, useMemo, useEffect } from 'react';
import { api } from "../../../utils/api";
import Pagination from "../../../components/common/Pagination";
import {
    Box,
    Card,
    Typography,
    Stack,
    Button,
    TextField,
    InputAdornment,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Paper,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Avatar,
    Divider,
    Alert,
    useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Search as SearchIcon,
    FileText as FileIcon,
    CheckCircle,
    XCircle,
    Clock,
    Eye as EyeIcon,
    Download as DownloadIcon,
    Fingerprint,
    Shield
} from 'lucide-react';

const EVZONE = { green: "#03cd8c", orange: "#f77f00", red: "#d32f2f" };

type KycStatus = "Pending" | "Verified" | "Rejected" | "In Review";
type DocType = "National ID" | "Passport" | "Driver's License" | "Proof of Address";

interface KycRequest {
    id: string;
    userId: string;
    userName: string;
    email: string;
    submittedAt: number;
    docType: DocType;
    status: KycStatus;
    riskScore: "Low" | "Medium" | "High";
    documents?: Record<string, string>; // url map
}

// Mock Data
function mkRequests(): KycRequest[] {
    const now = Date.now();
    return [
        { id: "KYC-1001", userId: "u_101", userName: "Sarah K.", email: "sarah@example.com", submittedAt: now - 3600000 * 2, docType: "National ID", status: "Pending", riskScore: "Low" },
        { id: "KYC-1002", userId: "u_102", userName: "John Doe", email: "john@example.com", submittedAt: now - 3600000 * 5, docType: "Passport", status: "In Review", riskScore: "Medium" },
        { id: "KYC-1003", userId: "u_103", userName: "Mike Ross", email: "mike@example.com", submittedAt: now - 3600000 * 24, docType: "Driver's License", status: "Verified", riskScore: "Low" },
        { id: "KYC-1004", userId: "u_104", userName: "Jane Doe", email: "jane@example.com", submittedAt: now - 3600000 * 48, docType: "National ID", status: "Rejected", riskScore: "High" },
    ];
}

export default function KycQueue() {
    const theme = useTheme();
    const [tab, setTab] = useState(0);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [requests, setRequests] = useState<KycRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = () => {
        setLoading(true);
        api('/admin/kyc?take=100') // Simplistic fetch for now
            .then((res) => {
                if (res && res.requests) {
                    setRequests(res.requests);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Review Modal State
    const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const filtered = useMemo(() => {
        let statusFilter: KycStatus[] = ["Pending", "In Review"];
        if (tab === 1) statusFilter = ["Verified"];
        if (tab === 2) statusFilter = ["Rejected"];

        const s = q.trim().toLowerCase();
        return requests.filter(r => {
            if (!statusFilter.includes(r.status)) return false;
            if (!s) return true;
            return r.userName.toLowerCase().includes(s) || r.email.toLowerCase().includes(s);
        });
    }, [requests, tab, q]);

    const handleApprove = () => {
        if (!selectedRequest) return;
        api(`/admin/kyc/${selectedRequest.id}/review`, {
            method: 'POST',
            body: JSON.stringify({ action: 'APPROVE' })
        }).then(() => {
            fetchRequests(); // Refresh list
            setSelectedRequest(null);
        }).catch(err => console.error(err));
    };

    const handleReject = () => {
        if (!selectedRequest) return;
        api(`/admin/kyc/${selectedRequest.id}/review`, {
            method: 'POST',
            body: JSON.stringify({ action: 'REJECT', reason: rejectReason })
        }).then(() => {
            fetchRequests(); // Refresh list
            setSelectedRequest(null);
            setRejectReason("");
        }).catch(err => console.error(err));
    };

    const StatusChip = ({ status }: { status: KycStatus }) => {
        let color = EVZONE.orange;
        let icon = <Clock size={14} />;
        if (status === "Verified") { color = EVZONE.green; icon = <CheckCircle size={14} />; }
        if (status === "Rejected") { color = EVZONE.red; icon = <XCircle size={14} />; }

        return <Chip label={status} icon={icon} size="small" sx={{ bgcolor: alpha(color, 0.1), color: color, fontWeight: 700, border: `1px solid ${alpha(color, 0.2)}` }} />;
    };

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800} gutterBottom>KYC Requests</Typography>
                <Typography variant="body1" color="text.secondary">
                    Review and verify user identity documents.
                </Typography>
            </Box>

            <Paper sx={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.paper, 0.6), backdropFilter: 'blur(20px)' }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: 2 }}>
                    <Tab label="Pending Review" sx={{ fontWeight: 600 }} />
                    <Tab label="Verified History" sx={{ fontWeight: 600 }} />
                    <Tab label="Rejected" sx={{ fontWeight: 600 }} />
                </Tabs>

                <Box sx={{ p: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Search by name or email..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon size={18} /></InputAdornment>, sx: { borderRadius: '10px' } }}
                        size="small"
                        sx={{ maxWidth: 400 }}
                    />
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Document Type</TableCell>
                                <TableCell>Submitted</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Risk Score</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered
                                .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                                .map((r) => (
                                    <TableRow key={r.id} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar sx={{ width: 32, height: 32 }}>{r.userName.charAt(0)}</Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={600}>{r.userName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{r.email}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{r.docType}</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>
                                            {new Date(r.submittedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell><StatusChip status={r.status} /></TableCell>
                                        <TableCell>
                                            <Chip label={r.riskScore} size="small" sx={{
                                                bgcolor: r.riskScore === 'High' ? alpha(EVZONE.red, 0.1) : alpha(EVZONE.green, 0.1),
                                                color: r.riskScore === 'High' ? EVZONE.red : EVZONE.green,
                                                fontWeight: 700
                                            }} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<EyeIcon size={16} />}
                                                onClick={() => setSelectedRequest(r)}
                                                sx={{ borderRadius: '8px', borderColor: theme.palette.divider, color: 'text.primary' }}
                                            >
                                                Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">No requests found in this category.</Typography>
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

            {/* Review Dialog */}
            <Dialog
                open={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', height: '80vh' } }}
            >
                {selectedRequest && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="h6" fontWeight={700}>Review KYC: {selectedRequest.userName}</Typography>
                            <StatusChip status={selectedRequest.status} />
                        </DialogTitle>
                        <DialogContent sx={{ p: 0, display: 'flex', height: '100%' }}>
                            <Grid container sx={{ height: '100%' }}>
                                {/* Document Viewer */}
                                <Grid item xs={12} md={7} sx={{ bgcolor: alpha('#000', 0.9), p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
                                    {selectedRequest.documents ? (
                                        <Stack spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
                                            {[
                                                { key: 'idFront', label: 'ID Front' },
                                                { key: 'idBack', label: 'ID Back' },
                                                { key: 'selfie', label: 'Selfie' },
                                                { key: 'proofAddress', label: 'Proof of Address' }
                                            ].map((doc) => {
                                                const url = selectedRequest.documents?.[doc.key];
                                                if (!url) return null;
                                                // If URL is already absolute, use it. Otherwise, assume relative.
                                                // If we have VITE_API_BASE_URL (and it's not just /api), prepending it might be safer if proxy is flaky.
                                                // But /uploads proxy is standard. Let's try to trust the relative path first.
                                                const src = url.startsWith('http') ? url : url;

                                                return (
                                                    <Paper key={doc.key} sx={{ width: '100%', maxWidth: 500, height: 320, bgcolor: '#333', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                        <img
                                                            src={src}
                                                            alt={doc.label}
                                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                            onError={(e) => {
                                                                // Fallback if relative fails, maybe try appending base url explicitly?
                                                                // For now just console log
                                                                console.error('Image load failed:', src);
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    </Paper>
                                                );
                                            })}
                                        </Stack>
                                    ) : (
                                        <Typography color="#aaa">No documents found.</Typography>
                                    )}
                                </Grid>

                                {/* User Details & Actions */}
                                <Grid item xs={12} md={5} sx={{ p: 3, borderLeft: `1px solid ${theme.palette.divider}`, overflowY: 'auto' }}>
                                    <Stack spacing={3}>
                                        <Alert severity="info" icon={<Shield size={18} />}>
                                            Risk Score: <strong>{selectedRequest.riskScore}</strong>. Automated checks passed.
                                        </Alert>

                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Full Name</Typography>
                                            <Typography variant="body1" fontWeight={600}>{selectedRequest.userName}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Document Type</Typography>
                                            <Typography variant="body1" fontWeight={600}>{selectedRequest.docType}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Document Number</Typography>
                                            <Typography variant="body1" fontWeight={600}>A0012938221</Typography>
                                        </Box>

                                        <Divider />

                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Reject Reason (if rejecting)</Typography>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={3}
                                                placeholder="Enter reason for rejection..."
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                            />
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                            <Button onClick={() => setSelectedRequest(null)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleReject}
                                disabled={!rejectReason && selectedRequest.status !== 'Rejected'}
                            >
                                Reject
                            </Button>
                            <Button
                                variant="contained"
                                sx={{ bgcolor: EVZONE.green, color: '#fff', '&:hover': { bgcolor: alpha(EVZONE.green, 0.9) } }}
                                startIcon={<CheckCircle size={18} />}
                                onClick={handleApprove}
                            >
                                Approve & Verify
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box >
    );
}
