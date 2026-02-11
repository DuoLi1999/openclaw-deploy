import { useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Shield,
  Home,
  FileText,
  Database,
  FolderOpen,
  Calendar,
  BarChart3,
  Crosshair,
  AlertOctagon,
  Settings,
  LogOut,
  User,
  Bell,
} from "lucide-react";
import { ChatWidget } from "./ChatWidget";

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { path: "/", icon: Home, label: "工作台" },
    { path: "/generate", icon: FileText, label: "文案生成" },
    { path: "/materials", icon: Database, label: "素材库" },
    { path: "/content", icon: FolderOpen, label: "文案管理" },
    { path: "/plan", icon: Calendar, label: "宣传计划" },
    { path: "/precision", icon: Crosshair, label: "精准宣传" },
    { path: "/emergency", icon: AlertOctagon, label: "应急宣传" },
    { path: "/analytics", icon: BarChart3, label: "效果分析" },
    { path: "/system", icon: Settings, label: "系统管理" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-700 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                OpenClaw 交警宣传文案生成系统
              </h1>
              <p className="text-xs text-gray-500">
                Traffic Safety Content Generation System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">宣传员</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] relative">
          <nav className="p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700 font-semibold mb-1">API 用量</p>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>已使用 518 / 1000</span>
              <span className="text-blue-700 font-semibold">52%</span>
            </div>
            <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full"
                style={{ width: "52%" }}
              ></div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}
