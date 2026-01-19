import React from 'react';
import { Box, Card, CardContent, Typography, Stack, Switch, Divider, Alert, useTheme, alpha } from '@mui/material';
import { useThemeStore } from "@/stores/themeStore";
import { getStyles } from '../../styles';
import { School as SchoolIcon, Zap as ZapIcon, ShoppingBag as ShoppingBagIcon, Shield as ShieldIcon } from 'lucide-react';
import { ChildProfile, AppKey } from "../../types";

interface AppsTabProps {
    selectedChild: ChildProfile;
    updateChild: (id: string, patch: Partial<ChildProfile>, audit?: any) => void;
    requestStepUp: (title: string, subtitle: string, onVerified: () => void) => void;
    setSnack: (snack: { open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }) => void;
}

export default function AppsTab({ selectedChild, updateChild, requestStepUp, setSnack }: AppsTabProps) {
    const theme = useTheme();
    const { mode } = useThemeStore();
    const { cardSx, EVZONE } = getStyles(theme, mode);

    return (
        <Card sx={cardSx}>
            <CardContent className="p-5">
                <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <SchoolIcon size={20} />
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Allowed apps</Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Turn apps on or off for the child account.
                    </Typography>
                    <Divider />

                    <Box className="grid gap-2 md:grid-cols-2">
                        {(["EVzone School", "EduMart", "EVzone Marketplace", "EVzone Charging", "ServiceMart", "ShopNow", "Properties", "Fashion", "Art"] as AppKey[]).map((key) => {
                            const isOn = selectedChild.apps?.[key] ?? false;
                            const icon = key === "EVzone School" ? <SchoolIcon size={20} /> : key === "EVzone Charging" ? <ZapIcon size={20} /> : <ShoppingBagIcon size={20} />;

                            return (
                                <Box key={key} sx={{
                                    borderRadius: "4px", // Wallet Match: 4px
                                    border: `1px solid ${alpha(theme.palette.text.primary, 0.10)} `,
                                    backgroundColor: alpha(theme.palette.background.paper, 0.40),
                                    p: 1.2
                                }}>
                                    <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
                                        <Stack direction="row" spacing={1.2} alignItems="center">
                                            <Box sx={{
                                                width: 42,
                                                height: 42,
                                                borderRadius: "4px", // Wallet Match: 4px
                                                display: "grid",
                                                placeItems: "center",
                                                backgroundColor: alpha(EVZONE.green, 0.12),
                                                border: `1px solid ${alpha(theme.palette.text.primary, 0.08)} `
                                            }}>
                                                {icon}
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontWeight: 950 }}>{key}</Typography>
                                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{isOn ? "Allowed" : "Blocked"}</Typography>
                                            </Box>
                                        </Stack>

                                        <Switch
                                            checked={isOn}
                                            onChange={(e) =>
                                                requestStepUp(
                                                    "Update app access",
                                                    `This changes access to ${key}.`,
                                                    () => {
                                                        const currentApps = selectedChild.apps || {};
                                                        updateChild(
                                                            selectedChild.id,
                                                            { apps: { ...currentApps, [key]: e.target.checked } as any },
                                                            { kind: "App Access Updated", summary: `${e.target.checked ? "Allowed" : "Blocked"} ${key} `, severity: e.target.checked ? "info" : "warning" }
                                                        );
                                                        setSnack({ open: true, severity: "success", msg: "Updated." });
                                                    }
                                                )
                                            }
                                        />
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Box>

                    <Alert severity="info" icon={<ShieldIcon size={18} />} sx={{ borderRadius: "4px" }}>
                        Tip: Keep School and EduMart on, and restrict Marketplace if needed.
                    </Alert>
                </Stack>
            </CardContent>
        </Card>
    );
}
