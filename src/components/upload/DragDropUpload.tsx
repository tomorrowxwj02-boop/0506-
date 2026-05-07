'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { parseExcelFile } from '@/lib/excel/parser';
import { detectColumnMapping, getMatchingTemplate, saveTemplateMapping } from '@/lib/excel/templateDetector';
import { ImportProgress } from './ImportProgress';
import { TemplateMappingDialog } from './TemplateMappingDialog';
import type { Shipment } from '@/types/shipment';

interface DragDropUploadProps {
  onImportComplete: (data: Shipment[], headers: string[]) => void;
  forceRemap?: boolean;
}

export function DragDropUpload({ onImportComplete, forceRemap = false }: DragDropUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentRow, setCurrentRow] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [pendingParseResult, setPendingParseResult] = useState<{
    file: File;
    headers: string[];
    autoMapping: Partial<Record<keyof Shipment, string>>;
  } | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls'].includes(ext || '')) {
      alert('仅支持 .xlsx 或 .xls 格式的文件');
      return;
    }

    setIsLoading(true);
    setProgress(10);

    try {
      setProgress(30);
      const result = await parseExcelFile(file);
      setTotalRows(result.totalRows);
      setCurrentRow(0);

      const interval = setInterval(() => {
        setCurrentRow(prev => {
          const newVal = Math.min(prev + Math.ceil(result.totalRows / 50), result.totalRows);
          setProgress(30 + (newVal / result.totalRows) * 60);
          return newVal;
        });
      }, 50);

      setProgress(90);

      clearInterval(interval);
      setProgress(100);

      if (!forceRemap) {
        const existingMapping = await getMatchingTemplate(result.headers);
        console.log('=== 获取到的模板映射 ===');
        console.log('existingMapping:', existingMapping);
        
        if (existingMapping && Object.keys(existingMapping).length > 0) {
          console.log('=== 应用模板映射，重新解析文件 ===');
          console.log('传入的 headers:', result.headers);
          console.log('传入的 columnMapping:', existingMapping);
          
          const mappedResult = await parseExcelFile(file, existingMapping);
          
          console.log('=== 解析结果 ===');
          console.log('数据行数:', mappedResult.data.length);
          if (mappedResult.data.length > 0) {
            console.log('第一行数据:', mappedResult.data[0]);
          }
          
          onImportComplete(mappedResult.data, mappedResult.headers);
          return;
        }
      }

      const autoMapping = detectColumnMapping(result.headers);
      setPendingParseResult({ file, headers: result.headers, autoMapping });
      setShowMappingDialog(true);

    } catch (error) {
      alert('文件解析失败：' + (error as Error).message);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, [onImportComplete, forceRemap]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-gray-600">
          {isDragActive ? (
            <p className="text-lg">释放文件以上传</p>
          ) : (
            <>
              <p className="text-lg">拖拽 Excel 文件到此处，或点击选择文件</p>
              <p className="text-sm mt-2">支持 .xlsx 和 .xls 格式，单次最多 1000 条数据</p>
            </>
          )}
        </div>
      </div>

      <ImportProgress
        progress={progress}
        currentRow={currentRow}
        totalRows={totalRows}
        visible={isLoading}
      />

      <TemplateMappingDialog
        open={showMappingDialog}
        headers={pendingParseResult?.headers || []}
        autoMapping={pendingParseResult?.autoMapping || {}}
        onConfirm={async (columnMapping, mappingName) => {
          await saveTemplateMapping(
            pendingParseResult!.headers,
            columnMapping,
            mappingName
          );
          const result = await parseExcelFile(pendingParseResult!.file, columnMapping);
          onImportComplete(result.data, result.headers);
          setShowMappingDialog(false);
        }}
        onCancel={() => setShowMappingDialog(false)}
      />
    </div>
  );
}
