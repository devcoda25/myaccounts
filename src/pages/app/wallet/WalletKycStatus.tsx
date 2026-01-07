import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { useThemeStore } from "../../../stores/themeStore";
import { motion } from "framer-motion";
import { api } from "../../../utils/api";

/**
 * EVzone My Accounts - KYC Status
 * Route: /app/wallet/kyc/status
 */

type Severity = "info" | "warning" | "error" | "success";

// Backend: 'Pending' | 'Verified' | 'Rejected' | 'In Review'
// Frontend UI handles: 'Pending' | 'Approved' | 'Rejected' | 'In Review'
type KycStatus = "Pending" | "Approved" | "Rejected" | "In Review" | "Unverified";

type KycTier = "Unverified" | "Basic" | "Full";

interface KycStatusResponse {
  status: string;
  tier?: KycTier;
  submittedAt?: string;
  notes?: string;
}

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

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

function ShieldCheckIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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

function AlertTriangleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 3l10 18H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
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

function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

// -----------------------------
// Theme
// -----------------------------

function statusChip(s: KycStatus) {
  if (s === "Approved") return <Chip size="small" color="success" label="Verified" />;
  if (s === "Rejected") return <Chip size="small" color="error" label="Rejected" />;
  return <Chip size="small" color="warning" label={s} />;
}

function tierChip(t: KycTier) {
  if (t === "Full") return <Chip size="small" color="success" label="Full" />;
  if (t === "Basic") return <Chip size="small" color="warning" label="Basic" />;
  return <Chip size="small" color="error" label="Unverified" />;
}

export default function KycStatusPage() {
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const theme = useTheme();
  const isDark = mode === "dark";

  const [status, setStatus] = useState<KycStatus>("Pending");
  const [tier, setTier] = useState<KycTier>("Unverified");
  const [loading, setLoading] = useState(true);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api<{ status: string; tier?: KycTier; submittedAt?: string; notes?: string }>('/kyc/status');
      if (res) {
        // Map backend status to UI status
        // Backend: 'Pending' | 'Verified' | 'Rejected' | 'In Review' | 'Unverified'
        let uiStatus: KycStatus = "Pending";
        if (res.status === "Verified") uiStatus = "Approved";
        else if (res.status === "Rejected") uiStatus = "Rejected";
        else if (res.status === "In Review") uiStatus = "In Review";
        else if (res.status === "Pending") uiStatus = "Pending";
        else uiStatus = "Unverified";

        setStatus(uiStatus);
        setTier(res.tier || "Unverified");
        if (res.submittedAt) setSubmittedAt(res.submittedAt);
        if (res.notes) setNotes(res.notes);
      }
    } catch (err) {
      console.error("Failed to fetch KYC status", err);
      // setSnack({ open: true, severity: "error", msg: "Failed to load status" });
    } finally {
      setLoading(false);
    }
  };

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

  const steps = ["Submitted", "Under review", "Decision"];
  const activeStep = status === "Pending" ? 1 : status === "In Review" ? 1 : status === "Approved" ? 3 : status === "Rejected" ? 3 : 0;

  const mainBanner =
    status === "Approved" ? (
      <Alert severity="success" icon={<CheckCircleIcon size={18} />}>
        Your KYC is approved. Higher limits are enabled.
      </Alert>
    ) : status === "Pending" || status === "In Review" ? (
      <Alert severity="warning" icon={<ClockIcon size={18} />}>
        Your KYC is being reviewed. This usually takes a short time.
      </Alert>
    ) : status === "Rejected" ? (
      <Alert severity="error" icon={<XCircleIcon size={18} />}>
        Your KYC was rejected. Review the reasons and resubmit.
      </Alert>
    ) : (
      <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
        You have not submitted KYC yet.
      </Alert>
    );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: pageBg }}>
        <CircularProgress sx={{ color: EVZONE.green }} />
      </Box>
    );
  }

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
                        <Typography variant="h5">KYC status</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Track your verification progress and next actions.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          {statusChip(status)}
                          {tierChip(tier)}
                          <Chip size="small" variant="outlined" label="Audit logged" />
                        </Stack>
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>

                        <Button variant="contained" sx={greenContained} onClick={() => navigate("/app/wallet/limits")} endIcon={<ArrowRightIcon size={18} />}>
                          View limits
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    {mainBanner}

                    {status !== "Unverified" && (
                      <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((s) => (
                          <Step key={s}>
                            <StepLabel>{s}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    )}

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Tip: Keep the app open during review. You can continue using EVzone services.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                {/* Summary */}
                <Box className="md:col-span-6">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.2}>
                        <Typography variant="h6">Summary</Typography>
                        <Divider />

                        <Row label="Current status" value={status} />
                        <Row label="Tier" value={tier} />
                        <Row label="Submitted" value={submittedAt ? new Date(submittedAt).toLocaleString() : "N/A"} />
                        <Row label="Last updated" value={new Date().toLocaleDateString()} />

                        <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                          Your documents are encrypted at rest and access is restricted.
                        </Alert>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Next actions */}
                <Box className="md:col-span-6">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.2}>
                        <Typography variant="h6">Next actions</Typography>
                        <Divider />

                        {status === "Approved" ? (
                          <>
                            <Alert severity="success" icon={<CheckCircleIcon size={18} />}>
                              You are verified{tier === "Basic" ? " (Basic)" : ""}. {tier === "Basic" ? "Upgrade for higher limits." : "Enjoy higher limits and smoother withdrawals."}
                            </Alert>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                              <Button variant="contained" sx={greenContained} onClick={() => navigate("/app/wallet")}>
                                Go to wallet
                              </Button>
                              {tier === "Basic" && (
                                <Button variant="contained" sx={orangeContained} onClick={() => navigate("/app/wallet/kyc/upload?tier=full")} endIcon={<ArrowRightIcon size={18} />}>
                                  Upgrade to limits
                                </Button>
                              )}
                              {tier === "Full" && (
                                <Button variant="outlined" disabled startIcon={<ShieldCheckIcon size={18} />}>
                                  Status: Full Verified
                                </Button>
                              )}
                              <Button variant="outlined" sx={orangeOutlined} onClick={() => setSnack({ open: true, severity: "info", msg: "Download verification letter (later)." })}>
                                Download confirmation (later)
                              </Button>
                            </Stack>
                          </>
                        ) : status === "Pending" || status === "In Review" ? (
                          <>
                            <Alert severity="warning" icon={<ClockIcon size={18} />}>
                              Review in progress. If requested, respond with clearer photos.
                            </Alert>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                              <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/support")}>
                                Contact support
                              </Button>
                            </Stack>
                          </>
                        ) : status === "Rejected" ? (
                          <>
                            <Alert severity="error" icon={<AlertTriangleIcon size={18} />}>
                              {notes ? `Reason: ${notes}` : "Your KYC was rejected. Check requirements and resubmit."}
                            </Alert>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                              <Button variant="contained" sx={orangeContained} onClick={() => navigate("/app/wallet/kyc/details")}>
                                Edit details
                              </Button>
                              <Button variant="contained" sx={greenContained} onClick={() => navigate("/app/wallet/kyc/upload")} endIcon={<ArrowRightIcon size={18} />}>
                                Resubmit documents
                              </Button>
                            </Stack>
                          </>
                        ) : (
                          // Unverified / Default
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button variant="contained" sx={greenContained} onClick={() => navigate("/app/wallet/kyc/upload")} endIcon={<ArrowRightIcon size={18} />}>
                              Start verification
                            </Button>
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" sx={{ color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ fontWeight: 950 }}>{value}</Typography>
    </Stack>
  );
}
