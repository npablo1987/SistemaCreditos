export interface Installment {
  id: number;
  loan_id: number;
  installment_number: number;
  amount: number | string;
  payment_date: string;
  due_date?: string;
  is_paid: boolean;
  paid_at?: string;
  observation?: string;
  receipt_original_name?: string;
  receipt_path?: string;
  receipt_mime_type?: string;
  created_at: string;
}

export interface InstallmentCreate {
  installment_number: number;
  amount: number;
  payment_date: string;
  observation?: string;
}
