import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip, alpha, useTheme, Typography, Box } from '@mui/material';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EVZONE } from '../../theme/evzone';

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
    { code: 'es', label: 'Spanish', flag: '🇪🇸' },
    { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
    { code: 'sw', label: 'Swahili', flag: '🇹🇿' },
];

export default function LanguageSwitcher() {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        handleClose();
    };

    return (
        <>
            <Tooltip title={t('header.language')}>
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{
                        border: `1px solid ${alpha(EVZONE.orange, 0.30)}`,
                        borderRadius: 12,
                        color: EVZONE.orange,
                        backgroundColor: alpha(theme.palette.background.paper, 0.60),
                        '&:hover': {
                            backgroundColor: alpha(EVZONE.orange, 0.1),
                        }
                    }}
                >
                    <Globe size={18} />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        borderRadius: '12px',
                        minWidth: 150,
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {LANGUAGES.map((lang) => (
                    <MenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        selected={i18n.language === lang.code || i18n.language?.startsWith(lang.code)}
                        sx={{ fontWeight: i18n.language === lang.code ? 700 : 400 }}
                    >
                        <Box component="span" sx={{ mr: 1, fontSize: '1.2em' }}>{lang.flag}</Box>
                        {/* Show localized name if available, fallback to label handled by map but typically static is fine for switcher or use t(`languages.${lang.code}`) */}
                        {t(`languages.${lang.code}`)}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
