import { useState, useCallback, useEffect } from "react";
import {
  AlertOctagon,
  Zap,
  Loader2,
  Copy,
  Download,
  Check,
  Cloud,
  Car,
  Construction,
  Snowflake,
  Flame,
  ShieldAlert,
  Megaphone,
  TrendingUp,
  Bell,
  Clock,
  Settings,
  Trash2,
  Play,
  Power,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  runWorkflowStreaming,
  runPublicOpinionWorkflowStreaming,
  type WorkflowOutputs,
  type StreamProgress,
} from "@/services/dify";

// ==================== Emergency Scenarios ====================

interface EmergencyScenario {
  id: string;
  icon: typeof AlertOctagon;
  label: string;
  description: string;
  topic: string;
  templateDesc: string;
  style: string;
}

const SCENARIOS: EmergencyScenario[] = [
  {
    id: "ice_snow",
    icon: Snowflake,
    label: "冰雪预警",
    description: "气象部门发布冰雪/寒潮预警",
    topic: "冰雪天气交通安全紧急提醒",
    templateDesc: "当前已发布冰雪/寒潮预警信号。路面结冰，能见度下降。请提醒广大驾驶人降速、控距、亮尾，非必要不出行。冰雪路面制动距离是干燥路面的4-8倍。",
    style: "warning",
  },
  {
    id: "heavy_fog",
    icon: Cloud,
    label: "大雾预警",
    description: "能见度低于200米的大雾天气",
    topic: "大雾天气交通安全紧急提醒",
    templateDesc: "当前已发布大雾预警信号，部分路段能见度不足100米。请驾驶人开启雾灯、降低车速、保持安全车距。高速公路可能实施临时交通管制。雾天是连环追尾事故高发时段。",
    style: "warning",
  },
  {
    id: "major_accident",
    icon: Car,
    label: "重大事故",
    description: "发生较大以上交通事故",
    topic: "重大交通事故警示与安全提醒",
    templateDesc: "辖区发生一起较大交通事故，造成人员伤亡。事故原因初步调查与超速/疲劳驾驶有关。请以此为警示，提醒广大驾驶人遵守交通法规，珍惜生命。",
    style: "warning",
  },
  {
    id: "road_closure",
    icon: Construction,
    label: "道路封闭/绕行",
    description: "重要道路施工或事故导致封闭",
    topic: "道路封闭绕行提醒",
    templateDesc: "因道路施工/交通事故，XX路段实施临时交通管制。请过往车辆提前规划路线，按指示绕行。预计恢复通行时间：待定。",
    style: "formal",
  },
  {
    id: "holiday_rush",
    icon: Flame,
    label: "节假日高峰",
    description: "节假日出行高峰应急提醒",
    topic: "节假日出行高峰交通安全提醒",
    templateDesc: "当前正值节假日出行高峰，高速公路/城区主干道车流量激增。请广大驾驶人错峰出行、提前规划路线、保持安全车距。切勿占用应急车道、切勿疲劳驾驶。",
    style: "friendly",
  },
  {
    id: "drunk_driving_op",
    icon: ShieldAlert,
    label: "专项整治行动",
    description: "酒驾/超速等专项整治行动",
    topic: "交通违法专项整治行动通告",
    templateDesc: "为有效预防和减少道路交通事故，我队将于近期在辖区范围内开展酒驾醉驾专项整治行动。集中查处酒后驾驶、醉酒驾驶等严重交通违法行为。请广大驾驶人自觉遵守法律法规，杜绝酒后驾车。",
    style: "formal",
  },
];

const PLATFORMS = [
  { id: "weibo", label: "微博" },
  { id: "wechat", label: "微信公众号" },
  { id: "douyin", label: "抖音" },
];

const EVENT_TYPES = [
  { id: "交通事故舆情", label: "交通事故舆情" },
  { id: "执法争议舆情", label: "执法争议舆情" },
  { id: "政策变化舆情", label: "政策变化舆情" },
  { id: "服务投诉舆情", label: "服务投诉舆情" },
];

