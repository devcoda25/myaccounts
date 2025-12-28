import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
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
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeContext } from "../../../theme/ThemeContext";
import ContactSettings from "./ProfileContact";

/**
 * EVzone My Accounts - Personal Profile
 * Route: /app/profile
 *
 * Features:
 * - Avatar upload
 * - Full name
 * - Date of birth (optional, useful for KYC later)
 * - Country/region
 * - Save + success toast
 */

type Severity = "info" | "warning" | "error" | "success";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

// -----------------------------
// Inline icons (CDN-safe)
// -----------------------------
function IconBase({
  size = 18,
  children,
}: {
  size?: number;
  children: React.ReactNode;
}) {
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
      <path
        d="M12 2v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 20v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 12H2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M22 12h-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
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
      <path
        d="M3 12h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

function MailIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M4 8l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}

function CameraIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path
        d="M4 7h4l2-2h4l2 2h4v12H4V7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

function UserIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 22a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

function CalendarIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function MapPinIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path
        d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
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

function ArrowLeftIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

// Redundant EVZONE removed

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PersonalProfilePage() {
  const { mode } = useThemeContext();
  const theme = useTheme();
  const isDark = mode === "dark";

  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [fullName, setFullName] = useState("Ronald Isabirye");
  const [dob, setDob] = useState<string>("");
  const [country, setCountry] = useState("Uganda");

  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({
    open: false,
    severity: "info",
    msg: "",
  });

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeContainedSx = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.18)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
  } as const;

  const orangeOutlinedSx = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.35),
    "&:hover": {
      borderColor: EVZONE.orange,
      backgroundColor: EVZONE.orange,
      color: "#FFFFFF",
    },
  } as const;

  const orangeTextSx = {
    color: EVZONE.orange,
    fontWeight: 900,
    "&:hover": {
      backgroundColor: alpha(EVZONE.orange, mode === "dark" ? 0.14 : 0.10),
    },
  } as const;

  const onPickAvatar = () => fileRef.current?.click();

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await fileToDataUrl(f);
    setAvatarUrl(url);
    setSnack({ open: true, severity: "success", msg: "Avatar selected (demo)." });
  };

  const onSave = async () => {
    if (!fullName.trim()) {
      setSnack({ open: true, severity: "warning", msg: "Full name is required." });
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 650));
    setSaving(false);
    setSnack({ open: true, severity: "success", msg: "Profile saved successfully." });
  };

  const countries = [
    "Uganda",
    "Kenya",
    "Tanzania",
    "Rwanda",
    "Nigeria",
    "Ghana",
    "South Africa",
    "United Kingdom",
    "China",
    "United States",
  ];

  return (
    <>
      <CssBaseline />

      <Box className="min-h-screen" sx={{ background: pageBg }}>


        {/* Body */}
        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <Stack spacing={4}>
            {/* Header / Intro */}
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>My Profile</Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                Manage your personal details and contact preferences.
              </Typography>
            </Box>

            <Stack spacing={2.2}>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <Card sx={{ borderRadius: "4px" }}>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={2.0}>
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        alignItems={{ xs: "flex-start", md: "center" }}
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography variant="h5">Personal details</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Keep your identity details up to date.
                          </Typography>
                        </Box>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                          <Button
                            variant="contained"
                            color="secondary"
                            sx={orangeContainedSx}
                            startIcon={<SaveIcon size={18} />}
                            onClick={onSave}
                            disabled={saving}
                          >
                            {saving ? "Saving..." : "Save"}
                          </Button>
                        </Stack>
                      </Stack>

                      <Divider />

                      <Alert severity="info">
                        Date of birth may be requested later for KYC. You can keep it empty for now.
                      </Alert>

                      <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                        {/* Avatar */}
                        <Box className="md:col-span-4">
                          <Card
                            sx={{
                              borderRadius: 4,
                              border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                              backgroundColor: alpha(theme.palette.background.paper, 0.45),
                            }}
                          >
                            <CardContent className="p-4">
                              <Stack spacing={1.2} alignItems="center">
                                <Avatar
                                  src={avatarUrl || undefined}
                                  sx={{
                                    width: 92,
                                    height: 92,
                                    border: `2px solid ${alpha(EVZONE.orange, 0.65)}`,
                                    bgcolor: alpha(EVZONE.green, 0.22),
                                  }}
                                >
                                  <UserIcon size={28} />
                                </Avatar>
                                <Typography sx={{ fontWeight: 950 }}>Profile photo</Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: "center" }}>
                                  Use a clear photo. This improves trust with partners.
                                </Typography>

                                <input
                                  ref={fileRef}
                                  type="file"
                                  accept="image/*"
                                  style={{ display: "none" }}
                                  onChange={onAvatarChange}
                                />

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} width="100%">
                                  <Button
                                    fullWidth
                                    variant="contained"
                                    color="secondary"
                                    sx={orangeContainedSx}
                                    startIcon={<CameraIcon size={18} />}
                                    onClick={onPickAvatar}
                                  >
                                    Upload
                                  </Button>
                                  <Button
                                    fullWidth
                                    variant="outlined"
                                    sx={orangeOutlinedSx}
                                    onClick={() => {
                                      setAvatarUrl("");
                                      setSnack({ open: true, severity: "info", msg: "Avatar removed (demo)." });
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Box>

                        {/* Form */}
                        <Box className="md:col-span-8">
                          <Stack spacing={1.4}>
                            <TextField
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              label="Full name"
                              fullWidth
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <UserIcon size={18} />
                                  </InputAdornment>
                                ),
                              }}
                            />

                            <Box className="grid gap-3 md:grid-cols-2">
                              <TextField
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                label="Date of birth (optional)"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <CalendarIcon size={18} />
                                    </InputAdornment>
                                  ),
                                }}
                              />

                              <TextField
                                select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                label="Country/region"
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <MapPinIcon size={18} />
                                    </InputAdornment>
                                  ),
                                }}
                              >
                                {countries.map((c) => (
                                  <MenuItem key={c} value={c}>
                                    {c}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Box>

                            <Box
                              sx={{
                                borderRadius: 4,
                                border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                                backgroundColor: alpha(theme.palette.background.paper, 0.45),
                                p: 1.4,
                              }}
                            >
                              <Stack spacing={0.8}>
                                <Typography sx={{ fontWeight: 950 }}>Profile tips</Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  • Add contact verification to increase security.
                                </Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  • Keep your legal name consistent with identity documents.
                                </Typography>
                              </Stack>
                            </Box>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                              <Button
                                variant="contained"
                                color="secondary"
                                sx={orangeContainedSx}
                                startIcon={<SaveIcon size={18} />}
                                onClick={onSave}
                                disabled={saving}
                              >
                                {saving ? "Saving..." : "Save changes"}
                              </Button>
                              <Button
                                variant="outlined"
                                sx={orangeOutlinedSx}
                                onClick={() =>
                                  setSnack({ open: true, severity: "info", msg: "Discarded changes (demo)." })
                                }
                              >
                                Discard
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Settings Component Here */}
              <ContactSettings />

              {/* Mobile quick actions */}
              <Box className="md:hidden">
                <Card
                  sx={{
                    borderRadius: 22,
                    border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.65),
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <CardContent>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        sx={orangeContainedSx}
                        onClick={onSave}
                        startIcon={<SaveIcon size={18} />}
                      >
                        Save
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Stack>
          </Stack>
          <Box
            className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
            sx={{ opacity: 0.92 }}
          >
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              © {new Date().getFullYear()} EVzone Group.
            </Typography>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Button
                size="small"
                variant="text"
                sx={orangeTextSx}
                onClick={() => setSnack({ open: true, severity: "info", msg: "Open Terms (demo)." })}
              >
                Terms
              </Button>
              <Button
                size="small"
                variant="text"
                sx={orangeTextSx}
                onClick={() => setSnack({ open: true, severity: "info", msg: "Open Privacy (demo)." })}
              >
                Privacy
              </Button>
            </Stack>
          </Box>
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
              backgroundColor:
                mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96),
              color: theme.palette.text.primary,
            }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box >
    </>
  );
}
