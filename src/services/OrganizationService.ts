import { api } from '../utils/api';

export type OrgRole = "Owner" | "Admin" | "Manager" | "Member" | "Viewer" | "Support";

export type OrgType = "Company" | "School" | "Fleet" | "Government" | "Other";

export interface OrganizationDto {
    id: string;
    name: string;
    role: OrgRole;
    joinedAt: string;
    country?: string;
    membersCount?: number;
    walletEnabled?: boolean;
    walletBalance?: number;
    currency?: string;
    ssoEnabled?: boolean;
}

export interface OrgMemberDto {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: OrgRole;
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
    joinedAt: number;
}

export const OrganizationService = {
    listMyOrgs: async (): Promise<OrganizationDto[]> => {
        return api.get('/orgs');
    },

    getOrg: async (id: string): Promise<OrganizationDto> => {
        return api.get(`/orgs/${id}`);
    },

    createOrg: async (data: { name: string; country?: string }) => {
        return api.post('/orgs', data);
    },

    joinOrg: async (id: string) => {
        return api.post(`/orgs/${id}/join`);
    },

    createWallet: async (orgId: string, currency: string = 'USD') => {
        return api.post(`/orgs/${orgId}/wallet`, { currency });
    },

    getMembers: async (orgId: string): Promise<OrgMemberDto[]> => {
        return api.get(`/orgs/${orgId}/members`);
    },

    updateMember: async (orgId: string, userId: string, data: { role?: string; status?: string }) => {
        return api.patch(`/orgs/${orgId}/members/${userId}`, data);
    },

    removeMember: async (orgId: string, userId: string) => {
        return api.delete(`/orgs/${orgId}/members/${userId}`);
    },

    updateSettings: async (orgId: string, data: Partial<OrganizationDto>) => {
        return api.patch(`/orgs/${orgId}`, data);
    },

    getPermissions: async (orgId: string): Promise<{ grants: Record<string, unknown>; policy: Record<string, unknown> }> => {
        return api.get(`/orgs/${orgId}/permissions`);
    },

    updatePermissions: async (orgId: string, data: { grants?: Record<string, unknown>; policy?: Record<string, unknown> }) => {
        return api.patch(`/orgs/${orgId}/permissions`, data);
    }
};
