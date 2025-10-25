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

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : '/api';

// Login Component
const LoginPage = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate name
    if (name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters)');
      setLoading(false);
      return;
    }

    // Validate mobile number
    if (mobileNumber.length !== 10 || !/^\d+$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    try {
      // Login request to backend
      const response = await axios.post(`${API}/auth/mobile-login`, {
        name: name.trim(),
        mobile: `${countryCode}${mobileNumber}`
      });

      // Login successfully - set remember me flag
      localStorage.setItem('rememberMe', 'true');
      onLogin(response.data.access_token, response.data.user);
    } catch (error) {
      const detail = error.response?.data?.detail || error.response?.data?.error;
      const message = detail || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while processing Google OAuth
  if (processingGoogle) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-white mb-2">Signing you in...</h2>
              <p className="text-slate-400">Please wait while we complete your Google login</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Sign In</h1>
            <p className="text-slate-400">
              Enter your name and mobile number to continue
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-100 px-4 py-2 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-slate-200">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="mt-1 bg-slate-700 border-slate-600 text-white"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="mobile" className="text-slate-200">Mobile Number</Label>
              <div className="flex gap-2 mt-1">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-24 bg-slate-700 border-slate-600 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+91">🇮🇳 +91</SelectItem>
                    <SelectItem value="+1">🇺🇸 +1</SelectItem>
                    <SelectItem value="+44">🇬🇧 +44</SelectItem>
                    <SelectItem value="+86">🇨🇳 +86</SelectItem>
                    <SelectItem value="+81">🇯🇵 +81</SelectItem>
                    <SelectItem value="+82">🇰🇷 +82</SelectItem>
                    <SelectItem value="+65">🇸🇬 +65</SelectItem>
                    <SelectItem value="+971">🇦🇪 +971</SelectItem>
                    <SelectItem value="+966">🇸🇦 +966</SelectItem>
                    <SelectItem value="+61">🇦🇺 +61</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="mobile"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter mobile number"
                  required
                  maxLength={10}
                  className="flex-1 bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">We'll remember you for future logins</p>
            </div>

            <Button 
              type="submit" 
              disabled={loading || name.trim().length < 2 || mobileNumber.length !== 10}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">OR</span>
            </div>
          </div>

          {/* Google Login Button */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={processingGoogle}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium border border-gray-300"
          >
            {processingGoogle ? (
              'Processing...'
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </div>
            )}
          </Button>

          <div className="mt-4 text-center text-slate-400 text-sm">
            Secure login with Google or mobile number
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