// Types for audit logs module

export type Severity = "success" | "info" | "warning" | "error";
export type Outcome = "Success" | "Failed";
export type Risk = "Low" | "Medium" | "High";

export type AuditEvent = {
    id: string;
    at: number;
    actor: string;
    role: string;
    action: string;
    target: string;
    ip: string;
    outcome: Outcome;
    risk: Risk;
    requestId: string;
    meta: Record<string, string | number | boolean>;
};

// Filter types
export type FilterOption<T> = T | "All";
