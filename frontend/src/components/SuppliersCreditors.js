import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Filter, Download, Truck, TrendingDown, AlertTriangle, Phone, Mail, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';

export default function SuppliersCreditors() {
  const navigate = useNavigate();
  const { getData, setData, activeBusiness } = useBusiness();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Get suppliers data
  const suppliers = getData('suppliers', []);

  // Sample suppliers
  const sampleSuppliers = suppliers.length > 0 ? suppliers : [
    { id: 1, name: 'Oil India Ltd', phone: '9876543220', email: 'oil@example.com', balance: 150000, creditDays: 30, lastPurchase: '2025-01-10', status: 'active' },
    { id: 2, name: 'Bharat Petroleum', phone: '9876543221', email: 'bharat@example.com', balance: 200000, creditDays: 45, lastPurchase: '2025-01-09', status: 'active' },
    { id: 3, name: 'Equipment Suppliers Co', phone: '9876543222', email: 'equip@example.com', balance: 85000, creditDays: 30, lastPurchase: '2025-01-08', status: 'warning' },
    { id: 4, name: 'Parts & Accessories', phone: '9876543223', email: 'parts@example.com', balance: 45000, creditDays: 15, lastPurchase: '2025-01-05', status: 'active' },
  ];

  // Calculate totals
  const totalPayable = sampleSuppliers.reduce((sum, s) => sum + s.balance, 0);
  const activeSuppliers = sampleSuppliers.filter(s => s.status === 'active').length;
  const overdueSuppliers = sampleSuppliers.filter(s => s.status === 'warning').length;
  const avgPayable = sampleSuppliers.length > 0 ? totalPayable / sampleSuppliers.length : 0;

  // Filter suppliers
  const filteredSuppliers = sampleSuppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.phone.includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || supplier.status === filterStatus;
    return matchesSearch && matchesFilter;
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
              <h1 className="text-lg font-bold">Suppliers (Creditors)</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-green-400">
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-red-100">Total Payable</p>
              <p className="text-lg font-bold text-white">₹{totalPayable.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3 text-white" />
                <span className="text-xs text-white">{sampleSuppliers.length} suppliers</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-purple-100">Avg Payable</p>
              <p className="text-lg font-bold text-white">₹{avgPayable.toFixed(0)}</p>
              <div className="flex items-center gap-1 mt-1">
                <IndianRupee className="w-3 h-3 text-white" />
                <span className="text-xs text-white">per supplier</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-blue-100">Active</p>
              <p className="text-lg font-bold text-white">{activeSuppliers}</p>
              <div className="flex items-center gap-1 mt-1">
                <Truck className="w-3 h-3 text-white" />
                <span className="text-xs text-white">suppliers</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-red-600 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-orange-100">Overdue</p>
              <p className="text-lg font-bold text-white">{overdueSuppliers}</p>
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3 text-white" />
                <span className="text-xs text-white">urgent payments</span>
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
                  placeholder="Search suppliers..."
                  className="bg-slate-700 border-slate-600 text-white pl-10 h-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white h-9">
                  <Filter className="w-4 h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="warning">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers List */}
        <div className="space-y-3">
          {filteredSuppliers.map(supplier => (
            <Card 
              key={supplier.id} 
              className="bg-slate-800 border-slate-700 cursor-pointer hover:border-indigo-500 transition-colors"
              onClick={() => {
                setSelectedSupplier(supplier);
                setShowDetailsDialog(true);
              }}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{supplier.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {supplier.phone}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">₹{supplier.balance.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Payable</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                  <span className="text-xs text-slate-400">Credit: {supplier.creditDays} days</span>
                  <span className="text-xs text-slate-400">Last: {supplier.lastPurchase}</span>
                  {supplier.status === 'warning' && (
                    <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded">Overdue</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Supplier Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Supplier Name" className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Phone Number" className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Email" className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Credit Days" type="number" className="bg-slate-700 border-slate-600 text-white" />
            <div className="flex gap-2">
              <Button onClick={() => setShowAddDialog(false)} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                Add Supplier
              </Button>
              <Button onClick={() => setShowAddDialog(false)} variant="outline" className="border-slate-600">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Supplier Details Dialog */}
      {selectedSupplier && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>{selectedSupplier.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-700 rounded">
                  <p className="text-xs text-slate-400">Total Payable</p>
                  <p className="text-lg font-bold text-red-400">₹{selectedSupplier.balance.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-700 rounded">
                  <p className="text-xs text-slate-400">Credit Days</p>
                  <p className="text-lg font-bold text-blue-400">{selectedSupplier.creditDays}</p>
                </div>
              </div>
              <Button onClick={() => setShowDetailsDialog(false)} className="w-full">Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
