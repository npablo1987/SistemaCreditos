import axiosInstance from '@/core/http/axios.instance';
import { BankAccount, BankAccountCreate, BankAccountUpdate } from '@/models/bank-account.model';

export const bankAccountService = {
  getAll: async (userId?: number): Promise<BankAccount[]> => {
    const params = userId ? { user_id: userId } : {};
    const response = await axiosInstance.get('/bank-accounts', { params });
    return response.data;
  },

  getById: async (id: number): Promise<BankAccount> => {
    const response = await axiosInstance.get(`/bank-accounts/${id}`);
    return response.data;
  },

  create: async (data: BankAccountCreate): Promise<BankAccount> => {
    const response = await axiosInstance.post('/bank-accounts', data);
    return response.data;
  },

  update: async (id: number, data: BankAccountUpdate): Promise<BankAccount> => {
    const response = await axiosInstance.put(`/bank-accounts/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/bank-accounts/${id}`);
  },
};
