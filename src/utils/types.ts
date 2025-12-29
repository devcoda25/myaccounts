// Common Types
export type ThemeMode = "light" | "dark";
export type Severity = "info" | "warning" | "error" | "success";

// Auth Types
export type IdType = "email" | "phone" | "unknown";
export type Delivery = "email_link" | "sms_code" | "whatsapp_code";
export type Step = "request" | "sent" | "verify" | "success" | "confirm" | "set" | "prompt" | "entry"; // Combined steps from different auth flows

// Org Types
export type OrgRole = "Owner" | "Admin" | "Manager" | "Member" | "Viewer";
export type AuthState = "not_logged_in" | "logged_in_same_user" | "logged_in_different_user";

// Status Types
export type Health = "Operational" | "Degraded" | "Maintenance";
export type Service = {
    key: "auth" | "wallet" | "notifications" | "integrations";
    name: string;
    desc: string;
    health: Health;
    lastUpdatedAt: number;
};
