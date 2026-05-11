import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: '物流批量下单系统',
  description: '支持多模板Excel导入的物流批量下单Web应用',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800">物流批量下单系统</h1>
              <nav className="flex gap-6">
                <Link href="/" className="text-blue-500 hover:text-blue-700">
                  导入运单
                </Link>
                <Link href="/products" className="text-gray-600 hover:text-gray-800">
                  产品选择
                </Link>
                <Link href="/history" className="text-gray-600 hover:text-gray-800">
                  历史查询
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
