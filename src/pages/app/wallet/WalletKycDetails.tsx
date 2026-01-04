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
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { useThemeStore } from "../../../stores/themeStore";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - KYC Personal Details (v2)
 * Route: /app/wallet/kyc/details
 *
 * Update:
 * - Added ID expiry date (required)
 */

type Severity = "info" | "warning" | "error" | "success";

type IdType = "National ID" | "Passport" | "Driver License" | "Residence Permit";

type KycDraft = {
  fullName: string;
  dob: string; // yyyy-mm-dd
  nationality: string;
  countryOfResidence: string;
  idType: IdType;
  idNumber: string;
  idExpiry: string; // yyyy-mm-dd
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
};

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const THEME_KEY = "evzone_myaccounts_theme";
const KYC_DRAFT_KEY = "evzone_myaccounts_kyc_draft_v1";

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

function UserIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 22a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function IdCardIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
      <path d="M13 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function CalendarIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function MapPinIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
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

function SaveIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M4 4h12l4 4v12H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 4v6h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="8" y="14" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="2" />
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

function ArrowLeftIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

// -----------------------------
// Theme
// -----------------------------

// -----------------------------
// Draft storage
// -----------------------------
function loadDraft(): Partial<KycDraft> | null {
  try {
    const raw = window.localStorage.getItem(KYC_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<KycDraft>;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveDraft(d: KycDraft) {
  try {
    window.localStorage.setItem(KYC_DRAFT_KEY, JSON.stringify(d));
  } catch {
    // ignore
  }
}

// -----------------------------
// Validation helpers
// -----------------------------
function isAdult(dob: string) {
  if (!dob) return false;
  const ts = new Date(dob + "T00:00:00").getTime();
  if (!Number.isFinite(ts)) return false;
  const years = (Date.now() - ts) / (365.25 * 24 * 3600 * 1000);
  return years >= 16; // demo threshold
}

function isNonEmpty(s: string, min = 2) {
  return s.trim().length >= min;
}

function looksLikeFullName(s: string) {
  const parts = s.trim().split(/\s+/).filter(Boolean);
  return parts.length >= 2 && parts.every((p) => p.length >= 2);
}

function isDateOnOrAfterToday(dateStr: string) {
  if (!dateStr) return false;
  const ts = new Date(dateStr + "T00:00:00").getTime();
  if (!Number.isFinite(ts)) return false;
  const now = new Date();
  const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return ts >= t0;
}

// --- lightweight self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as any;
    if (w.__EVZONE_KYC_DETAILS_V2_TESTS_RAN__) return;
    w.__EVZONE_KYC_DETAILS_V2_TESTS_RAN__ = true;

    const assert = (name: string, cond: boolean) => {
      if (!cond) throw new Error(`Test failed: ${name}`);
    };

    assert("full name", looksLikeFullName("Ronald Isabirye"));
    assert("expiry future", isDateOnOrAfterToday("2099-01-01"));

  } catch (e) {
    // ignore
  }
}

export default function KycPersonalDetailsPageV2() {
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const theme = useTheme();
  const isDark = mode === "dark";

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  const defaultDraft: KycDraft = {
    fullName: "",
    dob: "",
    nationality: "Uganda",
    countryOfResidence: "Uganda",
    idType: "National ID",
    idNumber: "",
    idExpiry: "",
    addressLine1: "",
    addressLine2: "",
    city: "Kampala",
    region: "Central",
    postalCode: "",
  };

  const initial = useMemo(() => {
    const d = loadDraft();
    return { ...defaultDraft, ...d, idExpiry: (d as any)?.idExpiry ?? defaultDraft.idExpiry } as KycDraft;
  }, []);

  const [form, setForm] = useState<KycDraft>(initial);

  useEffect(() => {
    if (typeof window !== "undefined") runSelfTestsOnce();
  }, []);

  // Auto-save
  useEffect(() => {
    const t = window.setTimeout(() => saveDraft(form), 450);
    return () => window.clearTimeout(t);
  }, [form]);


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

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!looksLikeFullName(form.fullName)) e.fullName = "Enter your full legal name (at least 2 names).";
    if (!form.dob) e.dob = "Date of birth is required.";
    else if (!isAdult(form.dob)) e.dob = "Age requirement not met (demo rule).";
    if (!isNonEmpty(form.idNumber, 5)) e.idNumber = "Enter a valid ID number.";
    if (!form.idExpiry) e.idExpiry = "ID expiry date is required.";
    else if (!isDateOnOrAfterToday(form.idExpiry)) e.idExpiry = "ID appears expired. Use a valid document.";
    if (!isNonEmpty(form.addressLine1, 3)) e.addressLine1 = "Address line 1 is required.";
    if (!isNonEmpty(form.city, 2)) e.city = "City is required.";
    if (!isNonEmpty(form.countryOfResidence, 2)) e.countryOfResidence = "Country is required.";
    return e;
  }, [form]);

  const canContinue = Object.keys(errors).length === 0;

  const onSave = () => {
    saveDraft(form);
    setSnack({ open: true, severity: "success", msg: "Saved draft (demo)." });
  };

  const onContinue = () => {
    if (!canContinue) {
      setSnack({ open: true, severity: "warning", msg: "Please fix the highlighted fields." });
      return;
    }
    saveDraft(form);
    navigate("/app/wallet/kyc/upload");
  };

  const steps = ["Start", "Personal details", "Upload documents", "Status"];

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
                        <Typography variant="h5">KYC personal details</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Enter your legal identity information exactly as on your ID.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          <Chip size="small" variant="outlined" icon={<ShieldCheckIcon size={16} />} label="Auto-saves as you type" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                          <Chip size="small" variant="outlined" label={canContinue ? "Ready" : "Incomplete"} />
                        </Stack>
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                        <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon size={18} />} onClick={() => navigate("/app/wallet/kyc")}>
                          Back
                        </Button>
                        <Button variant="contained" sx={orangeContained} startIcon={<SaveIcon size={18} />} onClick={onSave}>
                          Save
                        </Button>
                        <Button variant="contained" sx={greenContained} endIcon={<ArrowRightIcon size={18} />} onClick={onContinue}>
                          Continue
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Stepper activeStep={1} alternativeLabel>
                      {steps.map((s) => (
                        <Step key={s}>
                          <StepLabel>{s}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>

                    <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                      We now collect the expiry date of your ID document.
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                {/* Identity */}
                <Box className="md:col-span-7">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.4}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <UserIcon size={18} />
                          <Typography variant="h6">Identity</Typography>
                        </Stack>
                        <Divider />

                        <TextField
                          value={form.fullName}
                          onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                          label="Full legal name"
                          placeholder="First name Last name"
                          fullWidth
                          error={!!errors.fullName}
                          helperText={errors.fullName || "Must match your ID document."}
                          InputProps={{ startAdornment: (<InputAdornment position="start"><UserIcon size={18} /></InputAdornment>) }}
                        />

                        <Box className="grid gap-3 md:grid-cols-2">
                          <TextField
                            type="date"
                            value={form.dob}
                            onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))}
                            label="Date of birth"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            error={!!errors.dob}
                            helperText={errors.dob || ""}
                          />
                          <TextField value={form.nationality} onChange={(e) => setForm((p) => ({ ...p, nationality: e.target.value }))} label="Nationality" fullWidth />
                        </Box>

                        <TextField
                          value={form.countryOfResidence}
                          onChange={(e) => setForm((p) => ({ ...p, countryOfResidence: e.target.value }))}
                          label="Country of residence"
                          fullWidth
                          error={!!errors.countryOfResidence}
                          helperText={errors.countryOfResidence || ""}
                        />

                        <Alert severity="warning">Use the exact spelling from your ID document.</Alert>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* ID */}
                <Box className="md:col-span-5">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.4}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <IdCardIcon size={18} />
                          <Typography variant="h6">ID document</Typography>
                        </Stack>
                        <Divider />

                        <TextField select value={form.idType} onChange={(e) => setForm((p) => ({ ...p, idType: e.target.value as IdType }))} label="ID type" fullWidth>
                          {(["National ID", "Passport", "Driver License", "Residence Permit"] as IdType[]).map((t) => (
                            <MenuItem key={t} value={t}>{t}</MenuItem>
                          ))}
                        </TextField>

                        <TextField
                          value={form.idNumber}
                          onChange={(e) => setForm((p) => ({ ...p, idNumber: e.target.value }))}
                          label="ID number"
                          placeholder="Enter the number on your ID"
                          fullWidth
                          error={!!errors.idNumber}
                          helperText={errors.idNumber || ""}
                          InputProps={{ startAdornment: (<InputAdornment position="start"><IdCardIcon size={18} /></InputAdornment>) }}
                        />

                        <TextField
                          type="date"
                          value={form.idExpiry}
                          onChange={(e) => setForm((p) => ({ ...p, idExpiry: e.target.value }))}
                          label="ID expiry date"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          error={!!errors.idExpiry}
                          helperText={errors.idExpiry || "As printed on the ID"}
                          InputProps={{ startAdornment: (<InputAdornment position="start"><CalendarIcon size={18} /></InputAdornment>) }}
                        />

                        <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                          Make sure expiry date is visible in your uploaded photo.
                        </Alert>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Address */}
                <Box className="md:col-span-12">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.4}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <MapPinIcon size={18} />
                          <Typography variant="h6">Residential address</Typography>
                        </Stack>
                        <Divider />

                        <Box className="grid gap-3 md:grid-cols-2">
                          <TextField
                            value={form.addressLine1}
                            onChange={(e) => setForm((p) => ({ ...p, addressLine1: e.target.value }))}
                            label="Address line 1"
                            placeholder="Street, building, area"
                            fullWidth
                            error={!!errors.addressLine1}
                            helperText={errors.addressLine1 || ""}
                          />
                          <TextField value={form.addressLine2} onChange={(e) => setForm((p) => ({ ...p, addressLine2: e.target.value }))} label="Address line 2 (optional)" placeholder="Apartment, floor" fullWidth />
                          <TextField value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} label="City" fullWidth error={!!errors.city} helperText={errors.city || ""} />
                          <TextField value={form.region} onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))} label="Region/State" fullWidth />
                          <TextField value={form.postalCode} onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))} label="Postal code (optional)" fullWidth />
                        </Box>

                        <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                          Proof of address may be required for higher limits.
                        </Alert>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              {/* Mobile sticky actions */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={onSave}>
                        Save
                      </Button>
                      <Button fullWidth variant="contained" sx={greenContained} onClick={onContinue} disabled={!canContinue}>
                        Continue
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
    </>
  );
}
