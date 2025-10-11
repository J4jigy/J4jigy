import React, { useState } from 'react';
import { ArrowLeft, Plus, FileBarChart, Download, Eye, Send, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';

export default function BillsInvoices() {
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  const [filterStatus, setFilterStatus] = useState('all');

  const invoices = [
    { id: 'INV-001', customer: 'Rajesh Enterprises', amount: 25000, date: '2025-01-10', dueDate: '2025-01-25', status: 'paid' },
    { id: 'INV-002', customer: 'Sharma Transport', amount: 15000, date: '2025-01-09', dueDate: '2025-01-24', status: 'pending' },
    { id: 'INV-003', customer: 'Kumar Industries', amount: 45000, date: '2025-01-08', dueDate: '2025-01-23', status: 'pending' },
    { id: 'INV-004', customer: 'Patel & Sons', amount: 8000, date: '2025-01-07', dueDate: '2025-01-22', status: 'paid' },
    { id: 'INV-005', customer: 'Singh Motors', amount: 32000, date: '2025-01-06', dueDate: '2025-01-21', status: 'overdue' },
  ];

  const totalInvoices = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);

  const filteredInvoices = invoices.filter(inv => {
    if (filterStatus === 'all') return true;
    return inv.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Bills & Invoices</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
          <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-blue-100">Total</p>
              <p className="text-lg font-bold text-white">₹{totalInvoices.toLocaleString()}</p>
              <p className="text-xs text-blue-200 mt-1">{invoices.length} invoices</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-green-100">Paid</p>
              <p className="text-lg font-bold text-white">₹{paidInvoices.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-orange-100">Pending</p>
              <p className="text-lg font-bold text-white">₹{pendingInvoices.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-red-100">Overdue</p>
              <p className="text-lg font-bold text-white">₹{overdueInvoices.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {filteredInvoices.map(invoice => (
            <Card key={invoice.id} className={`bg-slate-800 border-slate-700 ${
              invoice.status === 'overdue' ? 'border-red-500' : ''
            }`}>
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-bold text-white">{invoice.id}</p>
                    <p className="text-xs text-slate-400">{invoice.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-yellow-400">₹{invoice.amount.toLocaleString()}</p>
                    {invoice.status === 'paid' && (
                      <span className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Paid
                      </span>
                    )}
                    {invoice.status === 'pending' && (
                      <span className="text-xs bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {invoice.status === 'overdue' && (
                      <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded">Overdue</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                  <span>Date: {invoice.date}</span>
                  <span>Due: {invoice.dueDate}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="flex-1 text-blue-400 hover:bg-blue-900/30 h-7 text-xs">
                    <Eye className="w-3 h-3 mr-1" /> View
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1 text-green-400 hover:bg-green-900/30 h-7 text-xs">
                    <Download className="w-3 h-3 mr-1" /> Download
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1 text-purple-400 hover:bg-purple-900/30 h-7 text-xs">
                    <Send className="w-3 h-3 mr-1" /> Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
