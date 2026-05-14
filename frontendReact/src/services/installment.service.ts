import axiosInstance from '@/core/http/axios.instance';
import { Installment, InstallmentCreate } from '@/models/installment.model';

export const installmentService = {
  getByLoan: async (loanId: number): Promise<Installment[]> => {
    const response = await axiosInstance.get(`/loans/${loanId}/installments`);
    return response.data;
  },

  create: async (loanId: number, data: InstallmentCreate, file?: File): Promise<Installment> => {
    const formData = new FormData();
    formData.append('installment_number', data.installment_number.toString());
    formData.append('amount', data.amount.toString());
    formData.append('payment_date', data.payment_date);
    
    if (data.observation) {
      formData.append('observation', data.observation);
    }

    if (file) {
      formData.append('receipt', file);
    }

    const response = await axiosInstance.post(`/loans/${loanId}/installments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  markAsPaid: async (loanId: number, installmentId: number): Promise<Installment> => {
    const response = await axiosInstance.patch(
      `/loans/${loanId}/installments/${installmentId}/mark-paid`
    );
    return response.data;
  },
};
