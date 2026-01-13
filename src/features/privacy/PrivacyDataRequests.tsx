import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    MenuItem,
    Snackbar,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Privacy Data Requests (DSAR)
 * Route: /app/privacy/data-requests
 *
 * Features:
 * - History of data requests (Access, Deletion, Export, Correction)
 * - Submit new request dialog
 * - Verification flow required for sensitive requests
 */

type ThemeMode = "light" | "dark";
type Severity = "info" | "warning" | "error" | "success";

type RequestType = "Access" | "Delete" | "Export" | "Correction";
type RequestStatus = "Pending" | "Processing" | "Completed" | "Rejected";

type DataRequest = {
    id: string;
    type: RequestType;
    status: RequestStatus;
    createdAt: number;
    completedAt?: number;
    details?: string;
};

const EVZONE = {
    green: "#03cd8c",
    orange: "#f77f00",
} as const;

const THEME_KEY = "evzone_myaccounts_theme";

// -----------------------------
// Inline icons
// -----------------------------
function IconBase({ size = 18, children }: { size?: number; children: React.ReactNode }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>
            {children}
        </svg>
    );
}

function SunIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 20v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M22 12h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

function MoonIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M21 13a8 8 0 0 1-10-10 7.5 7.5 0 1 0 10 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </IconBase>
    );
}

function GlobeIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

function ShieldCheckIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

function ArrowLeftIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

function PlusIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

function ClockIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

function FileDownloadIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="m8 11 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 17h16v3H4v-3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

function TrashIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

// -----------------------------
// Theme
// -----------------------------
function getStoredMode(): ThemeMode {
    try {
        const v = window.localStorage.getItem(THEME_KEY);
        return v === "light" || v === "dark" ? (v as ThemeMode) : "light";
    } catch {
        return "light";
    }
}

function setStoredMode(mode: ThemeMode) {
    try {
        window.localStorage.setItem(THEME_KEY, mode);
    } catch {
        // ignore
    }
}

function buildTheme(mode: ThemeMode) {
    const isDark = mode === "dark";
    const bg = isDark ? "#07110F" : "#F4FFFB";
    const paper = isDark ? "#0B1A17" : "#FFFFFF";
    const textPrimary = isDark ? "#E9FFF7" : "#0B1A17";
    const textSecondary = isDark ? alpha("#E9FFF7", 0.74) : alpha("#0B1A17", 0.70);

    return createTheme({
        palette: {
            mode,
            primary: { main: EVZONE.green },
            secondary: { main: EVZONE.orange },
            background: { default: bg, paper },
            text: { primary: textPrimary, secondary: textSecondary },
            divider: isDark ? alpha("#E9FFF7", 0.12) : alpha("#0B1A17", 0.10),
        },
        shape: { borderRadius: 1 },
        typography: {
            fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
            h5: { fontWeight: 950, letterSpacing: -0.5 },
            h6: { fontWeight: 900, letterSpacing: -0.28 },
            button: { fontWeight: 900, textTransform: "none" },
        },
        components: {
            MuiButton: { styleOverrides: { root: { borderRadius: "4px", textTransform: "none", boxShadow: "none" } } },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: "4px",
                        border: `1px solid ${isDark ? alpha("#E9FFF7", 0.10) : alpha("#0B1A17", 0.10)}`,
                        backgroundImage:
                            "radial-gradient(900px 420px at 10% 0%, rgba(3,205,140,0.12), transparent 60%), radial-gradient(900px 420px at 90% 0%, rgba(3,205,140,0.10), transparent 55%)",
                    },
                },
            },
        },
    });
}

// -----------------------------
// Utils
// -----------------------------
function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function statusColor(s: RequestStatus) {
    if (s === "Completed") return "success";
    if (s === "Processing") return "info";
    if (s === "Pending") return "warning";
    return "error";
}

