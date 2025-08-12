#!/bin/bash

echo "🛠️ Creating Management Scripts"
echo "=============================="

# Create deployment script
cat > /root/deploy-dashboard.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying Cash Flow Dashboard..."

# Navigate to project directory
cd /var/www/dashboard

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build the project
echo "🔨 Building project..."
npm run build

# Set permissions
echo "🔒 Setting permissions..."
chown -R www-data:www-data /var/www/dashboard
chmod -R 755 /var/www/dashboard

# Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo "✅ Deployment completed successfully!"
echo "🌐 Your dashboard is available at your configured domain"
EOF

# Create monitoring script
cat > /root/monitor-dashboard.sh << 'EOF'
#!/bin/bash

echo "📊 Cash Flow Dashboard System Status"
echo "===================================="

# System information
echo "🖥️  System Information:"
echo "   OS: $(lsb_release -d | cut -f2)"
echo "   Uptime: $(uptime -p)"
echo "   Load: $(uptime | awk -F'load average:' '{print $2}')"

# Disk usage
echo ""
echo "💾 Disk Usage:"
df -h / | tail -1 | awk '{print "   Root: " $3 "/" $2 " (" $5 " used)"}'

# Memory usage
echo ""
echo "🧠 Memory Usage:"
free -h | grep "Mem:" | awk '{print "   RAM: " $3 "/" $2 " (" int($3/$2*100) "% used)"}'

# Service status
echo ""
echo "🔧 Service Status:"
echo "   Nginx: $(systemctl is-active nginx)"
echo "   UFW Firewall: $(ufw status | head -1 | awk '{print $2}')"

# Nginx status
echo ""
echo "🌐 Nginx Status:"
if systemctl is-active --quiet nginx; then
    echo "   ✅ Nginx is running"
    echo "   📊 Active connections: $(nginx -s reload 2>&1 | grep -o '[0-9]*' | head -1 || echo 'N/A')"
else
    echo "   ❌ Nginx is not running"
fi

# SSL certificate status
echo ""
echo "🔒 SSL Certificate Status:"
if [ -d "/etc/letsencrypt/live" ]; then
    for cert in /etc/letsencrypt/live/*/cert.pem; do
        if [ -f "$cert" ]; then
            domain=$(basename $(dirname $cert))
            expiry=$(openssl x509 -enddate -noout -in "$cert" | cut -d= -f2)
            echo "   📜 $domain: Valid until $expiry"
        fi
    done
else
    echo "   ⚠️  No SSL certificates found"
fi

# Recent access logs
echo ""
echo "📈 Recent Access (last 5 entries):"
if [ -f "/var/log/nginx/access.log" ]; then
    tail -5 /var/log/nginx/access.log | while read line; do
        echo "   $line"
    done
else
    echo "   ⚠️  No access logs found"
fi

# Check for errors
echo ""
echo "🚨 Recent Errors (last 3 entries):"
if [ -f "/var/log/nginx/error.log" ]; then
    if [ -s "/var/log/nginx/error.log" ]; then
        tail -3 /var/log/nginx/error.log | while read line; do
            echo "   $line"
        done
    else
        echo "   ✅ No recent errors"
    fi
else
    echo "   ⚠️  No error logs found"
fi

echo ""
echo "📅 Report generated: $(date)"
EOF

# Create backup script
cat > /root/backup-dashboard.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "💾 Creating Dashboard Backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup dashboard files
echo "📁 Backing up dashboard files..."
tar -czf $BACKUP_DIR/dashboard_$DATE.tar.gz -C /var/www dashboard

# Backup Nginx configuration
echo "⚙️  Backing up Nginx configuration..."
tar -czf $BACKUP_DIR/nginx_config_$DATE.tar.gz -C /etc/nginx sites-available sites-enabled

# Backup SSL certificates (if they exist)
if [ -d "/etc/letsencrypt" ]; then
    echo "🔒 Backing up SSL certificates..."
    tar -czf $BACKUP_DIR/ssl_certs_$DATE.tar.gz -C /etc letsencrypt
fi

# Keep only last 7 backups
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "dashboard_*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "nginx_config_*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "ssl_certs_*.tar.gz" -mtime +7 -delete

# Show backup size
BACKUP_SIZE=$(du -sh $BACKUP_DIR/dashboard_$DATE.tar.gz | cut -f1)

echo "✅ Backup completed successfully!"
echo "📦 Backup file: dashboard_$DATE.tar.gz ($BACKUP_SIZE)"
echo "📍 Location: $BACKUP_DIR"
EOF

# Create update script
cat > /root/update-system.sh << 'EOF'
#!/bin/bash

echo "🔄 Updating System..."

# Update package lists
echo "📋 Updating package lists..."
apt update

# Upgrade packages
echo "⬆️  Upgrading packages..."
apt upgrade -y

# Update Node.js packages
echo "📦 Updating Node.js packages..."
cd /var/www/dashboard
npm update

# Rebuild project
echo "🔨 Rebuilding project..."
npm run build

# Set permissions
chown -R www-data:www-data /var/www/dashboard
chmod -R 755 /var/www/dashboard

# Restart services
echo "🔄 Restarting services..."
systemctl restart nginx

# Clean up
echo "🧹 Cleaning up..."
apt autoremove -y
apt autoclean

echo "✅ System update completed!"
EOF

# Make all scripts executable
chmod +x /root/deploy-dashboard.sh
chmod +x /root/monitor-dashboard.sh
chmod +x /root/backup-dashboard.sh
chmod +x /root/update-system.sh

echo "✅ Management scripts created successfully!"
echo ""
echo "Available commands:"
echo "  /root/deploy-dashboard.sh    - Deploy/update dashboard"
echo "  /root/monitor-dashboard.sh   - Check system status"
echo "  /root/backup-dashboard.sh    - Create backup"
echo "  /root/update-system.sh       - Update system and packages"
EOF

# Create automatic backup cron job
cat > /root/setup-cron.sh << 'EOF'
#!/bin/bash

echo "⏰ Setting up automated tasks..."

# Add cron jobs
(crontab -l 2>/dev/null; echo "# Dashboard automated backups - daily at 2 AM") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-dashboard.sh >> /var/log/dashboard/backup.log 2>&1") | crontab -

(crontab -l 2>/dev/null; echo "# System updates - weekly on Sunday at 3 AM") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 0 /root/update-system.sh >> /var/log/dashboard/update.log 2>&1") | crontab -

(crontab -l 2>/dev/null; echo "# SSL certificate renewal - twice daily") | crontab -
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "✅ Automated tasks configured!"
echo "📅 Scheduled tasks:"
echo "   - Daily backups at 2:00 AM"
echo "   - Weekly system updates on Sunday at 3:00 AM"
echo "   - SSL certificate renewal checks twice daily"
EOF

chmod +x /root/setup-cron.sh

echo "✅ All management scripts created!"