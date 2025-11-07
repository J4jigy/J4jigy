#!/bin/bash
# Script to identify top-right Add buttons in components
echo "Checking components for Add buttons..."

components=(
  "SuppliersCreditors.js"
  "CompanyPurchase.js"
  "StockManagement.js"
  "StaffManagement.js"
  "Challan.js"
  "BillsInvoices.js"
  "Bank.js"
  "Cash.js"
  "BillsRecharge.js"
  "Rent.js"
  "TransportationExpense.js"
  "OtherExpenses.js"
  "OffersDiscounts.js"
)

for comp in "${components[@]}"; do
  file="/app/frontend/src/components/$comp"
  if [ -f "$file" ]; then
    echo "\nComponent: $comp"
    grep -n "Add" "$file" | head -5
  fi
done
