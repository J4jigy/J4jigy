import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Badge } from './components/ui/badge';
import { Home, UserCircle, Plus, Minus, CreditCard, Users, Building, TrendingUp, FileText, Package, PieChart, BarChart3, Gift, MessageCircle, Send, LogOut, Settings, Shield, ShieldCheck, Star, Truck, ShoppingCart, Zap, Coins, Receipt } from 'lucide-react';
import AdminDashboard from './components/AdminDashboard';
import CashInEntry from './components/CashInEntry';
import CashOutEntry from './components/CashOutEntry';
import Cash from './components/Cash';
import FuelDispenser from './components/FuelDispenser';
import FuelDispenserDetails from './components/FuelDispenserDetails';
import ListViewPage from './components/ListViewPage';
import Dashboard from './components/Dashboard';
import { BusinessProvider } from './contexts/BusinessContext';
import { RoleProvider } from './contexts/RoleContext';
import ToDoList from './components/ToDoList';


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
// Prefer same-origin when backend origin matches current origin to avoid CORS; use same-origin on preview by default
let API = `${BACKEND_URL}/api`;
try {
  const loc = typeof window !== 'undefined' ? window.location.origin : null;
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const sameOrigin = BACKEND_URL && loc && new URL(BACKEND_URL).origin === loc;
  const isPreview = host && host.endsWith('.preview.emergentagent.com');
  if (sameOrigin || isPreview) {
    API = '/api';
  }
} catch (_) {
  // fallback to env URL
}

// Auth Context
const AuthContext = React.createContext();

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token validity by fetching user data
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      await axios.get(`${API}/dashboard/summary`);
      setLoading(false);
    } catch (error) {
      logout();
    }
  };

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component
const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    business_name: '',
    invite_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('checking'); // checking | ok | fail
  const { login } = useAuth();

  // Health check on mount
  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        await axios.get(`${API}/ping`);
        if (active) setApiStatus('ok');
      } catch (e) {
        if (active) setApiStatus('fail');
        console.error('API ping failed:', e?.response?.status, e?.message);
      }
    };
    check();
    return () => { active = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { username: formData.username, password: formData.password }
        : formData;

      let response;
      const doLogin = async (base) => {
        if (isLogin) {
          const form = new URLSearchParams();
          form.append('username', formData.username);
          form.append('password', formData.password);
          return axios.post(`${base}${endpoint}`, form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        } else {
          return axios.post(`${base}${endpoint}`, payload);
        }
      };

      // Primary try: same-origin or env-based API
      try {
        response = await doLogin(API);
      } catch (e1) {
        // Fallback: explicitly use env backend URL if available and not already used
        const be = process.env.REACT_APP_BACKEND_URL;
        const alreadySame = API === '/api' && typeof window !== 'undefined' && be && new URL(be).origin === window.location.origin;
        if (be && !alreadySame) {
          response = await doLogin(`${be}/api`);
        } else {
          throw e1;
        }
      }

      login(response.data.user, response.data.access_token);
    } catch (error) {
      const detail = error.response?.data?.detail;
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const message = detail || (status ? `${status} ${statusText || ''}`.trim() : (error.message || 'An error occurred'));
      setError(message);
      if (error.response) {
        console.error('Login error response:', error.response);
      } else {
        console.error('Login error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          {/* API status banner */}
          {apiStatus !== 'ok' && (
            <div className={`mb-3 px-3 py-2 rounded text-sm ${apiStatus === 'fail' ? 'bg-red-900/60 text-red-100 border border-red-700' : 'bg-slate-700 text-slate-200'}`}>
              {apiStatus === 'checking' ? 'Checking server connectivity…' : 'Server connectivity issue detected. Try refresh or come back in a minute.'}
            </div>
          )}

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="text-slate-400">
              {isLogin ? 'Access your financial dashboard' : 'Join with invite code'}
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-100 px-4 py-2 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-slate-200">Username</Label>
              <Input
                id="username"
                data-testid="username-input"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="email" className="text-slate-200">Email</Label>
                  <Input
                    id="email"
                    data-testid="email-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="business_name" className="text-slate-200">Business Name</Label>
                  <Input
                    id="business_name"
                    data-testid="business-name-input"
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="invite_code" className="text-slate-200">Invite Code</Label>
                  <Input
                    id="invite_code"
                    data-testid="invite-code-input"
                    type="text"
                    value={formData.invite_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, invite_code: e.target.value }))}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input
                id="password"
                data-testid="password-input"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <Button 
              type="submit" 
              data-testid={isLogin ? "login-button" : "register-button"}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              data-testid="toggle-auth-mode"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({
                  username: '',
                  password: '',
                  email: '',
                  business_name: '',
                  invite_code: ''
                });
              }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {isLogin ? "Need an account? Register here" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Dashboard and other components remain unchanged (omitted for brevity)

function AppRoutes() {
  const { token, loading, user, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/admin" element={token && (user?.role === 'admin' || user?.role === 'super_admin' || user?.is_admin) ? <AdminDashboard user={user} /> : <Navigate to="/login" />} />
      <Route path="/list/cash" element={token ? <Cash /> : <Navigate to="/login" />} />
      <Route path="/list/:key" element={token ? <ListViewPage /> : <Navigate to="/login" />} />
      <Route path="/cash-in" element={token ? <CashInEntry onBack={() => window.history.back()} /> : <Navigate to="/login" />} />
      <Route path="/cash-out" element={token ? <CashOutEntry onBack={() => window.history.back()} /> : <Navigate to="/login" />} />
      <Route path="/fuel-dispenser" element={token ? <FuelDispenser /> : <Navigate to="/login" />} />
      <Route path="/fuel-dispenser/:dispenserId" element={token ? <FuelDispenserDetails /> : <Navigate to="/login" />} />
      <Route path="/todo" element={token ? <ToDoList /> : <Navigate to="/login" />} />
      <Route path="/" element={token ? <Dashboard user={user} logout={logout} /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default function AppWithAuth() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <RoleProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </RoleProvider>
      </BusinessProvider>
    </AuthProvider>
  );
}