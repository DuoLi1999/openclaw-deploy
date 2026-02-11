import { Link } from "react-router-dom";
import {
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Calendar,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { recentContents, todos } from "@/data/mock";

export function HomePage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">欢迎使用文案生成系统</h2>
            <p className="text-blue-100 mb-4">
              智能高效，让交通安全宣传更专业
            </p>
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition shadow-md"
            >
              <Zap className="w-5 h-5" />
              立即生成文案
            </Link>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Calendar className="w-16 h-16 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-700" />
              </div>
              <span className="text-xs text-green-600 font-semibold">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">127</h3>
            <p className="text-sm text-gray-600">本月生成文案</p>
          </CardContent>
        </Card>

        <Card className="shadow border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-700" />
              </div>
              <span className="text-xs text-green-600 font-semibold">89%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">113</h3>
            <p className="text-sm text-gray-600">审核通过</p>
          </CardContent>
        </Card>

        <Card className="shadow border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-700" />
              </div>
              <span className="text-xs text-orange-600 font-semibold">
                待处理
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">3</h3>
            <p className="text-sm text-gray-600">待审核文案</p>
          </CardContent>
        </Card>

        <Card className="shadow border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-700" />
              </div>
              <span className="text-xs text-purple-600 font-semibold">
                效率
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">4.2分钟</h3>
            <p className="text-sm text-gray-600">平均生成时间</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Content */}
        <Card className="lg:col-span-2 shadow border-gray-200">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="font-bold text-gray-800">
                最近文案
              </CardTitle>
              <Link
                to="/content"
                className="text-sm text-blue-700 hover:text-blue-800"
              >
                查看全部 →
              </Link>
            </div>
          </CardHeader>
          <div className="divide-y divide-gray-200">
            {recentContents.map((content) => (
              <div
                key={content.id}
                className="p-6 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {content.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {content.platform}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {content.time}
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={`rounded-full ${
                      content.status === "已发布"
                        ? "bg-green-100 text-green-700 border-transparent"
                        : content.status === "待审核"
                          ? "bg-orange-100 text-orange-700 border-transparent"
                          : "bg-blue-100 text-blue-700 border-transparent"
                    }`}
                  >
                    {content.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Todo & Quick Stats */}
        <div className="space-y-6">
          {/* Todos */}
          <Card className="shadow border-gray-200">
            <CardHeader className="border-b border-gray-200 pb-4">
              <CardTitle className="font-bold text-gray-800">
                待办事项
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {todos.map((todo) => (
                <div key={todo.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 text-blue-700 rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{todo.text}</p>
                    {todo.urgent && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        紧急
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="font-bold text-gray-800">本周数据</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">微博</span>
                  <span className="font-semibold text-gray-800">28 篇</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">微信公众号</span>
                  <span className="font-semibold text-gray-800">15 篇</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">抖音/快手</span>
                  <span className="font-semibold text-gray-800">22 篇</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">头条号</span>
                  <span className="font-semibold text-gray-800">12 篇</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
