#!/bin/bash

echo "🚀 Complete Production Deployment with Backend API"
echo "=================================================="

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

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Build the React app for production
echo "🔨 Building React app for production..."
npm run build

# Stop existing backend if running
echo "🛑 Stopping existing backend..."
pm2 stop dashboard-backend 2>/dev/null || true
pm2 delete dashboard-backend 2>/dev/null || true

# Start backend API server with PM2
echo "🚀 Starting backend API server..."
pm2 start server/index.js --name "dashboard-backend" --log-file /var/log/dashboard/backend.log

# Save PM2 configuration
pm2 save

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
    
    echo "✅ Production deployment completed successfully!"
    echo "🌐 Your dashboard is live at: https://dashboard.letsvape.online"
    echo "🔥 Backend API running on: http://127.0.0.1:3001"
    
    # Show status
    echo ""
    echo "📊 Service Status:"
    echo "Frontend: Static files served by Nginx"
    echo "Backend: $(pm2 list | grep dashboard-backend | awk '{print $10}')"
    echo "Database: $(ls -la database/cashflow.db 2>/dev/null | awk '{print $5}' | numfmt --to=iec)B"
    
    # Clean old backups (keep last 5)
    echo "🧹 Cleaning old backups..."
    find $BACKUP_DIR -name "dashboard_backup_*.tar.gz" -type f | sort -r | tail -n +6 | xargs rm -f
    
    # Test API endpoint
    echo ""
    echo "🔍 Testing API connection..."
    curl -s http://127.0.0.1:3001/api/health | head -1
    
else
    echo "❌ Nginx configuration test failed!"
    echo "🔄 Rolling back..."
    
    # Stop backend
    pm2 stop dashboard-backend 2>/dev/null || true
    pm2 delete dashboard-backend 2>/dev/null || true
    
    # Restore from backup
    cd /var/www
    rm -rf dashboard
    tar -xzf $BACKUP_DIR/dashboard_backup_$DATE.tar.gz
    
    echo "⚠️  Deployment failed, rolled back to previous version"
    exit 1
fi

# Log deployment
echo "$(date): Production deployment completed successfully" >> /var/log/dashboard/deploy.log

echo ""
echo "🎉 Production Deployment Complete!"
echo "=================================="
echo "✅ React app built and served by Nginx"
echo "✅ Backend API running with PM2"
echo "✅ Database connected and accessible"
echo "✅ All services configured for production"
echo ""
echo "🌐 Visit: https://dashboard.letsvape.online"
echo "📊 Monitor: pm2 monit"
echo "📋 Logs: pm2 logs dashboard-backend"