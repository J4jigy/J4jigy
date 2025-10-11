import React, { useState } from 'react';
import { ArrowLeft, FileText, Calendar, Search, TrendingUp, Clock, CheckCircle, DollarSign, Filter, Users, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
    // PDF generation logic here
  };

  const displayData = filteredData.length > 0 ? filteredData : allReceivables;

  // Apply search filter
  const searchedData = displayData.filter(item => 
    item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply sorting
  const sortedData = [...searchedData].sort((a, b) => {
    if (sortBy === 'amount-high') return b.amount - a.amount;
    if (sortBy === 'amount-low') return a.amount - b.amount;
    if (sortBy === 'date-new') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'date-old') return new Date(a.date) - new Date(b.date);
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
          <h1 className="text-lg font-semibold">Receivables - You will Receive</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
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
              <Card key={item.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-bold text-white">{item.customer}</p>
                      <p className="text-xs text-slate-400">{item.invoiceNo} • {item.description}</p>
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
              Page {currentPage} / {totalPages}
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