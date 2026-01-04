import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import AuthHeader from "../../../../components/headers/AuthHeader";
import { EVZONE } from "../../../../theme/evzone";

/**
 * EVzone My Accounts - Forgot Password
 * Route: /auth/forgot-password
 * Features:
 * • Email/phone input
 * • Delivery method selection
 * • Confirm send
 * • Abuse prevention: rate limiting + optional captcha
 *
 * Style rules:
 * • Background: green-only
 * • Buttons: orange-only with white text (outlined hover -> solid orange + white text)
 */

import { Delivery, Step } from "../../../../utils/types";
import {
  ArrowRightIcon,
  MailIcon,
  HelpCircleIcon,
  PhoneIcon,
  TimerIcon,
  WhatsAppIcon
} from "../../../../utils/icons";

const WHATSAPP = {
  green: "#25D366",
} as const;

type IdType = "email" | "phone" | "unknown";

function detectIdType(v: string): IdType {
  const s = v.trim();
  if (!s) return "unknown";
  if (/.+@.+\..+/.test(s)) return "email";
  if (/^\+?[0-9\s-]{8,}$/.test(s)) return "phone";
  return "unknown";
}

function maskEmail(email: string) {
  const e = email.trim();
  if (!/.+@.+\..+/.test(e)) return e;
  const [u, d] = e.split("@");
  const safeU = u.length <= 2 ? u[0] + "*" : u.slice(0, 2) + "***";
  return `${safeU}@${d}`;
}

function maskPhone(phone: string) {
  const s = phone.trim().replace(/\s+/g, "");
  if (s.length <= 6) return s;
  return `${s.slice(0, 3)}***${s.slice(-3)}`;
}


