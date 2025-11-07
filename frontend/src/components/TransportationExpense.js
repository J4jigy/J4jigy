import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Truck, Calendar, DollarSign, MapPin, Filter, ChevronDown } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const TransportationExpense = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      category: 'Fuel',
      amount: 5000,
      date: '2024-11-01',
      vehicle: 'Truck-001',
      location: 'Mumbai Depot',
      driver: 'Rajesh Kumar',
      odometer: 45678,
      description: 'Diesel refill'
    },
    {
      id: 2,
      category: 'Maintenance',
      amount: 3500,
      date: '2024-10-28',
      vehicle: 'Truck-002',
      location: 'Service Center',
      driver: 'Amit Sharma',
      odometer: 32145,
      description: 'Engine oil change'
    },
    {
      id: 3,
      category: 'Toll',
      amount: 850,
      date: '2024-10-27',
      vehicle: 'Truck-001',
      location: 'NH-48',
      driver: 'Rajesh Kumar',
      odometer: 45123,
      description: 'Highway toll'
    },
    {
      id: 4,
      category: 'Parking',
      amount: 200,
      date: '2024-10-26',
      vehicle: 'Truck-003',
      location: 'City Center',
      driver: 'Suresh Patil',
      odometer: 28900,
      description: 'Overnight parking'
    },
    {
      id: 5,
      category: 'Driver Salary',
      amount: 15000,
      date: '2024-10-25',
      vehicle: 'All Vehicles',
      location: 'Office',
      driver: 'Multiple',
      odometer: 0,
      description: 'Monthly driver wages'
    }
  ]);

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'All Categories', icon: '📊' },
    { value: 'Fuel', label: 'Fuel', icon: '⛽' },
    { value: 'Maintenance', label: 'Maintenance', icon: '🔧' },
    { value: 'Toll', label: 'Toll', icon: '🛣️' },
    { value: 'Parking', label: 'Parking', icon: '🅿️' },
    { value: 'Driver Salary', label: 'Driver Salary', icon: '💰' },
    { value: 'Insurance', label: 'Insurance', icon: '🛡️' },
    { value: 'Permits', label: 'Permits', icon: '📄' },
  ];

  // Calculate summary
  const filteredExpenses = expenses.filter(exp => {
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
    const matchesSearch = exp.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exp.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sorting
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  const totalExpense = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const averageExpense = filteredExpenses.length > 0 ? Math.round(totalExpense / filteredExpenses.length) : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Header */}
      <div className="bg-slate-800 sticky top-0 z-10 border-b border-slate-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Transportation Expense</h1>
              <p className="text-xs text-slate-400">Track vehicle expenses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-blue-100">Total Expense</p>
              <p className="text-xl font-bold text-white">₹{totalExpense.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <DollarSign className="w-3 h-3 text-white" />
                <span className="text-xs text-white">{filteredExpenses.length} entries</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-green-100">Average</p>
              <p className="text-xl font-bold text-white">₹{averageExpense.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <Truck className="w-3 h-3 text-white" />
                <span className="text-xs text-white">Per entry</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <Button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              className={`whitespace-nowrap ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 border-slate-600'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Search and Sort */}
      <div className="px-4 mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by vehicle, driver, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Latest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="amount-desc">Highest Amount</SelectItem>
              <SelectItem value="amount-asc">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expense List */}
      <div className="px-4 space-y-3">
        {sortedExpenses.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No expenses found</p>
          </div>
        ) : (
          sortedExpenses.map(expense => (
            <Card key={expense.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-2">
                    <div className="text-2xl">
                      {categories.find(c => c.value === expense.category)?.icon || '📊'}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{expense.category}</p>
                      <p className="text-xs text-slate-400">{expense.description}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-white">₹{expense.amount.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Truck className="w-3 h-3" />
                    <span>{expense.vehicle}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3 h-3" />
                    <span>{expense.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <span>👤</span>
                    <span>{expense.driver}</span>
                  </div>
                </div>

                {expense.odometer > 0 && (
                  <div className="mt-2 text-xs text-slate-500">
                    Odometer: {expense.odometer.toLocaleString()} km
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle>Add Transportation Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-slate-400">Feature coming soon...</p>
            <Button onClick={() => setShowAddDialog(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-50"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default TransportationExpense;
