import React, { useMemo, useState } from "react";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    InputAdornment,
    MenuItem,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useTheme,
    useMediaQuery
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import {
    ShieldAlert as ShieldIcon,
    Search as SearchIcon,
    Download as DownloadIcon,
    Eye as EyeIcon,
} from "lucide-react";
import { formatTransactionId } from "@/utils/format";

// Types
type Severity = "success" | "info" | "warning" | "error";
type Outcome = "Success" | "Failed";
type Risk = "Low" | "Medium" | "High";

type AuditEvent = {
    id: string;
    at: number;
    actor: string;
    role: string;
    action: string;
    target: string;
    ip: string;
    outcome: Outcome;
    risk: Risk;
    requestId: string;
    meta: Record<string, string | number | boolean>;
};

const EVZONE = { green: "#03cd8c", orange: "#f77f00" } as const;

// mkEvents mock removed

function riskTone(r: Risk) {
    if (r === "High") return "#B42318";
    if (r === "Medium") return EVZONE.orange;
    return EVZONE.green;
}

import { api } from "@/utils/api";
import { exportToCsv } from "@/utils/export";

export default function AuditLogs() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isDark = theme.palette.mode === 'dark';
    const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });
    const [rows, setRows] = useState<AuditEvent[]>([]);
    const [q, setQ] = useState("");
    const [outcome, setOutcome] = useState<Outcome | "All">("All");
    const [risk, setRisk] = useState<Risk | "All">("All");
    const [detail, setDetail] = useState<AuditEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const orangeContained = {
        backgroundColor: EVZONE.orange,
        color: "#FFFFFF",
        boxShadow: `0 18px 48px ${alpha(EVZONE.orange, isDark ? 0.28 : 0.18)}`,
        "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
        borderRadius: 3
    } as const;

    const orangeOutlined = {
        borderColor: alpha(EVZONE.orange, 0.65),
        color: EVZONE.orange,
        backgroundColor: alpha(theme.palette.background.paper, 0.20),
        "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
        borderRadius: 3
    } as const;

    React.useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const params: Record<string, string | number> = { take: 100 };
                if (q) params.query = q;
                if (outcome !== "All") params.outcome = outcome;
                if (risk !== "All") params.risk = risk;

                const res = await api<{ logs: AuditEvent[]; total: number }>('/admin/audit-logs', { params });
                setRows(res.logs || []);
                setTotal(res.total || 0);
            } catch (err) {
                console.error(err);
                setSnack({ open: true, severity: "error", msg: "Failed to load audit logs." });
            } finally {
                setLoading(false);
            }
        };
        const timeout = setTimeout(load, 250); // Debounce
        return () => clearTimeout(timeout);
    }, [q, outcome, risk]);

    const handleExport = () => {
        if (!rows.length) return;
        exportToCsv(rows, `audit-logs-${Date.now()}.csv`, {
            id: 'Event ID',
            at: 'Timestamp',
            actor: 'Actor',
            role: 'Role',
            action: 'Action',
            target: 'Target',
            ip: 'IP Address',
            outcome: 'Outcome',
            risk: 'Risk',
            requestId: 'Request ID'
        });
        setSnack({ open: true, severity: "success", msg: "Audit logs exported successfully." });
    };

    const filtered = rows;

    const riskChip = (r: Risk) => {
        const tone = riskTone(r);
        return <Chip size="small" label={r} sx={{ fontWeight: 900, border: `1px solid ${alpha(tone, 0.35)}`, color: tone, backgroundColor: alpha(tone, 0.10) }} />;
    };

    const Info = ({ label, value }: { label: string; value: string }) => (
        <Box sx={{ p: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{label}</Typography>
            <Typography sx={{ fontWeight: 600, wordBreak: "break-word" }}>{value}</Typography>
        </Box>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
                <Card sx={{ borderRadius: 6 }}>
                    <CardContent className="p-5 md:p-7">
                        <Stack spacing={1.2}>
                            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                                <Box>
                                    <Typography variant="h5">Audit logs</Typography>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                        Tamper-aware records of admin and security actions.
                                    </Typography>
                                </Box>
                                <Button variant="outlined" sx={orangeOutlined} startIcon={<DownloadIcon size={18} />} onClick={handleExport}>
                                    Export CSV
                                </Button>
                            </Stack>
                            <Divider />
                            <Box className="grid gap-3 md:grid-cols-12">
                                <Box className="md:col-span-6">
                                    <TextField
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder="Search logs..."
                                        fullWidth
                                        size="small"
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon size={18} /></InputAdornment>) }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    />
                                </Box>
                                <Box className="md:col-span-3">
                                    <TextField select value={outcome} onChange={(e) => setOutcome(e.target.value as Outcome | "All")} label="Outcome" fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                                        <MenuItem value="All">All</MenuItem>
                                        <MenuItem value="Success">Success</MenuItem>
                                        <MenuItem value="Failed">Failed</MenuItem>
                                    </TextField>
                                </Box>
                                <Box className="md:col-span-3">
                                    <TextField select value={risk} onChange={(e) => setRisk(e.target.value as Risk | "All")} label="Risk" fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                                        <MenuItem value="All">All</MenuItem>
                                        <MenuItem value="Low">Low</MenuItem>
                                        <MenuItem value="Medium">Medium</MenuItem>
                                        <MenuItem value="High">High</MenuItem>
                                    </TextField>
                                </Box>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>

                <Card sx={{ borderRadius: 6, overflow: 'hidden' }}>
                    {!isMobile ? (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.55) }}>
                                        <TableCell sx={{ fontWeight: 950 }}>Time</TableCell>
                                        <TableCell sx={{ fontWeight: 950 }}>Actor</TableCell>
                                        <TableCell sx={{ fontWeight: 950 }}>Action</TableCell>
                                        <TableCell sx={{ fontWeight: 950 }}>Target</TableCell>
                                        <TableCell sx={{ fontWeight: 950 }}>Risk</TableCell>
                                        <TableCell sx={{ fontWeight: 950 }}>Outcome</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.map((r) => (
                                        <TableRow key={r.id} hover sx={{ cursor: "pointer" }} onClick={() => setDetail(r)}>
                                            <TableCell>{new Date(r.at).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontWeight: 900 }}>{r.actor}</Typography>
                                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{r.role}</Typography>
                                            </TableCell>
                                            <TableCell>{r.action}</TableCell>
                                            <TableCell>{r.target}</TableCell>
                                            <TableCell>{riskChip(r.risk)}</TableCell>
                                            <TableCell>
                                                {r.outcome === "Success" ? <Chip size="small" color="success" label="Success" /> : <Chip size="small" color="error" label="Failed" />}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filtered.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">No logs found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Stack spacing={0} divider={<Divider />}>
                            {filtered.map((r) => (
                                <Box key={r.id} onClick={() => setDetail(r)} sx={{ p: 2, cursor: 'pointer', '&:active': { bgcolor: alpha(theme.palette.action.active, 0.1) } }}>
                                    <Stack spacing={1.5}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700}>{r.action}</Typography>
                                                <Typography variant="caption" color="text.secondary">{new Date(r.at).toLocaleString()}</Typography>
                                            </Box>
                                            {r.outcome === "Success" ?
                                                <Chip size="small" color="success" label="Success" variant="outlined" /> :
                                                <Chip size="small" color="error" label="Failed" variant="outlined" />
                                            }
                                        </Stack>

                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Box>
                                                <Typography variant="body2" fontWeight={600} fontSize="0.85rem">{r.actor}</Typography>
                                                <Typography variant="caption" color="text.secondary">{r.role}</Typography>
                                            </Box>
                                            {riskChip(r.risk)}
                                        </Stack>

                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, bgcolor: alpha(theme.palette.background.default, 0.5), p: 0.5, borderRadius: 1 }}>
                                            Target: {r.target}
                                        </Typography>
                                    </Stack>
                                </Box>
                            ))}
                            {filtered.length === 0 && (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">No logs found.</Typography>
                                </Box>
                            )}
                        </Stack>
                    )}
                </Card>
            </Stack>

            {/* Detail dialog */}
            <Dialog open={!!detail} onClose={() => setDetail(null)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 6 } }}>
                <DialogTitle sx={{ fontWeight: 950 }}>Audit event</DialogTitle>
                <DialogContent>
                    {detail ? (
                        <Stack spacing={1.2}>
                            <Alert severity="info" icon={<EyeIcon size={18} />} sx={{ borderRadius: 3 }}>
                                Event ID: <b>{formatTransactionId(detail.id)}</b>
                            </Alert>

                            <Box className="grid gap-3 md:grid-cols-12">
                                <Box className="md:col-span-6"><Info label="Time" value={new Date(detail.at).toLocaleString()} /></Box>
                                <Box className="md:col-span-6"><Info label="Request ID" value={formatTransactionId(detail.requestId)} /></Box>
                                <Box className="md:col-span-6"><Info label="Actor" value={`${detail.actor} (${detail.role})`} /></Box>
                                <Box className="md:col-span-6"><Info label="IP" value={detail.ip} /></Box>
                                <Box className="md:col-span-6"><Info label="Action" value={detail.action} /></Box>
                                <Box className="md:col-span-6"><Info label="Target" value={detail.target} /></Box>
                            </Box>

                            <Divider />

                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                {riskChip(detail.risk)}
                                {detail.outcome === "Success" ? <Chip size="small" color="success" label="Success" /> : <Chip size="small" color="error" label="Failed" />}
                            </Stack>

                            <Box sx={{ borderRadius: 4, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                                <Typography sx={{ fontWeight: 950 }}>Metadata</Typography>
                                <Divider sx={{ my: 1 }} />
                                <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 12, color: theme.palette.text.primary }}>
                                    {JSON.stringify(detail.meta, null, 2)}
                                </pre>
                            </Box>
                        </Stack>
                    ) : null}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button variant="outlined" sx={orangeOutlined} onClick={() => setDetail(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={isDark ? "filled" : "standard"} sx={{ borderRadius: 16 }}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </motion.div>
    );
}
