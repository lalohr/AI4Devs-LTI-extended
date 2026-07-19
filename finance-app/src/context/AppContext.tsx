import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppData, Loan, LoanPayment, Transaction, TransactionType } from '../types';
import { emptyAppData } from '../finance';
import { loadAppData, saveAppData } from '../storage';

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface AppContextValue {
  data: AppData;
  isLoaded: boolean;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addLoan: (loan: Omit<Loan, 'id' | 'payments'>) => void;
  updateLoan: (loan: Loan) => void;
  deleteLoan: (id: string) => void;
  addLoanPayment: (loanId: string, payment: Omit<LoanPayment, 'id'>) => void;
  deleteLoanPayment: (loanId: string, paymentId: string) => void;
  addCategory: (type: TransactionType, name: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(emptyAppData());
  const [isLoaded, setIsLoaded] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    loadAppData().then((loaded) => {
      setData(loaded);
      hasLoaded.current = true;
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (hasLoaded.current) {
      saveAppData(data);
    }
  }, [data]);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    setData((prev) => ({
      ...prev,
      transactions: [{ ...t, id: createId() }, ...prev.transactions],
    }));
  }, []);

  const updateTransaction = useCallback((t: Transaction) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((x) => (x.id === t.id ? t : x)),
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((x) => x.id !== id),
    }));
  }, []);

  const addLoan = useCallback((loan: Omit<Loan, 'id' | 'payments'>) => {
    setData((prev) => ({
      ...prev,
      loans: [{ ...loan, id: createId(), payments: [] }, ...prev.loans],
    }));
  }, []);

  const updateLoan = useCallback((loan: Loan) => {
    setData((prev) => ({
      ...prev,
      loans: prev.loans.map((x) => (x.id === loan.id ? loan : x)),
    }));
  }, []);

  const deleteLoan = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      loans: prev.loans.filter((x) => x.id !== id),
    }));
  }, []);

  const addLoanPayment = useCallback(
    (loanId: string, payment: Omit<LoanPayment, 'id'>) => {
      setData((prev) => ({
        ...prev,
        loans: prev.loans.map((loan) =>
          loan.id === loanId
            ? { ...loan, payments: [{ ...payment, id: createId() }, ...loan.payments] }
            : loan
        ),
      }));
    },
    []
  );

  const deleteLoanPayment = useCallback((loanId: string, paymentId: string) => {
    setData((prev) => ({
      ...prev,
      loans: prev.loans.map((loan) =>
        loan.id === loanId
          ? { ...loan, payments: loan.payments.filter((p) => p.id !== paymentId) }
          : loan
      ),
    }));
  }, []);

  const addCategory = useCallback((type: TransactionType, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setData((prev) => {
      const list = prev.customCategories[type];
      if (list.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return prev;
      return {
        ...prev,
        customCategories: { ...prev.customCategories, [type]: [...list, trimmed] },
      };
    });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      isLoaded,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addLoan,
      updateLoan,
      deleteLoan,
      addLoanPayment,
      deleteLoanPayment,
      addCategory,
    }),
    [
      data,
      isLoaded,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addLoan,
      updateLoan,
      deleteLoan,
      addLoanPayment,
      deleteLoanPayment,
      addCategory,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
