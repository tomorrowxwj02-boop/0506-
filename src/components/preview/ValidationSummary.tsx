'use client';

import type { ValidationError } from '@/types/shipment';

interface ValidationSummaryProps {
  errors: Map<number, ValidationError[]>;
  onRowClick: (rowNum: number) => void;
}

export function ValidationSummary({ errors, onRowClick }: ValidationSummaryProps) {
  if (errors.size === 0) return null;

  const allErrors = Array.from(errors.values()).flat();

  const errorLabels: Record<string, string> = {
    externalCode: '外部编码',
    senderName: '发件人姓名',
    senderPhone: '发件人电话',
    senderAddress: '发件人地址',
    receiverName: '收件人姓名',
    receiverPhone: '收件人电话',
    receiverAddress: '收件人地址',
    weight: '重量',
    pieceCount: '件数',
    temperature: '温层',
    remark: '备注'
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <h4 className="text-red-800 font-semibold mb-2">
        发现 {errors.size} 行数据存在 {allErrors.length} 个错误：
      </h4>
      <ul className="list-disc list-inside space-y-1 max-h-48 overflow-auto">
        {allErrors.map((err, idx) => (
          <li key={idx} className="text-sm text-red-700">
            <button
              onClick={() => onRowClick(err.row)}
              className="hover:underline cursor-pointer"
            >
              第 {err.row} 行，{errorLabels[err.field]}：{err.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
