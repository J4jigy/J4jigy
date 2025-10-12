import React, { useState } from 'react';
import { ArrowLeft, Download, Search, Plus, Phone, Mail, Gift, TrendingUp, Calendar, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBusiness } from '../contexts/BusinessContext';

export default function OffersDiscounts() {
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  // Sample coupon/discount data
  const allCoupons = [
    { 
      id: 1, 
      code: 'WELCOME50', 
      title: 'Welcome Discount',
      description: '50% off on first purchase',
      discountType: 'Percentage',
      discountValue: 50,
      minPurchase: 1000,
      maxDiscount: 500,
      validFrom: '2025-01-01',
      validUntil: '2025-03-31',
      usageLimit: 100,
      usedCount: 45,
      status: 'active'
    },
    { 
      id: 2, 
      code: 'FUEL100', 
      title: 'Fuel Discount',
      description: '₹100 off on fuel purchase',
      discountType: 'Fixed',
      discountValue: 100,
      minPurchase: 2000,
      maxDiscount: 100,
      validFrom: '2025-01-01',
      validUntil: '2025-02-28',
      usageLimit: 50,
      usedCount: 30,
      status: 'active'
    },
    { 
      id: 3, 
      code: 'BULK30', 
      title: 'Bulk Purchase Offer',
      description: '30% off on bulk orders',
      discountType: 'Percentage',
      discountValue: 30,
      minPurchase: 5000,
      maxDiscount: 1500,
      validFrom: '2025-01-05',
      validUntil: '2025-06-30',
      usageLimit: 200,
      usedCount: 78,
      status: 'active'
    },
    { 
      id: 4, 
      code: 'FESTIVE25', 
      title: 'Festival Special',
      description: '25% discount on all items',
      discountType: 'Percentage',
      discountValue: 25,
      minPurchase: 1500,
      maxDiscount: 750,
      validFrom: '2024-12-15',
      validUntil: '2025-01-15',
      usageLimit: 150,
      usedCount: 150,
      status: 'expired'
    },
  ];

  // Calculate statistics
  const activeCoupons = allCoupons.filter(c => c.status === 'active').length;
  const totalUsage = allCoupons.reduce((sum, c) => sum + c.usedCount, 0);
  const totalSavings = allCoupons.reduce((sum, c) => {
    if (c.discountType === 'Fixed') {
      return sum + (c.discountValue * c.usedCount);
    } else {
      return sum + (c.maxDiscount * c.usedCount * 0.5); // Estimate
    }
  }, 0);
  const expiringCoupons = allCoupons.filter(c => {
    const expiry = new Date(c.validUntil);
    const today = new Date();
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  }).length;

  // Apply filters
  const filteredCoupons = allCoupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coupon.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterBy === 'active') return matchesSearch && coupon.status === 'active';
    if (filterBy === 'expired') return matchesSearch && coupon.status === 'expired';
    if (filterBy === 'expiring') {
      const expiry = new Date(coupon.validUntil);
      const today = new Date();
      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      return matchesSearch && diffDays <= 30 && diffDays > 0;
    }
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Clean Header */}
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')} 
              className="text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-white">Offers & Discounts</h1>
              <p className="text-slate-400 text-sm">{activeBusiness?.name || 'Main Business'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:bg-slate-700">
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white px-4">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0">
            <CardContent className="p-4 text-center">
              <p className="text-purple-100 text-sm mb-1">Active Coupons</p>
              <p className="text-2xl font-bold text-white">{activeCoupons}</p>
              <p className="text-purple-200 text-xs mt-1">
                <Gift className="w-3 h-3 inline mr-1" />
                available
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0">
            <CardContent className="p-4 text-center">
              <p className="text-green-100 text-sm mb-1">Total Usage</p>
              <p className="text-2xl font-bold text-white">{totalUsage}</p>
              <p className="text-green-200 text-xs mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                times used
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0">
            <CardContent className="p-4 text-center">
              <p className="text-blue-100 text-sm mb-1">Total Savings</p>
              <p className="text-2xl font-bold text-white">₹{Math.round(totalSavings).toLocaleString()}</p>
              <p className="text-blue-200 text-xs mt-1">
                <Tag className="w-3 h-3 inline mr-1" />
                saved
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0">
            <CardContent className="p-4 text-center">
              <p className="text-orange-100 text-sm mb-1">Expiring Soon</p>
              <p className="text-2xl font-bold text-white">{expiringCoupons}</p>
              <p className="text-orange-200 text-xs mt-1">
                <Calendar className="w-3 h-3 inline mr-1" />
                in 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coupons..."
              className="bg-slate-800 border-slate-600 text-white pl-10 rounded-lg"
            />
          </div>
          
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Coupon Cards */}
        <div className="space-y-3">
          {filteredCoupons.map(coupon => (
            <Card key={coupon.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-white">{coupon.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        coupon.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {coupon.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-300 mb-2">{coupon.description}</p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded font-mono">
                        {coupon.code}
                      </span>
                      <span className="text-xs text-slate-400">
                        {coupon.discountType === 'Percentage' 
                          ? `${coupon.discountValue}% OFF` 
                          : `₹${coupon.discountValue} OFF`}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                      <span>Min: ₹{coupon.minPurchase.toLocaleString()}</span>
                      <span>Max: ₹{coupon.maxDiscount.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Valid: {coupon.validFrom} to {coupon.validUntil}</span>
                    </div>

                    {/* Usage Progress Bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Usage: {coupon.usedCount}/{coupon.usageLimit}</span>
                        <span>{Math.round((coupon.usedCount / coupon.usageLimit) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCoupons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No coupons found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
