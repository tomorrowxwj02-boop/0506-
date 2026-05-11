'use client';

export interface ProductType {
  id: string;
  name: string;
  description: string;
  features: string[];
  estimatedTime: string;
  price: number;
}

interface ProductTypeCardProps {
  product: ProductType;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}

export function ProductTypeCard({
  product,
  isSelected,
  isDisabled,
  onSelect,
}: ProductTypeCardProps) {
  // 四种状态样式
  const getCardStyles = () => {
    // 不可用状态（无论是否选中）
    if (isDisabled) {
      return {
        card: 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60',
        header: 'bg-gray-100 text-gray-500',
        content: 'text-gray-400',
        checkMark: 'bg-gray-300',
        featureTag: 'bg-gray-100 text-gray-400',
        price: 'text-gray-400',
      };
    }

    // 可用且选中
    if (isSelected) {
      return {
        card: 'bg-white border-teal-500 shadow-lg ring-2 ring-teal-500/20 cursor-pointer hover:shadow-xl',
        header: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white',
        content: 'text-gray-700',
        checkMark: 'bg-teal-500 text-white',
        featureTag: 'bg-teal-50 text-teal-700 border-teal-200',
        price: 'text-teal-600 font-bold',
      };
    }

    // 可用未选中
    return {
      card: 'bg-white border-gray-200 cursor-pointer hover:border-teal-300 hover:shadow-md',
      header: 'bg-gradient-to-r from-gray-50 to-white text-gray-800 border-b border-gray-100',
      content: 'text-gray-600',
      checkMark: 'bg-white border-2 border-gray-300',
      featureTag: 'bg-gray-50 text-gray-600 border-gray-200',
      price: 'text-gray-700',
    };
  };

  const styles = getCardStyles();

  return (
    <div
      onClick={!isDisabled ? onSelect : undefined}
      className={`relative rounded-xl border-2 overflow-hidden transition-all duration-200 ${styles.card}`}
    >
      {/* 选中标记 */}
      <div
        className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all ${styles.checkMark}`}
      >
        {isSelected && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* 头部区域 */}
      <div className={`px-4 py-3 ${styles.header}`}>
        <div className="flex items-center gap-3">
          {/* 产品图标占位 */}
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-base">{product.name}</h3>
            <p className={`text-xs mt-0.5 ${isSelected ? 'text-teal-100' : 'text-gray-500'}`}>
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        {/* 特性标签 */}
        <div className="flex flex-wrap gap-2 mb-3">
          {product.features.map((feature, index) => (
            <span
              key={index}
              className={`px-2 py-0.5 text-xs rounded border ${styles.featureTag}`}
            >
              {feature}
            </span>
          ))}
        </div>

        {/* 预估时效 */}
        <div className={`flex items-center gap-2 text-sm mb-3 ${styles.content}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{product.estimatedTime}</span>
        </div>

        {/* 价格 */}
        <div className={`text-lg ${styles.price}`}>
          ¥{product.price.toFixed(2)}
          <span className="text-sm font-normal ml-1">起</span>
        </div>
      </div>

      {/* 不可用遮罩提示 */}
      {isDisabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/30">
          <span className="px-3 py-1 bg-gray-800 text-white text-sm rounded-full">
            暂不可用
          </span>
        </div>
      )}
    </div>
  );
}
