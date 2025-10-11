import React, { useState } from 'react';
import { ArrowLeft, Download, Search, TrendingDown, Clock, AlertTriangle, DollarSign, Plus, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';

export default function TotalPayables() {
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  // Supplier-focused payables data matching the screenshot design
  const allSuppliers = [
    { 
      id: 1, 
      name: 'Oil India Ltd', 
      phone: '9876543220', 
      email: 'oil@example.com', 
      outstandingAmount: 150000, 
      creditLimit: 300000, 
      lastTransaction: '2025-01-10',
      status: 'overdue',
      daysOverdue: 5,
      utilizationPercent: 50
    },
    { 
      id: 2, 
      name: 'Bharat Petroleum', 
      phone: '9876543221', 
      email: 'bharat@example.com', 
      outstandingAmount: 200000, 
      creditLimit: 400000, 
      lastTransaction: '2025-01-09',
      status: 'active',
      daysOverdue: 0,
      utilizationPercent: 50
    },
    { 
      id: 3, 
      name: 'Equipment Co', 
      phone: '9876543222', 
      email: 'equipment@example.com', 
      outstandingAmount: 85000, 
      creditLimit: 150000, 
      lastTransaction: '2025-01-08',
      status: 'active',
      daysOverdue: 0,
      utilizationPercent: 57
    },
    { 
      id: 4, 
      name: 'Utility Company', 
      phone: '9876543223', 
      email: 'utility@example.com', 
      outstandingAmount: 12000, 
      creditLimit: 50000, 
      lastTransaction: '2025-01-07',
      status: 'overdue',
      daysOverdue: 10,
      utilizationPercent: 24
    },
  ];

  // Calculate summary statistics based on suppliers
  const totalPayable = allSuppliers.reduce((sum, supplier) => sum + supplier.outstandingAmount, 0);
  const totalSuppliers = allSuppliers.length;
  const avgBalance = totalSuppliers > 0 ? totalPayable / totalSuppliers : 0;
  const activeSuppliers = allSuppliers.filter(s => s.status === 'active').length;
  const overdueSuppliers = allSuppliers.filter(s => s.status === 'overdue').length;

  // Apply search filter
  const searchedData = allSuppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.phone.includes(searchQuery) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply filter
  let filteredData = searchedData;
  if (filterBy !== 'all') {
    if (filterBy === 'active') {
      filteredData = searchedData.filter(supplier => supplier.status === 'active');
    } else if (filterBy === 'overdue') {
      filteredData = searchedData.filter(supplier => supplier.status === 'overdue');
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
              <h1 className="text-lg font-semibold">Suppliers (Creditors)</h1>
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
        {/* Main Summary Card */}
        <Card className="bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 border-0 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-red-100">Total Payables</p>
                <p className="text-3xl font-bold text-white">₹{totalPayable.toLocaleString()}</p>
                <p className="text-xs text-red-100 mt-1">{payables.length} bills • {totalSuppliers} suppliers</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/20">
              <div className="text-center">
                <p className="text-xs text-red-100">Current</p>
                <p className="text-sm font-bold text-white">₹{currentAmount.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-red-100">Due Soon</p>
                <p className="text-sm font-bold text-white">₹{dueSoonAmount.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-red-100">Overdue</p>
                <p className="text-sm font-bold text-white">₹{overdueAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-white" />
                <p className="text-xs text-blue-100">Current</p>
              </div>
              <p className="text-lg font-bold text-white">₹{currentAmount.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-white" />
                <p className="text-xs text-orange-100">Due Soon</p>
              </div>
              <p className="text-lg font-bold text-white">{dueSoonCount}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-white" />
                <p className="text-xs text-red-100">Overdue</p>
              </div>
              <p className="text-lg font-bold text-white">{overdueCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Aging Analysis */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-4">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-400" />
              Aging Analysis
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Current (0 days)</span>
                <span className="text-sm font-bold text-blue-400">₹{aging.current.toLocaleString()}</span>
              </div>
              <div className="bg-slate-700 rounded-full h-1.5">
                <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${(aging.current / totalPayable) * 100}%` }} />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">1-30 days</span>
                <span className="text-sm font-bold text-yellow-400">₹{aging['1-30'].toLocaleString()}</span>
              </div>
              <div className="bg-slate-700 rounded-full h-1.5">
                <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${(aging['1-30'] / totalPayable) * 100}%` }} />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">31-60 days</span>
                <span className="text-sm font-bold text-orange-400">₹{aging['31-60'].toLocaleString()}</span>
              </div>
              <div className="bg-slate-700 rounded-full h-1.5">
                <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${(aging['31-60'] / totalPayable) * 100}%` }} />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">60+ days</span>
                <span className="text-sm font-bold text-red-400">₹{aging['60+'].toLocaleString()}</span>
              </div>
              <div className="bg-slate-700 rounded-full h-1.5">
                <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${(aging['60+'] / totalPayable) * 100}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-3">
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="flex-1 bg-slate-700 border-slate-600 text-white h-9">
                  <Filter className="w-4 h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="due-soon">Due Soon</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="amount">By Amount</SelectItem>
                  <SelectItem value="date">By Date</SelectItem>
                  <SelectItem value="overdue">By Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payables List */}
        <h2 className="text-sm font-bold text-white mb-3">Outstanding Bills</h2>
        <div className="space-y-3">
          {filteredPayables.map(payable => (
            <Card key={payable.id} className={`bg-slate-800 border-slate-700 ${
              payable.status === 'overdue' ? 'border-red-500/50' : ''
            }`}>
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-indigo-400" />
                      <p className="text-sm font-bold text-white">{payable.supplier}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">Bill: {payable.billNo}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">Date: {payable.purchaseDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">₹{payable.amount.toLocaleString()}</p>
                    {payable.status === 'overdue' && payable.daysOverdue > 0 && (
                      <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded">
                        {payable.daysOverdue} days overdue
                      </span>
                    )}
                    {payable.status === 'due-soon' && (
                      <span className="text-xs bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded">
                        Due soon
                      </span>
                    )}
                    {payable.status === 'current' && (
                      <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-700">
                  <span className="text-slate-400">Due Date: {payable.dueDate}</span>
                  <Button size="sm" className="h-7 bg-red-600 hover:bg-red-700">
                    Make Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <Card className="bg-slate-800 border-slate-700 mt-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-white mb-3">Payment Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-slate-700 rounded">
                <p className="text-xs text-slate-400">Avg Payment Period</p>
                <p className="text-lg font-bold text-white">28 days</p>
              </div>
              <div className="text-center p-3 bg-slate-700 rounded">
                <p className="text-xs text-slate-400">On-Time Rate</p>
                <p className="text-lg font-bold text-green-400">92%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}