/// <reference types="react" />

declare module 'i18next' {
  export interface i18n {
    use: (module: any) => this;
    init: (options: any) => Promise<this>;
    changeLanguage: (lng: string) => Promise<this>;
    t: (key: string, options?: any) => string;
    language: string;
    languages: string[];
    options: any;
  }

  const i18n: i18n;
  export default i18n;
}

declare module 'react-i18next' {
  export function initReactI18next(rootInstance: any): { type: '3rdParty' };
  
  export function useTranslation(ns?: string | string[], options?: any): {
    t: (key: string, options?: any) => string;
    i18n: any;
    ready: boolean;
  };

  export function withTranslation(ns?: string | string[]): <P>(Component: React.ComponentType<P>) => React.ComponentType<P>;
}
