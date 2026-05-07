'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { validateShipments } from '@/lib/validation/shipmentSchema';
import { ErrorTooltip } from './ErrorTooltip';
import { ValidationSummary } from './ValidationSummary';
import type { Shipment, ValidationError } from '@/types/shipment';

interface EditableTableProps {
  data: Shipment[];
  onDataChange: (data: Shipment[]) => void;
  existingCodes?: Set<string>;
}

export function EditableTable({ data, onDataChange, existingCodes = new Set() }: EditableTableProps) {
  const [validationErrors, setValidationErrors] = useState<Map<number, ValidationError[]>>(new Map());
  const tableRef = useRef<HTMLDivElement>(null);

  const validateData = useCallback((shipments: Shipment[]) => {
    const errors = validateShipments(shipments, existingCodes);
    setValidationErrors(errors);
    return errors;
  }, [existingCodes]);

  useEffect(() => {
    validateData(data);
  }, [data, validateData]);

  const updateCell = useCallback((rowIndex: number, field: keyof Shipment, value: any) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [field]: value };
    onDataChange(newData);
  }, [data, onDataChange]);

  const deleteRow = useCallback((rowIndex: number) => {
    const newData = data.filter((_, idx) => idx !== rowIndex);
    onDataChange(newData);
  }, [data, onDataChange]);

  const addRow = useCallback(() => {
    const emptyRow: Shipment = {
      externalCode: null,
      senderName: '',
      senderPhone: '',
      senderAddress: '',
      receiverName: '',
      receiverPhone: '',
      receiverAddress: '',
      weight: 0,
      pieceCount: 1,
      temperature: '常温',
      remark: null,
      rowIndex: data.length + 1
    };
    onDataChange([...data, emptyRow]);
  }, [data, onDataChange]);

  const getFieldError = (errors: ValidationError[] | undefined, field: string): string | null => {
    if (!errors) return null;
    const error = errors.find(e => e.field === field);
    return error?.message || null;
  };

  const hasErrors = validationErrors.size > 0;
  const errorCount = Array.from(validationErrors.values()).reduce((acc, errs) => acc + errs.length, 0);

  return (
    <div className="flex flex-col h-full">
      <ValidationSummary
        errors={validationErrors}
        onRowClick={(rowNum) => {
          document.getElementById(`row-${rowNum}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
      />

      <div className="flex justify-between items-center p-4 border-b bg-white">
        <div className="text-sm text-gray-600">
          共 {data.length} 条数据
          {hasErrors && <span className="text-red-500 ml-2">（{errorCount} 个错误）</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={addRow} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            + 新增行
          </button>
          <button onClick={() => exportToExcel(data)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
            导出 Excel
          </button>
        </div>
      </div>

      <div ref={tableRef} className="flex-1 overflow-auto">
        <table className="min-w-[1200px] border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 w-12 bg-gray-100 sticky top-0 z-10">#</th>
              <th className="border border-gray-300 p-2 bg-gray-100 sticky top-0 z-10">外部编码</th>
              <th className="border border-gray-300 p-2 bg-gray-100 sticky top-0 z-10">发件人姓名*</th>
              <th className="border border-gray-300 p-2 bg-gray-100 sticky top-0 z-10">发件人电话*</th>
              <th className="border border-gray-300 p-2 bg-gray-100 sticky top-0 z-10">发件人地址*</th>
              <th className="border border-gray-300 p-2 bg-gray-100 sticky top-0 z-10">收件人姓名*</th>
              <th className="border border-gray-300 p-2 bg-gray-100 sticky top-0 z-10">收件人电话*</th>
              <th className="border border-gray-300 p-2 bg-gray-100 sticky top-0 z-10">收件人地址*</th>
              <th className="border border-gray-300 p-2 bg-gray-100 sticky top-0 z-10">重量(kg)*</th>
              <th className="border border-gray-300 p-2 bg-gray-100 sticky top-0 z-10">件数*</th>
              <th className="border border-gray-300 p-2 bg-gray-100 sticky top-0 z-10">温层*</th>
              <th className="border border-gray-300 p-2 bg-gray-100 sticky top-0 z-10">备注</th>
              <th className="border border-gray-300 p-2 w-16 bg-gray-100 sticky top-0 z-10">操作</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => {
              const rowErrors = validationErrors.get(row.rowIndex || rowIndex + 1);
              const hasRowError = rowErrors && rowErrors.length > 0;

              return (
                <tr
                  key={rowIndex}
                  id={`row-${row.rowIndex || rowIndex + 1}`}
                  className={hasRowError ? 'bg-red-50' : 'hover:bg-gray-50'}
                >
                  <td className="border border-gray-300 p-2 text-center bg-white">
                    {rowIndex + 1}
                  </td>

                  <td className="border border-gray-300 p-2 bg-white">
                    <ErrorTooltip error={getFieldError(rowErrors, 'externalCode')}>
                      <input
                        value={row.externalCode || ''}
                        onChange={(e) => updateCell(rowIndex, 'externalCode', e.target.value || null)}
                        className={`w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 ${getFieldError(rowErrors, 'externalCode') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        placeholder="可选"
                      />
                    </ErrorTooltip>
                  </td>

                  <td className="border border-gray-300 p-2 bg-white">
                    <ErrorTooltip error={getFieldError(rowErrors, 'senderName')}>
                      <input
                        value={row.senderName}
                        onChange={(e) => updateCell(rowIndex, 'senderName', e.target.value)}
                        className={`w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 ${getFieldError(rowErrors, 'senderName') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        placeholder="必填"
                      />
                    </ErrorTooltip>
                  </td>

                  <td className="border border-gray-300 p-2 bg-white">
                    <ErrorTooltip error={getFieldError(rowErrors, 'senderPhone')}>
                      <input
                        value={row.senderPhone}
                        onChange={(e) => updateCell(rowIndex, 'senderPhone', e.target.value)}
                        className={`w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 ${getFieldError(rowErrors, 'senderPhone') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        placeholder="必填，如：13800138000"
                      />
                    </ErrorTooltip>
                  </td>

                  <td className="border border-gray-300 p-2 bg-white">
                    <ErrorTooltip error={getFieldError(rowErrors, 'senderAddress')}>
                      <input
                        value={row.senderAddress}
                        onChange={(e) => updateCell(rowIndex, 'senderAddress', e.target.value)}
                        className={`w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 ${getFieldError(rowErrors, 'senderAddress') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        placeholder="必填"
                      />
                    </ErrorTooltip>
                  </td>

                  <td className="border border-gray-300 p-2 bg-white">
                    <ErrorTooltip error={getFieldError(rowErrors, 'receiverName')}>
                      <input
                        value={row.receiverName}
                        onChange={(e) => updateCell(rowIndex, 'receiverName', e.target.value)}
                        className={`w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 ${getFieldError(rowErrors, 'receiverName') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        placeholder="必填"
                      />
                    </ErrorTooltip>
                  </td>

                  <td className="border border-gray-300 p-2 bg-white">
                    <ErrorTooltip error={getFieldError(rowErrors, 'receiverPhone')}>
                      <input
                        value={row.receiverPhone}
                        onChange={(e) => updateCell(rowIndex, 'receiverPhone', e.target.value)}
                        className={`w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 ${getFieldError(rowErrors, 'receiverPhone') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        placeholder="必填，如：13900139000"
                      />
                    </ErrorTooltip>
                  </td>

                  <td className="border border-gray-300 p-2 bg-white">
                    <ErrorTooltip error={getFieldError(rowErrors, 'receiverAddress')}>
                      <input
                        value={row.receiverAddress}
                        onChange={(e) => updateCell(rowIndex, 'receiverAddress', e.target.value)}
                        className={`w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 ${getFieldError(rowErrors, 'receiverAddress') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        placeholder="必填"
                      />
                    </ErrorTooltip>
                  </td>

                  <td className="border border-gray-300 p-2 bg-white">
                    <ErrorTooltip error={getFieldError(rowErrors, 'weight')}>
                      <input
                        type="number"
                        step="0.01"
                        value={row.weight}
                        onChange={(e) => updateCell(rowIndex, 'weight', parseFloat(e.target.value) || 0)}
                        className={`w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 ${getFieldError(rowErrors, 'weight') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        placeholder="必填，正数"
                      />
                    </ErrorTooltip>
                  </td>

                  <td className="border border-gray-300 p-2 bg-white">
                    <ErrorTooltip error={getFieldError(rowErrors, 'pieceCount')}>
                      <input
                        type="number"
                        step="1"
                        value={row.pieceCount}
                        onChange={(e) => updateCell(rowIndex, 'pieceCount', parseInt(e.target.value) || 0)}
                        className={`w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 ${getFieldError(rowErrors, 'pieceCount') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        placeholder="必填，正整数"
                      />
                    </ErrorTooltip>
                  </td>

                  <td className="border border-gray-300 p-2 bg-white">
                    <ErrorTooltip error={getFieldError(rowErrors, 'temperature')}>
                      <select
                        value={row.temperature}
                        onChange={(e) => updateCell(rowIndex, 'temperature', e.target.value as any)}
                        className={`w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 ${getFieldError(rowErrors, 'temperature') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                      >
                        <option value="">请选择</option>
                        <option value="常温">常温</option>
                        <option value="冷藏">冷藏</option>
                        <option value="冷冻">冷冻</option>
                      </select>
                    </ErrorTooltip>
                  </td>

                  <td className="border border-gray-300 p-2 bg-white">
                    <input
                      value={row.remark || ''}
                      onChange={(e) => updateCell(rowIndex, 'remark', e.target.value || null)}
                      className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="可选"
                    />
                  </td>

                  <td className="border border-gray-300 p-2 text-center bg-white">
                    <button
                      onClick={() => deleteRow(rowIndex)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                      title="删除此行"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function exportToExcel(shipments: Shipment[]): void {
  const headers = ['外部编码', '发件人姓名', '发件人电话', '发件人地址', '收件人姓名', '收件人电话', '收件人地址', '重量(kg)', '件数', '温层', '备注'];
  
  const data = shipments.map(s => [
    s.externalCode || '',
    s.senderName,
    s.senderPhone,
    s.senderAddress,
    s.receiverName,
    s.receiverPhone,
    s.receiverAddress,
    s.weight,
    s.pieceCount,
    s.temperature,
    s.remark || ''
  ]);

  const worksheet = (window as any).XLSX.utils.aoa_to_sheet([headers, ...data]);
  const workbook = (window as any).XLSX.utils.book_new();
  (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, '运单数据');

  (window as any).XLSX.writeFile(workbook, '运单数据.xlsx');
}
