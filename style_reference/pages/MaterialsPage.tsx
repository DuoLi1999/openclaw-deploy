import { useState } from 'react';
import { Search, Plus, BookOpen, MessageSquare, Scale, Edit, Trash2, Star } from 'lucide-react';

export function MaterialsPage() {
  const [activeTab, setActiveTab] = useState('cases');
  const [searchTerm, setSearchTerm] = useState('');

  const cases = [
    {
      id: 1,
      title: '高速公路疲劳驾驶警示案例',
      content: '2025年春节期间，某驾驶员连续驾驶超过4小时未休息...',
      tags: ['疲劳驾驶', '高速公路', '春节'],
      source: '交警支队',
      date: '2026-01-15',
      favorite: true,
    },
    {
      id: 2,
      title: '酒驾治理典型案例',
      content: '驾驶员张某在朋友聚会后酒后驾车，被交警查获...',
      tags: ['酒驾', '执法案例'],
      source: '一大队',
      date: '2026-01-20',
      favorite: false,
    },
    {
      id: 3,
      title: '安全带使用宣传素材',
      content: '通过真实案例展示安全带在交通事故中的重要作用...',
      tags: ['安全带', '宣传教育'],
      source: '宣传科',
      date: '2026-02-01',
      favorite: true,
    },
  ];

  const templates = [
    {
      id: 1,
      title: '酒驾警示标准话术',
      content: '酒后驾驶害人害己，为了您和他人的安全，请自觉抵制酒驾行为...',
      category: '酒驾警示',
      usageCount: 45,
    },
    {
      id: 2,
      title: '安全带提醒话术',
      content: '安全带就是生命带！请驾乘人员务必系好安全带...',
      category: '安全提醒',
      usageCount: 78,
    },
    {
      id: 3,
      title: '节假日出行提示',
      content: '节假日出行高峰将至，请提前规划路线，错峰出行...',
      category: '节假日',
      usageCount: 32,
    },
  ];

  const regulations = [
    {
      id: 1,
      title: '道路交通安全法 第二十二条',
      content: '机动车驾驶人应当遵守道路交通安全法律、法规的规定，按照操作规范安全驾驶、文明驾驶。',
      category: '驾驶规范',
    },
    {
      id: 2,
      title: '道路交通安全法 第四十七条',
      content: '机动车行经人行横道时，应当减速行驶；遇行人正在通过人行横道，应当停车让行。',
      category: '礼让行人',
    },
    {
      id: 3,
      title: '道路交通安全法 第九十一条',
      content: '饮酒后驾驶机动车的，处暂扣六个月机动车驾驶证，并处一千元以上二千元以下罚款。',
      category: '酒驾处罚',
    },
  ];

  const tabs = [
    { id: 'cases', label: '案例库', icon: BookOpen, count: cases.length },
    { id: 'templates', label: '话术库', icon: MessageSquare, count: templates.length },
    { id: 'regulations', label: '法规库', icon: Scale, count: regulations.length },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">素材库管理</h2>
          <p className="text-sm text-gray-600">
            管理案例、话术和法规素材，支持快速检索和引用
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">
          <Plus className="w-5 h-5" />
          新建素材
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 pt-4">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-700 text-blue-700 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder={`搜索${tabs.find(t => t.id === activeTab)?.label}...`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'cases' && (
            <div className="space-y-4">
              {cases.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">{item.title}</h4>
                        {item.favorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{item.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>来源：{item.source}</span>
                        <span>日期：{item.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              {templates.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-800">{item.title}</h4>
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.content}</p>
                      <div className="text-xs text-gray-500">
                        使用次数：{item.usageCount}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'regulations' && (
            <div className="space-y-4">
              {regulations.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-800">{item.title}</h4>
                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{item.content}</p>
                    </div>
                    <button className="ml-4 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition">
                      引用
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
