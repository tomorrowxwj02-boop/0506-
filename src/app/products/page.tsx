'use client';

import { useState } from 'react';
import { ProductTypeCard, ProductType } from '@/components/product/ProductTypeCard';

// 示例产品数据
const sampleProducts: ProductType[] = [
  {
    id: '1',
    name: '鲸瞬达',
    description: '全程冷链，速度快，时效稳定',
    features: ['全程冷链', '速度快', '时效稳定'],
    estimatedTime: '明日达(预估)',
    price: 110.55,
  },
  {
    id: '2',
    name: '鲸惠达',
    description: '全国派送，灵活包装，全程监控',
    features: ['全国派送', '灵活包装', '全程监控'],
    estimatedTime: '96H(预估)',
    price: 110.55,
  },
  {
    id: '3',
    name: '鲸速达',
    description: '全国派送，灵活包装，全程监控',
    features: ['全国派送', '灵活包装', '全程监控'],
    estimatedTime: '96H(预估)',
    price: 110.55,
  },
  {
    id: '4',
    name: '鲸小包',
    description: '全国派送，灵活包装，全程监控',
    features: ['全国派送', '灵活包装', '全程监控'],
    estimatedTime: '96H(预估)',
    price: 110.55,
  },
  {
    id: '5',
    name: '冷链快递',
    description: '全国派送，灵活包装，全程监控',
    features: ['全国派送', '灵活包装', '全程监控'],
    estimatedTime: '96H(预估)',
    price: 110.55,
  },
];

// 模拟不可用产品
const disabledProducts = ['3', '4'];

export default function ProductsPage() {
  const [selectedId, setSelectedId] = useState<string>('1');

  const handleSelect = (id: string) => {
    if (!disabledProducts.includes(id)) {
      setSelectedId(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>产品</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-medium">产品服务介绍</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">选择产品类型</h1>
        <p className="text-gray-500 mt-1">请选择适合您需求的物流产品服务</p>
      </div>

      {/* 状态说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-800 mb-2">状态说明</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-teal-500 bg-teal-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-gray-600">可用-已选中</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-gray-300 bg-white"></div>
            <span className="text-gray-600">可用-未选中</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-300"></div>
            <span className="text-gray-600">不可用</span>
          </div>
        </div>
      </div>

      {/* 产品列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sampleProducts.map((product) => (
          <ProductTypeCard
            key={product.id}
            product={product}
            isSelected={selectedId === product.id}
            isDisabled={disabledProducts.includes(product.id)}
            onSelect={() => handleSelect(product.id)}
          />
        ))}
      </div>

      {/* 已选产品信息 */}
      {selectedId && (
        <div className="mt-8 bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-gray-800 mb-2">已选择产品</h3>
          <div className="flex items-center gap-4">
            <div className="text-teal-600 font-bold text-xl">
              {sampleProducts.find(p => p.id === selectedId)?.name}
            </div>
            <div className="text-gray-500">
              ¥{sampleProducts.find(p => p.id === selectedId)?.price.toFixed(2)} 起
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
