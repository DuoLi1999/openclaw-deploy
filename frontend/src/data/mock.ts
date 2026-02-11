// ==================== Types ====================

export interface RecentContent {
  id: number;
  title: string;
  platform: string;
  status: string;
  time: string;
}

export interface Todo {
  id: number;
  text: string;
  urgent: boolean;
}

export interface ContentItem {
  id: number;
  title: string;
  platform: string;
  status: string;
  createTime: string;
  publishTime: string;
  author: string;
  views: number;
}

export interface CaseItem {
  id: number;
  title: string;
  content: string;
  tags: string[];
  source: string;
  date: string;
  favorite: boolean;
}

export interface TemplateItem {
  id: number;
  title: string;
  content: string;
  category: string;
  usageCount: number;
}

export interface RegulationItem {
  id: number;
  title: string;
  content: string;
  category: string;
}

export interface UserItem {
  id: number;
  username: string;
  role: string;
  department: string;
  email: string;
  status: string;
  lastLogin: string;
}

export interface SensitiveWord {
  id: number;
  word: string;
  level: string;
  category: string;
  addTime: string;
}

export interface StyleOption {
  id: string;
  label: string;
  icon: string;
}

export interface PlatformOption {
  id: string;
  label: string;
  limit: string;
}

export interface QuotaUser {
  user: string;
  allocated: number;
  used: number;
}

export interface RolePermission {
  role: string;
  permissions: string[];
}

// ==================== Mock Data ====================

export const recentContents: RecentContent[] = [
  { id: 1, title: "春节返程高速安全提醒", platform: "微信公众号", status: "已发布", time: "2小时前" },
  { id: 2, title: "酒驾警示宣传", platform: "微博", status: "待审核", time: "5小时前" },
  { id: 3, title: "安全带使用提醒", platform: "抖音", status: "审核通过", time: "1天前" },
];

export const todos: Todo[] = [
  { id: 1, text: "审核 3 篇待审核文案", urgent: true },
  { id: 2, text: "完成本周宣传任务（5/10）", urgent: false },
];

export const contentItems: ContentItem[] = [
  {
    id: 1,
    title: "春节返程高速安全提醒",
    platform: "微信公众号",
    status: "published",
    createTime: "2026-02-08 14:30",
    publishTime: "2026-02-08 16:00",
    author: "张三",
    views: 1245,
  },
  {
    id: 2,
    title: "酒驾警示宣传",
    platform: "微博",
    status: "pending",
    createTime: "2026-02-09 10:15",
    publishTime: "-",
    author: "李四",
    views: 0,
  },
  {
    id: 3,
    title: "安全带使用提醒",
    platform: "抖音",
    status: "approved",
    createTime: "2026-02-09 09:20",
    publishTime: "-",
    author: "王五",
    views: 0,
  },
  {
    id: 4,
    title: "雨天行车注意事项",
    platform: "头条号",
    status: "rejected",
    createTime: "2026-02-07 16:45",
    publishTime: "-",
    author: "张三",
    views: 0,
  },
  {
    id: 5,
    title: "儿童安全座椅宣传",
    platform: "微信公众号",
    status: "draft",
    createTime: "2026-02-10 11:00",
    publishTime: "-",
    author: "李四",
    views: 0,
  },
];

export const cases: CaseItem[] = [
  {
    id: 1,
    title: "高速公路疲劳驾驶警示案例",
    content: "2025年春节期间，某驾驶员连续驾驶超过4小时未休息...",
    tags: ["疲劳驾驶", "高速公路", "春节"],
    source: "交警支队",
    date: "2026-01-15",
    favorite: true,
  },
  {
    id: 2,
    title: "酒驾治理典型案例",
    content: "驾驶员张某在朋友聚会后酒后驾车，被交警查获...",
    tags: ["酒驾", "执法案例"],
    source: "一大队",
    date: "2026-01-20",
    favorite: false,
  },
  {
    id: 3,
    title: "安全带使用宣传素材",
    content: "通过真实案例展示安全带在交通事故中的重要作用...",
    tags: ["安全带", "宣传教育"],
    source: "宣传科",
    date: "2026-02-01",
    favorite: true,
  },
];

