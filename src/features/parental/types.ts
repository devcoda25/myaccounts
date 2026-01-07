export type ThemeMode = "light" | "dark";
export type HouseholdRole = "Guardian" | "Co-guardian" | "Emergency contact";
export type HouseholdStatus = "Active" | "Pending";
export type ApprovalMode = "Any guardian" | "Both guardians";
export type AppKey =
    | "EVzone School"
    | "EduMart"
    | "EVzone Marketplace"
    | "EVzone Charging"
    | "ServiceMart"
    | "ShopNow"
    | "Properties"
    | "Fashion"
    | "Art";
export type Channel = "Email" | "SMS" | "WhatsApp";
export type SchedulePreset = "School days" | "Weekend" | "Always allowed" | "Custom";
export type ChildStatus = "Active" | "Paused";
export type AgeTemplate = "Child (6-12)" | "Teen (13-17)" | "Young adult (18+)" | "Custom";

export type ApprovalKind = "Purchase" | "Ride" | "Trip" | "Service Booking";

export type ActivityKind =
    | "Login"
    | "Purchase"
    | "Blocked"
    | "Approval Requested"
    | "Approval Approved"
    | "Approval Declined"
    | "Limit Updated"
    | "App Access Updated"
    | "Schedule Updated"
    | "Safety Updated"
    | "Template Applied"
    | "Charging Updated"
    | "Household Updated";

export type Severity = "success" | "info" | "warning" | "error";

export interface Place {
    label: "Home" | "School";
    address: string;
    radiusKm: number;
}

export interface GeoFences {
    enabled: boolean;
    alertsOnEnterLeave: boolean;
    home: Place | null;
    school: Place | null;
}

export interface Curfew {
    enabled: boolean;
    start: string;
    end: string;
    hardLock: boolean;
    allowSchoolOnlyDuringCurfew: boolean;
}

export interface ChargingControls {
    enabled: boolean;
    dailyKwhCap: number;
    sessionKwhCap: number;
    requireApprovalAboveKwh: number;
    allowedStations: string[];
}

export interface ChildProfile {
    id: string;
    name: string;
    dob: string; // YYYY-MM-DD
    school?: string;
    grade?: string;
    country: string;
    status: ChildStatus;
    guardianVerified: boolean;
    consentVersion: string;
    consentAt?: number;
    template: AgeTemplate;

    // Roles
    guardianRelationship: "Parent" | "Guardian";

    // Wallet
    currency: string;
    dailyLimit: number;
    weeklyLimit: number;
    requireApprovalAbove: number; // Amount
    requireApprovalForAllPurchases: boolean;
    allowWithdrawals: boolean;
    allowPeerTransfers: boolean;
    allowSavedCards: boolean;
    categoryBlocks: string[];
    sellerWhitelist: string[];

    // Communication
    allowTeacherMentorChat: boolean;
    allowAttachments: boolean;
    allowVoiceCalls: boolean;
    allowUnknownContacts: boolean;

    // Notifications
    guardianChannels: Record<Channel, boolean>;

    // Screen time
    preset: SchedulePreset;
    bedtimeLock: boolean;
    dailyWindow: { start: string; end: string };
    curfew: Curfew;
    geofences: GeoFences;
    apps: Record<AppKey, boolean>;
    charging: ChargingControls;

    // Privacy
    locationSharing: boolean;
    publicProfile: boolean;
    marketingOptOut: boolean;
}

export interface PendingApproval {
    id: string;
    childId: string;
    title: string;
    amount: number;
    currency: string;
    app: string;
    vendor?: string;
    kind: ApprovalKind;
    reason: string;
    details?: string;
    status: "Pending" | "Approved" | "Declined";
    at: number;
}

export interface ActivityEvent {
    id: string;
    childId: string;
    kind: ActivityKind;
    summary: string;
    severity: Severity;
    at: number;
}

export interface HouseholdMember {
    id: string;
    name: string;
    role: HouseholdRole;
    email?: string;
    phone?: string;
    isPrimary?: boolean;
    status: HouseholdStatus;
    channels: Record<Channel, boolean>;
}

export interface GuardianContext {
    id: string;
    label: string;
    subtitle: string;
}
