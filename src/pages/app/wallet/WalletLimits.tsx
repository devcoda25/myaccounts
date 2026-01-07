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
  LinearProgress,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Grid,
} from "@mui/material";
import { api } from "../../../utils/api";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { useThemeStore } from "../../../stores/themeStore";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Wallet Limits & Fees
 * Route: /app/wallet/limits
 *
 * Features:
 * • Current tier + daily/monthly limits
 * • Fees table
 * • Upgrade prompt (KYC)
 */

type Severity = "info" | "warning" | "error" | "success";

type KycTier = "Unverified" | "Basic" | "Full";

type FeeRow = {
  id: string;
  category: "Add funds" | "Withdraw" | "Payments" | "Chargebacks" | "FX";
  method: string;
  fee: string;
  notes?: string;
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

function CheckCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="m8.5 12 2.3 2.3L15.8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function AlertTriangleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 3l10 18H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
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

function WalletIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 11h4v6h-4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 7V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

// -----------------------------
// Theme
// -----------------------------

// -----------------------------
// Helpers
// -----------------------------
function money(n: number, currency: string) {
  const v = Math.round(Math.abs(n));
  const sign = n < 0 ? "-" : "";
  return `${sign}${currency} ${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function tierChip(t: KycTier) {
  if (t === "Full") return <Chip size="small" color="success" label="Full" />;
  if (t === "Basic") return <Chip size="small" color="warning" label="Basic" />;
  return <Chip size="small" color="error" label="Unverified" />;
}

// --- lightweight self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as any;
    if (w.__EVZONE_LIMITS_TESTS_RAN__) return;
    w.__EVZONE_LIMITS_TESTS_RAN__ = true;
    const assert = (name: string, cond: boolean) => {
      if (!cond) throw new Error(`Test failed: ${name}`);
    };
    assert("clamp01", clamp01(1.2) === 1);
    assert("money", money(12000, "UGX").includes("UGX"));
  } catch (e) {
    // ignore
  }
}

export default function WalletLimitsFeesPage() {
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const theme = useTheme();
  const isDark = mode === "dark";

  const currency = "UGX";
  const [tier, setTier] = useState<KycTier>("Basic");

  useEffect(() => {
    api<{ tier: KycTier }>('/kyc/status').then(res => {
      if (res && res.tier) {
        setTier(res.tier);
      }
    }).catch(err => console.error("Failed to load limits/tier", err));
  }, []);

  // Demo limits
  const dailyLimit = tier === "Full" ? 20000000 : tier === "Basic" ? 5000000 : 1000000;
  const monthlyLimit = tier === "Full" ? 200000000 : tier === "Basic" ? 50000000 : 10000000;

  // Demo usage (month-to-date)
  const usedToday = 1250000;
  const usedMonth = 16750000;

  const dailyPct = clamp01(usedToday / dailyLimit);
  const monthlyPct = clamp01(usedMonth / monthlyLimit);

  const [fees] = useState<FeeRow[]>(() => [
    { id: "f1", category: "Add funds", method: "MTN MoMo", fee: "1.5%", notes: "May vary by provider" },
    { id: "f2", category: "Add funds", method: "Airtel Money", fee: "1.5%", notes: "May vary by provider" },
    { id: "f3", category: "Add funds", method: "Card (Visa/Mastercard)", fee: "3.5% + UGX 500", notes: "3DS may apply" },
    { id: "f4", category: "Add funds", method: "Bank transfer", fee: "0%", notes: "1-2 business days" },

    { id: "f5", category: "Withdraw", method: "Mobile money", fee: "1.0% (min UGX 500)", notes: "Subject to limits" },
    { id: "f6", category: "Withdraw", method: "Bank transfer", fee: "1.0% + UGX 500", notes: "Bank processing time" },

    { id: "f7", category: "Payments", method: "EVzone services", fee: "0%", notes: "Service fees may apply" },
    { id: "f8", category: "FX", method: "Currency conversion", fee: "~1%", notes: "When supported" },

    { id: "f9", category: "Chargebacks", method: "Card disputes", fee: "Provider fee", notes: "If applicable" },
  ]);

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

  const orangeOutlined = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const grouped = useMemo(() => {
    const cats = ["Add funds", "Withdraw", "Payments", "FX", "Chargebacks"] as FeeRow["category"][];
    const map = new Map<FeeRow["category"], FeeRow[]>();
    cats.forEach((c) => map.set(c, []));
    fees.forEach((f) => {
      const arr = map.get(f.category) || [];
      arr.push(f);
      map.set(f.category, arr);
    });
    return Array.from(map.entries());
  }, [fees]);

  const upgradeNeeded = tier !== "Full";

  return (
    <>
      <Box className="min-h-screen" sx={{ background: pageBg }}>


        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              {/* Header */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Box>
                      <Typography variant="h5">Wallet limits and fees</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        See your current limits and how fees are calculated.
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                        <Chip icon={<ShieldCheckIcon size={16} />} label={`Tier: ${tier}`} variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" }, fontWeight: 900 }} />
                        {tierChip(tier)}
                        <Chip icon={<WalletIcon size={16} />} label={`Currency: ${currency}`} variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                      </Stack>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/wallet")}>
                        Back to wallet
                      </Button>
                      {tier === "Full" ? (
                        <Button variant="outlined" disabled startIcon={<CheckCircleIcon size={18} />}>
                          Verified
                        </Button>
                      ) : (
                        <Button variant="contained" sx={greenContained} startIcon={<ArrowUpIcon size={18} />} onClick={() => navigate("/app/wallet/kyc")}>
                          Upgrade KYC
                        </Button>
                      )}
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {upgradeNeeded ? (
                    <Alert severity="warning" icon={<AlertTriangleIcon size={18} />}>
                      Upgrade KYC to unlock higher limits and faster withdrawals.
                    </Alert>
                  ) : (
                    <Alert severity="success" icon={<ShieldCheckIcon size={18} />}>
                      Your account has full limits enabled.
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                {/* Limits */}
                <Box className="md:col-span-6">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.4}>
                        <Typography variant="h6">Limits</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Limits depend on KYC tier and risk signals.
                        </Typography>
                        <Divider />

                        <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                          <Stack spacing={0.8}>
                            <Typography sx={{ fontWeight: 950 }}>Daily</Typography>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Used today</Typography>
                              <Typography sx={{ fontWeight: 950 }}>{money(usedToday, currency)} / {money(dailyLimit, currency)}</Typography>
                            </Stack>
                            <LinearProgress variant="determinate" value={dailyPct * 100} />
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{Math.round(dailyPct * 100)}% used</Typography>
                          </Stack>
                        </Box>

                        <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                          <Stack spacing={0.8}>
                            <Typography sx={{ fontWeight: 950 }}>Monthly</Typography>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Used this month</Typography>
                              <Typography sx={{ fontWeight: 950 }}>{money(usedMonth, currency)} / {money(monthlyLimit, currency)}</Typography>
                            </Stack>
                            <LinearProgress variant="determinate" value={monthlyPct * 100} />
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{Math.round(monthlyPct * 100)}% used</Typography>
                          </Stack>
                        </Box>

                        <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                          Limits can change based on fraud risk checks.
                        </Alert>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Upgrade prompt OR Premium Status */}
                <Box className="md:col-span-6">
                  {tier === "Full" ? (
                    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${alpha(EVZONE.green, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`, border: `1px solid ${alpha(EVZONE.green, 0.3)}` }}>
                      <CardContent className="p-5 md:p-7">
                        <Stack spacing={1.4} height="100%" justifyContent="center">
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ p: 1, borderRadius: '50%', bgcolor: EVZONE.green, color: 'white', display: 'flex' }}>
                              <ShieldCheckIcon size={24} />
                            </Box>
                            <Box>
                              <Typography variant="h6" fontWeight={800} sx={{ color: EVZONE.green }}>Premium Status</Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Account Fully Verified</Typography>
                            </Box>
                          </Stack>

                          <Divider sx={{ my: 1.5, borderColor: alpha(EVZONE.green, 0.2) }} />

                          <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <CheckCircleIcon size={20} />
                              <Typography variant="body2" fontWeight={600}>Maximum limits active</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <CheckCircleIcon size={20} />
                              <Typography variant="body2" fontWeight={600}>Priority support</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <CheckCircleIcon size={20} />
                              <Typography variant="body2" fontWeight={600}>Exclusive features unlocked</Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-5 md:p-7">
                        <Stack spacing={1.4}>
                          <Typography variant="h6">Upgrade</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Increase limits and unlock advanced wallet features.
                          </Typography>
                          <Divider />

                          <Box className="grid gap-3 sm:grid-cols-2">
                            <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(EVZONE.green, 0.10), p: 1.4 }}>
                              <Typography sx={{ fontWeight: 950 }}>Full KYC</Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Higher limits, faster withdrawals.
                              </Typography>
                            </Box>
                            <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(EVZONE.orange, 0.10), p: 1.4 }}>
                              <Typography sx={{ fontWeight: 950 }}>Trusted devices</Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Reduce friction on re-auth.
                              </Typography>
                            </Box>
                          </Box>

                          <Alert severity="warning" icon={<AlertTriangleIcon size={18} />}>
                            Unverified accounts may have reduced limits and fewer payout options.
                          </Alert>

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button variant="contained" sx={greenContained} onClick={() => navigate("/app/wallet/kyc")}>
                              Start KYC
                            </Button>
                            <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/support")}>
                              Learn more
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  )}
                </Box>
              </Box>

              {/* Fees */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Typography variant="h6">Fees</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Fees shown here are examples for UI preview. Real fees come from providers.
                    </Typography>

                    <Divider />

                    <TableContainer sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden" }}>
                      <Table size="small" sx={{ minWidth: 800 }}>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.55) }}>
                            <TableCell sx={{ fontWeight: 950 }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 950 }}>Method</TableCell>
                            <TableCell sx={{ fontWeight: 950 }}>Fee</TableCell>
                            <TableCell sx={{ fontWeight: 950 }}>Notes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {grouped.flatMap(([cat, rows]) =>
                            rows.map((r) => (
                              <TableRow key={r.id} hover>
                                <TableCell>
                                  <Chip size="small" variant="outlined" label={cat} />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 900 }}>{r.method}</TableCell>
                                <TableCell sx={{ fontWeight: 950 }}>{r.fee}</TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{r.notes || "-"}</Typography>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Alert severity="info" icon={<WalletIcon size={18} />}>
                      Some providers may add their own network or processing fees.
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>

              {/* Mobile sticky */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/wallet")}>
                        Wallet
                      </Button>
                      {tier === "Full" ? (
                        <Button fullWidth variant="outlined" disabled startIcon={<CheckCircleIcon size={18} />}>
                          Verified
                        </Button>
                      ) : (
                        <Button fullWidth variant="contained" sx={greenContained} onClick={() => navigate("/app/wallet/kyc")}>
                          Upgrade
                        </Button>
                      )}
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

        <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
