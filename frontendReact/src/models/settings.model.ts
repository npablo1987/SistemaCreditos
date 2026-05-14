export interface LoanSettings {
  id?: number;
  min_amount: number;
  max_amount: number;
  min_installments: number;
  max_installments: number;
  interest_rate: number;
  updated_at?: string;
}

export interface LoanSettingsUpdate {
  min_amount?: number;
  max_amount?: number;
  min_installments?: number;
  max_installments?: number;
  interest_rate?: number;
}
