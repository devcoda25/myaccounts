import { api } from '../utils/api';

export interface PaymentMethodDto {
    id: string;
    type: 'card' | 'momo' | 'bank';
    provider: string;
    details: any;
    isDefault: boolean;
    createdAt: string;
}

export const WalletService = {
    getMethods: async (): Promise<PaymentMethodDto[]> => {
        return api.get('/wallets/me/methods');
    },

    addMethod: async (data: { type: string; provider: string; details: any; token?: string }) => {
        return api.post('/wallets/me/methods', data);
    },

    removeMethod: async (id: string) => {
        return api.delete(`/wallets/me/methods/${id}`);
    },

    setDefaultMethod: async (id: string) => {
        return api.patch(`/wallets/me/methods/${id}/default`);
    }
};
