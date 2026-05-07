'use client';

import { useState } from 'react';
import type { Shipment } from '@/types/shipment';
import { SHIPMENT_FIELDS } from '@/types/shipment';

interface TemplateMappingDialogProps {
  open: boolean;
  headers: string[];
  autoMapping: Partial<Record<keyof Shipment, string>>;
  onConfirm: (columnMapping: Record<string, string>, mappingName: string) => void;
  onCancel: () => void;
}

export function TemplateMappingDialog({
  open,
  headers,
  autoMapping,
  onConfirm,
  onCancel
}: TemplateMappingDialogProps) {
  const [mapping, setMapping] = useState<Record<string, string>>(autoMapping as Record<string, string>);
  const [mappingName, setMappingName] = useState('');

  if (!open) return null;

  const handleFieldChange = (field: keyof typeof SHIPMENT_FIELDS, header: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: header || ''
    }));
  };

  const handleConfirm = () => {
    const validMapping = Object.fromEntries(
      Object.entries(mapping).filter(([, value]) => value)
    );
    onConfirm(validMapping, mappingName || '未命名模板');
  };

  const hasUnmappedRequiredFields = Object.entries(SHIPMENT_FIELDS).some(
    ([field, { required }]) => required && !mapping[field]
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">配置列映射</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">模板名称</label>
            <input
              type="text"
              value={mappingName}
              onChange={(e) => setMappingName(e.target.value)}
              placeholder="输入模板名称方便后续识别"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3">
            {Object.entries(SHIPMENT_FIELDS).map(([field, { label, required }]) => (
              <div key={field} className="flex items-center gap-3">
                <label className="w-24 text-sm">
                  {label}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <select
                  value={mapping[field] || ''}
                  onChange={(e) => handleFieldChange(field as keyof typeof SHIPMENT_FIELDS, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择列</option>
                  {headers.map((header, idx) => (
                    <option key={idx} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={hasUnmappedRequiredFields}
            className={`px-4 py-2 rounded-lg ${
              hasUnmappedRequiredFields
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            确认映射
          </button>
        </div>
      </div>
    </div>
  );
}
