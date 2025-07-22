import { create } from 'zustand';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface UserState {
  telegramId: number | null;
  balance: number | null;
  transactions: Transaction[];
  setTelegramId: (id: number | null) => void;
  setBalance: (balance: number | null) => void;
  setTransactions: (transactions: Transaction[]) => void;
}

export const useUserStore = create<UserState>((set) => ({
  telegramId: null,
  balance: null,
  transactions: [],
  setTelegramId: (id) => set({ telegramId: id }),
  setBalance: (balance) => set({ balance }),
  setTransactions: (transactions) => set({ transactions: transactions }),
})); 