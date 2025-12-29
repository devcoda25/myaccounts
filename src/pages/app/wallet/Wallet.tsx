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
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeContext } from "../../../theme/ThemeContext";
import { EVZONE } from "../../../theme/evzone";

/**
 * EVzone My Accounts - Wallet Overview
 * Route: /app/wallet
 *
 * Features:
 * - Balance card (primary currency)
 * - Add funds CTA (green)
 * - Withdraw CTA
 * - Recent transactions
 * - Limits + KYC status banner
 */

type ThemeMode = "light" | "dark";

type Severity = "info" | "warning" | "error" | "success";

type TxStatus = "completed" | "pending" | "failed";

type TxType = "Top up" | "Payment" | "Withdrawal" | "Refund" | "Fee";

type WalletTx = {
  id: string;
  when: number;
  type: TxType;
  amount: number; // positive inflow, negative outflow
  currency: string;
  status: TxStatus;
  counterparty?: string;
  note?: string;
};

type KycTier = "Unverified" | "Basic" | "Full";

// Redundant EVZONE and THEME_KEY removed

// -----------------------------
// Inline icons (CDN-safe)
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

function WalletIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 11h4v6h-4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 7V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function ArrowDownIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 12l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function ArrowUpRightIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 7h10v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function ClockIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

// -----------------------------
// Helpers
// -----------------------------
function money(amount: number, currency = "UGX") {
  const sign = amount < 0 ? "-" : "";
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

function txStatusChip(status: TxStatus) {
  if (status === "completed") return <Chip size="small" color="success" label="Completed" />;
  if (status === "pending") return <Chip size="small" color="warning" label="Pending" />;
  return <Chip size="small" color="error" label="Failed" />;
}

function txIcon(type: TxType) {
  if (type === "Top up") return <ArrowDownIcon size={18} />;
  if (type === "Refund") return <ArrowDownIcon size={18} />;
  if (type === "Payment") return <ArrowUpIcon size={18} />;
  if (type === "Withdrawal") return <ArrowUpIcon size={18} />;
  return <ReceiptIcon size={18} />;
}

// --- lightweight self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as any;
    if (w.__EVZONE_WALLET_OVERVIEW_TESTS_RAN__) return;
    w.__EVZONE_WALLET_OVERVIEW_TESTS_RAN__ = true;

    const assert = (name: string, cond: boolean) => {
      if (!cond) throw new Error(`Test failed: ${name}`);
    };

    assert("money format", money(12000, "UGX").includes("UGX"));
    assert("timeAgo", typeof timeAgo(Date.now() - 1000) === "string");

  } catch (e) {
    // ignore
  }
}

