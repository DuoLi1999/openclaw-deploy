import { useState } from "react";
import {
  Search,
  Plus,
  BookOpen,
  MessageSquare,
  Scale,
  Edit,
  Trash2,
  Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cases, templates, regulations } from "@/data/mock";

export function MaterialsPage() {
  const [activeTab, setActiveTab] = useState("cases");
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = [
    { id: "cases", label: "案例库", icon: BookOpen, count: cases.length },
    {
      id: "templates",
      label: "话术库",
      icon: MessageSquare,
      count: templates.length,
    },
    {
      id: "regulations",
      label: "法规库",
      icon: Scale,
      count: regulations.length,
    },
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

      <Card className="shadow border-gray-200">
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
                      ? "border-blue-700 text-blue-700 bg-blue-50"
                      : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
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
              placeholder={`搜索${tabs.find((t) => t.id === activeTab)?.label}...`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "cases" && (
            <div className="space-y-4">
              {cases.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {item.title}
                        </h4>
                        {item.favorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {item.content}
                      </p>
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
                      <Badge
                        key={idx}
                        className="bg-blue-50 text-blue-700 border-transparent rounded-full"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "templates" && (
            <div className="space-y-4">
              {templates.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {item.title}
                        </h4>
                        <Badge className="bg-purple-50 text-purple-700 border-transparent rounded-full">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.content}
                      </p>
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

          {activeTab === "regulations" && (
            <div className="space-y-4">
              {regulations.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {item.title}
                        </h4>
                        <Badge className="bg-green-50 text-green-700 border-transparent rounded-full">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {item.content}
                      </p>
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
      </Card>
    </div>
  );
}
