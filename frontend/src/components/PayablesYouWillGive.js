import React, { useState } from 'react';
import { ArrowLeft, FileText, Calendar, Search, TrendingDown, Clock, AlertTriangle, DollarSign, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useBusiness } from '../contexts/BusinessContext';

export default function PayablesYouWillGive() {
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

  // Sample payables data with categories and status
  const allPayables = [
    { id: 1, supplier: 'Oil India Ltd', amount: 150000, date: '2025-09-15', dueDate: '2025-10-15', billNo: 'BILL-001', description: 'Fuel Purchase', status: 'overdue', category: 'Inventory', daysOverdue: 5 },
    { id: 2, supplier: 'Bharat Petroleum', amount: 200000, date: '2025-09-20', dueDate: '2025-10-20', billNo: 'BILL-002', description: 'Diesel Stock', status: 'due-soon', category: 'Inventory', daysOverdue: 0 },
    { id: 3, supplier: 'Equipment Co', amount: 85000, date: '2025-09-25', dueDate: '2025-10-25', billNo: 'BILL-003', description: 'Equipment Purchase', status: 'current', category: 'Assets', daysOverdue: 0 },
    { id: 4, supplier: 'Parts & Accessories', amount: 45000, date: '2025-10-01', dueDate: '2025-10-30', billNo: 'BILL-004', description: 'Spare Parts', status: 'current', category: 'Inventory', daysOverdue: 0 },
    { id: 5, supplier: 'Maintenance Services', amount: 35000, date: '2025-10-05', dueDate: '2025-11-05', billNo: 'BILL-005', description: 'Equipment Servicing', status: 'current', category: 'Services', daysOverdue: 0 },
    { id: 6, supplier: 'Utility Company', amount: 12000, date: '2025-09-10', dueDate: '2025-10-10', billNo: 'BILL-006', description: 'Electricity Bill', status: 'overdue', category: 'Utilities', daysOverdue: 10 },
    { id: 7, supplier: 'Office Supplies Ltd', amount: 8500, date: '2025-09-28', dueDate: '2025-10-28', billNo: 'BILL-007', description: 'Stationery', status: 'current', category: 'Expenses', daysOverdue: 0 },
    { id: 8, supplier: 'Construction Materials', amount: 125000, date: '2025-08-15', dueDate: '2025-09-15', billNo: 'BILL-008', description: 'Building Supplies', status: 'paid', category: 'Assets', daysOverdue: 0 },
  ];

  // Calculate summary statistics
  const totalPayable = allPayables.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0);
  const overdueAmount = allPayables.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
  const dueSoonAmount = allPayables.filter(p => p.status === 'due-soon').reduce((sum, p) => sum + p.amount, 0);
  const currentAmount = allPayables.filter(p => p.status === 'current').reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = allPayables.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  const overdueCount = allPayables.filter(p => p.status === 'overdue').length;
  const dueSoonCount = allPayables.filter(p => p.status === 'due-soon').length;

  // Category breakdown
  const categoryBreakdown = allPayables.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = 0;
    }
    acc[item.category] += item.amount;
    return acc;
  }, {});

  const handleFilterByDate = () => {
    const filtered = allPayables.filter(item => {
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

  let displayData = filteredData.length > 0 ? filteredData : allPayables;

  // Filter by tab
  if (activeTab !== 'all') {
    displayData = displayData.filter(item => item.status === activeTab);
  }

  // Apply search filter
  const searchedData = displayData.filter(item => 
    item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.billNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-lg font-semibold">Payables - You will Give</h1>
            <p className="text-xs text-slate-400">{activeBusiness.name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-white" />
                <p className="text-xs text-red-100">Total Payable</p>
              </div>
              <p className="text-xl font-bold text-white">₹{totalPayable.toLocaleString()}</p>
              <p className="text-xs text-red-100 mt-1">{allPayables.filter(p => p.status !== 'paid').length} bills</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-white" />
                <p className="text-xs text-orange-100">Overdue</p>
              </div>
              <p className="text-xl font-bold text-white">₹{overdueAmount.toLocaleString()}</p>
              <p className="text-xs text-orange-100 mt-1">{overdueCount} bills</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-white" />
                <p className="text-xs text-yellow-100">Due Soon</p>
              </div>
              <p className="text-xl font-bold text-white">₹{dueSoonAmount.toLocaleString()}</p>
              <p className="text-xs text-yellow-100 mt-1">{dueSoonCount} bills</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-white" />
                <p className="text-xs text-green-100">Paid</p>
              </div>
              <p className="text-xl font-bold text-white">₹{paidAmount.toLocaleString()}</p>
              <p className="text-xs text-green-100 mt-1">{allPayables.filter(p => p.status === 'paid').length} bills</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-3">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-400" />
              Category Breakdown
            </h3>
            <div className="space-y-2">
              {Object.entries(categoryBreakdown).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{category}</span>
                  <span className="text-sm font-bold text-red-400">₹{amount.toLocaleString()}</span>
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
            className="bg-red-600 hover:bg-red-700 text-white"
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
                item.status === 'due-soon' ? 'border-l-4 border-l-orange-500' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{item.supplier}</p>
                      <p className="text-xs text-slate-400">{item.billNo} • {item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{item.category}</span>
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
                        {item.status === 'paid' && (
                          <span className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded">
                            Paid
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Date: {item.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-400">₹{item.amount.toLocaleString()}</p>
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
      </div>
    </div>
  );
}