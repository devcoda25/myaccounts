import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useThemeStore } from "../../../stores/themeStore";
import { motion } from "framer-motion";
import { api } from "../../../utils/api";
import { ITransaction, TxType, TxStatus } from "../../../utils/types";
import { formatTransactionId } from "../../../utils/format";

type Severity = "info" | "warning" | "error" | "success";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

// -----------------------------
// Icons
// -----------------------------
function IconBase({ size = 18, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      {children}
    </svg>
  );
}

function WalletIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 11h4v6h-4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 7V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function FilterIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M4 5h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 19h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function DownloadIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 9l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v3h16v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function ArrowDownIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 12l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function ArrowUpIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 20V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 12l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function ReceiptIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M6 2h12v20l-2-1-2 1-2-1-2 1-2-1-2 1V2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 7h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

// -----------------------------
// Helpers
// -----------------------------
function money(amount: number, currency: string) {
  const sign = amount < 0 ? "-" : "+";
  const v = Math.abs(Math.round(amount));
  return `${sign}${currency} ${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const d = Math.floor(hr / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

function statusChip(status: TxStatus) {
  if (status === "completed") return <Chip size="small" color="success" label="Completed" />;
  if (status === "pending") return <Chip size="small" color="warning" label="Pending" />;
  return <Chip size="small" color="error" label="Failed" />;
}

function typeIcon(type: TxType) {
  if (type === "Top up" || type === "Refund") return <ArrowDownIcon size={18} />;
  if (type === "Payment" || type === "Withdrawal") return <ArrowUpIcon size={18} />;
  return <ReceiptIcon size={18} />;
}

function dateToTsStart(v: string) {
  if (!v) return -Infinity;
  const ts = new Date(v + "T00:00:00").getTime();
  return Number.isFinite(ts) ? ts : -Infinity;
}

function dateToTsEnd(v: string) {
  if (!v) return Infinity;
  const ts = new Date(v + "T23:59:59").getTime();
  return Number.isFinite(ts) ? ts : Infinity;
}

function exportCsv(rows: ITransaction[]) {
  const header = ["id", "reference", "providerRef", "type", "status", "amount", "currency", "counterparty", "channel", "createdAt"];
  const data = rows.map((r) => [
    r.id,
    r.referenceId || "",
    r.providerRef || "",
    r.type,
    r.status,
    String(r.amount),
    r.currency,
    r.counterparty,
    r.channel,
    r.createdAt,
  ]);

  const csv = [header, ...data]
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "evzone-transactions.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function TransactionHistoryPage() {
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const theme = useTheme();
  const isDark = mode === "dark";

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState<"all" | TxType>("all");
  const [status, setStatus] = useState<"all" | TxStatus>("all");
  const [search, setSearch] = useState("");

  const [txs, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await api<{ data: ITransaction[]; total: number }>('/wallets/me/transactions?take=50');
        setTransactions(response.data || []);
      } catch (err) {
        console.error("Failed to load history", err);
        setSnack({ open: true, severity: "error", msg: "Failed to load transactions." });
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const start = dateToTsStart(from);
    const end = dateToTsEnd(to);

    return txs
      .filter((t) => {
        const ts = new Date(t.createdAt).getTime();
        return ts >= start && ts <= end;
      })
      .filter((t) => (type === "all" ? true : t.type === type))
      .filter((t) => (status === "all" ? true : t.status === status))
      .filter((t) => (!q ? true : [t.referenceId || "", t.providerRef || "", formatTransactionId(t.id)].some((x) => x.toLowerCase().includes(q))))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [txs, from, to, type, status, search]);

  const stats = useMemo(() => {
    const completed = filtered.filter((t) => t.status === "completed").length;
    const pending = filtered.filter((t) => t.status === "pending").length;
    const failed = filtered.filter((t) => t.status === "failed").length;
    return { total: filtered.length, completed, pending, failed };
  }, [filtered]);

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

  const orangeOutlined = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const openDetail = (id: string) => {
    navigate(`/app/wallet/transactions/${id}`);
  };

  return (
    <>
      <Box className="min-h-screen" sx={{ background: pageBg }}>
        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              {/* Header */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      alignItems={{ xs: "flex-start", md: "center" }}
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography variant="h5">Transaction history</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Filter and search by reference. Tap any transaction to view details.
                        </Typography>
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                        <Button variant="outlined" sx={orangeOutlined} startIcon={<DownloadIcon size={18} />} onClick={() => exportCsv(filtered)}>
                          Export CSV
                        </Button>
                        <Button
                          variant="contained"
                          sx={greenContained}
                          startIcon={<WalletIcon size={18} />}
                          onClick={() => navigate("/app/wallet")}
                        >
                          Back to wallet
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Box className="grid gap-3 md:grid-cols-4">
                      <Stat label="Results" value={stats.total} />
                      <Stat label="Completed" value={stats.completed} />
                      <Stat label="Pending" value={stats.pending} />
                      <Stat label="Failed" value={stats.failed} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Filters */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.4}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FilterIcon size={18} />
                      <Typography variant="h6">Filters</Typography>
                    </Stack>

                    <Box className="grid gap-3 md:grid-cols-5">
                      <TextField type="date" label="From" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
                      <TextField type="date" label="To" value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
                      <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value as "all" | TxType)} fullWidth>
                        <MenuItem value="all">All</MenuItem>
                        {(["Top up", "Payment", "Withdrawal", "Refund", "Fee"] as TxType[]).map((t) => (
                          <MenuItem key={t} value={t}>
                            {t}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value as "all" | TxStatus)} fullWidth>
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                      </TextField>
                      <TextField
                        label="Search reference"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        fullWidth
                        placeholder="EVZ-..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon size={18} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button
                        variant="outlined"
                        sx={orangeOutlined}
                        onClick={() => {
                          setFrom("");
                          setTo("");
                          setType("all");
                          setStatus("all");
                          setSearch("");
                          setSnack({ open: true, severity: "info", msg: "Filters cleared." });
                        }}
                      >
                        Clear
                      </Button>
                      <Button variant="outlined" sx={orangeOutlined} startIcon={<DownloadIcon size={18} />} onClick={() => exportCsv(filtered)}>
                        Export filtered
                      </Button>
                    </Stack>

                    <Alert severity="info" icon={<WalletIcon size={18} />}>
                      Export uses the filtered results shown on this page.
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>

              {/* Desktop table */}
              <Card sx={{ display: { xs: "none", md: "block" } }}>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Typography variant="h6">Transactions</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {filtered.length} result(s)
                    </Typography>

                    <Divider />

                    <TableContainer sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden" }}>
                      <Table size="small" sx={{ minWidth: 800 }}>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.55) }}>
                            <TableCell sx={{ fontWeight: 950 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 950 }}>Reference</TableCell>
                            <TableCell sx={{ fontWeight: 950 }}>Counterparty</TableCell>
                            <TableCell sx={{ fontWeight: 950 }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 950 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 950 }}>When</TableCell>
                            <TableCell sx={{ fontWeight: 950, textAlign: "right" }}>Open</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filtered.map((t) => (
                            <TableRow key={t.id} hover onClick={() => openDetail(t.id)} sx={{ cursor: "pointer" }}>
                              <TableCell>
                                <Stack direction="row" spacing={1.1} alignItems="center">
                                  <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary, borderRadius: 16 }}>
                                    {typeIcon(t.type)}
                                  </Avatar>
                                  <Typography sx={{ fontWeight: 900 }}>{t.type}</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontWeight: 950 }}>{t.referenceId || "N/A"}</Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                  {t.providerRef ? `Prov: ${t.providerRef}` : ""}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontWeight: 900 }}>{t.counterparty}</Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{t.channel}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontWeight: 950, color: Number(t.amount) < 0 ? theme.palette.text.primary : EVZONE.green }}>{money(Number(t.amount), t.currency)}</Typography>
                              </TableCell>
                              <TableCell>{statusChip(t.status)}</TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{timeAgo(new Date(t.createdAt).getTime())}</Typography>
                              </TableCell>
                              <TableCell sx={{ textAlign: "right" }}>
                                <Button
                                  variant="text"
                                  sx={{ color: EVZONE.orange, fontWeight: 900 }}
                                  endIcon={<ArrowRightIcon size={18} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDetail(t.id);
                                  }}
                                >
                                  Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Stack>
                </CardContent>
              </Card>

              {/* Mobile cards */}
              <Box sx={{ display: { xs: "grid", md: "none" }, gap: 2 }}>
                {filtered.map((t) => (
                  <Card key={t.id} onClick={() => openDetail(t.id)} sx={{ cursor: "pointer" }}>
                    <CardContent className="p-5">
                      <Stack spacing={1.1}>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary, borderRadius: 16 }}>
                            {typeIcon(t.type)}
                          </Avatar>
                          <Box flex={1}>
                            <Typography sx={{ fontWeight: 950 }}>{t.type}</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{t.counterparty}</Typography>
                          </Box>
                          {statusChip(t.status)}
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip size="small" variant="outlined" label={t.referenceId || "N/A"} />
                          {t.providerRef ? <Chip size="small" variant="outlined" label={`Prov: ${t.providerRef}`} /> : null}
                          <Chip size="small" variant="outlined" label={t.channel} />
                          <Chip size="small" variant="outlined" label={timeAgo(new Date(t.createdAt).getTime())} />
                        </Stack>

                        <Divider />

                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography sx={{ fontWeight: 950, color: Number(t.amount) < 0 ? theme.palette.text.primary : EVZONE.green }}>{money(Number(t.amount), t.currency)}</Typography>
                          <Button size="small" variant="text" sx={{ color: EVZONE.orange, fontWeight: 900 }} endIcon={<ArrowRightIcon size={18} />}>
                            Open
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {/* Mobile sticky actions */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => exportCsv(filtered)} startIcon={<DownloadIcon size={18} />}>
                        Export
                      </Button>
                      <Button fullWidth variant="contained" sx={greenContained} onClick={() => navigate("/app/wallet")}>
                        Wallet
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

        {/* Snackbar */}
        <Snackbar open={snack.open} autoHideDuration={3200} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            severity={snack.severity}
            variant={mode === "dark" ? "filled" : "standard"}
            sx={{
              borderRadius: 16,
              border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
              backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96),
              color: theme.palette.text.primary,
            }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ borderRadius: 18, border: `1px solid rgba(0,0,0,0.0)`, backgroundColor: alpha("#FFFFFF", 0) }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ fontWeight: 950 }}>{value}</Typography>
    </Box>
  );
}
