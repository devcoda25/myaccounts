import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/utils/api";
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
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { useThemeStore } from "@/stores/themeStore";
import { motion } from "framer-motion";
import { KycTier, Severity } from "@/types";

/**
 * EVzone My Accounts - KYC Start
 * Route: /app/wallet/kyc
 *
 * Features:
 * • Explain why KYC is needed
 * • Start button
 * • Show required documents list
 */



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

function ShieldCheckIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function CameraIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M4 7h4l2-2h4l2 2h4v12H4V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

function HomeIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M4 11 12 4l8 7v9H4v-9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}

function LockIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="6" y="11" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

// -----------------------------
// Helpers
// -----------------------------
function tierChip(t: KycTier) {
  if (t === "Full") return <Chip size="small" color="success" label="Full" />;
  if (t === "Basic") return <Chip size="small" color="warning" label="Basic" />;
  return <Chip size="small" color="error" label="Unverified" />;
}

// --- lightweight self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as any;
    if (w.__EVZONE_KYC_START_TESTS_RAN__) return;
    w.__EVZONE_KYC_START_TESTS_RAN__ = true;
  } catch (e) {
    // ignore
  }
}

export default function KycStartPage() {
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const theme = useTheme();
  const isDark = mode === "dark";

  const [tier, setTier] = useState<KycTier>("Unverified");
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    if (typeof window !== "undefined") runSelfTestsOnce();
    // Fetch status
    api<{ tier: KycTier }>('/kyc/status')
      .then(res => {
        setTier(res.tier);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
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
    "&:active": { backgroundColor: alpha(EVZONE.green, 0.86), color: "#FFFFFF" },
  } as const;

  const orangeOutlined = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const steps = ["Start", "Identity", "Selfie", "Proof of address", "Review"];

  const docsBasic = [
    { icon: <DocumentIcon size={18} />, title: "National ID or Passport", desc: "Clear photo of a valid ID document." },
    { icon: <CameraIcon size={18} />, title: "Selfie", desc: "A quick selfie to match your ID." },
  ];

  const docsFull = [
    { icon: <HomeIcon size={18} />, title: "Proof of address", desc: "Utility bill or bank statement (recent)." },
    { icon: <LockIcon size={18} />, title: "Additional checks", desc: "May include enhanced verification for higher limits." },
  ];

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
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h5">KYC verification</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Verify your identity to unlock higher limits and safer wallet operations.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          <Chip icon={<ShieldCheckIcon size={16} />} label={`Current tier: ${tier}`} variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" }, fontWeight: 900 }} />
                          {tierChip(tier)}
                        </Stack>
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/wallet/limits")}>
                          View limits
                        </Button>
                        <Button variant="contained" sx={greenContained} endIcon={<ArrowRightIcon size={18} />} onClick={() => navigate("/app/wallet/kyc/upload")}>
                          Start KYC
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                      Your data is handled securely and used only for verification and compliance.
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>

              {/* Steps */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Typography variant="h6">What happens next</Typography>
                    <Divider />
                    <Stepper activeStep={0} alternativeLabel>
                      {steps.map((s) => (
                        <Step key={s}>
                          <StepLabel>{s}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Typical completion time: 2-5 minutes (depending on document quality).
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                {/* Why */}
                <Box className="md:col-span-6">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.2}>
                        <Typography variant="h6">Why we need KYC</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          KYC protects you and EVzone against fraud and enables regulated wallet features.
                        </Typography>

                        <Divider />

                        <Box className="grid gap-3">
                          <Benefit title="Higher limits" desc="Increase daily and monthly wallet limits." />
                          <Benefit title="Safer withdrawals" desc="Reduce risk checks and speed up payouts." />
                          <Benefit title="Trusted account" desc="Fewer lockouts and smoother recovery." />
                        </Box>

                        <Alert severity="warning" icon={<LockIcon size={18} />}>
                          Do not share your verification codes or documents with anyone.
                        </Alert>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Documents */}
                <Box className="md:col-span-6">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.2}>
                        <Typography variant="h6">Required documents</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Prepare these items before you begin.
                        </Typography>

                        <Divider />

                        <Typography sx={{ fontWeight: 950 }}>Basic verification</Typography>
                        <Box className="grid gap-3">
                          {docsBasic.map((d) => (
                            <DocItem key={d.title} icon={d.icon} title={d.title} desc={d.desc} />
                          ))}
                        </Box>

                        <Divider />

                        <Typography sx={{ fontWeight: 950 }}>Full verification (for higher limits)</Typography>
                        <Box className="grid gap-3">
                          {docsFull.map((d) => (
                            <DocItem key={d.title} icon={d.icon} title={d.title} desc={d.desc} />
                          ))}
                        </Box>

                        <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                          Photos should be clear, well-lit, and not cropped.
                        </Alert>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              {/* Actions */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h6">Start now</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          You can stop anytime and resume later.
                        </Typography>
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/support")}>
                          Need help
                        </Button>
                        <Button variant="contained" sx={greenContained} endIcon={<ArrowRightIcon size={18} />} onClick={() => navigate("/app/wallet/kyc/upload")}>
                          Start KYC
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      By continuing, you agree to EVzone’s verification terms and privacy policy.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* Mobile sticky */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/wallet/limits")}>
                        Limits
                      </Button>
                      <Button fullWidth variant="contained" sx={greenContained} onClick={() => navigate("/app/wallet/kyc/upload")}>
                        Start
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
    </>
  );
}

function Benefit({ title, desc }: { title: string; desc: string }) {
  return (
    <Box sx={{ borderRadius: 18, border: "1px solid rgba(0,0,0,0)", backgroundColor: "transparent" }}>
      <Typography sx={{ fontWeight: 950 }}>{title}</Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>{desc}</Typography>
    </Box>
  );
}

function DocItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Box sx={{ borderRadius: 18, border: `1px solid rgba(0,0,0,0)`, backgroundColor: "transparent" }}>
      <Stack direction="row" spacing={1.2} alignItems="flex-start">
        <Box sx={{ width: 40, height: 40, borderRadius: 16, display: "grid", placeItems: "center", backgroundColor: "rgba(3,205,140,0.12)", border: "1px solid rgba(0,0,0,0.08)" }}>
          {icon}
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 950 }}>{title}</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>{desc}</Typography>
        </Box>
      </Stack>
    </Box>
  );
}
