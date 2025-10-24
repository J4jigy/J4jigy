import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
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
import OtherExpenses from './components/OtherExpenses';
import BillsInvoices from './components/BillsInvoices';
import Bank from './components/Bank';
import CashEnhanced from './components/CashEnhanced';
import PayablesYouWillGive from './components/PayablesYouWillGive';
import ReceivablesYouWillReceive from './components/ReceivablesYouWillReceive';
import OffersDiscounts from './components/OffersDiscounts';
import CalendarReminder from './components/CalendarReminder';
import Calculator from './components/Calculator';
import { BusinessProvider } from './contexts/BusinessContext';
import { RoleProvider } from './contexts/RoleContext';

const API = process.env.REACT_APP_BACKEND_URL || '/api';

// Login Component
const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    businessName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBusinessSetup, setShowBusinessSetup] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const form = new URLSearchParams();
      form.append('username', formData.username);
      form.append('password', formData.password);
      
      const response = await axios.post(`${API}/api/auth/login`, form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      // Check if this is first time login (no business name set)
      const userBusinessKey = `user_${formData.username}_business_created`;
      const hasBusinessSetup = localStorage.getItem(userBusinessKey);
      const existingBusinessName = localStorage.getItem('user_business_name');
      
      if (!hasBusinessSetup && !existingBusinessName) {
        // First time login - show business setup
        setPendingLoginData({
          token: response.data.access_token,
          user: response.data.user
        });
        setShowBusinessSetup(true);
        setLoading(false);
      } else {
        // Already has business - login directly
        onLogin(response.data.access_token, response.data.user);
      }
    } catch (error) {
      const detail = error.response?.data?.detail;
      const message = detail || 'Login failed';
      setError(message);
      setLoading(false);
    }
  };

  const handleBusinessSetup = () => {
    if (!formData.businessName.trim()) {
      setError('Please enter your business name');
      return;
    }
    
    onLogin(pendingLoginData.token, pendingLoginData.user, formData.businessName);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          {!showBusinessSetup ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">{isSignup ? 'Sign Up' : 'Sign In'}</h1>
                <p className="text-slate-400">
                  {isSignup ? 'Create your account and start managing your business' : 'Access your financial dashboard'}
                </p>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-100 px-4 py-2 rounded-md mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={isSignup ? handleSignup : handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-slate-200">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                {isSignup && (
                  <div>
                    <Label htmlFor="email" className="text-slate-200">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="password" className="text-slate-200">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                {isSignup && (
                  <div>
                    <Label htmlFor="businessName" className="text-slate-200">Business Name</Label>
                    <Input
                      id="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                      required
                      placeholder="Enter your business name"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <p className="text-xs text-slate-400 mt-1">This will appear on your dashboard</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full ${isSignup ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
                </Button>
              </form>

              <div className="mt-4 text-center text-slate-400 text-sm">
                {isSignup ? (
                  <>Already have an account? <button onClick={() => setIsSignup(false)} className="text-blue-400 hover:text-blue-300">Sign in here</button></>
                ) : (
                  <>Need an account? <button onClick={() => setIsSignup(true)} className="text-blue-400 hover:text-blue-300">Register here</button></>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">Setup Your Business</h1>
                <p className="text-slate-400">Let's get started with your business details</p>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-100 px-4 py-2 rounded-md mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName" className="text-slate-200">Business Name *</Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Enter your business name"
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                  <p className="text-xs text-slate-400 mt-1">This will appear on your dashboard</p>
                </div>

                <Button 
                  onClick={handleBusinessSetup}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Continue to Dashboard
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing user:', e);
        }
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

  const handleLogin = (newToken, newUser, businessName = null) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // If business name is provided, create a new business and clear defaults
    if (businessName && businessName.trim()) {
      const userBusinessKey = `user_${newUser.username}_business_created`;
      localStorage.setItem(userBusinessKey, 'true');
      localStorage.setItem('user_business_name', businessName.trim());
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
            <Route path="/other-expenses" element={token ? <OtherExpenses /> : <Navigate to="/login" />} />
            <Route path="/bills-invoices" element={token ? <BillsInvoices /> : <Navigate to="/login" />} />
            <Route path="/receivables-you-will-receive" element={token ? <ReceivablesYouWillReceive /> : <Navigate to="/login" />} />
            <Route path="/payables-you-will-give" element={token ? <PayablesYouWillGive /> : <Navigate to="/login" />} />
            <Route path="/offers-discounts" element={token ? <OffersDiscounts /> : <Navigate to="/login" />} />
            <Route path="/calendar" element={token ? <CalendarReminder /> : <Navigate to="/login" />} />
            <Route path="/calculator" element={token ? <Calculator /> : <Navigate to="/login" />} />
          </Routes>
        </Router>
      </RoleProvider>
    </BusinessProvider>
  );
}

export default App;