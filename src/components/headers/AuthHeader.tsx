import React from 'react';
import { Box, Stack, Typography, IconButton, Tooltip, alpha, useTheme } from '@mui/material';
import { Sun as SunIcon, Moon as MoonIcon, HelpCircle as HelpIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '../../theme/ThemeContext';
import { EVZONE } from '../../theme/evzone';
import LanguageSwitcher from '../common/LanguageSwitcher';

interface AuthHeaderProps {
    title?: string;
    subtitle?: string;
    showHelp?: boolean;
}

export default function AuthHeader({ title = "EVzone", subtitle, showHelp = true }: AuthHeaderProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { mode, toggleMode } = useThemeContext();
    const isDark = mode === 'dark';

    // Check if we are already on the help page to avoid redundant navigation/snackbar
    const isHelpPage = location.pathname === '/auth/account-recovery-help';

    return (
        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box className="mx-auto max-w-5xl px-4 py-3 md:px-6">
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    {/* Branding / Title */}
                    <Stack direction="row" alignItems="center" spacing={1.2}>
                        <Box
                            sx={{
                                height: 38,
                                display: "flex",
                                alignItems: "center",
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate('/auth/sign-in')}
                        >
                            <img src="/logo.png" alt="EVzone" style={{ height: '100%', width: 'auto' }} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" sx={{ lineHeight: 1.1 }}>{title}</Typography>
                            {subtitle && (
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>
                    </Stack>

                    {/* Actions */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                            <IconButton
                                onClick={toggleMode}
                                size="small"
                                sx={{
                                    border: `1px solid ${alpha(EVZONE.orange, 0.35)}`,
                                    borderRadius: 12,
                                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                                    color: EVZONE.orange,
                                }}
                            >
                                {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                            </IconButton>
                        </Tooltip>

                        <LanguageSwitcher />

                        {showHelp && (
                            <Tooltip title={t('header.help')}>
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        if (!isHelpPage) navigate("/auth/account-recovery-help");
                                    }}
                                    sx={{
                                        border: `1px solid ${alpha(EVZONE.orange, 0.35)}`,
                                        borderRadius: 12,
                                        backgroundColor: alpha(theme.palette.background.paper, 0.6),
                                        color: EVZONE.orange,
                                        opacity: isHelpPage ? 0.5 : 1,
                                        pointerEvents: isHelpPage ? 'none' : 'auto'
                                    }}
                                >
                                    <HelpIcon size={18} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}
