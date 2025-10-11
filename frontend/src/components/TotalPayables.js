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
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-red-100 mb-1">Total Payable</p>
              <p className="text-2xl font-bold text-white">₹{totalPayable.toLocaleString()}</p>
              <p className="text-xs text-red-100 mt-1">~ {totalSuppliers} suppliers</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-blue-100 mb-1">Avg Balance</p>
              <p className="text-2xl font-bold text-white">₹{Math.round(avgBalance).toLocaleString()}</p>
              <p className="text-xs text-blue-100 mt-1">₹ per supplier</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-purple-100 mb-1">Active</p>
              <p className="text-2xl font-bold text-white">{activeSuppliers}</p>
              <p className="text-xs text-purple-100 mt-1">⚖ in good standing</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-orange-100 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-white">{overdueSuppliers}</p>
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
              placeholder="Search suppliers..."
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

        {/* Supplier List */}
        {filteredData.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No suppliers found</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {filteredData.map(supplier => (
              <Card key={supplier.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-white mb-2">{supplier.name}</h3>
                      
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Phone className="w-3 h-3" />
                          <span className="text-xs">{supplier.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Mail className="w-3 h-3" />
                          <span className="text-xs">{supplier.email}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400">Limit: ₹{supplier.creditLimit.toLocaleString()}</span>
                        <span className="text-xs text-slate-400">Last: {supplier.lastTransaction}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${supplier.utilizationPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-red-400">₹{supplier.outstandingAmount.toLocaleString()}</p>
                      <p className="text-xs text-slate-400 mb-1">
                        {supplier.status === 'overdue' ? 'Overdue' : 'Outstanding'}
                      </p>
                      {supplier.status === 'overdue' && (
                        <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded">
                          {supplier.daysOverdue} days overdue
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}