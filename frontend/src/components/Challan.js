import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Truck, Package, Plus, Eye, Download, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';

const Challan = () => {
  const navigate = useNavigate();
  const { activeBusiness, getData } = useBusiness();
  const [activeTab, setActiveTab] = useState('challan'); // 'challan' or 'gatepass'
  const [filterStatus, setFilterStatus] = useState('all');
  const [challanType, setChallanType] = useState('all');

  // Load challans and gate passes from localStorage
  const storedChallans = getData('challans', []);
  const storedGatePasses = getData('gate_passes', []);
  
  // Sample challan data
  const sampleChallans = [
    { id: 'DC-001', party: 'Rajesh Enterprises', type: 'delivery', amount: 25000, date: '2025-01-10', status: 'completed', items: 5 },
    { id: 'PC-001', party: 'Kumar Suppliers', type: 'purchase', amount: 15000, date: '2025-01-09', status: 'pending', items: 3 },
    { id: 'DC-002', party: 'Sharma Transport', type: 'delivery', amount: 45000, date: '2025-01-08', status: 'pending', items: 8 },
    { id: 'DC-003', party: 'Patel & Sons', type: 'delivery', amount: 32000, date: '2025-01-06', status: 'rejected', items: 4 },
  ];
  
  // Sample gate pass data
  const sampleGatePasses = [
    { id: 'GP-001', party: 'Singh Industries', vehicleNumber: 'MH12AB1234', amount: 5000, date: '2025-01-10', status: 'completed', items: 2 },
    { id: 'GP-002', party: 'Kumar Transport', vehicleNumber: 'DL01CD5678', amount: 8000, date: '2025-01-09', status: 'pending', items: 4 },
    { id: 'GP-003', party: 'Sharma Logistics', vehicleNumber: 'GJ05EF9012', amount: 3500, date: '2025-01-08', status: 'completed', items: 1 },
  ];
  
  // Combine stored and sample data
  const challans = [...storedChallans, ...sampleChallans];
  const gatePasses = [...storedGatePasses, ...sampleGatePasses];

  // Calculate stats based on active tab
  const currentData = activeTab === 'challan' ? challans : gatePasses;
  const totalCount = currentData.length;
  const completedCount = currentData.filter(c => c.status === 'completed').length;
  const pendingCount = currentData.filter(c => c.status === 'pending').length;
  const rejectedCount = currentData.filter(c => c.status === 'rejected').length;

  const filteredData = currentData.filter(c => {
    const statusMatch = filterStatus === 'all' || c.status === filterStatus;
    if (activeTab === 'challan') {
      const typeMatch = challanType === 'all' || c.type === challanType;
      return statusMatch && typeMatch;
    }
    return statusMatch;
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
              <h1 className="text-lg font-bold">Challan Gate Pass</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
          <Button size="sm" className={activeTab === 'challan' ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-green-600 hover:bg-green-700'}>
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setActiveTab('challan');
              setFilterStatus('all');
              setChallanType('all');
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'challan'
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Challan
          </button>
          <button
            onClick={() => {
              setActiveTab('gatepass');
              setFilterStatus('all');
              setChallanType('all');
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'gatepass'
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Gate Pass
          </button>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-blue-100">Total</p>
              <p className="text-lg font-bold text-white">{totalCount}</p>
              <p className="text-xs text-blue-200 mt-1">{totalCount} {activeTab === 'challan' ? 'challans' : 'gate passes'}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-green-100">Completed</p>
              <p className="text-lg font-bold text-white">{completedCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-orange-100">Pending</p>
              <p className="text-lg font-bold text-white">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-red-100">Rejected</p>
              <p className="text-lg font-bold text-white">{rejectedCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {activeTab === 'challan' && (
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
                    <SelectItem value="payment">Payment</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
          <Card className={`bg-slate-800 border-slate-700 ${activeTab === 'gatepass' ? 'col-span-2' : ''}`}>
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

        {/* List - Challan or Gate Pass */}
        <div className="space-y-3">
          {filteredData.map(item => (
            <Card key={item.id} className={`bg-slate-800 border-slate-700 ${
              item.status === 'rejected' ? 'border-red-500' : ''
            }`}>
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-bold text-white">{item.id}</p>
                    <p className="text-xs text-slate-400">{item.party}</p>
                    {activeTab === 'challan' && item.type && (
                      <p className={`text-xs font-medium mt-1 ${getTypeColor(item.type)}`}>
                        {getTypeLabel(item.type)} Challan
                      </p>
                    )}
                    {activeTab === 'gatepass' && item.vehicleNumber && (
                      <p className="text-xs font-medium mt-1 text-green-400">
                        Vehicle: {item.vehicleNumber}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {item.amount > 0 && (
                      <p className={`text-sm font-bold ${activeTab === 'challan' ? 'text-cyan-400' : 'text-green-400'}`}>
                        ₹{item.amount.toLocaleString()}
                      </p>
                    )}
                    {item.status === 'completed' && (
                      <span className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded flex items-center gap-1 mt-1">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <span className="text-xs bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {item.status === 'rejected' && (
                      <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                  <span>Date: {item.date}</span>
                  <span>Items: {item.items}</span>
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
