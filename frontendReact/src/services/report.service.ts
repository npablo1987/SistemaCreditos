import axiosInstance from '@/core/http/axios.instance';
import { DashboardReport, MonthlyReport, WeeklyReport } from '@/models/report.model';

export const reportService = {
  getDashboard: async (): Promise<DashboardReport> => {
    const response = await axiosInstance.get('/reports/dashboard');
    return response.data;
  },

  getMonthly: async (year?: number, month?: number): Promise<MonthlyReport> => {
    const params = { year, month };
    const response = await axiosInstance.get('/reports/monthly', { params });
    return response.data;
  },

  getWeekly: async (): Promise<WeeklyReport> => {
    const response = await axiosInstance.get('/reports/weekly');
    return response.data;
  },
};
