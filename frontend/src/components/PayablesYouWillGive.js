import React, { useState } from 'react';
import { ArrowLeft, Download, Search, TrendingDown, Clock, AlertTriangle, DollarSign, Plus, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';

export default function PayablesYouWillGive() {
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  // Supplier-focused payables data matching the screenshot design
  const allSuppliers = [
    { 
      id: 1, 
      name: 'Oil India Ltd', 
      phone: '9876543220', 
      email: 'oil@example.com', 
      outstandingAmount: 150000, 
      creditLimit: 300000, 
      lastTransaction: '2025-01-10',
      status: 'overdue',
      daysOverdue: 5,
      utilizationPercent: 50
    },
    { 
      id: 2, 
      name: 'Bharat Petroleum', 
      phone: '9876543221', 
      email: 'bharat@example.com', 
      outstandingAmount: 200000, 
      creditLimit: 400000, 
      lastTransaction: '2025-01-09',
      status: 'active',
      daysOverdue: 0,
      utilizationPercent: 50
    },
    { 
      id: 3, 
      name: 'Equipment Co', 
      phone: '9876543222', 
      email: 'equipment@example.com', 
      outstandingAmount: 85000, 
      creditLimit: 150000, 
      lastTransaction: '2025-01-08',
      status: 'active',
      daysOverdue: 0,
      utilizationPercent: 57
    },
    { 
      id: 4, 
      name: 'Utility Company', 
      phone: '9876543223', 
      email: 'utility@example.com', 
      outstandingAmount: 12000, 
      creditLimit: 50000, 
      lastTransaction: '2025-01-07',
      status: 'overdue',
      daysOverdue: 10,
      utilizationPercent: 24
    },
  ];

  // Calculate summary statistics based on suppliers
  const totalPayable = allSuppliers.reduce((sum, supplier) => sum + supplier.outstandingAmount, 0);
  const totalSuppliers = allSuppliers.length;
  const avgBalance = totalSuppliers > 0 ? totalPayable / totalSuppliers : 0;
  const activeSuppliers = allSuppliers.filter(s => s.status === 'active').length;
  const overdueSuppliers = allSuppliers.filter(s => s.status === 'overdue').length;

  // Apply search filter
  const searchedData = allSuppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.phone.includes(searchQuery) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply filter
  let filteredData = searchedData;
  if (filterBy !== 'all') {
    if (filterBy === 'active') {
      filteredData = searchedData.filter(supplier => supplier.status === 'active');
    } else if (filterBy === 'overdue') {
      filteredData = searchedData.filter(supplier => supplier.status === 'overdue');
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10 p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Suppliers (Creditors)</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:bg-slate-700">
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Empty Content */}
      <div className="px-4 py-4">
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg">Suppliers (Creditors) management content will be added here.</p>
        </div>
      </div>
    </div>
  );
}