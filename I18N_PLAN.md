# EVzone "My Accounts" Localization (i18n) Implementation Plan

## 1. Overview

This document outlines the comprehensive localization strategy for the EVzone "My Accounts" platform, enabling support for multiple languages and regions while maintaining code quality and scalability.

### Goals
- Support multiple languages: English (en), Swahili (sw), Chinese (zh-CN/zh-TW), Japanese (ja), Korean (ko), Hindi (hi), Indonesian (id), French (fr), Arabic (ar)
- Enable RTL (Right-to-Left) layout support for Arabic
- Provide locale-specific date, time, and number formatting
- Support CJK (Chinese/Japanese/Korean) character rendering and font stacking
- Handle vertical text options for Japanese (future consideration)
- Support Asian-specific formatting: phone numbers, postal codes, etc.
- Maintain clean separation between content and code
- Enable seamless language switching without page reload
- Support per-user language preferences stored in the backend

---

## 2. Technology Stack Selection

### Recommended Libraries

| Library | Purpose | Version |
|---------|---------|---------|
| **i18next** | Core i18n framework | ^23.15.1 |
| **react-i18next** | React bindings for i18next | ^15.0.2 |
| **i18next-http-backend** | Load translations from files | ^9.2.2 |
| **i18next-browser-languagedetector** | Auto-detect browser language | ^8.0.0 |
| **dayjs** | Date/time localization | ^1.11.13 |
| **dayjs/plugin/localizedFormat** | Localized date formatting | - |
| **dayjs/plugin/relativeTime** | Relative time (e.g., "2 hours ago") | - |
| **dayjs/plugin/localeData** | Locale-specific day/month names | - |
| **dayjs/plugin/calendar** | Calendar-style dates (today, tomorrow) | - |
| **number-to-words** | Convert numbers to localized strings | ^1.7.1 |

### Installation

```bash
cd myaccountsfrontend
npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector dayjs number-to-words
npm install -D @types/node
```

---

## 3. Project Structure

```
myaccountsfrontend/
├── src/
│   ├── i18n/                          # i18n configuration
│   │   ├── index.ts                   # Main i18n configuration
│   │   ├── settings.ts                # i18n settings/constants
│   │   ├── detectors/                 # Language detection strategies
│   │   │   ├── browser.ts
│   │   │   ├── userPreference.ts
│   │   │   └── url.ts
│   │   └── utils/                     # i18n utilities
│   │       ├── date.ts
│   │       ├── number.ts
│   │       └── currency.ts
│   ├── locales/                       # Translation files
│   │   ├── en.json                    # English (default)
│   │   ├── sw.json                    # Swahili
│   │   ├── zh-CN.json                 # Chinese (Simplified)
│   │   ├── zh-TW.json                 # Chinese (Traditional)
│   │   ├── ar.json                    # Arabic (RTL)
│   │   ├── ja.json                    # Japanese
│   │   ├── ko.json                    # Korean
│   │   ├── hi.json                    # Hindi
│   │   ├── id.json                    # Indonesian
│   │   ├── fr.json                    # French
│   │   └── ...                        # Additional languages
│   ├── contexts/
│   │   └── LanguageContext.tsx        # Language context provider
│   ├── hooks/
│   │   └── useLanguage.ts             # Language hook
│   │   └── useTranslation.ts          # Extended translation hook
│   └── components/
│       └── language/                  # Language-related components
│           ├── LanguageSelector.tsx
│           ├── FlagIcon.tsx
│           └── LocaleDate.tsx
```

---

## 4. Translation File Structure

### Example: `locales/en.json`

```json
{
  "app": {
    "name": "EVzone My Accounts",
    "tagline": "Your unified account for all EVzone services"
  },
  "auth": {
    "login": {
      "title": "Sign In",
      "email": "Email Address",
      "password": "Password",
      "forgotPassword": "Forgot Password?",
      "rememberMe": "Remember me",
      "submit": "Sign In",
      "noAccount": "Don't have an account?",
      "signUp": "Sign Up",
      "orContinueWith": "or continue with"
    },
    "register": {
      "title": "Create Account",
      "firstName": "First Name",
      "lastName": "Last Name",
      "email": "Email Address",
      "phone": "Phone Number",
      "password": "Password",
      "confirmPassword": "Confirm Password",
      "termsAccept": "I accept the",
      "termsOfService": "Terms of Service",
      "privacyPolicy": "Privacy Policy",
      "submit": "Create Account",
      "alreadyHaveAccount": "Already have an account?"
    },
    "mfa": {
      "title": "Two-Factor Authentication",
      "description": "Enter the 6-digit code from your authenticator app",
      "code": "Verification Code",
      "submit": "Verify",
      "useBackup": "Use a backup code instead",
      "resendCode": "Resend code"
    }
  },
  "common": {
    "actions": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "submit": "Submit",
      "close": "Close",
      "back": "Back",
      "next": "Next",
      "confirm": "Confirm",
      "search": "Search",
      "filter": "Filter"
    },
    "errors": {
      "required": "This field is required",
      "invalidEmail": "Please enter a valid email address",
      "invalidPhone": "Please enter a valid phone number",
      "passwordTooShort": "Password must be at least 8 characters",
      "passwordRequiresUppercase": "Password must contain an uppercase letter",
      "passwordRequiresLowercase": "Password must contain a lowercase letter",
      "passwordRequiresNumber": "Password must contain a number",
      "passwordRequiresSpecial": "Password must contain a special character",
      "passwordsDoNotMatch": "Passwords do not match",
      "networkError": "Network error. Please try again.",
      "serverError": "Server error. Please try again later.",
      "unknownError": "An unexpected error occurred."
    },
    "loading": {
      "loading": "Loading...",
      "pleaseWait": "Please wait...",
      "processing": "Processing...",
      "saving": "Saving..."
    },
    "validation": {
      "confirmDelete": "Are you sure you want to delete this item?",
      "unsavedChanges": "You have unsaved changes. Do you want to leave?"
    }
  },
  "wallet": {
    "title": "My Wallet",
    "balance": "Balance",
    "availableBalance": "Available Balance",
    "addFunds": "Add Funds",
    "withdraw": "Withdraw",
    "transactions": "Transactions",
    "recentTransactions": "Recent Transactions",
    "noTransactions": "No transactions yet",
    "deposit": "Deposit",
    "payment": "Payment",
    "refund": "Refund",
    "withdrawal": "Withdrawal",
    "status": {
      "pending": "Pending",
      "completed": "Completed",
      "failed": "Failed",
      "cancelled": "Cancelled"
    }
  },
  "profile": {
    "title": "My Profile",
    "personalInfo": "Personal Information",
    "security": "Security",
    "notifications": "Notifications",
    "preferences": "Preferences",
    "language": "Language",
    "timezone": "Timezone",
    "currency": "Currency",
    "editProfile": "Edit Profile",
    "changePassword": "Change Password",
    "twoFactorEnabled": "2FA Enabled",
    "twoFactorDisabled": "2FA Disabled",
    "activeSessions": "Active Sessions",
    "lastLogin": "Last Login"
  },
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "wallet": "Wallet",
    "profile": "Profile",
    "settings": "Settings",
    "logout": "Sign Out",
    "help": "Help"
  },
  "footer": {
    "copyright": "© 2025 EVzone. All rights reserved.",
    "terms": "Terms of Service",
    "privacy": "Privacy Policy",
    "contact": "Contact Us"
  },
  "dateTime": {
    "today": "Today",
    "yesterday": "Yesterday",
    "tomorrow": "Tomorrow",
    "justNow": "Just now",
    "minutesAgo": "{{count}} minute ago",
    "minutesAgo_plural": "{{count}} minutes ago",
    "hoursAgo": "{{count}} hour ago",
    "hoursAgo_plural": "{{count}} hours ago",
    "daysAgo": "{{count}} day ago",
    "daysAgo_plural": "{{count}} days ago",
    "weeksAgo": "{{count}} week ago",
    "weeksAgo_plural": "{{count}} weeks ago",
    "monthsAgo": "{{count}} month ago",
    "monthsAgo_plural": "{{count}} months ago",
    "yearsAgo": "{{count}} year ago",
    "yearsAgo_plural": "{{count}} years ago"
  },
  "errors": {
    "pageNotFound": "Page Not Found",
    "pageNotFoundDescription": "The page you're looking for doesn't exist.",
    "goHome": "Go to Home",
    "unauthorized": "Unauthorized",
    "unauthorizedDescription": "You need to be logged in to access this page.",
    "forbidden": "Forbidden",
    "forbiddenDescription": "You don't have permission to access this page.",
    "serverError": "Server Error",
    "serverErrorDescription": "Something went wrong on our end."
  }
}
```

