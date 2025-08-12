#!/bin/bash

echo "🔗 Setting up GitHub Webhook Auto-Deployment"
echo "============================================="

# Install webhook handler
echo "📦 Installing webhook..."
npm install -g github-webhook-handler

# Create webhook directory
mkdir -p /opt/webhook
cd /opt/webhook

# Create webhook server
cat > webhook-server.js << 'EOF'
const http = require('http');
const createHandler = require('github-webhook-handler');
const { exec } = require('child_process');

// Create webhook handler with your secret
const handler = createHandler({ path: '/webhook', secret: 'your-webhook-secret-here' });

// Create HTTP server
http.createServer((req, res) => {
  handler(req, res, (err) => {
    res.statusCode = 404;
    res.end('no such location');
  });
}).listen(7777);

console.log('🔗 Webhook server listening on port 7777');

// Handle push events
handler.on('push', (event) => {
  console.log('📥 Received push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref);
    
  // Only deploy on push to main branch
  if (event.payload.ref === 'refs/heads/main') {
    console.log('🚀 Deploying...');
    
    exec('/root/auto-deploy.sh', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Deployment failed:', error);
        return;
      }
      console.log('✅ Deployment output:', stdout);
      if (stderr) console.error('⚠️  Deployment warnings:', stderr);
    });
  }
});

handler.on('error', (err) => {
  console.error('❌ Webhook error:', err.message);
});
EOF

# Create systemd service for webhook
cat > /etc/systemd/system/github-webhook.service << 'EOF'
[Unit]
Description=GitHub Webhook Handler
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/webhook
ExecStart=/usr/bin/node webhook-server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Enable and start webhook service
systemctl daemon-reload
systemctl enable github-webhook
systemctl start github-webhook

# Configure firewall for webhook
ufw allow 7777

echo "✅ Webhook setup completed!"
echo "🔗 Webhook URL: http://your-domain.com:7777/webhook"
echo "🔑 Secret: your-webhook-secret-here"
echo ""
echo "📋 To configure in GitHub:"
echo "1. Go to your repository settings"
echo "2. Click 'Webhooks' → 'Add webhook'"
echo "3. Payload URL: http://your-domain.com:7777/webhook"
echo "4. Content type: application/json"
echo "5. Secret: your-webhook-secret-here"
echo "6. Select 'Just the push event'"
echo "7. Check 'Active'"