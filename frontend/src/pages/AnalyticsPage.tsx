import { useState, useCallback, useEffect, useRef } from "react";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Users,
  Loader2,
  Copy,
  Download,
  Check,
  Sparkles,
  Upload,
  FileSpreadsheet,
  X,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  runAnalyticsWorkflowStreaming,
  type StreamProgress,
} from "@/services/dify";

import defaultWechatData from "@/data/analytics/wechat-202601.json";
import defaultWeiboData from "@/data/analytics/weibo-202601.json";
import defaultDouyinData from "@/data/analytics/douyin-202601.json";

const FOCUS_OPTIONS = [
  { id: "overall", label: "综合分析" },
  { id: "content", label: "内容表现" },
  { id: "audience", label: "受众分析" },
  { id: "trend", label: "趋势洞察" },
];

const IMPORTED_DATA_KEY = "analyticsImportedData";

interface CsvRow {
  [key: string]: string;
}

interface ImportedPlatformData {
  platform: string;
  importedAt: string;
  rows: CsvRow[];
  summary: {
    totalPosts: number;
    totalReads?: number;
    totalViews?: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    newFollowers: number;
    avgInteractionRate: number;
  };
  topContent: { title: string; reads?: number; views?: number; likes: number; topic: string }[];
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: CsvRow = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });
}

function csvToSummary(rows: CsvRow[]): ImportedPlatformData["summary"] {
  let totalPosts = rows.length;
  let totalViews = 0;
  let totalLikes = 0;
  let totalShares = 0;
  let totalComments = 0;
  let newFollowers = 0;

  for (const row of rows) {
    const views = Number(row["阅读量"] || row["播放量"] || row["reads"] || row["views"] || 0);
    const likes = Number(row["点赞"] || row["likes"] || 0);
    const shares = Number(row["转发"] || row["shares"] || 0);
    const comments = Number(row["评论"] || row["comments"] || 0);
    const followers = Number(row["新增粉丝"] || row["new_followers"] || 0);
    totalViews += views;
    totalLikes += likes;
    totalShares += shares;
    totalComments += comments;
    newFollowers += followers;
  }

  const totalInteractions = totalLikes + totalShares + totalComments;
  const avgInteractionRate = totalViews > 0 ? totalInteractions / totalViews : 0;

  return {
    totalPosts,
    totalViews,
    totalLikes,
    totalShares,
    totalComments,
    newFollowers,
    avgInteractionRate,
  };
}

function csvToTopContent(rows: CsvRow[]): ImportedPlatformData["topContent"] {
  return rows
    .map((row) => ({
      title: row["标题"] || row["title"] || "未知内容",
      views: Number(row["阅读量"] || row["播放量"] || row["reads"] || row["views"] || 0),
      likes: Number(row["点赞"] || row["likes"] || 0),
      topic: row["主题"] || row["topic"] || "其他",
    }))
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 5);
}

function loadImportedData(): ImportedPlatformData[] {
  try {
    return JSON.parse(localStorage.getItem(IMPORTED_DATA_KEY) || "[]");
  } catch {
    return [];
  }
}

function formatNumber(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  if (n >= 1000) return (n / 1000).toFixed(1) + "千";
  return n.toString();
}

