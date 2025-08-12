#!/bin/bash

echo "🔧 Fixing Git Repository Issues"
echo "==============================="

# Fix ownership issues
echo "🔒 Fixing repository ownership..."
chown -R root:root /var/www/dashboard

# Add safe directory
echo "🛡️ Adding safe directory..."
git config --global --add safe.directory /var/www/dashboard

# Navigate to project directory
cd /var/www/dashboard

# Check git status
echo "📊 Checking git status..."
git status

# Check if there are changes to commit
if git diff --quiet && git diff --cached --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "📋 Changes detected, preparing commit..."
    
    # Add all changes
    echo "📤 Adding changes to git..."
    git add .
    
    # Show what will be committed (compatible with older git)
    echo "📋 Files to be committed:"
    git diff --cached --name-only
    
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
else
    echo "ℹ️  Repository is up to date"
fi

echo ""
echo "🎉 Git repository fixed and updated!"
echo "📋 Next steps:"
echo "1. Run deployment: ./deploy-with-database.sh"
echo "2. Test your dashboard: https://dashboard.letsvape.online"