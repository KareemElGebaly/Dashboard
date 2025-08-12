#!/bin/bash

echo "🔧 Fixing Nginx Connection Issues"
echo "================================="

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt update
    apt install -y nginx
fi

# Stop nginx to fix any issues
echo "🛑 Stopping Nginx..."
systemctl stop nginx

# Remove any conflicting configurations
echo "🧹 Cleaning up configurations..."
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/dashboard

# Create proper dashboard configuration
echo "⚙️ Creating dashboard configuration..."
cat > /etc/nginx/sites-available/dashboard << 'EOF'
server {
    listen 80;
    server_name dashboard.letsvape.online www.dashboard.letsvape.online;
    
    root /var/www/dashboard/dist;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # API proxy to backend server
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Handle React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Optimize static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
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
    
    # Security: Hide Nginx version
    server_tokens off;
    
    # Prevent access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Enable the site
echo "🔗 Enabling dashboard site..."
ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/

# Test configuration
echo "🔧 Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuration is valid"
    
    # Start Nginx
    echo "🚀 Starting Nginx..."
    systemctl start nginx
    systemctl enable nginx
    
    # Check firewall
    echo "🛡️ Checking firewall..."
    ufw allow 80
    ufw allow 443
    ufw allow 'Nginx Full'
    
    # Check if dist directory exists
    if [ ! -d "/var/www/dashboard/dist" ]; then
        echo "📁 Building React app..."
        cd /var/www/dashboard
        npm run build
        chown -R www-data:www-data dist/
    fi
    
    echo "✅ Nginx setup completed!"
    echo "🌐 Your site should be accessible at: http://dashboard.letsvape.online"
    
else
    echo "❌ Nginx configuration has errors"
    exit 1
fi

# Show status
echo ""
echo "📊 Service Status:"
echo "Nginx: $(systemctl is-active nginx)"
echo "Backend: $(pm2 list | grep dashboard-backend | awk '{print $10}' || echo 'Not running')"

# Test local connection
echo ""
echo "🔍 Testing local connection..."
curl -I http://localhost 2>/dev/null | head -1 || echo "❌ Local connection failed"