### Example: `locales/sw.json` (Swahili)

```json
{
  "app": {
    "name": "EVzone Akaunti Zangu",
    "tagline": "Akaunti yako moja kwa huduma zote za EVzone"
  },
  "auth": {
    "login": {
      "title": "Ingia",
      "email": "Barua pepe",
      "password": "Nenosiri",
      "forgotPassword": "Umesahau nenosiri?",
      "rememberMe": "Nikumbuke",
      "submit": "Ingia",
      "noAccount": "Huna akaunti?",
      "signUp": "Jisajili",
      "orContinueWith": "au endelea na"
    },
    "register": {
      "title": "Unda Akaunti",
      "firstName": "Jina la kwanza",
      "lastName": "Jina la mwisho",
      "email": "Barua pepe",
      "phone": "Nambari ya simu",
      "password": "Nenosiri",
      "confirmPassword": "Thibitisha nenosiri",
      "termsAccept": "Nakubali",
      "termsOfService": "Sheria za Huduma",
      "privacyPolicy": "Sera ya Faragha",
      "submit": "Unda Akaunti",
      "alreadyHaveAccount": "Tayari una akaunti?"
    }
  },
  "common": {
    "actions": {
      "save": "Hifadhi",
      "cancel": "Ghairi",
      "delete": "Futa",
      "edit": "Hariri",
      "submit": "Wasilisha",
      "close": "Funga",
      "back": "Rudi",
      "next": "Mbele",
      "confirm": "Thibitisha",
      "search": "Tafuta",
      "filter": "Chuja"
    },
    "errors": {
      "required": "Sehemu hii inahitajika",
      "invalidEmail": "Tafadhali ingiza barua pepe halali",
      "invalidPhone": "Tafadhali ingiza nambari halali ya simu",
      "passwordTooShort": "Nenosiri lazima iwe na angalau herufi 8",
      "networkError": "Hitilafu ya mtandao. Tafadhali jaribu tena.",
      "serverError": "Hitilafu ya seva. Tafadhali jaribu tena baadae."
    },
    "loading": {
      "loading": "Inapakia...",
      "pleaseWait": "Tafadhali subiri...",
      "processing": "Inashughulikia..."
    }
  },
  "wallet": {
    "title": "Poo zangu",
    "balance": "Salio",
    "addFunds": "Ongeza Fedha",
    "withdraw": "Toa Fedha",
    "transactions": "Miamala",
    "deposit": "Ujazo",
    "payment": "Malipo",
    "refund": "Urejesho"
  },
  "navigation": {
    "home": "Nyumbani",
    "dashboard": "Dashibodi",
    "wallet": "Poo",
    "profile": "Wasifu",
    "settings": "Mipangilio",
    "logout": "Toka"
  }
}
```

### Example: `locales/ar.json` (Arabic - RTL)

```json
{
  "app": {
    "name": "حساباتي في EVzone",
    "tagline": "حسابك الموحد لجميع خدمات EVzone"
  },
  "auth": {
    "login": {
      "title": "تسجيل الدخول",
      "email": "البريد الإلكتروني",
      "password": "كلمة المرور",
      "forgotPassword": "نسيت كلمة المرور؟",
      "rememberMe": "تذكرني",
      "submit": "تسجيل الدخول",
      "noAccount": "ليس لديك حساب؟",
      "signUp": "سجل الآن",
      "orContinueWith": "أو تابع باستخدام"
    }
  },
  "common": {
    "actions": {
      "save": "حفظ",
      "cancel": "إلغاء",
      "delete": "حذف",
      "edit": "تعديل",
      "submit": "إرسال",
      "close": "إغلاق",
      "back": "رجوع",
      "next": "التالي",
      "confirm": "تأكيد"
    }
  },
  "wallet": {
    "title": "محفظتي",
    "balance": "الرصيد",
    "addFunds": "إضافة رصيد",
    "withdraw": "سحب",
    "transactions": "المعاملات"
  }
}
```

