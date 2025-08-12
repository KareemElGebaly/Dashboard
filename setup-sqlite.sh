#!/bin/bash

echo "🗄️ Setting up SQLite Database for Cash Flow Dashboard"
echo "===================================================="

# Install SQLite
apt update
apt install -y sqlite3

# Create database directory
mkdir -p /var/www/dashboard/database
cd /var/www/dashboard/database

# Create database and tables
sqlite3 cashflow.db << 'EOF'
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    invited_by TEXT
);

-- Create creditors table
CREATE TABLE IF NOT EXISTS creditors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    contact_info TEXT,
    total_owed REAL DEFAULT 0,
    user_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    amount REAL NOT NULL,
    due_date DATE NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'bank')),
    creditor_id TEXT NOT NULL,
    note TEXT,
    user_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creditor_id) REFERENCES creditors (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Create settings table
CREATE TABLE IF NOT EXISTS cash_flow_settings (
    id INTEGER PRIMARY KEY,
    user_id TEXT UNIQUE,
    cash_on_hand REAL DEFAULT 0,
    bank_balance REAL DEFAULT 0,
    daily_income REAL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Create creditor types table
CREATE TABLE IF NOT EXISTS creditor_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    user_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Insert default creditor types
INSERT OR IGNORE INTO creditor_types (name, user_id) VALUES 
('Supplier', NULL),
('Landlord', NULL),
('Utility Company', NULL),
('Service Provider', NULL),
('Bank', NULL),
('Government', NULL);

-- Insert admin user
INSERT OR IGNORE INTO users (id, email, name, role) VALUES 
('admin', 'kareem@letsvape.ae', 'Administrator', 'admin');

-- Insert default settings for admin
INSERT OR IGNORE INTO cash_flow_settings (user_id, cash_on_hand, bank_balance, daily_income) VALUES 
('admin', 0, 0, 0);

EOF

# Set proper permissions
chown -R www-data:www-data /var/www/dashboard/database
chmod -R 755 /var/www/dashboard/database
chmod 664 /var/www/dashboard/database/cashflow.db

echo "✅ SQLite database created successfully!"
echo "📍 Database location: /var/www/dashboard/database/cashflow.db"
echo ""
echo "🔍 To view database:"
echo "  sqlite3 /var/www/dashboard/database/cashflow.db"
echo "  .tables"
echo "  .schema"
echo "  .quit"