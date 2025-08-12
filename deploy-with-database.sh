#!/bin/bash

echo "🚀 Deploying Cash Flow Dashboard with SQLite Database"
echo "===================================================="

PROJECT_DIR="/var/www/dashboard"
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Navigate to project directory
cd $PROJECT_DIR

# Create backup of current deployment and database
echo "💾 Creating backup..."
tar -czf $BACKUP_DIR/dashboard_backup_$DATE.tar.gz -C /var/www dashboard

# Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git fetch origin
git reset --hard origin/main

# Install/update dependencies (including SQLite)
echo "📦 Installing dependencies..."
npm install
npm install better-sqlite3 --save

# Set up SQLite database if it doesn't exist
if [ ! -f "database/cashflow.db" ]; then
    echo "🗄️ Setting up SQLite database..."
    mkdir -p database
    
    # Create database with tables
    sqlite3 database/cashflow.db << 'EOF'
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

    echo "✅ Database created successfully!"
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Set proper permissions
echo "🔒 Setting permissions..."
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
chmod 664 $PROJECT_DIR/database/cashflow.db 2>/dev/null || true

# Test Nginx configuration
echo "🔧 Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    # Reload Nginx
    echo "🔄 Reloading Nginx..."
    systemctl reload nginx
    
    echo "✅ Deployment completed successfully!"
    echo "🌐 Your dashboard is live at: https://dashboard.letsvape.online"
    
    # Clean old backups (keep last 5)
    echo "🧹 Cleaning old backups..."
    find $BACKUP_DIR -name "dashboard_backup_*.tar.gz" -type f | sort -r | tail -n +6 | xargs rm -f
    
    # Show database status
    echo ""
    echo "🗄️ Database Status:"
    if [ -f "$PROJECT_DIR/database/cashflow.db" ]; then
        echo "✅ SQLite database is ready"
        echo "📊 Database size: $(du -h $PROJECT_DIR/database/cashflow.db | cut -f1)"
        echo "👥 Users: $(sqlite3 $PROJECT_DIR/database/cashflow.db 'SELECT COUNT(*) FROM users;')"
        echo "🏢 Creditors: $(sqlite3 $PROJECT_DIR/database/cashflow.db 'SELECT COUNT(*) FROM creditors;')"
        echo "💰 Expenses: $(sqlite3 $PROJECT_DIR/database/cashflow.db 'SELECT COUNT(*) FROM expenses;')"
    else
        echo "❌ Database not found"
    fi
    
else
    echo "❌ Nginx configuration test failed!"
    echo "🔄 Rolling back..."
    
    # Restore from backup
    cd /var/www
    rm -rf dashboard
    tar -xzf $BACKUP_DIR/dashboard_backup_$DATE.tar.gz
    
    echo "⚠️  Deployment failed, rolled back to previous version"
    exit 1
fi

# Log deployment
echo "$(date): SQLite deployment completed successfully" >> /var/log/dashboard/deploy.log