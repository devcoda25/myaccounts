import React, { useRef } from "react";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { EVZONE } from "../../../../theme/evzone";
import { useThemeStore } from "../../../../stores/themeStore";
import { SaveIcon, UserIcon } from "../../../../utils/icons";

interface ProfileFormProps {
    fullName: string;
    setFullName: (val: string) => void;
    country: string;
    setCountry: (val: string) => void;
    dob: Date | null;
    setDob: (val: Date | null) => void;
    avatarUrl: string;
    onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    saving: boolean;
    onSave: () => void;
    countries: string[];
}

// ...

export const ProfileForm = ({
    fullName,
    setFullName,
    country,
    setCountry,
    dob,
    setDob,
    avatarUrl,
    onAvatarChange,
    saving,
    onSave,
    countries
}: ProfileFormProps) => {
    const theme = useTheme();
    const { mode } = useThemeStore();
    const fileRef = useRef<HTMLInputElement | null>(null);

    const orangeContainedSx = {
        bgcolor: EVZONE.orange,
        color: "#ffffff",
        "&:hover": {
            bgcolor: alpha(EVZONE.orange, 0.85),
        },
    } as const;

    const orangeOutlinedSx = {
        borderColor: alpha(EVZONE.orange, 0.5),
        color: EVZONE.orange,
        "&:hover": {
            borderColor: EVZONE.orange,
            backgroundColor: alpha(EVZONE.orange, 0.08),
        },
    } as const;

    const onPickAvatar = () => fileRef.current?.click();

    return (
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
                                                className="hidden"
                                                onChange={onAvatarChange}
                                            />

                                            <Button
                                                variant="outlined"
                                                size="small"
                                                sx={orangeOutlinedSx}
                                                onClick={onPickAvatar}
                                            >
                                                Upload new
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Box>

                            {/* Form Fields */}
                            <Box className="md:col-span-8">
                                <Stack spacing={2.5}>
                                    <TextField
                                        label="Full Name"
                                        variant="outlined"
                                        fullWidth
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        helperText="First and Last names"
                                    />
                                    <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <TextField
                                            select
                                            label="Country / Region"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            fullWidth
                                        >
                                            {countries.map((c) => (
                                                <MenuItem key={c} value={c}>
                                                    {c}
                                                </MenuItem>
                                            ))}
                                        </TextField>

                                        <TextField
                                            label="Date of Birth"
                                            type="date"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            value={dob ? dob.toISOString().split('T')[0] : ''}
                                            onChange={(e) => setDob(e.target.value ? new Date(e.target.value) : null)}
                                        />
                                    </Box>
                                </Stack>
                            </Box>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </motion.div>
    );
};
