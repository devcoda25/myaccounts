// Common Types
export type ThemeMode = "light" | "dark";

export type KycTier = "Unverified" | "Basic" | "Full" | "Pending";

export interface ICredential {
    id: string;
    providerType: string;
    providerId: string;
    createdAt: string;
}

export interface IUser {
    id: string;
    email: string;
    firstName?: string;
    otherNames?: string;
    avatarUrl?: string;
    role: string;
    phoneNumber?: string;
    phoneVerified?: boolean;
    createdAt: string | number;
    emailVerified?: boolean;
    preferences?: Partial<Prefs>;
    contacts?: IContact[];
    credentials?: ICredential[];
    country?: string;
    dob?: string | Date | number;
    twoFactorEnabled?: boolean;
    orgMemberships?: Array<{
        id: string;
        role: string;
        organization: {
            id: string;
            name: string;
            icon?: string;
        }
    }>;
}

export type Severity = "info" | "warning" | "error" | "success";

// Auth Types
export type IdType = "email" | "phone" | "unknown";
export type Delivery = "email_link" | "sms_code" | "whatsapp_code";
export type Step = "request" | "sent" | "verify" | "success" | "confirm" | "set" | "prompt" | "entry"; // Combined steps from different auth flows

export type ReAuthMode = "password" | "mfa";
export type MfaChannel = "Authenticator" | "SMS" | "WhatsApp" | "Email";

// Org Types
export type OrgRole = "Owner" | "Admin" | "Manager" | "Member" | "Viewer" | "Support";
export type AuthState = "not_logged_in" | "logged_in_same_user" | "logged_in_different_user";