const URGENCY_LEVELS = [
  { id: "紧急(2小时内响应)", label: "紧急", desc: "2小时内响应", color: "bg-red-100 text-red-700 border-red-300" },
  { id: "重要(24小时内响应)", label: "重要", desc: "24小时内响应", color: "bg-orange-100 text-orange-700 border-orange-300" },
  { id: "一般(48小时内响应)", label: "一般", desc: "48小时内响应", color: "bg-gray-100 text-gray-700 border-gray-300" },
];

// ==================== Trigger Rules ====================

interface TriggerRule {
  id: string;
  name: string;
  conditionType: "weather" | "accident" | "holiday" | "time";
  conditionValue: string;
  scenarioId: string;
  platforms: string[];
  enabled: boolean;
  lastTriggered?: string;
}

interface TriggerLog {
  id: string;
  ruleId: string;
  ruleName: string;
  triggeredAt: string;
  scenarioLabel: string;
  platforms: string[];
  status: "auto" | "manual";
}

const CONDITION_TYPES = [
  { id: "weather", label: "气象预警", icon: Cloud, examples: "暴雪预警、大雾黄色预警、高温红色预警" },
  { id: "accident", label: "事故等级", icon: Car, examples: "较大事故(3人以上)、重大事故(10人以上)" },
  { id: "holiday", label: "节假日", icon: Flame, examples: "春节、国庆、清明、中秋" },
  { id: "time", label: "定时触发", icon: Clock, examples: "每周五17:00、每月1日08:00" },
];

const TRIGGER_RULES_KEY = "triggerRules";
const TRIGGER_LOGS_KEY = "triggerLogs";

function loadTriggerRules(): TriggerRule[] {
  try { return JSON.parse(localStorage.getItem(TRIGGER_RULES_KEY) || "[]"); }
  catch { return []; }
}

function saveTriggerRules(rules: TriggerRule[]) {
  localStorage.setItem(TRIGGER_RULES_KEY, JSON.stringify(rules));
}

function loadTriggerLogs(): TriggerLog[] {
  try { return JSON.parse(localStorage.getItem(TRIGGER_LOGS_KEY) || "[]"); }
  catch { return []; }
}

