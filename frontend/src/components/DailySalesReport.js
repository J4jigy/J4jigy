import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Download, IndianRupee, Package, CreditCard, Clock, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';
import { useRole } from '../contexts/RoleContext';

export default function DailySalesReport() {
  const navigate = useNavigate();
  const { getData, activeBusiness } = useBusiness();
  const { hasPermission } = useRole();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('summary'); // summary, products, payments

  // Check permissions
  if (!hasPermission('reports_view') && !hasPermission('cash_view')) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-base font-semibold">Daily Sales Report</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <p className="text-slate-400">You don't have permission to view reports.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get cash entries from business context
  const cashEntries = getData('cash_entries', []);

  // Filter entries for selected date
  const filterByDate = (entries) => {
    return entries.filter(entry => {
      const entryDate = entry.date || new Date().toISOString().split('T')[0];
      return entryDate === selectedDate;
    });
  };

  const dailyEntries = filterByDate(cashEntries);
  const cashInEntries = dailyEntries.filter(e => e.type === 'cash-in');
  const cashOutEntries = dailyEntries.filter(e => e.type === 'cash-out');

  // Calculate daily totals
  const totalSales = cashInEntries.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const totalExpenses = cashOutEntries.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const netProfit = totalSales - totalExpenses;
  const transactionCount = dailyEntries.length;

  // Product-wise sales
  const productSales = {};
  cashInEntries.forEach(entry => {
    if (entry.items) {
      Object.entries(entry.items).forEach(([product, quantity]) => {
        if (!productSales[product]) {
          productSales[product] = { quantity: 0, revenue: 0 };
        }
        productSales[product].quantity += quantity;
        // Approximate revenue (if price data available)
        productSales[product].revenue += parseFloat(entry.amount || 0) / Object.keys(entry.items).length;
      });
    }
  });

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  // Payment method breakdown
  const paymentMethods = {};
  dailyEntries.forEach(entry => {
    const method = entry.paymentMode || 'Cash';
    if (!paymentMethods[method]) {
      paymentMethods[method] = { count: 0, amount: 0 };
    }
    paymentMethods[method].count += 1;
    paymentMethods[method].amount += parseFloat(entry.amount || 0);
  });

  // Hourly sales (simulated)
  const hourlySales = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    sales: Math.floor(Math.random() * (totalSales / 10))
  }));

  const peakHour = hourlySales.reduce((max, curr) => curr.sales > max.sales ? curr : max, hourlySales[0]);

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
              <h1 className="text-lg font-bold">Daily Sales Report</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-green-400">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>

        {/* Date & View Mode Selector */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          <div className="flex items-center gap-2 bg-slate-700 rounded px-2 py-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white text-sm border-none outline-none"
            />
          </div>

          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="products">Products</SelectItem>
              <SelectItem value="payments">Payments</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-green-100">Total Sales</p>
              <p className="text-lg font-bold text-white">₹{totalSales.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-white" />
                <span className="text-xs text-white">{cashInEntries.length} transactions</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-red-100">Expenses</p>
              <p className="text-lg font-bold text-white">₹{totalExpenses.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3 text-white" />
                <span className="text-xs text-white">{cashOutEntries.length} transactions</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-blue-100">Net Profit</p>
              <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-white' : 'text-red-200'}`}>
                ₹{netProfit.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <IndianRupee className="w-3 h-3 text-white" />
                <span className="text-xs text-white">{totalSales > 0 ? ((netProfit/totalSales)*100).toFixed(1) : 0}% margin</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-purple-100">Transactions</p>
              <p className="text-lg font-bold text-white">{transactionCount}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-white" />
                <span className="text-xs text-white">Avg ₹{transactionCount > 0 ? (totalSales/cashInEntries.length).toFixed(0) : 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Mode Content */}
        {viewMode === 'summary' && (
          <>
            {/* Top Selling Products */}
            <Card className="bg-slate-800 border-slate-700 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-cyan-400">Top Selling Products</h2>
                  <Award className="w-5 h-5 text-yellow-400" />
                </div>
                {topProducts.length > 0 ? (
                  <div className="space-y-2">
                    {topProducts.map(([product, data], idx) => (
                      <div key={product} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                          <div>
                            <p className="text-sm text-white font-medium">{product}</p>
                            <p className="text-xs text-slate-400">{data.quantity} units sold</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-green-400">₹{data.revenue.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">No product sales recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Peak Hours */}
            <Card className="bg-slate-800 border-slate-700 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-purple-400">Peak Sales Hour</h2>
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-white">{peakHour.hour}</p>
                  <p className="text-sm text-purple-100">Highest sales: ₹{peakHour.sales.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {viewMode === 'products' && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-cyan-400">Product-wise Sales</h2>
                <Package className="w-5 h-5 text-cyan-400" />
              </div>
              {Object.keys(productSales).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(productSales)
                    .sort((a, b) => b[1].revenue - a[1].revenue)
                    .map(([product, data]) => (
                      <div key={product} className="p-3 bg-slate-700/50 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium text-white">{product}</p>
                          <span className="text-sm font-bold text-green-400">₹{data.revenue.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Quantity: {data.quantity} units</span>
                          <span>Avg: ₹{(data.revenue / data.quantity).toFixed(0)}/unit</span>
                        </div>
                        <div className="mt-2 bg-slate-600 rounded-full h-1.5">
                          <div 
                            className="bg-cyan-400 h-1.5 rounded-full"
                            style={{ width: `${(data.revenue / totalSales * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">No product data available</p>
              )}
            </CardContent>
          </Card>
        )}

        {viewMode === 'payments' && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-blue-400">Payment Methods</h2>
                <CreditCard className="w-5 h-5 text-blue-400" />
              </div>
              {Object.keys(paymentMethods).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(paymentMethods).map(([method, data]) => (
                    <div key={method} className="p-3 bg-slate-700/50 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="text-sm font-medium text-white">{method}</p>
                          <p className="text-xs text-slate-400">{data.count} transactions</p>
                        </div>
                        <span className="text-lg font-bold text-blue-400">₹{data.amount.toLocaleString()}</span>
                      </div>
                      <div className="mt-2 bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full"
                          style={{ width: `${(data.amount / (totalSales + totalExpenses) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {((data.amount / (totalSales + totalExpenses)) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">No payment data available</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
            <p className="text-xs text-slate-400">Avg Transaction</p>
            <p className="text-sm font-bold text-white">
              ₹{cashInEntries.length > 0 ? (totalSales / cashInEntries.length).toFixed(0) : 0}
            </p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
            <p className="text-xs text-slate-400">Products Sold</p>
            <p className="text-sm font-bold text-cyan-400">{Object.keys(productSales).length}</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
            <p className="text-xs text-slate-400">Gross Margin</p>
            <p className="text-sm font-bold text-green-400">
              {totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}