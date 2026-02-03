// Types for disputes module

export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "WON" | "LOST" | "CLOSED";

export interface DisputeRow {
    id: string;
    wallet: { id: string; user: { email: string; firstName: string; otherNames: string } };
    amount: number;
    currency: string;
    reason: string;
    status: DisputeStatus;
    createdAt: string;
    reference: string;
    txnId?: string;
}

export type FilterOption<T> = T | "All";
