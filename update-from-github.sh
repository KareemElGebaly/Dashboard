#!/bin/bash

echo "📥 Updating Dashboard from GitHub Repository"
echo "============================================"

PROJECT_DIR="/var/www/dashboard"
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Navigate to project directory
cd $PROJECT_DIR

# Create backup of current state
echo "💾 Creating backup..."
tar -czf $BACKUP_DIR/dashboard_backup_$DATE.tar.gz -C /var/www dashboard

# Stash any local changes
echo "📦 Stashing local changes..."
git stash

# Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git fetch origin
git reset --hard origin/main

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x *.sh

# Install/update dependencies if package.json changed
if git diff HEAD~1 --name-only | grep -q "package.json\|package-lock.json"; then
    echo "📦 Installing updated dependencies..."
    npm install
    cd server && npm install && cd ..
fi

# Rebuild if source files changed
if git diff HEAD~1 --name-only | grep -q "src/\|index.html\|vite.config"; then
    echo "🔨 Rebuilding application..."
    npm run build
fi

# Restart backend if server files changed
if git diff HEAD~1 --name-only | grep -q "server/"; then
    echo "🔄 Restarting backend server..."
    pm2 restart dashboard-backend
fi

# Set proper permissions
echo "🔒 Setting permissions..."
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
chmod 664 $PROJECT_DIR/database/cashflow.db 2>/dev/null || true

# Test Nginx configuration
echo "🔧 Testing Nginx configuration..."
nginx -t && systemctl reload nginx

echo "✅ Update completed successfully!"
echo "🌐 Your dashboard is updated at: https://dashboard.letsvape.online"

# Show what changed
echo ""
echo "📋 Recent changes:"
git log --oneline -5

# Clean old backups (keep last 5)
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "dashboard_backup_*.tar.gz" -type f | sort -r | tail -n +6 | xargs rm -f

echo ""
echo "🎉 GitHub update complete!"