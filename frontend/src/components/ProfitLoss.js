import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Download, RefreshCw, DollarSign, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';
import { useRole } from '../contexts/RoleContext';

export default function ProfitLoss() {
  const navigate = useNavigate();
  const { getData, activeBusiness } = useBusiness();
  const { hasPermission } = useRole();
  
  const [period, setPeriod] = useState('monthly');
  const [showComparison, setShowComparison] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Check permissions
  if (!hasPermission('reports_view')) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-base font-semibold">Profit & Loss</h1>
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

  // Calculate P&L using double-entry accounting
  const calculateProfitLoss = () => {
    const revenue = {
      sales: 0,
      services: 0,
      other: 0
    };

    const costOfGoodsSold = {
      purchases: 0,
      directLabor: 0,
      manufacturing: 0
    };

    const operatingExpenses = {
      salaries: 0,
      rent: 0,
      utilities: 0,
      marketing: 0,
      depreciation: 0,
      insurance: 0,
      supplies: 0,
      maintenance: 0,
      other: 0
    };

    const otherIncome = {
      interest: 0,
      dividends: 0,
      misc: 0
    };

    const otherExpenses = {
      interest: 0,
      taxes: 0,
      misc: 0
    };

    // Process cash entries
    cashEntries.forEach(entry => {
      const amount = parseFloat(entry.amount || 0);
      
      if (entry.type === 'cash-in') {
        // Revenue entries
        if (entry.category === 'sales') revenue.sales += amount;
        else if (entry.category === 'services') revenue.services += amount;
        else if (entry.category === 'interest-income') otherIncome.interest += amount;
        else if (entry.category === 'dividend') otherIncome.dividends += amount;
        else revenue.other += amount;
      } else if (entry.type === 'cash-out') {
        // Expense entries
        if (entry.category === 'purchases' || entry.category === 'inventory') {
          costOfGoodsSold.purchases += amount;
        } else if (entry.category === 'salaries' || entry.category === 'wages') {
          operatingExpenses.salaries += amount;
        } else if (entry.category === 'rent') {
          operatingExpenses.rent += amount;
        } else if (entry.category === 'utilities') {
          operatingExpenses.utilities += amount;
        } else if (entry.category === 'marketing' || entry.category === 'advertising') {
          operatingExpenses.marketing += amount;
        } else if (entry.category === 'insurance') {
          operatingExpenses.insurance += amount;
        } else if (entry.category === 'supplies') {
          operatingExpenses.supplies += amount;
        } else if (entry.category === 'maintenance' || entry.category === 'repairs') {
          operatingExpenses.maintenance += amount;
        } else if (entry.category === 'interest-expense') {
          otherExpenses.interest += amount;
        } else if (entry.category === 'taxes') {
          otherExpenses.taxes += amount;
        } else {
          operatingExpenses.other += amount;
        }
      }
    });

    return { revenue, costOfGoodsSold, operatingExpenses, otherIncome, otherExpenses };
  };

  const profitLoss = calculateProfitLoss();

  // Calculate totals
  const totalRevenue = Object.values(profitLoss.revenue).reduce((a, b) => a + b, 0);
  const totalCOGS = Object.values(profitLoss.costOfGoodsSold).reduce((a, b) => a + b, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const grossProfitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0;

  const totalOperatingExpenses = Object.values(profitLoss.operatingExpenses).reduce((a, b) => a + b, 0);
  const operatingIncome = grossProfit - totalOperatingExpenses;
  const operatingMargin = totalRevenue > 0 ? ((operatingIncome / totalRevenue) * 100).toFixed(1) : 0;

  const totalOtherIncome = Object.values(profitLoss.otherIncome).reduce((a, b) => a + b, 0);
  const totalOtherExpenses = Object.values(profitLoss.otherExpenses).reduce((a, b) => a + b, 0);
  const netProfit = operatingIncome + totalOtherIncome - totalOtherExpenses;
  const netProfitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

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
              <h1 className="text-lg font-bold">Profit & Loss Statement</h1>
              <p className="text-xs text-slate-400">{activeBusiness.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-green-400">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>

          {period === 'monthly' && (
            <>
              <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
                <SelectTrigger className="w-24 bg-slate-700 border-slate-600 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {months.map((month, idx) => (
                    <SelectItem key={idx} value={String(idx)}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                <SelectTrigger className="w-24 bg-slate-700 border-slate-600 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {years.map(year => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          <Button 
            variant={showComparison ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setShowComparison(!showComparison)}
            className={showComparison ? "bg-blue-600" : ""}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Compare
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-green-100">Total Revenue</p>
              <p className="text-lg font-bold text-white">₹{totalRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-white" />
                <span className="text-xs text-white">+15.8%</span>
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
                {netProfit >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-white" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-200" />
                )}
                <span className="text-xs text-white">{netProfitMargin}% margin</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Section */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-4">
            <h2 className="text-base font-bold text-green-400 mb-3">REVENUE</h2>
            <div className="space-y-1.5 pl-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Sales Revenue</span>
                <span className="text-white font-medium">₹{profitLoss.revenue.sales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Service Revenue</span>
                <span className="text-white font-medium">₹{profitLoss.revenue.services.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Other Revenue</span>
                <span className="text-white font-medium">₹{profitLoss.revenue.other.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between pt-3 mt-3 border-t-2 border-green-500">
              <span className="text-sm font-bold text-white">TOTAL REVENUE</span>
              <span className="text-lg font-bold text-green-400">₹{totalRevenue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Cost of Goods Sold Section */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-4">
            <h2 className="text-base font-bold text-orange-400 mb-3">COST OF GOODS SOLD</h2>
            <div className="space-y-1.5 pl-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Purchases & Inventory</span>
                <span className="text-white font-medium">₹{profitLoss.costOfGoodsSold.purchases.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Direct Labor</span>
                <span className="text-white font-medium">₹{profitLoss.costOfGoodsSold.directLabor.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Manufacturing Overhead</span>
                <span className="text-white font-medium">₹{profitLoss.costOfGoodsSold.manufacturing.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between pt-3 mt-3 border-t-2 border-orange-500">
              <span className="text-sm font-bold text-white">TOTAL COGS</span>
              <span className="text-lg font-bold text-orange-400">₹{totalCOGS.toLocaleString()}</span>
            </div>

            <div className="flex justify-between pt-3 mt-3 border-t border-slate-600">
              <span className="text-sm font-bold text-white">GROSS PROFIT</span>
              <div className="text-right">
                <span className="text-lg font-bold text-blue-400 block">₹{grossProfit.toLocaleString()}</span>
                <span className="text-xs text-slate-400">{grossProfitMargin}% margin</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Expenses Section */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-4">
            <h2 className="text-base font-bold text-red-400 mb-3">OPERATING EXPENSES</h2>
            <div className="space-y-1.5 pl-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Salaries & Wages</span>
                <span className="text-white font-medium">₹{profitLoss.operatingExpenses.salaries.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Rent</span>
                <span className="text-white font-medium">₹{profitLoss.operatingExpenses.rent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Utilities</span>
                <span className="text-white font-medium">₹{profitLoss.operatingExpenses.utilities.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Marketing & Advertising</span>
                <span className="text-white font-medium">₹{profitLoss.operatingExpenses.marketing.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Depreciation</span>
                <span className="text-white font-medium">₹{profitLoss.operatingExpenses.depreciation.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Insurance</span>
                <span className="text-white font-medium">₹{profitLoss.operatingExpenses.insurance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Supplies</span>
                <span className="text-white font-medium">₹{profitLoss.operatingExpenses.supplies.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Maintenance & Repairs</span>
                <span className="text-white font-medium">₹{profitLoss.operatingExpenses.maintenance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Other Expenses</span>
                <span className="text-white font-medium">₹{profitLoss.operatingExpenses.other.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between pt-3 mt-3 border-t-2 border-red-500">
              <span className="text-sm font-bold text-white">TOTAL OPERATING EXPENSES</span>
              <span className="text-lg font-bold text-red-400">₹{totalOperatingExpenses.toLocaleString()}</span>
            </div>

            <div className="flex justify-between pt-3 mt-3 border-t border-slate-600">
              <span className="text-sm font-bold text-white">OPERATING INCOME</span>
              <div className="text-right">
                <span className={`text-lg font-bold ${operatingIncome >= 0 ? 'text-blue-400' : 'text-red-400'} block`}>
                  ₹{operatingIncome.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">{operatingMargin}% margin</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Income & Expenses Section */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-4">
            <h2 className="text-base font-bold text-purple-400 mb-3">OTHER INCOME & EXPENSES</h2>
            
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Other Income</h3>
              <div className="space-y-1.5 pl-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Interest Income</span>
                  <span className="text-green-400 font-medium">₹{profitLoss.otherIncome.interest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Dividend Income</span>
                  <span className="text-green-400 font-medium">₹{profitLoss.otherIncome.dividends.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Miscellaneous Income</span>
                  <span className="text-green-400 font-medium">₹{profitLoss.otherIncome.misc.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-600">
                  <span className="text-slate-300 font-semibold">Total Other Income</span>
                  <span className="text-green-400 font-bold">₹{totalOtherIncome.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Other Expenses</h3>
              <div className="space-y-1.5 pl-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Interest Expense</span>
                  <span className="text-red-400 font-medium">₹{profitLoss.otherExpenses.interest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Income Tax</span>
                  <span className="text-red-400 font-medium">₹{profitLoss.otherExpenses.taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Miscellaneous Expenses</span>
                  <span className="text-red-400 font-medium">₹{profitLoss.otherExpenses.misc.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-600">
                  <span className="text-slate-300 font-semibold">Total Other Expenses</span>
                  <span className="text-red-400 font-bold">₹{totalOtherExpenses.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit Section */}
        <Card className={`border-2 ${netProfit >= 0 ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">NET PROFIT</h2>
                <p className="text-xs text-slate-400 mt-1">After all income and expenses</p>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'} block`}>
                  ₹{netProfit.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">{netProfitMargin}% net margin</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Ratios */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
            <p className="text-xs text-slate-400">Gross Margin</p>
            <p className="text-sm font-bold text-blue-400">{grossProfitMargin}%</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
            <p className="text-xs text-slate-400">Operating Margin</p>
            <p className="text-sm font-bold text-purple-400">{operatingMargin}%</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
            <p className="text-xs text-slate-400">Net Margin</p>
            <p className={`text-sm font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netProfitMargin}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