### Example: `locales/zh-CN.json` (Chinese Simplified)

```json
{
  "app": {
    "name": "EVzone 我的账户",
    "tagline": "您的EVzone统一账户"
  },
  "auth": {
    "login": {
      "title": "登录",
      "email": "电子邮箱",
      "password": "密码",
      "forgotPassword": "忘记密码？",
      "rememberMe": "记住我",
      "submit": "登录",
      "noAccount": "没有账户？",
      "signUp": "注册",
      "orContinueWith": "或使用以下方式登录"
    },
    "register": {
      "title": "创建账户",
      "firstName": "名",
      "lastName": "姓",
      "email": "电子邮箱",
      "phone": "手机号码",
      "password": "密码",
      "confirmPassword": "确认密码",
      "termsAccept": "我已阅读并同意",
      "termsOfService": "服务条款",
      "privacyPolicy": "隐私政策",
      "submit": "创建账户",
      "alreadyHaveAccount": "已有账户？"
    }
  },
  "common": {
    "actions": {
      "save": "保存",
      "cancel": "取消",
      "delete": "删除",
      "edit": "编辑",
      "submit": "提交",
      "close": "关闭",
      "back": "返回",
      "next": "下一步",
      "confirm": "确认"
    },
    "errors": {
      "required": "此字段为必填项",
      "invalidEmail": "请输入有效的电子邮箱地址",
      "invalidPhone": "请输入有效的手机号码",
      "passwordTooShort": "密码长度至少为8个字符",
      "networkError": "网络错误，请重试。",
      "serverError": "服务器错误，请稍后重试。"
    },
    "loading": {
      "loading": "加载中...",
      "pleaseWait": "请稍候..."
    }
  },
  "wallet": {
    "title": "我的钱包",
    "balance": "余额",
    "addFunds": "充值",
    "withdraw": "提现",
    "transactions": "交易记录"
  },
  "navigation": {
    "home": "首页",
    "dashboard": "仪表盘",
    "wallet": "钱包",
    "profile": "个人资料",
    "settings": "设置",
    "logout": "退出登录"
  }
}
```

### Example: `locales/ja.json` (Japanese)

```json
{
  "app": {
    "name": "EVzone マイアカウント",
    "tagline": "EVzoneサービスの統一アカウント"
  },
  "auth": {
    "login": {
      "title": "ログイン",
      "email": "メールアドレス",
      "password": "パスワード",
      "forgotPassword": "パスワードをお忘れですか？",
      "rememberMe": "ログイン状態を保持",
      "submit": "ログイン",
      "noAccount": "アカウントをお持ちでないですか？",
      "signUp": "新規登録"
    },
    "register": {
      "title": "アカウント作成",
      "firstName": "名",
      "lastName": "姓",
      "email": "メールアドレス",
      "phone": "電話番号",
      "password": "パスワード",
      "confirmPassword": "パスワード確認",
      "submit": "アカウント作成"
    }
  },
  "common": {
    "actions": {
      "save": "保存",
      "cancel": "キャンセル",
      "delete": "削除",
      "edit": "編集",
      "submit": "送信",
      "close": "閉じる",
      "back": "戻る",
      "next": "次へ"
    },
    "errors": {
      "required": "この項目は必須です",
      "invalidEmail": "有効なメールアドレスを入力してください",
      "networkError": "ネットワークエラー。再試行してください。"
    }
  },
  "wallet": {
    "title": "マイウォレット",
    "balance": "残高",
    "addFunds": "入金",
    "withdraw": "出金",
    "transactions": "取引履歴"
  }
}
```

### Example: `locales/ko.json` (Korean)

```json
{
  "app": {
    "name": "EVzone 마이 계정",
    "tagline": "EVzone 서비스 통합 계정"
  },
  "auth": {
    "login": {
      "title": "로그인",
      "email": "이메일",
      "password": "비밀번호",
      "forgotPassword": "비밀번호를 잊으셨나요？",
      "submit": "로그인"
    },
    "register": {
      "title": "계정 만들기",
      "firstName": "이름",
      "lastName": "성",
      "email": "이메일",
      "phone": "전화번호",
      "password": "비밀번호",
      "confirmPassword": "비밀번호 확인",
      "submit": "계정 만들기"
    }
  },
  "common": {
    "actions": {
      "save": "저장",
      "cancel": "취소",
      "delete": "삭제",
      "edit": "수정",
      "submit": "제출"
    },
    "errors": {
      "required": "이 항목은 필수입니다",
      "invalidEmail": "유효한 이메일 주소를 입력해주세요"
    }
  },
  "wallet": {
    "title": "내 지갑",
    "balance": "잔액",
    "addFunds": "입금",
    "withdraw": "출금",
    "transactions": "거래 내역"
  }
}
```

---

## 5. i18n Configuration

### `src/i18n/settings.ts`

```typescript
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
] as const;

export type Namespace = typeof namespaces[number];
```

### `src/i18n/index.ts`

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import { supportedLocales, defaultLocale, fallbackLocale, namespaces } from './settings';
import { initDayjsLocales } from './utils/date';

const isDev = import.meta.env.DEV;

i18n
  // Load translations from HTTP backend
  .use(HttpBackend)
  // Detect browser language
  .use(LanguageDetector)
  // Integrate with React
  .use(initReactI18next)

