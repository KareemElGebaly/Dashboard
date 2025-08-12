#!/bin/bash

echo "🌐 Configuring Nginx for Cash Flow Dashboard"
echo "============================================="

# Remove default Nginx site
rm -f /etc/nginx/sites-enabled/default

# Create Nginx configuration for dashboard
cat > /etc/nginx/sites-available/dashboard << 'EOF'
server {
    listen 80;
    server_name _;  # Replace with your domain
    
    root /var/www/dashboard/dist;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
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
    
    # API routes (if needed in future)
    location /api/ {
        # Proxy to Node.js backend if needed
        # proxy_pass http://localhost:3001;
        # proxy_http_version 1.1;
        # proxy_set_header Upgrade $http_upgrade;
        # proxy_set_header Connection 'upgrade';
        # proxy_set_header Host $host;
        # proxy_cache_bypass $http_upgrade;
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
    
    # Prevent access to backup files
    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Reload Nginx
    systemctl reload nginx
    
    echo "🌐 Nginx configured successfully!"
    echo "📍 Your dashboard is now available at: http://your-server-ip"
else
    echo "❌ Nginx configuration has errors. Please check the configuration."
fi