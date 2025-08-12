#!/bin/bash

echo "🔧 Fixing All Creditor Totals in Database"
echo "========================================="

DB_PATH="/var/www/dashboard/database/cashflow.db"

echo "📊 Before fix - Creditor totals vs calculated:"
sqlite3 $DB_PATH "SELECT c.name, c.total_owed, COALESCE(SUM(e.amount), 0) as calculated_total FROM creditors c LEFT JOIN expenses e ON c.id = e.creditor_id GROUP BY c.id, c.name ORDER BY c.name;"

echo ""
echo "🔄 Updating all creditor totals..."

# Update all creditor totals to match their actual expenses
sqlite3 $DB_PATH "UPDATE creditors SET total_owed = (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE creditor_id = creditors.id);"

echo ""
echo "✅ After fix - All creditor totals updated:"
sqlite3 $DB_PATH "SELECT c.name, c.total_owed, COALESCE(SUM(e.amount), 0) as calculated_total FROM creditors c LEFT JOIN expenses e ON c.id = e.creditor_id GROUP BY c.id, c.name ORDER BY c.name;"

echo ""
echo "🎉 All creditor totals are now synchronized!"