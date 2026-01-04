import React from "react";
import { Box, Stack, Typography, TextField, Alert } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { BankIcon } from "./Icons";

interface BankTransferFormProps {
    accountName: string;
    setAccountName: (s: string) => void;
    accountNumber: string;
    setAccountNumber: (s: string) => void;
    bankName: string;
    setBankName: (s: string) => void;
}

export default function BankTransferForm({ accountName, setAccountName, accountNumber, setAccountNumber, bankName, setBankName }: BankTransferFormProps) {
    const theme = useTheme();

    return (
        <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
            <Stack spacing={1.2}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <BankIcon size={20} />
                    <Typography sx={{ fontWeight: 950 }}>Bank Account Details</Typography>
                </Stack>

                <Box className="grid gap-3 md:grid-cols-1">
                    <TextField
                        label="Account Holder Name"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Account Number / IBAN"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Bank Name / SWIFT Code"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        fullWidth
                    />
                </Box>
                <Alert severity="info" >
                    We may perform a micro-deposit involved to verify this account ownership.
                </Alert>
            </Stack>
        </Box>
    );
}
