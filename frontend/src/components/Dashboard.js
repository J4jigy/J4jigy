import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useBusiness } from '../contexts/BusinessContext';
import { useRole } from '../contexts/RoleContext';
import { useNavigate } from 'react-router-dom';
import StaffManagement from './StaffManagement';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Home, UserCircle, ShieldCheck, Users, Truck, Star, ShoppingCart, Zap, Building, Coins, Receipt, Package, PieChart, BarChart3, Gift, MessageCircle, Send, Plus, Minus, Shield, Settings, ChevronDown, CheckSquare, Share2, Copy, ArrowLeft, ScanLine, FileBarChart, Landmark, Fuel, Download, Upload } from 'lucide-react';

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
  // Restore activeTab from localStorage or default to 'business'
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('dashboardActiveTab') || 'business';
  });
  const [summary, setSummary] = useState({ you_will_give: 0, you_will_receive: 0, net_position: 0 });
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showInviteCodesDialog, setShowInviteCodesDialog] = useState(false);
  const [inviteCodes, setInviteCodes] = useState([]);
  
  // Use BusinessContext for business management
  const {
    businesses,
    activeBusiness,
    switchBusiness,
    addBusiness,
    deleteBusiness,
    exportBusiness,
    importBusiness,
    getDataSize
  } = useBusiness();
  
  // Use RoleContext for permission-based UI
  const { hasPermission, userRole, standardRoles } = useRole();
  
  const [showBusinessDialog, setShowBusinessDialog] = useState(false);
  const [showAddBusinessDialog, setShowAddBusinessDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
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
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'System', message: 'Welcome to FinanceTracker! Chat with other users here.', time: '10:30 AM', isSystem: true, avatar: '🤖' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  
  // Contact and chat states
  const [showPeerList, setShowPeerList] = useState(true); // Show contact list by default
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [peerMessages, setPeerMessages] = useState({});
  
  // Scan Documents states
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanResults, setScanResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  
  const navigate = useNavigate();

  const fetchSummary = async () => {
    try {
      const resp = await axios.get(`${API}/dashboard/summary`);
      setSummary(resp.data);
    } catch (e) {
      // ignore summary errors to avoid blocking dashboard
    }
  };

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API}/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Simulate online status for contacts (random for demo)
      const contactsWithStatus = response.data.map(contact => ({
        ...contact,
        status: Math.random() > 0.5 ? 'online' : 'offline',
        lastSeen: contact.status === 'online' ? 'online' : `${Math.floor(Math.random() * 12) + 1} hours ago`
      }));
      
      setContacts(contactsWithStatus);
    } catch (error) {
      console.log('Error fetching contacts:', error);
      setContacts([]);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchContacts();
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

  // Business management functions using BusinessContext
  const handleBusinessSwitch = (business) => {
    switchBusiness(business);
    setShowBusinessDialog(false);
    // Refresh summary data for the selected business
    fetchSummary();
  };

  const handleAddBusiness = () => {
    if (newBusinessName.trim()) {
      try {
        const newBusiness = addBusiness(newBusinessName.trim(), newBusinessType);
        console.log('New business created:', newBusiness);
        // Form reset handled by onClick with setTimeout
      } catch (error) {
        console.error('Error creating business:', error);
      }
    }
  };

  const handleDeleteBusiness = (businessId) => {
    try {
      deleteBusiness(businessId);
    } catch (error) {
      console.error('Error deleting business:', error);
      alert(error.message);
    }
  };

  // Import/Export functions
  const handleExportBusiness = (businessId) => {
    try {
      const exportData = exportBusiness(businessId || activeBusiness.id);
      const business = businesses.find(b => b.id === (businessId || activeBusiness.id));
      
      // Create download
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${business.name}_export_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      console.log('Business data exported successfully');
    } catch (error) {
      console.error('Error exporting business:', error);
      alert('Failed to export business data');
    }
  };

  const handleImportBusiness = (file, options = {}) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Ask for confirmation
        const confirmMessage = options.createNew 
          ? `Import data as new business "${importData.business?.name || 'Imported Business'}"?`
          : `Import data into current business "${activeBusiness.name}"? This will overwrite existing data.`;
          
        if (confirm(confirmMessage)) {
          const success = importBusiness(importData, options);
          if (success) {
            alert('Business data imported successfully!');
            setShowImportDialog(false);
            // Refresh page to show imported data
            window.location.reload();
          } else {
            alert('Failed to import business data');
          }
        }
      } catch (error) {
        console.error('Error importing business:', error);
        alert('Invalid file format or corrupted data');
      }
    };
    reader.readAsText(file);
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

  // Listen for chat open events from other components
  useEffect(() => {
    const handleOpenPeerChat = () => {
      setShowChatDialog(true);
      setShowPeerList(true);
      fetchContacts(); // Refresh contacts when chat opens
    };

    window.addEventListener('openPeerChat', handleOpenPeerChat);
    return () => {
      window.removeEventListener('openPeerChat', handleOpenPeerChat);
    };
  }, []);

  // Floating Chat Functions  
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    if (selectedPeer) {
      // Send message to selected peer
      const message = {
        id: Date.now(),
        user: user?.username || 'You',
        message: newMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: false,
        sent: true
      };
      
      setPeerMessages(prev => ({
        ...prev,
        [selectedPeer.id]: [...(prev[selectedPeer.id] || []), message]
      }));
      
      // Simulate peer response after 2-3 seconds
      setTimeout(() => {
        const responses = [
          "Thanks for the message!",
          "Got it, will check on that.",
          "Sure thing!",
          "Sounds good to me.",
          "Let me get back to you on this.",
          "Perfect timing!"
        ];
        const response = {
          id: Date.now() + 1,
          user: selectedPeer.name,
          message: responses[Math.floor(Math.random() * responses.length)],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: false,
          sent: false
        };
        
        setPeerMessages(prev => ({
          ...prev,
          [selectedPeer.id]: [...(prev[selectedPeer.id] || []), response]
        }));
      }, 2000 + Math.random() * 2000);
      
    } else {
      // General community message
      const message = {
        id: Date.now(),
        user: user?.username || 'You',
        message: newMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: false,
        avatar: '👤'
      };
      
      setChatMessages(prev => [...prev, message]);
    }
    
    setNewMessage('');
  };

  // Peer management functions
  const selectPeer = (peer) => {
    setSelectedPeer(peer);
    setShowPeerList(false);
    
    // Initialize conversation if not exists
    if (!peerMessages[peer.id]) {
      setPeerMessages(prev => ({
        ...prev,
        [peer.id]: [
          {
            id: Date.now(),
            user: 'System',
            message: `Chat started with ${peer.name}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true
          }
        ]
      }));
    }
  };

  const goBackToPeerList = () => {
    setSelectedPeer(null);
    setShowPeerList(true);
  };

  const openCommunityChat = () => {
    setSelectedPeer(null);
    setShowPeerList(false);
  };

  // Navigation with chat hiding and tab state saving
  const handleNavigate = (path) => {
    // Save current active tab to localStorage before navigating
    localStorage.setItem('dashboardActiveTab', activeTab);
    setShowFloatingChat(false);
    navigate(path);
  };

  // Scan Documents functionality
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
        setScanResults(null);
      } else {
        alert('Please select a valid file type: PDF, JPG, PNG, or WebP');
      }
    }
  };

  const simulateScanDocument = async () => {
    if (!selectedFile) return;
    
    setIsScanning(true);
    
    // Simulate scanning process with delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock scan results based on file type
    const mockResults = {
      fileName: selectedFile.name,
      fileSize: `${(selectedFile.size / 1024).toFixed(1)} KB`,
      documentType: selectedFile.type.includes('pdf') ? 'PDF Document' : 'Image Document',
      extractedText: selectedFile.type.includes('pdf') 
        ? 'Invoice #INV-2024-001\nDate: January 15, 2024\nAmount: $1,250.00\nVendor: TechSupply Corp\nDescription: Office supplies and equipment'
        : 'Receipt #RCP-456\nStore: QuickMart\nDate: Jan 15, 2024\nTotal: $45.67\nPayment: Credit Card',
      confidence: '94%',
      suggestions: selectedFile.type.includes('pdf') 
        ? ['Add to Company Purchases', 'Create Expense Entry', 'Update Supplier Record']
        : ['Add to Other Expenses', 'Create Cash Out Entry', 'Save Receipt']
    };
    
    setScanResults(mockResults);
    setIsScanning(false);
  };

  const resetScan = () => {
    setSelectedFile(null);
    setScanResults(null);
    setIsScanning(false);
  };

  const businessTiles = [
    { name: 'Customers', subtitle: 'Debtors', icon: Users, iconColor: 'text-green-400' },
    { name: 'Suppliers', subtitle: 'Creditors', icon: Truck, iconColor: 'text-indigo-400' },
    { name: 'Community', subtitle: 'Ratings', icon: Star, iconColor: 'text-yellow-400' },
    { name: 'Company', subtitle: 'Purchase', icon: ShoppingCart, iconColor: 'text-orange-400' },
    { name: 'Stock', subtitle: 'Management', icon: Package, iconColor: 'text-orange-400' },
    { name: 'Staff', subtitle: '', icon: Users, iconColor: 'text-purple-400' },
  ];

  const financeTiles = [
    { name: 'Bank', subtitle: '', icon: Landmark, iconColor: 'text-blue-400' },
    { name: 'Cash', subtitle: '', icon: Coins, iconColor: 'text-green-500' },
    { name: 'Bills', subtitle: 'Recharge', icon: Zap, iconColor: 'text-green-400' },
    { name: 'Rent', subtitle: '', icon: Building, iconColor: 'text-blue-400' },
    { name: 'Other', subtitle: 'Expenses', icon: Coins, iconColor: 'text-purple-400' },
    { name: 'Bills &', subtitle: 'Invoices', icon: FileBarChart, iconColor: 'text-yellow-400' },
    { name: 'Profit', subtitle: 'Loss', icon: PieChart, iconColor: 'text-emerald-400' },
    { name: 'Balance', subtitle: 'Sheet', icon: BarChart3, iconColor: 'text-indigo-400' },
  ];

  const personalTiles = [
    { name: 'Offers &', subtitle: 'Discounts', icon: Gift, iconColor: 'text-red-400' },
    { name: 'Scan', subtitle: 'Documents', icon: ScanLine, iconColor: 'text-cyan-400' },
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
    if (name.startsWith('bank')) handleNavigate('/list/bank');
    else if (name.startsWith('customers')) handleNavigate('/list/customers');
    else if (name.startsWith('suppliers')) handleNavigate('/list/suppliers');
    else if (name.startsWith('cash')) handleNavigate('/list/cash');
    else if (name.startsWith('community')) handleNavigate('/list/ratings');
    else if (name.startsWith('staff')) handleNavigate('/list/staff');
    else if (name.startsWith('rent')) handleNavigate('/list/rent');
    else if (name.startsWith('offers')) handleNavigate('/list/offers');
    else if (name.startsWith('stock')) handleNavigate('/list/stock');
    else if (name.startsWith('profit')) handleNavigate('/list/profit');
    else if (name.startsWith('balance')) handleNavigate('/list/balance');
    else if (name.startsWith('company purchase') || name.startsWith('company')) handleNavigate('/list/purchases');
    else if (name.startsWith('bills recharge') || tile.name === 'Bills') handleNavigate('/list/bills');
    else if (name.startsWith('other')) handleNavigate('/list/expenses');
    else if (name.startsWith('bills &')) handleNavigate('/list/invoices');
    else if (name.startsWith('to do list')) handleNavigate('/todo');
    else if (name.startsWith('scan documents') || tile.name === 'Scan') setShowScanModal(true);
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
                {hasPermission('business_create') && (
                  <Button
                    onClick={() => setShowAddBusinessDialog(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Business
                  </Button>
                )}
                
                {(hasPermission('business_export') || hasPermission('business_import')) && (
                  <div className="grid grid-cols-2 gap-2">
                    {hasPermission('business_export') && (
                      <Button
                        onClick={() => {
                          setShowBusinessDialog(false);
                          setShowExportDialog(true);
                        }}
                        variant="outline"
                        className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                    )}
                    {hasPermission('business_import') && (
                      <Button
                        onClick={() => {
                          setShowBusinessDialog(false);
                          setShowImportDialog(true);
                        }}
                        variant="outline"
                        className="border-green-600 text-green-400 hover:bg-green-900/20"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Import Data
                      </Button>
                    )}
                  </div>
                )}
                
                <Button
                  onClick={() => setShowBusinessDialog(false)}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  Close
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
      <div className="px-4 mb-3">
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="bg-gradient-to-br from-red-800 to-red-900 border border-red-700/50 shadow-xl cursor-pointer hover:from-red-700 hover:to-red-800 transition-colors"
            onClick={() => handleNavigate('/list/payables')}
          >
            <CardContent className="p-3 text-center">
              <p className="text-red-100 text-xs font-medium mb-1">You will Give</p>
              <p className="text-xl font-bold text-white">₹ {Number(summary.you_will_give || 0).toLocaleString()}</p>
              <p className="text-red-200 text-xs mt-1">Total Payables</p>
            </CardContent>
          </Card>
          <Card 
            className="bg-gradient-to-br from-green-800 to-green-900 border border-green-700/50 shadow-xl cursor-pointer hover:from-green-700 hover:to-green-800 transition-colors"
            onClick={() => handleNavigate('/list/receivables')}
          >
            <CardContent className="p-3 text-center">
              <p className="text-green-100 text-xs font-medium mb-1">You will Receive</p>
              <p className="text-xl font-bold text-white">₹ {Number(summary.you_will_receive || 0).toLocaleString()}</p>
              <p className="text-green-200 text-xs mt-1">Total Receivables</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs and Tiles */}
      <div className="px-4 mb-1">
        <Tabs value={activeTab} onValueChange={(tab) => {
          setActiveTab(tab);
          localStorage.setItem('dashboardActiveTab', tab);
        }} className="w-full">
          <TabsList className={`grid w-full ${hasPermission('staff_manage') ? 'grid-cols-4' : 'grid-cols-3'} bg-slate-800/80 border border-slate-700 rounded-lg mb-3`}>
            <TabsTrigger value="business" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-md">Business</TabsTrigger>
            <TabsTrigger value="finance" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-md">Finance</TabsTrigger>
            <TabsTrigger value="personal" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-md">Personal</TabsTrigger>
            {hasPermission('staff_manage') && (
              <TabsTrigger value="staff" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-md">Staff</TabsTrigger>
            )}
          </TabsList>

          {['business', 'finance', 'personal'].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
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
          
          {/* Staff Management Tab */}
          {hasPermission('staff_manage') && (
            <TabsContent value="staff" className="mt-0">
              <div className="px-4">
                <StaffManagement />
              </div>
            </TabsContent>
          )}
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

      {/* WhatsApp Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Invite Friends</DialogTitle>
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

      {/* Floating Buttons */}
      {showFloatingChat && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-3">
          {/* Share/WhatsApp Button */}
          <Button
            onClick={() => setShowInviteDialog(true)}
            className="w-14 h-14 rounded-full bg-green-500/20 hover:bg-green-500/40 active:bg-green-500/60 border border-green-400/30 shadow-lg flex items-center justify-center backdrop-blur-sm transition-all duration-200"
          >
            <Share2 className="w-6 h-6 text-green-400" />
          </Button>
          
          {/* Chat Button */}
          <Button
            onClick={() => {
              setShowChatDialog(true);
              setShowPeerList(true); // Show contacts by default
              fetchContacts(); // Refresh contacts when opening
            }}
            className="w-14 h-14 rounded-full bg-blue-500/20 hover:bg-blue-500/40 active:bg-blue-500/60 border border-blue-400/30 shadow-lg flex items-center justify-center backdrop-blur-sm transition-all duration-200"
          >
            <MessageCircle className="w-6 h-6 text-blue-400" />
          </Button>
        </div>
      )}

      {/* Chat Dialog */}
      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md h-[500px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedPeer ? (
                <div className="flex items-center gap-2 w-full">
                  <Button 
                    onClick={goBackToPeerList}
                    variant="ghost" 
                    size="sm" 
                    className="p-1 h-6 w-6"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedPeer.avatar}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{selectedPeer.name}</div>
                      <div className="text-xs text-slate-400">
                        {selectedPeer.status === 'online' ? (
                          <span className="text-green-400">● online</span>
                        ) : (
                          <span className="text-slate-400">last seen {selectedPeer.lastSeen}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : showPeerList ? (
                <div className="flex items-center gap-2 w-full">
                  <MessageCircle className="w-5 h-5" />
                  <span>Contacts</span>
                  <div className="flex-1"></div>
                  <Button 
                    onClick={openCommunityChat}
                    variant="ghost" 
                    size="sm"
                    className="text-xs text-slate-300 hover:text-white"
                  >
                    Community
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Community Chat
                  <div className="flex-1"></div>
                  <Button 
                    onClick={() => setShowPeerList(true)}
                    variant="ghost" 
                    size="sm"
                    className="text-xs text-slate-300 hover:text-white"
                  >
                    Contacts
                  </Button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {showPeerList ? (
            /* Peer List View */
            <div className="flex-1 overflow-y-auto space-y-1 pr-2">
              <div className="text-xs text-slate-400 mb-2">Contacts ({contacts.filter(p => p.status === 'online').length} online)</div>
              {contacts.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No contacts yet</p>
                  <p className="text-xs">Add customers in Cash In/Out to see them here</p>
                </div>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => selectPeer(contact)}
                    className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <span className="text-2xl">{contact.avatar}</span>
                      {contact.status === 'online' && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{contact.name}</div>
                      <div className="text-xs text-slate-400 capitalize">{contact.type}</div>
                      {contact.status === 'offline' && (
                        <div className="text-xs text-slate-500">last seen {contact.lastSeen}</div>
                      )}
                    </div>
                    {peerMessages[contact.id] && peerMessages[contact.id].length > 1 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Chat Messages View */
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {(selectedPeer ? peerMessages[selectedPeer.id] || [] : chatMessages).map((msg) => (
                <div key={msg.id} className={`flex flex-col ${
                  msg.isSystem 
                    ? 'items-center' 
                    : selectedPeer 
                      ? (msg.sent ? 'items-end' : 'items-start')
                      : 'items-start'
                }`}>
                  {msg.isSystem ? (
                    <div className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs">
                      {msg.message}
                    </div>
                  ) : (
                    <div className={`max-w-[80%] ${selectedPeer ? '' : 'w-full'}`}>
                      <div className={`p-3 rounded-lg ${
                        selectedPeer 
                          ? (msg.sent 
                              ? 'bg-green-600 text-white rounded-br-sm ml-auto' 
                              : 'bg-slate-700 text-white rounded-bl-sm')
                          : 'bg-blue-600 text-white rounded-tl-sm'
                      }`}>
                        <div className="text-sm">{msg.message}</div>
                        {selectedPeer && msg.sent && (
                          <div className="text-xs text-green-200 mt-1 text-right">✓</div>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        {!selectedPeer && (
                          <>
                            <span className="text-lg">{msg.avatar}</span>
                            <span>{msg.user}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{msg.time}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {!showPeerList && (
            /* Message Input */
            <div className="flex gap-2 pt-3 border-t border-slate-600">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={selectedPeer ? `Message ${selectedPeer.name}...` : "Type your message..."}
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
          )}
        </DialogContent>
      </Dialog>

      {/* Scan Documents Modal */}
      <Dialog open={showScanModal} onOpenChange={setShowScanModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-cyan-400" />
              Scan Documents
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {!selectedFile ? (
              /* File Selection */
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8">
                <div className="text-center">
                  <ScanLine className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Upload Document</h3>
                  <p className="text-slate-400 mb-4">
                    Select a PDF, JPG, PNG, or WebP file to scan and extract text
                  </p>
                  <input
                    type="file"
                    id="document-upload"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileSelect}
                  />
                  <Button
                    onClick={() => document.getElementById('document-upload').click()}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    <ScanLine className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>
            ) : !scanResults ? (
              /* File Selected - Ready to Scan */
              <div className="space-y-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-slate-400 text-sm">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={simulateScanDocument}
                    disabled={isScanning}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                  >
                    {isScanning ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Scanning...
                      </>
                    ) : (
                      <>
                        <ScanLine className="w-4 h-4 mr-2" />
                        Scan Document
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetScan}
                    variant="outline"
                    className="border-slate-600 text-slate-200"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* Scan Results */
              <div className="space-y-6">
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <CheckSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Scan Complete</h3>
                      <p className="text-slate-400 text-sm">Confidence: {scanResults.confidence}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-slate-400">File Name</p>
                      <p className="text-white">{scanResults.fileName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Document Type</p>
                      <p className="text-white">{scanResults.documentType}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-white font-medium">Extracted Text</h4>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <pre className="text-slate-200 text-sm whitespace-pre-wrap font-mono">
                      {scanResults.extractedText}
                    </pre>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-white font-medium">Quick Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {scanResults.suggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-200 hover:bg-slate-600"
                        onClick={() => {
                          // Handle suggestion actions
                          if (suggestion.includes('Company Purchase')) handleNavigate('/list/purchases');
                          else if (suggestion.includes('Cash Out')) handleNavigate('/cash-out');
                          else if (suggestion.includes('Expense')) handleNavigate('/list/expenses');
                          setShowScanModal(false);
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={resetScan}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                  >
                    Scan Another
                  </Button>
                  <Button
                    onClick={() => setShowScanModal(false)}
                    variant="outline"
                    className="border-slate-600 text-slate-200"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
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

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Export Business Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-slate-300">
              <p>Export all data for "{activeBusiness.name}" including:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Cash entries and bank records</li>
                <li>Customers and suppliers</li>
                <li>Products and inventory</li>
                <li>Expenses and invoices</li>
                <li>Fuel dispenser data</li>
                <li>All other business records</li>
              </ul>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg">
              <p className="text-sm text-slate-300">
                <strong>Data Size:</strong> ~{Math.round(getDataSize() / 1024)} KB
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Exported file will be in JSON format
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setShowExportDialog(false)}
                variant="outline"
                className="border-slate-600 text-slate-200 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleExportBusiness();
                  setShowExportDialog(false);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Import Business Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-slate-300">
              <p className="mb-2">Choose how to import the business data:</p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-orange-900/20 border border-orange-700/50 p-3 rounded-lg">
                <h4 className="text-orange-300 font-medium mb-1">⚠️ Import into Current Business</h4>
                <p className="text-sm text-slate-300 mb-2">
                  This will <strong>overwrite all existing data</strong> in "{activeBusiness.name}"
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => handleImportBusiness(e.target.files[0], { createNew: false })}
                  className="text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
                />
              </div>

              <div className="bg-green-900/20 border border-green-700/50 p-3 rounded-lg">
                <h4 className="text-green-300 font-medium mb-1">✅ Create New Business</h4>
                <p className="text-sm text-slate-300 mb-2">
                  Import as a new business (recommended - keeps existing data safe)
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => handleImportBusiness(e.target.files[0], { createNew: true, switchTo: true })}
                  className="text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                />
              </div>
            </div>

            <div className="text-xs text-slate-400">
              <p><strong>Supported format:</strong> JSON files exported from this application</p>
              <p><strong>File size limit:</strong> 10MB</p>
            </div>
            
            <Button
              onClick={() => setShowImportDialog(false)}
              variant="outline"
              className="w-full border-slate-600 text-slate-200 hover:bg-slate-700"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
