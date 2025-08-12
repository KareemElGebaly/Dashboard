#!/bin/bash

echo "🚀 Starting Production Backend API Server"
echo "========================================="

# Navigate to server directory
cd /var/www/dashboard/server

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Stop existing PM2 process if running
echo "🛑 Stopping existing backend process..."
pm2 stop dashboard-backend 2>/dev/null || true
pm2 delete dashboard-backend 2>/dev/null || true

# Start backend with PM2
echo "🔥 Starting backend server with PM2..."
pm2 start index.js --name "dashboard-backend" --log-file /var/log/dashboard/backend.log

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup

echo "✅ Backend API server started successfully!"
echo "📊 Status: pm2 status"
echo "📋 Logs: pm2 logs dashboard-backend"
echo "🔍 Health check: curl http://127.0.0.1:3001/api/health"