export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [step, setStep] = useState<Step>("request");
  const [identifier, setIdentifier] = useState("ronald@evzone.com");
  const idType = detectIdType(identifier);

  const [delivery, setDelivery] = useState<Delivery>("email_link");

  const [cooldown, setCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [banner, setBanner] = useState<{ severity: "error" | "warning" | "info" | "success"; msg: string } | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>({ open: false, severity: "info", msg: "" });

  // Green-only background
  const pageBg =
    isDark
      ? "radial-gradient(1200px 600px at 12% 6%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 10%, rgba(3,205,140,0.16), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.18), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.12), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  // Orange buttons
  const orangeContainedSx = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, isDark ? 0.28 : 0.20)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
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
    "&:hover": { backgroundColor: alpha(EVZONE.orange, isDark ? 0.14 : 0.10) },
  } as const;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  // keep delivery valid for identifier type
  useEffect(() => {
    if (idType === "email") {
      setDelivery("email_link");
      return;
    }
    if (idType === "phone") {
      if (delivery === "email_link") setDelivery("sms_code");
      return;
    }
  }, [idType]);

  const deliveryMask = () => {
    if (idType === "email") return maskEmail(identifier);
    if (idType === "phone") return maskPhone(identifier);
    return identifier.trim();
  };

  const canSend = () => {
    if (cooldown > 0) return false;
    if (!identifier.trim()) return false;
    if (idType === "unknown") return false;
    if (captchaRequired && !captchaChecked) return false;
    return true;
  };

  const labelForDelivery = (d: Delivery) => {
    if (d === "email_link") return t('auth.forgot_password.email_link');
    if (d === "sms_code") return t('auth.forgot_password.sms_code');
    return t('auth.forgot_password.whatsapp_code');
  };

  const requestSend = () => {
    setBanner(null);

    if (!identifier.trim()) {
      setBanner({ severity: "warning", msg: t('auth.forgot_password.validation_email_phone') });
      return;
    }

    if (idType === "unknown") {
      setBanner({ severity: "warning", msg: t('auth.forgot_password.validation_valid_email_phone') });
      return;
    }

    if (cooldown > 0) {
      setBanner({ severity: "warning", msg: t('auth.forgot_password.validation_wait', { seconds: cooldown }) });
      return;
    }

    if (captchaRequired && !captchaChecked) {
      setBanner({ severity: "warning", msg: t('auth.forgot_password.validation_captcha') });
      return;
    }

    setConfirmOpen(true);
  };

  const doSend = () => {
    setConfirmOpen(false);

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    // require captcha after repeated requests
    if (nextAttempts >= 3) setCaptchaRequired(true);

    setCooldown(30);
    setStep("sent");

    const via = labelForDelivery(delivery);

    setSnack({
      open: true,
      severity: "success",
      msg: t('auth.forgot_password.reset_sent_success', { via })
    });
  };

  const resetForm = () => {
    setStep("request");
    setBanner(null);
  };

  const DeliveryCard = ({
    value,
    title,
    subtitle,
    enabled,
    accent,
    icon,
  }: {
    value: Delivery;
    title: string;
    subtitle: string;
    enabled: boolean;
    accent: "orange" | "whatsapp";
    icon: React.ReactNode;
  }) => {
    const selected = delivery === value;
    const base = accent === "whatsapp" ? WHATSAPP.green : EVZONE.orange;

    return (
      <ButtonBase
        className="w-full"
        disabled={!enabled}
        onClick={() => enabled && setDelivery(value)}
        sx={{ textAlign: "left", opacity: enabled ? 1 : 0.55 }}
      >
        <Box
          sx={{
            width: "100%",
            borderRadius: 2,
            border: `1px solid ${alpha(base, selected ? 0.95 : 0.55)}`,
            backgroundColor: selected ? base : alpha(theme.palette.background.paper, 0.35),
            color: selected ? "#FFFFFF" : theme.palette.text.primary,
            p: 1.2,
            transition: "all 160ms ease",
            "&:hover": enabled
              ? {
                backgroundColor: base,
                color: "#FFFFFF",
              }
              : undefined,
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                backgroundColor: selected ? alpha("#FFFFFF", 0.18) : alpha(base, isDark ? 0.16 : 0.10),
                border: `1px solid ${alpha(selected ? "#FFFFFF" : base, 0.26)}`,
                color: selected ? "#FFFFFF" : base,
              }}
            >
              {icon}
            </Box>
            <Box flex={1}>
              <Typography sx={{ fontWeight: 900, lineHeight: 1.1, color: "inherit" }}>{title}</Typography>
              <Typography variant="body2" sx={{ color: selected ? alpha("#FFFFFF", 0.86) : theme.palette.text.secondary }}>
                {subtitle}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </ButtonBase>
    );
  };

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>
      {/* Unified Auth Header */}
      <AuthHeader
        title={t('app_name')}
        subtitle={t('auth.forgot_password.title')}
      />

      {/* Body */}
      <Box className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
          {/* Left info */}
          <motion.div className="md:col-span-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card>
              <CardContent className="p-5 md:p-6">
                <Stack spacing={1.2}>
                  <Typography variant="h6">{t('auth.forgot_password.reset_access_title')}</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {t('auth.forgot_password.reset_access_desc')}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Stack spacing={1.1}>
                    <Stack direction="row" spacing={1.1} alignItems="center">
                      <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, isDark ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                        <TimerIcon size={18} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 900 }}>{t('auth.forgot_password.rate_limiting')}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {t('auth.forgot_password.rate_limiting_desc')}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1.1} alignItems="center">
                      <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, isDark ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                        <MailIcon size={18} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 900 }}>{t('auth.forgot_password.secure_link')}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {t('auth.forgot_password.secure_link_desc')}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 1 }} />

                  <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => navigate("/auth/sign-in")}>
                    {t('auth.forgot_password.back_to_signin')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right form */}
          <motion.div className="md:col-span-7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            <Card>
              <CardContent className="p-5 md:p-7">
                {step === "sent" ? (
                  <Stack spacing={2.0}>
                    <Stack spacing={0.6}>
                      <Typography variant="h6">{t('auth.forgot_password.check_your', { type: idType === "email" ? "email" : "phone" })}</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {t('auth.forgot_password.sent_instructions', { identifier: deliveryMask(), method: labelForDelivery(delivery) })}
                      </Typography>
                    </Stack>

                    <Box sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                      <Stack spacing={1}>
                        <Typography sx={{ fontWeight: 900 }}>{t('auth.forgot_password.next')}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {t('auth.forgot_password.next_desc')}
                        </Typography>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                          <Button
                            variant="contained"
                            color="secondary"
                            sx={orangeContainedSx}
                            endIcon={<ArrowRightIcon size={18} />}
                            onClick={() => navigate("/auth/reset-password")}
                          >
                            {t('auth.forgot_password.go_to_reset')}
                          </Button>
                          <Button
                            variant="outlined"
                            sx={orangeOutlinedSx}
                            startIcon={<TimerIcon size={18} />}
                            onClick={() => {
                              if (cooldown === 0) {
                                setConfirmOpen(true);
                              }
                            }}
                            disabled={cooldown > 0}
                          >
                            {cooldown > 0 ? t('auth.forgot_password.send_again_in', { seconds: cooldown }) : t('auth.forgot_password.send_again')}
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="outlined" sx={orangeOutlinedSx} onClick={resetForm}>
                        {t('auth.forgot_password.change_contact')}
                      </Button>
                      <Button
                        variant="outlined"
                        sx={orangeOutlinedSx}
                        onClick={() => navigate("/auth/account-recovery-help")}
                      >
                        {t('auth.forgot_password.need_help')}
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Stack spacing={2.0}>
                    <Stack spacing={0.6}>
                      <Typography variant="h6">{t('auth.forgot_password.title')}</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {t('auth.forgot_password.subtitle')}
                      </Typography>
                    </Stack>

                    {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                    <TextField
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      label={t('auth.forgot_password.validation_email_phone')}
                      placeholder={t('auth.sign_in.email_phone_placeholder')}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, color: theme.palette.text.secondary, display: "grid", placeItems: "center" }}>
                            {idType === "phone" ? <PhoneIcon size={18} /> : <MailIcon size={18} />}
                          </Box>
                        ),
                      }}
                      helperText={idType === "unknown" ? t('auth.forgot_password.validation_valid_email_phone') : ""}
                    />

                    <Box>
                      <Typography sx={{ fontWeight: 900, mb: 1 }}>{t('auth.forgot_password.delivery_method')}</Typography>
                      <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <DeliveryCard
                          value="email_link"
                          title={t('auth.forgot_password.email_link')}
                          subtitle={t('auth.forgot_password.email_link_desc')}
                          enabled={idType === "email"}
                          accent="orange"
                          icon={<MailIcon size={18} />}
                        />
                        <DeliveryCard
                          value="sms_code"
                          title={t('auth.forgot_password.sms_code')}
                          subtitle={t('auth.forgot_password.sms_code_desc')}
                          enabled={idType === "phone"}
                          accent="orange"
                          icon={<PhoneIcon size={18} />}
                        />
                        <DeliveryCard
                          value="whatsapp_code"
                          title={t('auth.forgot_password.whatsapp_code')}
                          subtitle={t('auth.forgot_password.whatsapp_code_desc')}
                          enabled={idType === "phone"}
                          accent="whatsapp"
                          icon={<WhatsAppIcon size={18} />}
                        />
                      </Box>
                      {idType === "email" ? (
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: "block" }}>
                          {t('auth.forgot_password.phone_methods_hint')}
                        </Typography>
                      ) : null}
                    </Box>

                    {captchaRequired ? (
                      <Box sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={captchaChecked}
                              onChange={(e) => setCaptchaChecked(e.target.checked)}
                              sx={{ color: alpha(EVZONE.orange, 0.7), "&.Mui-checked": { color: EVZONE.orange } }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 900 }}>
                                {t('auth.forgot_password.captcha_label')}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                {t('auth.forgot_password.captcha_desc')}
                              </Typography>
                            </Box>
                          }
                        />
                      </Box>
                    ) : null}

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button
                        variant="contained"
                        color="secondary"
                        sx={orangeContainedSx}
                        endIcon={<ArrowRightIcon size={18} />}
                        onClick={requestSend}
                        disabled={!canSend()}
                      >
                        {t('auth.forgot_password.continue')}
                      </Button>
                      <Button
                        variant="outlined"
                        sx={orangeOutlinedSx}
                        startIcon={<HelpCircleIcon size={18} />}
                        onClick={() => navigate("/auth/account-recovery-help")}
                      >
                        {t('auth.forgot_password.account_recovery_help')}
                      </Button>
                    </Stack>

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {t('auth.forgot_password.tip_spam')}
                    </Typography>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Footer */}
        <Box className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between" sx={{ opacity: 0.92 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            © {new Date().getFullYear()} EVzone Group.
          </Typography>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/terms", "_blank")}>
              {t('auth.terms')}
            </Button>
            <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/privacy", "_blank")}>
              {t('auth.privacy')}
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Confirm send dialog */}
      < Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)
        }
        PaperProps={{ sx: { borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}
      >
        <DialogTitle sx={{ fontWeight: 950 }}>{t('auth.forgot_password.confirm_send_title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.2}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {t('auth.forgot_password.send_to')}
            </Typography>
            <Box sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.55), p: 1.2 }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box sx={{ color: delivery === "whatsapp_code" ? WHATSAPP.green : EVZONE.orange }}>
                  {delivery === "email_link" ? <MailIcon size={18} /> : delivery === "sms_code" ? <PhoneIcon size={18} /> : <WhatsAppIcon size={18} />}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900 }}>{deliveryMask()}</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {t('auth.forgot_password.delivery_label')} <b>{labelForDelivery(delivery)}</b>
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Alert severity="info">{t('auth.forgot_password.confirm_info')}</Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => setConfirmOpen(false)}>
            {t('auth.forgot_password.cancel')}
          </Button>
          <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={doSend}>
            {t('auth.forgot_password.send')}
          </Button>
        </DialogActions>
      </Dialog >

      <Snackbar
        open={snack.open}
        autoHideDuration={3400}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant={isDark ? "filled" : "standard"}
          sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.92) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box >
  );
}
