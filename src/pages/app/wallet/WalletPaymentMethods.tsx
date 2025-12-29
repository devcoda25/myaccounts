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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { useThemeContext } from "../../../theme/ThemeContext";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Payment Methods
 * Route: /app/wallet/payment-methods
 *
 * Features:
 * - List methods (masked details)
 * - Add new method
 * - Set default
 * - Remove (confirmation)
 */


type Severity = "info" | "warning" | "error" | "success";

type MethodType = "momo" | "card" | "bank";

type Provider = "MTN MoMo" | "Airtel Money" | "Visa" | "Mastercard" | "Bank Account";

type PaymentMethod = {
  id: string;
  type: MethodType;
  provider: Provider;
  label: string;
  masked: string;
  verified: boolean;
  isDefault: boolean;
  addedAt: number;
};

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const MTN = { yellow: "#FFCC00" } as const;
const AIRTEL = { red: "#E60012" } as const;

const THEME_KEY = "evzone_myaccounts_theme";

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

function PlusIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function CheckCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="m8.5 12 2.3 2.3L15.8 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
      <path
        d="M22 16.9v3a2 2 0 0 1-2.2 2c-9.5-1-17-8.5-18-18A2 2 0 0 1 3.8 2h3a2 2 0 0 1 2 1.7c.2 1.4.6 2.8 1.2 4.1a2 2 0 0 1-.5 2.2L8.4 11.1a16 16 0 0 0 4.5 4.5l1.1-1.1a2 2 0 0 1 2.2-.5c1.3.6 2.7 1 4.1 1.2a2 2 0 0 1 1.7 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function ShieldCheckIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path
        d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

// -----------------------------
// Theme
// -----------------------------

// -----------------------------
// Helpers
// -----------------------------
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

function shortMask(s: string) {
  const trimmed = s.trim();
  if (trimmed.length <= 4) return "••••";
  return `•••• ${trimmed.slice(-4)}`;
}

