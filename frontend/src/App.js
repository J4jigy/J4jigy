import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Cash from './components/Cash';
import ListViewPage from './components/ListViewPage';
import CashInEntry from './components/CashInEntry';
import CashOutEntry from './components/CashOutEntry';
import FuelDispenser from './components/FuelDispenser';
import FuelDispenserDetails from './components/FuelDispenserDetails';
import ToDoList from './components/ToDoList';
import StaffPage from './components/StaffPage';
import StaffManagementPage from './components/StaffManagementPage';
import PayrollManagement from './components/PayrollManagement';
import BalanceSheet from './components/BalanceSheet';
import ProfitLoss from './components/ProfitLoss';
import DailySalesReport from './components/DailySalesReport';
import CommunityRatings from './components/CommunityRatings';
import CustomersDebtors from './components/CustomersDebtors';
import SuppliersCreditors from './components/SuppliersCreditors';
import StockManagement from './components/StockManagement';
import CompanyPurchase from './components/CompanyPurchase';
import BillsRecharge from './components/BillsRecharge';
import Rent from './components/Rent';
import TransportationExpense from './components/TransportationExpense';
import OtherExpenses from './components/OtherExpenses';
import BillsInvoices from './components/BillsInvoices';
import Challan from './components/Challan';
import Bank from './components/Bank';
import CashEnhanced from './components/CashEnhanced';
import PayablesYouWillGive from './components/PayablesYouWillGive';
import ReceivablesYouWillReceive from './components/ReceivablesYouWillReceive';
import OffersDiscounts from './components/OffersDiscounts';
import CalendarReminder from './components/CalendarReminder';
import Calculator from './components/Calculator';
import ScanDocuments from './components/ScanDocuments';
import { BusinessProvider } from './contexts/BusinessContext';
import { RoleProvider } from './contexts/RoleContext';

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : '/api';

// Login removed - will be developed later

function App() {
  // Login removed - direct access to dashboard
  // Will be developed later
  const [user] = useState(null);

  const handleLogout = () => {
    // Logout functionality will be implemented later
    console.log('Logout - to be implemented');
  };

  return (
    <BusinessProvider>
      <RoleProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard onLogout={handleLogout} user={user} />} />
            <Route path="/admin" element={<AdminDashboard user={user} />} />
            <Route path="/list/cash" element={<Cash />} />
            <Route path="/cash-enhanced" element={<CashEnhanced />} />
            <Route path="/bank" element={<Bank />} />
            <Route path="/list/:key" element={<ListViewPage />} />
            <Route path="/cash-in" element={<CashInEntry />} />
            <Route path="/cash-out" element={<CashOutEntry />} />
            <Route path="/fuel-dispenser" element={<FuelDispenser />} />
            <Route path="/fuel-dispenser/:dispenserId" element={<FuelDispenserDetails />} />
            <Route path="/todo" element={<ToDoList />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/staff-management" element={<StaffManagementPage />} />
            <Route path="/payroll-management" element={<PayrollManagement />} />
            <Route path="/balance-sheet" element={<BalanceSheet />} />
            <Route path="/profit-loss" element={<ProfitLoss />} />
            <Route path="/daily-sales-report" element={<DailySalesReport />} />
            <Route path="/community-ratings" element={<CommunityRatings />} />
            <Route path="/customers-debtors" element={<CustomersDebtors />} />
            <Route path="/suppliers-creditors" element={<SuppliersCreditors />} />
            <Route path="/stock-management" element={<StockManagement />} />
            <Route path="/company-purchase" element={<CompanyPurchase />} />
            <Route path="/bills-recharge" element={<BillsRecharge />} />
            <Route path="/rent-management" element={<Rent />} />
            <Route path="/transport-expense" element={<TransportationExpense />} />
            <Route path="/other-expenses" element={<OtherExpenses />} />
            <Route path="/challan" element={<Challan />} />
            <Route path="/bills-invoices" element={<BillsInvoices />} />
            <Route path="/receivables-you-will-receive" element={<ReceivablesYouWillReceive />} />
            <Route path="/payables-you-will-give" element={<PayablesYouWillGive />} />
            <Route path="/offers-discounts" element={<OffersDiscounts />} />
            <Route path="/calendar" element={<CalendarReminder />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/scan-documents" element={<ScanDocuments />} />
          </Routes>
        </Router>
      </RoleProvider>
    </BusinessProvider>
  );
}

export default App;