export default function WalletPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useThemeContext();
  const isDark = mode === "dark";

  const [tab, setTab] = useState<0 | 1>(0);

  // Demo wallet state
  const currency = "UGX";
  const [balance] = useState<number>(1250000);
  const [available] = useState<number>(1135000);

  const [kycTier] = useState<KycTier>("Basic");
  const [dailyLimit] = useState<number>(kycTier === "Full" ? 20000000 : kycTier === "Basic" ? 5000000 : 1000000);
  const [monthlyLimit] = useState<number>(kycTier === "Full" ? 200000000 : kycTier === "Basic" ? 50000000 : 10000000);

  const [txs] = useState<WalletTx[]>(() => {
    const now = Date.now();
    return [
      { id: "tx_001", when: now - 1000 * 60 * 12, type: "Top up", amount: 500000, currency, status: "completed", counterparty: "MTN MoMo", note: "Top up" },
      { id: "tx_002", when: now - 1000 * 60 * 55, type: "Payment", amount: -120000, currency, status: "completed", counterparty: "EVzone Charging", note: "Charge session" },
      { id: "tx_003", when: now - 1000 * 60 * 60 * 6, type: "Payment", amount: -45000, currency, status: "completed", counterparty: "Marketplace", note: "Order #MLD-193" },
      { id: "tx_004", when: now - 1000 * 60 * 60 * 21, type: "Withdrawal", amount: -800000, currency, status: "pending", counterparty: "Bank transfer", note: "Settlement" },
      { id: "tx_005", when: now - 1000 * 60 * 60 * 24 * 8, type: "Refund", amount: 30000, currency, status: "completed", counterparty: "Marketplace", note: "Refund" },
    ];
  });

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    if (typeof window !== "undefined") runSelfTestsOnce();
  }, []);

  // toggleMode removed

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  // CTAs
  const greenContained = {
    backgroundColor: EVZONE.green,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.green, mode === "dark" ? 0.24 : 0.16)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.green, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.green, 0.86), color: "#FFFFFF" },
    borderRadius: "4px",
  } as const;

  const orangeContained = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.18)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
    borderRadius: "4px",
  } as const;

  const orangeOutlined = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
    borderRadius: "4px",
  } as const;

  const evOrangeContainedSx = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.18)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
    borderRadius: "4px",
  } as const;

  const evOrangeOutlinedSx = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
    borderRadius: "4px",
  } as const;

  const kycBanner =
    kycTier === "Full" ? (
      <Alert severity="success" icon={<ShieldCheckIcon size={18} />}>
        KYC verified (Full). Higher limits are enabled.
      </Alert>
    ) : kycTier === "Basic" ? (
      <Alert severity="warning" icon={<ShieldCheckIcon size={18} />}>
        KYC is Basic. Increase your limits by completing Full verification.
      </Alert>
    ) : (
      <Alert severity="warning" icon={<ShieldCheckIcon size={18} />}>
        KYC is not completed. Limits are restricted.
      </Alert>
    );

  const recent = txs
    .slice()
    .sort((a, b) => b.when - a.when)
    .slice(0, 8);

  const summary = useMemo(() => {
    const since = Date.now() - 1000 * 60 * 60 * 24 * 7;
    const week = txs.filter((t) => t.when >= since);
    const inflow = week.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
    const outflow = week.filter((t) => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);
    return { inflow, outflow };
  }, [txs]);

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>


      {/* Body */}
      <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Stack spacing={2.2}>
            {/* KYC banner */}
            {kycBanner}

            {/* Balance + actions */}
            <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
              <Box className="md:col-span-7">
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={1.4}>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Box sx={{ width: 44, height: 44, borderRadius: 16, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, 0.16), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                            <WalletIcon size={18} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 950 }}>Wallet balance</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Primary currency: {currency}</Typography>
                          </Box>
                        </Stack>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                          <Button variant="contained" color="secondary" sx={evOrangeContainedSx} startIcon={<PlusIcon size={18} />} onClick={() => navigate("/app/wallet/add-funds")}>
                            Add funds
                          </Button>
                          <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<ArrowUpRightIcon size={18} />} onClick={() => navigate("/app/wallet/withdraw")}>
                            Withdraw
                          </Button>
                        </Stack>
                      </Stack>

                      <Divider />

                      <Stack spacing={0.6}>
                        <Typography variant="h5" sx={{ fontWeight: 950 }}>
                          {money(balance, currency)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Available: <b>{money(available, currency)}</b> • Pending holds may apply.
                        </Typography>
                      </Stack>

                      <Box className="grid gap-3 sm:grid-cols-2">
                        <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>7-day inflow</Typography>
                          <Typography sx={{ fontWeight: 950 }}>{money(summary.inflow, currency)}</Typography>
                        </Box>
                        <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>7-day outflow</Typography>
                          <Typography sx={{ fontWeight: 950 }}>{money(-summary.outflow, currency)}</Typography>
                        </Box>
                      </Box>

                      <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                        For sensitive actions (withdrawals, changing payment methods) we may ask you to re-authenticate.
                      </Alert>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              <Box className="md:col-span-5">
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={1.2}>
                      <Typography variant="h6">Limits and status</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Limits depend on KYC tier and risk signals.
                      </Typography>
                      <Divider />

                      <Stack spacing={1.0}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>KYC tier</Typography>
                          <Chip size="small" color={kycTier === "Full" ? "success" : kycTier === "Basic" ? "warning" : "error"} label={kycTier} />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Daily limit</Typography>
                          <Typography sx={{ fontWeight: 950 }}>{money(dailyLimit, currency)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Monthly limit</Typography>
                          <Typography sx={{ fontWeight: 950 }}>{money(monthlyLimit, currency)}</Typography>
                        </Stack>
                      </Stack>

                      <Divider />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="contained" sx={orangeContained} onClick={() => navigate("/app/wallet/kyc")}>
                          Upgrade KYC
                        </Button>
                        <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/wallet/limits")}>
                          Limits policy
                        </Button>
                      </Stack>

                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Note: Limits shown are examples for UI preview.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Transactions */}
            <Card>
              <CardContent className="p-5 md:p-7">
                <Stack spacing={1.2}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Box>
                      <Typography variant="h6">Recent transactions</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Wallet activity across all EVzone modules.</Typography>
                    </Box>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => navigate("/app/wallet/transactions")}>
                        View all
                      </Button>
                      <Button variant="outlined" sx={orangeOutlined} onClick={() => setSnack({ open: true, severity: "info", msg: "Statement download is coming soon." })}>
                        Download statement
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}>
                    <Tab label="All" />
                    <Tab label="Pending" />
                  </Tabs>

                  <Stack spacing={1.2}>
                    {recent
                      .filter((t) => (tab === 1 ? t.status === "pending" : true))
                      .map((t) => (
                        <Box key={t.id} sx={{ borderRadius: 20, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                            <Stack direction="row" spacing={1.2} alignItems="center">
                              <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary, borderRadius: 16 }}>
                                {txIcon(t.type)}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontWeight: 950 }}>{t.type}</Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  {t.counterparty || "EVzone"} • {timeAgo(t.when)}
                                </Typography>
                                {t.note ? <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{t.note}</Typography> : null}
                              </Box>
                            </Stack>

                            <Stack direction={{ xs: "row", sm: "column" }} spacing={1} alignItems={{ xs: "center", sm: "flex-end" }} justifyContent="space-between" sx={{ width: { xs: "100%", sm: "auto" } }}>
                              <Typography sx={{ fontWeight: 950 }}>{money(t.amount, t.currency)}</Typography>
                              {txStatusChip(t.status)}
                            </Stack>
                          </Stack>
                        </Box>
                      ))}
                  </Stack>

                  <Alert severity="info" icon={<ClockIcon size={18} />}>
                    Pending withdrawals may take longer depending on bank processing times.
                  </Alert>
                </Stack>
              </CardContent>
            </Card>

            {/* Mobile sticky actions */}
            <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
              <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.85), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                <CardContent sx={{ py: 1.1, px: 1.2 }}>
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth variant="contained" sx={greenContained} onClick={() => navigate('/app/wallet/add-funds')}>
                      Add funds
                    </Button>
                    <Button fullWidth variant="contained" sx={orangeContained} onClick={() => navigate('/app/wallet/withdraw')}>
                      Withdraw
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

      <Snackbar open={snack.open} autoHideDuration={3200} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
