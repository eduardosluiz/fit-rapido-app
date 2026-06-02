'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={cn("flex items-center justify-center gap-1 sm:gap-2 flex-wrap", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          onPageChange(currentPage - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        disabled={currentPage === 1}
        aria-label="Página anterior"
        className="h-8 w-8 p-0 min-w-8 text-xs"
      >
        <i className="bx bx-chevron-left"></i>
      </Button>

      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-1 text-gray-500 text-xs">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              onPageChange(page as number);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={cn(
              "h-8 w-8 p-0 min-w-8 text-xs font-medium",
              currentPage === page && "bg-[#c8921a] hover:bg-[#b88217] text-white"
            )}
            aria-label={`Ir para página ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </Button>
        )
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          onPageChange(currentPage + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        disabled={currentPage === totalPages}
        aria-label="Próxima página"
        className="h-8 w-8 p-0 min-w-8 text-xs"
      >
        <i className="bx bx-chevron-right"></i>
      </Button>
    </div>
  );
}