// Initialize i18next configuration
.init({
  // Supported languages
  supportedLngs: supportedLocales.map(l => l.code),

  // Default language (loaded from localStorage or browser)
  lng: defaultLocale,

  // Fallback language
  fallbackLng: fallbackLocale,

  // Default namespace
  defaultNS: 'common',

  // Supported namespaces
  ns: namespaces,

  // Debug mode in development
  debug: isDev,

  // Empty string as default value
  returnEmptyString: true,

  // Return null instead of key if translation not found
  returnNull: true,

  // Key separator (dot notation)
  keySeparator: '.',

  // Namespace separator
  nsSeparator: ':',

  // Interpolation settings
  interpolation: {
    escapeValue: false, // React already safes from XSS
    format: (value, format, lng) => {
      // Custom formatters can be added here
      if (format === 'uppercase') return String(value).toUpperCase();
      if (format === 'lowercase') return String(value).toLowerCase();
      return value;
    },
  },

  // Backend configuration
  backend: {
    // Path to translation files
    loadPath: '/locales/{{lng}}/{{ns}}.json',

    // Alternative path pattern (for different file structures)
    // loadPath: '/locales/{{lng}}/{{ns}}.json',

    // Request options
    requestOptions: {
      cache: 'no-store',
    },
  },

  // Language detector options
  detection: {
    // Order of detection strategies
    order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],

    // Keys to look for
    lookupLocalStorage: 'i18nextLng',
    lookupFromPathKey: 'lng',
    lookupFromSubdomainKey: 'lng',

    // Cache user language preference
    caches: ['localStorage'],
  },

  // React options
  react: {
    // Wait for translations to be loaded
    useSuspense: true,

    // Bind i18n to components
    bindI18n: 'languageChanged loaded',

    // Bind store
    bindStore: 'added removed',
  },

  // Missing key handler (optional)
  saveMissing: isDev, // Only in development
  missingKeyHandler: (lng, ns, key, fallbackValue) => {
    if (isDev) {
      console.warn(`[i18n] Missing translation: "${key}" (lng: ${lng}, ns: ${ns})`);
    }
  },
});

// Initialize dayjs locales after i18n is ready
initDayjsLocales(i18n);

export default i18n;

// Re-export types
export { default as useTranslation, UseTranslationResponse } from 'react-i18next';
export type { TFunction } from 'i18next';
```

---

## 6. Date/Time Localization

### `src/i18n/utils/date.ts`

```typescript
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import localeData from 'dayjs/plugin/localeData';
import calendar from 'dayjs/plugin/calendar';

// Import all supported locales
import 'dayjs/locale/en';
import 'dayjs/locale/sw';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';
import 'dayjs/locale/ar';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/hi';
import 'dayjs/locale/id';
import 'dayjs/locale/fr';

// Extend dayjs with plugins
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(localeData);

// Initialize dayjs locales
export const initDayjsLocales = (i18n: any): void => {
  // Locales are loaded via import statements above
  // dayjs automatically uses the locale from i18n.language
};

// Set dayjs locale explicitly
export const setDayjsLocale = (locale: string): void => {
  dayjs.locale(locale);
};

// Get dayjs locale
export const getDayjsLocale = (): string => {
  return dayjs.locale() || 'en';
};

// Format date with locale
export const formatDate = (
  date: dayjs.Dayjs | string | Date,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale?: string
): string => {
  const d = typeof date === 'string' ? dayjs(date) : date;
  const loc = locale || dayjs.locale();

  const formatMap: Record<string, string> = {
    short: 'L',
    medium: 'LL',
    long: 'LLL',
    full: 'LLLL',
  };

  return d.locale(loc).format(formatMap[format]);
};

// Format relative time
export const formatRelativeTime = (
  date: dayjs.Dayjs | string | Date,
  locale?: string
): string => {
  const d = typeof date === 'string' ? dayjs(date) : date;
  const loc = locale || dayjs.locale();
  return d.locale(loc).fromNow();
};

// Get weekday names
export const getWeekdayNames = (locale?: string, format: 'short' | 'long' = 'short'): string[] => {
  const loc = locale || dayjs.locale();
  const dayjsLocale = require(`dayjs/locale/${loc}`);
  dayjs.locale(dayjsLocale);

  if (format === 'short') {
    return dayjs.weekdaysShort();
  }
  return dayjs.weekdays();
};

// Get month names
export const getMonthNames = (locale?: string, format: 'short' | 'long' = 'short'): string[] => {
  const loc = locale || dayjs.locale();
  const dayjsLocale = require(`dayjs/locale/${loc}`);
  dayjs.locale(dayjsLocale);

  if (format === 'short') {
    return dayjs.monthsShort();
  }
  return dayjs.months();
};

// Format time ago with proper pluralization
export const formatTimeAgo = (date: dayjs.Dayjs | string | Date): string => {
  const d = typeof date === 'string' ? dayjs(date) : date;
  const now = dayjs();
  const diffInSeconds = now.diff(d, 'second');
  const diffInMinutes = now.diff(d, 'minute');
  const diffInHours = now.diff(d, 'hour');
  const diffInDays = now.diff(d, 'day');

  if (diffInSeconds < 60) {
    return 'justNow';
  } else if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
  } else {
    return formatDate(d, 'medium');
  }
};

export default dayjs;
```

---

## 7. Number/Currency Localization

### `src/i18n/utils/number.ts`

```typescript
// Format number with locale-specific separators
export const formatNumber = (
  value: number,
  locale?: string
): string => {
  return new Intl.NumberFormat(locale || getCurrentLocale()).format(value);
};

