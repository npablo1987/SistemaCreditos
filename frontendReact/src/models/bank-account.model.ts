export interface BankAccount {
  id: number;
  user_id: number;
  bank_name: string;
  account_type: string;
  account_number: string;
  holder_name: string;
  holder_document_id: string;
  is_primary?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BankAccountCreate {
  bank_name: string;
  account_type: string;
  account_number: string;
  holder_name: string;
  holder_document_id: string;
  is_primary?: boolean;
}

export interface BankAccountUpdate {
  bank_name?: string;
  account_type?: string;
  account_number?: string;
  holder_name?: string;
  holder_document_id?: string;
  is_primary?: boolean;
}
