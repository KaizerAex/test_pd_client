import { create } from 'zustand';

interface UserState {
  telegramId: number | null;
  balance: number | null;
  transactions: any[];
  setTelegramId: (id: number) => void;
  setBalance: (balance: number) => void;
  setTransactions: (transactions: any[]) => void;
}

export const useUserStore = create<UserState>((set) => ({
  telegramId: null,
  balance: null,
  transactions: [],
  setTelegramId: (id) => set({ telegramId: id }),
  setBalance: (balance) => set({ balance }),
  setTransactions: (transactions) => set({ transactions }),
})); 