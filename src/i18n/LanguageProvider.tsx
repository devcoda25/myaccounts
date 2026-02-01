import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { LocaleCode } from './settings';
import {
    getDefaultLanguage,
    getSavedLanguage,
    saveLanguage,
    supportedLocales
} from './settings';

// Import translation files
import enCommon from '../../public/locales/en/common.json';
import swCommon from '../../public/locales/sw/common.json';
import arCommon from '../../public/locales/ar/common.json';
import frCommon from '../../public/locales/fr/common.json';
import jaCommon from '../../public/locales/ja/common.json';
import koCommon from '../../public/locales/ko/common.json';
import zhCNCommon from '../../public/locales/zh-CN/common.json';
import zhCommon from '../../public/locales/zh/common.json';
import zhTWCommon from '../../public/locales/zh-TW/common.json';
import esCommon from '../../public/locales/es/common.json';
import deCommon from '../../public/locales/ge/common.json';
import ruCommon from '../../public/locales/ru/common.json';
import hiCommon from '../../public/locales/hi/common.json';
import idCommon from '../../public/locales/id/common.json';
import msCommon from '../../public/locales/ms/common.json';
import thCommon from '../../public/locales/th/common.json';
import viCommon from '../../public/locales/vi/common.json';
import ptCommon from '../../public/locales/pt/common.json';

// Initialize i18next
const resources = {
    en: { common: enCommon },
    sw: { common: swCommon },
    ar: { common: arCommon },
    fr: { common: frCommon },
    ja: { common: jaCommon },
    ko: { common: koCommon },
    'zh-CN': { common: zhCNCommon },
    zh: { common: zhCommon },
    'zh-TW': { common: zhTWCommon },
    es: { common: esCommon },
    ge: { common: deCommon },
    ru: { common: ruCommon },
    hi: { common: hiCommon },
    id: { common: idCommon },
    ms: { common: msCommon },
    th: { common: thCommon },
    vi: { common: viCommon },
    pt: { common: ptCommon },
};

// Initialize i18n instance
i18n.use(initReactI18next).init({
    resources,
    lng: getDefaultLanguage(),
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    interpolation: {
        escapeValue: false,
    },
    react: {
        useSuspense: false,
    },
});

// Update document direction for RTL languages
const updateDirection = (language: string): void => {
    const isRTL = language === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
};

// Create context
interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => void;
    t: typeof i18n.t;
    isRTL: boolean;
    availableLanguages: Array<{ code: string; name: string; nativeName: string }>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<string>(() => {
        return getSavedLanguage() || getDefaultLanguage();
    });

    // Initialize i18n language
    useEffect(() => {
        i18n.changeLanguage(language);
        updateDirection(language);
    }, [language]);

    const setLanguage = useCallback((lang: string) => {
        setLanguageState(lang);
        i18n.changeLanguage(lang);
        if (supportedLocales.some(l => l.code === lang)) {
            saveLanguage(lang as LocaleCode);
        }
        updateDirection(lang);
    }, []);

    const availableLanguages = supportedLocales.map(l => ({
        code: l.code,
        name: l.name,
        nativeName: l.nativeName,
    }));

    const value = {
        language,
        setLanguage,
        t: i18n.t,
        isRTL: language === 'ar',
        availableLanguages,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// Hook to use language context
export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

// Hook for simple translations (for components that don't want full context)
export const useTranslation = () => {
    const { t, language, isRTL } = useLanguage();
    return { t, language, isRTL };
};

export default LanguageProvider;
