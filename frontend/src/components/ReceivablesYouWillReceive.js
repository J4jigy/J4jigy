import React, { useState } from 'react';
import { ArrowLeft, Download, Search, TrendingUp, Clock, CheckCircle, DollarSign, Users, AlertCircle, Plus, Phone, Mail, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';

export default function ReceivablesYouWillReceive() {
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  // Customer-focused receivables data matching the screenshot design
  const allCustomers = [
    { 
      id: 1, 
      name: 'Rajesh Enterprises', 
      phone: '9876543210', 
      email: 'rajesh@example.com', 
      outstandingAmount: 25000, 
      creditLimit: 50000, 
      lastTransaction: '2025-01-10',
      status: 'overdue',
      daysOverdue: 8,
      utilizationPercent: 50
    },
    { 
      id: 2, 
      name: 'Sharma Transport', 
      phone: '9876543211', 
      email: 'sharma@example.com', 
      outstandingAmount: 15000, 
      creditLimit: 30000, 
      lastTransaction: '2025-01-09',
      status: 'active',
      daysOverdue: 0,
      utilizationPercent: 50
    },
    { 
      id: 3, 
      name: 'Kumar Industries', 
      phone: '9876543212', 
      email: 'kumar@example.com', 
      outstandingAmount: 45000, 
      creditLimit: 75000, 
      lastTransaction: '2025-01-08',
      status: 'active',
      daysOverdue: 0,
      utilizationPercent: 60
    },
    { 
      id: 4, 
      name: 'Patel & Sons', 
      phone: '9876543213', 
      email: 'patel@example.com', 
      outstandingAmount: 8000, 
      creditLimit: 25000, 
      lastTransaction: '2025-01-07',
      status: 'active',
      daysOverdue: 0,
      utilizationPercent: 32
    },
  ];

  // Calculate summary statistics based on customers
  const totalReceivable = allCustomers.reduce((sum, customer) => sum + customer.outstandingAmount, 0);
  const totalCustomers = allCustomers.length;
  const avgBalance = totalCustomers > 0 ? totalReceivable / totalCustomers : 0;
  const activeCustomers = allCustomers.filter(c => c.status === 'active').length;
  const overdueCustomers = allCustomers.filter(c => c.status === 'overdue').length;

  // Apply search filter
  const searchedData = allCustomers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply filter
  let filteredData = searchedData;
  if (filterBy !== 'all') {
    if (filterBy === 'active') {
      filteredData = searchedData.filter(customer => customer.status === 'active');
    } else if (filterBy === 'overdue') {
      filteredData = searchedData.filter(customer => customer.status === 'overdue');
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10 p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Customers (Debtors)</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:bg-slate-700">
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-green-100 mb-1">Total Receivable</p>
              <p className="text-2xl font-bold text-white">₹{totalReceivable.toLocaleString()}</p>
              <p className="text-xs text-green-100 mt-1">~ {totalCustomers} customers</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-blue-100 mb-1">Avg Balance</p>
              <p className="text-2xl font-bold text-white">₹{Math.round(avgBalance).toLocaleString()}</p>
              <p className="text-xs text-blue-100 mt-1">₹ per customer</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-purple-100 mb-1">Active</p>
              <p className="text-2xl font-bold text-white">{activeCustomers}</p>
              <p className="text-xs text-purple-100 mt-1">⚖ in good standing</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-orange-100 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-white">{overdueCustomers}</p>
              <p className="text-xs text-orange-100 mt-1">⚠ needs attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              className="bg-slate-800 border-slate-600 text-white pl-10"
            />
          </div>
          
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {paginatedData.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No results</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {paginatedData.map(item => (
              <Card key={item.id} className={`bg-slate-800 border-slate-700 ${
                item.status === 'overdue' ? 'border-l-4 border-l-red-500' : 
                item.status === 'due-soon' ? 'border-l-4 border-l-orange-500' : 
                item.status === 'collected' ? 'border-l-4 border-l-green-500' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{item.customer}</p>
                      <p className="text-xs text-slate-400">{item.invoiceNo} • {item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{item.category}</span>
                        <span className="text-xs bg-blue-700/30 text-blue-300 px-2 py-0.5 rounded">{item.customerType}</span>
                        {item.status === 'overdue' && item.daysOverdue > 0 && (
                          <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded">
                            {item.daysOverdue} days overdue
                          </span>
                        )}
                        {item.status === 'due-soon' && (
                          <span className="text-xs bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded">
                            Due soon
                          </span>
                        )}
                        {item.status === 'collected' && (
                          <span className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded">
                            Collected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Date: {item.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">₹{item.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">Due: {item.dueDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Info */}
        {paginatedData.length > 0 && (
          <div className="flex justify-between items-center py-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} • Page {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-slate-600"
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-slate-600"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Analytics and Trends */}
        <Card className="bg-slate-800 border-slate-700 mt-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Collection Trends & Analytics
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-lg">
                <p className="text-xs text-cyan-100">Avg Collection Days</p>
                <p className="text-xl font-bold text-white">28</p>
                <p className="text-xs text-cyan-200">↓ 5 days improved</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg">
                <p className="text-xs text-purple-100">Collection Rate</p>
                <p className="text-xl font-bold text-white">92%</p>
                <p className="text-xs text-purple-200">↑ 8% this month</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Outstanding Amount</span>
                <span className="text-red-400">₹{totalReceivable.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Collected This Month</span>
                <span className="text-green-400">₹{collectedAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Average Invoice Value</span>
                <span className="text-blue-400">₹{(allReceivables.reduce((sum, r) => sum + r.amount, 0) / allReceivables.length).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}