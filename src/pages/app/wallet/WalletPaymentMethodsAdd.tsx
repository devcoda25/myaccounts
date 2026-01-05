import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  FormControlLabel,
  InputAdornment,
  LinearProgress,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { useThemeStore } from "../../../stores/themeStore";
import { motion } from "framer-motion";
import { getProviderIcon, MtnMomoLogo, AirtelMoneyLogo, VisaLogo, MastercardLogo, PayPalLogo, AfricellLogo, GooglePayLogo, ApplePayLogo, AlipayLogo, JumiaPayLogo, PayoneerLogo, UnionPayLogo, WeChatPayLogo } from "../../../assets/paymentIcons";

// Sub-components
import MobileMoneyForm from "./add-method-components/MobileMoneyForm";
import CardForm from "./add-method-components/CardForm";
import DigitalWalletForm from "./add-method-components/DigitalWalletForm";
import BankTransferForm from "./add-method-components/BankTransferForm";
import { ArrowLeftIcon, CheckCircleIcon, KeypadIcon, LockIcon, PhoneIcon, PlusIcon, ShieldCheckIcon, XCircleIcon } from "./add-method-components/Icons";
import { WalletService } from "../../../services/WalletService";
import { useAuthStore } from "../../../stores/authStore";

/**
 * EVzone My Accounts - Add Payment Method
 * Route: /app/wallet/payment-methods/add
 */

type Severity = "info" | "warning" | "error" | "success";

// New Method Types to support distinct flows
type MethodType = "card" | "momo" | "wallet" | "bank";

// Providers
type MomoProvider = "MTN MoMo" | "Airtel Money" | "Africell";
type CardProvider = "Visa" | "Mastercard" | "UnionPay";

type VerifyChannel = "3DS" | "OTP" | "None";

type ResultState = "idle" | "verifying" | "success" | "failed";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

