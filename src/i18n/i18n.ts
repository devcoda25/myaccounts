import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getDefaultLanguage } from './settings';

// Import translation files
import enCommon from '../../public/locales/en/common.json';
import swCommon from '../../public/locales/sw/common.json';
import arCommon from '../../public/locales/ar/common.json';
import frCommon from '../../public/locales/fr/common.json';
import jaCommon from '../../public/locales/ja/common.json';
import koCommon from '../../public/locales/ko/common.json';
import zhCNCommon from '../../public/locales/zh-CN/common.json';

// Translation resources
const resources = {
    en: { common: enCommon },
    sw: { common: swCommon },
    ar: { common: arCommon },
    fr: { common: frCommon },
    ja: { common: jaCommon },
    ko: { common: koCommon },
    'zh-CN': { common: zhCNCommon },
};

// Initialize i18next
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

export default i18n;