// Format currency with locale-specific symbol
export const formatCurrency = (
  value: number,
  currency: string = 'USD',
  locale?: string
): string => {
  return new Intl.NumberFormat(locale || getCurrentLocale(), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Format percentage
export const formatPercent = (
  value: number,
  locale?: string
): string => {
  return new Intl.NumberFormat(locale || getCurrentLocale(), {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

// Format compact (e.g., 1.2K, 3.5M)
export const formatCompact = (
  value: number,
  locale?: string
): string => {
  return new Intl.NumberFormat(locale || getCurrentLocale(), {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
};

// Get current locale (helper)
export const getCurrentLocale = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('i18nextLng') || 'en';
  }
  return 'en';
};

// Get currency symbol
export const getCurrencySymbol = (currency: string = 'USD'): string => {
  const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).formatToParts(0);

  const currencyPart = format.find(part => part.type === 'currency');
  return currencyPart?.value || currency;
};

// Format phone number with locale-specific formatting
export const formatPhoneNumber = (
  phone: string,
  locale?: string
): string => {
  // Basic implementation - can be extended with libphonenumber-js
  const cleaned = phone.replace(/\D/g, '');
  const loc = locale || getCurrentLocale();

  if (loc === 'en-US') {
    // US format: (XXX) XXX-XXXX
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
  } else if (loc === 'sw') {
    // Tanzania/Kenya format
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('255')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
  }

  return phone;
};
```

---

## 8. Language Context and Hooks

### `src/contexts/LanguageContext.tsx`

```typescript
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLocales, LocaleCode, isRTL, getDirection } from '../i18n/settings';

interface LanguageContextType {
  // Current language
  language: LocaleCode;
  setLanguage: (lang: LocaleCode) => void;

  // All supported languages
  supportedLanguages: typeof supportedLocales;

  // Direction
  isRTL: boolean;
  direction: 'ltr' | 'rtl';

  // Helpers
  getLanguageLabel: (code: LocaleCode) => string;
  getLanguageFlag: (code: LocaleCode) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<LocaleCode>(
    () => {
      const saved = localStorage.getItem('i18nextLng');
      if (saved && supportedLocales.some(l => l.code === saved)) {
        return saved as LocaleCode;
      }
      return 'en';
    }
  );

  // Update i18n when language changes
  const setLanguage = useCallback((lang: LocaleCode) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);

    // Update document direction for RTL languages
    document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [i18n]);

  // Initialize on mount
  useEffect(() => {
    const saved = localStorage.getItem('i18nextLng');
    if (saved && supportedLocales.some(l => l.code === saved)) {
      setLanguageState(saved as LocaleCode);
      i18n.changeLanguage(saved);
    }
  }, [i18n]);

  // Watch for i18n language changes (from detector)
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      if (supportedLocales.some(l => l.code === lng)) {
        setLanguageState(lng as LocaleCode);
        document.documentElement.dir = isRTL(lng as LocaleCode) ? 'rtl' : 'ltr';
        document.documentElement.lang = lng;
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    // Set initial direction
    document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
    document.documentElement.lang = language;

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n, language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    supportedLanguages: supportedLocales,
    isRTL: isRTL(language),
    direction: getDirection(language),
    getLanguageLabel: (code: LocaleCode) =>
      supportedLocales.find(l => l.code === code)?.name || code,
    getLanguageFlag: (code: LocaleCode) =>
      supportedLocales.find(l => l.code === code)?.flag || '🌐',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
```

### `src/hooks/useLanguage.ts`

```typescript
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { LocaleCode } from '../i18n/settings';

// Extended language hook with i18n features
export const useLanguage = () => {
  const context = useLanguage();
  const { t, i18n } = useTranslation();

  return {
    ...context,

    // i18n translation function
    t,

    // i18n instance
    i18n,

    // Check if translation exists
    hasTranslation: (key: string, ns?: string): boolean => {
      return i18n.exists(key, { ns });
    },

    // Get translation with interpolation
    translate: (key: string, options?: object): string => {
      return t(key, options);
    },

    // Get translation with count (pluralization)
    translatePlural: (
      keySingular: string,
      keyPlural: string,
      count: number
    ): string => {
      return count === 1 ? t(keySingular) : t(keyPlural, { count });
    },

    // Switch language
    switchLanguage: (lang: LocaleCode): void => {
      context.setLanguage(lang);
    },

    // Get current language code
    getCurrentLanguage: (): LocaleCode => {
      return context.language;
    },

    // Check if current language is RTL
    isCurrentLanguageRTL: (): boolean => {
      return context.isRTL;
    },
  };
};

export default useLanguage;
```

---

## 9. Language Selector Component

### `src/components/language/LanguageSelector.tsx`

```typescript
import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Fade,
} from '@mui/material';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LocaleCode } from '../../i18n/settings';

const LanguageSelector: React.FC = () => {
  const {
    language,
    setLanguage,
    supportedLanguages,
    getLanguageFlag,
  } = useLanguage();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectLanguage = (lang: LocaleCode) => {
    setLanguage(lang);
    handleClose();
  };

  const currentLanguage = supportedLanguages.find(l => l.code === language);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title="Select Language">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Globe size={20} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            minWidth: 200,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {supportedLanguages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleSelectLanguage(lang.code)}
            selected={language === lang.code}
            sx={{
              py: 1,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Typography variant="h6" sx={{ lineHeight: 1 }}>
                {lang.flag}
              </Typography>
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">{lang.nativeName}</Typography>
                  {language === lang.code && (
                    <Check size={16} color="primary" />
                  )}
                </Box>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {lang.name}
                </Typography>
              }
            />
          </MenuItem>
        ))}
      </Menu>

      {/* Current language display */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          gap: 0.5,
          ml: 1,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {currentLanguage?.flag}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {currentLanguage?.code.toUpperCase()}
        </Typography>
      </Box>
    </Box>
  );
};

export default LanguageSelector;
```

---

## 10. Localized Date Component

### `src/components/language/LocaleDate.tsx`

```typescript
import React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { useLanguage } from '../../contexts/LanguageContext';

interface LocaleDateProps {
  date: Dayjs | string | Date | null | undefined;
  format?: 'short' | 'medium' | 'long' | 'full';
  variant?: 'date' | 'time' | 'datetime';
  showRelative?: boolean;
  fallback?: string;
  className?: string;
}

const LocaleDate: React.FC<LocaleDateProps> = ({
  date,
  format = 'medium',
  variant = 'datetime',
  showRelative = false,
  fallback = '-',
  className,
}) => {
  const { language, t } = useLanguage();

  if (!date) {
    return <span className={className}>{fallback}</span>
  }

  const d = typeof date === 'string' ? dayjs(date) : date;

  if (showRelative) {
    return (
      <time dateTime={d.toISOString()} className={className} title={d.format('LLLL')}>
        {t(`dateTime.${d.fromNow().replace(/\s/g, '')`) || d.fromNow()}
      </time>
    );
  }

  let formattedDate: string;
  let formattedTime: string;

  // Format based on variant
  switch (variant) {
    case 'date':
      formattedDate = d.locale(language).format('LL');
      return (
        <time dateTime={d.toISOString()} className={className}>
          {formattedDate}
        </time>
      );

    case 'time':
      formattedTime = d.locale(language).format('LT');
      return (
        <time dateTime={d.toISOString()} className={className}>
          {formattedTime}
        </time>
      );

    case 'datetime':
    default:
      formattedDate = d.locale(language).format('LL');
      formattedTime = d.locale(language).format('LT');
      return (
        <time dateTime={d.toISOString()} className={className} title={d.format('LLLL')}>
          {formattedDate} {formattedTime}
        </time>
      );
  }
};

