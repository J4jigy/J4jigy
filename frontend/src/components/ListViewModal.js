import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

const sortItems = (items, sortKey) => {
  const list = [...items];
  switch (sortKey) {
    case 'name_asc':
      return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'name_desc':
      return list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    case 'amount_asc':
      return list.sort((a, b) => (a.amount || 0) - (b.amount || 0));
    case 'amount_desc':
      return list.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    case 'newest':
      return list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    case 'oldest':
      return list.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    default:
      return list;
  }
};

export default function ListViewModal({ open, onOpenChange, title, items = [], defaultSort = 'name_asc' }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(defaultSort);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const base = items.filter((it) =>
      (it.name || '').toLowerCase().includes(q) || (it.subtitle || '').toLowerCase().includes(q)
    );
    return sortItems(base, sort);
  }, [items, search, sort]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44 bg-slate-700 border-slate-600 text-white">
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
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {filtered.map((it, idx) => (
            <Card key={idx} className="bg-slate-700 border-slate-600">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <div className="text-white text-sm font-semibold">{it.name}</div>
                  {(it.subtitle || it.phone) && (
                    <div className="text-slate-300 text-xs">{it.subtitle || it.phone}</div>
                  )}
                  {it.date && (
                    <div className="text-slate-400 text-xs">{new Date(it.date).toLocaleDateString()}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {typeof it.amount !== 'undefined' && (
                    <div className="text-white text-sm font-bold">₹{Number(it.amount).toLocaleString()}</div>
                  )}
                  {it.status && <Badge className="bg-blue-600">{it.status}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-slate-400 text-sm py-8">No results</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}