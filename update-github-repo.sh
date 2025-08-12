#!/bin/bash

echo "📤 Updating GitHub Repository with SQLite Changes"
echo "================================================"

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from your project directory"
    echo "Usage: cd /var/www/dashboard && ./update-github-repo.sh"
    exit 1
fi

echo "📁 Current directory: $(pwd)"

# Check git status
echo "📊 Checking git status..."
git status

# Add all changes
echo "📤 Adding changes to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
    exit 0
fi

# Show what will be committed
echo "📋 Changes to be committed:"
git diff --staged --name-only

# Commit changes
echo "💾 Committing changes..."
git commit -m "Update dashboard to use SQLite database

- Add SQLite database integration
- Replace localStorage with database storage
- Add database API layer and hooks
- Update all components to use database
- Add user management with database
- Implement proper data persistence
- Add database management tools"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed changes to GitHub!"
    echo "🔗 Repository updated: $(git remote get-url origin)"
else
    echo "❌ Failed to push to GitHub"
    echo "Please check your git configuration and try again"
    exit 1
fi

echo ""
echo "🎉 GitHub repository updated successfully!"
echo "📋 Next steps:"
echo "1. Run deployment: /root/deploy-with-database.sh"
echo "2. Test your dashboard: https://dashboard.letsvape.online"