export default LocaleDate;
```

---

## 11. RTL Support

### Automatic RTL Handling

The RTL support is automatically handled through:

1. **Document Direction**: `document.documentElement.dir` is set based on language
2. **CSS RTL Plugin**: Tailwind CSS with RTL support
3. **MUI RTL Support**: Material-UI has built-in RTL support

### Tailwind RTL Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // RTL-safe spacing and positioning
    },
  },
  // Enable RTL support
  // Note: For RTL, you may need additional plugins or custom styles
  // Some approaches:
  // 1. Use logical properties (start/end instead of left/right)
  // 2. Use flexbox and grid which handle direction automatically
  // 3. Use CSS logical properties: marginInlineStart, paddingInlineEnd, etc.
}
```

### CSS Logical Properties

Use CSS logical properties instead of physical ones:

```css
/* Instead of: */
margin-left: 16px;
padding-right: 16px;
border-left: 1px solid #ccc;

/* Use: */
margin-inline-start: 16px;
padding-inline-end: 16px;
border-inline-start: 1px solid #ccc;
```

### RTL-safe Component Example

```typescript
// Using MUI's Box component with logical properties
import Box from '@mui/material/Box';

<Box
  sx={{
    // Automatically flips based on RTL/LTR
    ml: 2,        // margin-inline-start
    mr: 2,        // margin-inline-end
    pl: 2,        // padding-inline-start
    pr: 2,        // padding-inline-end
    borderLeft: 1, // border-inline-start
  }}
>
  Content
</Box>
```

---

## 11B. CJK (Chinese/Japanese/Korean) Language Support

### Font Configuration

CJK characters require specific font stacks to render properly:

```typescript
// src/theme/typography.ts
export const getFontStack = (locale: string): string => {
  const fontStacks: Record<string, string[]> = {
    'zh-CN': [
      '"PingFang SC"',
      '"Microsoft YaHei"',
      '"Noto Sans SC"',
      'San Francisco',
      'Helvetica',
      'Arial',
      'sans-serif',
    ],
    'zh-TW': [
      '"PingFang TC"',
      '"Microsoft JhengHei"',
      '"Noto Sans TC"',
      'San Francisco',
      'Helvetica',
      'Arial',
      'sans-serif',
    ],
    'ja': [
      '"Noto Sans JP"',
      '"Hiragino Kaku Gothic Pro"',
      '"游ゴシック"',
      '"Yu Gothic"',
      'Meiryo',
      'Helvetica',
      'Arial',
      'sans-serif',
    ],
    'ko': [
      '"Noto Sans KR"',
      '"Malgun Gothic"',
      '"Apple SD Gothic Neo"',
      'NanumGothic',
      'Helvetica',
      'Arial',
      'sans-serif',
    ],
    'hi': [
      '"Noto Sans"',
      '"Devanagari MT"',
      '"Mangal"',
      'Helvetica',
      'Arial',
      'sans-serif',
    ],
    default: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ],
  };

  return fontStacks[locale]?.join(', ') || fontStacks.default.join(', ');
};

// Apply in MUI theme
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: getFontStack(locale),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    // CJK fonts may need slightly different line heights
    body1: {
      lineHeight: 1.8,
    },
  },
});
```

### CJK-specific CSS Considerations

```css
/* src/index.css */

/* Improve CJK character spacing */
html[lang^="zh"],
html[lang^="ja"],
html[lang^="ko"] {
  line-height: 1.8;
  letter-spacing: 0.02em;
}

/* Prevent font-size dropdown for CJK text */
html[lang^="zh"] body,
html[lang^="ja"] body,
html[lang^="ko"] body {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Ensure CJK text doesn't overflow */
.cjk-text {
  word-break: break-word;
  overflow-wrap: break-word;
}

/* Name fields may need specific handling */
.name-field-cjk {
  ime-mode: active;
}
```

### Input Method Editor (IME) Support

```typescript
// Handle IME composition for search inputs
const SearchInput: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Don't trigger search while IME is composing
    if (!isComposing) {
      setQuery(e.target.value);
      // Debounced search call
      debouncedSearch(e.target.value);
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    setQuery(e.currentTarget.value);
    debouncedSearch(e.currentTarget.value);
  };

  return (
    <TextField
      value={query}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      placeholder={t('common.actions.search')}
    />
  );
};
```

### Asian Phone Number Formatting

```typescript
// src/i18n/utils/phone.ts

interface PhoneFormatConfig {
  locale: string;
  format: ' domestic' | 'international';
}

export const formatPhoneNumber = (
  phone: string,
  config: PhoneFormatConfig
): string => {
  const cleaned = phone.replace(/\D/g, '');
  const { locale, format } = config;

  const formats: Record<string, (phone: string) => string> = {
    'zh-CN': (p) => {
      if (p.length === 11 && p.startsWith('1')) {
        // Mobile: 138-1234-5678
        return `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}`;
      }
      // Landline with area code
      return p;
    },
    'zh-TW': (p) => {
      if (p.length === 10) {
        // 0912-345-678
        return `${p.slice(0, 4)}-${p.slice(4, 7)}-${p.slice(7)}`;
      }
      return p;
    },
    'ja': (p) => {
      if (p.length === 11) {
        // 090-1234-5678
        return `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}`;
      }
      return p;
    },
    'ko': (p) => {
      if (p.length === 11) {
        // 010-1234-5678
        return `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}`;
      }
      return p;
    },
    'hi': (p) => {
      // Indian format: +91 98765 43210
      if (p.length === 10) {
        return `${p.slice(0, 5)} ${p.slice(5)}`;
      }
      return p;
    },
    'id': (p) => {
      // Indonesian format: +62 812-3456-7890
      if (p.length >= 9 && p.startsWith('08')) {
        return `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}`;
      }
      return p;
    },
  };

  const formatter = formats[locale] || ((p) => p);
  return format === 'international' ? `+${cleaned}` : formatter(cleaned);
};
```

