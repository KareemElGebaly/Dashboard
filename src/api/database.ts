import { Creditor, Expense, CashFlowSettings, User } from '../types';

const API_BASE_URL = '/api';

// HTTP API functions that communicate with the backend server
export const dbApi = {
  // Users
  async getUser(email: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  async createUser(user: Omit<User, 'createdAt'>): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  },

  async getInvitedUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    } catch (error) {
      console.error('Error fetching invited users:', error);
      return [];
    }
  },

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  // Creditors
  async getCreditors(userId: string): Promise<Creditor[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/creditors/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch creditors');
      const creditors = await response.json();
      return creditors.map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        contactInfo: c.contact_info || '',
        totalOwed: parseFloat(c.total_owed) || 0,
      }));
    } catch (error) {
      console.error('Error fetching creditors:', error);
      return [];
    }
  },

  async createCreditor(creditor: Omit<Creditor, 'totalOwed'>, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/creditors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: creditor.id,
          name: creditor.name,
          type: creditor.type,
          contactInfo: creditor.contactInfo,
          userId,
        }),
      });
      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error creating creditor:', error);
      return false;
    }
  },

  async updateCreditor(creditor: Creditor, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/creditors/${creditor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: creditor.name,
          type: creditor.type,
          contactInfo: creditor.contactInfo,
          userId,
        }),
      });
      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error updating creditor:', error);
      return false;
    }
  },

  async deleteCreditor(creditorId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/creditors/${creditorId}/${userId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error deleting creditor:', error);
      return false;
    }
  },

  // Expenses
  async getExpenses(userId: string): Promise<Expense[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const expenses = await response.json();
      return expenses.map((e: any) => ({
        id: e.id,
        amount: parseFloat(e.amount),
        dueDate: e.due_date,
        paymentMethod: e.payment_method,
        creditorId: e.creditor_id,
        note: e.note || '',
      }));
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  },

  async createExpense(expense: Omit<Expense, 'createdAt'>, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: expense.id,
          amount: expense.amount,
          dueDate: expense.dueDate,
          paymentMethod: expense.paymentMethod,
          creditorId: expense.creditorId,
          note: expense.note,
          userId,
        }),
      });
      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error creating expense:', error);
      return false;
    }
  },

  async updateExpense(expense: Expense, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${expense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: expense.amount,
          dueDate: expense.dueDate,
          paymentMethod: expense.paymentMethod,
          creditorId: expense.creditorId,
          note: expense.note,
          userId,
        }),
      });
      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error updating expense:', error);
      return false;
    }
  },

  async deleteExpense(expenseId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}/${userId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
  },

  // Settings
  async getSettings(userId: string): Promise<CashFlowSettings> {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      const settings = await response.json();
      return {
        cashOnHand: parseFloat(settings.cash_on_hand) || 0,
        bankBalance: parseFloat(settings.bank_balance) || 0,
        dailyIncome: parseFloat(settings.daily_income) || 0,
      };
    } catch (error) {
      console.error('Error fetching settings:', error);
      return { cashOnHand: 0, bankBalance: 0, dailyIncome: 0 };
    }
  },

  async updateSettings(settings: CashFlowSettings, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          cashOnHand: settings.cashOnHand,
          bankBalance: settings.bankBalance,
          dailyIncome: settings.dailyIncome,
        }),
      });
      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  },

  // Creditor Types
  async getCreditorTypes(userId: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/creditor-types/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch creditor types');
      return await response.json();
    } catch (error) {
      console.error('Error fetching creditor types:', error);
      return ['Supplier', 'Landlord', 'Utility Company', 'Service Provider'];
    }
  },

  async addCreditorType(name: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/creditor-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userId }),
      });
      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error adding creditor type:', error);
      return false;
    }
  }
};