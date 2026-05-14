import axiosInstance from '@/core/http/axios.instance';
import { LoanSettings, LoanSettingsUpdate } from '@/models/settings.model';

export const settingsService = {
  getLoanSettings: async (): Promise<LoanSettings> => {
    const response = await axiosInstance.get('/settings/loan');
    return response.data;
  },

  updateLoanSettings: async (data: LoanSettingsUpdate): Promise<LoanSettings> => {
    const response = await axiosInstance.put('/settings/loan', data);
    return response.data;
  },
};
