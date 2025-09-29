import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const titleByKey = {
  customers: 'Customers / Debtors',
  suppliers: 'Suppliers / Creditors',
  ratings: 'Community Ratings',
  staff: 'Staff',
  purchases: 'Company Purchase',
  bills: 'Bills / Recharge',
  expenses: 'Other Expenses',
  invoices: 'Bills & Invoices',
  rent: 'Rent',
};

const defaultSortByKey = {
  customers: 'name_asc',
  suppliers: 'name_asc',
  staff: 'name_asc',
  ratings: 'newest',
  purchases: 'newest',
  bills: 'newest',
  expenses: 'newest',
  invoices: 'newest',
  rent: 'newest',
};

const subTabsByKey = {
  customers: [
    { value: 'customers', label: 'Customers' },
    { value: 'debtors', label: 'Debtors' }
  ],
  suppliers: [
    { value: 'suppliers', label: 'Suppliers' },
    { value: 'creditors', label: 'Creditors' }
  ],
  rent: [
    { value: 'rent_give', label: 'Rent Give' },
    { value: 'rent_receive', label: 'Rent Receive' }
  ]
};

export default function ListViewPage() {
  const { key } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(defaultSortByKey[key] || 'name_asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState(() => {
    // Default to first sub-tab if sub-tabs exist for this key
    const subTabs = subTabsByKey[key];
    return subTabs ? subTabs[0].value : null;
  });

  const title = titleByKey[key] || 'List';
  const hasSubTabs = !!subTabsByKey[key];

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { 
        search: search || undefined, 
        sort, 
        page, 
        page_size: pageSize 
      };
      
      // Add sub-tab parameter if sub-tabs are active
      if (hasSubTabs && activeSubTab) {
        params.sub_type = activeSubTab;
      }
      
      const resp = await axios.get(`${API}/lists/${key}`, { params });
      setItems(resp.data.items || []);
      setTotal(resp.data.total || 0);
    } catch (e) {
      setError('Failed to load data');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // ignore deps warning intentionally to avoid extra fetches
  }, [key, sort, page, pageSize, activeSubTab]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 350);
    return () => clearTimeout(t);
    // ignore deps warning intentionally to avoid extra fetches
  }, [search]);

  // Reset page when sub-tab changes
  useEffect(() => {
    setPage(1);
  }, [activeSubTab]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-base font-semibold">{title}</h1>
      </div>

      {/* Sub-tabs */}
      {hasSubTabs && (
        <div className="px-3 py-2 border-b border-slate-700">
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/80 border border-slate-700 rounded-lg">
              {subTabsByKey[key].map((tab) => {
                const isDebtorCreditor = tab.value === 'debtors' || tab.value === 'creditors';
                const activeClass = isDebtorCreditor 
                  ? 'data-[state=active]:bg-red-900/30 data-[state=active]:text-red-100 data-[state=active]:border-red-700/50' 
                  : 'data-[state=active]:bg-slate-700';
                
                return (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value} 
                    className={`${activeClass} data-[state=active]:text-white text-slate-300 rounded-md transition-colors`}
                  >
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Controls */}
      <div className="p-3 flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
          <SelectTrigger className="w-44 bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Name (A→Z)</SelectItem>
            <SelectItem value="name_desc">Name (Z→A)</SelectItem>
            <SelectItem value="amount_desc">Amount (High→Low)</SelectItem>
            <SelectItem value="amount_asc">Amount (Low→High)</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
        <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
          <SelectTrigger className="w-28 bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Page size" />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 100].map(n => (
              <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading && (
          <div className="text-slate-300 text-sm">Loading...</div>
        )}
        {error && !loading && (
          <div className="text-red-300 text-sm">{error}</div>
        )}
        {!loading && !error && items.map((it, idx) => (
          <Card key={idx} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <div className="text-white text-sm font-semibold">{it.name}</div>
                {it.subtitle && (
                  <div className="text-slate-300 text-xs">{it.subtitle}</div>
                )}
                {it.date && (
                  <div className="text-slate-400 text-xs">{new Date(it.date).toLocaleDateString()}</div>
                )}
              </div>
              <div className="text-white text-sm font-bold">
                {typeof it.amount !== 'undefined' ? `₹${Number(it.amount).toLocaleString()}` : ''}
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && !error && items.length === 0 && (
          <div className="text-slate-400 text-sm">No results</div>
        )}
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-slate-700 flex items-center justify-between text-slate-300 text-sm">
        <div>Page {page} / {totalPages}</div>
        <div className="flex gap-2">
          <Button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="bg-slate-700 hover:bg-slate-600">Prev</Button>
          <Button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="bg-slate-700 hover:bg-slate-600">Next</Button>
        </div>
      </div>
    </div>
  );
}