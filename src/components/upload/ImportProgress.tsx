'use client';

interface ImportProgressProps {
  progress: number;
  currentRow: number;
  totalRows: number;
  visible: boolean;
}

export function ImportProgress({ progress, currentRow, totalRows, visible }: ImportProgressProps) {
  if (!visible) return null;

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>正在解析文件...</span>
        <span>{currentRow}/{totalRows} 行</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
