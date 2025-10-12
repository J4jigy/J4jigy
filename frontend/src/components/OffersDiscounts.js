import React, { useState } from 'react';
import { ArrowLeft, Download, Search, Plus, Phone, Mail, TrendingUp, AlertTriangle, Clock, Filter } from 'lucide-react';
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

  // Sample data matching screenshot design
  const allOffers = [
    { 
      id: 1, 
      companyName: 'Rajesh Enterprises', 
      phone: '9876543220', 
      email: 'rajesh@example.com', 
      limit: 50000, 
      outstanding: 25000, 
      expiry: '2025-01-10',
      utilizationPercent: 50
    },
    { 
      id: 2, 
      companyName: 'Motor Parts Ltd', 
      phone: '9876543221', 
      email: 'motor@example.com', 
      limit: 75000, 
      outstanding: 37500, 
      expiry: '2025-01-12',
      utilizationPercent: 50
    },
    { 
      id: 3, 
      companyName: 'Oil India Ltd', 
      phone: '9876543222', 
      email: 'oil@example.com', 
      limit: 300000, 
      outstanding: 150000, 
      expiry: '2025-01-10',
      utilizationPercent: 50
    },
    { 
      id: 4, 
      companyName: 'Bharat Petroleum', 
      phone: '9876543223', 
      email: 'bharat@example.com', 
      limit: 400000, 
      outstanding: 200000, 
      expiry: '2025-01-09',
      utilizationPercent: 50
    },
    { 
      id: 5, 
      companyName: 'Equipment Co', 
      phone: '9876543224', 
      email: 'equipment@example.com', 
      limit: 150000, 
      outstanding: 85000, 
      expiry: '2025-01-08',
      utilizationPercent: 57
    },
    { 
      id: 6, 
      companyName: 'Utility Company', 
      phone: '9876543225', 
      email: 'utility@example.com', 
      limit: 50000, 
      outstanding: 12000, 
      expiry: '2025-01-07',
      utilizationPercent: 24
    },
  ];

  // Apply filters
  const filteredOffers = allOffers.filter(offer => {
    const matchesSearch = offer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.phone.includes(searchQuery) ||
                         offer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
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
        {/* Search and Filter Bar */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search offers..."
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
              <SelectItem value="expiring">Expiring Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Offer Cards */}
        <div className="space-y-3">
          {filteredOffers.map(offer => (
            <Card key={offer.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-2">{offer.companyName}</h3>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs">{offer.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Mail className="w-3 h-3" />
                        <span className="text-xs">{offer.email}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-400">Limit: ₹{offer.limit.toLocaleString()}</span>
                      <span className="text-xs text-slate-400">{offer.expiry}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${offer.utilizationPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-green-400">₹{offer.outstanding.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Outstanding</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No offers found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
