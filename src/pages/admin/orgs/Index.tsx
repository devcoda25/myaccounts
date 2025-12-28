import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
    const [statusFilter, setStatusFilter] = useState<OrgStatus | "All">("All");

    const [rows, setRows] = useState<OrgRow[]>(() => [
        { id: "org_1", name: "EV World Africa", domain: "evworld.africa", owner: "Ronald Isabirye", status: "Active", plan: "Enterprise", members: 12, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 365 },
        { id: "org_2", name: "Kampala Charging Solutions", domain: "kla-charge.com", owner: "John Doe", status: "Active", plan: "Pro", members: 5, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60 },
        { id: "org_3", name: "Uganda Logistics", domain: "ug-logs.com", owner: "Sarah M.", status: "Suspended", plan: "Free", members: 2, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 120 },
        { id: "org_4", name: "Green Energy Ltd", domain: "green-energy.ug", owner: "Mike K.", status: "Pending", plan: "Free", members: 1, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2 },
    ]);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        return rows
            .filter((r) => statusFilter === "All" || r.status === statusFilter)
            .filter((r) =>
                !s ||
                r.name.toLowerCase().includes(s) ||
                r.domain.toLowerCase().includes(s) ||
                r.owner.toLowerCase().includes(s)
            );
    }, [rows, q, statusFilter]);

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
                        <Table>
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
                                {filtered.map((r) => (
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
                </Card>
            </Stack>
        </Box>
    );
}
