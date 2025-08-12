#!/bin/bash

echo "🚀 Complete GitHub Deployment Setup for Ubuntu 24.04 LTS"
echo "========================================================="

# Check if GitHub repository URL is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your GitHub repository URL"
    echo "Usage: ./complete-github-setup.sh https://github.com/username/repository.git [domain.com]"
    exit 1
fi

REPO_URL=$1
DOMAIN=${2:-"your-domain.com"}

echo "📂 Repository: $REPO_URL"
echo "🌐 Domain: $DOMAIN"

# Update system
echo "🔄 Updating system..."
apt update && apt upgrade -y

# Install essential packages
echo "📦 Installing essential packages..."
apt install -y curl wget git vim nano htop unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release nginx ufw fail2ban

# Configure firewall
echo "🛡️  Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 7777  # For webhook

# Install Node.js 20.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Verify installations
echo "✅ Verifying installations..."
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "Nginx version: $(nginx -v 2>&1)"

# Start and enable services
systemctl start nginx
systemctl enable nginx

# Deploy from GitHub
echo "📥 Deploying from GitHub..."
PROJECT_DIR="/var/www/dashboard"

# Remove existing directory if it exists
if [ -d "$PROJECT_DIR" ]; then
    rm -rf $PROJECT_DIR
fi

# Clone repository
git clone $REPO_URL $PROJECT_DIR
cd $PROJECT_DIR

# Install dependencies and build
npm install
npm run build

# Set permissions
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/dashboard << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    root /var/www/dashboard/dist;
    index index.html;
    
    # Handle React Router (SPA)
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Optimize static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Hide Nginx version
    server_tokens off;
    
    # Prevent access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx

# Install SSL
echo "🔒 Installing SSL certificate..."
apt install -y certbot python3-certbot-nginx

# Setup SSL (will prompt for email)
if [ "$DOMAIN" != "your-domain.com" ]; then
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
fi

# Create deployment scripts
echo "📝 Creating deployment scripts..."

# Auto-deploy script
cat > /root/auto-deploy.sh << 'EOF'
#!/bin/bash
PROJECT_DIR="/var/www/dashboard"
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cd $PROJECT_DIR

echo "💾 Creating backup..."
tar -czf $BACKUP_DIR/dashboard_backup_$DATE.tar.gz -C /var/www dashboard

echo "📥 Pulling latest changes..."
git fetch origin
git reset --hard origin/main

echo "📦 Installing dependencies..."
npm ci --production

echo "🔨 Building project..."
npm run build

echo "🔒 Setting permissions..."
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

nginx -t && systemctl reload nginx

echo "✅ Deployment completed!"
find $BACKUP_DIR -name "dashboard_backup_*.tar.gz" -type f | sort -r | tail -n +6 | xargs rm -f
EOF

chmod +x /root/auto-deploy.sh

# Manual deploy script
cat > /root/deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Manual deployment started..."
/root/auto-deploy.sh
echo "📊 Checking status..."
systemctl status nginx --no-pager -l
echo "🌐 Dashboard available at: https://your-configured-domain"
EOF

chmod +x /root/deploy.sh

# Monitoring script
cat > /root/status.sh << 'EOF'
#!/bin/bash
echo "📊 System Status Report"
echo "======================"
echo "🖥️  System: $(lsb_release -d | cut -f2)"
echo "⏰ Uptime: $(uptime -p)"
echo "💾 Disk: $(df -h / | tail -1 | awk '{print $3"/"$2" ("$5" used)"}')"
echo "🧠 Memory: $(free -h | grep Mem | awk '{print $3"/"$2" ("int($3/$2*100)"% used)"}')"
echo "🌐 Nginx: $(systemctl is-active nginx)"
echo "🔥 Firewall: $(ufw status | head -1 | awk '{print $2}')"
echo ""
echo "📈 Recent Access (last 5):"
tail -5 /var/log/nginx/access.log 2>/dev/null || echo "No access logs yet"
EOF

chmod +x /root/status.sh

# Create log directories
mkdir -p /var/log/dashboard
chown -R www-data:www-data /var/log/dashboard

# Setup automatic backups
echo "⏰ Setting up automated tasks..."
(crontab -l 2>/dev/null; echo "# Daily backup at 2 AM") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * /root/auto-deploy.sh >> /var/log/dashboard/deploy.log 2>&1") | crontab -

echo ""
echo "🎉 GitHub Deployment Setup Complete!"
echo "===================================="
echo ""
echo "✅ Your dashboard is deployed from: $REPO_URL"
echo "🌐 Available at: http://$DOMAIN"
if [ "$DOMAIN" != "your-domain.com" ]; then
    echo "🔒 SSL configured for: https://$DOMAIN"
fi
echo ""
echo "📋 Management Commands:"
echo "  /root/deploy.sh     - Manual deployment"
echo "  /root/status.sh     - System status"
echo "  /root/auto-deploy.sh - Auto deployment (used by cron)"
echo ""
echo "🔄 To update your dashboard:"
echo "  1. Push changes to your GitHub repository"
echo "  2. Run: /root/deploy.sh"
echo ""
echo "🔗 Optional: Setup webhook for automatic deployments"
echo "  Run: ./webhook-deploy.sh"