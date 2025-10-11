import React, { useState } from 'react';
import { ArrowLeft, Plus, Coins, TrendingDown, Calendar, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useBusiness } from '../contexts/BusinessContext';

export default function OtherExpenses() {
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();

  const expenses = [
    { id: 1, category: 'Office Supplies', description: 'Stationery and printing', amount: 2500, date: '2025-01-10', paymentMode: 'Cash' },
    { id: 2, category: 'Transportation', description: 'Fuel for company vehicle', amount: 3500, date: '2025-01-09', paymentMode: 'Card' },
    { id: 3, category: 'Maintenance', description: 'Equipment repair', amount: 5000, date: '2025-01-08', paymentMode: 'Bank' },
    { id: 4, category: 'Miscellaneous', description: 'Cleaning supplies', amount: 1200, date: '2025-01-07', paymentMode: 'Cash' },
    { id: 5, category: 'Marketing', description: 'Banner printing', amount: 4000, date: '2025-01-06', paymentMode: 'Card' },
  ];

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonth = expenses.filter(e => e.date.includes('2025-01')).reduce((sum, e) => sum + e.amount, 0);
  const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

  const categories = [...new Set(expenses.map(e => e.category))];

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Other Expenses</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-purple-100">Total</p>
              <p className="text-lg font-bold text-white">₹{totalExpenses.toLocaleString()}</p>
              <p className="text-xs text-purple-200 mt-1">{expenses.length} entries</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-red-100">This Month</p>
              <p className="text-lg font-bold text-white">₹{thisMonth.toLocaleString()}</p>
              <p className="text-xs text-red-200 mt-1">January</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-blue-100">Average</p>
              <p className="text-lg font-bold text-white">₹{avgExpense.toFixed(0)}</p>
              <p className="text-xs text-blue-200 mt-1">per entry</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-3">
            <h3 className="text-sm font-bold text-white mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <span key={cat} className="text-xs bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full border border-purple-700">
                  {cat}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {expenses.map(expense => (
            <Card key={expense.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="w-4 h-4 text-purple-400" />
                      <p className="text-sm font-bold text-white">{expense.category}</p>
                    </div>
                    <p className="text-xs text-slate-400">{expense.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">₹{expense.amount.toLocaleString()}</p>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{expense.paymentMode}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  {expense.date}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
