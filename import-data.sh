#!/bin/bash

echo "📥 Import Data to SQLite Database"
echo "================================="

if [ -z "$1" ]; then
    echo "❌ Please provide the JSON export file"
    echo "Usage: ./import-data.sh /path/to/dashboard-data-export.json"
    exit 1
fi

JSON_FILE="$1"
DB_PATH="/var/www/dashboard/database/cashflow.db"

if [ ! -f "$JSON_FILE" ]; then
    echo "❌ File not found: $JSON_FILE"
    exit 1
fi

echo "📁 Importing data from: $JSON_FILE"
echo "📍 Into database: $DB_PATH"

# Install jq for JSON parsing if not installed
if ! command -v jq &> /dev/null; then
    echo "📦 Installing jq for JSON parsing..."
    apt install -y jq
fi

# Extract data from JSON
CREDITORS=$(jq -r '.creditors[]' "$JSON_FILE")
EXPENSES=$(jq -r '.expenses[]' "$JSON_FILE")
CREDITOR_TYPES=$(jq -r '.creditorTypes[]' "$JSON_FILE")
SETTINGS=$(jq -r '.cashFlowSettings' "$JSON_FILE")
USERS=$(jq -r '.invitedUsers[]' "$JSON_FILE")

echo "🔄 Starting import process..."

# Import creditor types
echo "📋 Importing creditor types..."
jq -r '.creditorTypes[]' "$JSON_FILE" | while read -r type; do
    sqlite3 "$DB_PATH" "INSERT OR IGNORE INTO creditor_types (name, user_id) VALUES ('$type', 'admin');"
done

# Import creditors
echo "🏢 Importing creditors..."
jq -c '.creditors[]' "$JSON_FILE" | while read -r creditor; do
    id=$(echo "$creditor" | jq -r '.id')
    name=$(echo "$creditor" | jq -r '.name')
    type=$(echo "$creditor" | jq -r '.type')
    contact_info=$(echo "$creditor" | jq -r '.contactInfo // ""')
    total_owed=$(echo "$creditor" | jq -r '.totalOwed // 0')
    
    sqlite3 "$DB_PATH" "INSERT OR REPLACE INTO creditors (id, name, type, contact_info, total_owed, user_id) VALUES ('$id', '$name', '$type', '$contact_info', $total_owed, 'admin');"
done

# Import expenses
echo "💰 Importing expenses..."
jq -c '.expenses[]' "$JSON_FILE" | while read -r expense; do
    id=$(echo "$expense" | jq -r '.id')
    amount=$(echo "$expense" | jq -r '.amount')
    due_date=$(echo "$expense" | jq -r '.dueDate')
    payment_method=$(echo "$expense" | jq -r '.paymentMethod')
    creditor_id=$(echo "$expense" | jq -r '.creditorId')
    note=$(echo "$expense" | jq -r '.note // ""')
    
    sqlite3 "$DB_PATH" "INSERT OR REPLACE INTO expenses (id, amount, due_date, payment_method, creditor_id, note, user_id) VALUES ('$id', $amount, '$due_date', '$payment_method', '$creditor_id', '$note', 'admin');"
done

# Import settings
echo "⚙️ Importing cash flow settings..."
cash_on_hand=$(jq -r '.cashFlowSettings.cashOnHand // 0' "$JSON_FILE")
bank_balance=$(jq -r '.cashFlowSettings.bankBalance // 0' "$JSON_FILE")
daily_income=$(jq -r '.cashFlowSettings.dailyIncome // 0' "$JSON_FILE")

sqlite3 "$DB_PATH" "INSERT OR REPLACE INTO cash_flow_settings (user_id, cash_on_hand, bank_balance, daily_income) VALUES ('admin', $cash_on_hand, $bank_balance, $daily_income);"

# Import invited users
echo "👥 Importing invited users..."
jq -c '.invitedUsers[]?' "$JSON_FILE" | while read -r user; do
    if [ "$user" != "null" ]; then
        id=$(echo "$user" | jq -r '.id')
        email=$(echo "$user" | jq -r '.email')
        name=$(echo "$user" | jq -r '.name')
        role=$(echo "$user" | jq -r '.role // "user"')
        invited_by=$(echo "$user" | jq -r '.invitedBy // "admin"')
        created_at=$(echo "$user" | jq -r '.createdAt')
        
        sqlite3 "$DB_PATH" "INSERT OR REPLACE INTO users (id, email, name, role, invited_by, created_at) VALUES ('$id', '$email', '$name', '$role', '$invited_by', '$created_at');"
    fi
done

echo "✅ Data import completed successfully!"
echo ""
echo "📊 Import Summary:"
sqlite3 "$DB_PATH" "SELECT 'Users: ' || COUNT(*) FROM users;"
sqlite3 "$DB_PATH" "SELECT 'Creditors: ' || COUNT(*) FROM creditors;"
sqlite3 "$DB_PATH" "SELECT 'Expenses: ' || COUNT(*) FROM expenses;"
sqlite3 "$DB_PATH" "SELECT 'Total Amount: $' || COALESCE(SUM(amount), 0) FROM expenses;"

echo ""
echo "🔍 To verify data:"
echo "  ./database-manager.sh view"
echo "  ./database-manager.sh stats"