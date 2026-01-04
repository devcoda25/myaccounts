import { Prefs, VerifyChannel } from "../../../../utils/types";

export function maskEmail(e: string) {
    const i = e.indexOf('@');
    if (i < 2) return e;
    return e[0] + '***' + e.slice(i);
}

export function maskPhone(p: string) {
    if (p.length < 5) return p;
    return p.slice(0, 3) + '****' + p.slice(-2);
}

export function isEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function isPhone(p: string) {
    return /^\+?[0-9\s-]{8,}$/.test(p);
}

export function purposeLabel(key: keyof Prefs) {
    const map: Record<string, string> = {
        security_email: "Security Email",
        security_sms: "Security SMS",
        security_whatsapp: "Security WhatsApp",
        reset_email: "Password Reset Email",
        reset_sms: "Password Reset SMS",
        reset_whatsapp: "Password Reset WhatsApp",
        receipts_email: "Receipts Email",
        mfa_sms: "MFA SMS",
        mfa_whatsapp: "MFA WhatsApp",
    };
    return map[key as string] || key;
}
