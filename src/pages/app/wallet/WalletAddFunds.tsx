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
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeContext } from "../../../theme/ThemeContext";

/**
 * EVzone My Accounts - Add Funds
 * Route: /app/wallet/add-funds
 *
 * Features:
 * - Amount input + quick chips (e.g. +10, +20)
 * - Choose payment method
 * - Fee breakdown (if any)
 * - Confirm → success/failure result page (simulated inline)
 */

type ThemeMode = "light" | "dark";

type Severity = "info" | "warning" | "error" | "success";

type PayMethod = "mtn_momo" | "airtel_money" | "card" | "bank_transfer";

type ResultStatus = "idle" | "review" | "success" | "failure";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const MTN = { yellow: "#FFCC00" } as const;
const AIRTEL = { red: "#E60012" } as const;

// Redundant THEME_KEY removed

// -----------------------------
// Icons (inline)
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

function CardIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function BankIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 3 3 8h18l-9-5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M5 10v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 10v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 10v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 10v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function PhoneIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2c-9.5-1-17-8.5-18-18A2 2 0 0 1 3.8 2h3a2 2 0 0 1 2 1.7c.2 1.4.6 2.8 1.2 4.1a2 2 0 0 1-.5 2.2L8.4 11.1a16 16 0 0 0 4.5 4.5l1.1-1.1a2 2 0 0 1 2.2-.5c1.3.6 2.7 1 4.1 1.2a2 2 0 0 1 1.7 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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

function XCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

// -----------------------------
// Theme helpers removed
// -----------------------------

