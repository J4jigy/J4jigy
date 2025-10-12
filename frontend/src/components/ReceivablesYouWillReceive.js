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

  // Enhanced customers data with comprehensive details
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
      utilizationPercent: 50,
      category: 'Enterprise',
      customerSince: '2023',
      totalTransactions: 156,
      avgMonthlyPurchase: 85000,
      loyaltyTier: 'gold',
      paymentHistory: 'good'
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
      utilizationPercent: 50,
      category: 'Transport',
      customerSince: '2022',
      totalTransactions: 89,
      avgMonthlyPurchase: 45000,
      loyaltyTier: 'silver',
      paymentHistory: 'excellent'
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
      utilizationPercent: 60,
      category: 'Industry',
      customerSince: '2021',
      totalTransactions: 234,
      avgMonthlyPurchase: 120000,
      loyaltyTier: 'platinum',
      paymentHistory: 'excellent'
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
      utilizationPercent: 32,
      category: 'Retail',
      customerSince: '2024',
      totalTransactions: 67,
      avgMonthlyPurchase: 28000,
      loyaltyTier: 'bronze',
      paymentHistory: 'good'
    },
  ];

  // Calculate enhanced statistics
  const totalReceivable = allCustomers.reduce((sum, customer) => sum + customer.outstandingAmount, 0);
  const totalCustomers = allCustomers.length;
  const avgBalance = totalCustomers > 0 ? totalReceivable / totalCustomers : 0;
  const activeCustomers = allCustomers.filter(c => c.status === 'active').length;
  const overdueCustomers = allCustomers.filter(c => c.status === 'overdue').length;
  const totalTransactions = allCustomers.reduce((sum, c) => sum + c.totalTransactions, 0);
  const avgMonthlyRevenue = allCustomers.reduce((sum, c) => sum + c.avgMonthlyPurchase, 0);

  // Category breakdown
  const categoryBreakdown = allCustomers.reduce((acc, customer) => {
    if (!acc[customer.category]) {
      acc[customer.category] = { amount: 0, count: 0 };
    }
    acc[customer.category].amount += customer.outstandingAmount;
    acc[customer.category].count += 1;
    return acc;
  }, {});

  // Loyalty tier breakdown
  const loyaltyBreakdown = allCustomers.reduce((acc, customer) => {
    if (!acc[customer.loyaltyTier]) {
      acc[customer.loyaltyTier] = { count: 0, revenue: 0 };
    }
    acc[customer.loyaltyTier].count += 1;
    acc[customer.loyaltyTier].revenue += customer.avgMonthlyPurchase;
    return acc;
  }, {});

  // Apply filters
  const filteredCustomers = allCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'active' && customer.status === 'active') ||
                         (filterBy === 'overdue' && customer.status === 'overdue');
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (sortBy === 'amount-high') return b.outstandingAmount - a.outstandingAmount;
    if (sortBy === 'amount-low') return a.outstandingAmount - b.outstandingAmount;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'overdue') return b.daysOverdue - a.daysOverdue;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-green-950 text-white">
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-2xl">
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
                <h1 className="text-2xl font-bold text-white">Customers (Debtors)</h1>
                <p className="text-green-100 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {activeBusiness?.name || 'FinApp Admin'} • Customer Management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 backdrop-blur-sm rounded-xl">
                <Download className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-white text-green-600 hover:bg-green-50 font-semibold rounded-xl shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Enhanced Summary Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-white opacity-80" />
                <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">Total</span>
              </div>
              <p className="text-2xl font-bold text-white">₹{totalReceivable.toLocaleString()}</p>
              <p className="text-green-100 text-sm">Total Receivable</p>
              <p className="text-green-200 text-xs mt-1">{totalCustomers} customers</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 text-white opacity-80" />
                <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">Alert</span>
              </div>
              <p className="text-2xl font-bold text-white">{overdueCustomers}</p>
              <p className="text-orange-100 text-sm">Overdue Payments</p>
              <p className="text-orange-200 text-xs mt-1">Need follow-up</p>
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
              <p className="text-blue-200 text-xs mt-1">Per customer</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-white opacity-80" />
                <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">Active</span>
              </div>
              <p className="text-2xl font-bold text-white">{activeCustomers}</p>
              <p className="text-purple-100 text-sm">Active Customers</p>
              <p className="text-purple-200 text-xs mt-1">Good standing</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="customers" className="rounded-lg">Customers</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg">Analytics</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-lg">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {/* Customer Insights and Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-green-400" />
                    Customer Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(categoryBreakdown).map(([category, data]) => (
                      <div key={category} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{category}</p>
                          <p className="text-slate-400 text-sm">{data.count} customers</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">₹{data.amount.toLocaleString()}</p>
                          <p className="text-slate-400 text-xs">{((data.amount / totalReceivable) * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Loyalty Program
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(loyaltyBreakdown).map(([tier, data]) => (
                      <div key={tier} className="p-3 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            tier === 'platinum' ? 'bg-purple-900/50 text-purple-300' :
                            tier === 'gold' ? 'bg-yellow-900/50 text-yellow-300' :
                            tier === 'silver' ? 'bg-gray-700/50 text-gray-300' :
                            'bg-orange-900/50 text-orange-300'
                          }`}>
                            {tier.toUpperCase()}
                          </span>
                          <span className="text-white font-medium">{data.count} customers</span>
                        </div>
                        <p className="text-green-400 font-bold">₹{data.revenue.toLocaleString()} monthly</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Insights */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Revenue Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-r from-green-900/30 to-green-800/30 rounded-lg">
                    <p className="text-green-300 text-sm">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-white">₹{(avgMonthlyRevenue).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-900/30 to-blue-800/30 rounded-lg">
                    <p className="text-blue-300 text-sm">Total Transactions</p>
                    <p className="text-2xl font-bold text-white">{totalTransactions}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-900/30 to-purple-800/30 rounded-lg">
                    <p className="text-purple-300 text-sm">Collection Rate</p>
                    <p className="text-2xl font-bold text-white">95%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            {/* Enhanced Search and Filters */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search customers, phone, email..."
                      className="bg-slate-700/50 border-slate-600 text-white pl-10 rounded-lg"
                    />
                  </div>
                  
                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white rounded-lg">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="all">All Customers</SelectItem>
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

            {/* Enhanced Customer Cards */}
            <div className="space-y-4">
              {filteredCustomers.map(customer => (
                <Card key={customer.id} className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Customer Info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold text-white">{customer.name}</h3>
                          <div className="flex items-center gap-2">
                            {customer.status === 'overdue' && (
                              <span className="px-3 py-1 bg-red-900/50 text-red-300 text-xs font-medium rounded-full">
                                {customer.daysOverdue} days overdue
                              </span>
                            )}
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              customer.loyaltyTier === 'platinum' ? 'bg-purple-900/50 text-purple-300' :
                              customer.loyaltyTier === 'gold' ? 'bg-yellow-900/50 text-yellow-300' :
                              customer.loyaltyTier === 'silver' ? 'bg-gray-700/50 text-gray-300' :
                              'bg-orange-900/50 text-orange-300'
                            }`}>
                              <Star className="w-3 h-3 inline mr-1" />
                              {customer.loyaltyTier}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-300">
                              <Phone className="w-4 h-4 text-green-400" />
                              <span className="text-sm">{customer.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <Mail className="w-4 h-4 text-green-400" />
                              <span className="text-sm">{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <Calendar className="w-4 h-4 text-green-400" />
                              <span className="text-sm">Customer since: {customer.customerSince}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-slate-300 text-sm">
                              <span className="text-slate-400">Category:</span> {customer.category}
                            </div>
                            <div className="text-slate-300 text-sm">
                              <span className="text-slate-400">Payment History:</span> {customer.paymentHistory}
                            </div>
                            <div className="text-slate-300 text-sm">
                              <span className="text-slate-400">Transactions:</span> {customer.totalTransactions}
                            </div>
                          </div>
                        </div>

                        {/* Credit Utilization Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">Credit Utilization</span>
                            <span className="text-white">{customer.utilizationPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${customer.utilizationPercent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>Outstanding: ₹{customer.outstandingAmount.toLocaleString()}</span>
                            <span>Limit: ₹{customer.creditLimit.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Amount Display */}
                      <div className="text-center lg:text-right">
                        <p className="text-3xl font-bold text-green-400 mb-2">
                          ₹{customer.outstandingAmount.toLocaleString()}
                        </p>
                        <p className="text-slate-400 text-sm mb-3">Outstanding</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white">
                            Follow Up
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
                  Customer Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-slate-400 text-lg">Advanced customer analytics and insights will be displayed here</p>
                  <p className="text-slate-500 text-sm mt-2">Interactive charts, trends, and performance metrics</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-green-400" />
                  Customer Reports & Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-slate-400 text-lg">Customer report generation and export options will be available here</p>
                  <p className="text-slate-500 text-sm mt-2">Detailed customer statements, aging reports, and custom exports</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}