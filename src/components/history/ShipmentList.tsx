'use client';

import type { Shipment } from '@/types/shipment';

interface ShipmentListProps {
  shipments: Shipment[];
}

export function ShipmentList({ shipments }: ShipmentListProps) {
  if (shipments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <div className="text-4xl mb-4">📦</div>
        <p>暂无运单记录</p>
      </div>
    );
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('zh-CN');
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">#</th>
            <th className="border p-2 text-left">外部编码</th>
            <th className="border p-2 text-left">发件人</th>
            <th className="border p-2 text-left">收件人</th>
            <th className="border p-2 text-left">重量(kg)</th>
            <th className="border p-2 text-left">件数</th>
            <th className="border p-2 text-left">温层</th>
            <th className="border p-2 text-left">状态</th>
            <th className="border p-2 text-left">创建时间</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((shipment, idx) => (
            <tr key={shipment.id} className="hover:bg-gray-50">
              <td className="border p-2">{idx + 1}</td>
              <td className="border p-2">{shipment.externalCode || '-'}</td>
              <td className="border p-2">
                <div>{shipment.senderName}</div>
                <div className="text-xs text-gray-500">{shipment.senderPhone}</div>
              </td>
              <td className="border p-2">
                <div>{shipment.receiverName}</div>
                <div className="text-xs text-gray-500">{shipment.receiverPhone}</div>
              </td>
              <td className="border p-2">{shipment.weight}</td>
              <td className="border p-2">{shipment.pieceCount}</td>
              <td className="border p-2">{shipment.temperature}</td>
              <td className="border p-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  shipment.status === 'submitted' ? 'bg-green-100 text-green-700' :
                  shipment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {shipment.status === 'submitted' ? '已提交' :
                   shipment.status === 'pending' ? '待提交' : '失败'}
                </span>
              </td>
              <td className="border p-2 text-sm">{formatDate(shipment.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
