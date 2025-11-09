import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Filter, Download, UserPlus, TrendingUp, AlertCircle, Phone, Mail, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';
import { useRole } from '../contexts/RoleContext';

export default function CustomersDebtors() {
  const navigate = useNavigate();
  const { getData, setData, activeBusiness } = useBusiness();
  const { hasPermission } = useRole();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('customers'); // Tab state: 'customers' or 'debtors'
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    creditLimit: '',
    openingBalance: ''
  });

  // Get customers and debtors data
  const customers = getData('customers', []);
  const debtors = getData('debtors', []);

  // Sample customers
  const sampleCustomers = customers.length > 0 ? customers : [
    { id: 1, name: 'Rajesh Enterprises', phone: '9876543210', email: 'rajesh@example.com', balance: 25000, creditLimit: 50000, lastTransaction: '2025-01-10', status: 'active', type: 'customer' },
    { id: 2, name: 'Sharma Transport', phone: '9876543211', email: 'sharma@example.com', balance: 15000, creditLimit: 30000, lastTransaction: '2025-01-09', status: 'active', type: 'customer' },
    { id: 3, name: 'Kumar Industries', phone: '9876543212', email: 'kumar@example.com', balance: 45000, creditLimit: 50000, lastTransaction: '2025-01-08', status: 'warning', type: 'customer' },
    { id: 4, name: 'Patel & Sons', phone: '9876543213', email: 'patel@example.com', balance: 8000, creditLimit: 20000, lastTransaction: '2025-01-07', status: 'active', type: 'customer' },
  ];

  // Sample debtors
  const sampleDebtors = debtors.length > 0 ? debtors : [
    { id: 5, name: 'Verma Construction', phone: '9876543214', email: 'verma@example.com', balance: 35000, creditLimit: 60000, lastTransaction: '2025-01-11', status: 'active', type: 'debtor' },
    { id: 6, name: 'Gupta Traders', phone: '9876543215', email: 'gupta@example.com', balance: 50000, creditLimit: 70000, lastTransaction: '2025-01-10', status: 'warning', type: 'debtor' },
    { id: 7, name: 'Singh Motors', phone: '9876543216', email: 'singh@example.com', balance: 20000, creditLimit: 40000, lastTransaction: '2025-01-09', status: 'active', type: 'debtor' },
    { id: 8, name: 'Yadav Supplies', phone: '9876543217', email: 'yadav@example.com', balance: 12000, creditLimit: 25000, lastTransaction: '2025-01-08', status: 'active', type: 'debtor' },
  ];

  // Get current list based on active tab
  const currentList = activeTab === 'customers' ? sampleCustomers : sampleDebtors;

  // Calculate totals for current tab
  const totalReceivable = currentList.reduce((sum, c) => sum + c.balance, 0);
  const activeCount = currentList.filter(c => c.status === 'active').length;
  const overdueCount = currentList.filter(c => c.status === 'warning').length;
  const avgBalance = currentList.length > 0 ? totalReceivable / currentList.length : 0;

  // Filter current list
  const filteredCustomers = currentList.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAddCustomer = () => {
    const customer = {
      id: Date.now(),
      ...newCustomer,
      balance: parseFloat(newCustomer.openingBalance || 0),
      status: 'active',
      lastTransaction: new Date().toISOString().split('T')[0]
    };
    setData('customers', [...customers, customer]);
    setShowAddDialog(false);
    setNewCustomer({ name: '', phone: '', email: '', address: '', creditLimit: '', openingBalance: '' });
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsDialog(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Customers / Debtors (देनदार)</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-green-400">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => setActiveTab('customers')}
            className={`flex-1 ${
              activeTab === 'customers'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Customers
          </Button>
          <Button
            onClick={() => setActiveTab('debtors')}
            className={`flex-1 ${
              activeTab === 'debtors'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Debtors (देनदार)
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-green-100">Total Receivable</p>
              <p className="text-lg font-bold text-white">₹{totalReceivable.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-white" />
                <span className="text-xs text-white">{currentList.length} {activeTab === 'customers' ? 'customers' : 'debtors'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-blue-100">Avg Balance</p>
              <p className="text-lg font-bold text-white">₹{avgBalance.toFixed(0)}</p>
              <div className="flex items-center gap-1 mt-1">
                <IndianRupee className="w-3 h-3 text-white" />
                <span className="text-xs text-white">per {activeTab === 'customers' ? 'customer' : 'debtor'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-purple-100">Active</p>
              <p className="text-lg font-bold text-white">{activeCount}</p>
              <div className="flex items-center gap-1 mt-1">
                <UserPlus className="w-3 h-3 text-white" />
                <span className="text-xs text-white">in good standing</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-red-600 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-orange-100">Overdue</p>
              <p className="text-lg font-bold text-white">{overdueCount}</p>
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 text-white" />
                <span className="text-xs text-white">needs attention</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customers..."
                  className="bg-slate-700 border-slate-600 text-white pl-10 h-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white h-9">
                  <Filter className="w-4 h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="warning">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        <div className="space-y-3">
          {filteredCustomers.map(customer => (
            <Card 
              key={customer.id} 
              className="bg-slate-800 border-slate-700 cursor-pointer hover:border-green-500 transition-colors"
              onClick={() => handleCustomerClick(customer)}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${activeTab === 'debtors' ? 'text-red-400 bg-red-500/10 px-2 py-1 rounded' : 'text-white'}`}>{customer.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {customer.phone}
                      </span>
                      {customer.email && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {customer.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">₹{customer.balance.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Outstanding</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                  <span className="text-xs text-slate-400">Limit: ₹{customer.creditLimit.toLocaleString()}</span>
                  <span className="text-xs text-slate-400">Last: {customer.lastTransaction}</span>
                  {customer.status === 'warning' && (
                    <span className="text-xs bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded">Overdue</span>
                  )}
                </div>
                <div className="mt-2 bg-slate-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${customer.balance / customer.creditLimit > 0.8 ? 'bg-red-400' : 'bg-green-400'}`}
                    style={{ width: `${(customer.balance / customer.creditLimit * 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Customer Name"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <Input
              placeholder="Phone Number"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <Input
              placeholder="Email (optional)"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <Input
              placeholder="Address"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <Input
              placeholder="Credit Limit"
              type="number"
              value={newCustomer.creditLimit}
              onChange={(e) => setNewCustomer({...newCustomer, creditLimit: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <Input
              placeholder="Opening Balance"
              type="number"
              value={newCustomer.openingBalance}
              onChange={(e) => setNewCustomer({...newCustomer, openingBalance: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddCustomer} className="flex-1 bg-green-600 hover:bg-green-700">
                Add Customer
              </Button>
              <Button onClick={() => setShowAddDialog(false)} variant="outline" className="border-slate-600">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      {selectedCustomer && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>{selectedCustomer.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-700 rounded">
                  <p className="text-xs text-slate-400">Outstanding</p>
                  <p className="text-lg font-bold text-green-400">₹{selectedCustomer.balance.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-700 rounded">
                  <p className="text-xs text-slate-400">Credit Limit</p>
                  <p className="text-lg font-bold text-blue-400">₹{selectedCustomer.creditLimit.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="text-slate-400">Phone:</span> {selectedCustomer.phone}</p>
                <p><span className="text-slate-400">Email:</span> {selectedCustomer.email}</p>
                <p><span className="text-slate-400">Last Transaction:</span> {selectedCustomer.lastTransaction}</p>
                <p><span className="text-slate-400">Status:</span> 
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${selectedCustomer.status === 'active' ? 'bg-green-900/50 text-green-300' : 'bg-orange-900/50 text-orange-300'}`}>
                    {selectedCustomer.status === 'active' ? 'Active' : 'Overdue'}
                  </span>
                </p>
              </div>
              <Button onClick={() => setShowDetailsDialog(false)} className="w-full">Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-50"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}