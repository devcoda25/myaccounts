import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeStore } from "../../../stores/themeStore";
import { EVZONE } from "../../../theme/evzone";
import {
  ChevronDownIcon,
  GlobeIcon,
  HelpCircleIcon,
  KeyIcon,
  LifeBuoyIcon,
  MailIcon,
  MoonIcon,
  SearchIcon,
  ShieldIcon,
  SunIcon,
  UploadIcon,
  WalletIcon,
} from "../../../utils/icons";

/**
 * EVzone My Accounts - Help & Support Center
 * Route: /app/support
 *
 * Features:
 * • Searchable FAQ
 * • Contact support form (category + message)
 * • Account recovery guidance
 * • Wallet/payment help topics
 */

type ThemeMode = "light" | "dark";

type Severity = "info" | "warning" | "error" | "success";

type SupportCategory =
  | "Account & Sign-in"
  | "Security"
  | "Wallet & Payments"
  | "Marketplace"
  | "Charging"
  | "Technical"
  | "Other";

type FaqCategory = "Account" | "Security" | "Wallet" | "Apps" | "KYC";

type FaqItem = {
  id: string;
  category: FaqCategory;
  q: string;
  a: string;
};

type Attachment = { id: string; name: string; size: number; type: string };




// -----------------------------
// Helpers
// -----------------------------
function toSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

function mkId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}


