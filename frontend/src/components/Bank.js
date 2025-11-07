import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Landmark, TrendingUp, TrendingDown, CreditCard, Building2, Download, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';
import { useRole } from '../contexts/RoleContext';

export default function Bank() {
  const navigate = useNavigate();
  const { getData, setData, activeBusiness } = useBusiness();
  const { hasPermission } = useRole();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);

  // Get bank data
  const bankAccounts = getData('bank_accounts', []);
  const bankTransactions = getData('bank_transactions', []);

  // Sample bank accounts
  const sampleAccounts = bankAccounts.length > 0 ? bankAccounts : [
    { id: 1, name: 'HDFC Bank - Current', accountNumber: '****1234', balance: 450000, type: 'current', bank: 'HDFC Bank' },
    { id: 2, name: 'SBI Bank - Savings', accountNumber: '****5678', balance: 250000, type: 'savings', bank: 'State Bank of India' },
    { id: 3, name: 'ICICI Bank - Current', accountNumber: '****9012', balance: 180000, type: 'current', bank: 'ICICI Bank' },
  ];

  // Sample transactions
  const sampleTransactions = bankTransactions.length > 0 ? bankTransactions : [
    { id: 1, type: 'credit', description: 'Customer Payment - Rajesh Enterprises', amount: 25000, date: '2025-01-10', account: 1, category: 'Sales' },
    { id: 2, type: 'debit', description: 'Supplier Payment - Oil India Ltd', amount: 150000, date: '2025-01-09', account: 1, category: 'Purchase' },
    { id: 3, type: 'credit', description: 'Customer Payment - Sharma Transport', amount: 15000, date: '2025-01-09', account: 2, category: 'Sales' },
    { id: 4, type: 'debit', description: 'Salary Payment', amount: 45000, date: '2025-01-08', account: 1, category: 'Salary' },
    { id: 5, type: 'credit', description: 'Fuel Sale Payment', amount: 85000, date: '2025-01-08', account: 2, category: 'Sales' },
    { id: 6, type: 'debit', description: 'Equipment Purchase', amount: 25000, date: '2025-01-07', account: 3, category: 'Asset' },
  ];

  // Calculate totals
  const totalBalance = sampleAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalCredit = sampleTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = sampleTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
  const netFlow = totalCredit - totalDebit;

  // Filter transactions
  const filteredTransactions = sampleTransactions.filter(txn => {
    const matchesSearch = txn.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || txn.type === filterType;
    const matchesAccount = selectedAccount === 'all' || txn.account === parseInt(selectedAccount);
    return matchesSearch && matchesType && matchesAccount;
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
              <h1 className="text-lg font-bold">Bank Accounts</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-green-400">
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={() => setShowTransactionDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" />
              Add Transaction
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Large Balance Card */}
        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-0 mb-4">
          <CardContent className="p-4">
            <p className="text-sm text-emerald-100 mb-2">Current Bank Balance</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-white mb-3">₹{totalBalance.toLocaleString()}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="w-4 h-4 text-white" />
                    <span className="text-white">In: ₹{totalCredit.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                    <span className="text-white">Out: ₹{totalDebit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Landmark className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-blue-100 mb-1">Today In</p>
              <p className="text-xl font-bold text-white mb-1">₹0</p>
              <div className="flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3 text-white" />
                <span className="text-xs text-white">Money received</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-red-100 mb-1">Today Out</p>
              <p className="text-xl font-bold text-white mb-1">₹0</p>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-white" />
                <span className="text-xs text-white">Money paid</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-purple-100 mb-1">Transactions</p>
              <p className="text-xl font-bold text-white mb-1">{sampleTransactions.length}</p>
              <span className="text-xs text-white">Total entries</span>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-orange-100 mb-1">Net Flow</p>
              <p className="text-xl font-bold text-white mb-1">{netFlow >= 0 ? '+' : ''}₹{netFlow.toLocaleString()}</p>
              <span className="text-xs text-white">Today</span>
            </CardContent>
          </Card>
        </div>

        {/* Categories Section */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-white mb-3">Categories</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Deposits</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-green-400">+₹{totalCredit.toLocaleString()}</span>
                  <span className="text-sm text-red-400">-₹0</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Withdrawals</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-green-400">+₹0</span>
                  <span className="text-sm text-red-400">-₹{totalDebit.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Transfers</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-green-400">+₹0</span>
                  <span className="text-sm text-red-400">-₹0</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Interest</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-green-400">+₹0</span>
                  <span className="text-sm text-red-400">-₹0</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Accounts */}
        <h2 className="text-sm font-bold text-white mb-3">Bank Accounts</h2>
        <div className="space-y-3 mb-4">
          {sampleAccounts.map(account => (
            <Card key={account.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-900/30 rounded-lg">
                      <Building2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{account.name}</p>
                      <p className="text-xs text-slate-400">{account.bank} • {account.accountNumber}</p>
                      <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded mt-1 inline-block">
                        {account.type === 'current' ? 'Current Account' : 'Savings Account'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-400">₹{account.balance.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <h2 className="text-sm font-bold text-white mb-3">Recent Transactions</h2>
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
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="flex-1 bg-slate-700 border-slate-600 text-white h-9">
                    <SelectValue placeholder="All Accounts" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All Accounts</SelectItem>
                    {sampleAccounts.map(acc => (
                      <SelectItem key={acc.id} value={String(acc.id)}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white h-9">
                    <Filter className="w-4 h-4 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.map(txn => (
            <Card key={txn.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-2">
                    <div className={`p-2 rounded-lg ${txn.type === 'credit' ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                      {txn.type === 'credit' ? (
                        <ArrowDownRight className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{txn.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{sampleAccounts.find(a => a.id === txn.account)?.name}</span>
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{txn.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${txn.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                      {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">{txn.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Account Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Account Name" className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Bank Name" className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Account Number" className="bg-slate-700 border-slate-600 text-white" />
            <Select>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Account Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="current">Current Account</SelectItem>
                <SelectItem value="savings">Savings Account</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Opening Balance" type="number" className="bg-slate-700 border-slate-600 text-white" />
            <div className="flex gap-2">
              <Button onClick={() => setShowAddDialog(false)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Add Account
              </Button>
              <Button onClick={() => setShowAddDialog(false)} variant="outline" className="border-slate-600">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {sampleAccounts.map(acc => (
                  <SelectItem key={acc.id} value={String(acc.id)}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="credit">Credit (Money In)</SelectItem>
                <SelectItem value="debit">Debit (Money Out)</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Amount" type="number" className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Description" className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Category" className="bg-slate-700 border-slate-600 text-white" />
            <Input type="date" className="bg-slate-700 border-slate-600 text-white" />
            <div className="flex gap-2">
              <Button onClick={() => setShowTransactionDialog(false)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Add Transaction
              </Button>
              <Button onClick={() => setShowTransactionDialog(false)} variant="outline" className="border-slate-600">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}