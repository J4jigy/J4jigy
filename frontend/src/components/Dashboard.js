import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Home, ShieldCheck, Users, Truck, Star, ShoppingCart, Zap, Building, Coins, Receipt, Package, PieChart, BarChart3, Gift, MessageCircle } from 'lucide-react';

// Build API base (same-origin on preview)
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
let API = `${BACKEND_URL}/api`;
try {
  const loc = typeof window !== 'undefined' ? window.location.origin : null;
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const sameOrigin = BACKEND_URL && loc && new URL(BACKEND_URL).origin === loc;
  const isPreview = host && host.endsWith('.preview.emergentagent.com');
  if (sameOrigin || isPreview) {
    API = '/api';
  }
} catch (e) {}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('business');
  const [summary, setSummary] = useState({ you_will_give: 0, you_will_receive: 0, net_position: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const resp = await axios.get(`${API}/dashboard/summary`);
        setSummary(resp.data);
      } catch (e) {
        // ignore summary errors to avoid blocking dashboard
      }
    };
    fetchSummary();
  }, []);

  const businessTiles = [
    { name: 'Credit Score', subtitle: '', icon: ShieldCheck, iconColor: 'text-blue-400' },
    { name: 'Customers', subtitle: 'Debtors', icon: Users, iconColor: 'text-green-400' },
    { name: 'Suppliers', subtitle: 'Creditors', icon: Truck, iconColor: 'text-indigo-400' },
    { name: 'Community', subtitle: 'Ratings', icon: Star, iconColor: 'text-yellow-400' },
    { name: 'Staff', subtitle: '', icon: Users, iconColor: 'text-purple-400' },
  ];

  const financeTiles = [
    { name: 'Company', subtitle: 'Purchase', icon: ShoppingCart, iconColor: 'text-orange-400' },
    { name: 'Bills', subtitle: 'Recharge', icon: Zap, iconColor: 'text-green-400' },
    { name: 'Rent', subtitle: '', icon: Building, iconColor: 'text-blue-400' },
    { name: 'Other', subtitle: 'Expenses', icon: Coins, iconColor: 'text-purple-400' },
    { name: 'Bills &', subtitle: 'Invoices', icon: Receipt, iconColor: 'text-yellow-400' },
    { name: 'Stock', subtitle: 'Management', icon: Package, iconColor: 'text-orange-400' },
    { name: 'Profit', subtitle: 'Loss', icon: PieChart, iconColor: 'text-emerald-400' },
    { name: 'Balance', subtitle: 'Sheet', icon: BarChart3, iconColor: 'text-indigo-400' },
  ];

  const personalTiles = [
    { name: 'Offers &', subtitle: 'Discounts', icon: Gift, iconColor: 'text-red-400' },
    { name: 'Chat', subtitle: '', icon: MessageCircle, iconColor: 'text-blue-400' },
  ];

  const getTilesForTab = (tab) => {
    switch (tab) {
      case 'business': return businessTiles;
      case 'finance': return financeTiles;
      case 'personal': return personalTiles;
      default: return businessTiles;
    }
  };

  const handleTileClick = (tile) => {
    const name = `${tile.name} ${tile.subtitle}`.trim().toLowerCase();
    if (name.startsWith('customers')) navigate('/list/customers');
    else if (name.startsWith('suppliers')) navigate('/list/suppliers');
    else if (name.startsWith('community')) navigate('/list/ratings');
    else if (name.startsWith('staff')) navigate('/list/staff');
    else if (name.startsWith('company purchase') || name.startsWith('company')) navigate('/list/purchases');
    else if (name.startsWith('bills recharge') || tile.name === 'Bills') navigate('/list/bills');
    else if (name.startsWith('other')) navigate('/list/expenses');
    else if (name.startsWith('bills &')) navigate('/list/invoices');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Home className="w-6 h-6 text-blue-400" />
        </div>
      </div>

      {/* Summary */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-red-800 to-red-900 border border-red-700/50 shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-red-100 text-xs font-medium mb-1">You will Give</p>
              <p className="text-xl font-bold text-white">₹ {Number(summary.you_will_give || 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-800 to-green-900 border border-green-700/50 shadow-xl">
            <CardContent className="p-4 text-center">
              <p className="text-green-100 text-xs font-medium mb-1">You will Receive</p>
              <p className="text-xl font-bold text-white">₹ {Number(summary.you_will_receive || 0).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs and Tiles */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/80 border border-slate-700 rounded-lg">
            <TabsTrigger value="business" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-md">Business</TabsTrigger>
            <TabsTrigger value="finance" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-md">Finance</TabsTrigger>
            <TabsTrigger value="personal" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 rounded-md">Personal</TabsTrigger>
          </TabsList>

          {['business', 'finance', 'personal'].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              <div className="grid grid-cols-3 gap-3 px-4">
                {getTilesForTab(tab).map((tile, idx) => {
                  const IconComponent = tile.icon;
                  return (
                    <Card key={idx} onClick={() => handleTileClick(tile)} className="bg-slate-700/80 border border-slate-600 hover:bg-slate-600 transition-all duration-200 cursor-pointer shadow-xl aspect-square flex items-center justify-center">
                      <CardContent className="p-3 flex flex-col items-center justify-center text-center w-full h-full">
                        <IconComponent className={`w-8 h-8 mb-2 ${tile.iconColor}`} />
                        <div className="text-center">
                          <p className="text-white text-[12px] font-semibold leading-tight mb-0 break-words">{tile.name}</p>
                          {tile.subtitle && (
                            <p className="text-slate-200 text-[12px] font-medium leading-tight break-words">{tile.subtitle}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
