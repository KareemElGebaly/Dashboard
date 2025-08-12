#!/bin/bash

echo "🔄 Updating Dashboard to Use SQLite Database"
echo "============================================"

# Install required Node.js packages for SQLite
cd /var/www/dashboard

echo "📦 Installing SQLite dependencies..."
npm install sqlite3 better-sqlite3 --save

# Create database API endpoints directory
mkdir -p src/api

# Create database connection utility
cat > src/utils/database.ts << 'EOF'
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'cashflow.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export default db;

// Database utility functions
export const dbUtils = {
  // Users
  getUser: (email: string) => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },
  
  createUser: (user: any) => {
    return db.prepare(`
      INSERT INTO users (id, email, name, role, invited_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(user.id, user.email, user.name, user.role, user.invitedBy);
  },
  
  // Creditors
  getCreditors: (userId: string) => {
    return db.prepare('SELECT * FROM creditors WHERE user_id = ? ORDER BY name').all(userId);
  },
  
  createCreditor: (creditor: any) => {
    return db.prepare(`
      INSERT INTO creditors (id, name, type, contact_info, user_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(creditor.id, creditor.name, creditor.type, creditor.contactInfo, creditor.userId);
  },
  
  updateCreditor: (creditor: any) => {
    return db.prepare(`
      UPDATE creditors 
      SET name = ?, type = ?, contact_info = ?
      WHERE id = ? AND user_id = ?
    `).run(creditor.name, creditor.type, creditor.contactInfo, creditor.id, creditor.userId);
  },
  
  deleteCreditor: (id: string, userId: string) => {
    return db.prepare('DELETE FROM creditors WHERE id = ? AND user_id = ?').run(id, userId);
  },
  
  // Expenses
  getExpenses: (userId: string) => {
    return db.prepare('SELECT * FROM expenses WHERE user_id = ? ORDER BY due_date').all(userId);
  },
  
  createExpense: (expense: any) => {
    return db.prepare(`
      INSERT INTO expenses (id, amount, due_date, payment_method, creditor_id, note, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(expense.id, expense.amount, expense.dueDate, expense.paymentMethod, expense.creditorId, expense.note, expense.userId);
  },
  
  updateExpense: (expense: any) => {
    return db.prepare(`
      UPDATE expenses 
      SET amount = ?, due_date = ?, payment_method = ?, creditor_id = ?, note = ?
      WHERE id = ? AND user_id = ?
    `).run(expense.amount, expense.dueDate, expense.paymentMethod, expense.creditorId, expense.note, expense.id, expense.userId);
  },
  
  deleteExpense: (id: string, userId: string) => {
    return db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(id, userId);
  },
  
  // Settings
  getSettings: (userId: string) => {
    return db.prepare('SELECT * FROM cash_flow_settings WHERE user_id = ?').get(userId);
  },
  
  updateSettings: (settings: any, userId: string) => {
    return db.prepare(`
      INSERT OR REPLACE INTO cash_flow_settings (user_id, cash_on_hand, bank_balance, daily_income)
      VALUES (?, ?, ?, ?)
    `).run(userId, settings.cashOnHand, settings.bankBalance, settings.dailyIncome);
  },
  
  // Creditor Types
  getCreditorTypes: (userId: string) => {
    return db.prepare('SELECT name FROM creditor_types WHERE user_id = ? OR user_id IS NULL ORDER BY name').all(userId);
  },
  
  addCreditorType: (name: string, userId: string) => {
    return db.prepare('INSERT OR IGNORE INTO creditor_types (name, user_id) VALUES (?, ?)').run(name, userId);
  }
};
EOF

echo "✅ Database utilities created!"
echo "📍 Database connection: src/utils/database.ts"
echo ""
echo "🔄 Next steps:"
echo "1. Update your React components to use database instead of localStorage"
echo "2. Create API endpoints for database operations"
echo "3. Test the database integration"
echo ""
echo "🔍 To check database:"
echo "  ./database-manager.sh view"
echo "  ./database-manager.sh stats"