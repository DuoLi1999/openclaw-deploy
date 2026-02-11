import { useState, useCallback, useEffect } from "react";
import {
  Calendar,
  Sparkles,
  Loader2,
  Copy,
  Download,
  Check,
  Users,
  Target,
  Clock,
  Lightbulb,
  Database,
  Save,
  History,
  ListChecks,
  Trash2,
  ChevronDown,
  ChevronRight,
  Square,
  CheckSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  runPlannerWorkflowStreaming,
  runTopicRecommenderWorkflowStreaming,
  type StreamProgress,
} from "@/services/dify";
import accidentData from "@/data/accident-data/2025-summary.json";

const PLATFORM_OPTIONS = [
  { id: "weibo", label: "微博" },
  { id: "wechat", label: "微信公众号" },
  { id: "douyin", label: "抖音" },
  { id: "kuaishou", label: "快手" },
  { id: "toutiao", label: "头条号" },
];

const TIME_RANGE_OPTIONS = [
  { id: "week", label: "一周" },
  { id: "month", label: "一个月" },
  { id: "quarter", label: "一季度" },
];

interface RecommendedTopic {
  title: string;
  reason: string;
  audience: string;
  urgency: string;
}

interface PlanTask {
  id: string;
  text: string;
  done: boolean;
}

interface SavedPlan {
  id: string;
  goal: string;
  audience: string;
  timeRange: string;
  content: string;
  tasks: PlanTask[];
  createdAt: string;
}

const PLANS_STORAGE_KEY = "savedPlans";

