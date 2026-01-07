import React from "react";
import { Box, Stack, Typography, Chip, FormControlLabel, Checkbox, TextField, Alert } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { BrandVisa, BrandMastercard, LockIcon } from "./Icons";

interface CardFormProps {
    cardProvider: "Visa" | "Mastercard" | "UnionPay";
    setCardProvider: (p: "Visa" | "Mastercard" | "UnionPay") => void;
    cardholder: string;
    setCardholder: (c: string) => void;
    widgetConfirmed: boolean;
    setWidgetConfirmed: (c: boolean) => void;
}

const EVZONE_ORANGE = "#f77f00";

export default function CardForm({ cardProvider, setCardProvider, cardholder, setCardholder, widgetConfirmed, setWidgetConfirmed }: CardFormProps) {
    const theme = useTheme();

    const cardBrandChipSx = {
        borderColor: alpha(EVZONE_ORANGE, 0.35),
        "&:hover": { backgroundColor: alpha(EVZONE_ORANGE, 0.10) },
    } as const;

    const SecureWidget = () => (
        <Box sx={{ borderRadius: 18, border: `1px dashed ${alpha(theme.palette.text.primary, 0.18)}`, backgroundColor: alpha(theme.palette.background.paper, 0.35), p: 1.4 }}>
            <Stack spacing={1.2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                    <Typography sx={{ fontWeight: 950 }}>Payment Details</Typography>
                    <Stack direction="row" spacing={1}>
                        <Chip
                            clickable
                            variant={cardProvider === "Visa" ? "filled" : "outlined"}
                            color={cardProvider === "Visa" ? "warning" : "default"}
                            icon={<BrandVisa size={18} />}
                            label="Visa"
                            onClick={() => setCardProvider("Visa")}
                            sx={cardBrandChipSx}
                        />
                        <Chip
                            clickable
                            variant={cardProvider === "Mastercard" ? "filled" : "outlined"}
                            color={cardProvider === "Mastercard" ? "warning" : "default"}
                            icon={<BrandMastercard size={18} />}
                            label="Mastercard"
                            onClick={() => setCardProvider("Mastercard")}
                            sx={cardBrandChipSx}
                        />
                    </Stack>
                </Stack>

                <Box className="grid gap-3 md:grid-cols-3">
                    <Box sx={{ borderRadius: 14, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, p: 1.1 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Card number</Typography>
                        <Typography sx={{ fontWeight: 950 }}>•••• •••• •••• 4242</Typography>
                    </Box>
                    <Box sx={{ borderRadius: 14, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, p: 1.1 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Expiry</Typography>
                        <Typography sx={{ fontWeight: 950 }}>12 / 30</Typography>
                    </Box>
                    <Box sx={{ borderRadius: 14, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, p: 1.1 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>CVC</Typography>
                        <Typography sx={{ fontWeight: 950 }}>•••</Typography>
                    </Box>
                </Box>

                <FormControlLabel
                    control={<Checkbox checked={widgetConfirmed} onChange={(e) => setWidgetConfirmed(e.target.checked)} />}
                    label={<Typography sx={{ fontWeight: 900 }}>I entered card details in the secure widget</Typography>}
                />
            </Stack>
        </Box>
    );

    return (
        <Stack spacing={1.2}>
            <TextField value={cardholder} onChange={(e) => setCardholder(e.target.value)} label="Cardholder name" fullWidth />
            <SecureWidget />
            <Alert severity="warning" icon={<LockIcon size={18} />}>
                Demo note: For security, card inputs should never be handled directly by your frontend.
            </Alert>
        </Stack>
    );
}
