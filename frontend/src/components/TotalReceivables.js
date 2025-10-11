import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, AlertCircle, Clock, CheckCircle, Users, Download, Calendar, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';
import { useRole } from '../contexts/RoleContext';

export default function TotalReceivables() {
  const navigate = useNavigate();
  const { getData, activeBusiness } = useBusiness();
  const { hasPermission } = useRole();
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('amount');

  // Sample receivables data
  const receivables = [
    { id: 1, customer: 'Rajesh Enterprises', amount: 25000, dueDate: '2025-01-15', invoiceDate: '2024-12-15', invoiceNo: 'INV-001', status: 'overdue', daysOverdue: 5 },
    { id: 2, customer: 'Sharma Transport', amount: 15000, dueDate: '2025-01-20', invoiceDate: '2024-12-20', invoiceNo: 'INV-002', status: 'due-soon', daysOverdue: 0 },
    { id: 3, customer: 'Kumar Industries', amount: 45000, dueDate: '2025-01-25', invoiceDate: '2024-12-25', invoiceNo: 'INV-003', status: 'current', daysOverdue: 0 },
    { id: 4, customer: 'Patel & Sons', amount: 8000, dueDate: '2025-01-18', invoiceDate: '2024-12-18', invoiceNo: 'INV-004', status: 'due-soon', daysOverdue: 0 },
    { id: 5, customer: 'Singh Motors', amount: 32000, dueDate: '2025-01-10', invoiceDate: '2024-12-10', invoiceNo: 'INV-005', status: 'overdue', daysOverdue: 10 },
    { id: 6, customer: 'Gupta Trading', amount: 18500, dueDate: '2025-02-01', invoiceDate: '2025-01-01', invoiceNo: 'INV-006', status: 'current', daysOverdue: 0 },
  ];

  // Calculate totals
  const totalReceivable = receivables.reduce((sum, r) => sum + r.amount, 0);
  const overdueAmount = receivables.filter(r => r.status === 'overdue').reduce((sum, r) => sum + r.amount, 0);
  const dueSoonAmount = receivables.filter(r => r.status === 'due-soon').reduce((sum, r) => sum + r.amount, 0);
  const currentAmount = receivables.filter(r => r.status === 'current').reduce((sum, r) => sum + r.amount, 0);

  const overdueCount = receivables.filter(r => r.status === 'overdue').length;
  const dueSoonCount = receivables.filter(r => r.status === 'due-soon').length;
  const totalCustomers = [...new Set(receivables.map(r => r.customer))].length;

  // Aging analysis
  const aging = {
    current: receivables.filter(r => r.daysOverdue === 0).reduce((sum, r) => sum + r.amount, 0),
    '1-30': receivables.filter(r => r.daysOverdue > 0 && r.daysOverdue <= 30).reduce((sum, r) => sum + r.amount, 0),
    '31-60': receivables.filter(r => r.daysOverdue > 30 && r.daysOverdue <= 60).reduce((sum, r) => sum + r.amount, 0),
    '60+': receivables.filter(r => r.daysOverdue > 60).reduce((sum, r) => sum + r.amount, 0),
  };

  // Filter receivables
  const filteredReceivables = receivables.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  }).sort((a, b) => {
    if (sortBy === 'amount') return b.amount - a.amount;
    if (sortBy === 'date') return new Date(a.dueDate) - new Date(b.dueDate);
    if (sortBy === 'overdue') return b.daysOverdue - a.daysOverdue;
    return 0;
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
              <h1 className="text-lg font-bold">Total Receivables</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-green-400">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Main Summary Card */}
        <Card className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 border-0 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-green-100">Total Receivables</p>
                <p className="text-3xl font-bold text-white">₹{totalReceivable.toLocaleString()}</p>
                <p className="text-xs text-green-100 mt-1">{receivables.length} invoices • {totalCustomers} customers</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/20">
              <div className="text-center">
                <p className="text-xs text-green-100">Current</p>
                <p className="text-sm font-bold text-white">₹{currentAmount.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-green-100">Due Soon</p>
                <p className="text-sm font-bold text-white">₹{dueSoonAmount.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-green-100">Overdue</p>
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
                <CheckCircle className="w-4 h-4 text-white" />
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
                <AlertCircle className="w-4 h-4 text-white" />
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
              <Calendar className="w-4 h-4 text-blue-400" />
              Aging Analysis
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Current (0 days)</span>
                <span className="text-sm font-bold text-green-400">₹{aging.current.toLocaleString()}</span>
              </div>
              <div className="bg-slate-700 rounded-full h-1.5">
                <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${(aging.current / totalReceivable) * 100}%` }} />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">1-30 days</span>
                <span className="text-sm font-bold text-yellow-400">₹{aging['1-30'].toLocaleString()}</span>
              </div>
              <div className="bg-slate-700 rounded-full h-1.5">
                <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${(aging['1-30'] / totalReceivable) * 100}%` }} />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">31-60 days</span>
                <span className="text-sm font-bold text-orange-400">₹{aging['31-60'].toLocaleString()}</span>
              </div>
              <div className="bg-slate-700 rounded-full h-1.5">
                <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${(aging['31-60'] / totalReceivable) * 100}%` }} />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">60+ days</span>
                <span className="text-sm font-bold text-red-400">₹{aging['60+'].toLocaleString()}</span>
              </div>
              <div className="bg-slate-700 rounded-full h-1.5">
                <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${(aging['60+'] / totalReceivable) * 100}%` }} />
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

        {/* Receivables List */}
        <h2 className="text-sm font-bold text-white mb-3">Outstanding Invoices</h2>
        <div className="space-y-3">
          {filteredReceivables.map(receivable => (
            <Card key={receivable.id} className={`bg-slate-800 border-slate-700 ${
              receivable.status === 'overdue' ? 'border-red-500/50' : ''
            }`}>
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-400" />
                      <p className="text-sm font-bold text-white">{receivable.customer}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">Invoice: {receivable.invoiceNo}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">Date: {receivable.invoiceDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">₹{receivable.amount.toLocaleString()}</p>
                    {receivable.status === 'overdue' && receivable.daysOverdue > 0 && (
                      <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded">
                        {receivable.daysOverdue} days overdue
                      </span>
                    )}
                    {receivable.status === 'due-soon' && (
                      <span className="text-xs bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded">
                        Due soon
                      </span>
                    )}
                    {receivable.status === 'current' && (
                      <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-700">
                  <span className="text-slate-400">Due Date: {receivable.dueDate}</span>
                  <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700">
                    Record Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <Card className="bg-slate-800 border-slate-700 mt-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-white mb-3">Collection Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-slate-700 rounded">
                <p className="text-xs text-slate-400">Avg Collection Period</p>
                <p className="text-lg font-bold text-white">32 days</p>
              </div>
              <div className="text-center p-3 bg-slate-700 rounded">
                <p className="text-xs text-slate-400">Collection Rate</p>
                <p className="text-lg font-bold text-green-400">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}