function PlatformCard({
  platform,
  color,
  data,
}: {
  platform: string;
  color: string;
  data: {
    totalPosts: number;
    totalReads?: number;
    totalViews?: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    newFollowers: number;
    avgInteractionRate: number;
  };
}) {
  const views = data.totalReads ?? data.totalViews ?? 0;
  const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
    green: { bg: "bg-green-50", text: "text-green-700", ring: "ring-green-200" },
    blue: { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200" },
    pink: { bg: "bg-pink-50", text: "text-pink-700", ring: "ring-pink-200" },
  };
  const c = colorMap[color] ?? colorMap.blue;

  return (
    <Card className={`shadow border-gray-200 ring-1 ${c.ring}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-bold ${c.text}`}>{platform}</h3>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.bg} ${c.text}`}>
            {data.totalPosts} 篇
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-lg font-bold text-gray-800">{formatNumber(views)}</p>
              <p className="text-xs text-gray-500">阅读/播放</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-lg font-bold text-gray-800">{formatNumber(data.totalLikes)}</p>
              <p className="text-xs text-gray-500">点赞</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-lg font-bold text-gray-800">{formatNumber(data.totalShares)}</p>
              <p className="text-xs text-gray-500">转发</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-lg font-bold text-gray-800">{formatNumber(data.totalComments)}</p>
              <p className="text-xs text-gray-500">评论</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">新增粉丝 <strong className="text-gray-800">{formatNumber(data.newFollowers)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">互动率 <strong className="text-gray-800">{(data.avgInteractionRate * 100).toFixed(1)}%</strong></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsPage() {
  const [analysisMonth, setAnalysisMonth] = useState("2026-01");
  const [focusArea, setFocusArea] = useState("overall");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<StreamProgress[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [importedData, setImportedData] = useState<ImportedPlatformData[]>(loadImportedData);
  const [dataSource, setDataSource] = useState<"default" | "imported">(
    () => loadImportedData().length > 0 ? "imported" : "default"
  );
  const [showImport, setShowImport] = useState(false);
  const [importPlatform, setImportPlatform] = useState("wechat");
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use imported data or default data for platform cards
  const wechatData = dataSource === "imported"
    ? importedData.find((d) => d.platform === "wechat") ?? null
    : null;
  const weiboData = dataSource === "imported"
    ? importedData.find((d) => d.platform === "weibo") ?? null
    : null;
  const douyinData = dataSource === "imported"
    ? importedData.find((d) => d.platform === "douyin") ?? null
    : null;

  const wechatSummary = wechatData?.summary ?? defaultWechatData.summary;
  const weiboSummary = weiboData?.summary ?? defaultWeiboData.summary;
  const douyinSummary = douyinData?.summary ?? defaultDouyinData.summary;

  const wechatTop = wechatData?.topContent ?? defaultWechatData.topContent;
  const weiboTop = weiboData?.topContent ?? defaultWeiboData.topContent;
  const douyinTop = douyinData?.topContent ?? defaultDouyinData.topContent;

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const rows = parseCsv(text);
        if (rows.length === 0) {
          setImportError("CSV 文件为空或格式不正确");
          return;
        }

        const newEntry: ImportedPlatformData = {
          platform: importPlatform,
          importedAt: new Date().toISOString(),
          rows,
          summary: csvToSummary(rows),
          topContent: csvToTopContent(rows),
        };

        const updated = [
          ...importedData.filter((d) => d.platform !== importPlatform),
          newEntry,
        ];
        localStorage.setItem(IMPORTED_DATA_KEY, JSON.stringify(updated));
        setImportedData(updated);
        setDataSource("imported");
        setShowImport(false);
      } catch {
        setImportError("CSV 解析失败，请检查文件格式");
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [importPlatform, importedData]);

  const clearImportedData = useCallback(() => {
    localStorage.removeItem(IMPORTED_DATA_KEY);
    setImportedData([]);
    setDataSource("default");
  }, []);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setProgress([]);

    try {
      const wc = dataSource === "imported" && wechatData
        ? JSON.stringify({ summary: wechatData.summary, topContent: wechatData.topContent })
        : JSON.stringify(defaultWechatData);
      const wb = dataSource === "imported" && weiboData
        ? JSON.stringify({ summary: weiboData.summary, topContent: weiboData.topContent })
        : JSON.stringify(defaultWeiboData);
      const dy = dataSource === "imported" && douyinData
        ? JSON.stringify({ summary: douyinData.summary, topContent: douyinData.topContent })
        : JSON.stringify(defaultDouyinData);

      const output = await runAnalyticsWorkflowStreaming(
        {
          wechat_data: wc,
          weibo_data: wb,
          douyin_data: dy,
          analysis_month: analysisMonth,
          focus_area: focusArea,
        },
        {
          onProgress: (p: StreamProgress) => {
            setProgress((prev) => [...prev, p]);
          },
        }
      );
      setResult(output.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析报告生成失败");
    } finally {
      setIsGenerating(false);
    }
  }, [analysisMonth, focusArea, dataSource, wechatData, weiboData, douyinData]);

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
      a.download = `效果分析报告_${analysisMonth}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [result, analysisMonth]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">效果分析</h2>
          <p className="text-sm text-gray-600">
            多平台数据概览 + AI 智能分析报告
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Data Source Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDataSource("default")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                dataSource === "default" ? "bg-white shadow text-gray-800" : "text-gray-500"
              }`}
            >
              示例数据
            </button>
            <button
              onClick={() => importedData.length > 0 && setDataSource("imported")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                dataSource === "imported" ? "bg-white shadow text-gray-800" : "text-gray-500"
              } ${importedData.length === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              导入数据
              {importedData.length > 0 && (
                <span className="ml-1 px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                  {importedData.length}
                </span>
              )}
            </button>
          </div>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            导入CSV
          </button>
        </div>
      </div>

      {/* Import Dialog */}
      {showImport && (
        <Card className="shadow border-blue-200 bg-blue-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-700" />
                导入平台数据 (CSV)
              </h4>
              <button onClick={() => { setShowImport(false); setImportError(null); }} className="p-1 hover:bg-blue-100 rounded">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">选择平台</label>
                <div className="flex gap-2">
                  {[
                    { id: "wechat", label: "微信公众号", color: "green" },
                    { id: "weibo", label: "微博", color: "blue" },
                    { id: "douyin", label: "抖音", color: "pink" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setImportPlatform(p.id)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
                        importPlatform === p.id
                          ? "border-blue-700 bg-white text-blue-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">上传 CSV 文件</label>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileImport}
                    className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-700 file:text-white hover:file:bg-blue-800 file:cursor-pointer"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  CSV 格式要求: 包含列头 (标题, 阅读量/播放量, 点赞, 转发, 评论, 新增粉丝, 主题)
                </p>
              </div>

              {importError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {importError}
                </div>
              )}

              {importedData.length > 0 && (
                <div className="pt-3 border-t border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">已导入数据</span>
                    <button onClick={clearImportedData} className="text-xs text-red-500 hover:text-red-700">
                      清除全部
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {importedData.map((d) => (
                      <Badge key={d.platform} className="bg-white border-gray-200 text-gray-700 text-xs">
                        {d.platform === "wechat" ? "微信" : d.platform === "weibo" ? "微博" : "抖音"}
                        <span className="ml-1 text-gray-400">
                          {d.summary.totalPosts}篇 · {new Date(d.importedAt).toLocaleDateString("zh-CN")}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlatformCard
          platform="微信公众号"
          color="green"
          data={wechatSummary}
        />
        <PlatformCard
          platform="微博"
          color="blue"
          data={weiboSummary}
        />
        <PlatformCard
          platform="抖音"
          color="pink"
          data={douyinSummary}
        />
      </div>

      {/* Top Content Across Platforms */}
      <Card className="shadow border-gray-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-700" />
            热门内容 TOP 5
          </h3>
          <div className="divide-y divide-gray-100">
            {[...wechatTop, ...weiboTop, ...douyinTop]
              .sort((a, b) => {
                const aViews = "reads" in a ? a.reads : ("views" in a ? (a as { views: number }).views : 0);
                const bViews = "reads" in b ? b.reads : ("views" in b ? (b as { views: number }).views : 0);
                return bViews - aViews;
              })
              .slice(0, 5)
              .map((item, idx) => {
                const views = "reads" in item ? item.reads : ("views" in item ? (item as { views: number }).views : 0);
                return (
                  <div key={idx} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? "bg-yellow-100 text-yellow-700" :
                        idx === 1 ? "bg-gray-100 text-gray-600" :
                        idx === 2 ? "bg-orange-100 text-orange-600" :
                        "bg-gray-50 text-gray-500"
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-sm text-gray-800 truncate">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-shrink-0 ml-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {formatNumber(views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        {formatNumber(item.likes)}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{item.topic}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Report Generation */}
      <Card className="shadow border-gray-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-700" />
            AI 分析报告
          </h3>

          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                分析月份
              </label>
              <input
                type="month"
                value={analysisMonth}
                onChange={(e) => setAnalysisMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                分析重点
              </label>
              <div className="flex gap-2">
                {FOCUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFocusArea(opt.id)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition ${
                      focusArea === opt.id
                        ? "border-blue-700 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white font-semibold px-6 py-2 rounded-lg transition flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" />
                  生成分析报告
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {result ? (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-5 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed max-h-[600px] overflow-y-auto">
                {result}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    copySuccess
                      ? "bg-green-50 border border-green-300 text-green-700"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {copySuccess ? <><Check className="w-4 h-4" />已复制</> : <><Copy className="w-4 h-4" />复制</>}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
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
                <span className="text-sm font-medium text-blue-700">正在生成分析报告...</span>
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
            <div className="text-center py-12 text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">选择月份和分析重点后，点击生成分析报告</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
