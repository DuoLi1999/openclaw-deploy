import { useState } from 'react';
import { Users, Shield, AlertCircle, Database, Plus, Edit, Trash2, Key } from 'lucide-react';

export function SystemManagementPage() {
  const [activeTab, setActiveTab] = useState('users');

  const users = [
    { id: 1, username: '张三', role: 'editor', department: '宣传科', email: 'zhangsan@police.gov', status: 'active', lastLogin: '2026-02-10 09:30' },
    { id: 2, username: '李四', role: 'editor', department: '宣传科', email: 'lisi@police.gov', status: 'active', lastLogin: '2026-02-09 16:20' },
    { id: 3, username: '王五', role: 'reviewer', department: '宣传科', email: 'wangwu@police.gov', status: 'active', lastLogin: '2026-02-10 08:15' },
    { id: 4, username: '赵六', role: 'admin', department: 'IT部门', email: 'zhaoliu@police.gov', status: 'active', lastLogin: '2026-02-10 10:00' },
  ];

  const sensitiveWords = [
    { id: 1, word: '示例敏感词1', level: 'high', category: '政治', addTime: '2026-01-15' },
    { id: 2, word: '示例敏感词2', level: 'medium', category: '违法', addTime: '2026-01-20' },
    { id: 3, word: '示例敏感词3', level: 'low', category: '不当表述', addTime: '2026-02-01' },
  ];

  const tabs = [
    { id: 'users', label: '用户管理', icon: Users },
    { id: 'permissions', label: '权限配置', icon: Shield },
    { id: 'sensitive', label: '敏感词库', icon: AlertCircle },
    { id: 'quota', label: '配额管理', icon: Database },
  ];

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: '管理员' },
      reviewer: { bg: 'bg-blue-100', text: 'text-blue-700', label: '审核员' },
      editor: { bg: 'bg-green-100', text: 'text-green-700', label: '宣传员' },
    };

    const config = roleConfig[role as keyof typeof roleConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      high: { bg: 'bg-red-100', text: 'text-red-700', label: '高' },
      medium: { bg: 'bg-orange-100', text: 'text-orange-700', label: '中' },
      low: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '低' },
    };

    const config = levelConfig[level as keyof typeof levelConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">系统管理</h2>
          <p className="text-sm text-gray-600">
            管理用户账号、权限配置和系统设置
          </p>
        </div>
        {activeTab === 'users' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">
            <Plus className="w-5 h-5" />
            添加用户
          </button>
        )}
        {activeTab === 'sensitive' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">
            <Plus className="w-5 h-5" />
            添加敏感词
          </button>
        )}
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
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">用户名</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">角色</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">部门</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">邮箱</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">最后登录</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">状态</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-800">{user.username}</td>
                      <td className="py-3 px-4 text-sm">{getRoleBadge(user.role)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.department}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.lastLogin}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                          正常
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex justify-end gap-2">
                          <button className="p-1.5 hover:bg-gray-100 rounded transition" title="编辑">
                            <Edit className="w-4 h-4 text-blue-600" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded transition" title="重置密码">
                            <Key className="w-4 h-4 text-orange-600" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded transition" title="删除">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-4">角色权限配置</h4>
                <div className="space-y-4">
                  {[
                    { role: '管理员', permissions: ['用户管理', '系统配置', '数据统计', '文案生成', '文案审核', '素材管理'] },
                    { role: '审核员', permissions: ['文案审核', '数据查看', '文案生成', '素材管理'] },
                    { role: '宣传员', permissions: ['文案生成', '素材管理', '历史文案查看'] },
                  ].map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="font-semibold text-gray-800 mb-3">{item.role}</div>
                      <div className="flex flex-wrap gap-2">
                        {item.permissions.map((perm, pidx) => (
                          <span key={pidx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sensitive' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">敏感词</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">级别</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">分类</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">添加时间</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sensitiveWords.map((word) => (
                    <tr key={word.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-800">{word.word}</td>
                      <td className="py-3 px-4 text-sm">{getLevelBadge(word.level)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{word.category}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{word.addTime}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex justify-end gap-2">
                          <button className="p-1.5 hover:bg-gray-100 rounded transition" title="编辑">
                            <Edit className="w-4 h-4 text-blue-600" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded transition" title="删除">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'quota' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-2">月度总配额</div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">1,000</div>
                  <div className="text-sm text-gray-500">API 调用次数</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-2">已使用</div>
                  <div className="text-3xl font-bold text-blue-700 mb-1">518</div>
                  <div className="text-sm text-gray-500">占比 52%</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-2">剩余配额</div>
                  <div className="text-3xl font-bold text-green-700 mb-1">482</div>
                  <div className="text-sm text-gray-500">本月可用</div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-4">用户配额分配</h4>
                <div className="space-y-3">
                  {[
                    { user: '张三', allocated: 200, used: 145 },
                    { user: '李四', allocated: 200, used: 178 },
                    { user: '王五', allocated: 150, used: 95 },
                    { user: '赵六', allocated: 100, used: 100 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-24 text-sm font-medium text-gray-700">{item.user}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>已使用 {item.used} / {item.allocated}</span>
                          <span>{Math.round((item.used / item.allocated) * 100)}%</span>
                        </div>
                        <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.used >= item.allocated ? 'bg-red-500' : 'bg-blue-600'}`}
                            style={{ width: `${Math.min((item.used / item.allocated) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <button className="text-sm text-blue-700 hover:text-blue-800">调整</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
