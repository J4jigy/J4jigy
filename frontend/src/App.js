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

const API = process.env.REACT_APP_BACKEND_URL || '/api';

// Login Component
const LoginPage = ({ onLogin }) => {
  const [step, setStep] = useState('mobile'); // 'mobile' or 'otp'
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate mobile number
    if (mobileNumber.length !== 10 || !/^\d+$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    try {
      // Send OTP request to backend
      await axios.post(`${API}/auth/send-otp`, {
        mobile: `${countryCode}${mobileNumber}`
      });

      setStep('otp');
      setError('');
    } catch (error) {
      const detail = error.response?.data?.detail;
      const message = detail || 'Failed to send OTP. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate OTP
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      // Verify OTP and login
      const response = await axios.post(`${API}/api/auth/verify-otp`, {
        mobile: mobileNumber,
        otp: otp
      });

      // Login successfully - set remember me flag
      localStorage.setItem('rememberMe', 'true');
      onLogin(response.data.access_token, response.data.user);
    } catch (error) {
      const detail = error.response?.data?.detail;
      const message = detail || 'Invalid OTP. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`${API}/api/auth/send-otp`, {
        mobile: mobileNumber
      });
      setError('');
      alert('OTP resent successfully!');
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Sign In</h1>
            <p className="text-slate-400">
              {step === 'mobile' ? 'Enter your mobile number to receive OTP' : 'Enter the OTP sent to your mobile'}
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-100 px-4 py-2 rounded-md mb-4">
              {error}
            </div>
          )}

          {step === 'mobile' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
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
                    className="flex-1 bg-slate-700 border-slate-600 text-white text-lg"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">We'll send you a 6-digit OTP</p>
              </div>

              <Button 
                type="submit" 
                disabled={loading || mobileNumber.length !== 10}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <Label htmlFor="otp" className="text-slate-200">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  required
                  maxLength={6}
                  className="bg-slate-700 border-slate-600 text-white text-center text-2xl tracking-widest"
                  autoFocus
                />
                <p className="text-xs text-slate-400 mt-1">OTP sent to {countryCode} {mobileNumber}</p>
              </div>

              <Button 
                type="submit" 
                disabled={loading || otp.length !== 6}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </Button>

              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setStep('mobile');
                    setOtp('');
                    setError('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  Change Number
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Resend OTP
                </Button>
              </div>
            </form>
          )}

          <div className="mt-4 text-center text-slate-400 text-sm">
            Secure login with mobile OTP verification
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