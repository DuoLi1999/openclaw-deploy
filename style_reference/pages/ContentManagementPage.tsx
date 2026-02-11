import { useState } from 'react';
import { Search, Filter, FileText, Clock, CheckCircle, XCircle, Eye, Edit, Trash2 } from 'lucide-react';

export function ContentManagementPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const contents = [
    {
      id: 1,
      title: '春节返程高速安全提醒',
      platform: '微信公众号',
      status: 'published',
      createTime: '2026-02-08 14:30',
      publishTime: '2026-02-08 16:00',
      author: '张三',
      views: 1245,
    },
    {
      id: 2,
      title: '酒驾警示宣传',
      platform: '微博',
      status: 'pending',
      createTime: '2026-02-09 10:15',
      publishTime: '-',
      author: '李四',
      views: 0,
    },
    {
      id: 3,
      title: '安全带使用提醒',
      platform: '抖音',
      status: 'approved',
      createTime: '2026-02-09 09:20',
      publishTime: '-',
      author: '王五',
      views: 0,
    },
    {
      id: 4,
      title: '雨天行车注意事项',
      platform: '头条号',
      status: 'rejected',
      createTime: '2026-02-07 16:45',
      publishTime: '-',
      author: '张三',
      views: 0,
    },
    {
      id: 5,
      title: '儿童安全座椅宣传',
      platform: '微信公众号',
      status: 'draft',
      createTime: '2026-02-10 11:00',
      publishTime: '-',
      author: '李四',
      views: 0,
    },
  ];

  const filters = [
    { id: 'all', label: '全部', count: contents.length },
    { id: 'draft', label: '草稿', count: contents.filter(c => c.status === 'draft').length },
    { id: 'pending', label: '待审核', count: contents.filter(c => c.status === 'pending').length },
    { id: 'approved', label: '审核通过', count: contents.filter(c => c.status === 'approved').length },
    { id: 'published', label: '已发布', count: contents.filter(c => c.status === 'published').length },
    { id: 'rejected', label: '已退回', count: contents.filter(c => c.status === 'rejected').length },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: '草稿', icon: FileText },
      pending: { bg: 'bg-orange-100', text: 'text-orange-700', label: '待审核', icon: Clock },
      approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: '审核通过', icon: CheckCircle },
      published: { bg: 'bg-green-100', text: 'text-green-700', label: '已发布', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: '已退回', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const filteredContents = activeFilter === 'all' 
    ? contents 
    : contents.filter(c => c.status === activeFilter);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">文案管理</h2>
          <p className="text-sm text-gray-600">
            查看和管理历史文案，跟踪审核状态
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        {/* Filter Tabs */}
        <div className="border-b border-gray-200 px-6 pt-4">
          <div className="flex gap-1 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 font-medium text-sm transition border-b-2 whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'border-blue-700 text-blue-700'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {filter.label}
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Actions */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="搜索文案标题、作者..."
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <Filter className="w-5 h-5" />
              筛选
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="divide-y divide-gray-200">
          {filteredContents.map((content) => (
            <div key={content.id} className="p-6 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-800">{content.title}</h4>
                    {getStatusBadge(content.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{content.platform}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{content.createTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">作者：</span>
                      <span>{content.author}</span>
                    </div>
                    {content.status === 'published' && (
                      <div>
                        <span className="text-gray-500">浏览：</span>
                        <span className="text-blue-700 font-semibold">{content.views}</span>
                      </div>
                    )}
                  </div>

                  {content.status === 'rejected' && (
                    <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <span className="font-semibold">退回原因：</span>
                      部分表述不够准确，需要补充法规依据
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="查看">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  {(content.status === 'draft' || content.status === 'rejected') && (
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="编辑">
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="删除">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              共 {filteredContents.length} 条记录
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                上一页
              </button>
              <button className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition text-sm">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
