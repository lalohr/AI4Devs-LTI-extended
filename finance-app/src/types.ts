export type TransactionType = 'income' | 'expense';

export interface LineItem {
  id: string;
  name: string;
  amount: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Total amount. For itemized transactions this is the sum of `items`. */
  amount: number;
  category: string;
  note: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Optional line items (e.g. category "Paid Material": cement 50, iron 100). */
  items?: LineItem[];
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

export interface CustomCategories {
  income: string[];
  expense: string[];
}

export interface AppData {
  transactions: Transaction[];
  loans: Loan[];
  /** User-added categories, kept separate from the built-in defaults. */
  customCategories: CustomCategories;
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
  'Paid Material',
  'Loans',
  'Interest',
  'Food',
  'Transport',
  'Health',
  'Entertainment',
  'Other expense',
];
