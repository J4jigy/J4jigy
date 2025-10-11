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
  
  const [fromDate, setFromDate] = useState('2025-09-11');
  const [toDate, setToDate] = useState('2025-10-11');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('amount-high');
  const [itemsPerPage, setItemsPerPage] = useState('25');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  // Enhanced receivables data with categories and status
  const allReceivables = [
    { id: 1, customer: 'Rajesh Enterprises', amount: 25000, date: '2025-09-12', dueDate: '2025-10-12', invoiceNo: 'INV-001', description: 'Fuel Sales', status: 'overdue', category: 'Fuel Sales', daysOverdue: 8, customerType: 'Enterprise' },
    { id: 2, customer: 'Sharma Transport', amount: 15000, date: '2025-09-18', dueDate: '2025-10-18', invoiceNo: 'INV-002', description: 'Diesel Supply', status: 'due-soon', category: 'Fuel Sales', daysOverdue: 0, customerType: 'Transport' },
    { id: 3, customer: 'Kumar Industries', amount: 45000, date: '2025-09-25', dueDate: '2025-10-25', invoiceNo: 'INV-003', description: 'Monthly Billing', status: 'current', category: 'Monthly Billing', daysOverdue: 0, customerType: 'Industry' },
    { id: 4, customer: 'Patel & Sons', amount: 8000, date: '2025-10-02', dueDate: '2025-11-02', invoiceNo: 'INV-004', description: 'Petrol Sales', status: 'current', category: 'Fuel Sales', daysOverdue: 0, customerType: 'Retail' },
    { id: 5, customer: 'Singh Motors', amount: 32000, date: '2025-10-08', dueDate: '2025-11-08', invoiceNo: 'INV-005', description: 'Fleet Services', status: 'current', category: 'Services', daysOverdue: 0, customerType: 'Fleet' },
    { id: 6, customer: 'Gupta Logistics', amount: 22000, date: '2025-09-05', dueDate: '2025-10-05', invoiceNo: 'INV-006', description: 'Bulk Diesel', status: 'overdue', category: 'Fuel Sales', daysOverdue: 15, customerType: 'Transport' },
    { id: 7, customer: 'Reddy Construction', amount: 18500, date: '2025-09-28', dueDate: '2025-10-28', invoiceNo: 'INV-007', description: 'Equipment Fuel', status: 'current', category: 'Fuel Sales', daysOverdue: 0, customerType: 'Construction' },
    { id: 8, customer: 'Verma Auto', amount: 12000, date: '2025-08-20', dueDate: '2025-09-20', invoiceNo: 'INV-008', description: 'Service Station', status: 'collected', category: 'Services', daysOverdue: 0, customerType: 'Automotive' },
  ];

  // Calculate summary statistics
  const totalReceivable = allReceivables.filter(r => r.status !== 'collected').reduce((sum, r) => sum + r.amount, 0);
  const overdueAmount = allReceivables.filter(r => r.status === 'overdue').reduce((sum, r) => sum + r.amount, 0);
  const dueSoonAmount = allReceivables.filter(r => r.status === 'due-soon').reduce((sum, r) => sum + r.amount, 0);
  const currentAmount = allReceivables.filter(r => r.status === 'current').reduce((sum, r) => sum + r.amount, 0);
  const collectedAmount = allReceivables.filter(r => r.status === 'collected').reduce((sum, r) => sum + r.amount, 0);

  const overdueCount = allReceivables.filter(r => r.status === 'overdue').length;
  const dueSoonCount = allReceivables.filter(r => r.status === 'due-soon').length;

  // Category breakdown
  const categoryBreakdown = allReceivables.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = 0;
    }
    acc[item.category] += item.amount;
    return acc;
  }, {});

  // Customer type breakdown
  const customerTypeBreakdown = allReceivables.reduce((acc, item) => {
    if (!acc[item.customerType]) {
      acc[item.customerType] = { count: 0, amount: 0 };
    }
    acc[item.customerType].count += 1;
    acc[item.customerType].amount += item.amount;
    return acc;
  }, {});

  const handleFilterByDate = () => {
    const filtered = allReceivables.filter(item => {
      const itemDate = new Date(item.date);
      const from = new Date(fromDate);
      const to = new Date(toDate);
      return itemDate >= from && itemDate <= to;
    });
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleGeneratePDF = () => {
    alert('Generating PDF Report...');
  };

  let displayData = filteredData.length > 0 ? filteredData : allReceivables;

  // Filter by tab
  if (activeTab !== 'all') {
    displayData = displayData.filter(item => item.status === activeTab);
  }

  // Apply search filter
  const searchedData = displayData.filter(item => 
    item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.customerType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply sorting
  const sortedData = [...searchedData].sort((a, b) => {
    if (sortBy === 'amount-high') return b.amount - a.amount;
    if (sortBy === 'amount-low') return a.amount - b.amount;
    if (sortBy === 'date-new') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'date-old') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'overdue') return b.daysOverdue - a.daysOverdue;
    return 0;
  });

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / parseInt(itemsPerPage));
  const startIndex = (currentPage - 1) * parseInt(itemsPerPage);
  const endIndex = startIndex + parseInt(itemsPerPage);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10 p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Receivables - You will Receive</h1>
            <p className="text-xs text-slate-400">{activeBusiness.name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-white" />
                <p className="text-xs text-green-100">Total Receivable</p>
              </div>
              <p className="text-xl font-bold text-white">₹{totalReceivable.toLocaleString()}</p>
              <p className="text-xs text-green-100 mt-1">{allReceivables.filter(r => r.status !== 'collected').length} invoices</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-white" />
                <p className="text-xs text-red-100">Overdue</p>
              </div>
              <p className="text-xl font-bold text-white">₹{overdueAmount.toLocaleString()}</p>
              <p className="text-xs text-red-100 mt-1">{overdueCount} invoices</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-white" />
                <p className="text-xs text-yellow-100">Due Soon</p>
              </div>
              <p className="text-xl font-bold text-white">₹{dueSoonAmount.toLocaleString()}</p>
              <p className="text-xs text-yellow-100 mt-1">{dueSoonCount} invoices</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-white" />
                <p className="text-xs text-blue-100">Collected</p>
              </div>
              <p className="text-xl font-bold text-white">₹{collectedAmount.toLocaleString()}</p>
              <p className="text-xs text-blue-100 mt-1">{allReceivables.filter(r => r.status === 'collected').length} invoices</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-3">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4 text-green-400" />
              Category Breakdown
            </h3>
            <div className="space-y-2">
              {Object.entries(categoryBreakdown).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{category}</span>
                  <span className="text-sm font-bold text-green-400">₹{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Type Analysis */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-3">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Customer Type Analysis
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(customerTypeBreakdown).slice(0, 6).map(([type, data]) => (
                <div key={type} className="p-2 bg-slate-700/30 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-300">{type}</span>
                    <span className="text-xs text-green-400">{data.count}</span>
                  </div>
                  <p className="text-sm font-bold text-white">₹{data.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Date Filters */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">From Date</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">To Date</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button 
            onClick={handleGeneratePDF}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate PDF Report
          </Button>
          <Button 
            onClick={handleFilterByDate}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Filter by Date
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="due-soon">Due Soon</TabsTrigger>
            <TabsTrigger value="current">Current</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="bg-slate-800 border-slate-600 text-white pl-10"
          />
        </div>

        {/* Sort and Pagination Controls */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="amount-high">Amount (High→Low)</SelectItem>
              <SelectItem value="amount-low">Amount (Low→High)</SelectItem>
              <SelectItem value="date-new">Date (Newest First)</SelectItem>
              <SelectItem value="date-old">Date (Oldest First)</SelectItem>
              <SelectItem value="overdue">By Overdue Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="25">25 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
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