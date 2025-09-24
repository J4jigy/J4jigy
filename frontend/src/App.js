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
import { Home, User, Plus, Minus, CreditCard, Users, Building, TrendingUp, FileText, Package, PieChart, BarChart3, Gift, MessageCircle, Send, LogOut, Settings, Shield, ShieldCheck, Star, Truck, PackageCheck, Zap, Coins, Receipt } from 'lucide-react';
import AdminDashboard from './components/AdminDashboard';
import CashInEntry from './components/CashInEntry';
import CashOutEntry from './components/CashOutEntry';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { username: formData.username, password: formData.password }
        : formData;

      const response = await axios.post(`${API}${endpoint}`, payload);
      login(response.data.user, response.data.access_token);
    } catch (error) {
      setError(error.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardContent className="p-6">
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

// Dashboard Component
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [summary, setSummary] = useState({ you_will_give: 0, you_will_receive: 0, net_position: 0 });
  const [showCashInDialog, setShowCashInDialog] = useState(false);
  const [showCashOutDialog, setShowCashOutDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showInviteCodesDialog, setShowInviteCodesDialog] = useState(false);
  const [showCashInEntry, setShowCashInEntry] = useState(false);
  const [showCashOutEntry, setShowCashOutEntry] = useState(false);
  const [inviteCodes, setInviteCodes] = useState([]);
  const [newInviteCode, setNewInviteCode] = useState(null);
  const [transactionData, setTransactionData] = useState({ description: '', amount: '' });
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/summary`);
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const handleTransaction = async (type) => {
    try {
      const payload = {
        description: transactionData.description,
        amount: parseFloat(transactionData.amount),
        transaction_type: type,
        category: 'general'
      };

      await axios.post(`${API}/transactions`, payload);
      setTransactionData({ description: '', amount: '' });
      setShowCashInDialog(false);
      setShowCashOutDialog(false);
      fetchSummary(); // Refresh summary
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  const handleCreateInviteCode = async () => {
    try {
      const response = await axios.post(`${API}/admin/invite-codes`);
      setNewInviteCode(response.data);
      alert(`New invite code created: ${response.data.code}`);
    } catch (error) {
      console.error('Failed to create invite code:', error);
      alert('Failed to create invite code');
    }
  };

  const handleViewInviteCodes = async () => {
    try {
      const response = await axios.get(`${API}/admin/invite-codes`);
      setInviteCodes(response.data);
      setShowInviteCodesDialog(true);
    } catch (error) {
      console.error('Failed to fetch invite codes:', error);
    }
  };

  const businessTiles = [
    { name: 'Credit Score', subtitle: '', icon: ShieldCheck, iconColor: 'text-blue-400' },
    { name: 'Customers', subtitle: 'Debtors', icon: Users, iconColor: 'text-green-400' },
    { name: 'Suppliers', subtitle: 'Creditors', icon: Truck, iconColor: 'text-indigo-400' },
    { name: 'Community', subtitle: 'Ratings', icon: Star, iconColor: 'text-yellow-400' },
    { name: 'Staff', subtitle: '', icon: Users, iconColor: 'text-purple-400' },
    { name: 'Add New', subtitle: '', icon: Plus, iconColor: 'text-slate-300' }
  ];

  const financeTiles = [
    { name: "Company", subtitle: "Purchase", icon: PackageCheck, iconColor: 'text-orange-400' },
    { name: 'Bills', subtitle: 'Recharge', icon: FileText, iconColor: 'text-green-400' },
    { name: 'Rent', subtitle: '', icon: Building, iconColor: 'text-blue-400' },
    { name: 'Other', subtitle: 'Expenses', icon: Package, iconColor: 'text-purple-400' },
    { name: 'Bills &', subtitle: 'Invoices', icon: FileText, iconColor: 'text-yellow-400' },
    { name: 'Stock', subtitle: 'Management', icon: Package, iconColor: 'text-orange-400' },
    { name: 'Profit', subtitle: 'Loss', icon: TrendingUp, iconColor: 'text-emerald-400' },
    { name: 'Balance', subtitle: 'Sheet', icon: BarChart3, iconColor: 'text-indigo-400' },
    { name: 'Add New', subtitle: '', icon: Plus, iconColor: 'text-slate-300' }
  ];

  const personalTiles = [
    { name: 'Offers &', subtitle: 'Discounts', icon: Gift, iconColor: 'text-red-400' },
    { name: 'Chat', subtitle: '', icon: MessageCircle, iconColor: 'text-blue-400' },
    { name: 'Add New', subtitle: '', icon: Plus, iconColor: 'text-slate-300' }
  ];

  const getTilesForTab = (tab) => {
    switch (tab) {
      case 'business': return businessTiles;
      case 'finance': return financeTiles;
      case 'personal': return personalTiles;
      default: return businessTiles;
    }
  };

  // Show Cash In Entry screen
  if (showCashInEntry) {
    return <CashInEntry onBack={() => setShowCashInEntry(false)} />;
  }

  // Show Cash Out Entry screen
  if (showCashOutEntry) {
    return <CashOutEntry onBack={() => setShowCashOutEntry(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white" data-testid="dashboard">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Home className="w-6 h-6 text-blue-400" data-testid="home-icon" />
        </div>
        
        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" data-testid="profile-icon">
              <User className="w-6 h-6 text-slate-400" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-slate-200">Username: {user?.username}</p>
                <p className="text-slate-200">Business: {user?.business_name}</p>
                <p className="text-slate-200">Email: {user?.email}</p>
                {user?.is_admin && (
                  <Badge className="mt-2 bg-gold-600 text-gold-100">Admin</Badge>
                )}
              </div>
              
              {(user?.is_admin || user?.role === 'admin' || user?.role === 'super_admin') && (
                <div className="border-t border-slate-600 pt-4">
                  <h4 className="text-white font-semibold mb-3">Admin Panel</h4>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => window.location.href = '/admin'}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      data-testid="admin-dashboard-button"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Security Dashboard
                    </Button>
                    <Button 
                      onClick={() => handleCreateInviteCode()}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      data-testid="create-invite-button"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Invite Code
                    </Button>
                    <Button 
                      onClick={() => handleViewInviteCodes()}
                      variant="outline" 
                      className="w-full border-slate-600 text-slate-200"
                      data-testid="view-invites-button"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      View Invite Codes
                    </Button>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={logout} 
                variant="destructive" 
                className="w-full"
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Section */}
      <div className="p-4" data-testid="summary-section">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-red-800 to-red-900 border border-red-700/50 shadow-xl">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-red-100 text-xs font-medium mb-1">You will Give</p>
                <p className="text-xl font-bold text-white" data-testid="total-payables">
                  ₹ {summary.you_will_give.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-800 to-green-900 border border-green-700/50 shadow-xl">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-green-100 text-xs font-medium mb-1">You will Receive</p>
                <p className="text-xl font-bold text-white" data-testid="total-receivables">
                  ₹ {summary.you_will_receive.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" data-testid="main-tabs">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/80 border border-slate-700 rounded-lg">
            <TabsTrigger 
              value="business" 
              data-testid="business-tab" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-md"
            >
              Business
            </TabsTrigger>
            <TabsTrigger 
              value="finance" 
              data-testid="finance-tab" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-md"
            >
              Finance
            </TabsTrigger>
            <TabsTrigger 
              value="personal" 
              data-testid="personal-tab" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-md"
            >
              Personal
            </TabsTrigger>
          </TabsList>

          {['business', 'finance', 'personal'].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              <div className="grid grid-cols-3 gap-3 px-4" data-testid={`${tab}-grid`}>
                {getTilesForTab(tab).map((tile, index) => {
                  const IconComponent = tile.icon;
                  return (
                    <Card 
                      key={index}
                      className={`bg-slate-700/80 border border-slate-600 hover:bg-slate-600 transition-all duration-200 cursor-pointer shadow-xl aspect-square flex items-center justify-center`}
                      data-testid={`${tab}-tile-${index}`}
                    >
                      <CardContent className="p-3 flex flex-col items-center justify-center text-center relative w-full h-full">
                        <IconComponent className={`w-8 h-8 mb-2 ${tile.iconColor}`} />
                        <div className="text-center">
                          <p className="text-white text-sm font-semibold leading-tight mb-0">
                            {tile.name}
                          </p>
                          {tile.subtitle && (
                            <p className="text-slate-200 text-xs font-medium leading-tight">
                              {tile.subtitle}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Invite Codes Admin Dialog */}
      <Dialog open={showInviteCodesDialog} onOpenChange={setShowInviteCodesDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Manage Invite Codes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {inviteCodes.map((code, index) => (
              <Card key={index} className="bg-slate-700 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-mono text-lg">{code.code}</p>
                      <p className="text-slate-400 text-sm">
                        Created: {new Date(code.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={code.used_by ? 'bg-red-600' : 'bg-green-600'}>
                        {code.used_by ? 'Used' : 'Active'}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => {
                          const shareUrl = `https://fintracker-56.preview.emergentagent.com/`;
                          const message = `Join our financial dashboard! Use invite code: ${code.code}\n${shareUrl}`;
                          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid={`share-whatsapp-${index}`}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cash In/Out Buttons */}
      <div className="fixed bottom-6 left-4 right-4">
        <div className="flex gap-4">
          <Dialog open={showCashInDialog} onOpenChange={setShowCashInDialog}>
            <DialogTrigger asChild>
              <Button 
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-xl shadow-lg"
                data-testid="cash-in-button"
                onClick={() => setShowCashInEntry(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Cash In
              </Button>
            </DialogTrigger>
          </Dialog>

          <Dialog open={showCashOutDialog} onOpenChange={setShowCashOutDialog}>
            <DialogTrigger asChild>
              <Button 
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl shadow-lg"
                data-testid="cash-out-button"
                onClick={() => setShowCashOutEntry(true)}
              >
                <Minus className="w-5 h-5 mr-2" />
                Cash Out
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const { token, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/admin" element={token && (user?.role === 'admin' || user?.role === 'super_admin' || user?.is_admin) ? <AdminDashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

// App with AuthProvider
export default function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}