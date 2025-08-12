import Database from 'better-sqlite3';
import path from 'path';
import { Creditor, Expense, CashFlowSettings, User } from '../types';

const dbPath = path.join(process.cwd(), 'database', 'cashflow.db');
let db: Database.Database;

// Initialize database connection
try {
  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
} catch (error) {
  console.error('Failed to connect to database:', error);
  throw error;
}

export const dbApi = {
  // Users
  async getUser(email: string): Promise<User | null> {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      const user = stmt.get(email) as User | undefined;
      return user || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async createUser(user: Omit<User, 'createdAt'>): Promise<boolean> {
    try {
      const stmt = db.prepare(`
        INSERT INTO users (id, email, name, role, invited_by)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(user.id, user.email, user.name, user.role, user.invitedBy || null);
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  },

  async getInvitedUsers(): Promise<User[]> {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE role = ? ORDER BY created_at DESC');
      return stmt.all('user') as User[];
    } catch (error) {
      console.error('Error getting invited users:', error);
      return [];
    }
  },

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const stmt = db.prepare('DELETE FROM users WHERE id = ? AND role = ?');
      const result = stmt.run(userId, 'user');
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  // Creditors
  async getCreditors(userId: string): Promise<Creditor[]> {
    try {
      const stmt = db.prepare(`
        SELECT c.*, COALESCE(SUM(e.amount), 0) as total_owed
        FROM creditors c
        LEFT JOIN expenses e ON c.id = e.creditor_id
        WHERE c.user_id = ?
        GROUP BY c.id
        ORDER BY c.name
      `);
      return stmt.all(userId) as Creditor[];
    } catch (error) {
      console.error('Error getting creditors:', error);
      return [];
    }
  },

  async createCreditor(creditor: Omit<Creditor, 'totalOwed' | 'createdAt'>, userId: string): Promise<boolean> {
    try {
      const stmt = db.prepare(`
        INSERT INTO creditors (id, name, type, contact_info, user_id)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(creditor.id, creditor.name, creditor.type, creditor.contactInfo || null, userId);
      return true;
    } catch (error) {
      console.error('Error creating creditor:', error);
      return false;
    }
  },

  async updateCreditor(creditor: Creditor, userId: string): Promise<boolean> {
    try {
      const stmt = db.prepare(`
        UPDATE creditors 
        SET name = ?, type = ?, contact_info = ?
        WHERE id = ? AND user_id = ?
      `);
      const result = stmt.run(creditor.name, creditor.type, creditor.contactInfo || null, creditor.id, userId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating creditor:', error);
      return false;
    }
  },

  async deleteCreditor(creditorId: string, userId: string): Promise<boolean> {
    try {
      // Delete expenses first (foreign key constraint)
      const deleteExpenses = db.prepare('DELETE FROM expenses WHERE creditor_id = ? AND user_id = ?');
      deleteExpenses.run(creditorId, userId);
      
      // Delete creditor
      const deleteCreditor = db.prepare('DELETE FROM creditors WHERE id = ? AND user_id = ?');
      const result = deleteCreditor.run(creditorId, userId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting creditor:', error);
      return false;
    }
  },

  // Expenses
  async getExpenses(userId: string): Promise<Expense[]> {
    try {
      const stmt = db.prepare('SELECT * FROM expenses WHERE user_id = ? ORDER BY due_date');
      return stmt.all(userId) as Expense[];
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  },

  async createExpense(expense: Omit<Expense, 'createdAt'>, userId: string): Promise<boolean> {
    try {
      const stmt = db.prepare(`
        INSERT INTO expenses (id, amount, due_date, payment_method, creditor_id, note, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        expense.id,
        expense.amount,
        expense.dueDate,
        expense.paymentMethod,
        expense.creditorId,
        expense.note || null,
        userId
      );
      return true;
    } catch (error) {
      console.error('Error creating expense:', error);
      return false;
    }
  },

  async updateExpense(expense: Expense, userId: string): Promise<boolean> {
    try {
      const stmt = db.prepare(`
        UPDATE expenses 
        SET amount = ?, due_date = ?, payment_method = ?, creditor_id = ?, note = ?
        WHERE id = ? AND user_id = ?
      `);
      const result = stmt.run(
        expense.amount,
        expense.dueDate,
        expense.paymentMethod,
        expense.creditorId,
        expense.note || null,
        expense.id,
        userId
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating expense:', error);
      return false;
    }
  },

  async deleteExpense(expenseId: string, userId: string): Promise<boolean> {
    try {
      const stmt = db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?');
      const result = stmt.run(expenseId, userId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
  },

  // Settings
  async getSettings(userId: string): Promise<CashFlowSettings> {
    try {
      const stmt = db.prepare('SELECT * FROM cash_flow_settings WHERE user_id = ?');
      const settings = stmt.get(userId) as any;
      
      if (settings) {
        return {
          cashOnHand: settings.cash_on_hand,
          bankBalance: settings.bank_balance,
          dailyIncome: settings.daily_income,
        };
      }
      
      return { cashOnHand: 0, bankBalance: 0, dailyIncome: 0 };
    } catch (error) {
      console.error('Error getting settings:', error);
      return { cashOnHand: 0, bankBalance: 0, dailyIncome: 0 };
    }
  },

  async updateSettings(settings: CashFlowSettings, userId: string): Promise<boolean> {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO cash_flow_settings (user_id, cash_on_hand, bank_balance, daily_income, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      stmt.run(userId, settings.cashOnHand, settings.bankBalance, settings.dailyIncome);
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  },

  // Creditor Types
  async getCreditorTypes(userId: string): Promise<string[]> {
    try {
      const stmt = db.prepare('SELECT name FROM creditor_types WHERE user_id = ? OR user_id IS NULL ORDER BY name');
      const types = stmt.all(userId) as { name: string }[];
      return types.map(t => t.name);
    } catch (error) {
      console.error('Error getting creditor types:', error);
      return ['Supplier', 'Landlord'];
    }
  },

  async addCreditorType(name: string, userId: string): Promise<boolean> {
    try {
      const stmt = db.prepare('INSERT OR IGNORE INTO creditor_types (name, user_id) VALUES (?, ?)');
      stmt.run(name, userId);
      return true;
    } catch (error) {
      console.error('Error adding creditor type:', error);
      return false;
    }
  }
};

export default db;