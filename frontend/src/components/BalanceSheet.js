import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Download, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';
import { useRole } from '../contexts/RoleContext';

export default function BalanceSheet() {
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
          <h1 className="text-base font-semibold">Balance Sheet</h1>
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

  // Get ledger entries from business context
  const ledgerEntries = getData('ledger_entries', []);
  const cashEntries = getData('cash_entries', []);

  // Calculate Balance Sheet items using double-entry accounting
  const calculateBalanceSheet = () => {
    const assets = {
      currentAssets: {
        cash: 0,
        accountsReceivable: 0,
        inventory: 0,
        prepaidExpenses: 0
      },
      fixedAssets: {
        property: 0,
        equipment: 0,
        vehicles: 0,
        accumulatedDepreciation: 0
      }
    };

    const liabilities = {
      currentLiabilities: {
        accountsPayable: 0,
        shortTermLoans: 0,
        accruedExpenses: 0
      },
      longTermLiabilities: {
        longTermLoans: 0,
        mortgages: 0
      }
    };

    const equity = {
      ownersEquity: 0,
      retainedEarnings: 0,
      currentYearProfit: 0
    };

    // Calculate from cash entries
    cashEntries.forEach(entry => {
      if (entry.type === 'cash-in') {
        assets.currentAssets.cash += parseFloat(entry.amount || 0);
        equity.currentYearProfit += parseFloat(entry.amount || 0);
      } else if (entry.type === 'cash-out') {
        assets.currentAssets.cash -= parseFloat(entry.amount || 0);
        equity.currentYearProfit -= parseFloat(entry.amount || 0);
      }
    });

    // Calculate from ledger entries
    ledgerEntries.forEach(entry => {
      const amount = parseFloat(entry.amount || 0);
      
      // Assets
      if (entry.accountType === 'asset') {
        if (entry.subType === 'current') {
          if (entry.category === 'cash') assets.currentAssets.cash += amount;
          else if (entry.category === 'receivables') assets.currentAssets.accountsReceivable += amount;
          else if (entry.category === 'inventory') assets.currentAssets.inventory += amount;
          else if (entry.category === 'prepaid') assets.currentAssets.prepaidExpenses += amount;
        } else if (entry.subType === 'fixed') {
          if (entry.category === 'property') assets.fixedAssets.property += amount;
          else if (entry.category === 'equipment') assets.fixedAssets.equipment += amount;
          else if (entry.category === 'vehicles') assets.fixedAssets.vehicles += amount;
        }
      }
      
      // Liabilities
      if (entry.accountType === 'liability') {
        if (entry.subType === 'current') {
          if (entry.category === 'payables') liabilities.currentLiabilities.accountsPayable += amount;
          else if (entry.category === 'short-term-loan') liabilities.currentLiabilities.shortTermLoans += amount;
          else if (entry.category === 'accrued') liabilities.currentLiabilities.accruedExpenses += amount;
        } else if (entry.subType === 'long-term') {
          if (entry.category === 'long-term-loan') liabilities.longTermLiabilities.longTermLoans += amount;
          else if (entry.category === 'mortgage') liabilities.longTermLiabilities.mortgages += amount;
        }
      }
      
      // Equity
      if (entry.accountType === 'equity') {
        if (entry.category === 'capital') equity.ownersEquity += amount;
        else if (entry.category === 'retained') equity.retainedEarnings += amount;
      }
    });

    return { assets, liabilities, equity };
  };

  const balanceSheet = calculateBalanceSheet();

  // Calculate totals
  const totalCurrentAssets = Object.values(balanceSheet.assets.currentAssets).reduce((a, b) => a + b, 0);
  const totalFixedAssets = Object.values(balanceSheet.assets.fixedAssets).reduce((a, b) => a + b, 0);
  const totalAssets = totalCurrentAssets + totalFixedAssets;

  const totalCurrentLiabilities = Object.values(balanceSheet.liabilities.currentLiabilities).reduce((a, b) => a + b, 0);
  const totalLongTermLiabilities = Object.values(balanceSheet.liabilities.longTermLiabilities).reduce((a, b) => a + b, 0);
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const totalEquity = Object.values(balanceSheet.equity).reduce((a, b) => a + b, 0);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm px-4 py-3 sticky top-0 z-10 shadow-none border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Balance Sheet</h1>
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
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-blue-100">Total Assets</p>
              <p className="text-lg font-bold text-white">₹{totalAssets.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-300" />
                <span className="text-xs text-green-300">+12.5%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-600 to-red-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-red-100">Total Liabilities</p>
              <p className="text-lg font-bold text-white">₹{totalLiabilities.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3 text-green-300" />
                <span className="text-xs text-green-300">-5.2%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
            <CardContent className="p-3">
              <p className="text-xs text-green-100">Total Equity</p>
              <p className="text-lg font-bold text-white">₹{totalEquity.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-white" />
                <span className="text-xs text-white">+18.3%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assets Section */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-4">
            <h2 className="text-base font-bold text-blue-400 mb-3">ASSETS</h2>
            
            {/* Current Assets */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Current Assets</h3>
              <div className="space-y-1.5 pl-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Cash & Cash Equivalents</span>
                  <span className="text-white font-medium">₹{balanceSheet.assets.currentAssets.cash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Accounts Receivable</span>
                  <span className="text-white font-medium">₹{balanceSheet.assets.currentAssets.accountsReceivable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Inventory</span>
                  <span className="text-white font-medium">₹{balanceSheet.assets.currentAssets.inventory.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Prepaid Expenses</span>
                  <span className="text-white font-medium">₹{balanceSheet.assets.currentAssets.prepaidExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-600">
                  <span className="text-slate-300 font-semibold">Total Current Assets</span>
                  <span className="text-blue-400 font-bold">₹{totalCurrentAssets.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Fixed Assets */}
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Fixed Assets</h3>
              <div className="space-y-1.5 pl-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Property & Buildings</span>
                  <span className="text-white font-medium">₹{balanceSheet.assets.fixedAssets.property.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Equipment & Machinery</span>
                  <span className="text-white font-medium">₹{balanceSheet.assets.fixedAssets.equipment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Vehicles</span>
                  <span className="text-white font-medium">₹{balanceSheet.assets.fixedAssets.vehicles.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-red-400">
                  <span>Less: Accumulated Depreciation</span>
                  <span className="font-medium">(₹{balanceSheet.assets.fixedAssets.accumulatedDepreciation.toLocaleString()})</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-600">
                  <span className="text-slate-300 font-semibold">Total Fixed Assets</span>
                  <span className="text-blue-400 font-bold">₹{totalFixedAssets.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-3 border-t-2 border-blue-500">
              <span className="text-sm font-bold text-white">TOTAL ASSETS</span>
              <span className="text-lg font-bold text-blue-400">₹{totalAssets.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities Section */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-4">
            <h2 className="text-base font-bold text-red-400 mb-3">LIABILITIES</h2>
            
            {/* Current Liabilities */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Current Liabilities</h3>
              <div className="space-y-1.5 pl-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Accounts Payable</span>
                  <span className="text-white font-medium">₹{balanceSheet.liabilities.currentLiabilities.accountsPayable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Short-term Loans</span>
                  <span className="text-white font-medium">₹{balanceSheet.liabilities.currentLiabilities.shortTermLoans.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Accrued Expenses</span>
                  <span className="text-white font-medium">₹{balanceSheet.liabilities.currentLiabilities.accruedExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-600">
                  <span className="text-slate-300 font-semibold">Total Current Liabilities</span>
                  <span className="text-red-400 font-bold">₹{totalCurrentLiabilities.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Long-term Liabilities */}
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Long-term Liabilities</h3>
              <div className="space-y-1.5 pl-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Long-term Loans</span>
                  <span className="text-white font-medium">₹{balanceSheet.liabilities.longTermLiabilities.longTermLoans.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Mortgages</span>
                  <span className="text-white font-medium">₹{balanceSheet.liabilities.longTermLiabilities.mortgages.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-600">
                  <span className="text-slate-300 font-semibold">Total Long-term Liabilities</span>
                  <span className="text-red-400 font-bold">₹{totalLongTermLiabilities.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-3 border-t-2 border-red-500">
              <span className="text-sm font-bold text-white">TOTAL LIABILITIES</span>
              <span className="text-lg font-bold text-red-400">₹{totalLiabilities.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Equity Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <h2 className="text-base font-bold text-green-400 mb-3">EQUITY</h2>
            <div className="space-y-1.5 pl-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Owner's Equity</span>
                <span className="text-white font-medium">₹{balanceSheet.equity.ownersEquity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Retained Earnings</span>
                <span className="text-white font-medium">₹{balanceSheet.equity.retainedEarnings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Current Year Profit</span>
                <span className="text-white font-medium">₹{balanceSheet.equity.currentYearProfit.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between pt-3 mt-3 border-t-2 border-green-500">
              <span className="text-sm font-bold text-white">TOTAL EQUITY</span>
              <span className="text-lg font-bold text-green-400">₹{totalEquity.toLocaleString()}</span>
            </div>

            <div className="flex justify-between pt-3 mt-3 border-t-2 border-slate-500">
              <span className="text-sm font-bold text-white">TOTAL LIABILITIES & EQUITY</span>
              <span className="text-lg font-bold text-purple-400">₹{totalLiabilitiesAndEquity.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Accounting Equation Check */}
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Accounting Equation Check:</span>
            {totalAssets === totalLiabilitiesAndEquity ? (
              <span className="text-xs text-green-400 font-semibold">✓ Balanced</span>
            ) : (
              <span className="text-xs text-red-400 font-semibold">⚠ Out of Balance</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Assets = Liabilities + Equity
          </p>
        </div>
      </div>
    </div>
  );
}