function loadSavedPlans(): SavedPlan[] {
  try {
    const raw = localStorage.getItem(PLANS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePlansToStorage(plans: SavedPlan[]) {
  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
}

function extractTasks(content: string): PlanTask[] {
  const tasks: PlanTask[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Match numbered items (1. / 1、/ 1) or bullet points (- / *)
    const match = trimmed.match(/^(?:\d+[.、)]\s*|[-*]\s+)(.+)/);
    if (match) {
      const text = match[1].trim();
      // Skip very short items or pure headers
      if (text.length >= 6 && !text.startsWith("#")) {
        tasks.push({
          id: `task-${tasks.length}`,
          text,
          done: false,
        });
      }
    }
  }
  return tasks;
}

export function PlanPage() {
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["weibo", "wechat"]);
  const [timeRange, setTimeRange] = useState("month");
  const [background, setBackground] = useState("");
  const [useAccidentData, setUseAccidentData] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<StreamProgress[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<"strategy" | "schedule" | "tasks">("strategy");

  // Topic recommender state
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedTopic[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendError, setRecommendError] = useState<string | null>(null);

  // Plan management state
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [currentTasks, setCurrentTasks] = useState<PlanTask[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setSavedPlans(loadSavedPlans());
  }, []);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleRecommendTopics = useCallback(async () => {
    setIsRecommending(true);
    setRecommendError(null);
    setRecommendations([]);
    setShowRecommendations(true);

    try {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}年${now.getMonth() + 1}月`;

      const output = await runTopicRecommenderWorkflowStreaming(
        {
          current_month: currentMonth,
          accident_data: JSON.stringify(accidentData),
        },
        { onProgress: () => {} }
      );

      try {
        const parsed = JSON.parse(output.topics_json);
        const topics: RecommendedTopic[] = (parsed.topics ?? parsed).slice(0, 6);
        setRecommendations(topics);
      } catch {
        // Fallback: parse from result text
        setRecommendations([]);
        setRecommendError("推荐结果解析失败，请查看原始输出");
      }
    } catch (err) {
      setRecommendError(err instanceof Error ? err.message : "推荐失败");
    } finally {
      setIsRecommending(false);
    }
  }, []);

  const applyRecommendation = (topic: RecommendedTopic) => {
    setGoal(topic.title);
    if (topic.audience) setAudience(topic.audience);
    setShowRecommendations(false);
  };

  // Extract tasks when result changes
  useEffect(() => {
    if (result) {
      setCurrentTasks(extractTasks(result));
    } else {
      setCurrentTasks([]);
    }
  }, [result]);

  const handleSavePlan = useCallback(() => {
    if (!result) return;
    const plan: SavedPlan = {
      id: `plan-${Date.now()}`,
      goal,
      audience,
      timeRange,
      content: result,
      tasks: currentTasks,
      createdAt: new Date().toISOString(),
    };
    const updated = [plan, ...savedPlans];
    setSavedPlans(updated);
    savePlansToStorage(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }, [result, goal, audience, timeRange, currentTasks, savedPlans]);

  const handleLoadPlan = useCallback((plan: SavedPlan) => {
    setGoal(plan.goal);
    setAudience(plan.audience);
    setTimeRange(plan.timeRange);
    setResult(plan.content);
    setCurrentTasks(plan.tasks);
    setShowHistory(false);
  }, []);

  const handleDeletePlan = useCallback((planId: string) => {
    const updated = savedPlans.filter((p) => p.id !== planId);
    setSavedPlans(updated);
    savePlansToStorage(updated);
  }, [savedPlans]);

  const toggleTask = useCallback((taskId: string) => {
    setCurrentTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    );
  }, []);

  const taskProgress = currentTasks.length > 0
    ? Math.round((currentTasks.filter((t) => t.done).length / currentTasks.length) * 100)
    : 0;

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setProgress([]);

    try {
      const output = await runPlannerWorkflowStreaming(
        {
          goal,
          audience,
          platforms: selectedPlatforms.join(","),
          time_range: timeRange,
          background,
          accident_data: useAccidentData ? JSON.stringify(accidentData) : undefined,
        },
        {
          onProgress: (p: StreamProgress) => {
            setProgress((prev) => [...prev, p]);
          },
        }
      );
      setResult(output.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setIsGenerating(false);
    }
  }, [goal, audience, selectedPlatforms, timeRange, background, useAccidentData]);

  const handleCopy = useCallback(() => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [result]);

  const handleDownload = useCallback(() => {
    if (result) {
      const blob = new Blob([result], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `宣传计划_${new Date().toISOString().slice(0, 10)}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [result]);

  // Split result into strategy and schedule sections
  const sections = result?.split(/(?=#{1,2}\s*(发布|排期|日程|Schedule))/i) ?? [];
  const strategyContent = sections[0] ?? result ?? "";
  const scheduleContent = sections.slice(1).join("\n") || null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">宣传计划</h2>
          <p className="text-sm text-gray-600">
            AI 辅助生成多平台宣传策略和发布排期，融合本地事故数据精准匹配
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Input */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow border-gray-200">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-700" />
                计划参数
              </h3>

              {/* AI Topic Recommender */}
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                    <Lightbulb className="w-4 h-4" />
                    AI 智能推荐主题
                  </div>
                  <button
                    onClick={handleRecommendTopics}
                    disabled={isRecommending}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white text-xs font-medium rounded-lg transition flex items-center gap-1"
                  >
                    {isRecommending ? (
                      <><Loader2 className="w-3 h-3 animate-spin" />分析中...</>
                    ) : (
                      <><Sparkles className="w-3 h-3" />获取推荐</>
                    )}
                  </button>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  基于当前季节、节假日和本地事故数据，自动推荐最佳宣传主题
                </p>

                {showRecommendations && (
                  <div className="mt-3 space-y-2">
                    {recommendError && (
                      <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{recommendError}</div>
                    )}
                    {recommendations.map((topic, i) => (
                      <button
                        key={i}
                        onClick={() => applyRecommendation(topic)}
                        className="w-full text-left px-3 py-2 bg-white border border-amber-200 rounded-lg hover:border-amber-400 transition"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-sm font-medium text-gray-800">{topic.title}</span>
                          {topic.urgency && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ml-2 shrink-0 ${
                              topic.urgency === "高" ? "bg-red-100 text-red-700" :
                              topic.urgency === "中" ? "bg-orange-100 text-orange-700" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {topic.urgency}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{topic.reason}</p>
                      </button>
                    ))}
                    {recommendations.length > 0 && (
                      <button
                        onClick={() => setShowRecommendations(false)}
                        className="w-full text-xs text-amber-600 hover:text-amber-800 py-1"
                      >
                        收起推荐
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Goal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-1" />
                  宣传目标 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="例如：提高市民对酒驾危害的认知"
                />
              </div>

              {/* Audience */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  目标受众
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="例如：年轻驾驶员（18-35岁）"
                />
              </div>

              {/* Platform Multi-select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  目标平台
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_OPTIONS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`px-3 py-1.5 rounded-lg border-2 text-sm transition ${
                        selectedPlatforms.includes(p.id)
                          ? "border-blue-700 bg-blue-50 text-blue-700 font-medium"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  时间范围
                </label>
                <div className="flex gap-2">
                  {TIME_RANGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTimeRange(opt.id)}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition ${
                        timeRange === opt.id
                          ? "border-blue-700 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  背景信息（选填）
                </label>
                <textarea
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="当前重点工作、近期事故情况、季节性因素等"
                />
              </div>

              {/* Accident Data Toggle */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">融合事故数据</span>
                </div>
                <button
                  onClick={() => setUseAccidentData(!useAccidentData)}
                  className={`relative w-10 h-5 rounded-full transition ${
                    useAccidentData ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition ${
                      useAccidentData ? "left-5.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              {useAccidentData && (
                <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs text-blue-700">
                    已加载 {accidentData.period} 事故数据：共 {accidentData.overview.totalAccidents} 起事故，
                    {accidentData.highRiskAreas.length} 个高风险路段，
                    {accidentData.highRiskGroups.length} 类高风险人群
                  </p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!goal || isGenerating}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    生成宣传计划
                  </>
                )}
              </button>
            </CardContent>
          </Card>

          {/* Plan History */}
          {savedPlans.length > 0 && (
            <Card className="shadow border-gray-200">
              <CardContent className="p-4">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-between"
                >
                  <span className="font-bold text-gray-800 flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-500" />
                    历史计划
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-normal">
                      {savedPlans.length}
                    </span>
                  </span>
                  {showHistory ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {showHistory && (
                  <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto">
                    {savedPlans.map((plan) => {
                      const doneTasks = plan.tasks.filter((t) => t.done).length;
                      const totalTasks = plan.tasks.length;
                      return (
                        <div
                          key={plan.id}
                          className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition"
                        >
                          <div className="flex items-start justify-between">
                            <button
                              onClick={() => handleLoadPlan(plan)}
                              className="flex-1 text-left"
                            >
                              <p className="text-sm font-medium text-gray-800 line-clamp-1">
                                {plan.goal}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span>{new Date(plan.createdAt).toLocaleDateString("zh-CN")}</span>
                                {plan.audience && <span>{plan.audience}</span>}
                                {totalTasks > 0 && (
                                  <span className={doneTasks === totalTasks ? "text-green-600" : ""}>
                                    {doneTasks}/{totalTasks} 任务
                                  </span>
                                )}
                              </div>
                            </button>
                            <button
                              onClick={() => handleDeletePlan(plan.id)}
                              className="p-1 hover:bg-red-50 rounded transition shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Output */}
        <div className="lg:col-span-3">
          <Card className="shadow border-gray-200 h-full flex flex-col">
            {/* Result Tabs */}
            {result && (
              <div className="border-b border-gray-200 px-6 pt-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveResultTab("strategy")}
                    className={`px-4 py-2 font-medium text-sm transition border-b-2 ${
                      activeResultTab === "strategy"
                        ? "border-blue-700 text-blue-700"
                        : "border-transparent text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    策略方案
                  </button>
                  {scheduleContent && (
                    <button
                      onClick={() => setActiveResultTab("schedule")}
                      className={`px-4 py-2 font-medium text-sm transition border-b-2 ${
                        activeResultTab === "schedule"
                          ? "border-blue-700 text-blue-700"
                          : "border-transparent text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      发布排期
                    </button>
                  )}
                  {currentTasks.length > 0 && (
                    <button
                      onClick={() => setActiveResultTab("tasks")}
                      className={`px-4 py-2 font-medium text-sm transition border-b-2 flex items-center gap-1.5 ${
                        activeResultTab === "tasks"
                          ? "border-blue-700 text-blue-700"
                          : "border-transparent text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      <ListChecks className="w-4 h-4" />
                      任务分解
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {currentTasks.filter((t) => t.done).length}/{currentTasks.length}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 p-6">
              {error && (
                <div className="px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {result ? (
                <div className="space-y-4">
                  {activeResultTab === "tasks" ? (
                    <div className="space-y-3">
                      {/* Task progress bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full transition-all duration-300"
                            style={{ width: `${taskProgress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 shrink-0">
                          {taskProgress}%
                        </span>
                      </div>
                      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                        {currentTasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition"
                          >
                            {task.done ? (
                              <CheckSquare className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                            )}
                            <span
                              className={`text-sm leading-relaxed ${
                                task.done
                                  ? "text-gray-400 line-through"
                                  : "text-gray-800"
                              }`}
                            >
                              {task.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 min-h-[400px] whitespace-pre-wrap text-sm text-gray-800 leading-relaxed overflow-y-auto max-h-[600px]">
                      {activeResultTab === "strategy" ? strategyContent : scheduleContent}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSavePlan}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                        saveSuccess
                          ? "bg-green-50 border border-green-300 text-green-700"
                          : "bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
                      }`}
                    >
                      {saveSuccess ? <><Check className="w-4 h-4" />已保存</> : <><Save className="w-4 h-4" />保存</>}
                    </button>
                    <button
                      onClick={handleCopy}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                        copySuccess
                          ? "bg-green-50 border border-green-300 text-green-700"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {copySuccess ? <><Check className="w-4 h-4" />已复制</> : <><Copy className="w-4 h-4" />复制</>}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Download className="w-4 h-4" />
                      下载
                    </button>
                  </div>
                </div>
              ) : isGenerating && progress.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">正在生成宣传计划...</span>
                  </div>
                  <div className="space-y-2">
                    {progress
                      .filter((p, i, arr) => arr.findIndex((x) => x.nodeTitle === p.nodeTitle) === i || p === arr[arr.length - 1])
                      .map((step) => (
                        <div
                          key={`${step.nodeTitle}-${step.event}`}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm ${
                            step.status === "running"
                              ? "bg-blue-50 text-blue-700"
                              : step.status === "failed"
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {step.status === "running" && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                          {step.status === "succeeded" && <Check className="w-4 h-4 text-green-600" />}
                          <span className="font-medium">{step.nodeTitle}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">等待生成宣传计划</p>
                    <p className="text-sm mt-2">填写左侧参数后点击"生成宣传计划"</p>
                    <p className="text-xs mt-1 text-gray-300">支持 AI 智能推荐主题 + 事故数据融合</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
