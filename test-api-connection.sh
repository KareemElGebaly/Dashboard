#!/bin/bash

echo "🔍 Testing API Connection and Database Updates"
echo "=============================================="

echo "1. Testing backend health..."
curl -s http://127.0.0.1:3001/api/health | jq . 2>/dev/null || curl -s http://127.0.0.1:3001/api/health

echo ""
echo "2. Testing creditors API..."
curl -s http://127.0.0.1:3001/api/creditors/admin | jq . 2>/dev/null || curl -s http://127.0.0.1:3001/api/creditors/admin

echo ""
echo "3. Testing expenses API..."
curl -s http://127.0.0.1:3001/api/expenses/admin | jq . 2>/dev/null || curl -s http://127.0.0.1:3001/api/expenses/admin

echo ""
echo "4. Current database totals vs calculated:"
sqlite3 /var/www/dashboard/database/cashflow.db "SELECT c.name, c.total_owed, COALESCE(SUM(e.amount), 0) as calculated_total FROM creditors c LEFT JOIN expenses e ON c.id = e.creditor_id GROUP BY c.id, c.name ORDER BY c.name;"

echo ""
echo "5. Backend server status:"
pm2 status | grep dashboard-backend

echo ""
echo "6. Recent backend logs:"
pm2 logs dashboard-backend --lines 5 --nostream