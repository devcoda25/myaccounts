import React, { useState, useRef, useEffect } from 'react';
import i18n from 'i18next';
import {
    Box,
    Button,
    Menu,
    MenuItem,
    Typography,
    ListItemIcon,
    ListItemText,
    alpha,
    useTheme,
    Divider,
    Chip,
} from '@mui/material';
import {
    Globe,
    Check,
    ChevronDown,
} from 'lucide-react';
import { supportedLocales, type LocaleCode } from './settings';

export const LanguageSelector: React.FC<{
    variant?: 'dropdown' | 'compact' | 'menu';
    showName?: boolean;
    onLanguageChange?: (language: string) => void;
    className?: string;
}> = ({
    variant = 'dropdown',
    showName = true,
    onLanguageChange,
    className = ''
}) => {
        const theme = useTheme();
        const anchorRef = useRef<HTMLButtonElement>(null);
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
        const open = Boolean(anchorEl);

        const language = i18n.language || 'en';
        const currentLocale = supportedLocales.find(l => l.code === language) || supportedLocales[0];

        const handleClick = (event: React.MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
        };

        const handleClose = () => {
            setAnchorEl(null);
        };

        const handleLanguageChange = (newLang: string) => {
            i18n.changeLanguage(newLang);
            onLanguageChange?.(newLang);

            // Update document direction for RTL languages
            const isRTL = newLang === 'ar';
            document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
            document.documentElement.lang = newLang;

            handleClose();
        };

        // Group languages by priority
        const priorityGroups = [
            { name: 'Popular', locales: supportedLocales.filter(l => l.priority === 1) },
            { name: 'Expanded', locales: supportedLocales.filter(l => l.priority === 2) },
            { name: 'More', locales: supportedLocales.filter(l => l.priority === 3) },
        ];

        if (variant === 'compact') {
            return (
                <Box className={className}>
                    <Button
                        ref={anchorRef}
                        onClick={handleClick}
                        startIcon={<Globe size={18} />}
                        endIcon={<ChevronDown size={16} />}
                        sx={{
                            textTransform: 'none',
                            color: theme.palette.text.primary,
                            fontWeight: 500,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1.5,
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                            },
                        }}
                    >
                        {currentLocale.flag}
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        PaperProps={{
                            sx: {
                                mt: 0.5,
                                minWidth: 200,
                                maxHeight: 400,
                                bgcolor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.shadows[3],
                            }
                        }}
                    >
                        {supportedLocales.map((lang) => (
                            <MenuItem
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                selected={language === lang.code}
                                sx={{
                                    py: 1,
                                    px: 2,
                                    bgcolor: language === lang.code
                                        ? alpha(theme.palette.primary.main, 0.08)
                                        : 'transparent',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <Typography variant="body1">{lang.flag}</Typography>
                                </ListItemIcon>
                                <ListItemText
                                    primary={lang.nativeName}
                                    secondary={lang.name}
                                    primaryTypographyProps={{
                                        variant: 'body2',
                                        fontWeight: language === lang.code ? 600 : 400,
                                    }}
                                    secondaryTypographyProps={{
                                        variant: 'caption',
                                        color: 'text.secondary',
                                    }}
                                />
                                {language === lang.code && (
                                    <Check size={16} color={theme.palette.primary.main} />
                                )}
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
            );
        }

        if (variant === 'menu') {
            return (
                <Box className={className}>
                    <Button
                        ref={anchorRef}
                        onClick={handleClick}
                        startIcon={<Globe size={18} />}
                        endIcon={<ChevronDown size={18} />}
                        sx={{
                            textTransform: 'none',
                            color: theme.palette.text.primary,
                            fontWeight: 500,
                            px: 2,
                            py: 1,
                            borderRadius: 1.5,
                            border: `1px solid ${theme.palette.divider}`,
                            bgcolor: theme.palette.background.paper,
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                borderColor: theme.palette.primary.main,
                            },
                        }}
                    >
                        {showName && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography>{currentLocale.flag}</Typography>
                                <Typography variant="body2">{currentLocale.nativeName}</Typography>
                            </Box>
                        )}
                        {!showName && <Typography>{currentLocale.flag}</Typography>}
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                        PaperProps={{
                            sx: {
                                mt: 0.5,
                                minWidth: 220,
                                maxHeight: 450,
                                bgcolor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.shadows[3],
                            }
                        }}
                    >
                        {priorityGroups.map((group, groupIndex) => (
                            <React.Fragment key={group.name}>
                                {groupIndex > 0 && (
                                    <Divider sx={{ my: 0.5 }} />
                                )}
                                <Box sx={{ px: 2, py: 1 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'text.secondary',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        {group.name}
                                    </Typography>
                                </Box>
                                {group.locales.map((lang) => (
                                    <MenuItem
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code)}
                                        selected={language === lang.code}
                                        sx={{
                                            py: 1,
                                            px: 2,
                                            bgcolor: language === lang.code
                                                ? alpha(theme.palette.primary.main, 0.08)
                                                : 'transparent',
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <Typography variant="body1">{lang.flag}</Typography>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={lang.nativeName}
                                            secondary={lang.name}
                                            primaryTypographyProps={{
                                                variant: 'body2',
                                                fontWeight: language === lang.code ? 600 : 400,
                                            }}
                                            secondaryTypographyProps={{
                                                variant: 'caption',
                                                color: 'text.secondary',
                                            }}
                                        />
                                        {language === lang.code && (
                                            <Check size={16} color={theme.palette.primary.main} />
                                        )}
                                    </MenuItem>
                                ))}
                            </React.Fragment>
                        ))}
                    </Menu>
                </Box>
            );
        }

        // Default: dropdown variant with globe icon
        return (
            <Box className={className}>
                <Button
                    ref={anchorRef}
                    onClick={handleClick}
                    startIcon={<Globe size={18} />}
                    endIcon={<ChevronDown size={18} />}
                    sx={{
                        textTransform: 'none',
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                        px: 2,
                        py: 1,
                        borderRadius: 1.5,
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.paper,
                        '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            borderColor: theme.palette.primary.main,
                        },
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{currentLocale.flag}</Typography>
                        <Typography variant="body2">{currentLocale.nativeName}</Typography>
                    </Box>
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    PaperProps={{
                        sx: {
                            mt: 0.5,
                            minWidth: 220,
                            maxHeight: 450,
                            bgcolor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: theme.shadows[3],
                        }
                    }}
                >
                    {priorityGroups.map((group, groupIndex) => (
                        <React.Fragment key={group.name}>
                            {groupIndex > 0 && (
                                <Divider sx={{ my: 0.5 }} />
                            )}
                            <Box sx={{ px: 2, py: 1 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    {group.name}
                                </Typography>
                            </Box>
                            {group.locales.map((lang) => (
                                <MenuItem
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    selected={language === lang.code}
                                    sx={{
                                        py: 1,
                                        px: 2,
                                        bgcolor: language === lang.code
                                            ? alpha(theme.palette.primary.main, 0.08)
                                            : 'transparent',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <Typography variant="body1">{lang.flag}</Typography>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={lang.nativeName}
                                        secondary={lang.name}
                                        primaryTypographyProps={{
                                            variant: 'body2',
                                            fontWeight: language === lang.code ? 600 : 400,
                                        }}
                                        secondaryTypographyProps={{
                                            variant: 'caption',
                                            color: 'text.secondary',
                                        }}
                                    />
                                    {language === lang.code && (
                                        <Check size={16} color={theme.palette.primary.main} />
                                    )}
                                </MenuItem>
                            ))}
                        </React.Fragment>
                    ))}
                </Menu>
            </Box>
        );
    };

export default LanguageSelector;
