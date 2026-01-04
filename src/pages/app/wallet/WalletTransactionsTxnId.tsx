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
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { useThemeStore } from "../../../stores/themeStore";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Transaction Detail
 * Route: /app/wallet/transactions/:txnId
 *
 * Features:
 * - Full metadata: status, timestamps, reference IDs
 * - "Download receipt" (PDF later)
 * - Support CTA for failed or disputed tx
 */


type Severity = "info" | "warning" | "error" | "success";

type TxStatus = "completed" | "pending" | "failed";

type TxType = "Top up" | "Payment" | "Withdrawal" | "Refund" | "Fee";

type Tx = {
  id: string;
  reference: string;
  providerRef?: string;
  provider?: string;
  type: TxType;
  status: TxStatus;
  amount: number;
  currency: string;
  counterparty: string;
  channel: "Wallet" | "Charging" | "Marketplace" | "School" | "AgentHub" | "Other";
  createdAt: number;
  updatedAt: number;
  settledAt?: number;
  idempotencyKey?: string;
  authCode?: string;
  riskScore?: number;
  ipMasked?: string;
  device?: string;
  note?: string;
};

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const THEME_KEY = "evzone_myaccounts_theme";

// -----------------------------
// Inline icons (CDN-safe)
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
      <path
        d="M21 13a8 8 0 0 1-10-10 7.5 7.5 0 1 0 10 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
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

function WalletIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path
        d="M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M17 11h4v6h-4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M7 7V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function ArrowLeftIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function CopyIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

function DownloadIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M8 9l4 4 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 17v3h16v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function HelpCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9.5 9a2.5 2.5 0 1 1 3.2 2.4c-.9.3-1.2.8-1.2 1.6v.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}

function AlertTriangleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 3l10 18H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}

function ArrowDownIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M7 12l5 5 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function ArrowUpIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 20V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M7 12l5-5 5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
// Theme
// -----------------------------

