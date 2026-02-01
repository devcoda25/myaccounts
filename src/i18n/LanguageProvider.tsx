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
import enTranslation from '../../public/locales/en/translation.json';
import swCommon from '../../public/locales/sw/common.json';
import swTranslation from '../../public/locales/sw/translation.json';
import arCommon from '../../public/locales/ar/common.json';
import arTranslation from '../../public/locales/ar/translation.json';
import frCommon from '../../public/locales/fr/common.json';
import frTranslation from '../../public/locales/fr/translation.json';
import jaCommon from '../../public/locales/ja/common.json';
import jaTranslation from '../../public/locales/ja/translation.json';
import koCommon from '../../public/locales/ko/common.json';
import koTranslation from '../../public/locales/ko/translation.json';
import zhCNCommon from '../../public/locales/zh-CN/common.json';
import zhCNTranslation from '../../public/locales/zh-CN/translation.json';
import zhCommon from '../../public/locales/zh/common.json';
import zhTranslation from '../../public/locales/zh/translation.json';
import zhTWCommon from '../../public/locales/zh-TW/common.json';
import esCommon from '../../public/locales/es/common.json';
import esTranslation from '../../public/locales/es/translation.json';
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
    en: { common: enCommon, translation: enTranslation },
    sw: { common: swCommon, translation: swTranslation },
    ar: { common: arCommon, translation: arTranslation },
    fr: { common: frCommon, translation: frTranslation },
    ja: { common: jaCommon, translation: jaTranslation },
    ko: { common: koCommon, translation: koTranslation },
    'zh-CN': { common: zhCNCommon, translation: zhCNTranslation },
    zh: { common: zhCommon, translation: zhTranslation },
    'zh-TW': { common: zhTWCommon },
    es: { common: esCommon, translation: esTranslation },
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
