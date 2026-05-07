'use client';

import { useState, useCallback, useEffect } from 'react';
import { DragDropUpload } from '@/components/upload/DragDropUpload';
import { EditableTable } from '@/components/preview/EditableTable';
import { useBatchSubmit } from '@/hooks/useBatchSubmit';
import { validateShipments } from '@/lib/validation/shipmentSchema';
import type { Shipment } from '@/types/shipment';

export default function Home() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: number; failed: number; errors: any[] } | null>(null);
  const [existingCodes, setExistingCodes] = useState<Set<string>>(new Set());
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [forceRemap, setForceRemap] = useState(false);
  const { submitBatch, isSubmitting, submitProgress } = useBatchSubmit();

  useEffect(() => {
    fetchExistingCodes();
  }, []);

  const fetchExistingCodes = async () => {
    setIsLoadingCodes(true);
    try {
      const response = await fetch('/api/shipments?page=1&pageSize=10000');
      const data = await response.json();
      const codes: Set<string> = new Set(
        data.data
          .filter((s: Shipment) => s.externalCode)
          .map((s: Shipment) => s.externalCode!)
      );
      setExistingCodes(codes);
    } catch (error) {
      console.error('获取现有编码失败:', error);
    } finally {
      setIsLoadingCodes(false);
    }
  };

  const handleImportComplete = useCallback((data: Shipment[], headers: string[]) => {
    setShipments(data);
    setShowPreview(true);
    setSubmitResult(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    const errors = validateShipments(shipments, existingCodes);
    if (errors.size > 0) {
      alert(`发现 ${errors.size} 行数据存在错误，请先修正所有错误后再提交`);
      return;
    }

    const result = await submitBatch(shipments);
    setSubmitResult(result);
    if (result.success > 0) {
      fetchExistingCodes();
    }
  }, [shipments, existingCodes, submitBatch]);

  const handleBack = useCallback(() => {
    setShowPreview(false);
    setShipments([]);
    setSubmitResult(null);
    setForceRemap(false);
  }, []);

  const handleRemap = useCallback(() => {
    setShowPreview(false);
    setShipments([]);
    setSubmitResult(null);
    setForceRemap(true);
  }, []);

  if (!showPreview) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">📦 导入运单数据</h2>
          <DragDropUpload onImportComplete={handleImportComplete} forceRemap={forceRemap} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">📋 预览并编辑运单数据</h2>
        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← 返回上传
          </button>
          <button
            onClick={handleRemap}
            className="px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
          >
            🔄 重新映射
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingCodes}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isSubmitting || isLoadingCodes
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                提交中...
              </span>
            ) : (
              '✅ 提交下单'
            )}
          </button>
        </div>
      </div>

      {isSubmitting && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between text-sm text-blue-700 mb-2">
            <span>正在提交数据...</span>
            <span>{Math.round(submitProgress)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${submitProgress}%` }}
            />
          </div>
        </div>
      )}

      {submitResult && (
        <div className={`mb-4 p-4 rounded-lg border ${
          submitResult.failed > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">
                {submitResult.failed > 0 ? '⚠️ 提交完成，但有部分失败' : '🎉 提交成功'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                成功: {submitResult.success} 条，失败: {submitResult.failed} 条
              </p>
            </div>
            <button
              onClick={() => setSubmitResult(null)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded transition-colors"
            >
              ✕
            </button>
          </div>
          {submitResult.errors.length > 0 && (
            <div className="mt-3 max-h-40 overflow-auto">
              <p className="text-sm font-medium text-red-600 mb-2">失败详情：</p>
              <ul className="text-sm text-red-600 space-y-1">
                {submitResult.errors.slice(0, 10).map((err, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span>•</span>
                    <span>
                      {err.externalCode || '未知编码'}: {err.error}
                    </span>
                  </li>
                ))}
                {submitResult.errors.length > 10 && (
                  <li className="text-gray-500">... 还有 {submitResult.errors.length - 10} 个错误</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-white">
        <EditableTable 
          data={shipments} 
          onDataChange={setShipments} 
          existingCodes={existingCodes}
        />
      </div>
    </div>
  );
}
