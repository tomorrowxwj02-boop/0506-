'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  const pages: number[] = [];
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, 5, -1, totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages);
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border-t">
      <div className="text-sm text-gray-600">
        共 {total} 条记录，显示第 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, total)} 条
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          上一页
        </button>
        
        {pages.map((page, idx) => (
          page === -1 ? (
            <span key={idx} className="px-2 text-gray-400">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 border rounded ${
                page === currentPage ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          )
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          下一页
        </button>
      </div>
    </div>
  );
}