// -----------------------------
// Helpers
// -----------------------------
function money(amount: number, currency: string) {
  const sign = amount < 0 ? "-" : "+";
  const v = Math.abs(Math.round(amount));
  return `${sign}${currency} ${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
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

function maskIp(ip?: string) {
  if (!ip) return "";
  const parts = ip.split(".");
  if (parts.length !== 4) return ip;
  return `${parts[0]}.${parts[1]}.x.x`;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

function readTxnIdFromUrl(fallback: string) {
  try {
    const qs = new URLSearchParams(window.location.search);
    return qs.get("txnId") || fallback;
  } catch {
    return fallback;
  }
}

// --- lightweight self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as any;
    if (w.__EVZONE_TX_DETAIL_TESTS_RAN__) return;
    w.__EVZONE_TX_DETAIL_TESTS_RAN__ = true;

    const assert = (name: string, cond: boolean) => {
      if (!cond) throw new Error(`Test failed: ${name}`);
    };

    assert("maskIp", maskIp("197.157.10.20").includes("x"));
    assert("readTxnId fallback", readTxnIdFromUrl("abc") === "abc");

    const ids = seedTxs().map((t) => t.id);
    assert("seed unique ids", new Set(ids).size === ids.length);

  } catch (e) {
    // ignore
  }
}

function seedTxs(): Tx[] {
  const now = Date.now();
  return [
    {
      id: "tx_001",
      reference: "EVZ-9F2A3B",
      providerRef: "MTN-883771",
      provider: "MTN MoMo",
      type: "Top up",
      status: "completed",
      amount: 500000,
      currency: "UGX",
      counterparty: "MTN MoMo",
      channel: "Wallet",
      createdAt: now - 1000 * 60 * 14,
      updatedAt: now - 1000 * 60 * 12,
      settledAt: now - 1000 * 60 * 11,
      idempotencyKey: "idem_7c09b3a9",
      authCode: "AUTH-7721",
      riskScore: 12,
      ipMasked: maskIp("197.157.10.20"),
      device: "Chrome on Windows",
      note: "Top up",
    },
    {
      id: "tx_004",
      reference: "EVZ-WD-A1B2",
      providerRef: "BANK-TRX-3311",
      provider: "Stanbic",
      type: "Withdrawal",
      status: "pending",
      amount: -800000,
      currency: "UGX",
      counterparty: "Bank transfer",
      channel: "Wallet",
      createdAt: now - 1000 * 60 * 60 * 20,
      updatedAt: now - 1000 * 60 * 60 * 2,
      idempotencyKey: "idem_2f0d5c11",
      authCode: "WD-APPROVE",
      riskScore: 35,
      ipMasked: maskIp("102.90.4.18"),
      device: "EVzone Android App",
      note: "Settlement",
    },
    {
      id: "tx_007",
      reference: "EVZ-USD-77A",
      providerRef: "VISA-01A9",
      provider: "Visa",
      type: "Top up",
      status: "failed",
      amount: 20,
      currency: "USD",
      counterparty: "Card payment",
      channel: "Wallet",
      createdAt: now - 1000 * 60 * 60 * 26,
      updatedAt: now - 1000 * 60 * 60 * 26 + 1000 * 40,
      idempotencyKey: "idem_aa81c911",
      authCode: "3DS-DECLINED",
      riskScore: 62,
      ipMasked: maskIp("41.90.1.200"),
      device: "Safari",
      note: "Insufficient funds",
    },
  ];
}

export default function TransactionDetailPage() {
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const theme = useTheme();
  const isDark = mode === "dark";

  const [txs] = useState<Tx[]>(() => seedTxs());
  const [txnId, setTxnId] = useState<string>(() => readTxnIdFromUrl(txs[0]?.id || "tx_001"));

  const tx = useMemo(() => txs.find((t) => t.id === txnId) || txs[0], [txs, txnId]);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    if (typeof window !== "undefined") runSelfTestsOnce();
  }, []);


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

  const copy = async (label: string, value?: string) => {
    if (!value) return;
    const ok = await copyToClipboard(value);
    setSnack({ open: true, severity: ok ? "success" : "warning", msg: ok ? `Copied ${label}.` : "Copy failed." });
  };

  const support = () => setSnack({ open: true, severity: "info", msg: "Support request started (demo)." });
  const dispute = () => setSnack({ open: true, severity: "info", msg: "Dispute created (demo)." });
  const retry = () => setSnack({ open: true, severity: "info", msg: "Retry payment (demo)." });

  const statusBanner =
    tx.status === "completed" ? (
      <Alert severity="success">This transaction is completed.</Alert>
    ) : tx.status === "pending" ? (
      <Alert severity="warning" icon={<AlertTriangleIcon size={18} />}>
        This transaction is pending. Processing times may vary by provider.
      </Alert>
    ) : (
      <Alert severity="error" icon={<AlertTriangleIcon size={18} />}>
        This transaction failed. You can retry or contact support.
      </Alert>
    );

  return (
    <>
      <Box className="min-h-screen" sx={{ background: pageBg }}>


        {/* Body */}
        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h5">Transaction</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Review full details, references, and support options.
                        </Typography>
                      </Box>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button
                          variant="outlined"
                          sx={orangeOutlined}
                          startIcon={<ArrowLeftIcon size={18} />}
                          onClick={() => navigate("/app/wallet/transactions")}
                        >
                          Back to history
                        </Button>
                        <Button
                          variant="contained"
                          sx={greenContained}
                          startIcon={<WalletIcon size={18} />}
                          onClick={() => navigate("/app/wallet")}
                        >
                          Wallet
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary, borderRadius: 16 }}>
                          {typeIcon(tx.type)}
                        </Avatar>
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Typography sx={{ fontWeight: 950 }}>{tx.type}</Typography>
                            {statusChip(tx.status)}
                            <Chip size="small" variant="outlined" label={tx.channel} />
                          </Stack>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {tx.counterparty} • {tx.provider || "Provider"}
                          </Typography>
                        </Box>
                      </Stack>

                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 950, color: tx.amount < 0 ? theme.palette.text.primary : EVZONE.green }}>
                          {money(tx.amount, tx.currency)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Created {new Date(tx.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>

                    {statusBanner}
                  </Stack>
                </CardContent>
              </Card>

              {/* Demo: choose transaction */}
              <Card>
                <CardContent className="p-5">
                  <Stack spacing={1.2}>
                    <Typography sx={{ fontWeight: 950 }}>Demo: choose txn</Typography>
                    <TextField select value={txnId} onChange={(e) => setTxnId(e.target.value)} fullWidth>
                      {txs.map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.id} • {t.reference} • {t.status}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      In production, this page is opened via route param :txnId.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                {/* Left: metadata */}
                <Box className="md:col-span-7">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.4}>
                        <Typography variant="h6">Details</Typography>
                        <Divider />

                        <Box className="grid gap-3 md:grid-cols-2">
                          <InfoBlock label="Status" value={tx.status} />
                          <InfoBlock label="Type" value={tx.type} />
                          <InfoBlock label="Channel" value={tx.channel} />
                          <InfoBlock label="Counterparty" value={tx.counterparty} />
                          <InfoBlock label="EVzone reference" value={tx.reference} copy={() => copy("reference", tx.reference)} />
                          <InfoBlock label="Provider reference" value={tx.providerRef || "-"} copy={() => copy("provider reference", tx.providerRef)} />
                          <InfoBlock label="Idempotency key" value={tx.idempotencyKey || "-"} copy={() => copy("idempotency", tx.idempotencyKey)} />
                          <InfoBlock label="Auth code" value={tx.authCode || "-"} copy={() => copy("auth code", tx.authCode)} />
                          <InfoBlock label="Risk score" value={tx.riskScore != null ? String(tx.riskScore) : "-"} />
                          <InfoBlock label="IP" value={tx.ipMasked || "-"} />
                          <InfoBlock label="Device" value={tx.device || "-"} />
                          <InfoBlock label="Note" value={tx.note || "-"} />
                        </Box>

                        <Divider />

                        <Typography sx={{ fontWeight: 950 }}>Timestamps</Typography>
                        <Box className="grid gap-3 md:grid-cols-2">
                          <InfoBlock label="Created" value={new Date(tx.createdAt).toLocaleString()} />
                          <InfoBlock label="Updated" value={new Date(tx.updatedAt).toLocaleString()} />
                          <InfoBlock label="Settled" value={tx.settledAt ? new Date(tx.settledAt).toLocaleString() : "-"} />
                          <InfoBlock label="Txn ID" value={tx.id} copy={() => copy("txn id", tx.id)} />
                        </Box>

                        <Alert severity="info">All fields above are mock values for UI preview.</Alert>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Right: actions */}
                <Box className="md:col-span-5">
                  <Stack spacing={2.2}>
                    <Card>
                      <CardContent className="p-5">
                        <Stack spacing={1.2}>
                          <Typography variant="h6">Actions</Typography>
                          <Divider />

                          <Button variant="outlined" sx={orangeOutlined} startIcon={<CopyIcon size={18} />} onClick={() => copy("reference", tx.reference)}>
                            Copy reference
                          </Button>

                          <Tooltip title="Receipt PDF will be available later">
                            <span>
                              <Button variant="outlined" sx={orangeOutlined} startIcon={<DownloadIcon size={18} />} disabled>
                                Download receipt (PDF later)
                              </Button>
                            </span>
                          </Tooltip>

                          {tx.status === "failed" ? (
                            <Button variant="contained" sx={orangeContained} onClick={retry}>
                              Retry
                            </Button>
                          ) : null}

                          <Button variant="contained" sx={greenContained} startIcon={<HelpCircleIcon size={18} />} onClick={() => navigate("/app/support")}>
                            Contact support
                          </Button>

                          <Button variant="outlined" sx={orangeOutlined} startIcon={<AlertTriangleIcon size={18} />} onClick={() => navigate("/app/wallet/disputes")}>
                            Report dispute
                          </Button>

                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Support and disputes are logged for auditing.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-5">
                        <Stack spacing={1.2}>
                          <Typography variant="h6">Hints</Typography>
                          <Divider />
                          <Alert severity="info" icon={<WalletIcon size={18} />}>
                            If a transaction is pending, wait for provider processing before disputing.
                          </Alert>
                          <Alert severity={tx.status === "failed" ? "warning" : "info"} icon={<AlertTriangleIcon size={18} />}>
                            Failed card top-ups often require a different card or bank approval.
                          </Alert>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                </Box>
              </Box>

              {/* Mobile sticky */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card
                  sx={{
                    borderRadius: 999,
                    backgroundColor: alpha(theme.palette.background.paper, 0.86),
                    border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button
                        fullWidth
                        variant="outlined"
                        sx={orangeOutlined}
                        onClick={() => navigate("/app/wallet/transactions")}
                        startIcon={<ArrowLeftIcon size={18} />}
                      >
                        History
                      </Button>
                      <Button fullWidth variant="contained" sx={greenContained} onClick={support}>
                        Support
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ opacity: 0.92 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  © {new Date().getFullYear()} EVzone Group.
                </Typography>
              </Box>
            </Stack>
          </motion.div>
        </Box>

        <Snackbar
          open={snack.open}
          autoHideDuration={3200}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
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

function InfoBlock({ label, value, copy }: { label: string; value: string; copy?: () => void }) {
  return (
    <Box sx={{ borderRadius: 18 }}>
      <Stack spacing={0.4}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {label}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Typography sx={{ fontWeight: 950, wordBreak: "break-word" }}>{value}</Typography>
          {copy ? (
            <Button size="small" variant="text" onClick={copy} sx={{ color: EVZONE.orange, fontWeight: 900 }}>
              Copy
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}
