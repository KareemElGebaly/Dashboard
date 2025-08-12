#!/bin/bash

echo "🚀 Setting up GitHub Deployment for Cash Flow Dashboard"
echo "======================================================"

# Check if GitHub repository URL is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your GitHub repository URL"
    echo "Usage: ./github-deploy-setup.sh https://github.com/username/repository.git"
    exit 1
fi

REPO_URL=$1
PROJECT_DIR="/var/www/dashboard"

echo "📂 Repository: $REPO_URL"
echo "📍 Deploy Directory: $PROJECT_DIR"

# Install Git if not already installed
echo "📦 Installing Git..."
apt update
apt install -y git

# Remove existing directory if it exists
if [ -d "$PROJECT_DIR" ]; then
    echo "🗑️  Removing existing directory..."
    rm -rf $PROJECT_DIR
fi

# Clone the repository
echo "📥 Cloning repository..."
git clone $REPO_URL $PROJECT_DIR

# Navigate to project directory
cd $PROJECT_DIR

# Install Node.js dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Set proper permissions
echo "🔒 Setting permissions..."
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

echo "✅ GitHub deployment setup completed!"
echo "📁 Project cloned to: $PROJECT_DIR"
echo "🌐 Ready for Nginx configuration"