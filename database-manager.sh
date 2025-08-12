#!/bin/bash

DB_PATH="/var/www/dashboard/database/cashflow.db"

echo "🗄️ SQLite Database Manager"
echo "=========================="

case "$1" in
    "view")
        echo "📊 Database Tables:"
        sqlite3 $DB_PATH ".tables"
        echo ""
        echo "👥 Users:"
        sqlite3 $DB_PATH "SELECT id, email, name, role FROM users;"
        echo ""
        echo "🏢 Creditors:"
        sqlite3 $DB_PATH "SELECT id, name, type, total_owed FROM creditors LIMIT 10;"
        echo ""
        echo "💰 Expenses:"
        sqlite3 $DB_PATH "SELECT id, amount, due_date, payment_method FROM expenses LIMIT 10;"
        ;;
    "backup")
        BACKUP_DIR="/root/backups"
        DATE=$(date +%Y%m%d_%H%M%S)
        mkdir -p $BACKUP_DIR
        cp $DB_PATH $BACKUP_DIR/cashflow_backup_$DATE.db
        echo "✅ Database backed up to: $BACKUP_DIR/cashflow_backup_$DATE.db"
        ;;
    "restore")
        if [ -z "$2" ]; then
            echo "❌ Please provide backup file path"
            echo "Usage: ./database-manager.sh restore /path/to/backup.db"
            exit 1
        fi
        cp "$2" $DB_PATH
        chown www-data:www-data $DB_PATH
        chmod 664 $DB_PATH
        echo "✅ Database restored from: $2"
        ;;
    "shell")
        echo "🔧 Opening SQLite shell..."
        echo "Useful commands:"
        echo "  .tables          - List all tables"
        echo "  .schema          - Show table schemas"
        echo "  .quit            - Exit"
        echo ""
        sqlite3 $DB_PATH
        ;;
    "stats")
        echo "📊 Database Statistics:"
        echo "Users: $(sqlite3 $DB_PATH 'SELECT COUNT(*) FROM users;')"
        echo "Creditors: $(sqlite3 $DB_PATH 'SELECT COUNT(*) FROM creditors;')"
        echo "Expenses: $(sqlite3 $DB_PATH 'SELECT COUNT(*) FROM expenses;')"
        echo "Total Expenses Amount: $(sqlite3 $DB_PATH 'SELECT COALESCE(SUM(amount), 0) FROM expenses;')"
        echo ""
        echo "💾 Database file size: $(du -h $DB_PATH | cut -f1)"
        ;;
    *)
        echo "Usage: ./database-manager.sh [command]"
        echo ""
        echo "Commands:"
        echo "  view     - View database contents"
        echo "  backup   - Create database backup"
        echo "  restore  - Restore from backup"
        echo "  shell    - Open SQLite shell"
        echo "  stats    - Show database statistics"
        echo ""
        echo "Examples:"
        echo "  ./database-manager.sh view"
        echo "  ./database-manager.sh backup"
        echo "  ./database-manager.sh shell"
        ;;
esac