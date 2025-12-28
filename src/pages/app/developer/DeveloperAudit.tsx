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
    Divider,
    IconButton,
    InputAdornment,
    MenuItem,
    Snackbar,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeContext } from "../../../theme/ThemeContext";

/**
 * EVzone My Accounts - Developer Audit Log
 * Route: /app/developer/audit
 *
 * Features:
 * - Searchable and filterable audit logs
 * - Export records
 * - View detailed event metadata
 */

type ThemeMode = "light" | "dark";
type Severity = "info" | "warning" | "error" | "success";

type AuditEvent = {
    id: string;
    type: string;
    actor: string;
    target: string;
    ip: string;
    status: "Success" | "Failed";
    timestamp: number;
    metadata?: Record<string, any>;
};

const EVZONE = {
    green: "#03cd8c",
    orange: "#f77f00",
} as const;


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

function ArrowLeftIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

function SearchIcon({ size = 18 }: { size?: number }) {
    return (
        <>
            <CssBaseline />
            <IconBase size={size}>
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </IconBase>
        </>
    );
}

function FilterIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

function DownloadIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M12 3v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="m8 12 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

function ShieldIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </IconBase>
    );
}

// -----------------------------
// Utils
// -----------------------------
function formatDateTime(ts: number) {
    return new Date(ts).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// -----------------------------
// Component
// -----------------------------
export default function DeveloperAuditPage() {
    const navigate = useNavigate();
    const { mode } = useThemeContext();
    const theme = useTheme();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [events] = useState<AuditEvent[]>(() => {
        const now = Date.now();
        return [
            {
                id: "evt_01",
                type: "api_key.created",
                actor: "ronald@example.com",
                target: "Server integration",
                ip: "197.157.10.x",
                status: "Success",
                timestamp: now - 1000 * 60 * 45,
                metadata: { scopes: ["profile.read", "wallet.read"] },
            },
            {
                id: "evt_02",
                type: "oauth_client.revoked",
                actor: "ronald@example.com",
                target: "Partner App Alpha",
                ip: "197.157.10.x",
                status: "Success",
                timestamp: now - 1000 * 60 * 60 * 3,
            },
            {
                id: "evt_03",
                type: "api_key.auth_failed",
                actor: "API_KEY (Unknown)",
                target: "/v1/transactions",
                ip: "41.210.155.y",
                status: "Failed",
                timestamp: now - 1000 * 60 * 60 * 12,
                metadata: { reason: "Invalid signature" },
            },
            {
                id: "evt_04",
                type: "api_key.rotated",
                actor: "ronald@example.com",
                target: "Mobile App Key",
                ip: "197.157.10.x",
                status: "Success",
                timestamp: now - 1000 * 60 * 60 * 24,
            },
        ];
    });

    const filteredEvents = useMemo(() => {
        return events.filter((e) => {
            const matchSearch =
                e.type.toLowerCase().includes(search.toLowerCase()) || e.target.toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter === "All" || e.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [events, search, statusFilter]);

    const pageBg =
        mode === "dark"
            ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
            : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

    const orangeOutlined = {
        borderColor: alpha(EVZONE.orange, 0.65),
        color: EVZONE.orange,
        backgroundColor: alpha(theme.palette.background.paper, 0.20),
        "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
        borderRadius: "4px",
    } as const;

    return (
        <>
            <Box className="min-h-screen" sx={{ background: pageBg }}>
                <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                        <Stack spacing={2.2}>
                            <Card>
                                <CardContent className="p-5 md:p-7">
                                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Stack direction="row" spacing={1.2} alignItems="center">
                                                <IconButton size="small" sx={{ color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}` }} onClick={() => navigate("/app/developer")}>
                                                    <ArrowLeftIcon size={18} />
                                                </IconButton>
                                                <Typography variant="h5">Audit logs</Typography>
                                            </Stack>
                                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, ml: { md: 5 } }}>
                                                Track sensitive developer actions and API access events.
                                            </Typography>
                                        </Box>
                                        <Button variant="outlined" sx={orangeOutlined} startIcon={<DownloadIcon size={18} />} onClick={() => { }}>
                                            Export logs
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4 md:p-6">
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                        <TextField
                                            placeholder="Search events, targets..."
                                            fullWidth
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon size={18} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            select
                                            label="Status"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            sx={{ minWidth: 150 }}
                                        >
                                            <MenuItem value="All">All Statuses</MenuItem>
                                            <MenuItem value="Success">Success</MenuItem>
                                            <MenuItem value="Failed">Failed</MenuItem>
                                        </TextField>
                                    </Stack>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-0">
                                    <Box sx={{ overflowX: "auto" }}>
                                        <Box sx={{ minWidth: 800 }}>
                                            <Box sx={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.8fr", p: 2, backgroundColor: alpha(theme.palette.text.primary, 0.03), borderBottom: `1px solid ${theme.palette.divider}` }}>
                                                <Typography variant="caption" sx={{ fontWeight: 900, color: theme.palette.text.secondary }}>EVENT TYPE</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 900, color: theme.palette.text.secondary }}>ACTOR</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 900, color: theme.palette.text.secondary }}>TARGET</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 900, color: theme.palette.text.secondary }}>DATE & TIME</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 900, color: theme.palette.text.secondary, textAlign: "right" }}>STATUS</Typography>
                                            </Box>

                                            <Stack>
                                                {filteredEvents.map((e) => (
                                                    <Box key={e.id} sx={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.8fr", p: 2, alignItems: "center", borderBottom: `1px solid ${theme.palette.divider}`, "&:hover": { backgroundColor: alpha(theme.palette.text.primary, 0.02) } }}>
                                                        <Stack direction="row" spacing={1.2} alignItems="center">
                                                            <Box sx={{ p: 1, borderRadius: 1, backgroundColor: alpha(theme.palette.text.primary, 0.05) }}>
                                                                <ShieldIcon size={16} />
                                                            </Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 950 }}>{e.type.replace(/\./g, " ").toUpperCase()}</Typography>
                                                        </Stack>
                                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{e.actor}</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{e.target}</Typography>
                                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{formatDateTime(e.timestamp)}</Typography>
                                                        <Box sx={{ textAlign: "right" }}>
                                                            <Chip
                                                                size="small"
                                                                label={e.status}
                                                                color={e.status === "Success" ? "success" : "error"}
                                                                sx={{ fontWeight: 900, fontSize: "11px", height: 20 }}
                                                            />
                                                        </Box>
                                                    </Box>
                                                ))}
                                                {filteredEvents.length === 0 && (
                                                    <Box sx={{ py: 8, textAlign: "center" }}>
                                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>No audit logs found matching your criteria.</Typography>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            <Alert severity="info" icon={<ShieldIcon size={18} />} sx={{ borderRadius: 2 }}>
                                Audit logs are retained for 12 months for compliance purposes.
                            </Alert>

                            <Box sx={{ opacity: 0.92 }}>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group.</Typography>
                            </Box>
                            stack
                        </Stack>
                    </motion.div>
                </Box>
            </Box>

            <Snackbar open={false}>
                <Alert severity="info">Notification placeholder</Alert>
            </Snackbar>
        </>
    );
}