function mkId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2, 8)}`;
}

function providerAccent(p: Provider) {
  if (p === "MTN MoMo") return MTN.yellow;
  if (p === "Airtel Money") return AIRTEL.red;
  if (p === "Bank Account") return EVZONE.green;
  return EVZONE.orange;
}

function iconForType(t: MethodType) {
  if (t === "momo") return <PhoneIcon size={18} />;
  if (t === "bank") return <BankIcon size={18} />;
  return <CardIcon size={18} />;
}

function buildMasked(type: MethodType, provider: Provider, raw: string) {
  const v = raw.trim();
  if (!v) return "";
  if (type === "momo") {
    const digits = v.replace(/\D/g, "");
    const last = digits.slice(-3);
    return `${provider} ••• ${last || ""}`.trim();
  }
  if (type === "card") {
    const digits = v.replace(/\D/g, "");
    return `${provider} ${shortMask(digits)}`;
  }
  return `${provider} ${shortMask(v)}`;
}

// --- lightweight self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as any;
    if (w.__EVZONE_PAYMENT_METHODS_TESTS_RAN__) return;
    w.__EVZONE_PAYMENT_METHODS_TESTS_RAN__ = true;

    const assert = (name: string, cond: boolean) => {
      if (!cond) throw new Error(`Test failed: ${name}`);
    };

    // Existing test
    assert("mask card", buildMasked("card", "Visa", "4242 4242 4242 4242").includes("4242"));

    // Extra tests
    assert("mask momo", buildMasked("momo", "MTN MoMo", "+256 761 677 709").includes("709"));
    assert("mask bank", buildMasked("bank", "Bank Account", "3311").includes("3311"));
    assert("accent", providerAccent("MTN MoMo") === MTN.yellow);

  } catch (e) {
    // ignore
  }
}

export default function PaymentMethodsPage() {
  const navigate = useNavigate();
  const { mode } = useThemeContext();
  const theme = useTheme();
  const isDark = mode === "dark";

  const [methods, setMethods] = useState<PaymentMethod[]>(() => {
    const now = Date.now();
    return [
      { id: "pm_mtn", type: "momo", provider: "MTN MoMo", label: "Personal MoMo", masked: "MTN MoMo ••• 709", verified: true, isDefault: true, addedAt: now - 1000 * 60 * 60 * 24 * 120 },
      { id: "pm_airtel", type: "momo", provider: "Airtel Money", label: "Work line", masked: "Airtel Money ••• 173", verified: false, isDefault: false, addedAt: now - 1000 * 60 * 60 * 24 * 20 },
      { id: "pm_visa", type: "card", provider: "Visa", label: "Visa card", masked: "Visa •••• 4242", verified: true, isDefault: false, addedAt: now - 1000 * 60 * 60 * 24 * 35 },
      { id: "pm_bank", type: "bank", provider: "Bank Account", label: "Stanbic", masked: "Bank Account •••• 3311", verified: true, isDefault: false, addedAt: now - 1000 * 60 * 60 * 24 * 60 },
    ];
  });

  const [addOpen, setAddOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  // Add form
  const [newType, setNewType] = useState<MethodType>("momo");
  const [newProvider, setNewProvider] = useState<Provider>("MTN MoMo");
  const [newLabel, setNewLabel] = useState("My method");
  const [newRaw, setNewRaw] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(true);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({
    open: false,
    severity: "info",
    msg: "",
  });

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

  const openAdd = () => {
    setNewType("momo");
    setNewProvider("MTN MoMo");
    setNewLabel("My method");
    setNewRaw("");
    setSetAsDefault(true);
    setAddOpen(true);
  };

  const addMethod = () => {
    const raw = newRaw.trim();
    if (!raw) {
      setSnack({ open: true, severity: "warning", msg: "Enter method details." });
      return;
    }

    const id = mkId("pm");
    const masked = buildMasked(newType, newProvider, raw);

    if (!masked) {
      setSnack({ open: true, severity: "warning", msg: "Invalid details." });
      return;
    }

    setMethods((prev) => {
      const next: PaymentMethod[] = prev.map((p) => (setAsDefault ? { ...p, isDefault: false } : p));
      next.unshift({
        id,
        type: newType,
        provider: newProvider,
        label: newLabel.trim() || "Payment method",
        masked,
        verified: newType === "card" ? true : false,
        isDefault: setAsDefault,
        addedAt: Date.now(),
      });
      // Ensure one default
      if (!next.some((m) => m.isDefault)) next[0].isDefault = true;
      return next;
    });

    setAddOpen(false);
    setSnack({ open: true, severity: "success", msg: "Payment method added (demo)." });
  };

  const setDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
    setSnack({ open: true, severity: "success", msg: "Default method updated." });
  };

  const openRemove = (id: string) => {
    setRemoveId(id);
    setRemoveOpen(true);
  };

  const remove = () => {
    if (!removeId) return;
    setMethods((prev) => {
      const toRemove = prev.find((m) => m.id === removeId);
      const next = prev.filter((m) => m.id !== removeId);
      if (!next.length) return prev; // keep at least one in demo
      if (toRemove?.isDefault) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
    setRemoveOpen(false);
    setSnack({ open: true, severity: "success", msg: "Payment method removed (demo)." });
  };

  const providerOptions = useMemo(() => {
    if (newType === "momo") return ["MTN MoMo", "Airtel Money"] as Provider[];
    if (newType === "card") return ["Visa", "Mastercard"] as Provider[];
    return ["Bank Account"] as Provider[];
  }, [newType]);

  useEffect(() => {
    if (!providerOptions.includes(newProvider)) setNewProvider(providerOptions[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newType]);

  const stats = useMemo(() => {
    const verified = methods.filter((m) => m.verified).length;
    const momo = methods.filter((m) => m.type === "momo").length;
    const card = methods.filter((m) => m.type === "card").length;
    const bank = methods.filter((m) => m.type === "bank").length;
    return { total: methods.length, verified, momo, card, bank };
  }, [methods]);

  const MethodCard = ({ m }: { m: PaymentMethod }) => {
    const accent = providerAccent(m.provider);

    return (
      <Card>
        <CardContent className="p-5">
          <Stack spacing={1.2}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: alpha(accent, 0.18),
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                }}
              >
                {iconForType(m.type)}
              </Box>
              <Box flex={1}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography sx={{ fontWeight: 950 }}>{m.label}</Typography>
                  {m.isDefault ? <Chip size="small" color="success" label="Default" /> : null}
                  {m.verified ? <Chip size="small" color="info" label="Verified" /> : <Chip size="small" color="warning" label="Unverified" />}
                </Stack>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {m.masked}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Added {timeAgo(m.addedAt)}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <Button
                variant="contained"
                sx={m.isDefault ? greenContained : orangeContained}
                startIcon={<CheckCircleIcon size={18} />}
                onClick={() => setDefault(m.id)}
                disabled={m.isDefault}
              >
                {m.isDefault ? "Default" : "Set default"}
              </Button>
              <Button
                variant="outlined"
                sx={orangeOutlined}
                startIcon={<TrashIcon size={18} />}
                onClick={() => openRemove(m.id)}
                disabled={methods.length <= 1}
              >
                Remove
              </Button>
            </Stack>

            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Tip: Verified methods reduce payment failures.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
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
                        <Typography variant="h5">Payment methods</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Manage how you add funds and pay across EVzone services.
                        </Typography>
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                        <Button
                          variant="outlined"
                          sx={orangeOutlined}
                          onClick={() => navigate("/app/wallet")}
                        >
                          Back to wallet
                        </Button>
                        <Button variant="contained" sx={greenContained} startIcon={<PlusIcon size={18} />} onClick={() => navigate("/app/wallet/payment-methods/add")}>
                          Add method
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Box className="grid gap-3 md:grid-cols-5">
                      <Stat label="Total" value={stats.total} />
                      <Stat label="Verified" value={stats.verified} />
                      <Stat label="MoMo" value={stats.momo} />
                      <Stat label="Cards" value={stats.card} />
                      <Stat label="Banks" value={stats.bank} />
                    </Box>

                    <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                      In production, adding or removing methods may require re-authentication.
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-2">
                {methods
                  .slice()
                  .sort((a, b) => (a.isDefault ? -1 : b.isDefault ? 1 : b.addedAt - a.addedAt))
                  .map((m) => (
                    <MethodCard key={m.id} m={m} />
                  ))}
              </Box>

              {/* Mobile sticky actions */}
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
                        onClick={() => navigate("/app/wallet")}
                      >
                        Wallet
                      </Button>
                      <Button fullWidth variant="contained" sx={greenContained} startIcon={<PlusIcon size={18} />} onClick={() => navigate("/app/wallet/payment-methods/add")}>
                        Add
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

        {/* Add dialog */}
        <Dialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}
        >
          <DialogTitle sx={{ fontWeight: 950 }}>Add payment method</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <TextField select label="Type" value={newType} onChange={(e) => setNewType(e.target.value as MethodType)} fullWidth>
                <MenuItem value="momo">Mobile money</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="bank">Bank account</MenuItem>
              </TextField>

              <TextField select label="Provider" value={newProvider} onChange={(e) => setNewProvider(e.target.value as Provider)} fullWidth>
                {providerOptions.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </TextField>

              <TextField value={newLabel} onChange={(e) => setNewLabel(e.target.value)} label="Label" placeholder="Example: Personal" fullWidth />

              <TextField
                value={newRaw}
                onChange={(e) => setNewRaw(e.target.value)}
                label={newType === "momo" ? "Phone number" : newType === "card" ? "Card number" : "Account number / last digits"}
                placeholder={newType === "momo" ? "+256 7xx xxx xxx" : newType === "card" ? "4242 4242 4242 4242" : "•••• 3311"}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {newType === "momo" ? <PhoneIcon size={18} /> : newType === "bank" ? <BankIcon size={18} /> : <CardIcon size={18} />}
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                label="Set as default"
                value={setAsDefault ? "yes" : "no"}
                onChange={(e) => setSetAsDefault(e.target.value === "yes")}
                fullWidth
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </TextField>

              <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                A verification step can be added later (OTP/3DS/Bank micro-deposit).
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" sx={greenContained} onClick={addMethod}>
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Remove confirm */}
        <Dialog open={removeOpen} onClose={() => setRemoveOpen(false)} PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Remove payment method</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                This will remove the method from your account.
              </Typography>
              <Alert severity="warning">If this is your default method, a new default will be selected automatically.</Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setRemoveOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" sx={orangeContained} onClick={remove} startIcon={<TrashIcon size={18} />}>
              Remove
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ borderRadius: 18, border: `1px solid rgba(0,0,0,0)`, backgroundColor: "transparent" }}>
      <Stack spacing={0.2}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 950 }}>{value}</Typography>
      </Stack>
    </Box>
  );
}
