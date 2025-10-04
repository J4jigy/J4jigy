import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage = 10,
  totalItems = 0,
  showInfo = true 
}) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Generate page numbers to show (max 5 page boxes)
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalPages === 0) {
    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Showing 0 entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled
            size="sm"
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-300 px-2 py-1 bg-slate-700 rounded">
            0 of 0
          </span>
          <Button
            disabled
            size="sm"
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {showInfo && (
        <div className="text-sm text-slate-400">
          Showing {startIndex + 1} - {endIndex} of {totalItems} entries
        </div>
      )}
      
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          size="sm"
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page Numbers */}
        {visiblePages.map((page) => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            size="sm"
            variant={currentPage === page ? "default" : "outline"}
            className={
              currentPage === page 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "border-slate-600 text-slate-300 hover:bg-slate-700"
            }
          >
            {page}
          </Button>
        ))}

        {/* Next Button */}
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          size="sm"
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}