export interface Creditor {
  id: string;
  name: string;
  type: string;
  contactInfo?: string;
  totalOwed: number;
}

export interface Expense {
  id: string;
  amount: number;
  dueDate: string;
  paymentMethod: 'cash' | 'bank';
  creditorId: string;
  note: string;
}

export interface CashFlowSettings {
  cashOnHand: number;
  bankBalance: number;
  dailyIncome: number;
}

export interface DailyForecast {
  day: number;
  date: string;
  openingBalance: number;
  totalExpenses: number;
  cashExpenses: number;
  bankExpenses: number;
  creditors: string[];
  closingBalance: number;
  notes: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  role: 'admin' | 'user';
  invitedBy?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}