import { Link } from 'react-router';
import { Home, AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-6 rounded-full">
            <AlertCircle className="w-16 h-16 text-red-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">页面未找到</h2>
        <p className="text-gray-600 mb-6">
          抱歉，您访问的页面不存在
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
        >
          <Home className="w-5 h-5" />
          返回首页
        </Link>
      </div>
    </div>
  );
}
