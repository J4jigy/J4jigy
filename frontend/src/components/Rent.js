import React, { useState } from 'react';
import { ArrowLeft, Building, Calendar, IndianRupee, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useBusiness } from '../contexts/BusinessContext';

export default function Rent() {
  const navigate = useNavigate();
  const { activeBusiness, getData } = useBusiness();
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'given'

  // Rent Received data (income)
  const rentReceivedData = {
    monthlyRent: 50000,
    advance: 100000,
    agreementStart: '2024-01-01',
    agreementEnd: '2025-12-31',
    tenant: 'Tenant Name',
    propertyAddress: 'Shop Address, City'
  };

  const rentReceivedHistory = [
    { id: 1, month: 'January 2025', amount: 50000, paidDate: '2025-01-05', status: 'paid', type: 'received' },
    { id: 2, month: 'December 2024', amount: 50000, paidDate: '2024-12-05', status: 'paid', type: 'received' },
    { id: 3, month: 'November 2024', amount: 50000, paidDate: '2024-11-05', status: 'paid', type: 'received' },
  ];

  // Rent Given data (expense)
  const rentGivenData = {
    monthlyRent: 35000,
    advance: 70000,
    agreementStart: '2024-06-01',
    agreementEnd: '2026-05-31',
    landlord: 'Property Owner Name',
    propertyAddress: 'Office Space Address, City'
  };

  const rentGivenHistory = [
    { id: 4, month: 'January 2025', amount: 35000, paidDate: '2025-01-03', status: 'paid', type: 'given' },
    { id: 5, month: 'December 2024', amount: 35000, paidDate: '2024-12-03', status: 'paid', type: 'given' },
    { id: 6, month: 'November 2024', amount: 35000, paidDate: '2024-11-03', status: 'paid', type: 'given' },
  ];

  // Get current data based on active tab
  const currentData = activeTab === 'received' ? rentReceivedData : rentGivenData;
  const currentHistory = activeTab === 'received' ? rentReceivedHistory : rentGivenHistory;
  const personLabel = activeTab === 'received' ? 'Tenant' : 'Landlord';
  const personName = activeTab === 'received' ? currentData.tenant : currentData.landlord;

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Rent Management</h1>
            <p className="text-xs text-slate-400">{activeBusiness.name}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => setActiveTab('received')}
            className={`flex-1 ${
              activeTab === 'received'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Rent Received
          </Button>
          <Button
            onClick={() => setActiveTab('given')}
            className={`flex-1 ${
              activeTab === 'given'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Rent Given
          </Button>
        </div>
      </div>

      <div className="px-4">
        <Card className={`border-0 mb-4 ${activeTab === 'received' ? 'bg-gradient-to-br from-green-600 to-green-700' : 'bg-gradient-to-br from-red-600 to-red-700'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Building className="w-8 h-8 text-white" />
              <div>
                <p className={`text-sm ${activeTab === 'received' ? 'text-green-100' : 'text-red-100'}`}>Monthly Rent</p>
                <p className="text-2xl font-bold text-white">₹{currentData.monthlyRent.toLocaleString()}</p>
              </div>
            </div>
            <div className={`grid grid-cols-2 gap-2 text-xs ${activeTab === 'received' ? 'text-green-100' : 'text-red-100'}`}>
              <div>
                <p className={activeTab === 'received' ? 'text-green-200' : 'text-red-200'}>{personLabel}</p>
                <p className="font-medium">{personName}</p>
              </div>
              <div>
                <p className={activeTab === 'received' ? 'text-green-200' : 'text-red-200'}>Advance</p>
                <p className="font-medium">₹{currentData.advance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-4">
            <h2 className="text-sm font-bold text-white mb-3">Agreement Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Start Date</span>
                <span className="text-white">{currentData.agreementStart}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">End Date</span>
                <span className="text-white">{currentData.agreementEnd}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Property</span>
                <span className="text-white text-right">{currentData.propertyAddress}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-sm font-bold text-white mb-3">Payment History</h2>
        <div className="space-y-3">
          {currentHistory.map(rent => (
            <Card key={rent.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{rent.month}</p>
                      <p className="text-xs text-slate-400">Paid on {rent.paidDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-400">₹{rent.amount.toLocaleString()}</p>
                    <span className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded">Paid</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Floating Add Button */}
        <button
          className="fixed bottom-20 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-50"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}