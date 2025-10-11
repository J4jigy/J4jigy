import React, { useState } from 'react';
import { ArrowLeft, FileText, Calendar, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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

  // Sample payables data
  const allPayables = [
    { id: 1, supplier: 'Oil India Ltd', amount: 150000, date: '2025-09-15', dueDate: '2025-10-15', billNo: 'BILL-001', description: 'Fuel Purchase' },
    { id: 2, supplier: 'Bharat Petroleum', amount: 200000, date: '2025-09-20', dueDate: '2025-10-20', billNo: 'BILL-002', description: 'Diesel Stock' },
    { id: 3, supplier: 'Equipment Co', amount: 85000, date: '2025-09-25', dueDate: '2025-10-25', billNo: 'BILL-003', description: 'Equipment Purchase' },
    { id: 4, supplier: 'Parts & Accessories', amount: 45000, date: '2025-10-01', dueDate: '2025-10-30', billNo: 'BILL-004', description: 'Spare Parts' },
    { id: 5, supplier: 'Maintenance Services', amount: 35000, date: '2025-10-05', dueDate: '2025-11-05', billNo: 'BILL-005', description: 'Equipment Servicing' },
  ];

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
    // PDF generation logic here
  };

  const displayData = filteredData.length > 0 ? filteredData : allPayables;

  // Apply search filter
  const searchedData = displayData.filter(item => 
    item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.billNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          <h1 className="text-lg font-semibold">Payables - You will Give</h1>
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
                      <p className="text-sm font-bold text-white">{item.supplier}</p>
                      <p className="text-xs text-slate-400">{item.billNo} • {item.description}</p>
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