### Name Formatting for CJK Cultures

```typescript
// Handle CJK name order (Family Name First)
export const formatName = (
  familyName: string,
  givenName: string,
  locale: string,
  order: 'western' | 'asian' = 'asian'
): string => {
  const cjkLocales = ['zh-CN', 'zh-TW', 'ja', 'ko'];
  
  if (cjkLocales.includes(locale) || order === 'asian') {
    return `${familyName}${givenName}`;
  }
  
  return `${givenName} ${familyName}`;
};

// Parse name input for CJK (often entered as full name)
export const parseCJKName = (fullName: string): { familyName: string; givenName: string } => {
  // For Chinese/Japanese/Korean, family name is typically 1-2 characters
  // This is a simplified heuristic
  if (fullName.length <= 2) {
    return { familyName: fullName.slice(0, 1), givenName: fullName.slice(1) };
  }
  
  // Check if first 2 chars form a common family name
  const possibleFamilyName = fullName.slice(0, 2);
  const commonFamilyNames = ['欧阳', '司马', '诸葛', '上官', '夏侯'];
  
  if (commonFamilyNames.includes(possibleFamilyName)) {
    return { familyName: possibleFamilyName, givenName: fullName.slice(2) };
  }
  
  return { familyName: fullName.slice(0, 1), givenName: fullName.slice(1) };
};
```

### Date Formatting for Different Calendars

```typescript
// src/i18n/utils/date.ts
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/hi';
import 'dayjs/plugin/localizedFormat';
import 'dayjs/plugin/calendar';

dayjs.extend(localizedFormat);
dayjs.extend(calendar);

export const formatDateLocalized = (
  date: dayjs.Dayjs | string,
  locale: string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string => {
  const d = dayjs(date);
  
  // Set locale
  const localeMap: Record<string, string> = {
    'zh-CN': 'zh-cn',
    'zh-TW': 'zh-tw',
    'ja': 'ja',
    'ko': 'ko',
    'hi': 'hi',
  };
  
  d.locale(localeMap[locale] || locale);
  
  // Use calendar format for CJK languages (今天, 明天, etc.)
  const cjkLocales = ['zh-CN', 'zh-TW', 'ja', 'ko'];
  if (cjkLocales.includes(locale)) {
    return d.calendar(dayjs(), {
      sameDay: '[今天] MMMM D日',
      nextDay: '[明天] MMMM D日',
      nextWeek: 'dddd MMMM D日',
      lastDay: '[昨天] MMMM D日',
      lastWeek: '[上周] dddd MMMM D日',
      sameElse: 'YYYY年M月D日',
    });
  }
  
  // Default formatting
  const formatMap = {
    short: 'L',
    medium: 'LL',
    long: 'LLL',
  };
  
  return d.format(formatMap[format]);
};
```

### Currency Formatting for Asian Markets

```typescript
// src/i18n/utils/currency.ts

export const formatCurrency = (
  amount: number,
  currency: string,
  locale: string
): string => {
  const localeMap: Record<string, string> = {
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'hi': 'hi-IN',
    'id': 'id-ID',
  };
  
  return new Intl.NumberFormat(localeMap[locale] || locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: locale === 'ja-JP' ? 0 : 2, // Japanese typically doesn't show decimals for JPY
    maximumFractionDigits: 2,
  }).format(amount);
};

// Example: Japanese Yen typically shows no decimals
export const formatJPY = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    currencyDisplay: 'symbol',
  }).format(Math.round(amount));
};

// Example: Chinese Yuan with proper formatting
export const formatCNY = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    currencyDisplay: 'symbol',
  }).format(amount);
};
```

---

## 12. Backend API Integration

### Database Schema Updates

Add language preferences to user table:

```prisma
// prisma/schema.prisma
model User {
  id                String   @id @default(uuid())
  email             String   @unique
  preferredLocale   String   @default("en")  // RFC 5646 language tag
  timezone          String   @default("UTC") // IANA timezone
  currency          String   @default("USD") // ISO 4217 currency code
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### API Endpoints

#### GET /api/v1/users/me/preferences
Get user's language preferences

```json
{
  "preferredLocale": "sw",
  "timezone": "Africa/Kampala",
  "currency": "UGX"
}
```

#### PUT /api/v1/users/me/preferences
Update user's language preferences

```json
{
  "preferredLocale": "fr",
  "timezone": "Europe/Paris",
  "currency": "EUR"
}
```

### Frontend API Integration

```typescript
// src/api/preferences.ts
import axios from 'axios';
import { LocaleCode } from '../i18n/settings';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export interface UserPreferences {
  preferredLocale: string;
  timezone: string;
  currency: string;
}

export const getUserPreferences = async (): Promise<UserPreferences> => {
  const response = await api.get('/users/me/preferences');
  return response.data;
};

export const updateUserPreferences = async (
  preferences: Partial<UserPreferences>
): Promise<UserPreferences> => {
  const response = await api.put('/users/me/preferences', preferences);
  return response.data;
};

// Sync with i18n
export const syncLanguagePreference = async (
  locale: LocaleCode
): Promise<void> => {
  await api.put('/users/me/preferences', { preferredLocale: locale });
};
```

---

## 13. Translation Workflow

### Adding New Translations

1. **Add keys to all locale files**:
   ```bash
   # Use a translation management tool or manually
   # Add new keys to en.json first, then translate to other languages
   ```

2. **Use interpolation for dynamic content**:
   ```json
   {
     "welcome": "Welcome, {{name}}!",
     "itemsCount": "You have {{count}} item(s)",
     "balance": "Your balance is {{amount, currency}}"
   }
   ```

3. **Use pluralization**:
   ```json
   {
     "notification_one": "{{count}} new notification",
     "notification_other": "{{count}} new notifications"
   }
   ```

### Translation Management Tools

Consider using these tools for professional translation workflows:

| Tool | Description |
|------|-------------|
| **Crowdin** | Cloud-based translation management |
| **Lokalise** | Continuous localization platform |
| **Phrase (formerly PhraseApp)** | Localization and translation management |
| **Weblate** | Self-hosted translation platform |

### CI/CD Integration

```yaml
# .github/workflows/translations.yml
name: Translation Checks

