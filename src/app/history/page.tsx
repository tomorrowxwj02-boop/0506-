'use client';

import { useState, useEffect, useCallback } from 'react';
import { SearchFilter } from '@/components/history/SearchFilter';
import { ShipmentList } from '@/components/history/ShipmentList';
import { Pagination } from '@/components/history/Pagination';
import type { Shipment } from '@/types/shipment';

interface SearchFilters {
  externalCode: string;
  receiverName: string;
  startDate: string;
  endDate: string;
}

interface ApiResponse {
  data: Shipment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function HistoryPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>({
    externalCode: '',
    receiverName: '',
    startDate: '',
    endDate: ''
  });

  const fetchShipments = useCallback(async (page: number, currentFilters: SearchFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });
      if (currentFilters.externalCode) params.set('externalCode', currentFilters.externalCode);
      if (currentFilters.receiverName) params.set('receiverName', currentFilters.receiverName);
      if (currentFilters.startDate) params.set('startDate', currentFilters.startDate);
      if (currentFilters.endDate) params.set('endDate', currentFilters.endDate);

      const response = await fetch(`/api/shipments?${params.toString()}`);
      const data: ApiResponse = await response.json();
      
      setShipments(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    } catch (error) {
      console.error('获取运单列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchShipments(1, filters);
  }, []);

  const handleSearch = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    fetchShipments(1, newFilters);
  }, [fetchShipments]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchShipments(page, filters);
    }
  }, [fetchShipments, filters, totalPages]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-xl font-semibold text-gray-800">📊 历史运单查询</h2>
          <p className="text-sm text-gray-500 mt-1">查看所有已提交的运单记录</p>
        </div>
        
        <SearchFilter onSearch={handleSearch} />
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 mt-4">加载中...</p>
            </div>
          </div>
        ) : (
          <>
            <ShipmentList shipments={shipments} />
            {total > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
