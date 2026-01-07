import { api } from '../utils/api';
import { OrgRole, IOrganization, IOrgSettingsPayload } from '../utils/types';

export type { OrgRole }; // Re-export if needed by consumers, or they should import from types.
// We can alias IOrganization to OrganizationDto for compatibility
export type OrganizationDto = IOrganization;

export type OrgType = "Company" | "School" | "Fleet" | "Government" | "Other";

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
        return api.get<OrganizationDto[]>('/orgs');
    },

    getOrg: async (id: string): Promise<OrganizationDto> => {
        return api.get<OrganizationDto>(`/orgs/${id}`);
    },

    createOrg: async (data: { name: string; country?: string }) => {
        return api.post<OrganizationDto>('/orgs', data);
    },

    joinOrg: async (id: string): Promise<OrganizationDto> => {
        return api.post<OrganizationDto>(`/orgs/${id}/join`);
    },

    createWallet: async (orgId: string, currency: string = 'USD') => {
        return api.post<void>(`/orgs/${orgId}/wallet`, { currency });
    },

    getMembers: async (orgId: string): Promise<OrgMemberDto[]> => {
        return api.get<OrgMemberDto[]>(`/orgs/${orgId}/members`);
    },

    updateMember: async (orgId: string, userId: string, data: { role?: string; status?: string }) => {
        return api.patch<void>(`/orgs/${orgId}/members/${userId}`, data);
    },

    removeMember: async (orgId: string, userId: string) => {
        return api.delete<void>(`/orgs/${orgId}/members/${userId}`);
    },

    updateSettings: async (orgId: string, data: Partial<IOrgSettingsPayload>) => {
        return api.patch<IOrganization>(`/orgs/${orgId}`, data);
    },

    getPermissions: async (orgId: string): Promise<{ grants: Record<string, unknown>; policy: Record<string, unknown> }> => {
        return api.get<{ grants: Record<string, unknown>; policy: Record<string, unknown> }>(`/orgs/${orgId}/permissions`);
    },

    updatePermissions: async (orgId: string, data: { grants?: Record<string, unknown>; policy?: Record<string, unknown> }) => {
        return api.patch<void>(`/orgs/${orgId}/permissions`, data);
    }
};
