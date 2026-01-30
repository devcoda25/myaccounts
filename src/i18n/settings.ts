// Supported locales with metadata
// Organized by priority: Launch → Expansion → Extended

export const supportedLocales = [
    // Phase 1: Launch languages
    { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇺🇸', priority: 1 },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', dir: 'ltr', flag: '🇹🇿', priority: 1 },
    { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', dir: 'ltr', flag: '🇨🇳', priority: 1 },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦', priority: 1 },

    // Phase 2: Expansion languages
    { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷', priority: 2 },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr', flag: '🇯🇵', priority: 2 },
    { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr', flag: '🇰🇷', priority: 2 },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', flag: '🇮🇳', priority: 2 },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr', flag: '🇮🇩', priority: 2 },

    // Phase 3: Extended support
    { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', dir: 'ltr', flag: '🇹🇼', priority: 3 },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', dir: 'ltr', flag: '🇲🇾', priority: 3 },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', dir: 'ltr', flag: '🇹🇭', priority: 3 },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', dir: 'ltr', flag: '🇻🇳', priority: 3 },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr', flag: '🇧🇷', priority: 3 },
    { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: '🇪🇸', priority: 3 },
] as const;

export type LocaleCode = typeof supportedLocales[number]['code'];

// Default locale (market-dependent, can be configured per deployment)
export const defaultLocale: LocaleCode = 'en';

// Fallback locale when translation is missing
export const fallbackLocale: LocaleCode = 'en';

// Storage key for saved language preference
export const STORAGE_KEY = 'evzone_app_language';

// Get locales by priority
export const getLocalesByPriority = (priority: number) =>
    supportedLocales.filter(l => l.priority === priority);

// Get all Phase 1 (launch) locales
export const launchLocales = getLocalesByPriority(1);

// Get all Phase 2 (expansion) locales
export const expansionLocales = getLocalesByPriority(2);

// Get all Phase 3 (extended) locales
export const extendedLocales = getLocalesByPriority(3);

// Determine if locale is RTL
export const isRTL = (locale: LocaleCode): boolean => {
    return supportedLocales.some(l => l.code === locale && l.dir === 'rtl');
};

// Get locale direction
export const getDirection = (locale: LocaleCode): 'ltr' | 'rtl' => {
    return supportedLocales.find(l => l.code === locale)?.dir || 'ltr';
};

// Get saved language from localStorage
export const getSavedLanguage = (): LocaleCode | null => {
    if (typeof window === 'undefined') return null;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && supportedLocales.some(l => l.code === saved)) {
            return saved as LocaleCode;
        }
    } catch {
        // localStorage access failed
    }
    return null;
};

// Save language to localStorage
export const saveLanguage = (language: LocaleCode): void => {
    try {
        localStorage.setItem(STORAGE_KEY, language);
    } catch {
        // localStorage access failed
    }
};

// Get default language (saved preference or browser preference or system default)
export const getDefaultLanguage = (): LocaleCode => {
    return getSavedLanguage() || defaultLocale;
};

// Namespace configuration
export const namespaces = [
    'common',
    'auth',
    'wallet',
    'profile',
    'navigation',
    'footer',
    'dateTime',
    'errors',
    'admin',
    'settings',
    'security',
    'support',
    'legal',
] as const;

export type Namespace = typeof namespaces[number];

// Currency by locale
export const getCurrencyByLocale = (locale: LocaleCode): string => {
    const currencyMap: Record<string, string> = {
        'en': 'USD',
        'sw': 'UGX',
        'ar': 'AED',
        'fr': 'EUR',
        'ja': 'JPY',
        'ko': 'KRW',
        'zh-CN': 'CNY',
        'hi': 'INR',
        'id': 'IDR',
        'zh-TW': 'TWD',
        'ms': 'MYR',
        'th': 'THB',
        'vi': 'VND',
        'pt': 'BRL',
        'es': 'EUR',
    };
    return currencyMap[locale] || 'USD';
};

// Date format by locale
export const getDateFormatByLocale = (locale: LocaleCode): string => {
    const formatMap: Record<string, string> = {
        'en': 'MM/dd/yyyy',
        'sw': 'dd/MM/yyyy',
        'ar': 'dd/MM/yyyy',
        'fr': 'dd/MM/yyyy',
        'ja': 'yyyy/MM/dd',
        'ko': 'yyyy-MM-dd',
        'zh-CN': 'yyyy-MM-dd',
        'hi': 'dd/MM/yyyy',
        'id': 'dd/MM/yyyy',
        'zh-TW': 'yyyy-MM-dd',
        'ms': 'dd/MM/yyyy',
        'th': 'dd/MM/yyyy',
        'vi': 'dd/MM/yyyy',
        'pt': 'dd/MM/yyyy',
        'es': 'dd/MM/yyyy',
    };
    return formatMap[locale] || 'MM/dd/yyyy';
};
