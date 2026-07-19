import { AppData, Loan, Transaction } from './types';

/** Number of days between two ISO date strings (a - b), never negative. */
export function daysBetween(laterIso: string, earlierIso: string): number {
  const later = new Date(laterIso + 'T00:00:00Z').getTime();
  const earlier = new Date(earlierIso + 'T00:00:00Z').getTime();
  const diff = Math.floor((later - earlier) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

export type Period = 'day' | 'week' | 'month' | 'year' | 'all';

/**
 * Inclusive start date (ISO) of the period containing `refIso`.
 * Weeks start on Monday. Returns null for 'all' (no lower bound).
 */
export function periodStartIso(period: Period, refIso: string): string | null {
  if (period === 'all') return null;
  const ref = new Date(refIso + 'T00:00:00Z');
  const start = new Date(ref);
  if (period === 'day') {
    // same day
  } else if (period === 'week') {
    const day = ref.getUTCDay(); // 0 = Sunday
    const diff = (day + 6) % 7; // days since Monday
    start.setUTCDate(ref.getUTCDate() - diff);
  } else if (period === 'month') {
    start.setUTCDate(1);
  } else if (period === 'year') {
    start.setUTCMonth(0, 1);
  }
  return start.toISOString().slice(0, 10);
}

export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: Period,
  refIso: string
): Transaction[] {
  const start = periodStartIso(period, refIso);
  if (!start) return transactions;
  return transactions.filter((t) => t.date >= start && t.date <= refIso);
}

export interface CashflowSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export function summarizeTransactions(transactions: Transaction[]): CashflowSummary {
  let totalIncome = 0;
  let totalExpense = 0;
  for (const t of transactions) {
    if (t.type === 'income') totalIncome += t.amount;
    else totalExpense += t.amount;
  }
  return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
}

export interface LoanSummary {
  principal: number;
  principalPaid: number;
  remainingPrincipal: number;
  interestAccrued: number;
  interestPaid: number;
  interestOutstanding: number;
  totalOwed: number;
  isSettled: boolean;
}

/**
 * Computes the state of a loan given to another person.
 *
 * Interest is modelled as simple interest accrued on the remaining principal
 * from the loan start date up to `asOfIso`. Payments are classified as either
 * capital (principal) or interest. Prepayments are ordinary principal payments
 * flagged for reporting; they reduce the remaining principal like any other.
 */
export function summarizeLoan(loan: Loan, asOfIso: string): LoanSummary {
  let principalPaid = 0;
  let interestPaid = 0;
  for (const p of loan.payments) {
    if (p.kind === 'principal') principalPaid += p.amount;
    else interestPaid += p.amount;
  }

  const remainingPrincipal = Math.max(0, loan.principal - principalPaid);
  const years = daysBetween(asOfIso, loan.startDate) / 365;
  const interestAccrued = remainingPrincipal * (loan.annualInterestRate / 100) * years;
  const interestOutstanding = Math.max(0, interestAccrued - interestPaid);
  const totalOwed = remainingPrincipal + interestOutstanding;

  return {
    principal: loan.principal,
    principalPaid,
    remainingPrincipal,
    interestAccrued,
    interestPaid,
    interestOutstanding,
    totalOwed,
    isSettled: totalOwed <= 0.005,
  };
}

export interface LoansSummary {
  totalLent: number;
  totalOutstanding: number;
  activeLoans: number;
}

export function summarizeLoans(loans: Loan[], asOfIso: string): LoansSummary {
  let totalLent = 0;
  let totalOutstanding = 0;
  let activeLoans = 0;
  for (const loan of loans) {
    const s = summarizeLoan(loan, asOfIso);
    totalLent += loan.principal;
    totalOutstanding += s.totalOwed;
    if (!s.isSettled) activeLoans += 1;
  }
  return { totalLent, totalOutstanding, activeLoans };
}

export function emptyAppData(): AppData {
  return { transactions: [], loans: [] };
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatCurrency(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  return `${sign}$${abs.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
