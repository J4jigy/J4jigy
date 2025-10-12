import React, { useState } from 'react';
import { ArrowLeft, Download, Search, Plus, Phone, Mail, TrendingUp, AlertTriangle, Clock, DollarSign, Filter, Users, BarChart3, PieChart, Calendar, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useBusiness } from '../contexts/BusinessContext';

export default function PayablesYouWillGive() {
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  // Suppliers data matching screenshot design
  const allSuppliers = [
    { 
      id: 1, 
      name: 'Oil India Ltd', 
      phone: '9876543220', 
      email: 'oil@example.com', 
      outstandingAmount: 150000, 
      creditLimit: 300000, 
      lastTransaction: '2025-01-10',
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
      utilizationPercent: 24
    },
  ];

  // Calculate statistics matching screenshot design
  const totalPayable = allSuppliers.reduce((sum, supplier) => sum + supplier.outstandingAmount, 0);
  const totalSuppliers = allSuppliers.length;
  const avgBalance = totalSuppliers > 0 ? totalPayable / totalSuppliers : 0;
  const activeSuppliers = 2; // Based on sample data
  const overdueSuppliers = 1; // Based on sample data

  // Apply filters matching screenshot functionality
  const filteredSuppliers = allSuppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.phone.includes(searchQuery) ||
                         supplier.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white">
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 shadow-2xl">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')} 
                className="text-white hover:bg-white/20 backdrop-blur-sm p-2 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Suppliers (Creditors)</h1>
                <p className="text-red-100 text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {activeBusiness?.name || 'FinApp Admin'} • Financial Management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 backdrop-blur-sm rounded-xl">
                <Download className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-white text-red-600 hover:bg-red-50 font-semibold rounded-xl shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Enhanced Summary Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-white opacity-80" />
                <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">Total</span>
              </div>
              <p className="text-2xl font-bold text-white">₹{totalPayable.toLocaleString()}</p>
              <p className="text-red-100 text-sm">Outstanding Amount</p>
              <p className="text-red-200 text-xs mt-1">{totalSuppliers} suppliers</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-8 h-8 text-white opacity-80" />
                <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">Alert</span>
              </div>
              <p className="text-2xl font-bold text-white">{overdueSuppliers}</p>
              <p className="text-orange-100 text-sm">Overdue Payments</p>
              <p className="text-orange-200 text-xs mt-1">Need attention</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 text-white opacity-80" />
                <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">Avg</span>
              </div>
              <p className="text-2xl font-bold text-white">₹{Math.round(avgBalance).toLocaleString()}</p>
              <p className="text-blue-100 text-sm">Average Balance</p>
              <p className="text-blue-200 text-xs mt-1">Per supplier</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-white opacity-80" />
                <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">Active</span>
              </div>
              <p className="text-2xl font-bold text-white">{activeSuppliers}</p>
              <p className="text-green-100 text-sm">Active Suppliers</p>
              <p className="text-green-200 text-xs mt-1">Good standing</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="suppliers" className="rounded-lg">Suppliers</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg">Analytics</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-lg">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {/* Quick Stats and Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-red-400" />
                    Category Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(categoryBreakdown).map(([category, data]) => (
                      <div key={category} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{category}</p>
                          <p className="text-slate-400 text-sm">{data.count} suppliers</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-400 font-bold">₹{data.amount.toLocaleString()}</p>
                          <p className="text-slate-400 text-xs">{((data.amount / totalPayable) * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Payment Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-gradient-to-r from-red-900/30 to-red-800/30 rounded-lg">
                      <p className="text-red-300 text-sm">Monthly Spend</p>
                      <p className="text-2xl font-bold text-white">₹{(avgMonthlySpend).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-900/30 to-blue-800/30 rounded-lg">
                      <p className="text-blue-300 text-sm">Total Transactions</p>
                      <p className="text-2xl font-bold text-white">{totalTransactions}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-900/30 to-green-800/30 rounded-lg">
                      <p className="text-green-300 text-sm">Payment Rate</p>
                      <p className="text-2xl font-bold text-white">92%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="mt-6">
            {/* Enhanced Search and Filters */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search suppliers, phone, email..."
                      className="bg-slate-700/50 border-slate-600 text-white pl-10 rounded-lg"
                    />
                  </div>
                  
                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white rounded-lg">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="all">All Suppliers</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="amount-high">Amount (High→Low)</SelectItem>
                      <SelectItem value="amount-low">Amount (Low→High)</SelectItem>
                      <SelectItem value="name">Name (A→Z)</SelectItem>
                      <SelectItem value="overdue">Overdue Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Supplier Cards */}
            <div className="space-y-4">
              {filteredSuppliers.map(supplier => (
                <Card key={supplier.id} className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Supplier Info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold text-white">{supplier.name}</h3>
                          <div className="flex items-center gap-2">
                            {supplier.status === 'overdue' && (
                              <span className="px-3 py-1 bg-red-900/50 text-red-300 text-xs font-medium rounded-full flex items-center gap-1">
                                <Bell className="w-3 h-3" />
                                {supplier.daysOverdue} days overdue
                              </span>
                            )}
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              supplier.riskLevel === 'low' ? 'bg-green-900/50 text-green-300' :
                              supplier.riskLevel === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                              'bg-red-900/50 text-red-300'
                            }`}>
                              {supplier.riskLevel} risk
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-300">
                              <Phone className="w-4 h-4 text-red-400" />
                              <span className="text-sm">{supplier.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <Mail className="w-4 h-4 text-red-400" />
                              <span className="text-sm">{supplier.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <Calendar className="w-4 h-4 text-red-400" />
                              <span className="text-sm">Last: {supplier.lastTransaction}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-slate-300 text-sm">
                              <span className="text-slate-400">Category:</span> {supplier.category}
                            </div>
                            <div className="text-slate-300 text-sm">
                              <span className="text-slate-400">Payment Terms:</span> {supplier.paymentTerms}
                            </div>
                            <div className="text-slate-300 text-sm">
                              <span className="text-slate-400">Transactions:</span> {supplier.totalTransactions}
                            </div>
                          </div>
                        </div>

                        {/* Credit Utilization Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">Credit Utilization</span>
                            <span className="text-white">{supplier.utilizationPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${supplier.utilizationPercent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>Used: ₹{supplier.outstandingAmount.toLocaleString()}</span>
                            <span>Limit: ₹{supplier.creditLimit.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Amount Display */}
                      <div className="text-center lg:text-right">
                        <p className="text-3xl font-bold text-red-400 mb-2">
                          ₹{supplier.outstandingAmount.toLocaleString()}
                        </p>
                        <p className="text-slate-400 text-sm mb-3">Outstanding</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white">
                            Pay Now
                          </Button>
                          <Button size="sm" variant="outline" className="border-slate-500 text-slate-400 hover:bg-slate-500 hover:text-white">
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-slate-400 text-lg">Advanced analytics and charts will be displayed here</p>
                  <p className="text-slate-500 text-sm mt-2">Coming soon with interactive dashboards</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-green-400" />
                  Reports & Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-slate-400 text-lg">Report generation and export options will be available here</p>
                  <p className="text-slate-500 text-sm mt-2">PDF, Excel, and custom report formats</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}