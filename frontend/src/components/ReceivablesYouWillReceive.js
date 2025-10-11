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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  // Customer-focused receivables data matching the screenshot design
  const allCustomers = [
    { 
      id: 1, 
      name: 'Rajesh Enterprises', 
      phone: '9876543210', 
      email: 'rajesh@example.com', 
      outstandingAmount: 25000, 
      creditLimit: 50000, 
      lastTransaction: '2025-01-10',
      status: 'overdue',
      daysOverdue: 8,
      utilizationPercent: 50
    },
    { 
      id: 2, 
      name: 'Sharma Transport', 
      phone: '9876543211', 
      email: 'sharma@example.com', 
      outstandingAmount: 15000, 
      creditLimit: 30000, 
      lastTransaction: '2025-01-09',
      status: 'active',
      daysOverdue: 0,
      utilizationPercent: 50
    },
    { 
      id: 3, 
      name: 'Kumar Industries', 
      phone: '9876543212', 
      email: 'kumar@example.com', 
      outstandingAmount: 45000, 
      creditLimit: 75000, 
      lastTransaction: '2025-01-08',
      status: 'active',
      daysOverdue: 0,
      utilizationPercent: 60
    },
    { 
      id: 4, 
      name: 'Patel & Sons', 
      phone: '9876543213', 
      email: 'patel@example.com', 
      outstandingAmount: 8000, 
      creditLimit: 25000, 
      lastTransaction: '2025-01-07',
      status: 'active',
      daysOverdue: 0,
      utilizationPercent: 32
    },
  ];

  // Calculate summary statistics based on customers
  const totalReceivable = allCustomers.reduce((sum, customer) => sum + customer.outstandingAmount, 0);
  const totalCustomers = allCustomers.length;
  const avgBalance = totalCustomers > 0 ? totalReceivable / totalCustomers : 0;
  const activeCustomers = allCustomers.filter(c => c.status === 'active').length;
  const overdueCustomers = allCustomers.filter(c => c.status === 'overdue').length;

  // Apply search filter
  const searchedData = allCustomers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply filter
  let filteredData = searchedData;
  if (filterBy !== 'all') {
    if (filterBy === 'active') {
      filteredData = searchedData.filter(customer => customer.status === 'active');
    } else if (filterBy === 'overdue') {
      filteredData = searchedData.filter(customer => customer.status === 'overdue');
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
              <h1 className="text-lg font-semibold">Customers (Debtors)</h1>
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
          <p className="text-slate-400 text-lg">Customers (Debtors) management content will be added here.</p>
        </div>
      </div>
    </div>
  );
}