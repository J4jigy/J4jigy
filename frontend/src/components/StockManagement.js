import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Package, AlertCircle, TrendingUp, TrendingDown, Download, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';

export default function StockManagement() {
  const navigate = useNavigate();
  const { getData, setData, activeBusiness } = useBusiness();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Get stock data
  const stock = getData('stock', []);

  // Sample stock items
  const sampleStock = stock.length > 0 ? stock : [
    { id: 1, name: 'Petrol', category: 'Fuel', currentStock: 15000, minStock: 10000, unit: 'Liters', price: 102.50, lastUpdated: '2025-01-10', status: 'good' },
    { id: 2, name: 'Diesel', category: 'Fuel', currentStock: 8000, minStock: 12000, unit: 'Liters', price: 89.50, lastUpdated: '2025-01-10', status: 'low' },
    { id: 3, name: 'Engine Oil 5W30', category: 'Lubricants', currentStock: 250, minStock: 200, unit: 'Bottles', price: 450, lastUpdated: '2025-01-09', status: 'good' },
    { id: 4, name: 'Gear Oil', category: 'Lubricants', currentStock: 80, minStock: 150, unit: 'Bottles', price: 380, lastUpdated: '2025-01-08', status: 'low' },
    { id: 5, name: 'Coolant', category: 'Additives', currentStock: 120, minStock: 100, unit: 'Bottles', price: 250, lastUpdated: '2025-01-08', status: 'good' },
    { id: 6, name: 'Brake Fluid', category: 'Additives', currentStock: 40, minStock: 80, unit: 'Bottles', price: 180, lastUpdated: '2025-01-07', status: 'critical' },
  ];

  // Calculate totals
  const totalItems = sampleStock.length;
  const lowStockItems = sampleStock.filter(item => item.status === 'low' || item.status === 'critical').length;
  const totalValue = sampleStock.reduce((sum, item) => sum + (item.currentStock * item.price), 0);
  const criticalItems = sampleStock.filter(item => item.status === 'critical').length;

  // Filter stock
  const filteredStock = sampleStock.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (viewMode === 'all') return matchesSearch;
    if (viewMode === 'low') return matchesSearch && (item.status === 'low' || item.status === 'critical');
    if (viewMode === 'good') return matchesSearch && item.status === 'good';
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Stock Management</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-green-400">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-blue-100">Total Items</p>
              <p className="text-lg font-bold text-white">{totalItems}</p>
              <div className="flex items-center gap-1 mt-1">
                <Package className="w-3 h-3 text-white" />
                <span className="text-xs text-white">in inventory</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-green-100">Stock Value</p>
              <p className="text-lg font-bold text-white">₹{totalValue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-white" />
                <span className="text-xs text-white">total worth</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-red-600 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-orange-100">Low Stock</p>
              <p className="text-lg font-bold text-white">{lowStockItems}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3 text-white" />
                <span className="text-xs text-white">needs reorder</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-red-100">Critical</p>
              <p className="text-lg font-bold text-white">{criticalItems}</p>
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 text-white" />
                <span className="text-xs text-white">urgent</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items..."
                  className="bg-slate-700 border-slate-600 text-white pl-10 h-9"
                />
              </div>
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="good">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stock Items List */}
        <div className="space-y-3">
          {filteredStock.map(item => (
            <Card 
              key={item.id} 
              className={`bg-slate-800 border-slate-700 ${
                item.status === 'critical' ? 'border-red-500' : 
                item.status === 'low' ? 'border-orange-500' : ''
              }`}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-400">{item.currentStock} {item.unit}</p>
                    <p className="text-xs text-slate-400">₹{item.price}/{item.unit}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                  <span>Min: {item.minStock} {item.unit}</span>
                  <span>Updated: {item.lastUpdated}</span>
                  {item.status === 'critical' && (
                    <span className="bg-red-900/50 text-red-300 px-2 py-0.5 rounded">Critical</span>
                  )}
                  {item.status === 'low' && (
                    <span className="bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded">Low Stock</span>
                  )}
                  {item.status === 'good' && (
                    <span className="bg-green-900/50 text-green-300 px-2 py-0.5 rounded">In Stock</span>
                  )}
                </div>

                <div className="bg-slate-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      item.status === 'critical' ? 'bg-red-400' :
                      item.status === 'low' ? 'bg-orange-400' : 'bg-green-400'
                    }`}
                    style={{ width: `${Math.min((item.currentStock / item.minStock) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Stock Value: ₹{(item.currentStock * item.price).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Stock Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Add Stock Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Item Name" className="bg-slate-700 border-slate-600 text-white" />
            <Select>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="fuel">Fuel</SelectItem>
                <SelectItem value="lubricants">Lubricants</SelectItem>
                <SelectItem value="additives">Additives</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Current Stock" type="number" className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Minimum Stock Level" type="number" className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Unit (Liters, Bottles, etc)" className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Price per Unit" type="number" className="bg-slate-700 border-slate-600 text-white" />
            <div className="flex gap-2">
              <Button onClick={() => setShowAddDialog(false)} className="flex-1 bg-orange-600 hover:bg-orange-700">
                Add Item
              </Button>
              <Button onClick={() => setShowAddDialog(false)} variant="outline" className="border-slate-600">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-50"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
