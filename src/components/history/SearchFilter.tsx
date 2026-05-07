'use client';

import { useState } from 'react';

interface SearchFilterProps {
  onSearch: (filters: {
    externalCode: string;
    receiverName: string;
    startDate: string;
    endDate: string;
  }) => void;
}

export function SearchFilter({ onSearch }: SearchFilterProps) {
  const [externalCode, setExternalCode] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSearch = () => {
    onSearch({ externalCode, receiverName, startDate, endDate });
  };

  const handleReset = () => {
    setExternalCode('');
    setReceiverName('');
    setStartDate('');
    setEndDate('');
    onSearch({ externalCode: '', receiverName: '', startDate: '', endDate: '' });
  };

  return (
    <div className="flex flex-wrap gap-4 p-4 border-b">
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">外部编码</label>
        <input
          type="text"
          value={externalCode}
          onChange={(e) => setExternalCode(e.target.value)}
          placeholder="请输入外部编码"
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">收件人姓名</label>
        <input
          type="text"
          value={receiverName}
          onChange={(e) => setReceiverName(e.target.value)}
          placeholder="请输入收件人姓名"
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">开始日期</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">结束日期</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          搜索
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          重置
        </button>
      </div>
    </div>
  );
}
