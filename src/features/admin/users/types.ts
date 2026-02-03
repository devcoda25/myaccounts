// User-related types for the admin users module

export type ThemeMode = "light" | "dark";

export type AccountType = "User" | "Provider" | "Agent" | "Org Admin";

export type UserStatus = "Active" | "Locked" | "Disabled";

export type Risk = "Low" | "Medium" | "High";

export type UserRow = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    type: AccountType;
    status: UserStatus;
    currency: string;
    lastLoginAt?: number;
    risk: Risk;
    mfaEnabled: boolean;
    passkeys: number;
};

export type ReAuthMode = "password" | "mfa";

export type MfaChannel = "Authenticator" | "SMS" | "WhatsApp" | "Email";

export type ActionKind = "LOCK" | "UNLOCK" | "RESET_PASSWORD" | "RESET_MFA" | "FORCE_SIGNOUT" | "DELETE_USER";

export type PendingAction = {
    kind: ActionKind;
    userId: string;
};

// Filter types
export type FilterOption<T> = T | "All";
