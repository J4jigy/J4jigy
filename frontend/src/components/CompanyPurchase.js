import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, ShoppingCart, Calendar, IndianRupee, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { useBusiness } from '../contexts/BusinessContext';

export default function CompanyPurchase() {
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  const [searchQuery, setSearchQuery] = useState('');

  const purchases = [
    { id: 1, item: 'Petrol Stock', quantity: '10000 L', amount: 1025000, supplier: 'Oil India Ltd', date: '2025-01-10', paid: false },
    { id: 2, item: 'Diesel Stock', quantity: '8000 L', amount: 716000, supplier: 'Bharat Petroleum', date: '2025-01-09', paid: true },
    { id: 3, item: 'Equipment Maintenance', quantity: '1 Service', amount: 25000, supplier: 'Tech Services', date: '2025-01-08', paid: true },
  ];

  const totalPurchases = purchases.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = purchases.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = totalPurchases - paidAmount;

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Company Purchase</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-orange-100">Total</p>
              <p className="text-lg font-bold text-white">₹{totalPurchases.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-green-100">Paid</p>
              <p className="text-lg font-bold text-white">₹{paidAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-red-100">Pending</p>
              <p className="text-lg font-bold text-white">₹{pendingAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          {purchases.map(purchase => (
            <Card key={purchase.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-bold text-white">{purchase.item}</p>
                    <p className="text-xs text-slate-400">{purchase.supplier} • {purchase.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-400">₹{purchase.amount.toLocaleString()}</p>
                    {purchase.paid ? (
                      <span className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded">Paid</span>
                    ) : (
                      <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded">Pending</span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400">{purchase.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}