import { api } from '../utils/api';
import { IPaymentMethod, IPaymentMethodDetails } from '../utils/types';

export type { IPaymentMethod as PaymentMethodDto }; // Alias for backward compat during transition if needed, but better to just export plain

export const WalletService = {
    getMethods: async (): Promise<IPaymentMethod[]> => {
        return api.get<IPaymentMethod[]>('/wallets/me/methods');
    },

    addMethod: async (data: { type: string; provider: string; details: IPaymentMethodDetails; token?: string }) => {
        return api.post<void>('/wallets/me/methods', data);
    },

    removeMethod: async (id: string) => {
        return api.delete<void>(`/wallets/me/methods/${id}`);
    },

    setDefaultMethod: async (id: string) => {
        return api.patch<void>(`/wallets/me/methods/${id}/default`);
    }
};
