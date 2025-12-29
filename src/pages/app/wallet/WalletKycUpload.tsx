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
  Divider,
  IconButton,
  LinearProgress,
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
import { useThemeContext } from "../../../theme/ThemeContext";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - KYC Document Upload
 * Route: /app/wallet/kyc/upload
 *
 * Features:
 * - Upload front/back of ID
 * - Selfie upload (optional)
 * - File validation (size/type)
 * - Mobile: camera capture support
 */

type Severity = "info" | "warning" | "error" | "success";

type UploadSlot = "idFront" | "idBack" | "selfie";

type UploadFile = {
  slot: UploadSlot;
  file: File;
  url?: string;
  isPdf: boolean;
  error?: string;
};

type SubmitState = "idle" | "submitting" | "success" | "failed";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const THEME_KEY = "evzone_myaccounts_theme";

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

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

function UploadIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function FileIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M7 3h8l4 4v14H7V3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

// -----------------------------
// Theme
// -----------------------------

// -----------------------------
// Helpers
// -----------------------------
function validate(file: File, slot: UploadSlot): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "Unsupported file type.";
  if (file.size > MAX_BYTES) return `File too large. Max ${MAX_MB}MB.`;
  if (slot === "selfie" && file.type === "application/pdf") return "Selfie must be an image.";
  return null;
}

function toSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

function slotLabel(slot: UploadSlot) {
  if (slot === "idFront") return "ID front";
  if (slot === "idBack") return "ID back";
  return "Selfie (optional)";
}

// --- lightweight self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as any;
    if (w.__EVZONE_KYC_UPLOAD_TESTS_RAN__) return;
    w.__EVZONE_KYC_UPLOAD_TESTS_RAN__ = true;
  } catch (e) {
    // ignore
  }
}

