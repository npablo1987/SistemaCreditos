export enum LoanStatus {
  SOLICITADO = 'SOLICITADO',
  DEPOSITADO = 'DEPOSITADO',
  TERMINADO = 'TERMINADO',
}

export interface Loan {
  id: number;
  user_id: number;
  bank_account_id: number;
  amount: string | number;
  number_of_installments: number;
  payment_start_date: string;
  comment?: string;
  status: LoanStatus;
  admin_observations?: string;
  created_at: string;
  updated_at?: string | null;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    rut?: string;
  };
  bank_account?: {
    id: number;
    bank_name: string;
    account_type: string;
    account_number: string;
    holder_name: string;
    holder_document_id: string;
  };
  files?: LoanFile[];
  deposit_receipt?: any;
  deposit_date?: string;
  deposit_details?: string;
  // Campos calculados opcionales
  interest_rate?: number;
  total_amount?: number;
  installment_amount?: number;
  paid_installments?: number;
  remaining_amount?: number;
}

export interface LoanFile {
  id: number;
  loan_id: number;
  filename?: string;
  filepath?: string;
  original_name?: string;
  path?: string;
  mime_type: string;
  file_type?: string;
  uploaded_at: string;
}

export interface LoanCreate {
  amount: number;
  number_of_installments: number;
  payment_start_date: string;
  bank_account_id: number;
  comments?: string;
}

export interface LoanStatusUpdate {
  status: LoanStatus;
  admin_notes?: string;
}

export interface DepositInfo {
  deposit_date: string;
  deposit_details: string;
}

export interface LoanSimulation {
  amount: number;
  number_of_installments: number;
  interest_rate: number;
  installment_amount: number;
  total_amount: number;
  total_interest: number;
}