// -----------------------------
// Component
// -----------------------------
export default function PrivacyDataRequestsPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
    const theme = useMemo(() => buildTheme(mode), [mode]);
    const isDark = mode === "dark";

    const [requests, setRequests] = useState<DataRequest[]>(() => {
        const now = Date.now();
        return [
            {
                id: "req_01",
                type: "Access",
                status: "Completed",
                createdAt: now - 1000 * 60 * 60 * 24 * 60,
                completedAt: now - 1000 * 60 * 60 * 24 * 58,
                details: "Full account data export.",
            },
            {
                id: "req_02",
                type: "Correction",
                status: "Rejected",
                createdAt: now - 1000 * 60 * 60 * 24 * 30,
                details: "Refusal to update KYC data without official document.",
            },
        ];
    });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [newType, setNewType] = useState<RequestType>("Access");
    const [newDetails, setNewDetails] = useState("");

    const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

    const toggleMode = () => {
        const next: ThemeMode = mode === "light" ? "dark" : "light";
        setMode(next);
        setStoredMode(next);
    };

    const pageBg =
        mode === "dark"
            ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
            : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

    const orangeContained = {
        backgroundColor: EVZONE.orange,
        color: "#FFFFFF",
        boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.18)}`,
        "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    } as const;

    const orangeOutlined = {
        borderColor: alpha(EVZONE.orange, 0.65),
        color: EVZONE.orange,
        backgroundColor: alpha(theme.palette.background.paper, 0.20),
        "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
    } as const;

    const greenContained = {
        backgroundColor: EVZONE.green,
        color: "#FFFFFF",
        boxShadow: `0 18px 48px ${alpha(EVZONE.green, mode === "dark" ? 0.24 : 0.16)}`,
        "&:hover": { backgroundColor: alpha(EVZONE.green, 0.92), color: "#FFFFFF" },
    } as const;

    const handleSubmit = () => {
        if (newType === "Delete") {
            setDialogOpen(false);
            navigate("/app/privacy/delete");
            return;
        }

        const req: DataRequest = {
            id: `req_${Math.random().toString(36).slice(2, 7)}`,
            type: newType,
            status: "Pending",
            createdAt: Date.now(),
            details: newDetails,
        };
        setRequests((prev) => [req, ...prev]);
        setDialogOpen(false);
        setNewDetails("");
        setSnack({ open: true, severity: "success", msg: "Data request submitted (demo)." });
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box className="min-h-screen" sx={{ background: pageBg }}>
                <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                        <Stack spacing={2.2}>
                            <Card>
                                <CardContent className="p-5 md:p-7">
                                    <Stack spacing={1.2}>
                                        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                                            <Box>
                                                <Stack direction="row" spacing={1.2} alignItems="center">
                                                    <IconButton size="small" sx={{ color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}` }} onClick={() => navigate("/app/privacy/consents")}>
                                                        <ArrowLeftIcon size={18} />
                                                    </IconButton>
                                                    <Typography variant="h5">Data requests</Typography>
                                                </Stack>
                                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, ml: { md: 5 } }}>
                                                    Manage your rights to access, correct, or delete your personal data.
                                                </Typography>
                                            </Box>
                                            <Button variant="contained" color="secondary" sx={orangeContained} startIcon={<PlusIcon size={18} />} onClick={() => setDialogOpen(true)}>
                                                New request
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>

                            <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                                <Box className="md:col-span-8">
                                    <Card>
                                        <CardContent className="p-5 md:p-7">
                                            <Stack spacing={1.2}>
                                                <Typography variant="h6">Request history</Typography>
                                                <Divider />
                                                <Stack spacing={1.2}>
                                                    {requests.map((r) => (
                                                        <Box key={r.id} sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                                                            <Stack spacing={1}>
                                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                                    <Stack direction="row" spacing={1.2} alignItems="center">
                                                                        <Box sx={{ p: 1, borderRadius: 12, backgroundColor: alpha(theme.palette.text.primary, 0.05) }}>
                                                                            {r.type === "Export" || r.type === "Access" ? <FileDownloadIcon size={18} /> : r.type === "Delete" ? <TrashIcon size={18} /> : <ClockIcon size={18} />}
                                                                        </Box>
                                                                        <Box>
                                                                            <Typography sx={{ fontWeight: 950 }}>{r.type} Request</Typography>
                                                                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                                                                ID: {r.id} • Created {formatDate(r.createdAt)}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Stack>
                                                                    <Chip size="small" color={statusColor(r.status)} label={r.status} sx={{ fontWeight: 900 }} />
                                                                </Stack>
                                                                {r.details && (
                                                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, backgroundColor: alpha(theme.palette.text.primary, 0.03), p: 1, borderRadius: 1 }}>
                                                                        {r.details}
                                                                    </Typography>
                                                                )}
                                                                {r.status === "Completed" && r.completedAt && (
                                                                    <Alert severity="success" sx={{ py: 0, px: 1, borderRadius: 1 }}>
                                                                        Completed on {formatDate(r.completedAt)}
                                                                    </Alert>
                                                                )}
                                                            </Stack>
                                                        </Box>
                                                    ))}
                                                    {requests.length === 0 && (
                                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: "center", py: 4 }}>
                                                            No data requests submitted yet.
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Box>

                                <Box className="md:col-span-4">
                                    <Stack spacing={2.2}>
                                        <Card>
                                            <CardContent className="p-5">
                                                <Stack spacing={1.2}>
                                                    <Typography variant="h6">About your rights</Typography>
                                                    <Divider />
                                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                                        Under global privacy regulations (like GDPR or LGPD), you have specific rights regarding your data:
                                                    </Typography>
                                                    <Stack spacing={1}>
                                                        <Box sx={{ display: "flex", gap: 1 }}>
                                                            <Box sx={{ color: EVZONE.green }}>•</Box>
                                                            <Typography variant="body2"><b>Access:</b> Request a copy of all data we hold about you.</Typography>
                                                        </Box>
                                                        <Box sx={{ display: "flex", gap: 1 }}>
                                                            <Box sx={{ color: EVZONE.green }}>•</Box>
                                                            <Typography variant="body2"><b>Correction:</b> Update incorrect or incomplete information.</Typography>
                                                        </Box>
                                                        <Box sx={{ display: "flex", gap: 1 }}>
                                                            <Box sx={{ color: EVZONE.green }}>•</Box>
                                                            <Typography variant="body2"><b>Erasure:</b> Request deletion of your account and data.</Typography>
                                                        </Box>
                                                        <Box sx={{ display: "flex", gap: 1 }}>
                                                            <Box sx={{ color: EVZONE.green }}>•</Box>
                                                            <Typography variant="body2"><b>Portability:</b> Export your data in a machine-readable format.</Typography>
                                                        </Box>
                                                    </Stack>
                                                    <Alert severity="warning" icon={<ShieldCheckIcon size={18} />} sx={{ mt: 1 }}>
                                                        We may require identity verification before processing sensitive requests.
                                                    </Alert>
                                                </Stack>
                                            </CardContent>
                                        </Card>

                                        <Card sx={{ backgroundColor: alpha(EVZONE.orange, 0.05) }}>
                                            <CardContent className="p-5">
                                                <Stack spacing={1.2}>
                                                    <Typography variant="h6" color="secondary">Need help?</Typography>
                                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                                        Have questions about how we handle your data? Our Data Protection Officer (DPO) is here to help.
                                                    </Typography>
                                                    <Button variant="outlined" sx={orangeOutlined} fullWidth onClick={() => navigate("/app/support")}>
                                                        Contact Support
                                                    </Button>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Stack>
                                </Box>
                            </Box>

                            <Box sx={{ opacity: 0.92 }}>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group</Typography>
                            </Box>
                        </Stack>
                    </motion.div>
                </Box>

                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
                    <DialogTitle sx={{ fontWeight: 950 }}>New data request</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField select label="Request type" value={newType} onChange={(e) => setNewType(e.target.value as RequestType)} fullWidth>
                                <MenuItem value="Access">Right to Access (Download)</MenuItem>
                                <MenuItem value="Export">Data Portability (Export)</MenuItem>
                                <MenuItem value="Correction">Right to Rectification (Correction)</MenuItem>
                                <MenuItem value="Delete">Right to Erasure (Delete Account)</MenuItem>
                            </TextField>
                            <TextField label="Additional details" multiline rows={3} value={newDetails} onChange={(e) => setNewDetails(e.target.value)} placeholder="Provide any additional context for your request..." fullWidth />
                            <Alert severity="info">
                                Processing can take up to 30 days depending on the complexity of the request.
                            </Alert>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, pt: 0 }}>
                        <Button variant="outlined" sx={orangeOutlined} onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="contained" sx={greenContained} onClick={handleSubmit}>
                            Submit request
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar open={snack.open} autoHideDuration={3200} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                    <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
                        {snack.msg}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
}
