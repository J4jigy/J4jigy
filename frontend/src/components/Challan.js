import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Truck, Package, Plus, Eye, Download, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';

const Challan = () => {
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  const [filterStatus, setFilterStatus] = useState('all');
  const [challanType, setChallanType] = useState('all');

  // Sample challan data
  const challans = [
    { id: 'DC-001', party: 'Rajesh Enterprises', type: 'delivery', amount: 25000, date: '2025-01-10', status: 'completed', items: 5 },
    { id: 'PC-001', party: 'Kumar Suppliers', type: 'purchase', amount: 15000, date: '2025-01-09', status: 'pending', items: 3 },
    { id: 'DC-002', party: 'Sharma Transport', type: 'delivery', amount: 45000, date: '2025-01-08', status: 'pending', items: 8 },
    { id: 'GP-001', party: 'Singh Industries', type: 'gate', amount: 0, date: '2025-01-07', status: 'completed', items: 2 },
    { id: 'DC-003', party: 'Patel & Sons', type: 'delivery', amount: 32000, date: '2025-01-06', status: 'rejected', items: 4 },
  ];

  const totalChallans = challans.length;
  const completedChallans = challans.filter(c => c.status === 'completed').length;
  const pendingChallans = challans.filter(c => c.status === 'pending').length;
  const rejectedChallans = challans.filter(c => c.status === 'rejected').length;

  const filteredChallans = challans.filter(c => {
    const statusMatch = filterStatus === 'all' || c.status === filterStatus;
    const typeMatch = challanType === 'all' || c.type === challanType;
    return statusMatch && typeMatch;
  });

  const getTypeLabel = (type) => {
    const labels = {
      delivery: 'Delivery',
      purchase: 'Purchase',
      gate: 'Gate Pass',
      payment: 'Payment'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      delivery: 'text-blue-400',
      purchase: 'text-green-400',
      gate: 'text-orange-400',
      payment: 'text-purple-400'
    };
    return colors[type] || 'text-slate-400';
  };

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
              <h1 className="text-lg font-bold">Challan Management</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-blue-100">Total</p>
              <p className="text-lg font-bold text-white">{totalChallans}</p>
              <p className="text-xs text-blue-200 mt-1">{totalChallans} challans</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-green-100">Completed</p>
              <p className="text-lg font-bold text-white">{completedChallans}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-orange-100">Pending</p>
              <p className="text-lg font-bold text-white">{pendingChallans}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-red-100">Rejected</p>
              <p className="text-lg font-bold text-white">{rejectedChallans}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <Select value={challanType} onValueChange={setChallanType}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Challan Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="gate">Gate Pass</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Challan List */}
        <div className="space-y-3">
          {filteredChallans.map(challan => (
            <Card key={challan.id} className={`bg-slate-800 border-slate-700 ${
              challan.status === 'rejected' ? 'border-red-500' : ''
            }`}>
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-bold text-white">{challan.id}</p>
                    <p className="text-xs text-slate-400">{challan.party}</p>
                    <p className={`text-xs font-medium mt-1 ${getTypeColor(challan.type)}`}>
                      {getTypeLabel(challan.type)} Challan
                    </p>
                  </div>
                  <div className="text-right">
                    {challan.amount > 0 && (
                      <p className="text-sm font-bold text-cyan-400">₹{challan.amount.toLocaleString()}</p>
                    )}
                    {challan.status === 'completed' && (
                      <span className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded flex items-center gap-1 mt-1">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </span>
                    )}
                    {challan.status === 'pending' && (
                      <span className="text-xs bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {challan.status === 'rejected' && (
                      <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                  <span>Date: {challan.date}</span>
                  <span>Items: {challan.items}</span>
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
};

export default Challan;
