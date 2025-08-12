const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbPath = path.join(__dirname, '..', 'database', 'cashflow.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log(`🗄️ Connected to database: ${dbPath}`);

// API Routes

// Users
app.get('/api/users/:email', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(req.params.email);
    res.json(user || null);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const { id, email, name, role, invitedBy } = req.body;
    const result = db.prepare(`
      INSERT INTO users (id, email, name, role, invited_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, email, name, role, invitedBy);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users WHERE role = "user" ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Creditors
app.get('/api/creditors/:userId', (req, res) => {
  try {
    const creditors = db.prepare(`
      SELECT c.*, COALESCE(SUM(e.amount), 0) as total_owed
      FROM creditors c
      LEFT JOIN expenses e ON c.id = e.creditor_id
      WHERE c.user_id = ?
      GROUP BY c.id
      ORDER BY c.name
    `).all(req.params.userId);
    res.json(creditors);
  } catch (error) {
    console.error('Error fetching creditors:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/creditors', (req, res) => {
  try {
    const { id, name, type, contactInfo, userId } = req.body;
    const result = db.prepare(`
      INSERT INTO creditors (id, name, type, contact_info, user_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, type, contactInfo, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating creditor:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/creditors/:id', (req, res) => {
  try {
    const { name, type, contactInfo, userId } = req.body;
    const result = db.prepare(`
      UPDATE creditors 
      SET name = ?, type = ?, contact_info = ?
      WHERE id = ? AND user_id = ?
    `).run(name, type, contactInfo, req.params.id, userId);
    res.json({ success: result.changes > 0 });
  } catch (error) {
    console.error('Error updating creditor:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/creditors/:id/:userId', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM creditors WHERE id = ? AND user_id = ?').run(req.params.id, req.params.userId);
    res.json({ success: result.changes > 0 });
  } catch (error) {
    console.error('Error deleting creditor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Expenses
app.get('/api/expenses/:userId', (req, res) => {
  try {
    const expenses = db.prepare('SELECT * FROM expenses WHERE user_id = ? ORDER BY due_date').all(req.params.userId);
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses', (req, res) => {
  try {
    const { id, amount, dueDate, paymentMethod, creditorId, note, userId } = req.body;
    const result = db.prepare(`
      INSERT INTO expenses (id, amount, due_date, payment_method, creditor_id, note, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, amount, dueDate, paymentMethod, creditorId, note, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/expenses/:id', (req, res) => {
  try {
    const { amount, dueDate, paymentMethod, creditorId, note, userId } = req.body;
    const result = db.prepare(`
      UPDATE expenses 
      SET amount = ?, due_date = ?, payment_method = ?, creditor_id = ?, note = ?
      WHERE id = ? AND user_id = ?
    `).run(amount, dueDate, paymentMethod, creditorId, note, req.params.id, userId);
    res.json({ success: result.changes > 0 });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/expenses/:id/:userId', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(req.params.id, req.params.userId);
    res.json({ success: result.changes > 0 });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: error.message });
  }
});

// Settings
app.get('/api/settings/:userId', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM cash_flow_settings WHERE user_id = ?').get(req.params.userId);
    res.json(settings || { cashOnHand: 0, bankBalance: 0, dailyIncome: 0 });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const { userId, cashOnHand, bankBalance, dailyIncome } = req.body;
    const result = db.prepare(`
      INSERT OR REPLACE INTO cash_flow_settings (user_id, cash_on_hand, bank_balance, daily_income)
      VALUES (?, ?, ?, ?)
    `).run(userId, cashOnHand, bankBalance, dailyIncome);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Creditor Types
app.get('/api/creditor-types/:userId', (req, res) => {
  try {
    const types = db.prepare('SELECT name FROM creditor_types WHERE user_id = ? OR user_id IS NULL ORDER BY name').all(req.params.userId);
    res.json(types.map(t => t.name));
  } catch (error) {
    console.error('Error fetching creditor types:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/creditor-types', (req, res) => {
  try {
    const { name, userId } = req.body;
    const result = db.prepare('INSERT OR IGNORE INTO creditor_types (name, user_id) VALUES (?, ?)').run(name, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding creditor type:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    res.json({ 
      status: 'OK', 
      database: 'connected',
      users: userCount.count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Backend API server running on http://127.0.0.1:${PORT}`);
  console.log(`🗄️ Database: ${dbPath}`);
  console.log(`📊 Health check: http://127.0.0.1:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down backend server...');
  db.close();
  process.exit(0);
});