#!/bin/bash

echo "🚀 Auto-Deploying Cash Flow Dashboard from GitHub"
echo "================================================="

PROJECT_DIR="/var/www/dashboard"
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Navigate to project directory
cd $PROJECT_DIR

# Create backup of current deployment
echo "💾 Creating backup..."
tar -czf $BACKUP_DIR/dashboard_backup_$DATE.tar.gz -C /var/www dashboard

# Pull latest changes from GitHub
echo "📥 Pulling latest changes..."
git fetch origin
git reset --hard origin/main

# Install/update dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build the project
echo "🔨 Building project..."
npm run build

# Set proper permissions
echo "🔒 Setting permissions..."
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

# Test Nginx configuration
echo "🔧 Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    # Reload Nginx
    echo "🔄 Reloading Nginx..."
    systemctl reload nginx
    
    echo "✅ Deployment completed successfully!"
    echo "🌐 Your dashboard is live at your configured domain"
    
    # Clean old backups (keep last 5)
    echo "🧹 Cleaning old backups..."
    find $BACKUP_DIR -name "dashboard_backup_*.tar.gz" -type f | sort -r | tail -n +6 | xargs rm -f
    
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
echo "$(date): Deployment completed successfully" >> /var/log/dashboard/deploy.log