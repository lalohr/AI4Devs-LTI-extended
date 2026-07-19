import {
  daysBetween,
  formatCurrency,
  summarizeLoan,
  summarizeLoans,
  summarizeTransactions,
} from './finance';
import { Loan, Transaction } from './types';

function txn(partial: Partial<Transaction>): Transaction {
  return {
    id: Math.random().toString(),
    type: 'expense',
    amount: 0,
    category: 'Other',
    note: '',
    date: '2024-01-01',
    ...partial,
  };
}

function loan(partial: Partial<Loan>): Loan {
  return {
    id: 'l1',
    borrower: { name: 'Jane', phone: '', email: '', note: '' },
    principal: 1000,
    annualInterestRate: 0,
    startDate: '2024-01-01',
    note: '',
    payments: [],
    ...partial,
  };
}

describe('daysBetween', () => {
  it('returns positive day difference', () => {
    expect(daysBetween('2024-01-31', '2024-01-01')).toBe(30);
  });

  it('never returns negative values', () => {
    expect(daysBetween('2024-01-01', '2024-01-31')).toBe(0);
  });
});

describe('summarizeTransactions', () => {
  it('computes income, expense and balance', () => {
    const result = summarizeTransactions([
      txn({ type: 'income', amount: 2000 }),
      txn({ type: 'expense', amount: 500 }),
      txn({ type: 'expense', amount: 300 }),
    ]);
    expect(result.totalIncome).toBe(2000);
    expect(result.totalExpense).toBe(800);
    expect(result.balance).toBe(1200);
  });

  it('handles an empty list', () => {
    expect(summarizeTransactions([])).toEqual({
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    });
  });
});

describe('summarizeLoan', () => {
  it('reduces remaining principal by capital payments', () => {
    const s = summarizeLoan(
      loan({
        principal: 1000,
        payments: [
          { id: 'p1', date: '2024-02-01', amount: 400, kind: 'principal', isPrepayment: true, note: '' },
        ],
      }),
      '2024-01-01'
    );
    expect(s.principalPaid).toBe(400);
    expect(s.remainingPrincipal).toBe(600);
  });

  it('accrues simple interest on the remaining principal', () => {
    const s = summarizeLoan(
      loan({ principal: 1000, annualInterestRate: 12 }),
      '2025-01-01'
    );
    // 1000 * 12% * ~1 year (366 days in 2024) ~= 120
    expect(s.interestAccrued).toBeCloseTo(1000 * 0.12 * (366 / 365), 1);
    expect(s.totalOwed).toBeCloseTo(1000 + s.interestAccrued, 5);
  });

  it('marks a fully repaid loan as settled', () => {
    const s = summarizeLoan(
      loan({
        principal: 1000,
        annualInterestRate: 0,
        payments: [
          { id: 'p1', date: '2024-06-01', amount: 1000, kind: 'principal', isPrepayment: false, note: '' },
        ],
      }),
      '2024-12-31'
    );
    expect(s.remainingPrincipal).toBe(0);
    expect(s.totalOwed).toBe(0);
    expect(s.isSettled).toBe(true);
  });

  it('nets interest paid against interest accrued', () => {
    const s = summarizeLoan(
      loan({
        principal: 1000,
        annualInterestRate: 12,
        payments: [
          { id: 'p1', date: '2024-06-01', amount: 50, kind: 'interest', isPrepayment: false, note: '' },
        ],
      }),
      '2025-01-01'
    );
    expect(s.interestPaid).toBe(50);
    expect(s.interestOutstanding).toBeCloseTo(s.interestAccrued - 50, 5);
  });
});

describe('summarizeLoans', () => {
  it('aggregates totals across loans', () => {
    const result = summarizeLoans(
      [
        loan({ id: 'a', principal: 1000, annualInterestRate: 0 }),
        loan({
          id: 'b',
          principal: 500,
          annualInterestRate: 0,
          payments: [
            { id: 'p', date: '2024-06-01', amount: 500, kind: 'principal', isPrepayment: false, note: '' },
          ],
        }),
      ],
      '2024-12-31'
    );
    expect(result.totalLent).toBe(1500);
    expect(result.totalOutstanding).toBe(1000);
    expect(result.activeLoans).toBe(1);
  });
});

describe('formatCurrency', () => {
  it('formats positive and negative amounts', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
    expect(formatCurrency(-99)).toBe('-$99.00');
  });
});
