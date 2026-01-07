import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
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
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { useThemeStore } from "../../../stores/themeStore";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Disputes & Chargebacks
 * Route: /app/wallet/disputes
 *
 * Features:
 * - List disputes
 * - Create dispute from transaction detail
 * - Upload evidence
 * - Status tracking
 */

type Severity = "info" | "warning" | "error" | "success";

type DisputeStatus = "Open" | "Under review" | "Awaiting evidence" | "Won" | "Lost" | "Closed";

type DisputeReason =
  | "Unauthorized transaction"
  | "Service not received"
  | "Duplicate charge"
  | "Incorrect amount"
  | "Refund not received"
  | "Other";

type Evidence = { id: string; name: string; size: number; type: string };

type Dispute = {
  id: string;
  txnId: string;
  reference: string;
  amount: number;
  currency: string;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  createdAt: number;
  updatedAt: number;
  evidence: Evidence[];
};

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const THEME_KEY = "evzone_myaccounts_theme";

const MAX_EVIDENCE_MB = 10;
const MAX_EVIDENCE_BYTES = MAX_EVIDENCE_MB * 1024 * 1024;
const EVIDENCE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

// -----------------------------
// Inline icons
// -----------------------------
function IconBase({ size = 18, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block" }}
    >
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

function ScaleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 7 4 13h6L7 7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 7 14 13h6l-3-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 21h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function UploadIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function TrashIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 7l1 14h10l1-14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function DocumentIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M7 3h8l4 4v14H7V3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

// -----------------------------
// Theme
// -----------------------------

// -----------------------------
// Helpers
// -----------------------------
function money(amount: number, currency: string) {
  const sign = amount < 0 ? "-" : "";
  const v = Math.abs(Math.round(amount));
  return `${sign}${currency} ${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function toSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

function statusChip(s: DisputeStatus) {
  if (s === "Won") return <Chip size="small" color="success" label="Won" />;
  if (s === "Lost") return <Chip size="small" color="error" label="Lost" />;
  if (s === "Closed") return <Chip size="small" variant="outlined" label="Closed" />;
  if (s === "Under review") return <Chip size="small" color="warning" label="Under review" />;
  if (s === "Awaiting evidence") return <Chip size="small" color="warning" label="Awaiting evidence" />;
  return <Chip size="small" color="info" label="Open" />;
}

function stepForStatus(s: DisputeStatus) {
  if (s === "Open") return 0;
  if (s === "Awaiting evidence") return 1;
  if (s === "Under review") return 2;
  if (s === "Won" || s === "Lost" || s === "Closed") return 3;
  return 0;
}

function canAddEvidence(s: DisputeStatus) {
  return s === "Open" || s === "Awaiting evidence" || s === "Under review";
}

function validateEvidenceFile(f: File) {
  if (!EVIDENCE_TYPES.includes(f.type)) return "Unsupported file type.";
  if (f.size > MAX_EVIDENCE_BYTES) return `File too large. Max ${MAX_EVIDENCE_MB}MB.`;
  return null;
}

function mkId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

function readQueryParam(key: string) {
  try {
    const qs = new URLSearchParams(window.location.search);
    return qs.get(key) || "";
  } catch {
    return "";
  }
}

// --- lightweight self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as Window & { __EVZONE_DISPUTES_TESTS_RAN__?: boolean };
    if (w.__EVZONE_DISPUTES_TESTS_RAN__) return;
    w.__EVZONE_DISPUTES_TESTS_RAN__ = true;
    const assert = (name: string, cond: boolean) => {
      if (!cond) throw new Error(`Test failed: ${name}`);
    };
    assert("mkId", mkId("D").startsWith("D_"));
    assert("stepForStatus", stepForStatus("Won") === 3);
  } catch (e) {
    // ignore
  }
}

import { api } from "../../../utils/api";

// ... (existing imports)

// ...

export default function DisputesChargebacksPage() {
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const theme = useTheme();
  const isDark = mode === "dark";

  const prefillTxnId = readQueryParam("txnId");
  const prefillRef = readQueryParam("reference");

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const greenContained = {
    backgroundColor: EVZONE.green,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.green, mode === "dark" ? 0.24 : 0.16)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.green, 0.92), color: "#FFFFFF" },
  } as const;

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



  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await api.get<Dispute[]>('/wallets/disputes');
      if (Array.isArray(res)) {
        setDisputes(res.map((d: any) => ({
          ...d,
          createdAt: new Date(d.createdAt).getTime(),
          updatedAt: new Date(d.updatedAt).getTime()
        })));
      }
    } catch (err) {
      console.error("Failed to fetch disputes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const [selectedId, setSelectedId] = useState<string>("");
  const selected = useMemo(() => disputes.find((d) => d.id === selectedId) || disputes[0], [disputes, selectedId]);

  const [filterStatus, setFilterStatus] = useState<"all" | DisputeStatus>("all");
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [newTxnId, setNewTxnId] = useState(prefillTxnId || "");
  const [newRef, setNewRef] = useState(prefillRef || "");
  const [newAmount, setNewAmount] = useState<string>("");
  const [newCurrency, setNewCurrency] = useState<string>("UGX");
  const [newReason, setNewReason] = useState<DisputeReason>("Unauthorized transaction");
  const [newDesc, setNewDesc] = useState("");
  const [newEvidence, setNewEvidence] = useState<Evidence[]>([]);

  const [evidenceAddOpen, setEvidenceAddOpen] = useState(false);
  const [evidenceTargetId, setEvidenceTargetId] = useState<string | null>(null);

  const inEvidence = useRef<HTMLInputElement | null>(null);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return disputes
      .filter((d) => (filterStatus === "all" ? true : d.status === filterStatus))
      .filter((d) => (!q ? true : [d.id, d.reference, d.txnId, d.reason].some((x) => x.toLowerCase().includes(q))))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [disputes, filterStatus, search]);

  const stats = useMemo(() => {
    const open = disputes.filter((d) => d.status === "Open" || d.status === "Awaiting evidence" || d.status === "Under review").length;
    const resolved = disputes.filter((d) => d.status === "Won" || d.status === "Lost" || d.status === "Closed").length;
    return { total: disputes.length, open, resolved };
  }, [disputes]);

  const openCreate = () => {
    setNewTxnId(prefillTxnId || "");
    setNewRef(prefillRef || "");
    setNewAmount("");
    setNewCurrency("UGX");
    setNewReason("Unauthorized transaction");
    setNewDesc("");
    setNewEvidence([]);
    setCreateOpen(true);
  };

  const addEvidenceToNew = (files: FileList | null) => {
    if (!files?.length) return;
    const next: Evidence[] = [];
    for (const f of Array.from(files)) {
      const err = validateEvidenceFile(f);
      if (err) {
        setSnack({ open: true, severity: "warning", msg: err });
        continue;
      }
      next.push({ id: mkId("EV"), name: f.name, size: f.size, type: f.type });
    }
    setNewEvidence((p) => [...p, ...next]);
  };

  const removeNewEvidence = (id: string) => setNewEvidence((p) => p.filter((e) => e.id !== id));

  const create = async () => {
    if (!newTxnId.trim() && !newRef.trim()) {
      setSnack({ open: true, severity: "warning", msg: "Add a transaction ID or reference." });
      return;
    }
    if (!newDesc.trim() || newDesc.trim().length < 10) {
      setSnack({ open: true, severity: "warning", msg: "Describe the dispute (at least 10 characters)." });
      return;
    }

    try {
      const res = await api.post<any>('/wallets/disputes', {
        txnId: newTxnId.trim(),
        amount: Number(newAmount),
        currency: newCurrency,
        reason: newReason,
        description: newDesc.trim()
      });

      setDisputes((p) => [{ ...res, createdAt: new Date(res.createdAt).getTime(), updatedAt: new Date(res.updatedAt).getTime(), evidence: [] }, ...p]);
      setSelectedId(res.id);
      setCreateOpen(false);
      setSnack({ open: true, severity: "success", msg: "Dispute created." });

      // If we had evidence to upload, we would do it here
    } catch (err) {
      setSnack({ open: true, severity: "error", msg: "Failed to create dispute." });
    }
  };

  // ... (rest of the file)


  const openEvidenceAdd = (disputeId: string) => {
    setEvidenceTargetId(disputeId);
    setEvidenceAddOpen(true);
  };

  const addEvidenceToExisting = (files: FileList | null) => {
    if (!files?.length || !evidenceTargetId) return;

    const toAdd: Evidence[] = [];
    for (const f of Array.from(files)) {
      const err = validateEvidenceFile(f);
      if (err) {
        setSnack({ open: true, severity: "warning", msg: err });
        continue;
      }
      toAdd.push({ id: mkId("EV"), name: f.name, size: f.size, type: f.type });
    }

    if (!toAdd.length) return;

    setDisputes((prev) =>
      prev.map((d) =>
        d.id === evidenceTargetId
          ? { ...d, evidence: [...d.evidence, ...toAdd], status: d.status === "Awaiting evidence" ? "Open" : d.status, updatedAt: Date.now() }
          : d
      )
    );

    setSnack({ open: true, severity: "success", msg: "Evidence added (demo)." });
  };

  const removeEvidence = (disputeId: string, evidenceId: string) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? { ...d, evidence: d.evidence.filter((e) => e.id !== evidenceId), updatedAt: Date.now() }
          : d
      )
    );
  };

  const updateStatus = (disputeId: string, status: DisputeStatus) => {
    setDisputes((prev) => prev.map((d) => (d.id === disputeId ? { ...d, status, updatedAt: Date.now() } : d)));
    setSnack({ open: true, severity: "info", msg: "Status updated (demo)." });
  };

  const steps = ["Submitted", "Awaiting evidence", "Under review", "Resolved"];

  return (
    <>
      <CssBaseline />

      <input
        ref={inEvidence}
        type="file"
        accept={EVIDENCE_TYPES.join(",")}
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          if (createOpen) addEvidenceToNew(e.target.files);
          else addEvidenceToExisting(e.target.files);
        }}
      />

      <Box className="min-h-screen" sx={{ background: pageBg }}>


        {/* Body */}
        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              {/* Header */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h5">Disputes and chargebacks</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Track disputes. Add evidence quickly to improve resolution.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          <Chip size="small" color="info" label={`${stats.open} open`} />
                          <Chip size="small" variant="outlined" label={`${stats.resolved} resolved`} />
                          <Chip size="small" variant="outlined" label={`Total: ${stats.total}`} />
                        </Stack>
                      </Box>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/wallet/transactions")}>
                          Create from transaction
                        </Button>
                        <Button variant="contained" sx={greenContained} startIcon={<PlusIcon size={18} />} onClick={openCreate}>
                          New dispute
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Box className="grid gap-3 md:grid-cols-3">
                      <TextField
                        label="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by ID, reference"
                        fullWidth
                        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon size={18} /></InputAdornment>) }}
                      />
                      <TextField select label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as DisputeStatus | "all")} fullWidth>
                        <MenuItem value="all">All</MenuItem>
                        {(["Open", "Awaiting evidence", "Under review", "Won", "Lost", "Closed"] as DisputeStatus[]).map((s) => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </TextField>
                      <Alert severity="info" icon={<ShieldCheckIcon size={18} />} sx={{ m: 0 }}>
                        Evidence files: JPG/PNG/WEBP/PDF up to {MAX_EVIDENCE_MB}MB.
                      </Alert>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                {/* List */}
                <Box className="md:col-span-7">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.2}>
                        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={1.2}>
                          <Typography variant="h6">Disputes</Typography>
                          <Chip size="small" variant="outlined" label={`${filtered.length} shown`} />
                        </Stack>
                        <Divider />

                        {/* Desktop table */}
                        <Box sx={{ display: { xs: "none", md: "block" } }}>
                          <TableContainer sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden" }}>
                            <Table size="small" sx={{ minWidth: 800 }}>
                              <TableHead>
                                <TableRow sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.55) }}>
                                  <TableCell sx={{ fontWeight: 950 }}>Dispute</TableCell>
                                  <TableCell sx={{ fontWeight: 950 }}>Transaction</TableCell>
                                  <TableCell sx={{ fontWeight: 950 }}>Reason</TableCell>
                                  <TableCell sx={{ fontWeight: 950 }}>Status</TableCell>
                                  <TableCell sx={{ fontWeight: 950, textAlign: "right" }}>Open</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {filtered.map((d) => (
                                  <TableRow key={d.id} hover onClick={() => setSelectedId(d.id)} sx={{ cursor: "pointer" }}>
                                    <TableCell>
                                      <Typography sx={{ fontWeight: 950 }}>{d.id}</Typography>
                                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Updated {new Date(d.updatedAt).toLocaleString()}</Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography sx={{ fontWeight: 950 }}>{d.reference}</Typography>
                                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{d.txnId}</Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography sx={{ fontWeight: 900 }}>{d.reason}</Typography>
                                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{money(d.amount, d.currency)}</Typography>
                                    </TableCell>
                                    <TableCell>{statusChip(d.status)}</TableCell>
                                    <TableCell sx={{ textAlign: "right" }}>
                                      <Button variant="text" sx={{ color: EVZONE.orange, fontWeight: 900 }} endIcon={<ArrowRightIcon size={18} />} onClick={(e) => { e.stopPropagation(); setSelectedId(d.id); }}>
                                        Open
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>

                        {/* Mobile cards */}
                        <Box sx={{ display: { xs: "grid", md: "none" }, gap: 2 }}>
                          {filtered.map((d) => (
                            <Card key={d.id} onClick={() => setSelectedId(d.id)} sx={{ cursor: "pointer" }}>
                              <CardContent className="p-5">
                                <Stack spacing={1.0}>
                                  <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
                                    <Stack direction="row" spacing={1.2} alignItems="center">
                                      <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary, borderRadius: 16 }}>
                                        <ScaleIcon size={18} />
                                      </Avatar>
                                      <Box>
                                        <Typography sx={{ fontWeight: 950 }}>{d.id}</Typography>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{d.reference}</Typography>
                                      </Box>
                                    </Stack>
                                    {statusChip(d.status)}
                                  </Stack>
                                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Chip size="small" variant="outlined" label={d.reason} />
                                    <Chip size="small" variant="outlined" label={money(d.amount, d.currency)} />
                                    <Chip size="small" variant="outlined" label={`${d.evidence.length} evidence`} />
                                  </Stack>
                                  <Divider />
                                  <Button variant="contained" sx={greenContained} onClick={() => setSelectedId(d.id)} endIcon={<ArrowRightIcon size={18} />}>
                                    View details
                                  </Button>
                                </Stack>
                              </CardContent>
                            </Card>
                          ))}
                        </Box>

                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Tip: Add evidence early for faster resolution.
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Detail */}
                <Box className="md:col-span-5">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      {selected ? (
                        <Stack spacing={1.2}>
                          <Stack direction="row" spacing={1.2} alignItems="center">
                            <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary, borderRadius: 16 }}>
                              <ScaleIcon size={18} />
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="h6">{selected.id}</Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                {selected.reference} • {money(selected.amount, selected.currency)}
                              </Typography>
                            </Box>
                            {statusChip(selected.status)}
                          </Stack>

                          <Divider />

                          <Typography sx={{ fontWeight: 950 }}>Status tracking</Typography>
                          <Stepper activeStep={stepForStatus(selected.status)} alternativeLabel>
                            {steps.map((s) => (
                              <Step key={s}>
                                <StepLabel>{s}</StepLabel>
                              </Step>
                            ))}
                          </Stepper>

                          <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                            <Stack spacing={0.6}>
                              <Row label="Transaction ID" value={selected.txnId} />
                              <Row label="Reference" value={selected.reference} />
                              <Row label="Reason" value={selected.reason} />
                              <Row label="Updated" value={new Date(selected.updatedAt).toLocaleString()} />
                            </Stack>
                          </Box>

                          <Typography sx={{ fontWeight: 950 }}>Description</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {selected.description}
                          </Typography>

                          <Divider />

                          <Typography sx={{ fontWeight: 950 }}>Evidence</Typography>
                          {selected.evidence.length ? (
                            <Stack spacing={0.8}>
                              {selected.evidence.map((e) => (
                                <Box key={e.id} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.35), p: 1.0 }}>
                                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <DocumentIcon size={18} />
                                      <Box>
                                        <Typography sx={{ fontWeight: 950 }}>{e.name}</Typography>
                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{toSize(e.size)} • {e.type}</Typography>
                                      </Box>
                                    </Stack>
                                    <Button
                                      variant="outlined"
                                      sx={orangeOutlined}
                                      startIcon={<TrashIcon size={18} />}
                                      onClick={() => removeEvidence(selected.id, e.id)}
                                      disabled={!canAddEvidence(selected.status)}
                                    >
                                      Remove
                                    </Button>
                                  </Stack>
                                </Box>
                              ))}
                            </Stack>
                          ) : (
                            <Alert severity="warning">No evidence uploaded yet.</Alert>
                          )}

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button
                              variant="contained"
                              sx={orangeContained}
                              startIcon={<UploadIcon size={18} />}
                              onClick={() => {
                                if (!selected) return;
                                setEvidenceTargetId(selected.id);
                                setCreateOpen(false);
                                inEvidence.current?.click();
                              }}
                              disabled={!selected || !canAddEvidence(selected.status)}
                            >
                              Add evidence
                            </Button>
                            <Button variant="outlined" size="small" sx={orangeOutlined} startIcon={<ArrowRightIcon size={16} />} onClick={() => navigate(`/app/wallet/transactions/${selected.txnId}`)}>
                              View transaction
                            </Button>
                          </Stack>

                          <Divider />

                          <Typography sx={{ fontWeight: 950 }}>Admin actions (demo)</Typography>
                          <TextField
                            select
                            size="small"
                            label="Set status"
                            value={selected.status}
                            onChange={(e) => updateStatus(selected.id, e.target.value as DisputeStatus)}
                            fullWidth
                          >
                            {(["Open", "Awaiting evidence", "Under review", "Won", "Lost", "Closed"] as DisputeStatus[]).map((s) => (
                              <MenuItem key={s} value={s}>{s}</MenuItem>
                            ))}
                          </TextField>

                          <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                            Disputes are audit logged. Resolution time depends on provider.
                          </Alert>
                        </Stack>
                      ) : (
                        <Alert severity="info">Select a dispute to view details.</Alert>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              {/* Mobile sticky */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={openCreate}>
                        New
                      </Button>
                      <Button fullWidth variant="contained" sx={greenContained} onClick={() => selected && openEvidenceAdd(selected.id)} disabled={!selected || !canAddEvidence(selected.status)}>
                        Evidence
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ opacity: 0.92 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group.</Typography>
              </Box>
            </Stack>
          </motion.div>
        </Box>

        {/* Create dispute dialog */}
        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Create dispute</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                You can start this from a transaction detail page. Provide as much detail as possible.
              </Typography>

              <Box className="grid gap-3 md:grid-cols-2">
                <TextField value={newTxnId} onChange={(e) => setNewTxnId(e.target.value)} label="Transaction ID" placeholder="tx_..." fullWidth />
                <TextField value={newRef} onChange={(e) => setNewRef(e.target.value)} label="Reference" placeholder="EVZ-..." fullWidth />
              </Box>

              <Box className="grid gap-3 md:grid-cols-2">
                <TextField value={newAmount} onChange={(e) => setNewAmount(e.target.value.replace(/[^0-9.]/g, ""))} label="Amount" placeholder="0" fullWidth />
                <TextField value={newCurrency} onChange={(e) => setNewCurrency(e.target.value.toUpperCase().slice(0, 3))} label="Currency" placeholder="UGX" fullWidth />
              </Box>

              <TextField select label="Reason" value={newReason} onChange={(e) => setNewReason(e.target.value as DisputeReason)} fullWidth>
                {([
                  "Unauthorized transaction",
                  "Service not received",
                  "Duplicate charge",
                  "Incorrect amount",
                  "Refund not received",
                  "Other",
                ] as DisputeReason[]).map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </TextField>

              <TextField value={newDesc} onChange={(e) => setNewDesc(e.target.value)} label="Description" placeholder="Explain what happened..." multiline minRows={4} fullWidth />

              <Divider />

              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Typography sx={{ fontWeight: 950 }}>Evidence ({newEvidence.length})</Typography>
                <Button variant="outlined" sx={orangeOutlined} startIcon={<UploadIcon size={18} />} onClick={() => { setCreateOpen(true); inEvidence.current?.click(); }}>
                  Add files
                </Button>
              </Stack>

              {newEvidence.length ? (
                <Stack spacing={0.8}>
                  {newEvidence.map((e) => (
                    <Box key={e.id} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.35), p: 1.0 }}>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <DocumentIcon size={18} />
                          <Box>
                            <Typography sx={{ fontWeight: 950 }}>{e.name}</Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{toSize(e.size)} • {e.type}</Typography>
                          </Box>
                        </Stack>
                        <Button variant="outlined" sx={orangeOutlined} startIcon={<TrashIcon size={18} />} onClick={() => removeNewEvidence(e.id)}>
                          Remove
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Alert severity="warning">No evidence added yet. You can still create the dispute.</Alert>
              )}

              <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                Submitting false disputes may lead to account restrictions.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" sx={greenContained} onClick={create}>
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Evidence add dialog (shortcut) */}
        <Dialog open={evidenceAddOpen} onClose={() => setEvidenceAddOpen(false)} PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Add evidence</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Add supporting files (JPG/PNG/WEBP/PDF). Max {MAX_EVIDENCE_MB}MB each.
              </Typography>
              <Button variant="contained" sx={orangeContained} startIcon={<UploadIcon size={18} />} onClick={() => { setEvidenceAddOpen(false); inEvidence.current?.click(); }}>
                Choose files
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setEvidenceAddOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" sx={{ color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ fontWeight: 950 }}>{value}</Typography>
    </Stack>
  );
}