export default function KycDocumentUploadPage() {
  const navigate = useNavigate();
  const { mode } = useThemeContext();
  const theme = useTheme();
  const isDark = mode === "dark";

  const [uploads, setUploads] = useState<Record<UploadSlot, UploadFile | null>>({
    idFront: null,
    idBack: null,
    selfie: null,
  });

  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  const inIdFront = useRef<HTMLInputElement | null>(null);
  const inIdBack = useRef<HTMLInputElement | null>(null);
  const inSelfie = useRef<HTMLInputElement | null>(null);

  const inIdFrontCam = useRef<HTMLInputElement | null>(null);
  const inIdBackCam = useRef<HTMLInputElement | null>(null);
  const inSelfieCam = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") runSelfTestsOnce();
  }, []);

  useEffect(() => {
    // cleanup object URLs
    return () => {
      (Object.keys(uploads) as UploadSlot[]).forEach((k) => {
        const u = uploads[k];
        if (u?.url) URL.revokeObjectURL(u.url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const requiredOk = !!uploads.idFront && !uploads.idFront?.error && !!uploads.idBack && !uploads.idBack?.error;

  const onPick = (slot: UploadSlot, file?: File | null) => {
    if (!file) return;

    const err = validate(file, slot);
    const isPdf = file.type === "application/pdf";
    const url = !isPdf ? URL.createObjectURL(file) : undefined;

    setUploads((prev) => {
      const old = prev[slot];
      if (old?.url) URL.revokeObjectURL(old.url);
      return {
        ...prev,
        [slot]: { slot, file, url, isPdf, error: err || undefined },
      };
    });

    setSnack({ open: true, severity: err ? "warning" : "success", msg: err ? `${slotLabel(slot)}: ${err}` : `${slotLabel(slot)} selected.` });
  };

  const remove = (slot: UploadSlot) => {
    setUploads((prev) => {
      const old = prev[slot];
      if (old?.url) URL.revokeObjectURL(old.url);
      return { ...prev, [slot]: null };
    });
  };

  const submit = async () => {
    if (!requiredOk) {
      setSnack({ open: true, severity: "warning", msg: "Upload a valid front and back ID first." });
      return;
    }

    setSubmitState("submitting");
    await new Promise((r) => setTimeout(r, 1100));

    const ok = Math.random() > 0.08;
    setSubmitState(ok ? "success" : "failed");

    setSnack({ open: true, severity: ok ? "success" : "error", msg: ok ? "Documents submitted (demo)." : "Submission failed (demo)." });

    if (ok) {
      // In production: redirect to status
      navigate("/app/wallet/kyc/status");
    }
  };

  const reset = () => {
    (Object.keys(uploads) as UploadSlot[]).forEach((k) => {
      if (uploads[k]?.url) URL.revokeObjectURL(uploads[k]!.url!);
    });
    setUploads({ idFront: null, idBack: null, selfie: null });
    setSubmitState("idle");
    setSnack({ open: true, severity: "info", msg: "Cleared uploads." });
  };

  const steps = ["Start", "Personal details", "Upload documents", "Status"];

  const UploadCard = ({ slot, required }: { slot: UploadSlot; required: boolean }) => {
    const u = uploads[slot];
    const has = !!u;

    return (
      <Box sx={{ borderRadius: 20, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
        <Stack spacing={1.1}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary, borderRadius: 16 }}>
                {slot === "selfie" ? <CameraIcon size={18} /> : <FileIcon size={18} />}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 950 }}>{slotLabel(slot)}{required ? "" : ""}</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {required ? "Required" : "Optional"}
                </Typography>
              </Box>
            </Stack>
            {has ? (
              u?.error ? <Chip size="small" color="error" label="Invalid" /> : <Chip size="small" color="success" label="Ready" />
            ) : required ? (
              <Chip size="small" color="warning" label="Missing" />
            ) : (
              <Chip size="small" variant="outlined" label="Skip" />
            )}
          </Stack>

          {u?.error ? <Alert severity="error">{u.error}</Alert> : null}

          {has ? (
            <>
              <Divider />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between">
                <Box>
                  <Typography sx={{ fontWeight: 950, wordBreak: "break-word" }}>{u.file.name}</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{toSize(u.file.size)} • {u.file.type || "unknown"}</Typography>
                </Box>
                <Button variant="outlined" sx={orangeOutlined} startIcon={<TrashIcon size={18} />} onClick={() => remove(slot)}>
                  Remove
                </Button>
              </Stack>

              {u.isPdf ? (
                <Alert severity="info">PDF selected. Preview is not shown in this demo.</Alert>
              ) : u.url ? (
                <Box sx={{ borderRadius: 18, overflow: "hidden", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                  <img
                    src={u.url}
                    alt={`${slotLabel(slot)} preview`}
                    style={{ display: "block", width: "100%", height: 220, objectFit: "cover" }}
                  />
                </Box>
              ) : null}
            </>
          ) : (
            <>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <Button
                  variant="contained"
                  sx={orangeContained}
                  startIcon={<UploadIcon size={18} />}
                  onClick={() => {
                    if (slot === "idFront") inIdFront.current?.click();
                    else if (slot === "idBack") inIdBack.current?.click();
                    else inSelfie.current?.click();
                  }}
                >
                  Upload file
                </Button>
                <Button
                  variant="outlined"
                  sx={orangeOutlined}
                  startIcon={<CameraIcon size={18} />}
                  onClick={() => {
                    if (slot === "idFront") inIdFrontCam.current?.click();
                    else if (slot === "idBack") inIdBackCam.current?.click();
                    else inSelfieCam.current?.click();
                  }}
                >
                  Use camera
                </Button>
              </Stack>

              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Accepted: JPG/PNG/WEBP{slot === "selfie" ? "" : ", PDF"} • Max {MAX_MB}MB.
              </Typography>
            </>
          )}
        </Stack>
      </Box>
    );
  };

  return (
    <>
      <CssBaseline />

      {/* Hidden inputs */}
      <input ref={inIdFront} type="file" accept={ALLOWED_TYPES.join(",")} style={{ display: "none" }} onChange={(e) => onPick("idFront", e.target.files?.[0])} />
      <input ref={inIdBack} type="file" accept={ALLOWED_TYPES.join(",")} style={{ display: "none" }} onChange={(e) => onPick("idBack", e.target.files?.[0])} />
      <input ref={inSelfie} type="file" accept={"image/*"} style={{ display: "none" }} onChange={(e) => onPick("selfie", e.target.files?.[0])} />

      {/* Camera capture inputs */}
      <input ref={inIdFrontCam} type="file" accept={"image/*"} capture="environment" style={{ display: "none" }} onChange={(e) => onPick("idFront", e.target.files?.[0])} />
      <input ref={inIdBackCam} type="file" accept={"image/*"} capture="environment" style={{ display: "none" }} onChange={(e) => onPick("idBack", e.target.files?.[0])} />
      <input ref={inSelfieCam} type="file" accept={"image/*"} capture="user" style={{ display: "none" }} onChange={(e) => onPick("selfie", e.target.files?.[0])} />

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
                        <Typography variant="h5">Upload documents</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Upload clear photos of your ID. Avoid glare and blur.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          <Chip size="small" variant="outlined" label={`Max file size: ${MAX_MB}MB`} />
                          <Chip size="small" variant="outlined" label={requiredOk ? "Front/back ready" : "Front/back required"} />
                        </Stack>
                      </Box>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon size={18} />} onClick={() => navigate("/app/wallet/kyc/details")}>
                          Back
                        </Button>
                        <Button variant="outlined" sx={orangeOutlined} onClick={reset}>
                          Clear
                        </Button>
                        <Button variant="contained" sx={greenContained} endIcon={<ArrowRightIcon size={18} />} onClick={submit} disabled={!requiredOk || submitState === "submitting"}>
                          Submit
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Stepper activeStep={2} alternativeLabel>
                      {steps.map((s) => (
                        <Step key={s}>
                          <StepLabel>{s}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>

                    <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                      Tip: Use the camera button on mobile for best results.
                    </Alert>

                    {submitState === "submitting" ? (
                      <Box>
                        <LinearProgress />
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Submitting…</Typography>
                      </Box>
                    ) : submitState === "success" ? (
                      <Alert severity="success" icon={<CheckCircleIcon size={18} />}>Submitted successfully (demo).</Alert>
                    ) : submitState === "failed" ? (
                      <Alert severity="error" icon={<XCircleIcon size={18} />}>Submission failed (demo). Try again.</Alert>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                <Box className="md:col-span-6">
                  <UploadCard slot="idFront" required />
                </Box>
                <Box className="md:col-span-6">
                  <UploadCard slot="idBack" required />
                </Box>
                <Box className="md:col-span-12">
                  <UploadCard slot="selfie" required={false} />
                </Box>
              </Box>

              {/* Mobile sticky */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={reset}>
                        Clear
                      </Button>
                      <Button fullWidth variant="contained" sx={greenContained} onClick={submit} disabled={!requiredOk || submitState === "submitting"}>
                        Submit
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
