#!/bin/bash

echo "🐘 Setting up PostgreSQL Database for Cash Flow Dashboard"
echo "========================================================"

# Install PostgreSQL
apt update
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << 'EOF'
-- Create database
CREATE DATABASE cashflow_dashboard;

-- Create user
CREATE USER dashboard_user WITH ENCRYPTED PASSWORD 'secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cashflow_dashboard TO dashboard_user;

-- Connect to the database
\c cashflow_dashboard

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    invited_by VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS creditors (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    contact_info TEXT,
    total_owed DECIMAL(10,2) DEFAULT 0,
    user_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(255) PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_method VARCHAR(10) CHECK (payment_method IN ('cash', 'bank')),
    creditor_id VARCHAR(255) NOT NULL,
    note TEXT,
    user_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creditor_id) REFERENCES creditors (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS cash_flow_settings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE,
    cash_on_hand DECIMAL(10,2) DEFAULT 0,
    bank_balance DECIMAL(10,2) DEFAULT 0,
    daily_income DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS creditor_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Insert default data
INSERT INTO creditor_types (name, user_id) VALUES 
('Supplier', NULL),
('Landlord', NULL),
('Utility Company', NULL),
('Service Provider', NULL)
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (id, email, name, role) VALUES 
('admin', 'kareem@letsvape.ae', 'Administrator', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Grant permissions to dashboard_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dashboard_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dashboard_user;

\q
EOF

# Configure PostgreSQL for local connections
echo "host    cashflow_dashboard    dashboard_user    127.0.0.1/32    md5" >> /etc/postgresql/*/main/pg_hba.conf

# Restart PostgreSQL
systemctl restart postgresql

echo "✅ PostgreSQL database created successfully!"
echo "📍 Database: cashflow_dashboard"
echo "👤 User: dashboard_user"
echo "🔑 Password: secure_password_here"
echo ""
echo "🔍 To connect to database:"
echo "  sudo -u postgres psql -d cashflow_dashboard"
echo "  \\dt  (list tables)"
echo "  \\q   (quit)"