import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Home, UserCircle, ShieldCheck, Users, Truck, Star, ShoppingCart, Zap, Building, Coins, Receipt, Package, PieChart, BarChart3, Gift, MessageCircle, Send, Plus, Minus, Shield, Settings, ChevronDown, CheckSquare, Share2, Copy } from 'lucide-react';

// Build API base (same-origin on preview)
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
let API = `${BACKEND_URL}/api`;
try {
  const loc = typeof window !== 'undefined' ? window.location.origin : null;
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const sameOrigin = BACKEND_URL && loc && new URL(BACKEND_URL).origin === loc;
  const isPreview = host && host.endsWith('.preview.emergentagent.com');
  if (sameOrigin || isPreview) {
    API = '/api';
  }
} catch (e) {}

export default function Dashboard({ user, logout }) {
  const [activeTab, setActiveTab] = useState('business');
  const [summary, setSummary] = useState({ you_will_give: 0, you_will_receive: 0, net_position: 0 });
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showInviteCodesDialog, setShowInviteCodesDialog] = useState(false);
  const [inviteCodes, setInviteCodes] = useState([]);
  
  // Business switching states
  const [businesses, setBusinesses] = useState([
    { id: 1, name: 'Main Business', type: 'Retail' },
    { id: 2, name: 'Online Store', type: 'E-commerce' },
    { id: 3, name: 'Consulting Firm', type: 'Services' }
  ]);
  const [activeBusiness, setActiveBusiness] = useState(businesses[0]);
  const [showBusinessDialog, setShowBusinessDialog] = useState(false);
  const [showAddBusinessDialog, setShowAddBusinessDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState(null);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newBusinessType, setNewBusinessType] = useState('Retail');
  const [newBusinessGST, setNewBusinessGST] = useState('');
  const [newBusinessAddress, setNewBusinessAddress] = useState('');
  const [newBusinessPhone, setNewBusinessPhone] = useState('');
  
  // WhatsApp invite states
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Floating Chat states
  const [showFloatingChat, setShowFloatingChat] = useState(true);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [showWhatsAppFromChat, setShowWhatsAppFromChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'System', message: 'Welcome to FinanceTracker! Chat with other users here.', time: '10:30 AM', isSystem: true },
    { id: 2, user: 'John Doe', message: 'Hey, great app! Love the POS features.', time: '2:45 PM', isSystem: false },
    { id: 3, user: 'Sarah', message: 'Thanks John! The quick cash buttons are really helpful.', time: '3:10 PM', isSystem: false }
  ]);
  const [newMessage, setNewMessage] = useState('');
  
  const navigate = useNavigate();

  const fetchSummary = async () => {
    try {
      const resp = await axios.get(`${API}/dashboard/summary`);
      setSummary(resp.data);
    } catch (e) {
      // ignore summary errors to avoid blocking dashboard
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleCreateInviteCode = async () => {
    try {
      const response = await axios.post(`${API}/admin/invite-codes`);
      alert(`New invite code created: ${response.data.code}`);
    } catch (error) {
      alert('Failed to create invite code');
    }
  };

  const handleViewInviteCodes = async () => {
    try {
      const response = await axios.get(`${API}/admin/invite-codes`);
      setInviteCodes(response.data || []);
      setShowInviteCodesDialog(true);
    } catch (error) {
      console.error('Failed to fetch invite codes:', error);
    }
  };

  // Business management functions
  const handleBusinessSwitch = (business) => {
    setActiveBusiness(business);
    setShowBusinessDialog(false);
    // Refresh summary data for the selected business
    fetchSummary();
  };

  const handleAddBusiness = () => {
    if (newBusinessName.trim()) {
      const newBusiness = {
        id: businesses.length + 1,
        name: newBusinessName.trim(),
        type: newBusinessType,
        gstNumber: newBusinessGST.trim(),
        address: newBusinessAddress.trim(),
        phone: newBusinessPhone.trim()
      };
      setBusinesses(prev => [...prev, newBusiness]);
      // Form reset handled by onClick with setTimeout
    }
  };

  const handleDeleteBusiness = (businessId) => {
    if (businesses.length > 1) { // Prevent deleting the last business
      const updatedBusinesses = businesses.filter(b => b.id !== businessId);
      setBusinesses(updatedBusinesses);
      
      // If deleted business was active, switch to first business
      if (activeBusiness.id === businessId) {
        setActiveBusiness(updatedBusinesses[0]);
      }
      
      setShowDeleteConfirmDialog(false);
      setBusinessToDelete(null);
    }
  };

  const confirmDeleteBusiness = (businessId, businessName) => {
    setBusinessToDelete({ id: businessId, name: businessName });
    setShowDeleteConfirmDialog(true);
  };

  // WhatsApp Invite Functions
  const generateInviteLink = () => {
    const appUrl = window.location.origin;
    return `${appUrl}/register?invite=${user?.email || 'user'}`;
  };

  const generateInviteMessage = () => {
    const inviteLink = generateInviteLink();
    return `🚀 Join me on FinanceTracker - the best financial management app!

✅ Track cash in/out
✅ Manage customers & suppliers  
✅ POS billing system
✅ Real-time financial dashboard

Click here to get started: ${inviteLink}

It's completely free to try!`;
  };

  const shareViaWhatsApp = () => {
    if (!phoneNumber.trim()) {
      alert('Please enter a phone number');
      return;
    }

    const message = inviteMessage || generateInviteMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    setShowInviteDialog(false);
    setPhoneNumber('');
  };

  const shareViaWebAPI = async () => {
    const message = inviteMessage || generateInviteMessage();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join FinanceTracker',
          text: message,
          url: generateInviteLink()
        });
      } catch (error) {
        console.log('Web Share failed:', error);
        copyInviteLink();
      }
    } else {
      copyInviteLink();
    }
  };

  const copyInviteLink = async () => {
    const message = inviteMessage || generateInviteMessage();
    
    try {
      await navigator.clipboard.writeText(message);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  useEffect(() => {
    setInviteMessage(generateInviteMessage());
  }, [user]);

  // Show floating chat when dashboard loads
  useEffect(() => {
    setShowFloatingChat(true);
  }, []);

  // Floating Chat Functions  
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      user: user?.username || 'You',
      message: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: false
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleChatWhatsAppShare = () => {
    setShowChatDialog(false);
    setShowWhatsAppFromChat(true);
  };

  // Navigation with chat hiding
  const handleNavigate = (path) => {
    setShowFloatingChat(false);
    navigate(path);
  };

  const businessTiles = [
    { name: 'Credit Score', subtitle: '', icon: ShieldCheck, iconColor: 'text-blue-400' },
    { name: 'Customers', subtitle: 'Debtors', icon: Users, iconColor: 'text-green-400' },
    { name: 'Suppliers', subtitle: 'Creditors', icon: Truck, iconColor: 'text-indigo-400' },
    { name: 'Community', subtitle: 'Ratings', icon: Star, iconColor: 'text-yellow-400' },
    { name: 'Staff', subtitle: '', icon: Users, iconColor: 'text-purple-400' },
  ];

  const financeTiles = [
    { name: 'Company', subtitle: 'Purchase', icon: ShoppingCart, iconColor: 'text-orange-400' },
    { name: 'Bills', subtitle: 'Recharge', icon: Zap, iconColor: 'text-green-400' },
    { name: 'Rent', subtitle: '', icon: Building, iconColor: 'text-blue-400' },
    { name: 'Other', subtitle: 'Expenses', icon: Coins, iconColor: 'text-purple-400' },
    { name: 'Bills &', subtitle: 'Invoices', icon: Receipt, iconColor: 'text-yellow-400' },
    { name: 'Stock', subtitle: 'Management', icon: Package, iconColor: 'text-orange-400' },
    { name: 'Profit', subtitle: 'Loss', icon: PieChart, iconColor: 'text-emerald-400' },
    { name: 'Balance', subtitle: 'Sheet', icon: BarChart3, iconColor: 'text-indigo-400' },
  ];

  const personalTiles = [
    { name: 'Offers &', subtitle: 'Discounts', icon: Gift, iconColor: 'text-red-400' },
    { name: 'Chat', subtitle: '', icon: MessageCircle, iconColor: 'text-blue-400' },
    { name: 'To Do List', subtitle: '', icon: CheckSquare, iconColor: 'text-green-400' },
  ];

  const getTilesForTab = (tab) => {
    switch (tab) {
      case 'business': return businessTiles;
      case 'finance': return financeTiles;
      case 'personal': return personalTiles;
      default: return businessTiles;
    }
  };

  const handleTileClick = (tile) => {
    const name = `${tile.name} ${tile.subtitle}`.trim().toLowerCase();
    if (name.startsWith('customers')) handleNavigate('/list/customers');
    else if (name.startsWith('suppliers')) handleNavigate('/list/suppliers');
    else if (name.startsWith('community')) handleNavigate('/list/ratings');
    else if (name.startsWith('staff')) handleNavigate('/list/staff');
    else if (name.startsWith('company purchase') || name.startsWith('company')) handleNavigate('/list/purchases');
    else if (name.startsWith('bills recharge') || tile.name === 'Bills') handleNavigate('/list/bills');
    else if (name.startsWith('other')) handleNavigate('/list/expenses');
    else if (name.startsWith('bills &')) handleNavigate('/list/invoices');
    else if (name.startsWith('to do list')) handleNavigate('/todo');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Home className="w-6 h-6 text-blue-400" />
        </div>
        
        {/* Business Switcher */}
        <div className="flex-1 flex justify-center">
          <Dialog open={showBusinessDialog} onOpenChange={(open) => {
            setShowBusinessDialog(open);
            if (!open) {
              // Reset any pending delete operations when main dialog closes
              setShowDeleteConfirmDialog(false);
              setBusinessToDelete(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-slate-700 flex items-center gap-2">
                <Building className="w-4 h-4 text-orange-400" />
                <span className="font-medium">{activeBusiness.name}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Switch Business</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  {businesses.map((business) => (
                    <div key={business.id} className="flex items-center justify-between">
                      <Button
                        onClick={() => handleBusinessSwitch(business)}
                        variant={activeBusiness.id === business.id ? "default" : "ghost"}
                        className={`flex-1 justify-start mr-2 ${
                          activeBusiness.id === business.id 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        <Building className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">{business.name}</div>
                          <div className="text-xs opacity-70">{business.type}</div>
                        </div>
                      </Button>
                      {businesses.length > 1 && (
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            confirmDeleteBusiness(business.id, business.name);
                          }}
                          variant="ghost"
                          size="sm" 
                          className="text-red-400 hover:bg-red-900/20 hover:text-red-300 shrink-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => setShowAddBusinessDialog(true)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Business
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" data-testid="profile-icon">
                <UserCircle className="w-6 h-6 text-slate-400" />
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
                {(user?.is_admin || user?.role === 'admin' || user?.role === 'super_admin') && (
                  <Badge className="mt-2 bg-purple-600 text-white">Admin</Badge>
                )}
              </div>
              {(user?.is_admin || user?.role === 'admin' || user?.role === 'super_admin') && (
                <div className="border-t border-slate-600 pt-4">
                  <h4 className="text-white font-semibold mb-3">Admin Panel</h4>
                  <div className="space-y-2">
                    <Button onClick={() => handleNavigate('/admin')} className="w-full bg-purple-600 hover:bg-purple-700">
                      <Shield className="w-4 h-4 mr-2" />
                      Security Dashboard
                    </Button>
                    <Button onClick={handleCreateInviteCode} className="w-full bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Invite Code
                    </Button>
                    <Button onClick={handleViewInviteCodes} variant="outline" className="w-full border-slate-600 text-slate-200">
                      <Settings className="w-4 h-4 mr-2" />
                      View Invite Codes
                    </Button>
                  </div>
                </div>
              )}
              <Button onClick={logout} variant="destructive" className="w-full">
                Logout
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-red-800 to-red-900 border border-red-700/50 shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-red-100 text-xs font-medium mb-1">You will Give</p>
              <p className="text-xl font-bold text-white">₹ {Number(summary.you_will_give || 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-800 to-green-900 border border-green-700/50 shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-green-100 text-xs font-medium mb-1">You will Receive</p>
              <p className="text-xl font-bold text-white">₹ {Number(summary.you_will_receive || 0).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs and Tiles */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/80 border border-slate-700 rounded-lg">
            <TabsTrigger value="business" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-md">Business</TabsTrigger>
            <TabsTrigger value="finance" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-md">Finance</TabsTrigger>
            <TabsTrigger value="personal" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-md">Personal</TabsTrigger>
          </TabsList>

          {['business', 'finance', 'personal'].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              <div className="grid grid-cols-3 gap-3 px-4">
                {getTilesForTab(tab).map((tile, idx) => {
                  const IconComponent = tile.icon;
                  return (
                    <Card key={idx} onClick={() => handleTileClick(tile)} className="bg-slate-700/80 border border-slate-600 hover:bg-slate-600 transition-all duration-200 cursor-pointer shadow-xl aspect-square flex items-center justify-center">
                      <CardContent className="p-3 flex flex-col items-center justify-center text-center w-full h-full">
                        <IconComponent className={`w-8 h-8 mb-2 ${tile.iconColor}`} />
                        <div className="text-center">
                          <p className="text-white text-[12px] font-semibold leading-tight mb-0 break-words">{tile.name}</p>
                          {tile.subtitle && (
                            <p className="text-slate-200 text-[12px] font-medium leading-tight break-words">{tile.subtitle}</p>
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
                      <p className="text-slate-400 text-sm">Created: {new Date(code.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={code.used_by ? 'bg-red-600' : 'bg-green-600'}>{code.used_by ? 'Used' : 'Active'}</Badge>
                      <Button size="sm" onClick={() => {
                        const shareUrl = `${window.location.origin}/login`;
                        const message = `Join our financial dashboard! Use invite code: ${code.code}\n${shareUrl}`;
                        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                      }} className="bg-green-600 hover:bg-green-700">
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

      {/* Add New Business Dialog */}
      <Dialog open={showAddBusinessDialog} onOpenChange={(open) => {
        setShowAddBusinessDialog(open);
        if (!open) {
          // Reset form when dialog closes
          setNewBusinessName('');
          setNewBusinessType('Retail');
          setNewBusinessGST('');
          setNewBusinessAddress('');
          setNewBusinessPhone('');
        }
      }}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Business</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-200">Business Name</Label>
              <Input
                value={newBusinessName}
                onChange={(e) => setNewBusinessName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-1"
                placeholder="Enter business name"
              />
            </div>
            <div>
              <Label className="text-slate-200">Business Type</Label>
              <Select value={newBusinessType} onValueChange={setNewBusinessType}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Restaurant">Restaurant</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-200">GST Number</Label>
              <Input
                value={newBusinessGST}
                onChange={(e) => setNewBusinessGST(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-1"
                placeholder="Enter GST number (optional)"
              />
            </div>
            <div>
              <Label className="text-slate-200">Phone Number</Label>
              <Input
                value={newBusinessPhone}
                onChange={(e) => setNewBusinessPhone(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-1"
                placeholder="Enter phone number"
                type="tel"
              />
            </div>
            <div>
              <Label className="text-slate-200">Address</Label>
              <textarea
                value={newBusinessAddress}
                onChange={(e) => setNewBusinessAddress(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white mt-1 p-2 rounded-md resize-none"
                placeholder="Enter business address"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  handleAddBusiness();
                  // Force close the dialog after adding
                  setTimeout(() => {
                    setShowAddBusinessDialog(false);
                  }, 100);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!newBusinessName.trim()}
              >
                Add Business
              </Button>
              <Button
                onClick={() => {
                  setShowAddBusinessDialog(false);
                  setNewBusinessName('');
                  setNewBusinessType('Retail');
                  setNewBusinessGST('');
                  setNewBusinessAddress('');
                  setNewBusinessPhone('');
                }}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Business Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Business</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-200">
              Are you sure you want to delete "{businessToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => businessToDelete && handleDeleteBusiness(businessToDelete.id)}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Yes, Delete
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteConfirmDialog(false);
                  setBusinessToDelete(null);
                }}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Chat and WhatsApp Components */}
      {showFloatingChat && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-3">
          {/* WhatsApp Share Button */}
          <Button
            onClick={() => setShowWhatsAppFromChat(true)}
            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center"
          >
            <Share2 className="w-6 h-6 text-white" />
          </Button>
          
          {/* Chat Button */}
          <Button
            onClick={() => setShowChatDialog(true)}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </Button>
        </div>
      )}

      {/* Chat Dialog */}
      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md h-[500px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Community Chat
            </DialogTitle>
          </DialogHeader>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.isSystem ? 'items-center' : 'items-start'}`}>
                {msg.isSystem ? (
                  <div className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs">
                    {msg.message}
                  </div>
                ) : (
                  <div className="max-w-[80%]">
                    <div className="bg-blue-600 text-white p-3 rounded-lg rounded-tl-sm">
                      <div className="text-sm">{msg.message}</div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <span>{msg.user}</span>
                      <span>•</span>
                      <span>{msg.time}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Message Input */}
          <div className="flex gap-2 pt-3 border-t border-slate-600">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="bg-slate-700 border-slate-600 text-white flex-1"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Share from Chat */}
      <Dialog open={showWhatsAppFromChat} onOpenChange={setShowWhatsAppFromChat}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Invite Friends to Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-200 text-sm">Phone Number</Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number (e.g. +1234567890)"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-200 text-sm">Message Preview</Label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-md p-3 text-sm mt-1 min-h-[120px] resize-none"
                placeholder="Customize your invite message..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={shareViaWhatsApp}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send via WhatsApp
              </Button>
              <Button
                onClick={shareViaWebAPI}
                variant="outline"
                className="border-slate-600 text-slate-200"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={copyInviteLink}
              variant="outline"
              className="w-full border-slate-600 text-slate-200"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copySuccess ? 'Copied!' : 'Copy Message'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cash In/Out Floating Buttons */}
      <div className="fixed bottom-6 left-4 right-4">
        <div className="flex gap-4">
          <Button 
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-xl shadow-lg"
            onClick={() => handleNavigate('/cash-in')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Cash In
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl shadow-lg"
            onClick={() => handleNavigate('/cash-out')}
          >
            <Minus className="w-5 h-5 mr-2" />
            Cash Out
          </Button>
        </div>
      </div>
    </div>
  );
}
