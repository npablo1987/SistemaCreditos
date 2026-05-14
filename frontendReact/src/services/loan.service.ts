import axiosInstance from '@/core/http/axios.instance';
import { Loan, LoanCreate, LoanStatusUpdate, DepositInfo, LoanSimulation } from '@/models/loan.model';

export const loanService = {
  getAll: async (params?: {
    status_filter?: string;
    date_from?: string;
    date_to?: string;
    user_id?: number;
  }): Promise<Loan[]> => {
    const response = await axiosInstance.get('/loans', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Loan> => {
    const response = await axiosInstance.get(`/loans/${id}`);
    return response.data;
  },

  create: async (data: LoanCreate, files?: File[]): Promise<Loan> => {
    const formData = new FormData();
    formData.append('amount', data.amount.toString());
    formData.append('number_of_installments', data.number_of_installments.toString());
    formData.append('payment_start_date', data.payment_start_date);
    formData.append('bank_account_id', data.bank_account_id.toString());
    
    if (data.comments) {
      formData.append('comments', data.comments);
    }

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await axiosInstance.post('/loans', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateStatus: async (id: number, data: LoanStatusUpdate): Promise<Loan> => {
    const response = await axiosInstance.patch(`/loans/${id}/status`, data);
    return response.data;
  },

  registerDeposit: async (
    id: number, 
    data: DepositInfo, 
    file?: File
  ): Promise<Loan> => {
    const formData = new FormData();
    formData.append('deposit_date', data.deposit_date);
    formData.append('detail', data.deposit_details); // Backend espera 'detail'
    
    if (file) {
      formData.append('receipt', file); // Backend espera 'receipt'
    }

    const response = await axiosInstance.post(`/loans/${id}/deposit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  addFiles: async (id: number, files: File[]): Promise<void> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    await axiosInstance.post(`/loans/${id}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  simulate: async (amount: number, number_of_installments: number): Promise<LoanSimulation> => {
    const INTEREST_RATE = 0.05;
    const total_amount = amount * (1 + INTEREST_RATE);
    const installment_amount = total_amount / number_of_installments;
    
    return {
      amount,
      number_of_installments,
      interest_rate: INTEREST_RATE,
      installment_amount,
      total_amount,
      total_interest: amount * INTEREST_RATE,
    };
  },
};
