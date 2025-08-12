# 🚀 GitHub Deployment Guide for Cash Flow Dashboard

## Prerequisites
- Fresh Ubuntu 24.04 LTS DigitalOcean Droplet
- GitHub repository with your dashboard code
- Domain name pointed to your droplet IP

## 🎯 Quick Deployment (One Command)

```bash
# Download and run the complete setup
wget https://raw.githubusercontent.com/your-username/your-repo/main/complete-github-setup.sh
chmod +x complete-github-setup.sh
./complete-github-setup.sh https://github.com/your-username/your-repo.git yourdomain.com
```

## 📋 Step-by-Step Deployment

### 1. **Prepare Your GitHub Repository**

Make sure your repository has these files in the root:
- `package.json`
- `src/` directory with all your React components
- `index.html`
- `vite.config.ts`
- `tailwind.config.js`

### 2. **Connect to Your Droplet**
```bash
ssh root@your-droplet-ip
```

### 3. **Download Setup Scripts**
```bash
# Download all setup scripts
wget https://raw.githubusercontent.com/your-username/your-repo/main/complete-github-setup.sh
wget https://raw.githubusercontent.com/your-username/your-repo/main/auto-deploy.sh
wget https://raw.githubusercontent.com/your-username/your-repo/main/webhook-deploy.sh

# Make them executable
chmod +x *.sh
```

### 4. **Run Complete Setup**
```bash
# Replace with your actual repository URL and domain
./complete-github-setup.sh https://github.com/your-username/cash-flow-dashboard.git yourdomain.com
```

This will:
- ✅ Install all required packages (Node.js, Nginx, etc.)
- ✅ Configure firewall and security
- ✅ Clone your repository
- ✅ Build and deploy your dashboard
- ✅ Configure Nginx with SSL
- ✅ Set up automated backups

### 5. **Optional: Setup Automatic Deployments**
```bash
# Setup webhook for automatic deployments on git push
./webhook-deploy.sh
```

## 🔧 Management Commands

After deployment, you'll have these commands available:

```bash
# Manual deployment (pull latest changes and deploy)
/root/deploy.sh

# Check system status
/root/status.sh

# View deployment logs
tail -f /var/log/dashboard/deploy.log

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🔄 Updating Your Dashboard

### Method 1: Manual Update
```bash
# On your server
/root/deploy.sh
```

### Method 2: Automatic Updates (with webhook)
1. Push changes to your GitHub repository
2. Webhook automatically triggers deployment
3. Your dashboard updates within seconds

## 🔗 GitHub Webhook Setup

If you set up the webhook, configure it in GitHub:

1. Go to your repository → Settings → Webhooks
2. Click "Add webhook"
3. **Payload URL**: `http://yourdomain.com:7777/webhook`
4. **Content type**: `application/json`
5. **Secret**: `your-webhook-secret-here`
6. **Events**: Just the push event
7. **Active**: ✅ Checked

## 🛡️ Security Features

Your deployment includes:
- 🔥 UFW Firewall configured
- 🔒 SSL certificate with auto-renewal
- 🛡️ Fail2ban for intrusion prevention
- 🔐 Security headers in Nginx
- 💾 Automated daily backups
- 🧹 Log rotation and cleanup

## 📊 Monitoring

Check your dashboard status:
```bash
# System overview
/root/status.sh

# Detailed service status
systemctl status nginx
systemctl status github-webhook  # if webhook is setup

# Check SSL certificate
certbot certificates

# Monitor real-time access
tail -f /var/log/nginx/access.log
```

## 🚨 Troubleshooting

### Common Issues:

**1. Build fails:**
```bash
cd /var/www/dashboard
npm install
npm run build
```

**2. Nginx errors:**
```bash
nginx -t  # Test configuration
systemctl restart nginx
```

**3. SSL issues:**
```bash
certbot renew --dry-run
```

**4. Permission issues:**
```bash
chown -R www-data:www-data /var/www/dashboard
chmod -R 755 /var/www/dashboard
```

**5. Webhook not working:**
```bash
systemctl status github-webhook
systemctl restart github-webhook
```

## 📈 Performance Optimization

Your deployment includes:
- ✅ Gzip compression
- ✅ Static asset caching
- ✅ Optimized Nginx configuration
- ✅ Production build optimization

## 🔄 Backup and Recovery

**Automatic backups** run daily at 2 AM and are stored in `/root/backups/`

**Manual backup:**
```bash
cd /var/www
tar -czf dashboard-backup-$(date +%Y%m%d).tar.gz dashboard
```

**Restore from backup:**
```bash
cd /var/www
rm -rf dashboard
tar -xzf /root/backups/dashboard_backup_YYYYMMDD_HHMMSS.tar.gz
systemctl reload nginx
```

## 🎉 Your Dashboard is Live!

After successful deployment:
- 🌐 **HTTP**: `http://yourdomain.com`
- 🔒 **HTTPS**: `https://yourdomain.com`
- 👤 **Admin Login**: `kareem@letsvape.ae`
- 🔑 **Authentication**: OTP-based login

Your Cash Flow Dashboard is now production-ready with automatic deployments from GitHub!