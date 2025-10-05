import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { useBusiness } from '../contexts/BusinessContext';
import { useRole } from '../contexts/RoleContext';

export default function Cash() {
  const navigate = useNavigate();
  const { getData, setData, activeBusiness } = useBusiness();
  
  // State for subsections
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Load cash entries for current business
  const [cashEntries, setCashEntries] = useState([]);

  // Load business-specific data when component mounts or business changes
  useEffect(() => {
    const businessCashEntries = getData('cash_entries', []);
    setCashEntries(businessCashEntries);
  }, [activeBusiness.id, getData]);

  // Save cash entries when they change
  const updateCashEntries = (newEntries) => {
    setCashEntries(newEntries);
    setData('cash_entries', newEntries);
  };

  // Filter entries based on search term
  const filteredEntries = cashEntries.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.amount.toString().includes(searchTerm)
  );

  // Sort entries
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.amount - b.amount;
    } else {
      return b.amount - a.amount;
    }
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedEntries.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = sortedEntries.slice(startIndex, startIndex + itemsPerPage);

  const handleBack = () => {
    navigate('/');
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const calculateBalance = () => {
    return sortedEntries.reduce((balance, entry) => {
      return entry.type === 'credit' ? balance + entry.amount : balance - entry.amount;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-blue-500/20 backdrop-blur-sm border-b border-blue-500/30 px-4 py-2 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <h1 className="text-white font-semibold text-base">Cash Management</h1>
        
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      <div className="p-4">
        {/* Cash Balance Summary in Card */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-4 text-center">
            <p className="text-slate-400 text-sm mb-1">Current Cash Balance</p>
            <p className={`text-2xl font-bold ${calculateBalance() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ₹{calculateBalance().toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Cash Entries List */}
        <div className="space-y-2 mb-4">
          {paginatedEntries.length > 0 && paginatedEntries.map((entry) => (
            <Card key={entry.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">{entry.description}</p>
                      <div className="text-right">
                        <p className={`font-bold ${entry.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                          {entry.type === 'credit' ? '+' : '-'}₹{entry.amount.toLocaleString()}
                        </p>
                        <p className="text-slate-400 text-xs">{entry.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Entry ID: #{entry.id}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        entry.type === 'credit' ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'
                      }`}>
                        {entry.type === 'credit' ? 'Credit' : 'Debit'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search Box */}
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white mb-4"
        />

        {/* Controls Row */}
        <div className="flex gap-4 mb-4">
          {/* Sort Dropdown */}
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest</SelectItem>
              <SelectItem value="asc">Oldest</SelectItem>
            </SelectContent>
          </Select>

          {/* Items per page */}
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="25">25 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Page Info */}
        <div className="text-center text-slate-400 text-sm">
          Page {currentPage} / {totalPages}
        </div>
      </div>
    </div>
  );
}