on:
  push:
    paths:
      - 'src/locales/**/*.json'

jobs:
  validate-translations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check for missing translations
        run: |
          # Script to compare translation files
          # and report missing keys
          npx i18next-check --files src/locales/*.json
```

---

## 14. Performance Optimization

### Lazy Loading Translations

Translations are loaded on-demand using `i18next-http-backend`:

```typescript
// Preload specific namespace when needed
const loadWalletTranslations = async () => {
  await i18n.loadNamespaces(['wallet']);
};

// Or preload in background
i18n.preloadAllNamespaces();
```

### Code Splitting by Language

```typescript
// Configure webpack/Vite to split translation chunks
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ['dayjs/locale/en', 'dayjs/locale/sw', 'dayjs/locale/fr', 'dayjs/locale/ar'],
  },
});
```

### Translation Caching

- Translation files are cached by the browser
- Use `localStorage` for language preference persistence
- CDN caching for translation files in production

---

## 15. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Install i18n dependencies
- [ ] Create project structure (`src/i18n/`, `src/locales/`)
- [ ] Configure i18n with English as default
- [ ] Create English translation file
- [ ] Wrap app with LanguageProvider
- [ ] Create LanguageSelector component

### Phase 2: RTL and Additional Languages (Week 2)
- [ ] Add Swahili translations
- [ ] Add French translations
- [ ] Add Arabic translations (RTL)
- [ ] Test RTL layouts
- [ ] Add date/time localization
- [ ] Add number/currency formatting

### Phase 3: Integration (Week 3)
- [ ] Update backend with language preferences
- [ ] Create API integration
- [ ] Sync user preferences on login
- [ ] Add translation loading states
- [ ] Implement fallback UI for missing translations

### Phase 4: Optimization (Week 4)
- [ ] Lazy load translations
- [ ] Add translation validation
- [ ] Set up CI/CD checks
- [ ] Performance testing
- [ ] Documentation

---

## 16. Testing Strategy

### Unit Tests

```typescript
// __tests__/i18n.test.ts
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import LoginPage from '../pages/LoginPage';

describe('Login Page i18n', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  it('displays login title in English', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LoginPage />
      </I18nextProvider>
    );
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('displays login title in Swahili', () => {
    i18n.changeLanguage('sw');
    render(
      <I18nextProvider i18n={i18n}>
        <LoginPage />
      </I18nextProvider>
    );
    expect(screen.getByText('Ingia')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
// cypress/e2e/localization.cy.ts
describe('Language Switching', () => {
  it('should switch language to Swahili', () => {
    cy.visit('/settings');
    cy.get('[data-testid="language-selector"]').click();
    cy.contains('Kiswahili').click();
    cy.contains('Poo zangu').should('be.visible');
  });

  it('should display RTL layout for Arabic', () => {
    cy.visit('/settings');
    cy.get('[data-testid="language-selector"]').click();
    cy.contains('العربية').click();
    cy.get('html').should('have.attr', 'dir', 'rtl');
  });
});
```

---

## 17. Browser Support

### Supported Browsers

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14.1+ |
| Edge | 90+ |
| iOS Safari | 14.5+ |
| Chrome for Android | 90+ |

### Feature Detection

The `i18next-browser-languagedetector` handles feature detection automatically. For older browsers, consider adding polyfills:

```bash
npm install core-js
```

```typescript
// src/main.tsx
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

---

## 18. Security Considerations

### XSS Prevention

- **Never** use `dangerouslySetInnerHTML` with translated content
- i18next escapes content by default
- Use `{{variable}}` interpolation safely

### Content Security Policy

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  connect-src 'self' https://your-cdn.com;
  img-src 'self' data: https:;
  style-src 'self' 'unsafe-inline';
```

---

## 19. Monitoring and Analytics

### Track Language Usage

```typescript
// Send language preference to analytics
import { trackEvent } from '../utils/analytics';

const handleLanguageChange = (lang: string) => {
  trackEvent('language_changed', {
    language: lang,
    previous_language: currentLang,
  });
};
```

### Translation Coverage Monitoring

```bash
# Generate translation coverage report
npx i18next-coverage -o ./reports/coverage.json
```

---

## 20. Future Enhancements

### Planned Features
- [ ] Context-aware translations (formal/informal)
- [ ] Region-specific variations (en-US, en-GB, fr-CA)
- [ ] Translation memory integration
- [ ] In-context translation editing
- [ ] A/B testing for translations
- [ ] Accessibility improvements for screen readers
- [ ] Voice-over support for different languages

---

## 21. Troubleshooting

### Common Issues

#### Translation key not found
```bash
# Enable debug mode
# In i18n configuration:
debug: true,

# Check console for warnings
```

#### RTL layout not working
```css
/* Ensure document direction is set */
html[dir="rtl"] {
  /* RTL-specific styles */
}

/* Use logical properties */
.element {
  margin-inline-start: 16px;
}
```

#### Language not persisting
```typescript
// Check localStorage
localStorage.getItem('i18nextLng');

// Check detection order
i18n.services.languageDetector.order;
```

---

## 22. Resources

### Documentation
- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [Day.js Localization](https://day.js.org/docs/en/locale/locale)
- [BCP 47 Language Tags](https://www.rfc-editor.org/rfc/bcp/bcp47.html)

### Tools
- [Unicode CLDR](https://cldr.unicode.org/) - Language data
- [IANA Language Subtag Registry](https://www.iana.org/assignments/language-subtag-registry)
- [RFC 5646](https://www.rfc-editor.org/rfc/rfc5646) - Language Tags

---

## 23. Summary

This i18n implementation plan provides a comprehensive approach to localizing the EVzone "My Accounts" platform. The key components are:

1. **i18next-based architecture** with React bindings
2. **Multiple language support** with Swahili, French, and Arabic
3. **RTL support** for Arabic
4. **Locale-specific formatting** for dates, numbers, and currency
5. **User preference persistence** via backend
6. **Scalable translation management** with namespace organization
7. **Performance optimization** through lazy loading
8. **Complete testing strategy** for quality assurance

The implementation is designed to be gradual and can be extended with additional languages and features as needed.
