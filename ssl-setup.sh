#!/bin/bash

echo "🔒 Setting up SSL Certificate"
echo "=============================="

# Check if domain is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your domain name"
    echo "Usage: ./ssl-setup.sh yourdomain.com"
    exit 1
fi

DOMAIN=$1

echo "🌐 Setting up SSL for domain: $DOMAIN"

# Update Nginx configuration with actual domain
sed -i "s/server_name _;/server_name $DOMAIN www.$DOMAIN;/" /etc/nginx/sites-available/dashboard

# Test Nginx configuration
nginx -t

if [ $? -eq 0 ]; then
    # Reload Nginx
    systemctl reload nginx
    
    echo "📜 Obtaining SSL certificate..."
    
    # Get SSL certificate
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL certificate installed successfully!"
        echo "🌐 Your dashboard is now available at: https://$DOMAIN"
        
        # Setup auto-renewal
        echo "⏰ Setting up automatic certificate renewal..."
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        echo "✅ Auto-renewal configured!"
    else
        echo "❌ Failed to obtain SSL certificate"
        echo "Make sure your domain points to this server's IP address"
    fi
else
    echo "❌ Nginx configuration has errors"
fi