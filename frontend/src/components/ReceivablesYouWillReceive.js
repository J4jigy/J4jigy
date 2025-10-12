import React, { useState } from 'react';
import { ArrowLeft, Download, Search, Plus, Phone, Mail, TrendingUp, AlertCircle, Clock, DollarSign, Filter, Users, BarChart3, PieChart, Calendar, Star, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useBusiness } from '../contexts/BusinessContext';

export default function ReceivablesYouWillReceive() {
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  // Customers data matching screenshot design
  const allCustomers = [
    { 
      id: 1, 
      name: 'Rajesh Enterprises', 
      phone: '9876543210', 
      email: 'rajesh@example.com', 
      outstandingAmount: 25000, 
      creditLimit: 50000, 
      lastTransaction: '2025-01-10',
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
      utilizationPercent: 32
    },
  ];

  // Calculate statistics matching screenshot design
  const totalReceivable = allCustomers.reduce((sum, customer) => sum + customer.outstandingAmount, 0);
  const totalCustomers = allCustomers.length;
  const avgBalance = totalCustomers > 0 ? totalReceivable / totalCustomers : 0;
  const activeCustomers = 3; // Based on sample data
  const overdueCustomers = 1; // Based on sample data

  // Apply filters matching screenshot functionality
  const filteredCustomers = allCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Clean Header matching screenshot */}
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')} 
              className="text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-white">Total Receivables</h1>
              <p className="text-slate-400 text-sm">{activeBusiness?.name || 'Main Business'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:bg-slate-700">
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white px-4">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-4">
        {/* Summary Cards matching screenshot design */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0">
            <CardContent className="p-4 text-center">
              <p className="text-green-100 text-sm mb-1">Total Receivable</p>
              <p className="text-2xl font-bold text-white">₹{totalReceivable.toLocaleString()}</p>
              <p className="text-green-200 text-xs mt-1">₹ {totalCustomers} customers</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0">
            <CardContent className="p-4 text-center">
              <p className="text-blue-100 text-sm mb-1">Avg Balance</p>
              <p className="text-2xl font-bold text-white">₹{Math.round(avgBalance).toLocaleString()}</p>
              <p className="text-blue-200 text-xs mt-1">₹ per customer</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0">
            <CardContent className="p-4 text-center">
              <p className="text-purple-100 text-sm mb-1">Active</p>
              <p className="text-2xl font-bold text-white">{activeCustomers}</p>
              <p className="text-purple-200 text-xs mt-1">⚖ in good standing</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0">
            <CardContent className="p-4 text-center">
              <p className="text-orange-100 text-sm mb-1">Overdue</p>
              <p className="text-2xl font-bold text-white">{overdueCustomers}</p>
              <p className="text-orange-200 text-xs mt-1">⚠ needs attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar matching screenshot */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              className="bg-slate-800 border-slate-600 text-white pl-10 rounded-lg"
            />
          </div>
          
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Customer Cards matching screenshot design */}
        <div className="space-y-3">
          {filteredCustomers.map(customer => (
            <Card key={customer.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-2">{customer.name}</h3>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs">{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Mail className="w-3 h-3" />
                        <span className="text-xs">{customer.email}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-400">Limit: ₹{customer.creditLimit.toLocaleString()}</span>
                      <span className="text-xs text-slate-400">{customer.lastTransaction}</span>
                    </div>

                    {/* Progress Bar matching screenshot */}
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${customer.utilizationPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-xl font-bold text-green-400">₹{customer.outstandingAmount.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">Outstanding</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}