export default function AddPaymentMethodPage() {
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const theme = useTheme();
  const { requestPhoneVerification, verifyPhone } = useAuthStore();

  // Flow
  const steps = ["Method", "Details", "Verify", "Done"] as const;
  const [step, setStep] = useState<number>(0);

  // Base
  const [methodType, setMethodType] = useState<MethodType>("card");
  const [label, setLabel] = useState("Primary method");
  const [setDefault, setSetDefault] = useState(true);
  // Provider ID for Wallets/Gateways
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [selectedProviderLabel, setSelectedProviderLabel] = useState("");

  // Card State
  const [cardProvider, setCardProvider] = useState<CardProvider>("Visa");
  const [cardholder, setCardholder] = useState("Ronald Isabirye");
  const [widgetConfirmed, setWidgetConfirmed] = useState(false);

  // Mobile Money State
  const [momoProvider, setMomoProvider] = useState<MomoProvider>("MTN MoMo");
  const [momoPhone, setMomoPhone] = useState("+256 761 677 709");

  // Bank State
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");

  // Billing address optional
  const [billingEnabled, setBillingEnabled] = useState(false);
  const [billLine1, setBillLine1] = useState("");
  const [billLine2, setBillLine2] = useState("");
  const [billCity, setBillCity] = useState("Kampala");
  const [billRegion, setBillRegion] = useState("Central");
  const [billPostal, setBillPostal] = useState("");
  const [billCountry, setBillCountry] = useState("Uganda");

  // Verification
  const verifyChannel: VerifyChannel =
    methodType === "momo" ? "OTP" :
      methodType === "card" ? "3DS" :
        "None"; // Wallets usually verify implicitly via redirect

  const [verifyCode, setVerifyCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [result, setResult] = useState<ResultState>("idle");

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  // Auto-send OTP when entering step 2 (Verification)
  useEffect(() => {
    if (step === 2 && methodType === "momo" && cooldown === 0) {
      sendCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, methodType]);

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


  const methodReady = label.trim().length >= 2;

  const detailsReady = useMemo(() => {
    if (methodType === "card") {
      if (!cardholder.trim()) return false;
      return widgetConfirmed;
    }
    if (methodType === "momo") {
      return momoPhone.length > 9; // Basic validation
    }
    if (methodType === "bank") {
      return bankAccountName.length > 2 && bankAccountNumber.length > 5;
    }
    // Wallet is handled by "Connect" button immediately usually, but for this flow:
    if (methodType === "wallet") {
      return true; // The connection happens on next step or via button
    }
    return false;
  }, [methodType, cardholder, widgetConfirmed, momoPhone, bankAccountName, bankAccountNumber]);

  const billingReady = useMemo(() => {
    if (!billingEnabled) return true;
    return billLine1.trim().length >= 3 && billCountry.trim().length >= 2;
  }, [billingEnabled, billLine1, billCountry]);

  // For wallets, we skip verification step or auto-complete it
  const verifyReady = methodType === "wallet" || methodType === "bank" ? true : verifyCode.trim().length === 6;

  const canNext = useMemo(() => {
    if (result === "verifying") return false;
    if (step === 0) return methodReady;
    if (step === 1) return detailsReady && billingReady;
    if (step === 2) return verifyReady;
    return false;
  }, [step, methodReady, detailsReady, billingReady, verifyReady, result, methodType]);

  const goNext = () => {
    if (!canNext) {
      if (step === 0) return setSnack({ open: true, severity: "warning", msg: "Enter a label for this method." });
      if (step === 1) {
        if (!detailsReady) return setSnack({ open: true, severity: "warning", msg: "Please complete all payment details." });
        if (!billingReady) return setSnack({ open: true, severity: "warning", msg: "Complete required billing address fields." });
      }
      if (step === 2) return setSnack({ open: true, severity: "warning", msg: "Enter the verification code." });
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };



  const submitMethod = async () => {
    try {
      let details: any = {};
      let providerName = "";

      if (methodType === "momo") {
        providerName = momoProvider;
        details = { phone: momoPhone, label, masked: `${momoProvider} ••• ${momoPhone.slice(-3)}` };
      } else if (methodType === "card") {
        providerName = cardProvider;
        details = { cardholder, label: label, masked: `${cardProvider} ••••` }; // In real app, get last4 from tokenizer
      } else if (methodType === "bank") {
        providerName = "Bank Transfer";
        details = { accountName: bankAccountName, accountNumber: bankAccountNumber, bankName, label, masked: `${bankName} ••• ${bankAccountNumber.slice(-4)}` };
      } else if (methodType === "wallet") {
        providerName = selectedProviderLabel;
        details = { providerId: selectedProviderId, label, masked: selectedProviderLabel };
      }

      if (billingEnabled) {
        details.billing = {
          line1: billLine1,
          line2: billLine2,
          city: billCity,
          region: billRegion,
          postal: billPostal,
          country: billCountry
        };
      }

      await WalletService.addMethod({
        type: methodType,
        provider: providerName,
        details,
        token: `tok_${Math.random().toString(36).substring(7)}`, // Mock token
      });

      setResult("success");
      setStep(3);
      setSnack({ open: true, severity: "success", msg: "Payment method added successfully." });
    } catch (err) {
      console.error(err);
      setResult("failed");
      setSnack({ open: true, severity: "error", msg: "Failed to save payment method." });
    }
  };

  // Logic for wallet connection (simulated)
  const handleWalletConnect = async () => {
    setSnack({ open: true, severity: "info", msg: `Connecting to ${selectedProviderLabel}...` });
    // Simulate OAuth delay
    await new Promise(r => setTimeout(r, 1000));
    await submitMethod();
  }

  const goBack = () => {
    if (result === "verifying") return;
    setStep((s) => Math.max(0, s - 1));
  };

  const sendCode = async () => {
    if (cooldown > 0) return;

    if (methodType === "momo") {
      try {
        await requestPhoneVerification(momoPhone, 'sms_code');
        setCooldown(30);
        setSnack({ open: true, severity: "success", msg: "OTP sent to your phone." });
      } catch (e: any) {
        setSnack({ open: true, severity: "error", msg: e.message || "Failed to send OTP." });
      }
      return;
    }

    setCooldown(30);
    setSnack({ open: true, severity: "info", msg: "3DS challenge code sent (demo)." });
  };

  const confirmVerify = async () => {
    if (methodType === "wallet") {
      await submitMethod(); // Should be handled by connect but backup
      return;
    }

    if (methodType === "bank") {
      setResult("verifying"); // Show loading
      await submitMethod();
      return;
    }

    if (!verifyReady) {
      setSnack({ open: true, severity: "warning", msg: "Enter the 6-digit code." });
      return;
    }

    setResult("verifying");
    await new Promise((r) => setTimeout(r, 900));

    if (methodType === "momo") {
      setResult("verifying");
      try {
        // Verify using API
        // We use direct API call to avoid refreshing user if not needed, but store helper is fine
        await verifyPhone(momoPhone, verifyCode);
        await submitMethod();
      } catch (e: any) {
        setResult("failed");
        setSnack({ open: true, severity: "error", msg: "Invalid OTP code." });
      }
      return;
    }

    setResult("verifying");
    await new Promise((r) => setTimeout(r, 900));

    const demoCode = "123456";
    const ok = verifyCode.trim() === demoCode || Math.random() > 0.15; // Allow some randomness for demo if not exact code

    if (ok) {
      await submitMethod();
    } else {
      setResult("failed");
      setSnack({ open: true, severity: "error", msg: "Verification failed. Try again." });
    }
  };

  const resetAll = () => {
    setStep(0);
    setResult("idle");
    setVerifyCode("");
    setCooldown(0);
    setWidgetConfirmed(false);
    setBillingEnabled(false);
  };

  const summaryLine = useMemo(() => {
    if (methodType === "card") return `${cardProvider} card • ${label}${setDefault ? " (Default)" : ""}`;
    if (methodType === "wallet") return `${selectedProviderLabel} • ${label}${setDefault ? " (Default)" : ""}`;
    if (methodType === "bank") return `${bankName} • ${label}${setDefault ? " (Default)" : ""}`;
    const d = momoPhone.replace(/\D/g, "");
    const last = d.slice(-3);
    return `${momoProvider} ••• ${last || ""} • ${label}${setDefault ? " (Default)" : ""}`;
  }, [methodType, cardProvider, momoProvider, momoPhone, label, setDefault, selectedProviderLabel, bankName]);


  const BillingSection = () => (
    <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
      <Stack spacing={1.1}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
          <Box>
            <Typography sx={{ fontWeight: 950 }}>Billing address</Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Optional. Useful for card verification and receipts.</Typography>
          </Box>
          <FormControlLabel control={<Switch checked={billingEnabled} onChange={(e) => setBillingEnabled(e.target.checked)} color="secondary" />} label={<Typography sx={{ fontWeight: 900 }}>Enable</Typography>} />
        </Stack>

        <Collapse in={billingEnabled}>
          <Box className="grid gap-3 md:grid-cols-2" sx={{ mt: 1 }}>
            <TextField value={billLine1} onChange={(e) => setBillLine1(e.target.value)} label="Address line 1" fullWidth />
            <TextField value={billLine2} onChange={(e) => setBillLine2(e.target.value)} label="Address line 2" fullWidth />
            <TextField value={billCity} onChange={(e) => setBillCity(e.target.value)} label="City" fullWidth />
            <TextField value={billRegion} onChange={(e) => setBillRegion(e.target.value)} label="Region" fullWidth />
            <TextField value={billPostal} onChange={(e) => setBillPostal(e.target.value)} label="Postal code" fullWidth />
            <TextField value={billCountry} onChange={(e) => setBillCountry(e.target.value)} label="Country" fullWidth />
          </Box>

          {!billingReady ? (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Address line 1 and Country are required when billing is enabled.
            </Alert>
          ) : null}
        </Collapse>
      </Stack>
    </Box>
  );

  const VerificationPanel = () => (
    <Card>
      <CardContent className="p-5 md:p-7">
        <Stack spacing={1.4}>
          <Typography variant="h6">Verification</Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {methodType === "momo"
              ? "We sent an OTP to your phone."
              : methodType === "card"
                ? "Your bank may require a 3DS verification (demo)."
                : "Verify your details."}
          </Typography>

          {methodType !== "wallet" && methodType !== "bank" && methodType !== "momo" && (
            <Alert severity="info" icon={<LockIcon size={18} />}>
              Demo code: <b>123456</b>
            </Alert>
          )}

          {methodType !== "wallet" && methodType !== "bank" && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "stretch", sm: "center" }}>
              <TextField
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                label="6-digit code"
                placeholder="123456"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeypadIcon size={18} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button variant="outlined" sx={orangeOutlined} onClick={sendCode} disabled={cooldown > 0}>
                {cooldown > 0 ? `Resend (${cooldown}s)` : "Resend"}
              </Button>
            </Stack>
          )}

          {result === "verifying" ? (
            <Box>
              <LinearProgress />
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Verifying...
              </Typography>
            </Box>
          ) : result === "failed" ? (
            <Alert severity="error" icon={<XCircleIcon size={18} />}>
              Verification failed. Check the code and try again.
            </Alert>
          ) : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon size={18} />} onClick={goBack} disabled={result === "verifying"}>
              Back
            </Button>
            <Button variant="contained" sx={greenContained} startIcon={<ShieldCheckIcon size={18} />} onClick={confirmVerify} disabled={!verifyReady || result === "verifying"}>
              Verify and add
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  const DonePanel = () => (
    <Card>
      <CardContent className="p-5 md:p-7">
        <Stack spacing={1.4}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box sx={{ width: 44, height: 44, borderRadius: 16, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, 0.16), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
              <CheckCircleIcon size={18} />
            </Box>
            <Box>
              <Typography variant="h6">Payment method added</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {summaryLine}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Alert severity="success">You can now use this method to add funds and pay across EVzone services.</Alert>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <Button variant="contained" sx={greenContained} onClick={() => navigate("/app/wallet/payment-methods")}>
              Back to payment methods
            </Button>
            <Button variant="outlined" sx={orangeOutlined} onClick={resetAll}>
              Add another
            </Button>
          </Stack>

          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Note: In production, you should store only tokens, never raw card details.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );

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
                        <Typography variant="h5">Add payment method</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Add a secure method for payments and top-ups. Verification may be required.
                        </Typography>
                      </Box>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon size={18} />} onClick={() => navigate("/app/wallet/payment-methods")}>
                          Back
                        </Button>
                        <Button variant="contained" sx={orangeContained} startIcon={<PlusIcon size={18} />} onClick={() => setStep(0)}>
                          Connect Provider
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
                  </Stack>
                </CardContent>
              </Card>

              {step === 0 ? (
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={1.6}>
                      <Stack spacing={3}>
                        {[
                          {
                            title: "Mobile Money",
                            items: [
                              { id: "mtn", label: "MTN MoMo", icon: <MtnMomoLogo size={32} />, type: "momo" },
                              { id: "airtel", label: "Airtel Money", icon: <AirtelMoneyLogo size={32} />, type: "momo" },
                              { id: "africell", label: "Africell", icon: <AfricellLogo size={32} />, type: "momo" },
                            ]
                          },
                          {
                            title: "Cards",
                            items: [
                              { id: "visa", label: "Visa", icon: <VisaLogo size={32} />, type: "card" },
                              { id: "mastercard", label: "Mastercard", icon: <MastercardLogo size={32} />, type: "card" },
                              { id: "unionpay", label: "UnionPay", icon: <UnionPayLogo size={32} />, type: "card" },
                            ]
                          },
                          {
                            title: "Digital Wallets",
                            items: [
                              { id: "paypal", label: "PayPal", icon: <PayPalLogo size={32} />, type: "wallet" },
                              { id: "apple", label: "Apple Pay", icon: <ApplePayLogo size={32} />, type: "wallet" },
                              { id: "google", label: "Google Pay", icon: <GooglePayLogo size={32} />, type: "wallet" },
                              { id: "alipay", label: "Alipay", icon: <AlipayLogo size={32} />, type: "wallet" },
                              { id: "wechat", label: "WeChat Pay", icon: <WeChatPayLogo size={32} />, type: "wallet" },
                              { id: "payoneer", label: "Payoneer", icon: <PayoneerLogo size={32} />, type: "wallet" },
                              { id: "jumia", label: "JumiaPay", icon: <JumiaPayLogo size={32} />, type: "wallet" },
                            ]
                          }
                        ].map((category) => (
                          <Box key={category.title}>
                            <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 800, color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                              {category.title}
                            </Typography>
                            <Box className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {category.items.map((p) => (
                                <Button
                                  key={p.id}
                                  variant="outlined"
                                  sx={{
                                    height: 90,
                                    borderColor: alpha(theme.palette.text.primary, 0.1),
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0.8,
                                    backgroundColor: alpha(theme.palette.background.default, 0.4),
                                    '&:hover': { borderColor: EVZONE.orange, bgcolor: alpha(EVZONE.orange, 0.05) }
                                  }}
                                  onClick={() => {
                                    setMethodType(p.type as MethodType);
                                    if (p.type === 'momo') {
                                      setMomoProvider(p.label as any);
                                    } else if (p.type === 'card') {
                                      setCardProvider(p.label as any);
                                    } else if (p.type === 'wallet') { // Gateways included here
                                      setSelectedProviderId(p.id);
                                      setSelectedProviderLabel(p.label);
                                    }
                                    setStep(1);
                                  }}
                                >
                                  {p.icon}
                                  <Typography variant="body2" fontWeight={600} noWrap>{p.label}</Typography>
                                </Button>
                              ))}
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}

              {step === 1 ? (
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={1.6}>
                      <Typography variant="h6">Enter details</Typography>
                      {methodType === "card" && (
                        <CardForm
                          cardProvider={cardProvider}
                          setCardProvider={setCardProvider}
                          cardholder={cardholder}
                          setCardholder={setCardholder}
                          widgetConfirmed={widgetConfirmed}
                          setWidgetConfirmed={setWidgetConfirmed}
                        />
                      )}

                      {methodType === "momo" && (
                        <MobileMoneyForm
                          provider={momoProvider}
                          setProvider={setMomoProvider}
                          phone={momoPhone}
                          setPhone={setMomoPhone}
                        />
                      )}

                      {methodType === "wallet" && (
                        <DigitalWalletForm
                          providerId={selectedProviderId}
                          providerLabel={selectedProviderLabel}
                          onConnect={handleWalletConnect}
                        />
                      )}

                      {methodType === "bank" && (
                        <BankTransferForm
                          accountName={bankAccountName}
                          setAccountName={setBankAccountName}
                          accountNumber={bankAccountNumber}
                          setAccountNumber={setBankAccountNumber}
                          bankName={bankName}
                          setBankName={setBankName}
                        />
                      )}

                      {/* Only show billing for Card and MoMo, usually not needed for external wallets as they handle it, but can be kept */}
                      {(methodType === "card" || methodType === "momo") && <BillingSection />}

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon size={18} />} onClick={() => setStep(0)}>
                          Back
                        </Button>
                        {/* Hide Next for Wallet type as they use the Connect Button inside the form */}
                        {methodType !== "wallet" && (
                          <Button variant="contained" sx={greenContained} onClick={goNext} disabled={!detailsReady}>
                            Next
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}

              {step === 2 ? <VerificationPanel /> : null}
              {step === 3 ? <DonePanel /> : null}
            </Stack>
          </motion.div>
        </Box>
      </Box>
    </>
  );
}