export const templates: TemplateItem[] = [
  {
    id: 1,
    title: "酒驾警示标准话术",
    content: "酒后驾驶害人害己，为了您和他人的安全，请自觉抵制酒驾行为...",
    category: "酒驾警示",
    usageCount: 45,
  },
  {
    id: 2,
    title: "安全带提醒话术",
    content: "安全带就是生命带！请驾乘人员务必系好安全带...",
    category: "安全提醒",
    usageCount: 78,
  },
  {
    id: 3,
    title: "节假日出行提示",
    content: "节假日出行高峰将至，请提前规划路线，错峰出行...",
    category: "节假日",
    usageCount: 32,
  },
];

export const regulations: RegulationItem[] = [
  {
    id: 1,
    title: "道路交通安全法 第二十二条",
    content:
      "机动车驾驶人应当遵守道路交通安全法律、法规的规定，按照操作规范安全驾驶、文明驾驶。",
    category: "驾驶规范",
  },
  {
    id: 2,
    title: "道路交通安全法 第四十七条",
    content:
      "机动车行经人行横道时，应当减速行驶；遇行人正在通过人行横道，应当停车让行。",
    category: "礼让行人",
  },
  {
    id: 3,
    title: "道路交通安全法 第九十一条",
    content:
      "饮酒后驾驶机动车的，处暂扣六个月机动车驾驶证，并处一千元以上二千元以下罚款。",
    category: "酒驾处罚",
  },
];

export const users: UserItem[] = [
  { id: 1, username: "张三", role: "editor", department: "宣传科", email: "zhangsan@police.gov", status: "active", lastLogin: "2026-02-10 09:30" },
  { id: 2, username: "李四", role: "editor", department: "宣传科", email: "lisi@police.gov", status: "active", lastLogin: "2026-02-09 16:20" },
  { id: 3, username: "王五", role: "reviewer", department: "宣传科", email: "wangwu@police.gov", status: "active", lastLogin: "2026-02-10 08:15" },
  { id: 4, username: "赵六", role: "admin", department: "IT部门", email: "zhaoliu@police.gov", status: "active", lastLogin: "2026-02-10 10:00" },
];

export const sensitiveWords: SensitiveWord[] = [
  { id: 1, word: "示例敏感词1", level: "high", category: "政治", addTime: "2026-01-15" },
  { id: 2, word: "示例敏感词2", level: "medium", category: "违法", addTime: "2026-01-20" },
  { id: 3, word: "示例敏感词3", level: "low", category: "不当表述", addTime: "2026-02-01" },
];

export const styleOptions: StyleOption[] = [
  { id: "formal", label: "严肃正式", icon: "📋" },
  { id: "friendly", label: "亲民温和", icon: "😊" },
  { id: "humorous", label: "幽默风趣", icon: "😄" },
  { id: "warning", label: "警示教育", icon: "⚠️" },
];

export const platformOptions: PlatformOption[] = [
  { id: "weibo", label: "微博", limit: "≤140字" },
  { id: "wechat", label: "微信公众号", limit: "800-2000字" },
  { id: "douyin", label: "抖音/快手", limit: "≤300字" },
  { id: "toutiao", label: "头条号", limit: "500-1500字" },
];

export const quotaUsers: QuotaUser[] = [
  { user: "张三", allocated: 200, used: 145 },
  { user: "李四", allocated: 200, used: 178 },
  { user: "王五", allocated: 150, used: 95 },
  { user: "赵六", allocated: 100, used: 100 },
];

export const rolePermissions: RolePermission[] = [
  { role: "管理员", permissions: ["用户管理", "系统配置", "数据统计", "文案生成", "文案审核", "素材管理"] },
  { role: "审核员", permissions: ["文案审核", "数据查看", "文案生成", "素材管理"] },
  { role: "宣传员", permissions: ["文案生成", "素材管理", "历史文案查看"] },
];

export function generateMockContent(topic: string): string {
  return `【${topic}】

亲爱的司机朋友们，春节返程高峰即将到来！🚗

为了您和家人的平安，请注意：
✅ 提前检查车况，确保安全
✅ 合理规划路线，避开高峰时段
✅ 保持安全车距，谨慎驾驶
✅ 疲劳时及时休息，切勿强行赶路

根据《道路交通安全法》第二十二条规定："机动车驾驶人应当遵守道路交通安全法律、法规的规定，按照操作规范安全驾驶、文明驾驶。"

平安到家，才是最好的归途！🏠

#交通安全 #春节返程`;
}
