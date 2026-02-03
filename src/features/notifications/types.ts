// Types for notifications module

export type Severity = "info" | "warning" | "error" | "success";

export type Digest = "Instant" | "Daily" | "Weekly";

export type Channels = {
    email: boolean;
    sms: boolean;
    push: boolean; // push later
};

export type NotifPrefs = {
    security: Channels;
    product: Channels;
    marketing: Channels;
    productDigest: Digest;
    marketingDigest: Digest;
    quietHoursEnabled: boolean;
    quietStart: string; // HH:MM
    quietEnd: string; // HH:MM
};

export const RECOMMENDED: NotifPrefs = {
    security: { email: true, sms: true, push: false },
    product: { email: true, sms: false, push: false },
    marketing: { email: false, sms: false, push: false },
    productDigest: "Instant",
    marketingDigest: "Weekly",
    quietHoursEnabled: false,
    quietStart: "22:00",
    quietEnd: "06:00",
};

// Channel count helper
export function countEnabled(c: Channels): number {
    return (c.email ? 1 : 0) + (c.sms ? 1 : 0) + (c.push ? 1 : 0);
}

// Page background based on theme mode
export function getPageBg(mode: string): string {
    if (mode === "dark") {
        return "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)";
    }
    return "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";
}
