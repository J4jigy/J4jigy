import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Wallet, TrendingUp, TrendingDown, DollarSign, IndianRupee, Download, Filter, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';
import { useRole } from '../contexts/RoleContext';

export default function CashEnhanced() {
  const navigate = useNavigate();
  const { getData, setData, activeBusiness } = useBusiness();
  const { hasPermission } = useRole();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [transactionType, setTransactionType] = useState('in');

  // Get cash data
  const cashTransactions = getData('cash_entries', []);

  // Sample cash transactions
  const sampleTransactions = cashTransactions.length > 0 ? cashTransactions : [
    { id: 1, type: 'in', description: 'Petrol Sales - Cash', amount: 45000, date: '2025-01-10', category: 'Sales', paymentMode: 'Cash' },
    { id: 2, type: 'out', description: 'Office Supplies Purchase', amount: 2500, date: '2025-01-10', category: 'Expense', paymentMode: 'Cash' },
    { id: 3, type: 'in', description: 'Diesel Sales - Cash', amount: 38000, date: '2025-01-09', category: 'Sales', paymentMode: 'Cash' },
    { id: 4, type: 'out', description: 'Staff Petty Cash', amount: 5000, date: '2025-01-09', category: 'Salary', paymentMode: 'Cash' },
    { id: 5, type: 'in', description: 'Lubricant Sales', amount: 12000, date: '2025-01-08', category: 'Sales', paymentMode: 'Cash' },
    { id: 6, type: 'out', description: 'Transportation Expense', amount: 3500, date: '2025-01-08', category: 'Expense', paymentMode: 'Cash' },
    { id: 7, type: 'in', description: 'Customer Payment', amount: 15000, date: '2025-01-07', category: 'Collection', paymentMode: 'Cash' },
    { id: 8, type: 'out', description: 'Maintenance', amount: 8000, date: '2025-01-07', category: 'Expense', paymentMode: 'Cash' },
  ];

  // Calculate totals
  const totalCashIn = sampleTransactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
  const totalCashOut = sampleTransactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);
  const cashBalance = totalCashIn - totalCashOut;
  const transactionCount = sampleTransactions.length;

  // Today's transactions
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = sampleTransactions.filter(t => t.date === today);
  const todayCashIn = todayTransactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
  const todayCashOut = todayTransactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);

  // Filter transactions
  const filteredTransactions = sampleTransactions.filter(txn => {
    const matchesSearch = txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         txn.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || txn.type === filterType;
    
    // Period filter
    let matchesPeriod = true;
    if (filterPeriod === 'today') {
      matchesPeriod = txn.date === today;
    } else if (filterPeriod === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesPeriod = new Date(txn.date) >= weekAgo;
    } else if (filterPeriod === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesPeriod = new Date(txn.date) >= monthAgo;
    }
    
    return matchesSearch && matchesType && matchesPeriod;
  });

  // Categories breakdown
  const categories = {};
  sampleTransactions.forEach(txn => {
    if (!categories[txn.category]) {
      categories[txn.category] = { in: 0, out: 0 };
    }
    if (txn.type === 'in') {
      categories[txn.category].in += txn.amount;
    } else {
      categories[txn.category].out += txn.amount;
    }
  });

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
              <h1 className="text-lg font-bold">Cash Management</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-green-400">
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Cash Balance Card */}
        <Card className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 border-0 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100 mb-1">Current Cash Balance</p>
                <p className="text-3xl font-bold text-white">₹{cashBalance.toLocaleString()}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="w-4 h-4 text-white" />
                    <span className="text-xs text-white">In: ₹{totalCashIn.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                    <span className="text-xs text-white">Out: ₹{totalCashOut.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/20 rounded-full">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-blue-100">Today In</p>
              <p className="text-lg font-bold text-white">₹{todayCashIn.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-white" />
                <span className="text-xs text-white">Cash received</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-red-100">Today Out</p>
              <p className="text-lg font-bold text-white">₹{todayCashOut.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3 text-white" />
                <span className="text-xs text-white">Cash paid</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-purple-100">Transactions</p>
              <p className="text-lg font-bold text-white">{transactionCount}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-white">Total entries</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-orange-100">Net Flow</p>
              <p className="text-lg font-bold text-white">{todayCashIn - todayCashOut >= 0 ? '+' : ''}₹{(todayCashIn - todayCashOut).toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-white">Today</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Breakdown */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-3">
            <h3 className="text-sm font-bold text-white mb-2">Categories</h3>
            <div className="space-y-2">
              {Object.entries(categories).slice(0, 4).map(([category, amounts]) => (
                <div key={category} className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">{category}</span>
                  <div className="flex gap-2">
                    <span className="text-green-400">+₹{amounts.in.toLocaleString()}</span>
                    <span className="text-red-400">-₹{amounts.out.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                  className="bg-slate-700 border-slate-600 text-white pl-10 h-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="flex-1 bg-slate-700 border-slate-600 text-white h-9">
                    <Filter className="w-4 h-4 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="in">Cash In</SelectItem>
                    <SelectItem value="out">Cash Out</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-28 bg-slate-700 border-slate-600 text-white h-9">
                    <Calendar className="w-4 h-4 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <h2 className="text-sm font-bold text-white mb-3">Transactions</h2>
        <div className="space-y-3">
          {filteredTransactions.map(txn => (
            <Card key={txn.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <div className={`p-2 rounded-lg ${txn.type === 'in' ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                      {txn.type === 'in' ? (
                        <ArrowDownRight className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{txn.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{txn.category}</span>
                        <span className="text-xs text-slate-400">{txn.paymentMode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${txn.type === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                      {txn.type === 'in' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">{txn.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Add Cash Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="in">Cash In (Received)</SelectItem>
                <SelectItem value="out">Cash Out (Paid)</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Amount" type="number" className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Description" className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Category (e.g., Sales, Expense)" className="bg-slate-700 border-slate-600 text-white" />
            <Input type="date" className="bg-slate-700 border-slate-600 text-white" />
            <div className="flex gap-2">
              <Button onClick={() => setShowAddDialog(false)} className={`flex-1 ${transactionType === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                Add Transaction
              </Button>
              <Button onClick={() => setShowAddDialog(false)} variant="outline" className="border-slate-600">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
