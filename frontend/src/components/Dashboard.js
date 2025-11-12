import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useBusiness } from '../contexts/BusinessContext';
import { useRole } from '../contexts/RoleContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Home, UserCircle, ShieldCheck, Users, Truck, Star, ShoppingCart, Zap, Building, Coins, Receipt, Package, PieChart, BarChart3, Gift, MessageCircle, Send, Plus, Minus, Shield, Settings, ChevronDown, CheckSquare, Share2, Copy, ArrowLeft, ScanLine, FileBarChart, Landmark, Fuel, Download, Upload, TrendingUp, ClipboardList, ArrowDownRight, ArrowUpRight, Calendar, Calculator, Edit2, X } from 'lucide-react';
import EnhancedChat from './EnhancedChat';

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

export default function Dashboard({ user, onLogout }) {
  // Restore activeTab from localStorage or default to 'business'
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('dashboardActiveTab') || 'business';
  });
  const [summary, setSummary] = useState({ you_will_give: 0, you_will_receive: 0, net_position: 0 });
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showBusinessProfileDialog, setShowBusinessProfileDialog] = useState(false);
  const [showInviteCodesDialog, setShowInviteCodesDialog] = useState(false);
  const [inviteCodes, setInviteCodes] = useState([]);
  
  // Use BusinessContext for business management
  const {
    businesses,
    activeBusiness,
    switchBusiness,
    addBusiness,
    updateBusiness,
    deleteBusiness,
    exportBusiness,
    importBusiness,
    getDataSize,
    calculateProfileStrength
  } = useBusiness();
  
  // Use RoleContext for permission-based UI
  const { hasPermission, userRole, standardRoles } = useRole();
  
  const [showBusinessDialog, setShowBusinessDialog] = useState(false);
  const [showAddBusinessDialog, setShowAddBusinessDialog] = useState(false);
  const [showEditBusinessDialog, setShowEditBusinessDialog] = useState(false);
  const [businessToEdit, setBusinessToEdit] = useState(null);
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

  // Navigation with chat hiding and tab state saving
  const handleNavigate = (path) => {
    // Save current active tab to localStorage before navigating
    localStorage.setItem('dashboardActiveTab', activeTab);
    setShowFloatingChat(false);
    navigate(path);
  };

  // Navigation with chat hiding and tab state saving

  const businessTiles = [
    { name: 'Customers', subtitle: 'Debtors', icon: Users, iconColor: 'text-green-400', permissions: ['customers_manage', 'customers_view'] },
    { name: 'Suppliers', subtitle: 'Creditors', icon: Truck, iconColor: 'text-indigo-400', permissions: ['suppliers_manage', 'suppliers_view'] },
    { name: 'Daily Sales', subtitle: 'Report', icon: TrendingUp, iconColor: 'text-cyan-400', permissions: ['reports_view', 'cash_view'] },
    { name: 'Company', subtitle: 'Purchase', icon: ShoppingCart, iconColor: 'text-orange-400', permissions: ['expenses_manage'] },
    { name: 'Stock', subtitle: 'Management', icon: Package, iconColor: 'text-orange-400', permissions: ['inventory_manage', 'inventory_view'] },
    { name: 'Staff', subtitle: '', icon: Users, iconColor: 'text-purple-400', permissions: ['staff_manage'] },
    { name: 'Challan Gate Pass', subtitle: '', icon: ClipboardList, iconColor: 'text-cyan-400', permissions: ['reports_view'] },
    { name: 'Bills &', subtitle: 'Invoices', icon: FileBarChart, iconColor: 'text-yellow-400', permissions: ['reports_view'] },
  ];

  const financeTiles = [
    { name: 'Bank', subtitle: '', icon: Landmark, iconColor: 'text-blue-400', permissions: ['bank_manage', 'cash_view'] },
    { name: 'Cash', subtitle: '', icon: Coins, iconColor: 'text-green-500', permissions: ['cash_in', 'cash_out', 'cash_view'] },
    { name: 'Bills', subtitle: 'Recharge', icon: Zap, iconColor: 'text-green-400', permissions: ['expenses_manage'] },
    { name: 'Rent', subtitle: '', icon: Building, iconColor: 'text-blue-400', permissions: ['expenses_manage'] },
    { name: 'Transport', subtitle: 'Expense', icon: Truck, iconColor: 'text-orange-400', permissions: ['expenses_manage'] },
    { name: 'Other', subtitle: 'Expenses', icon: Coins, iconColor: 'text-purple-400', permissions: ['expenses_manage'] },
    { name: 'Profit', subtitle: 'Loss', icon: PieChart, iconColor: 'text-emerald-400', permissions: ['reports_view', 'analytics_view'] },
    { name: 'Balance', subtitle: 'Sheet', icon: BarChart3, iconColor: 'text-indigo-400', permissions: ['reports_view', 'analytics_view'] },
  ];

  const personalTiles = [
    { name: 'Offers &', subtitle: 'Discounts', icon: Gift, iconColor: 'text-red-400', permissions: [] }, // Available to all
    { name: 'Scan', subtitle: 'Documents', icon: ScanLine, iconColor: 'text-cyan-400', permissions: [] }, // Available to all
    { name: 'To Do List', subtitle: '', icon: CheckSquare, iconColor: 'text-green-400', permissions: [] }, // Available to all
    { name: 'Calendar', subtitle: '', icon: Calendar, iconColor: 'text-pink-400', permissions: [] }, // Available to all
    { name: 'Calculator', subtitle: '', icon: Calculator, iconColor: 'text-cyan-400', permissions: [] }, // Available to all
  ];

  const getTilesForTab = (tab) => {
    let tiles = [];
    
    switch (tab) {
      case 'business': 
        tiles = businessTiles;
        break;
      case 'finance': 
        tiles = financeTiles;
        break;
      case 'personal': 
        tiles = personalTiles;
        break;
      default: 
        tiles = businessTiles;
    }
    
    // Filter tiles based on user permissions
    return tiles.filter(tile => {
      // If tile has no permissions specified, it's available to all
      if (!tile.permissions || tile.permissions.length === 0) {
        return true;
      }
      
      // Check if user has any of the required permissions
      return tile.permissions.some(permission => hasPermission(permission));
    });
  };

  const handleTileClick = (tile) => {
    const name = `${tile.name} ${tile.subtitle}`.trim().toLowerCase();
    if (name.startsWith('bank')) handleNavigate('/bank');
    else if (name.startsWith('customers')) handleNavigate('/customers-debtors');
    else if (name.startsWith('suppliers')) handleNavigate('/suppliers-creditors');
    else if (name.startsWith('cash')) handleNavigate('/cash-enhanced');
    else if (name.startsWith('daily sales')) handleNavigate('/daily-sales-report');
    else if (name.startsWith('community')) handleNavigate('/community-ratings');
    else if (name.startsWith('staff')) handleNavigate('/staff');
    else if (name.startsWith('rent')) handleNavigate('/rent-management');
    else if (name.startsWith('transport')) handleNavigate('/transport-expense');
    else if (name.startsWith('offers')) handleNavigate('/offers-discounts');
    else if (name.startsWith('stock')) handleNavigate('/stock-management');
    else if (name.startsWith('profit')) handleNavigate('/profit-loss');
    else if (name.startsWith('balance')) handleNavigate('/balance-sheet');
    else if (name.startsWith('company purchase') || name.startsWith('company')) handleNavigate('/company-purchase');
    else if (name.startsWith('bills recharge') || tile.name === 'Bills') handleNavigate('/bills-recharge');
    else if (name.startsWith('other')) handleNavigate('/other-expenses');
    else if (name.startsWith('challan')) handleNavigate('/challan');
    else if (name.startsWith('bills &')) handleNavigate('/bills-invoices');
    else if (name.startsWith('to do list')) handleNavigate('/todo');
    else if (name.startsWith('scan documents') || tile.name === 'Scan') handleNavigate('/scan-documents');
    else if (name.startsWith('calendar')) handleNavigate('/calendar');
    else if (name.startsWith('calculator')) handleNavigate('/calculator');
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
              <Button variant="ghost" className="text-white hover:bg-slate-700 flex flex-col items-center gap-1 py-2 px-3">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-orange-400" />
                  <span className="font-medium">{activeBusiness.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
                {(() => {
                  const profileStrength = calculateProfileStrength(activeBusiness);
                  return (
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1 bg-slate-700 rounded-full h-1.5 min-w-[120px]">
                        <div 
                          className={`h-1.5 rounded-full transition-all ${
                            profileStrength.level === 'Low' ? 'bg-red-500' : 
                            profileStrength.level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${profileStrength.percentage}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${profileStrength.color}`}>
                        {profileStrength.level}
                      </span>
                    </div>
                  );
                })()}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Switch Business</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  {businesses.map((business) => {
                    const profileStrength = calculateProfileStrength(business);
                    return (
                    <div key={business.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          onClick={() => handleBusinessSwitch(business)}
                          variant={activeBusiness.id === business.id ? "default" : "ghost"}
                          className={`flex-1 justify-start ${
                            activeBusiness.id === business.id 
                              ? 'bg-blue-600 hover:bg-blue-700' 
                              : 'text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          <Building className="w-4 h-4 mr-2" />
                          <div className="text-left flex-1">
                            <div className="font-medium">{business.name}</div>
                            <div className="text-xs opacity-70">{business.type}</div>
                          </div>
                        </Button>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setBusinessToEdit(business);
                          setShowBusinessDialog(false);
                          setShowBusinessProfileDialog(true);
                        }}
                        variant="ghost"
                        size="sm" 
                        className="text-purple-400 hover:bg-purple-900/20 hover:text-purple-300 shrink-0"
                        title="Business Profile"
                      >
                        <UserCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setBusinessToEdit(business);
                          setShowBusinessDialog(false);
                          setShowEditBusinessDialog(true);
                        }}
                        variant="ghost"
                        size="sm" 
                        className="text-blue-400 hover:bg-blue-900/20 hover:text-blue-300 shrink-0"
                        title="Edit Business"
                      >
                        <Edit2 className="w-4 h-4" />
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
                            title="Delete Business"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Profile Strength Measurement Scale - Clickable */}
                      <div 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setBusinessToEdit(business);
                          setShowBusinessDialog(false);
                          setShowBusinessProfileDialog(true);
                        }}
                        className="cursor-pointer hover:opacity-80 transition-opacity px-2"
                        title="Click to complete business profile"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                profileStrength.level === 'Low' ? 'bg-red-500' : 
                                profileStrength.level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${profileStrength.percentage}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${profileStrength.color} min-w-[60px]`}>
                            {profileStrength.level} {Math.round(profileStrength.percentage)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
          {/* Role Badge */}
          {userRole && standardRoles && standardRoles[userRole] && (
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded-lg border border-slate-600">
              {React.createElement(standardRoles[userRole].icon, { 
                className: `w-4 h-4 ${standardRoles[userRole].color}` 
              })}
              <span className={`text-xs font-medium ${standardRoles[userRole].color}`}>
                {standardRoles[userRole].name}
              </span>
            </div>
          )}
          
          {/* Profile Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            data-testid="profile-icon"
            onClick={() => setShowProfileDialog(true)}
          >
            <UserCircle className="w-6 h-6 text-slate-400" />
          </Button>

          {/* Profile Drawer - Sliding from Right */}
          {showProfileDialog && (
            <div 
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setShowProfileDialog(false)}
            >
              <div 
                className="fixed top-0 right-0 bottom-0 bg-slate-800 border-l-2 border-slate-700 animate-in slide-in-from-right duration-300 ease-out shadow-2xl"
                style={{ width: '80%', maxWidth: '400px' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-4 py-4 border-b border-slate-700 flex items-center justify-between">
                  <h2 className="text-white text-lg font-bold">Profile</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowProfileDialog(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto px-4 py-4 space-y-4" style={{ height: 'calc(100vh - 64px)' }}>
                  {/* User Info Card */}
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <UserCircle className="w-12 h-12 text-blue-400" />
                      <div>
                        <h3 className="text-white font-semibold">{user?.username || 'User'}</h3>
                        <p className="text-slate-400 text-sm">{userRole ? standardRoles[userRole]?.label : 'Member'}</p>
                        <p className="text-slate-400 text-xs">{user?.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Settings */}
                  <div>
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <UserCircle className="w-4 h-4 text-cyan-400" />
                      Account Settings
                    </h4>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => {
                          setShowProfileDialog(false);
                          setShowBusinessProfileDialog(true);
                        }} 
                        variant="ghost" 
                        className="w-full text-slate-200 hover:bg-slate-700 justify-start h-10"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full text-slate-200 hover:bg-slate-700 justify-start h-10"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="border-t border-slate-700 pt-3">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      Permissions
                    </h4>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => {
                          setShowProfileDialog(false);
                          handleNavigate('/staff');
                        }} 
                        variant="ghost" 
                        className="w-full text-slate-200 hover:bg-slate-700 justify-start h-10"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Manage Staff & Roles
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full text-slate-200 hover:bg-slate-700 justify-start h-10"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Access Control
                      </Button>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="border-t border-slate-700 pt-3">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-orange-400" />
                      Settings
                    </h4>
                    <div className="space-y-2">
                      <Button 
                        variant="ghost" 
                        className="w-full text-slate-200 hover:bg-slate-700 justify-start h-10"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Notifications
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full text-slate-200 hover:bg-slate-700 justify-start h-10"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Backup & Export
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full text-slate-200 hover:bg-slate-700 justify-start h-10"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        App Preferences
                      </Button>
                    </div>
                  </div>

                  {/* Help & Support */}
                  <div className="border-t border-slate-700 pt-3">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-green-400" />
                      Help & Support
                    </h4>
                    <div className="space-y-2">
                      <Button 
                        variant="ghost" 
                        className="w-full text-slate-200 hover:bg-slate-700 justify-start h-10"
                      >
                        <FileBarChart className="w-4 h-4 mr-2" />
                        User Guide
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full text-slate-200 hover:bg-slate-700 justify-start h-10"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Contact Support
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full text-slate-200 hover:bg-slate-700 justify-start h-10"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Rate App
                      </Button>
                    </div>
                  </div>

                  {/* Admin Panel (Only for Admins) */}
                  {(user?.is_admin || user?.role === 'admin' || user?.role === 'super_admin') && (
                    <div className="border-t border-slate-700 pt-3">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-400" />
                        Admin Panel
                      </h4>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => {
                            setShowProfileDialog(false);
                            handleNavigate('/admin');
                          }} 
                          variant="ghost" 
                          className="w-full text-slate-200 hover:bg-slate-700 justify-start h-10"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Security Dashboard
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Logout Button */}
                  <div className="border-t border-slate-700 pt-3 pb-2">
                    <Button 
                      onClick={onLogout} 
                      className="w-full bg-red-600 hover:bg-red-700 h-11"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="px-4 mb-3 mt-3">
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="bg-gradient-to-br from-red-800 to-red-900 border border-red-700/50 shadow-xl cursor-pointer hover:from-red-700 hover:to-red-800 transition-colors"
            onClick={() => handleNavigate('/list/payables')}
          >
            <CardContent className="p-2 text-center">
              <p className="text-lg font-bold text-white">₹ {Number(summary.you_will_give || 0).toLocaleString()}</p>
              <p className="text-red-200 text-xs">Total Payables</p>
            </CardContent>
          </Card>
          <Card 
            className="bg-gradient-to-br from-green-800 to-green-900 border border-green-700/50 shadow-xl cursor-pointer hover:from-green-700 hover:to-green-800 transition-colors"
            onClick={() => handleNavigate('/list/receivables')}
          >
            <CardContent className="p-2 text-center">
              <p className="text-lg font-bold text-white">₹ {Number(summary.you_will_receive || 0).toLocaleString()}</p>
              <p className="text-green-200 text-xs">Total Receivables</p>
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
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/80 border border-slate-700 rounded-lg mb-3">
            <TabsTrigger value="business" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-md">Business</TabsTrigger>
            <TabsTrigger value="finance" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-md">Finance</TabsTrigger>
            <TabsTrigger value="personal" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-md">Personal</TabsTrigger>
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
          {/* Staff Management Tab removed - now handled by Staff tile navigation */}
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
                className="flex-1 bg-red-600/20 hover:bg-red-600/40 border-2 border-red-500 text-red-400 hover:text-red-300 rounded-md flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Business Dialog */}
      <Dialog open={showEditBusinessDialog} onOpenChange={(open) => {
        setShowEditBusinessDialog(open);
        if (!open) {
          setBusinessToEdit(null);
        }
      }}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Business</DialogTitle>
          </DialogHeader>
          {businessToEdit && (
            <div className="space-y-4">
              <div>
                <Label className="text-slate-200">Business Name</Label>
                <Input
                  value={businessToEdit.name}
                  onChange={(e) => setBusinessToEdit({ ...businessToEdit, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <Label className="text-slate-200">Business Type</Label>
                <Select 
                  value={businessToEdit.type} 
                  onValueChange={(value) => setBusinessToEdit({ ...businessToEdit, type: value })}
                >
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
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    updateBusiness(businessToEdit.id, {
                      name: businessToEdit.name,
                      type: businessToEdit.type
                    });
                    setShowEditBusinessDialog(false);
                    setBusinessToEdit(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!businessToEdit.name.trim()}
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setShowEditBusinessDialog(false);
                    setBusinessToEdit(null);
                  }}
                  className="flex-1 bg-red-600/20 hover:bg-red-600/40 border-2 border-red-500 text-red-400 hover:text-red-300 rounded-md flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Business Profile Dialog */}
      <Dialog open={showBusinessProfileDialog} onOpenChange={(open) => {
        setShowBusinessProfileDialog(open);
        if (!open) {
          setBusinessToEdit(null);
        }
      }}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Business Profile</DialogTitle>
          </DialogHeader>
          {businessToEdit && (() => {
            const profileStrength = calculateProfileStrength(businessToEdit);
            return (
            <div className="space-y-4">
              {/* Profile Strength Indicator */}
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-200 font-medium">Profile Strength</span>
                  <span className={`font-bold ${profileStrength.color}`}>{profileStrength.level}</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      profileStrength.level === 'Low' ? 'bg-red-500' : 
                      profileStrength.level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${profileStrength.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{Math.round(profileStrength.percentage)}% complete</p>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-200">Business Name *</Label>
                  <Input
                    value={businessToEdit.name || ''}
                    onChange={(e) => setBusinessToEdit({ ...businessToEdit, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <Label className="text-slate-200">Business Type *</Label>
                  <Select 
                    value={businessToEdit.type || 'Retail'} 
                    onValueChange={(value) => setBusinessToEdit({ ...businessToEdit, type: value })}
                  >
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
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-200">Phone Number</Label>
                  <Input
                    value={businessToEdit.phone || ''}
                    onChange={(e) => setBusinessToEdit({ ...businessToEdit, phone: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                    placeholder="Enter phone number"
                    type="tel"
                  />
                </div>
                <div>
                  <Label className="text-slate-200">Email Address</Label>
                  <Input
                    value={businessToEdit.email || ''}
                    onChange={(e) => setBusinessToEdit({ ...businessToEdit, email: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                    placeholder="Enter email"
                    type="email"
                  />
                </div>
              </div>

              {/* Tax Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-200">GST Number</Label>
                  <Input
                    value={businessToEdit.gst || ''}
                    onChange={(e) => setBusinessToEdit({ ...businessToEdit, gst: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                    placeholder="Enter GST number"
                  />
                </div>
                <div>
                  <Label className="text-slate-200">PAN Number</Label>
                  <Input
                    value={businessToEdit.pan || ''}
                    onChange={(e) => setBusinessToEdit({ ...businessToEdit, pan: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                    placeholder="Enter PAN number"
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <Label className="text-slate-200">Website</Label>
                <Input
                  value={businessToEdit.website || ''}
                  onChange={(e) => setBusinessToEdit({ ...businessToEdit, website: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                  placeholder="https://example.com"
                  type="url"
                />
              </div>

              <div>
                <Label className="text-slate-200">Business Address</Label>
                <textarea
                  value={businessToEdit.address || ''}
                  onChange={(e) => setBusinessToEdit({ ...businessToEdit, address: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 text-white mt-1 p-2 rounded-md resize-none"
                  placeholder="Enter complete business address"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    console.log('📝 Saving business profile:', businessToEdit);
                    updateBusiness(businessToEdit.id, businessToEdit);
                    setShowBusinessProfileDialog(false);
                    setBusinessToEdit(null);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!businessToEdit.name?.trim()}
                >
                  Save Profile
                </Button>
                <Button
                  onClick={() => {
                    setShowBusinessProfileDialog(false);
                    setBusinessToEdit(null);
                  }}
                  className="flex-1 bg-red-600/20 hover:bg-red-600/40 border-2 border-red-500 text-red-400 hover:text-red-300 rounded-md flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </div>
            );
          })()}
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
                className="flex-1 bg-red-600/20 hover:bg-red-600/40 border-2 border-red-500 text-red-400 hover:text-red-300 rounded-md flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
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
      {showFloatingChat && !showProfileDialog && (
        <div className="fixed bottom-28 right-8 z-50 flex flex-col gap-3">
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

      {/* Enhanced Chat Dialog */}
      <EnhancedChat 
        open={showChatDialog} 
        onOpenChange={setShowChatDialog}
        userId={user?.id || user?.user_id}
      />

      {/* Scan Documents functionality moved to dedicated page */}

      {/* Cash In/Out Floating Buttons */}
      {!showProfileDialog && (
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
                className="bg-red-600/20 hover:bg-red-600/40 border-2 border-red-500 text-red-400 hover:text-red-300 rounded-md flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
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
              className="w-full bg-red-600/20 hover:bg-red-600/40 border-2 border-red-500 text-red-400 hover:text-red-300 rounded-md flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
