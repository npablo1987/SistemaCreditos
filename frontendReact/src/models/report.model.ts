export interface DashboardReport {
  period: string;
  total_lent: string | number;
  total_paid: string | number;
  active_loans: number;
  finished_loans: number;
  // Campos calculados opcionales
  total_loans?: number;
  completed_loans?: number;
  total_deposited?: number;
  total_received?: number;
  interest_earned?: number;
  active_users?: number;
  pending_loans?: number;
}

export interface MonthlyReport {
  month: string;
  year: number;
  total_loaned: number;
  total_paid: number;
  interest_earned: number;
  pending_installments: number;
  loans_approved: number;
  loans_rejected: number;
}

export interface WeeklyReport {
  week_start: string;
  week_end: string;
  total_loaned: number;
  total_paid: number;
  interest_earned: number;
  loans_approved: number;
}