export default function SupportCenterPage() {
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const theme = useTheme();

  const [tab, setTab] = useState<0 | 1 | 2>(0);
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCat, setFaqCat] = useState<FaqCategory | "All">("All");

  const [category, setCategory] = useState<SupportCategory>("Account & Sign-in");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [expanded, setExpanded] = useState<string | false>(false);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });


  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeContained = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.18)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    borderRadius: "4px",
  } as const;

  const greenContained = {
    backgroundColor: EVZONE.green,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.green, mode === "dark" ? 0.24 : 0.16)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.green, 0.92), color: "#FFFFFF" },
    borderRadius: "4px",
  } as const;

  const orangeOutlined = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
    borderRadius: "4px",
  } as const;

  const faqs: FaqItem[] = useMemo(
    () => [
      {
        id: "faq1",
        category: "Account",
        q: "I cannot sign in. What should I do?",
        a: "Try resetting your password or using OTP. If you have multiple accounts, use the account chooser to pick the right one.",
      },
      {
        id: "faq2",
        category: "Security",
        q: "How do I enable two-factor authentication?",
        a: "Go to Security, then 2FA setup. Choose Authenticator, SMS, or WhatsApp (if available).",
      },
      {
        id: "faq3",
        category: "Wallet",
        q: "My withdrawal is pending. How long does it take?",
        a: "Processing times depend on bank and provider. Check Transaction Detail for status and reference IDs.",
      },
      {
        id: "faq4",
        category: "KYC",
        q: "Why does EVzone require KYC?",
        a: "KYC helps reduce fraud and unlocks higher wallet limits. It is required for regulated wallet features.",
      },
      {
        id: "faq5",
        category: "Apps",
        q: "How do I revoke an app’s access?",
        a: "Go to Apps permissions and revoke the app. This may log you out of that service.",
      },
    ],
    []
  );

  const filteredFaqs = useMemo(() => {
    const q = faqSearch.trim().toLowerCase();
    return faqs
      .filter((f) => (faqCat === "All" ? true : f.category === faqCat))
      .filter((f) => (!q ? true : (f.q + " " + f.a).toLowerCase().includes(q)))
      .slice();
  }, [faqs, faqSearch, faqCat]);

  const pickFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const next: Attachment[] = [];
    for (const f of Array.from(files)) {
      next.push({ id: mkId("ATT"), name: f.name, size: f.size, type: f.type || "unknown" });
    }
    setAttachments((p) => [...p, ...next]);
    setSnack({ open: true, severity: "success", msg: `${next.length} attachment(s) added.` });
  };

  const removeAttachment = (id: string) => setAttachments((p) => p.filter((a) => a.id !== id));

  const submit = () => {
    if (message.trim().length < 10) {
      setSnack({ open: true, severity: "warning", msg: "Please include details (at least 10 characters)." });
      return;
    }

    // Simulate API call
    setSnack({ open: true, severity: "info", msg: "Submitting..." });

    setTimeout(() => {
      setSnack({ open: true, severity: "success", msg: "Support request submitted successfully. We will contact you shortly." });
      setSubject("");
      setMessage("");
      setAttachments([]);

      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate("/app");
      }, 1500);
    }, 1000);
  };

  const QuickLink = ({ icon, title, desc, route }: { icon: React.ReactNode; title: string; desc: string; route: string }) => (
    <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
      <Stack direction="row" spacing={1.2} alignItems="flex-start">
        <Box sx={{ width: 40, height: 40, borderRadius: 16, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, 0.12), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
          {icon}
        </Box>
        <Box flex={1}>
          <Typography sx={{ fontWeight: 950 }}>{title}</Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{desc}</Typography>
          <Button variant="text" sx={{ color: EVZONE.orange, fontWeight: 900, px: 0, mt: 0.5 }} onClick={() => navigate(route)}>
            Open
          </Button>
        </Box>
      </Stack>
    </Box>
  );

  return (
    <>
      <CssBaseline />

      <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={(e) => pickFiles(e.target.files)} />

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
                        <Typography variant="h5">Help and support</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Find answers fast, or contact EVzone support.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          <Chip size="small" variant="outlined" icon={<HelpCircleIcon size={16} />} label="Searchable FAQ" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                          <Chip size="small" variant="outlined" icon={<MailIcon size={16} />} label="Contact support" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                          <Chip size="small" variant="outlined" icon={<ShieldIcon size={16} />} label="Security help" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                        </Stack>
                      </Box>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/support/security")}>
                          Report security issue
                        </Button>
                        <Button variant="contained" sx={greenContained} startIcon={<LifeBuoyIcon size={18} />} onClick={() => setTab(1)}>
                          Contact support
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Tabs
                      value={tab}
                      onChange={(_, v) => setTab(v)}
                      sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}
                    >
                      <Tab label="FAQ" />
                      <Tab label="Contact" />
                      <Tab label="Guides" />
                    </Tabs>

                    <Alert severity="info" icon={<HelpCircleIcon size={18} />}>
                      For faster support, include reference IDs from Transaction Detail or Login Activity.
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>

              {tab === 0 ? (
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={1.2}>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ xs: "stretch", md: "center" }}>
                        <TextField
                          value={faqSearch}
                          onChange={(e) => setFaqSearch(e.target.value)}
                          label="Search FAQ"
                          placeholder="Search by keyword"
                          fullWidth
                          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon size={18} /></InputAdornment>) }}
                        />
                        <TextField select value={faqCat} onChange={(e) => setFaqCat(e.target.value as any)} label="Category" sx={{ minWidth: { xs: "100%", md: 220 } }}>
                          <MenuItem value="All">All</MenuItem>
                          {(["Account", "Security", "Wallet", "Apps", "KYC"] as FaqCategory[]).map((c) => (
                            <MenuItem key={c} value={c}>{c}</MenuItem>
                          ))}
                        </TextField>
                      </Stack>

                      <Divider />

                      <Stack spacing={1.2}>
                        {filteredFaqs.map((f) => (
                          <Accordion key={f.id} expanded={expanded === f.id} onChange={(_, isExp) => setExpanded(isExp ? f.id : false)}>
                            <AccordionSummary expandIcon={<ChevronDownIcon size={18} />}>
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                <Chip size="small" variant="outlined" label={f.category} />
                                <Typography sx={{ fontWeight: 950 }}>{f.q}</Typography>
                              </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{f.a}</Typography>
                              <Divider sx={{ my: 1.2 }} />
                              <Button variant="outlined" sx={orangeOutlined} onClick={() => setSnack({ open: true, severity: "info", msg: "Feature coming soon." })}>
                                Open relevant page
                              </Button>
                            </AccordionDetails>
                          </Accordion>
                        ))}

                        {!filteredFaqs.length ? (
                          <Alert severity="warning">No results. Try different keywords.</Alert>
                        ) : null}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}

              {tab === 1 ? (
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={1.2}>
                      <Typography variant="h6">Contact support</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Tell us what you need. We will respond as soon as possible.
                      </Typography>
                      <Divider />

                      <Box className="grid gap-3 md:grid-cols-2">
                        <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value as SupportCategory)} fullWidth>
                          {([
                            "Account & Sign-in",
                            "Security",
                            "Wallet & Payments",
                            "Marketplace",
                            "Charging",
                            "Technical",
                            "Other",
                          ] as SupportCategory[]).map((c) => (
                            <MenuItem key={c} value={c}>{c}</MenuItem>
                          ))}
                        </TextField>
                        <TextField label="Subject (optional)" value={subject} onChange={(e) => setSubject(e.target.value)} fullWidth />
                      </Box>

                      <TextField
                        label="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe the issue, include IDs if available"
                        fullWidth
                        multiline
                        minRows={5}
                      />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "stretch", sm: "center" }}>
                        <Button variant="outlined" sx={orangeOutlined} startIcon={<UploadIcon size={18} />} onClick={() => fileRef.current?.click()}>
                          Add attachments
                        </Button>
                        <Button variant="contained" sx={orangeContained} startIcon={<MailIcon size={18} />} onClick={submit}>
                          Submit
                        </Button>
                        <Button variant="outlined" sx={orangeOutlined} onClick={() => { setSubject(""); setMessage(""); setAttachments([]); setSnack({ open: true, severity: "info", msg: "Cleared form." }); }}>
                          Clear
                        </Button>
                      </Stack>

                      {attachments.length ? (
                        <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                          <Typography sx={{ fontWeight: 950 }}>Attachments</Typography>
                          <Divider sx={{ my: 1 }} />
                          <Stack spacing={0.8}>
                            {attachments.map((a) => (
                              <Stack key={a.id} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                <Box>
                                  <Typography sx={{ fontWeight: 900 }}>{a.name}</Typography>
                                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{toSize(a.size)} • {a.type}</Typography>
                                </Box>
                                <Button variant="text" sx={{ color: EVZONE.orange, fontWeight: 900 }} onClick={() => removeAttachment(a.id)}>
                                  Remove
                                </Button>
                              </Stack>
                            ))}
                          </Stack>
                        </Box>
                      ) : null}

                      <Alert severity="info" icon={<LifeBuoyIcon size={18} />}>
                        Account recovery and security issues are handled with high priority.
                      </Alert>
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}

              {tab === 2 ? (
                <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                  <Box className="md:col-span-7">
                    <Card>
                      <CardContent className="p-5 md:p-7">
                        <Stack spacing={1.2}>
                          <Typography variant="h6">Guides</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Common paths to fix issues quickly.
                          </Typography>
                          <Divider />

                          <Stack spacing={1.2}>
                            <QuickLink icon={<KeyIcon size={18} />} title="Account recovery" desc="Forgot password, phone changed, lost MFA." route="/auth/account-recovery-help" />
                            <QuickLink icon={<ShieldIcon size={18} />} title="Security settings" desc="Enable 2FA, review sessions, recovery codes." route="/app/security" />
                            <QuickLink icon={<WalletIcon size={18} />} title="Wallet and payments" desc="Pending withdrawal, failed top-up, receipts." route="/app/wallet/transactions" />
                            <QuickLink icon={<HelpCircleIcon size={18} />} title="Apps permissions" desc="Revoke apps, review scopes." route="/app/apps/permissions" />
                          </Stack>

                          <Alert severity="info">If you suspect compromise, report a security issue immediately.</Alert>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box className="md:col-span-5">
                    <Card>
                      <CardContent className="p-5 md:p-7">
                        <Stack spacing={1.2}>
                          <Typography variant="h6">Popular topics</Typography>
                          <Divider />
                          <Stack spacing={0.9}>
                            {[
                              { t: "Reset password", r: "/auth/forgot-password" },
                              { t: "Verify phone", r: "/auth/verify-phone" },
                              { t: "KYC status", r: "/app/wallet/kyc/status" },
                              { t: "Disputes", r: "/app/wallet/disputes" },
                              { t: "Login activity", r: "/app/security/activity" },
                            ].map((x) => (
                              <Button key={x.t} variant="outlined" sx={orangeOutlined} onClick={() => navigate(x.r)}>
                                {x.t}
                              </Button>
                            ))}
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              ) : null}

              {/* Mobile sticky */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => setTab(0)}>
                        FAQ
                      </Button>
                      <Button fullWidth variant="contained" sx={greenContained} onClick={() => setTab(1)}>
                        Contact
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