function saveTriggerLog(log: TriggerLog) {
  const logs = loadTriggerLogs();
  logs.unshift(log);
  localStorage.setItem(TRIGGER_LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
}

interface GeneratedContent {
  platform: string;
  content: string;
  auditStatus: string;
  charCount: number;
}

type PageTab = "emergency" | "opinion" | "trigger";

export function EmergencyPage() {
  const [activeTab, setActiveTab] = useState<PageTab>("emergency");

  // ========== Emergency Tab State ==========
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [customDetail, setCustomDetail] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["weibo", "wechat", "douyin"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generatingPlatform, setGeneratingPlatform] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // ========== Opinion Tab State ==========
  const [eventDescription, setEventDescription] = useState("");
  const [eventType, setEventType] = useState("交通事故舆情");
  const [urgencyLevel, setUrgencyLevel] = useState("重要(24小时内响应)");
  const [existingResponse, setExistingResponse] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [opinionAnalysis, setOpinionAnalysis] = useState<string | null>(null);
  const [opinionResult, setOpinionResult] = useState<string | null>(null);
  const [opinionError, setOpinionError] = useState<string | null>(null);
  const [opinionProgress, setOpinionProgress] = useState<StreamProgress[]>([]);
  const [opinionCopySuccess, setOpinionCopySuccess] = useState<string | null>(null);
  const [opinionResultTab, setOpinionResultTab] = useState<"analysis" | "strategy">("analysis");

  // ========== Trigger Tab State ==========
  const [triggerRules, setTriggerRules] = useState<TriggerRule[]>(loadTriggerRules);
  const [triggerLogs, setTriggerLogs] = useState<TriggerLog[]>(loadTriggerLogs);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRuleName, setNewRuleName] = useState("");
  const [newConditionType, setNewConditionType] = useState<TriggerRule["conditionType"]>("weather");
  const [newConditionValue, setNewConditionValue] = useState("");
  const [newScenarioId, setNewScenarioId] = useState(SCENARIOS[0].id);
  const [newRulePlatforms, setNewRulePlatforms] = useState<string[]>(["weibo", "wechat", "douyin"]);

  const scenario = SCENARIOS.find((s) => s.id === selectedScenario);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // ========== Emergency Handlers ==========

  const handleBatchGenerate = useCallback(async () => {
    if (!scenario || selectedPlatforms.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedContents([]);
    setCompletedCount(0);

    const description = customDetail
      ? `${scenario.templateDesc}\n\n补充信息：${customDetail}`
      : scenario.templateDesc;

    const results: GeneratedContent[] = [];

    for (const platform of selectedPlatforms) {
      setGeneratingPlatform(platform);
      try {
        const output: WorkflowOutputs = await runWorkflowStreaming(
          {
            topic: scenario.topic,
            description,
            style: scenario.style,
            platform,
            reference: "",
          },
          { onProgress: () => {} }
        );

        results.push({
          platform,
          content: output.result,
          auditStatus: output.audit_status,
          charCount: output.result.length,
        });
        setGeneratedContents([...results]);
        setCompletedCount((c) => c + 1);
      } catch (err) {
        results.push({
          platform,
          content: `生成失败：${err instanceof Error ? err.message : "未知错误"}`,
          auditStatus: "error",
          charCount: 0,
        });
        setGeneratedContents([...results]);
        setCompletedCount((c) => c + 1);
      }
    }

    setGeneratingPlatform(null);
    setIsGenerating(false);
  }, [scenario, selectedPlatforms, customDetail]);

  const handleCopyOne = (platform: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopySuccess(platform);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleCopyAll = () => {
    const allText = generatedContents
      .map((c) => `## ${PLATFORMS.find((p) => p.id === c.platform)?.label ?? c.platform}\n\n${c.content}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(allText);
    setCopySuccess("all");
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleDownloadAll = () => {
    const allText = generatedContents
      .map((c) => `## ${PLATFORMS.find((p) => p.id === c.platform)?.label ?? c.platform}\n\n${c.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([`# ${scenario?.label} — 应急宣传内容包\n\n${allText}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `应急宣传_${scenario?.label}_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ========== Opinion Handlers ==========

  const handleAnalyzeOpinion = useCallback(async () => {
    if (!eventDescription.trim()) return;
    setIsAnalyzing(true);
    setOpinionError(null);
    setOpinionAnalysis(null);
    setOpinionResult(null);
    setOpinionProgress([]);
    setOpinionResultTab("analysis");

    try {
      const output = await runPublicOpinionWorkflowStreaming(
        {
          event_description: eventDescription,
          event_type: eventType,
          urgency_level: urgencyLevel,
          existing_response: existingResponse || undefined,
        },
        {
          onProgress: (p: StreamProgress) => {
            setOpinionProgress((prev) => [...prev, p]);
          },
        }
      );
      setOpinionAnalysis(output.analysis);
      setOpinionResult(output.result);
    } catch (err) {
      setOpinionError(err instanceof Error ? err.message : "分析失败");
    } finally {
      setIsAnalyzing(false);
    }
  }, [eventDescription, eventType, urgencyLevel, existingResponse]);

  const handleOpinionCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setOpinionCopySuccess(key);
    setTimeout(() => setOpinionCopySuccess(null), 2000);
  };

  const handleOpinionDownload = () => {
    const content = `# 舆情处置方案\n\n## 风险分析\n\n${opinionAnalysis ?? ""}\n\n---\n\n## 应对策略\n\n${opinionResult ?? ""}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `舆情处置_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ========== Trigger Handlers ==========

  const handleAddRule = () => {
    if (!newRuleName.trim() || !newConditionValue.trim()) return;
    const rule: TriggerRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      conditionType: newConditionType,
      conditionValue: newConditionValue,
      scenarioId: newScenarioId,
      platforms: newRulePlatforms,
      enabled: true,
    };
    const updated = [...triggerRules, rule];
    saveTriggerRules(updated);
    setTriggerRules(updated);
    setShowAddRule(false);
    setNewRuleName("");
    setNewConditionValue("");
  };

  const handleToggleRule = (ruleId: string) => {
    const updated = triggerRules.map((r) =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    );
    saveTriggerRules(updated);
    setTriggerRules(updated);
  };

  const handleDeleteRule = (ruleId: string) => {
    const updated = triggerRules.filter((r) => r.id !== ruleId);
    saveTriggerRules(updated);
    setTriggerRules(updated);
  };

  const handleManualTrigger = (rule: TriggerRule) => {
    const sc = SCENARIOS.find((s) => s.id === rule.scenarioId);
    if (!sc) return;

    // Log the trigger
    const log: TriggerLog = {
      id: `log-${Date.now()}`,
      ruleId: rule.id,
      ruleName: rule.name,
      triggeredAt: new Date().toISOString(),
      scenarioLabel: sc.label,
      platforms: rule.platforms,
      status: "manual",
    };
    saveTriggerLog(log);
    setTriggerLogs(loadTriggerLogs());

    // Update rule lastTriggered
    const updatedRules = triggerRules.map((r) =>
      r.id === rule.id ? { ...r, lastTriggered: new Date().toISOString() } : r
    );
    saveTriggerRules(updatedRules);
    setTriggerRules(updatedRules);

    // Switch to emergency tab with scenario pre-selected
    setSelectedScenario(rule.scenarioId);
    setSelectedPlatforms(rule.platforms);
    setActiveTab("emergency");
  };

  const handleClearLogs = () => {
    localStorage.removeItem(TRIGGER_LOGS_KEY);
    setTriggerLogs([]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Tabs */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">应急响应</h2>
        <div className="flex gap-1 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("emergency")}
            className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm transition border-b-2 ${
              activeTab === "emergency"
                ? "border-red-600 text-red-700 bg-red-50"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            应急宣传
          </button>
          <button
            onClick={() => setActiveTab("opinion")}
            className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm transition border-b-2 ${
              activeTab === "opinion"
                ? "border-orange-600 text-orange-700 bg-orange-50"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            舆情处置
          </button>
          <button
            onClick={() => setActiveTab("trigger")}
            className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm transition border-b-2 ${
              activeTab === "trigger"
                ? "border-purple-600 text-purple-700 bg-purple-50"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <Zap className="w-4 h-4" />
            智能触发
            {triggerRules.filter((r) => r.enabled).length > 0 && (
              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                {triggerRules.filter((r) => r.enabled).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ==================== Emergency Tab ==================== */}
      {activeTab === "emergency" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel - Scenario Selection */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <AlertOctagon className="w-5 h-5 text-red-600" />
                  应急场景
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {SCENARIOS.map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedScenario(s.id)}
                        className={`p-3 rounded-lg border-2 text-left transition ${
                          selectedScenario === s.id
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1 ${
                          selectedScenario === s.id ? "text-red-600" : "text-gray-400"
                        }`} />
                        <div className="text-sm font-semibold text-gray-800">{s.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{s.description}</div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {scenario && (
              <Card className="shadow border-gray-200">
                <CardContent className="p-4 space-y-3">
                  <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-semibold text-amber-800 mb-1">预设内容方向</p>
                    <p className="text-xs text-amber-700">{scenario.templateDesc}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      补充具体情况（选填）
                    </label>
                    <textarea
                      value={customDetail}
                      onChange={(e) => setCustomDetail(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none resize-none text-sm"
                      placeholder="如：具体路段名称、事故概况、预警级别等"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      目标平台
                    </label>
                    <div className="flex gap-2">
                      {PLATFORMS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => togglePlatform(p.id)}
                          className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition ${
                            selectedPlatforms.includes(p.id)
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleBatchGenerate}
                    disabled={selectedPlatforms.length === 0 || isGenerating}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-5 h-5 animate-spin" />批量生成中 ({completedCount}/{selectedPlatforms.length})...</>
                    ) : (
                      <><Zap className="w-5 h-5" />一键生成 {selectedPlatforms.length} 个平台内容</>
                    )}
                  </button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Generated Content */}
          <div className="lg:col-span-3">
            <Card className="shadow border-gray-200 h-full flex flex-col">
              <div className="flex-1 p-6">
                {error && (
                  <div className="px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                {generatedContents.length > 0 ? (
                  <div className="space-y-4">
                    {isGenerating && (
                      <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-sm text-blue-700">
                          正在生成 {PLATFORMS.find((p) => p.id === generatingPlatform)?.label ?? ""} 内容...
                          ({completedCount}/{selectedPlatforms.length})
                        </span>
                      </div>
                    )}

                    {generatedContents.map((content) => (
                      <div key={content.platform} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-800">
                              {PLATFORMS.find((p) => p.id === content.platform)?.label ?? content.platform}
                            </span>
                            {content.auditStatus === "passed" && (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">审核通过</span>
                            )}
                            {content.auditStatus === "needs_revision" && (
                              <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">需修订</span>
                            )}
                            {content.auditStatus === "error" && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">生成失败</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {content.charCount > 0 && (
                              <span className="text-xs text-gray-500">{content.charCount}字</span>
                            )}
                            <button
                              onClick={() => handleCopyOne(content.platform, content.content)}
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              {copySuccess === content.platform ? <><Check className="w-3 h-3" />已复制</> : <><Copy className="w-3 h-3" />复制</>}
                            </button>
                          </div>
                        </div>
                        <div className="p-4 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed max-h-[300px] overflow-y-auto">
                          {content.content}
                        </div>
                      </div>
                    ))}

                    {!isGenerating && generatedContents.length > 1 && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleCopyAll}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                            copySuccess === "all"
                              ? "bg-green-50 border border-green-300 text-green-700"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {copySuccess === "all" ? <><Check className="w-4 h-4" />全部已复制</> : <><Copy className="w-4 h-4" />复制全部</>}
                        </button>
                        <button
                          onClick={handleDownloadAll}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          <Download className="w-4 h-4" />
                          下载内容包
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <AlertOctagon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">应急宣传快速响应</p>
                      <p className="text-sm mt-2">选择左侧应急场景后一键生成多平台内容</p>
                      <p className="text-xs mt-1 text-gray-300">使用已有文案生成管线，自动适配各平台格式</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ==================== Opinion Tab ==================== */}
      {activeTab === "opinion" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel - Event Input */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow border-gray-200">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  舆情事件
                </h3>

                {/* Event Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">事件类型</label>
                  <div className="grid grid-cols-2 gap-2">
                    {EVENT_TYPES.map((et) => (
                      <button
                        key={et.id}
                        onClick={() => setEventType(et.id)}
                        className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
                          eventType === et.id
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {et.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Urgency Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">紧急程度</label>
                  <div className="flex gap-2">
                    {URGENCY_LEVELS.map((ul) => (
                      <button
                        key={ul.id}
                        onClick={() => setUrgencyLevel(ul.id)}
                        className={`flex-1 py-2 rounded-lg border-2 text-sm transition ${
                          urgencyLevel === ul.id
                            ? `${ul.color} border-current font-semibold`
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium">{ul.label}</div>
                        <div className="text-xs opacity-75">{ul.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    事件描述 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none resize-none text-sm"
                    placeholder="详细描述舆情事件：发生时间、地点、事件经过、当前传播情况、涉及人员等"
                  />
                </div>

                {/* Existing Response */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    已有官方回应（选填）
                  </label>
                  <textarea
                    value={existingResponse}
                    onChange={(e) => setExistingResponse(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none resize-none text-sm"
                    placeholder="如已有初步回应，请填写"
                  />
                </div>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyzeOpinion}
                  disabled={!eventDescription.trim() || isAnalyzing}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />分析中...</>
                  ) : (
                    <><Megaphone className="w-5 h-5" />分析舆情并生成应对策略</>
                  )}
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Analysis & Strategy */}
          <div className="lg:col-span-3">
            <Card className="shadow border-gray-200 h-full flex flex-col">
              {/* Result Tabs */}
              {(opinionAnalysis || opinionResult) && (
                <div className="border-b border-gray-200 px-6 pt-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOpinionResultTab("analysis")}
                      className={`px-4 py-2 font-medium text-sm transition border-b-2 ${
                        opinionResultTab === "analysis"
                          ? "border-orange-600 text-orange-700"
                          : "border-transparent text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      风险分析
                    </button>
                    {opinionResult && (
                      <button
                        onClick={() => setOpinionResultTab("strategy")}
                        className={`px-4 py-2 font-medium text-sm transition border-b-2 ${
                          opinionResultTab === "strategy"
                            ? "border-orange-600 text-orange-700"
                            : "border-transparent text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        应对策略
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex-1 p-6">
                {opinionError && (
                  <div className="px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {opinionError}
                  </div>
                )}

                {(opinionAnalysis || opinionResult) ? (
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4 min-h-[400px] whitespace-pre-wrap text-sm text-gray-800 leading-relaxed overflow-y-auto max-h-[600px]">
                      {opinionResultTab === "analysis" ? opinionAnalysis : opinionResult}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          handleOpinionCopy(
                            opinionResultTab,
                            (opinionResultTab === "analysis" ? opinionAnalysis : opinionResult) ?? ""
                          )
                        }
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                          opinionCopySuccess === opinionResultTab
                            ? "bg-green-50 border border-green-300 text-green-700"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {opinionCopySuccess === opinionResultTab ? <><Check className="w-4 h-4" />已复制</> : <><Copy className="w-4 h-4" />复制</>}
                      </button>
                      <button
                        onClick={handleOpinionDownload}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        <Download className="w-4 h-4" />
                        下载完整方案
                      </button>
                    </div>
                  </div>
                ) : isAnalyzing && opinionProgress.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                      <span className="text-sm font-medium text-orange-700">正在分析舆情并生成应对策略...</span>
                    </div>
                    <div className="space-y-2">
                      {opinionProgress
                        .filter((p, i, arr) => arr.findIndex((x) => x.nodeTitle === p.nodeTitle) === i || p === arr[arr.length - 1])
                        .map((step) => (
                          <div
                            key={`${step.nodeTitle}-${step.event}`}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm ${
                              step.status === "running"
                                ? "bg-orange-50 text-orange-700"
                                : step.status === "failed"
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                          >
                            {step.status === "running" && <Loader2 className="w-4 h-4 animate-spin text-orange-600" />}
                            {step.status === "succeeded" && <Check className="w-4 h-4 text-green-600" />}
                            <span className="font-medium">{step.nodeTitle}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">舆情处置辅助</p>
                      <p className="text-sm mt-2">描述舆情事件，AI 将分析风险并生成应对策略</p>
                      <p className="text-xs mt-1 text-gray-300">包含风险评估、核心口径、分平台回应模板、行动方案</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ==================== Trigger Tab ==================== */}
      {activeTab === "trigger" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel - Rules Management */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="shadow border-gray-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    触发规则配置
                  </h3>
                  <button
                    onClick={() => setShowAddRule(!showAddRule)}
                    className="px-3 py-1.5 bg-purple-700 text-white text-sm rounded-lg hover:bg-purple-800 transition"
                  >
                    + 新增规则
                  </button>
                </div>

                {/* Add Rule Form */}
                {showAddRule && (
                  <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">规则名称</label>
                      <input
                        value={newRuleName}
                        onChange={(e) => setNewRuleName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        placeholder="例如：暴雪预警自动推送"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">触发条件类型</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CONDITION_TYPES.map((ct) => {
                          const Icon = ct.icon;
                          return (
                            <button
                              key={ct.id}
                              onClick={() => setNewConditionType(ct.id as TriggerRule["conditionType"])}
                              className={`flex items-center gap-2 p-2.5 rounded-lg border-2 text-left transition text-sm ${
                                newConditionType === ct.id
                                  ? "border-purple-500 bg-white"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <Icon className="w-4 h-4 text-purple-600 flex-shrink-0" />
                              <div>
                                <div className="font-medium text-gray-800">{ct.label}</div>
                                <div className="text-xs text-gray-500">{ct.examples}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">触发条件值</label>
                      <input
                        value={newConditionValue}
                        onChange={(e) => setNewConditionValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        placeholder={
                          newConditionType === "weather" ? "例如：暴雪橙色预警" :
                          newConditionType === "accident" ? "例如：死亡3人以上" :
                          newConditionType === "holiday" ? "例如：春节" : "例如：每周五 17:00"
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">关联应急场景</label>
                      <select
                        value={newScenarioId}
                        onChange={(e) => setNewScenarioId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      >
                        {SCENARIOS.map((s) => (
                          <option key={s.id} value={s.id}>{s.label} — {s.description}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">推送平台</label>
                      <div className="flex gap-2">
                        {PLATFORMS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() =>
                              setNewRulePlatforms((prev) =>
                                prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg border-2 text-sm transition ${
                              newRulePlatforms.includes(p.id)
                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                : "border-gray-200 text-gray-600"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleAddRule}
                        disabled={!newRuleName.trim() || !newConditionValue.trim()}
                        className="px-4 py-2 bg-purple-700 text-white text-sm rounded-lg hover:bg-purple-800 transition disabled:opacity-50"
                      >
                        保存规则
                      </button>
                      <button
                        onClick={() => setShowAddRule(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}

                {/* Rules List */}
                {triggerRules.length > 0 ? (
                  <div className="space-y-3">
                    {triggerRules.map((rule) => {
                      const sc = SCENARIOS.find((s) => s.id === rule.scenarioId);
                      const ct = CONDITION_TYPES.find((c) => c.id === rule.conditionType);
                      const CtIcon = ct?.icon ?? Settings;
                      return (
                        <div
                          key={rule.id}
                          className={`p-4 rounded-xl border-2 transition ${
                            rule.enabled ? "border-purple-200 bg-white" : "border-gray-200 bg-gray-50 opacity-60"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${rule.enabled ? "bg-purple-100" : "bg-gray-100"}`}>
                                <CtIcon className={`w-4 h-4 ${rule.enabled ? "text-purple-600" : "text-gray-400"}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-800 text-sm">{rule.name}</h4>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    rule.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                  }`}>
                                    {rule.enabled ? "已启用" : "已禁用"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-1">
                                  条件: {ct?.label} — {rule.conditionValue}
                                </p>
                                <p className="text-xs text-gray-500">
                                  场景: {sc?.label ?? "未知"} | 平台: {rule.platforms.map((pid) => PLATFORMS.find((p) => p.id === pid)?.label).join(", ")}
                                </p>
                                {rule.lastTriggered && (
                                  <p className="text-xs text-purple-500 mt-1">
                                    上次触发: {new Date(rule.lastTriggered).toLocaleString("zh-CN")}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 ml-2">
                              <button
                                onClick={() => handleManualTrigger(rule)}
                                className="p-1.5 hover:bg-purple-50 rounded-lg transition"
                                title="手动触发"
                              >
                                <Play className="w-4 h-4 text-purple-600" />
                              </button>
                              <button
                                onClick={() => handleToggleRule(rule.id)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                                title={rule.enabled ? "禁用" : "启用"}
                              >
                                <Power className={`w-4 h-4 ${rule.enabled ? "text-green-600" : "text-gray-400"}`} />
                              </button>
                              <button
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition"
                                title="删除"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">暂无触发规则</p>
                    <p className="text-xs mt-1">配置触发规则后，系统将在满足条件时自动提醒并启动应急宣传</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Trigger Logs */}
          <div className="lg:col-span-2">
            <Card className="shadow border-gray-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-600" />
                    触发日志
                  </h3>
                  {triggerLogs.length > 0 && (
                    <button
                      onClick={handleClearLogs}
                      className="text-xs text-gray-400 hover:text-red-500 transition"
                    >
                      清空
                    </button>
                  )}
                </div>

                {triggerLogs.length > 0 ? (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {triggerLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-800">{log.ruleName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            log.status === "auto"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {log.status === "auto" ? "自动触发" : "手动触发"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-0.5">
                          <p className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(log.triggeredAt).toLocaleString("zh-CN")}
                          </p>
                          <p>场景: {log.scenarioLabel} | 平台: {log.platforms.map((pid) => PLATFORMS.find((p) => p.id === pid)?.label).join(", ")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暂无触发记录</p>
                  </div>
                )}

                {/* Info Box */}
                <div className="mt-4 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                  <p className="text-xs text-purple-700 font-medium mb-1">自动触发说明</p>
                  <p className="text-xs text-purple-600">
                    当前版本支持手动触发。接入气象局API/交管指挥平台后，系统将根据配置的规则自动检测触发条件并推送应急宣传内容。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
