import { useState, useCallback } from "react";
import {
  Crosshair,
  MapPin,
  Users,
  AlertTriangle,
  Loader2,
  Copy,
  Download,
  Check,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  runPrecisionWorkflowStreaming,
  type StreamProgress,
} from "@/services/dify";
import accidentData from "@/data/accident-data/2025-summary.json";

type TargetType = "area" | "group" | "violation";

interface TargetOption {
  name: string;
  detail: string;
  riskLevel: string;
  stats: string;
}

function getTargetOptions(type: TargetType): TargetOption[] {
  if (type === "area") {
    return accidentData.highRiskAreas.map((a) => ({
      name: a.location,
      detail: `${a.type} | 主因：${a.mainCause}`,
      riskLevel: a.riskLevel,
      stats: `${a.accidents}起事故 / ${a.fatalities}人死亡`,
    }));
  }
  if (type === "group") {
    return accidentData.highRiskGroups.map((g) => ({
      name: g.group,
      detail: `主要违法：${g.mainViolation}`,
      riskLevel: g.riskLevel,
      stats: `涉及${g.involvedAccidents}起事故 (${(g.percentage * 100).toFixed(1)}%)`,
    }));
  }
  return accidentData.byViolationType.slice(0, 6).map((v) => ({
    name: v.type,
    detail: `占比 ${(v.percentage * 100).toFixed(1)}%`,
    riskLevel: v.percentage > 0.1 ? "高" : v.percentage > 0.05 ? "中" : "低",
    stats: `${v.count}起`,
  }));
}

const TARGET_TYPE_MAP: Record<TargetType, string> = {
  area: "高风险路段",
  group: "高风险人群",
  violation: "高发违法类型",
};

const OUTPUT_FORMAT_OPTIONS = [
  { id: "宣传指令包", label: "宣传指令包", desc: "含内容方向+形式+渠道的完整指令" },
  { id: "定制化方案", label: "定制化方案", desc: "详细的宣传执行方案" },
  { id: "警示材料", label: "警示材料", desc: "可直接使用的警示宣传素材" },
];

export function PrecisionPage() {
  const [targetType, setTargetType] = useState<TargetType>("area");
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState("宣传指令包");

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<StreamProgress[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

  const targets = getTargetOptions(targetType);

  const handleGenerate = useCallback(async () => {
    if (!selectedTarget) return;
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setProgress([]);

    try {
      const output = await runPrecisionWorkflowStreaming(
        {
          accident_data: JSON.stringify(accidentData),
          target_type: TARGET_TYPE_MAP[targetType],
          target_name: selectedTarget,
          output_format: outputFormat,
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
  }, [targetType, selectedTarget, outputFormat]);

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
      a.download = `精准宣传_${selectedTarget}_${new Date().toISOString().slice(0, 10)}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [result, selectedTarget]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">精准靶向宣传</h2>
        <p className="text-sm text-gray-600">
          基于 {accidentData.period} 事故数据，识别高风险目标，生成定制化宣传方案
        </p>
      </div>

      {/* Data Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 mb-1">事故总数</div>
            <div className="text-xl font-bold text-gray-800">{accidentData.overview.totalAccidents.toLocaleString()}</div>
            <div className={`text-xs mt-1 ${accidentData.overview.yoyAccidentChange < 0 ? "text-green-600" : "text-red-600"}`}>
              同比 {accidentData.overview.yoyAccidentChange > 0 ? "+" : ""}{(accidentData.overview.yoyAccidentChange * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 mb-1">死亡人数</div>
            <div className="text-xl font-bold text-red-700">{accidentData.overview.totalFatalities}</div>
            <div className={`text-xs mt-1 ${accidentData.overview.yoyFatalityChange < 0 ? "text-green-600" : "text-red-600"}`}>
              同比 {accidentData.overview.yoyFatalityChange > 0 ? "+" : ""}{(accidentData.overview.yoyFatalityChange * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 mb-1">高风险路段</div>
            <div className="text-xl font-bold text-orange-600">{accidentData.highRiskAreas.length}</div>
            <div className="text-xs mt-1 text-gray-400">已识别</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 mb-1">高风险人群</div>
            <div className="text-xl font-bold text-orange-600">{accidentData.highRiskGroups.length}</div>
            <div className="text-xs mt-1 text-gray-400">已识别</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Target Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Target Type Tabs */}
          <Card className="shadow border-gray-200">
            <CardContent className="p-4">
              <div className="flex gap-1 mb-4">
                {(["area", "group", "violation"] as TargetType[]).map((t) => {
                  const icons = { area: MapPin, group: Users, violation: AlertTriangle };
                  const labels = { area: "高风险路段", group: "高风险人群", violation: "高发违法" };
                  const Icon = icons[t];
                  return (
                    <button
                      key={t}
                      onClick={() => { setTargetType(t); setSelectedTarget(null); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${
                        targetType === t
                          ? "bg-blue-50 text-blue-700 border-2 border-blue-700"
                          : "border-2 border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {labels[t]}
                    </button>
                  );
                })}
              </div>

              {/* Target List */}
              <div className="space-y-2">
                {targets.map((target) => (
                  <button
                    key={target.name}
                    onClick={() => setSelectedTarget(target.name)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition ${
                      selectedTarget === target.name
                        ? "border-blue-700 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800">{target.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            target.riskLevel === "高" ? "bg-red-100 text-red-700" :
                            target.riskLevel === "中" ? "bg-orange-100 text-orange-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {target.riskLevel}风险
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{target.detail}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{target.stats}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 mt-1 transition ${
                        selectedTarget === target.name ? "text-blue-700" : "text-gray-300"
                      }`} />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Output Format */}
          <Card className="shadow border-gray-200">
            <CardContent className="p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">输出格式</label>
              <div className="space-y-2">
                {OUTPUT_FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setOutputFormat(opt.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg border-2 transition ${
                      outputFormat === opt.id
                        ? "border-blue-700 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!selectedTarget || isGenerating}
                className="w-full mt-4 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />生成中...</>
                ) : (
                  <><Crosshair className="w-5 h-5" />生成精准宣传方案</>
                )}
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Output */}
        <div className="lg:col-span-3">
          <Card className="shadow border-gray-200 h-full flex flex-col">
            <div className="flex-1 p-6">
              {error && (
                <div className="px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {result ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crosshair className="w-5 h-5 text-blue-700" />
                    <span className="font-bold text-gray-800">
                      {selectedTarget} — {outputFormat}
                    </span>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 min-h-[400px] whitespace-pre-wrap text-sm text-gray-800 leading-relaxed overflow-y-auto max-h-[600px]">
                    {result}
                  </div>
                  <div className="flex gap-3">
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
                      下载 Markdown
                    </button>
                  </div>
                </div>
              ) : isGenerating && progress.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">正在分析并生成精准宣传方案...</span>
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
                    <Crosshair className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">选择靶向目标</p>
                    <p className="text-sm mt-2">从左侧选择高风险路段、人群或违法类型</p>
                    <p className="text-xs mt-1 text-gray-300">AI 将基于事故数据生成精准宣传方案</p>
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
