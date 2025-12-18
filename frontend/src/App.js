import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
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

// Login Component - One-Click Demo Login
const LoginPage = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Attempting demo login...');
      
      // Demo login with pre-configured credentials
      const response = await axios.post(`${API}/auth/mobile-login`, {
        mobile: '+919999999999'
      });

      console.log('Demo login successful:', response.data);

      // Auto-enable remember me for demo account
      localStorage.setItem('rememberMe', 'true');
      
      onLogin(response.data.access_token, response.data.user);
    } catch (error) {
      console.error('Demo login error:', error);
      const detail = error.response?.data?.detail || error.response?.data?.error;
      const message = detail || 'Demo login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/90 border-slate-700 backdrop-blur-sm shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to Petrol Pump POS
            </h1>
            <p className="text-slate-300 text-lg">
              One-click access to your dashboard
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-100 px-4 py-3 rounded-md mb-6 text-center">
              {error}
            </div>
          )}

          <Button 
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing In...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span>Demo Login</span>
              </div>
            )}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              🔒 Instant access • No password required
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing user session and auto-login
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const rememberMe = localStorage.getItem('rememberMe');
    
    if (storedToken && storedUser && rememberMe === 'true') {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        // User will automatically see the dashboard without login
      } catch (error) {
        console.error('Error loading user session:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
      }
    }

    // Listen for storage changes (for logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        setToken(e.newValue);
      }
      if (e.key === 'user') {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch (err) {
          console.error('Error parsing user from storage event:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
  };

  return (
    <BusinessProvider>
      <RoleProvider>
        <Router>
          <Routes>
            <Route 
              path="/" 
              element={token ? <Dashboard onLogout={handleLogout} user={user} /> : <Navigate to="/login" />} 
            />
            <Route path="/login" element={!token ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/admin" element={token && (user?.role === 'admin' || user?.role === 'super_admin' || user?.is_admin) ? <AdminDashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/list/cash" element={token ? <Cash /> : <Navigate to="/login" />} />
            <Route path="/cash-enhanced" element={token ? <CashEnhanced /> : <Navigate to="/login" />} />
            <Route path="/bank" element={token ? <Bank /> : <Navigate to="/login" />} />
            <Route path="/list/:key" element={token ? <ListViewPage /> : <Navigate to="/login" />} />
            <Route path="/cash-in" element={token ? <CashInEntry /> : <Navigate to="/login" />} />
            <Route path="/cash-out" element={token ? <CashOutEntry /> : <Navigate to="/login" />} />
            <Route path="/fuel-dispenser" element={token ? <FuelDispenser /> : <Navigate to="/login" />} />
            <Route path="/fuel-dispenser/:dispenserId" element={token ? <FuelDispenserDetails /> : <Navigate to="/login" />} />
            <Route path="/todo" element={token ? <ToDoList /> : <Navigate to="/login" />} />
            <Route path="/staff" element={token ? <StaffPage /> : <Navigate to="/login" />} />
            <Route path="/staff-management" element={token ? <StaffManagementPage /> : <Navigate to="/login" />} />
            <Route path="/payroll-management" element={token ? <PayrollManagement /> : <Navigate to="/login" />} />
            <Route path="/balance-sheet" element={token ? <BalanceSheet /> : <Navigate to="/login" />} />
            <Route path="/profit-loss" element={token ? <ProfitLoss /> : <Navigate to="/login" />} />
            <Route path="/daily-sales-report" element={token ? <DailySalesReport /> : <Navigate to="/login" />} />
            <Route path="/community-ratings" element={token ? <CommunityRatings /> : <Navigate to="/login" />} />
            <Route path="/customers-debtors" element={token ? <CustomersDebtors /> : <Navigate to="/login" />} />
            <Route path="/suppliers-creditors" element={token ? <SuppliersCreditors /> : <Navigate to="/login" />} />
            <Route path="/stock-management" element={token ? <StockManagement /> : <Navigate to="/login" />} />
            <Route path="/company-purchase" element={token ? <CompanyPurchase /> : <Navigate to="/login" />} />
            <Route path="/bills-recharge" element={token ? <BillsRecharge /> : <Navigate to="/login" />} />
            <Route path="/rent-management" element={token ? <Rent /> : <Navigate to="/login" />} />
            <Route path="/transport-expense" element={token ? <TransportationExpense /> : <Navigate to="/login" />} />
            <Route path="/other-expenses" element={token ? <OtherExpenses /> : <Navigate to="/login" />} />
            <Route path="/challan" element={token ? <Challan /> : <Navigate to="/login" />} />
            <Route path="/bills-invoices" element={token ? <BillsInvoices /> : <Navigate to="/login" />} />
            <Route path="/receivables-you-will-receive" element={token ? <ReceivablesYouWillReceive /> : <Navigate to="/login" />} />
            <Route path="/payables-you-will-give" element={token ? <PayablesYouWillGive /> : <Navigate to="/login" />} />
            <Route path="/offers-discounts" element={token ? <OffersDiscounts /> : <Navigate to="/login" />} />
            <Route path="/calendar" element={token ? <CalendarReminder /> : <Navigate to="/login" />} />
            <Route path="/calculator" element={token ? <Calculator /> : <Navigate to="/login" />} />
            <Route path="/scan-documents" element={token ? <ScanDocuments /> : <Navigate to="/login" />} />
          </Routes>
        </Router>
      </RoleProvider>
    </BusinessProvider>
  );
}

export default App;