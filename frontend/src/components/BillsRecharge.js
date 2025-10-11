import React, { useState } from 'react';
import { ArrowLeft, Plus, Zap, Droplets, Phone, Wifi, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useBusiness } from '../contexts/BusinessContext';

export default function BillsRecharge() {
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();

  const bills = [
    { id: 1, type: 'Electricity', provider: 'State Electricity Board', amount: 8500, dueDate: '2025-01-15', status: 'pending', icon: Zap, color: 'yellow' },
    { id: 2, type: 'Water', provider: 'Municipal Corporation', amount: 1200, dueDate: '2025-01-20', status: 'paid', icon: Droplets, color: 'blue' },
    { id: 3, type: 'Internet', provider: 'Broadband Services', amount: 1500, dueDate: '2025-01-12', status: 'pending', icon: Wifi, color: 'purple' },
    { id: 4, type: 'Phone', provider: 'Telecom Provider', amount: 800, dueDate: '2025-01-18', status: 'paid', icon: Phone, color: 'green' },
  ];

  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidBills = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);
  const pendingBills = totalBills - paidBills;

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Bills & Recharge</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-blue-100">Total</p>
              <p className="text-lg font-bold text-white">₹{totalBills.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-green-100">Paid</p>
              <p className="text-lg font-bold text-white">₹{paidBills.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-red-100">Pending</p>
              <p className="text-lg font-bold text-white">₹{pendingBills.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          {bills.map(bill => {
            const Icon = bill.icon;
            return (
              <Card key={bill.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 bg-${bill.color}-900/30 rounded-lg`}>
                      <Icon className={`w-5 h-5 text-${bill.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{bill.type}</p>
                      <p className="text-xs text-slate-400">{bill.provider}</p>
                      <p className="text-xs text-slate-500">Due: {bill.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-400">₹{bill.amount.toLocaleString()}</p>
                      {bill.status === 'paid' ? (
                        <span className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded">Paid</span>
                      ) : (
                        <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded">Pending</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}