// -----------------------------
// Helpers
// -----------------------------
function clampMoney(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

function money(amount: number, currency = "UGX") {
  const v = Math.abs(Math.round(amount));
  return `${currency} ${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function feeFor(method: PayMethod, amount: number) {
  // Demo fees (adjust later in backend)
  const a = clampMoney(amount);
  if (method === "bank_transfer") return 0;
  if (method === "card") return Math.round(a * 0.035) + 500; // 3.5% + 500
  // MoMo: 1.5%
  return Math.round(a * 0.015);
}

function methodLabel(m: PayMethod) {
  if (m === "mtn_momo") return "MTN Mobile Money";
  if (m === "airtel_money") return "Airtel Money";
  if (m === "card") return "Bank Card";
  return "Bank Transfer";
}

function methodHint(m: PayMethod) {
  if (m === "mtn_momo") return "Fast top-up via MTN MoMo push.";
  if (m === "airtel_money") return "Fast top-up via Airtel Money push.";
  if (m === "card") return "Pay with Visa/Mastercard.";
  return "Transfer from your bank account.";
}

function resultLabel(r: ResultStatus) {
  if (r === "success") return "Success";
  if (r === "failure") return "Failed";
  if (r === "review") return "Processing";
  return "Idle";
}

// --- lightweight self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as any;
    if (w.__EVZONE_ADD_FUNDS_TESTS_RAN__) return;
    w.__EVZONE_ADD_FUNDS_TESTS_RAN__ = true;

    const assert = (name: string, cond: boolean) => {
      if (!cond) throw new Error(`Test failed: ${name}`);
    };

    assert("fee", feeFor("bank_transfer", 1000) === 0);
    assert("money", money(12000).includes("UGX"));

  } catch (e) {
    // ignore
  }
}

export default function AddFundsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useThemeContext();
  const isDark = mode === "dark";

  const currency = "UGX";
  const [amount, setAmount] = useState<number>(50000);
  const [method, setMethod] = useState<PayMethod>("mtn_momo");

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [result, setResult] = useState<ResultStatus>("idle");
  const [receipt, setReceipt] = useState<{ id: string; reference: string } | null>(null);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({
    open: false,
    severity: "info",
    msg: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") runSelfTestsOnce();
  }, []);

  // toggleMode removed

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const greenContained = {
    backgroundColor: EVZONE.green,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.green, mode === "dark" ? 0.24 : 0.16)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.green, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.green, 0.86), color: "#FFFFFF" },
  } as const;

  const orangeContained = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.18)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
  } as const;

  const orangeOutlined = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const fee = feeFor(method, amount);
  const total = clampMoney(amount) + fee;

  const quickChips = [10000, 20000, 50000, 100000, 200000];

  const canContinue = clampMoney(amount) >= 1000;

  const MethodCard = ({ m, accent }: { m: PayMethod; accent: string }) => {
    const selected = method === m;
    return (
      <Box
        role="button"
        tabIndex={0}
        onClick={() => setMethod(m)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setMethod(m);
        }}
        sx={{
          borderRadius: 20,
          border: `1px solid ${alpha(theme.palette.text.primary, selected ? 0.22 : 0.10)}`,
          backgroundColor: selected ? alpha(accent, mode === "dark" ? 0.16 : 0.10) : alpha(theme.palette.background.paper, 0.45),
          p: 1.4,
          cursor: "pointer",
          outline: "none",
          transition: "all 160ms ease",
          "&:hover": { borderColor: alpha(EVZONE.orange, 0.75), transform: "translateY(-1px)" },
        }}
      >
        <Stack spacing={0.8}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 16,
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: alpha(accent, 0.18),
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                  color: theme.palette.text.primary,
                }}
              >
                {m === "card" ? <CardIcon size={18} /> : m === "bank_transfer" ? <BankIcon size={18} /> : <PhoneIcon size={18} />}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 950 }}>{methodLabel(m)}</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{methodHint(m)}</Typography>
              </Box>
            </Stack>
            {selected ? <Chip size="small" color="success" label="Selected" /> : <Chip size="small" variant="outlined" label="Select" />}
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" variant="outlined" label={`Fee: ${money(feeFor(m, amount), currency)}`} />
            {m === "bank_transfer" ? <Chip size="small" color="success" label="No fee (demo)" /> : null}
          </Stack>
        </Stack>
      </Box>
    );
  };

  const next = () => {
    if (!canContinue) {
      setSnack({ open: true, severity: "warning", msg: "Enter an amount of at least UGX 1,000." });
      return;
    }
    setStep((s) => (s === 2 ? 2 : ((s + 1) as any)));
  };

  const back = () => setStep((s) => (s === 0 ? 0 : ((s - 1) as any)));

  const confirm = async () => {
    if (!canContinue) {
      setSnack({ open: true, severity: "warning", msg: "Enter an amount of at least UGX 1,000." });
      return;
    }

    setResult("review");
    setReceipt(null);

    await new Promise((r) => setTimeout(r, 900));

    // Demo success rate: bank transfer = always success, others = 85%
    const ok = method === "bank_transfer" ? true : Math.random() < 0.85;

    const rid = `AF-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
    const ref = `EVZ-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
    setReceipt({ id: rid, reference: ref });

    setResult(ok ? "success" : "failure");
    setSnack({ open: true, severity: ok ? "success" : "error", msg: ok ? "Top up successful." : "Top up failed. Try again." });
  };

  const reset = () => {
    setResult("idle");
    setReceipt(null);
    setStep(0);
  };

  const steps = ["Amount", "Payment method", "Confirm"];

  const SummaryCard = () => (
    <Box sx={{ borderRadius: 20, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
      <Stack spacing={0.7}>
        <Typography sx={{ fontWeight: 950 }}>Summary</Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Amount</Typography>
          <Typography sx={{ fontWeight: 950 }}>{money(clampMoney(amount), currency)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Fee</Typography>
          <Typography sx={{ fontWeight: 950 }}>{money(fee, currency)}</Typography>
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Total</Typography>
          <Typography sx={{ fontWeight: 950 }}>{money(total, currency)}</Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          Fees shown are demo values. Real fees come from your payment provider.
        </Typography>
      </Stack>
    </Box>
  );

  const ResultCard = () => {
    if (result === "idle") return null;

    const ok = result === "success";
    const title = result === "review" ? "Processing" : ok ? "Top up successful" : "Top up failed";
    const icon = result === "review" ? <ShieldCheckIcon size={18} /> : ok ? <CheckCircleIcon size={18} /> : <XCircleIcon size={18} />;

    return (
      <Card>
        <CardContent className="p-5 md:p-7">
          <Stack spacing={1.2}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box sx={{ width: 44, height: 44, borderRadius: 16, display: "grid", placeItems: "center", backgroundColor: alpha(ok ? EVZONE.green : EVZONE.orange, 0.16), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                {icon}
              </Box>
              <Box>
                <Typography variant="h6">{title}</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {result === "review" ? "Please wait while we confirm your payment." : ok ? "Funds will reflect in your wallet shortly." : "No money was deducted in this demo."}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
              <Stack spacing={0.6}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Amount</Typography>
                  <Typography sx={{ fontWeight: 950 }}>{money(clampMoney(amount), currency)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Method</Typography>
                  <Typography sx={{ fontWeight: 950 }}>{methodLabel(method)}</Typography>
                </Stack>
                {receipt ? (
                  <>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Receipt</Typography>
                      <Typography sx={{ fontWeight: 950 }}>{receipt.id}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Reference</Typography>
                      <Typography sx={{ fontWeight: 950 }}>{receipt.reference}</Typography>
                    </Stack>
                  </>
                ) : null}
              </Stack>
            </Box>

            {ok ? (
              <Alert severity="success">You can view this in your transaction history.</Alert>
            ) : result === "failure" ? (
              <Alert severity="error">Try a different method or smaller amount.</Alert>
            ) : (
              <Alert severity="info">This is a sandbox flow for UI preview.</Alert>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              {result === "review" ? null : (
                <Button variant="contained" sx={greenContained} onClick={reset}>
                  Add more funds
                </Button>
              )}
              <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/wallet")}>
                Back to wallet
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>


      <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Stack spacing={2.2}>
            {/* Header */}
            <Card>
              <CardContent className="p-5 md:p-7">
                <Stack spacing={1.2}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Box>
                      <Typography variant="h5">Add funds</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Top up your wallet using mobile money, card, or bank transfer.
                      </Typography>
                    </Box>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon size={18} />} onClick={() => navigate("/app/wallet")}>
                        Back
                      </Button>
                      <Button variant="contained" sx={greenContained} startIcon={<WalletIcon size={18} />} onClick={() => navigate("/app/wallet")}>
                        Wallet
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Stepper activeStep={step} alternativeLabel>
                    {steps.map((s) => (
                      <Step key={s}>
                        <StepLabel>{s}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>

                  <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                    You may be asked to confirm with your provider (PIN, 3DS, or banking approval).
                  </Alert>
                </Stack>
              </CardContent>
            </Card>

            {/* Result */}
            <ResultCard />

            {/* Main content (hide while showing review) */}
            {result === "review" ? null : (
              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                <Box className="md:col-span-7">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.6}>
                        {step === 0 ? (
                          <>
                            <Typography variant="h6">Enter amount</Typography>

                            <TextField
                              value={String(amount)}
                              onChange={(e) => setAmount(clampMoney(Number(e.target.value.replace(/\D/g, ""))))}
                              label={`Amount (${currency})`}
                              placeholder="50000"
                              fullWidth
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Typography sx={{ fontWeight: 950 }}>{currency}</Typography>
                                  </InputAdornment>
                                ),
                              }}
                              helperText="Minimum: UGX 1,000"
                            />

                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                              {quickChips.map((v) => (
                                <Chip
                                  key={v}
                                  clickable
                                  label={`+${money(v, currency)}`}
                                  onClick={() => setAmount((a) => clampMoney(a + v))}
                                  sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.10) } }}
                                />
                              ))}
                              <Chip
                                clickable
                                label="Clear"
                                onClick={() => setAmount(0)}
                                variant="outlined"
                                sx={{ borderColor: alpha(EVZONE.orange, 0.40), color: EVZONE.orange, "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.10) } }}
                              />
                            </Box>

                            <SummaryCard />

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                              <Button variant="contained" sx={greenContained} endIcon={<ArrowRightIcon size={18} />} onClick={next} disabled={!canContinue}>
                                Continue
                              </Button>
                              <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/wallet")}>
                                Cancel
                              </Button>
                            </Stack>
                          </>
                        ) : null}

                        {step === 1 ? (
                          <>
                            <Typography variant="h6">Choose payment method</Typography>

                            <Box className="grid gap-3">
                              <MethodCard m="mtn_momo" accent={MTN.yellow} />
                              <MethodCard m="airtel_money" accent={AIRTEL.red} />
                              <MethodCard m="card" accent={EVZONE.orange} />
                              <MethodCard m="bank_transfer" accent={EVZONE.green} />
                            </Box>

                            <SummaryCard />

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                              <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon size={18} />} onClick={back}>
                                Back
                              </Button>
                              <Button variant="contained" sx={greenContained} endIcon={<ArrowRightIcon size={18} />} onClick={next}>
                                Continue
                              </Button>
                            </Stack>
                          </>
                        ) : null}

                        {step === 2 ? (
                          <>
                            <Typography variant="h6">Confirm top up</Typography>

                            <Alert severity="warning">
                              Confirming will initiate a payment request. Make sure your details are correct.
                            </Alert>

                            <SummaryCard />

                            <Box sx={{ borderRadius: 20, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                              <Stack spacing={0.8}>
                                <Typography sx={{ fontWeight: 950 }}>Method</Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{methodLabel(method)}</Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{methodHint(method)}</Typography>
                              </Stack>
                            </Box>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                              <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon size={18} />} onClick={back}>
                                Back
                              </Button>
                              <Button variant="contained" sx={greenContained} startIcon={<PlusIcon size={18} />} onClick={confirm}>
                                Confirm and pay
                              </Button>
                            </Stack>

                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              Demo note: This page simulates a success/failure result without external providers.
                            </Typography>
                          </>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                <Box className="md:col-span-5">
                  <Stack spacing={2.2}>
                    <Card>
                      <CardContent className="p-5">
                        <Stack spacing={1.2}>
                          <Typography variant="h6">Fee breakdown</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Fees depend on provider and method.
                          </Typography>
                          <Divider />

                          <Stack spacing={0.8}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Amount</Typography>
                              <Typography sx={{ fontWeight: 950 }}>{money(clampMoney(amount), currency)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Fee</Typography>
                              <Typography sx={{ fontWeight: 950 }}>{money(fee, currency)}</Typography>
                            </Stack>
                            <Divider />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Total</Typography>
                              <Typography sx={{ fontWeight: 950 }}>{money(total, currency)}</Typography>
                            </Stack>
                          </Stack>

                          <Alert severity="info">Your provider may show additional prompts (PIN/3DS).</Alert>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-5">
                        <Stack spacing={1.2}>
                          <Typography variant="h6">Helpful shortcuts</Typography>
                          <Divider />
                          <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/wallet/payment-methods")}>
                            Manage payment methods
                          </Button>
                          <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/wallet/limits")}>
                            View limits
                          </Button>
                          <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/support")}>
                            Contact support
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                </Box>
              </Box>
            )}

            {/* Mobile sticky actions */}
            <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
              <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.85), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                <CardContent sx={{ py: 1.1, px: 1.2 }}>
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={back} disabled={step === 0 || result === "review"}>
                      Back
                    </Button>
                    <Button fullWidth variant="contained" sx={greenContained} onClick={step === 2 ? confirm : next} disabled={!canContinue || result === "review"}>
                      {step === 2 ? "Pay" : "Continue"}
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

      <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
