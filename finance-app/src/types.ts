export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
}

export type LoanPaymentKind = 'principal' | 'interest';

export interface LoanPayment {
  id: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  amount: number;
  kind: LoanPaymentKind;
  /** Whether this payment is an early (anticipated) payment to capital */
  isPrepayment: boolean;
  note: string;
}

export interface Borrower {
  name: string;
  phone: string;
  email: string;
  note: string;
}

export interface Loan {
  id: string;
  borrower: Borrower;
  /** Original capital lent */
  principal: number;
  /** Annual interest rate as a percentage, e.g. 12 means 12% */
  annualInterestRate: number;
  /** ISO date string (YYYY-MM-DD) */
  startDate: string;
  note: string;
  payments: LoanPayment[];
}

export interface AppData {
  transactions: Transaction[];
  loans: Loan[];
}

export const DEFAULT_INCOME_CATEGORIES = [
  'Salary',
  'Rent income',
  'Interest',
  'Loan repayment',
  'Gift',
  'Other income',
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Rent',
  'Services',
  'Shopping',
  'Loans',
  'Interest',
  'Food',
  'Transport',
  'Health',
  'Entertainment',
  'Other expense',
];
