import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import {
  ChangeType,
  ContactLabel,
  EmailContact,
  PhoneContact,
  Prefs,
  IUser,
  IContact,
  VerifyChannel
} from "@/types";
import { api } from "@/utils/api";
import { useThemeStore } from "@/stores/themeStore";
import { EVZONE } from "@/theme/evzone";
import {
  isEmail,
  isPhone,
  maskEmail,
  maskPhone,
  purposeLabel,
} from "./components/ProfileContactHelpers";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  TrashIcon,
  WhatsAppIcon,
} from "@/components/icons";
import OtpInput from "@/components/ui/OtpInput";
import { useNotification } from "@/context/NotificationContext";

const WHATSAPP = {
  green: "#25D366",
} as const;

type Purpose = keyof Prefs;

export default function ContactSettings() {
  const { t } = useTranslation("common");
  const { mode } = useThemeStore();
  const theme = useTheme();
  const isDark = mode === "dark";
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);

  // Data
  const [emails, setEmails] = useState<EmailContact[]>([]);
  const [phones, setPhones] = useState<PhoneContact[]>([]);
  const [prefs, setPrefs] = useState<Prefs>({
    security_email: null,
    security_sms: null,
    security_whatsapp: null,
    reset_email: null,
    reset_sms: null,
    reset_whatsapp: null,
    receipts_email: null,
    mfa_sms: null,
    mfa_whatsapp: null,
  });

  const loadData = async () => {
    try {
      const user = await api<IUser>("/users/me");
      if (user) {
        const fetchedEmails: EmailContact[] = [];
        const fetchedPhones: PhoneContact[] = [];

        (user.contacts || []).forEach((c: IContact) => {
          const caps = c.capabilities || {};
          if (c.type === 'EMAIL') {
            fetchedEmails.push({
              id: c.id,
              label: c.label as ContactLabel,
              email: c.value,
              verified: c.verified,
              loginEnabled: caps.login || false,
              createdAt: new Date(c.createdAt).getTime(),
              lastUsedAt: c.lastUsedAt ? new Date(c.lastUsedAt).getTime() : undefined
            });
          } else if (c.type === 'PHONE') {
            fetchedPhones.push({
              id: c.id,
              label: c.label as ContactLabel,
              phone: c.value,
              verified: c.verified,
              loginEnabled: caps.login || false,
              smsCapable: caps.sms || false,
              whatsappCapable: caps.whatsapp || false,
              createdAt: new Date(c.createdAt).getTime(),
              lastUsedAt: c.lastUsedAt ? new Date(c.lastUsedAt).getTime() : undefined
            });
          }
        });

        setEmails(fetchedEmails);
        setPhones(fetchedPhones);

        if (user.preferences) {
          setPrefs(prev => ({ ...prev, ...user.preferences }));
        }
      }
    } catch (err) {
      console.error(err);
      showNotification({
        type: "error",
        title: "Load Failed",
        message: "Failed to load contact settings. Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Dialog State
  const [editOpen, setEditOpen] = useState(false);
  const [editMode, setEditMode] = useState<"add" | "edit">("add");
  const [editType, setEditType] = useState<ChangeType>("email");
  const [editStep, setEditStep] = useState<"form" | "otp" | "done">("form");
  const [editId, setEditId] = useState<string | null>(null);

  // form fields
  const [label, setLabel] = useState<ContactLabel>("Personal");
  const [value, setValue] = useState<string>("");
  const [loginEnabled, setLoginEnabled] = useState<boolean>(true);
  const [smsCapable, setSmsCapable] = useState<boolean>(true);
  const [whatsappCapable, setWhatsappCapable] = useState<boolean>(true);
  const [verified, setVerified] = useState<boolean>(false);

  const [verifyChannel, setVerifyChannel] = useState<VerifyChannel>("Email");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState<number>(0);

  const [defaultsOpen, setDefaultsOpen] = useState(false);
  const [defaultsDraft, setDefaultsDraft] = useState<Prefs>(prefs);

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
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const orangeTextSx = {
    color: EVZONE.orange,
    fontWeight: 900,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, mode === "dark" ? 0.14 : 0.10) },
  } as const;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const emailOptions = useMemo(() => {
    return emails.map((e) => ({ id: e.id, label: `${e.label}: ${maskEmail(e.email)}${e.verified ? "" : " (unverified)"}` }));
  }, [emails]);

  const smsPhoneOptions = useMemo(() => {
    return phones
      .filter((p) => p.smsCapable)
      .map((p) => ({ id: p.id, label: `${p.label}: ${maskPhone(p.phone)}${p.verified ? "" : " (unverified)"}` }));
  }, [phones]);

  const waPhoneOptions = useMemo(() => {
    return phones
      .filter((p) => p.whatsappCapable)
      .map((p) => ({ id: p.id, label: `${p.label}: ${maskPhone(p.phone)}${p.verified ? "" : " (unverified)"}` }));
  }, [phones]);

  const verifiedRecoveryCount = useMemo(() => {
    const ve = emails.filter((e) => e.verified).length;
    const vp = phones.filter((p) => p.verified).length;
    return ve + vp;
  }, [emails, phones]);

  const openAdd = (type: ChangeType) => {
    setEditType(type);
    setEditMode("add");
    setEditId(null);
    setEditStep("form");
    setLabel("Personal");
    setValue("");
    setLoginEnabled(true);
    setVerified(false);
    if (type === "phone") {
      setSmsCapable(true);
      setWhatsappCapable(true);
      setVerifyChannel("SMS");
    } else {
      setVerifyChannel("Email");
    }
    setOtp(["", "", "", "", "", ""]);
    setCooldown(0);
    setEditOpen(true);
  };

  const openEdit = (type: ChangeType, id: string) => {
    setEditType(type);
    setEditMode("edit");
    setEditId(id);
    setEditStep("form");

    if (type === "email") {
      const e = emails.find((x) => x.id === id);
      if (!e) return;
      setLabel(e.label);
      setValue(e.email);
      setLoginEnabled(e.loginEnabled);
      setVerified(e.verified);
      setVerifyChannel("Email");
    } else {
      const p = phones.find((x) => x.id === id);
      if (!p) return;
      setLabel(p.label);
      setValue(p.phone);
      setLoginEnabled(p.loginEnabled);
      setSmsCapable(p.smsCapable);
      setWhatsappCapable(p.whatsappCapable);
      setVerified(p.verified);
      setVerifyChannel(p.smsCapable ? "SMS" : p.whatsappCapable ? "WhatsApp" : "SMS");
    }
    setOtp(["", "", "", "", "", ""]);
    setCooldown(0);
    setEditOpen(true);
  };

  const openRemove = (type: ChangeType, id: string) => {
    showNotification({
      type: "warning",
      title: "Remove Contact",
      message: `Are you sure you want to remove this ${type}? This action cannot be undone.`,
      actionText: "Remove",
      onAction: () => removeContact(id)
    });
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditStep("form");
  };

  const startVerification = async () => {
    const v = value.trim();
    if (editType === "email") {
      if (!isEmail(v)) {
        showNotification({ type: "warning", title: "Invalid Email", message: "Enter a valid email address." });
        return;
      }
      setVerifyChannel("Email");
    } else {
      if (!isPhone(v)) {
        showNotification({ type: "warning", title: "Invalid Phone", message: "Enter a valid phone number." });
        return;
      }
      if (!smsCapable && !whatsappCapable) {
        showNotification({ type: "warning", title: "Missing Capability", message: "Enable SMS or WhatsApp capability." });
        return;
      }
    }

    setLoading(true);
    try {
      if (editType === "email") {
        await api('/auth/request-email-verification', { method: 'POST', body: JSON.stringify({ email: v }) });
      } else {
        await api('/auth/request-phone-verification', {
          method: 'POST',
          body: JSON.stringify({ identifier: v, deliveryMethod: verifyChannel === 'WhatsApp' ? 'whatsapp_message' : 'sms_code' })
        });
      }

      setCooldown(30);
      setEditStep("otp");
      showNotification({
        type: "success",
        title: "Code Sent",
        message: `Verification code sent via ${verifyChannel}.`,
      });
    } catch (err: any) {
      showNotification({ type: "error", title: "Send Failed", message: err.message || "Failed to send code." });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      showNotification({ type: "warning", title: "Incomplete Code", message: "Enter the 6-digit code." });
      return;
    }

    setLoading(true);
    try {
      if (editType === 'email') {
        await api('/auth/verify-email', { method: 'POST', body: JSON.stringify({ identifier: value.trim(), code }) });
      } else {
        await api('/auth/verify-phone', { method: 'POST', body: JSON.stringify({ identifier: value.trim(), code }) });
      }

      const payload = {
        label,
        verified: true,
        type: editType === "email" ? "EMAIL" : "PHONE",
        value: value.trim(),
        capabilities: {
          login: loginEnabled,
          sms: smsCapable,
          whatsapp: whatsappCapable
        }
      };

      if (editMode === "add") {
        const res = await api<{ id: string }>('/users/me/contacts', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (editType === 'email' && emails.length === 0) {
          const id = res.id;
          await api('/users/me/settings', {
            method: 'PATCH', body: JSON.stringify({
              security_email: id, reset_email: id, receipts_email: id
            })
          });
        }
      }

      await loadData();
      setEditStep("done");
      showNotification({ type: "success", title: "Contact Verified", message: "Contact saved and verified successfully." });

    } catch (err: any) {
      console.error(err);
      showNotification({ type: "error", title: "Verification Failed", message: err.message || "Invalid code." });
    } finally {
      setLoading(false);
    }
  };

  const removeContact = async (id: string) => {
    try {
      await api(`/users/me/contacts/${id}`, { method: 'DELETE' });
      await loadData();
      showNotification({ type: "success", title: "Contact Removed", message: "The contact has been removed." });
    } catch (err) {
      console.error(err);
      showNotification({ type: "error", title: "Remove Failed", message: "Failed to remove contact." });
    }
  };

  const openDefaults = () => {
    setDefaultsDraft(prefs);
    setDefaultsOpen(true);
  };

  const saveDefaults = async () => {
    try {
      await api('/users/me/settings', { method: 'PATCH', body: JSON.stringify(defaultsDraft) });
      setPrefs({ ...defaultsDraft });
      setDefaultsOpen(false);
      showNotification({ type: "success", title: "Defaults Saved", message: "Your contact preferences have been updated." });
    } catch (err) {
      showNotification({ type: "error", title: "Save Failed", message: "Failed to save settings." });
    }
  };

  const EmailRow = ({ item }: { item: EmailContact }) => (
    <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }}>
        <Stack direction="row" spacing={1.2} alignItems="center" flex={1}>
          <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary }}>
            <MailIcon size={18} />
          </Avatar>
          <Box flex={1}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }}>
              <Typography sx={{ fontWeight: 950 }}>{item.label} email</Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{maskEmail(item.email)}</Typography>
            </Stack>
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mt: 0.6 }}>
              <Chip size="small" color={item.verified ? "success" : "warning"} label={item.verified ? "Verified" : "Unverified"} />
              <Chip size="small" variant="outlined" label={item.loginEnabled ? "Login enabled" : "Login disabled"} />
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => openEdit("email", item.id)} sx={orangeTextSx}><PencilIcon size={18} /></IconButton>
          <IconButton size="small" onClick={() => openRemove("email", item.id)} sx={orangeTextSx}><TrashIcon size={18} /></IconButton>
        </Stack>
      </Stack>
    </Box>
  );

  const PhoneRow = ({ item }: { item: PhoneContact }) => (
    <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }}>
        <Stack direction="row" spacing={1.2} alignItems="center" flex={1}>
          <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary }}>
            <PhoneIcon size={18} />
          </Avatar>
          <Box flex={1}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }}>
              <Typography sx={{ fontWeight: 950 }}>{item.label} phone</Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{maskPhone(item.phone)}</Typography>
            </Stack>
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mt: 0.6 }}>
              <Chip size="small" color={item.verified ? "success" : "warning"} label={item.verified ? "Verified" : "Unverified"} />
              {item.smsCapable && <Chip size="small" label="SMS" />}
              {item.whatsappCapable && <Chip size="small" label="WhatsApp" sx={{ bgcolor: alpha(WHATSAPP.green, 0.1), color: WHATSAPP.green }} />}
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => openEdit("phone", item.id)} sx={orangeTextSx}><PencilIcon size={18} /></IconButton>
          <IconButton size="small" onClick={() => openRemove("phone", item.id)} sx={orangeTextSx}><TrashIcon size={18} /></IconButton>
        </Stack>
      </Stack>
    </Box>
  );

  return (
    <Stack spacing={2.2}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card sx={{ borderRadius: "4px" }}>
          <CardContent className="p-5 md:p-7">
            <Stack spacing={2.0}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                <Box>
                  <Typography variant="h5">Contact details</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Manage your recovery emails and phones.</Typography>
                </Box>
                <Stack direction="row" spacing={1.2}>
                  <Button variant="outlined" sx={orangeOutlinedSx} onClick={openDefaults}>Manage defaults</Button>
                  <Button variant="contained" color="secondary" sx={orangeContainedSx} startIcon={<PlusIcon size={18} />} onClick={() => openAdd("email")}>Add email</Button>
                  <Button variant="contained" color="secondary" sx={orangeContainedSx} startIcon={<PlusIcon size={18} />} onClick={() => openAdd("phone")}>Add phone</Button>
                </Stack>
              </Stack>

              <Divider />

              <Box className="grid gap-4 md:grid-cols-2">
                <Box>
                  <Typography sx={{ fontWeight: 950, mb: 1 }}>Emails</Typography>
                  <Stack spacing={1.2}>{emails.map((e) => <EmailRow key={e.id} item={e} />)}</Stack>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 950, mb: 1 }}>Phones</Typography>
                  <Stack spacing={1.2}>{phones.map((p) => <PhoneRow key={p.id} item={p} />)}</Stack>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit/Add Dialog */}
      <Dialog open={editOpen} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 950 }}>{editMode === "add" ? "Add Contact" : "Edit Contact"}</DialogTitle>
        <DialogContent>
          {editStep === "form" && (
            <Stack spacing={2.2} sx={{ mt: 1 }}>
              <TextField select label="Label" value={label} onChange={(e) => setLabel(e.target.value as ContactLabel)} fullWidth>
                {["Personal", "Work", "Other"].map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
              </TextField>
              <TextField label={editType === "email" ? "Email" : "Phone"} value={value} onChange={(e) => setValue(e.target.value)} fullWidth />
              {editType === "phone" && (
                <Stack direction="row" spacing={2}>
                  <FormControlLabel control={<Checkbox checked={smsCapable} onChange={(e) => setSmsCapable(e.target.checked)} />} label="SMS" />
                  <FormControlLabel control={<Checkbox checked={whatsappCapable} onChange={(e) => setWhatsappCapable(e.target.checked)} />} label="WhatsApp" />
                </Stack>
              )}
            </Stack>
          )}
          {editStep === "otp" && (
            <Stack spacing={2.2} alignItems="center" sx={{ mt: 1 }}>
              <Typography variant="body2" align="center">Enter the code sent to {value}</Typography>
              <OtpInput value={otp} onChange={setOtp} />
              <Button disabled={cooldown > 0} onClick={startVerification}>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}</Button>
            </Stack>
          )}
          {editStep === "done" && (
            <Stack spacing={2.2} alignItems="center" sx={{ mt: 1 }}>
              <Box sx={{ color: EVZONE.green }}>
                <CheckCircleIcon size={48} />
              </Box>
              <Typography variant="h6">Verified Successfully</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="outlined" onClick={closeEdit}>{t("auth.common.cancel")}</Button>
          {editStep === "form" && <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={startVerification}>{t("auth.common.verify")}</Button>}
          {editStep === "otp" && <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={verifyOtp}>Finish</Button>}
          {editStep === "done" && <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={closeEdit}>Done</Button>}
        </DialogActions>
      </Dialog>

      {/* Defaults Dialog */}
      <Dialog open={defaultsOpen} onClose={() => setDefaultsOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 950 }}>Contact Preferences</DialogTitle>
        <DialogContent>
          <Stack spacing={2.2} sx={{ mt: 1 }}>
            <TextField select label="Security Notifications" value={defaultsDraft.security_email || ""} onChange={(e) => setDefaultsDraft(p => ({ ...p, security_email: e.target.value || null }))} fullWidth>
              <MenuItem value="">(none)</MenuItem>
              {emailOptions.map(o => <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>)}
            </TextField>
            {/* Add more default selects as needed... */}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="outlined" onClick={() => setDefaultsOpen(false)}>{t("auth.common.cancel")}</Button>
          <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={saveDefaults}>{t("auth.common.save")}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
