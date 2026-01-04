import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../components/common/Pagination";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    InputAdornment,
    MenuItem,
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
    IconButton
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    Search as SearchIcon,
    Building2 as OrgIcon,
    MoreVertical as MoreIcon,
    ShieldBan as BanIcon,
    CheckCircle as CheckIcon,
    Eye as EyeIcon
} from "lucide-react";

type OrgStatus = "Active" | "Suspended" | "Pending";
type OrgPlan = "Free" | "Pro" | "Enterprise";

interface OrgRow {
    id: string;
    name: string;
    domain: string;
    owner: string;
    status: OrgStatus;
    plan: OrgPlan;
    members: number;
    createdAt: number;
}

const EVZONE = { green: "#03cd8c", orange: "#f77f00" } as const;

function statusTone(s: OrgStatus) {
    if (s === "Active") return EVZONE.green;
    if (s === "Suspended") return "#B42318";
    return EVZONE.orange;
}

function planTone(p: OrgPlan) {
    if (p === "Enterprise") return "#7A5AF8"; // violet
    if (p === "Pro") return EVZONE.orange;
    return "#667085"; // gray
}

export default function AdminOrgsListPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isDark = theme.palette.mode === 'dark';

    const [q, setQ] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState<OrgStatus | "All">("All");

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<OrgRow[]>([]);
    const [total, setTotal] = useState(0);

    const [snack, setSnack] = useState<{ open: boolean; severity: "error" | "info"; msg: string }>({ open: false, severity: "info", msg: "" });

    // API Call
    const fetchOrgs = async () => {
        setLoading(true);
        try {
            const skip = page * rowsPerPage;
            // For now pass status filter too, though backend might just accept query
            const res = await import("../../../utils/api").then(m => m.api(`/admin/orgs?skip=${skip}&take=${rowsPerPage}&query=${encodeURIComponent(q)}&status=${statusFilter}`));
            if (res && Array.isArray(res.orgs)) {
                setRows(res.orgs);
                setTotal(res.total || 0);
            }
        } catch (err: any) {
            console.error(err);
            setSnack({ open: true, severity: "error", msg: "Failed to load organizations" });
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrgs();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, rowsPerPage, q, statusFilter]);

    // Derived filtered not needed as we fetch from server, but if we wanted client side sorting on the page we could.
    // However, since rows are already filtered by backend, we just use rows.
    const filtered = rows;

    const orangeOutlined = {
        borderColor: alpha(EVZONE.orange, 0.70),
        color: EVZONE.orange,
        backgroundColor: alpha(theme.palette.background.paper, 0.35),
        "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
        borderRadius: 3
    } as const;

    const StatusChip = ({ s }: { s: OrgStatus }) => {
        const tone = statusTone(s);
        return <Chip size="small" label={s} sx={{ fontWeight: 900, border: `1px solid ${alpha(tone, 0.35)}`, color: tone, backgroundColor: alpha(tone, 0.10) }} />;
    };

    const PlanChip = ({ p }: { p: OrgPlan }) => {
        const tone = planTone(p);
        return <Chip size="small" label={p} sx={{ fontWeight: 900, border: `1px solid ${alpha(tone, 0.35)}`, color: tone, backgroundColor: alpha(tone, 0.10) }} />;
    };

    return (
        <Box className="min-h-screen">
            <Stack spacing={2.2}>
                <Card sx={{ borderRadius: 6 }}>
                    <CardContent className="p-5 md:p-7">
                        <Stack spacing={1.2}>
                            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                                <Box>
                                    <Typography variant="h5">Organizations</Typography>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                        Manage usage, billing, and access for organizations.
                                    </Typography>
                                </Box>
                                {/* Future: Export or specific actions */}
                            </Stack>

                            <Divider />

                            <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ xs: "stretch", md: "center" }}>
                                <TextField
                                    placeholder="Search organizations..."
                                    size="small"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon size={18} /></InputAdornment>) }}
                                    fullWidth
                                    sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                                <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                                    <MenuItem value="All">All</MenuItem>
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Suspended">Suspended</MenuItem>
                                    <MenuItem value="Pending">Pending</MenuItem>
                                </TextField>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>

                <Card sx={{ borderRadius: 6 }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.55) }}>
                                    <TableCell sx={{ fontWeight: 950 }}>Organization</TableCell>
                                    <TableCell sx={{ fontWeight: 950 }}>Owner</TableCell>
                                    <TableCell sx={{ fontWeight: 950 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 950 }}>Plan</TableCell>
                                    <TableCell sx={{ fontWeight: 950 }}>Members</TableCell>
                                    <TableCell sx={{ fontWeight: 950 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((r) => (
                                    <TableRow key={r.id} hover>
                                        <TableCell>
                                            <Stack>
                                                <Typography sx={{ fontWeight: 900 }}>{r.name}</Typography>
                                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{r.domain}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{r.owner}</TableCell>
                                        <TableCell><StatusChip s={r.status} /></TableCell>
                                        <TableCell><PlanChip p={r.plan} /></TableCell>
                                        <TableCell>{r.members}</TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                <Button variant="outlined" sx={orangeOutlined} startIcon={<EyeIcon size={16} />} onClick={() => navigate(`/admin/orgs/${r.id}`)}>
                                                    View
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                                                No organizations found.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Divider />
                    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
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
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
}