// Admin Types
export type AdminRole = "SuperAdmin" | "Admin" | "SUPER_ADMIN" | "ADMIN";
export interface AdminUser {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    otherNames?: string;
    role: AdminRole;
    avatar?: string;
    twoFactorEnabled?: boolean;
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
export interface IWallet {
    id: string;
    balance: number | string; // Decimal from Prisma comes as string or number
    currency: string;
}

export type TxType = "Top up" | "Payment" | "Withdrawal" | "Refund" | "Fee";
export type TxStatus = "completed" | "pending" | "failed";

export interface ITransaction {
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
export interface IOrganization {
    id: string;
    name: string;
    role: OrgRole;
    membersCount?: number;
    country?: string;
    joinedAt: string;
    ssoEnabled?: boolean;
    walletEnabled?: boolean;
    walletBalance?: number;
    currency?: string;
    logo?: string;
    address?: IOrgAddress;
    defaultRolePolicy?: IOrgSettingsDefaultRolePolicy;
}

// Audit Types
export interface IAuditDetails {
    target?: string;
    status?: string | number;
    ip?: string;
    route?: string;
    method?: string;
    userAgent?: string;
    [key: string]: string | number | boolean | null | undefined; // Allowed for arbitrary metadata, but use strict keys where possible
}

export interface IAuditLog {
    id: string;
    action: string;
    details: IAuditDetails;
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

export interface IContact {
    id: string;
    type: "EMAIL" | "PHONE" | "email" | "phone";
    label: string | ContactLabel;
    value: string;
    verified: boolean;
    capabilities?: {
        login?: boolean;
        sms?: boolean;
        whatsapp?: boolean;
    };
    createdAt: string | number;
    lastUsedAt?: string | number;
}

export interface IUserContact extends IContact {
    isPrimary: boolean;
}

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
    notifications?: any;
}

export interface BackendUser {
    id: string;
    firstName?: string;
    otherNames?: string;
    email: string;
    phoneNumber?: string;
    contacts?: Array<{ type: string; isPrimary: boolean; value: string }>;
    country?: string;
    role: "SUPER_ADMIN" | "ADMIN" | "USER";
    emailVerified: boolean;
    phoneVerified: boolean;
    kyc?: {
        status: string; // PENDING, APPROVED, REJECTED
        level: number;
        riskScore?: string;
    };
    walletBalance?: number;
    twoFactorEnabled: boolean;
    createdAt: string | number;
    sessions?: Array<{ createdAt: string }>;
    auditLogs?: Array<{ action: string; createdAt: string }>;
    credentials?: Array<{ providerType: string }>;
    memberships?: Array<{ organization: { id: string; name: string }; role: string }>;
}

// Strict Interfaces (I-prefixed)

export interface IApiResponse<T> {
    data: T;
    message?: string;
    status: number;
}

export interface IPaginatedResponse<T> {
    items: T[];
    total: number;
    skip: number;
    take: number;
}

// Wallet Strict Types
export interface IBillingAddress {
    line1: string;
    line2?: string;
    city: string;
    region?: string;
    postal?: string;
    country: string;
}

export interface IPaymentMethodDetails {
    masked?: string;
    maskedCard?: string;
    label?: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
    holderName?: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    phoneNumber?: string;
    phone?: string;
    cardholder?: string;
    providerId?: string;
    billing?: IBillingAddress;
    [key: string]: string | number | boolean | null | undefined | IBillingAddress;
}

export interface IPaymentMethod {
    id: string;
    type: "card" | "momo" | "bank";
    provider: string;
    details: IPaymentMethodDetails;
    isDefault: boolean;
    createdAt: number;
    label?: string; // UI computed
    masked?: string; // UI computed
    verified?: boolean; // UI computed
}



// Organization Strict Types
export interface IOrgAddress {
    line1?: string;
    line2?: string;
    city?: string;
    region?: string;
    postal?: string;
}

export interface IOrgSettingsDefaultRolePolicy {
    defaultInviteRole?: OrgRole;
    requireAdminApproval?: boolean;
    domainAutoRoleEnabled?: boolean;
    domain?: string;
    domainRole?: OrgRole;
}

export interface IOrgSettingsPayload {
    name: string;
    country: string;
    logo?: string;
    defaultRolePolicy?: IOrgSettingsDefaultRolePolicy;
    address?: IOrgAddress;
}


export interface IOrgSsoConfig {
    entityId?: string;
    ssoUrl?: string;
    cert?: string;
    issuer?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    clientId?: string;
    clientSecret?: string;
    redirectUris?: string[];
    scopes?: string[];
    usePkce?: boolean;
}

export interface IOrgDomain {
    id: string;
    domain: string;
    token: string;
    recordName: string;
    recordValue: string;
    status: "Not started" | "Pending" | "Verified" | "Failed";
    lastCheckedAt?: number;
    requireSso?: boolean;
    allowPasswordFallback?: boolean;
    defaultRole?: string;
}

// Security Strict Types
export interface ISecurityActivityLogDetails {
    device?: string;
    location?: string | { city?: string; country?: string };
    userAgent?: string;
    os?: string;
    browser?: string;
}

export interface ISecurityActivityLog {
    id: string;
    action: string;
    timestamp: string | number; // Updated to match usage
    ip?: string;
    createdAt?: string | number;
    details?: ISecurityActivityLogDetails;
    risk?: string[];
    // Mapped properties
    method?: string;
    device?: string;
    location?: string;
}

// Alias for AdminProfile
export type ILoginEvent = ISecurityActivityLog;

export interface IPasskeyTransport {
    transports: string[];
}

// Admin Strict Types
export interface IAdminTransaction {
    id: string;
    amount: number;
    currency: string;
    status: string;
    type: string;
    reference: string;
    user: {
        email: string;
    };
    createdAt: string;
}

export interface ISecurityPasskey {
    id: string;
    userAgent?: string; // or name
    createdAt: string | number;
    lastUsedAt?: string | number;
    transports?: string[];
}

export interface IDeveloperAuditLog {
    id: string;
    action: string;
    actorName?: string;
    ipAddress: string;
    createdAt: string | number;
    details?: {
        target?: string;
        status?: string;
        [key: string]: string | number | boolean | null | undefined;
    };
}

// Dispute Strict Types
export type IDisputeStatus = "Open" | "Under review" | "Awaiting evidence" | "Won" | "Lost" | "Closed";
export type IDisputeReason =
    | "Unauthorized transaction"
    | "Service not received"
    | "Duplicate charge"
    | "Incorrect amount"
    | "Refund not received"
    | "Other";

export interface IEvidence {
    id: string;
    name: string;
    size: number;
    type: string;
}

export interface IDispute {
    id: string;
    txnId: string;
    reference: string;
    amount: number;
    currency: string;
    reason: IDisputeReason;
    description: string;
    status: IDisputeStatus;
    createdAt: number;
    updatedAt: number;
    evidence: IEvidence[];
}

// Session Strict Types
export type IRiskTag = "new_location" | "old_device" | "suspicious";

export interface ISession {
    id: string;
    isCurrent: boolean;
    deviceLabel: string;
    os: string;
    browser: string;
    location: string;
    ip: string;
    lastActiveAt?: number;
    createdAt: number;
    trust: "trusted" | "untrusted";
    risk: IRiskTag[];
    deviceInfo?: {
        device?: string;
        os?: string;
        browser?: string;
        userAgent?: string;
        location?: string | { city?: string; country?: string };
        ip?: string;
    };
    lastUsedAt: string | number; // Ensure strict type matching
}

export interface IRecoveryCodesResponse {
    codes: string[];
}

// Window Extension for Testing/Global state
export interface IEvzoneWindow extends Window {
    __EVZONE_DISPUTES_TESTS_RAN__?: boolean;
    __EVZONE_PAYMENT_METHODS_TESTS_RAN__?: boolean;
    __EVZONE_WALLET_TESTS_RAN__?: boolean;
    __EVZONE_KYC_TESTS_RAN__?: boolean;
}
