import React, { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export default function Cash() {
  const navigate = useNavigate();
  
  // State for subsections
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Cash entries - empty by default
  const [cashEntries] = useState([]); // Empty - no default cash entries

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
        {/* Cash Balance Summary */}
        <div className="text-center mb-3">
          <p className="text-slate-400 text-sm mb-1">Current Cash Balance</p>
          <p className={`text-2xl font-bold ${calculateBalance() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ₹{calculateBalance().toLocaleString()}
          </p>
        </div>

        {/* Cash Entries List */}
        <div className="space-y-2 mb-4">
          {paginatedEntries.length > 0 ? (
            paginatedEntries.map((entry) => (
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
            ))
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6 text-center">
                <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No cash entries found matching your search.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Search Box - Moved to Bottom */}
        <Card className="bg-slate-800 border-slate-700 mb-3">
          <CardContent className="p-3">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </CardContent>
        </Card>

        {/* Sorting Toggle Box - Moved to Bottom */}
        <Card className="bg-slate-800 border-slate-700 mb-3">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="text-white text-sm font-medium">
                {sortOrder === 'asc' ? 'Newest' : 'Oldest'}
              </div>
              <Button
                onClick={toggleSort}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4"
              >
                {sortOrder === 'asc' ? 'Newest' : 'Oldest'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Page Selection - Moved to Bottom */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={sortedEntries.length}
              showInfo={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}