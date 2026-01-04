// Common Types
export type ThemeMode = "light" | "dark";

export interface User {
    id: string;
    email: string;
    firstName?: string;
    otherNames?: string;
    avatarUrl?: string;
    role: string;
}

export type Severity = "info" | "warning" | "error" | "success";

// Auth Types
export type IdType = "email" | "phone" | "unknown";
export type Delivery = "email_link" | "sms_code" | "whatsapp_code";
export type Step = "request" | "sent" | "verify" | "success" | "confirm" | "set" | "prompt" | "entry"; // Combined steps from different auth flows

// Org Types
export type OrgRole = "Owner" | "Admin" | "Manager" | "Member" | "Viewer";
export type AuthState = "not_logged_in" | "logged_in_same_user" | "logged_in_different_user";

// Admin Types
export type AdminRole = "SuperAdmin" | "Admin";
export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
    avatar?: string;
}

// Status Types
export type Health = "Operational" | "Degraded" | "Maintenance";
export type Service = {
    key: "auth" | "wallet" | "notifications" | "integrations";
    name: string;
    desc: string;
    health: Health;
    lastUpdatedAt: number;
};

// Wallet Types
export interface Wallet {
    id: string;
    balance: number | string; // Decimal from Prisma comes as string or number
    currency: string;
}

export type TxType = "Top up" | "Payment" | "Withdrawal" | "Refund" | "Fee";
export type TxStatus = "completed" | "pending" | "failed";

export interface Transaction {
    id: string;
    amount: number | string;
    currency: string;
    type: TxType;
    status: TxStatus;
    referenceId?: string;
    providerRef?: string;
    channel?: string;
    counterparty?: string;
    description?: string; // Mapped from 'note' or 'description'
    createdAt: string; // ISO date
}

// Organization Types
export interface Organization {
    id: string;
    name: string;
    role: OrgRole;
    membersCount: number;
    country: string;
    joinedAt: string;
    ssoEnabled?: boolean;
    walletEnabled?: boolean;
}

// Audit Types
export interface AuditLog {
    id: string;
    action: string;
    details: any;
    user?: { email: string };
    createdAt: string;
    // UI specific (optional or mapped from details)
    method?: string;
    ip?: string;
    route?: string;
    status?: number;
}

// Profile Types
export type ContactLabel = "Personal" | "Work" | "Other";
export type ChangeType = "email" | "phone";
export type VerifyChannel = "Email" | "SMS" | "WhatsApp";

export interface EmailContact {
    id: string;
    label: ContactLabel;
    email: string;
    verified: boolean;
    loginEnabled: boolean;
    createdAt: number;
    lastUsedAt?: number;
}

export interface PhoneContact {
    id: string;
    label: ContactLabel;
    phone: string;
    verified: boolean;
    loginEnabled: boolean;
    smsCapable: boolean;
    whatsappCapable: boolean;
    createdAt: number;
    lastUsedAt?: number;
}

export interface Prefs {
    security_email: string | null;
    security_sms: string | null;
    security_whatsapp: string | null;
    reset_email: string | null;
    reset_sms: string | null;
    reset_whatsapp: string | null;
    receipts_email: string | null;
    mfa_sms: string | null;
    mfa_whatsapp: string | null;
}
