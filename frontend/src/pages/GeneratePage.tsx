import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Copy,
  RefreshCw,
  Save,
  Send,
  BookOpen,
  MessageSquare,
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { styleOptions, platformOptions } from "@/data/mock";
import {
  runWorkflowStreaming,
  runPosterWorkflowStreaming,
  runVideoScriptWorkflowStreaming,
  runImageGenWorkflowStreaming,
  type WorkflowOutputs,
  type PosterOutputs,
  type VideoScriptOutputs,
  type ImageGenOutputs,
  type StreamProgress,
} from "@/services/dify";
import {
  ContentTypeSelector,
  type ContentType,
} from "@/components/generate/ContentTypeSelector";
import { PosterResult } from "@/components/generate/PosterResult";
import { VideoScriptResult } from "@/components/generate/VideoScriptResult";

// Nodes hidden from progress UI (infrastructure nodes)
const HIDDEN_NODES = new Set(["开始", "审核通过判断", "合并结果", "输出"]);

const DURATION_OPTIONS = [
  { id: "15s", label: "15秒" },
  { id: "30s", label: "30秒" },
  { id: "60s", label: "60秒" },
];

const VIDEO_PLATFORMS = [
  { id: "douyin", label: "抖音" },
  { id: "kuaishou", label: "快手" },
];

const IMAGE_STYLES = [
  { id: "realistic", label: "写实摄影" },
  { id: "illustration", label: "插画风格" },
  { id: "flat", label: "扁平设计" },
  { id: "chinese_style", label: "国风水墨" },
];

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1 正方形" },
  { id: "16:9", label: "16:9 横版" },
  { id: "9:16", label: "9:16 竖版" },
  { id: "4:3", label: "4:3 传统" },
];

function ProgressStepList({ steps }: { steps: StreamProgress[] }) {
  const seen = new Map<string, StreamProgress>();
  for (const s of steps) {
    seen.set(s.nodeTitle, s);
  }
  const dedupSteps = [...seen.values()];

  return (
    <div className="space-y-2">
      {dedupSteps.map((step) => (
        <div
          key={step.nodeTitle}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
            step.status === "running"
              ? "bg-blue-50 text-blue-700"
              : step.status === "failed"
                ? "text-red-600"
                : "text-gray-600"
          }`}
        >
          {step.status === "running" && (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
          )}
          {step.status === "succeeded" && (
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          )}
          {step.status === "failed" && (
            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span className="font-medium flex-1">{step.nodeTitle}</span>
          {step.elapsedTime != null && (
            <span className="text-xs text-gray-400">
              {step.elapsedTime.toFixed(1)}s
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function GeneratePage() {
  const [contentType, setContentType] = useState<ContentType>("copywriting");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["weibo"]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Copywriting results
  const [results, setResults] = useState<Record<string, WorkflowOutputs>>({});
  const [activeTab, setActiveTab] = useState("weibo");
  const [error, setError] = useState<string | null>(null);
  const [showAuditReport, setShowAuditReport] = useState(false);
  const [progress, setProgress] = useState<Record<string, StreamProgress[]>>({});
  const [copySuccess, setCopySuccess] = useState(false);

  // Poster results
  const [posterResult, setPosterResult] = useState<PosterOutputs | null>(null);
  const [posterProgress, setPosterProgress] = useState<StreamProgress[]>([]);
  const [numPlans, setNumPlans] = useState(2);

  // Video script results
  const [videoResult, setVideoResult] = useState<VideoScriptOutputs | null>(null);
  const [videoProgress, setVideoProgress] = useState<StreamProgress[]>([]);
  const [duration, setDuration] = useState("30s");
  const [videoPlatform, setVideoPlatform] = useState("douyin");

  // Image generation results
  const [imageResult, setImageResult] = useState<ImageGenOutputs | null>(null);
  const [imageProgress, setImageProgress] = useState<StreamProgress[]>([]);
  const [imageStyle, setImageStyle] = useState("realistic");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [sceneDescription, setSceneDescription] = useState("");
  const [imageCopyTarget, setImageCopyTarget] = useState<string | null>(null);

  // Auto-expand audit report when needs_revision
  const currentResult = results[activeTab];
  useEffect(() => {
    if (currentResult?.audit_status === "needs_revision") {
      setShowAuditReport(true);
    }
  }, [currentResult?.audit_status]);

  const handleGenerateCopywriting = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setResults({});
    setProgress({});
    setShowAuditReport(false);

    const style = selectedStyles[0] ?? "formal";

    const promises = selectedPlatforms.map((platformId) =>
      runWorkflowStreaming(
        { topic, description, style, platform: platformId, reference: "" },
        {
          onProgress: (p) => {
            if (HIDDEN_NODES.has(p.nodeTitle)) return;
            setProgress((prev) => ({
              ...prev,
              [platformId]: [...(prev[platformId] ?? []), p],
            }));
          },
        }
      ).then((outputs) => ({ platformId, outputs }))
    );

    const settled = await Promise.allSettled(promises);
    const nextResults: Record<string, WorkflowOutputs> = {};
    const errors: string[] = [];

    for (const item of settled) {
      if (item.status === "fulfilled") {
        nextResults[item.value.platformId] = item.value.outputs;
      } else {
        errors.push(item.reason?.message ?? "未知错误");
      }
    }

    setResults(nextResults);
    if (errors.length > 0) setError(errors.join("；"));
    if (!nextResults[activeTab] && Object.keys(nextResults).length > 0) {
      setActiveTab(Object.keys(nextResults)[0]);
    }
    setIsGenerating(false);
  }, [topic, description, selectedStyles, selectedPlatforms, activeTab]);

  const handleGeneratePoster = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setPosterResult(null);
    setPosterProgress([]);

    try {
      const output = await runPosterWorkflowStreaming(
        {
          topic,
          description,
          style: selectedStyles[0] ?? "formal",
          num_plans: numPlans,
        },
        {
          onProgress: (p) => {
            if (HIDDEN_NODES.has(p.nodeTitle)) return;
            setPosterProgress((prev) => [...prev, p]);
          },
        }
      );
      setPosterResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setIsGenerating(false);
    }
  }, [topic, description, selectedStyles, numPlans]);

  const handleGenerateVideoScript = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setVideoResult(null);
    setVideoProgress([]);

    try {
      const output = await runVideoScriptWorkflowStreaming(
        {
          topic,
          description,
          style: selectedStyles[0] ?? "formal",
          duration,
          platform: videoPlatform,
        },
        {
          onProgress: (p) => {
            if (HIDDEN_NODES.has(p.nodeTitle)) return;
            setVideoProgress((prev) => [...prev, p]);
          },
        }
      );
      setVideoResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setIsGenerating(false);
    }
  }, [topic, description, selectedStyles, duration, videoPlatform]);

  const handleGenerateImage = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setImageResult(null);
    setImageProgress([]);

    try {
      const output = await runImageGenWorkflowStreaming(
        {
          topic,
          style: imageStyle,
          scene_description: sceneDescription || description,
          aspect_ratio: aspectRatio,
        },
        {
          onProgress: (p) => {
            if (HIDDEN_NODES.has(p.nodeTitle)) return;
            setImageProgress((prev) => [...prev, p]);
          },
        }
      );
      setImageResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setIsGenerating(false);
    }
  }, [topic, description, imageStyle, sceneDescription, aspectRatio]);

  const handleGenerate = useCallback(() => {
    if (contentType === "copywriting") return handleGenerateCopywriting();
    if (contentType === "poster") return handleGeneratePoster();
    if (contentType === "image_gen") return handleGenerateImage();
    return handleGenerateVideoScript();
  }, [contentType, handleGenerateCopywriting, handleGeneratePoster, handleGenerateVideoScript, handleGenerateImage]);

  const handleCopy = useCallback(() => {
    let content = "";
    if (contentType === "copywriting") {
      content = results[activeTab]?.result ?? "";
    } else if (contentType === "poster") {
      content = posterResult?.result ?? "";
    } else if (contentType === "image_gen") {
      content = imageCopyTarget ?? imageResult?.result ?? "";
    } else {
      content = videoResult?.result ?? "";
    }
    navigator.clipboard.writeText(content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }, [contentType, results, activeTab, posterResult, videoResult, imageResult, imageCopyTarget]);

  const toggleStyle = (styleId: string) => {
    setSelectedStyles((prev) =>
      prev.includes(styleId) ? prev.filter((id) => id !== styleId) : [...prev, styleId]
    );
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId]
    );
  };

  const displayContent = currentResult?.result ?? "";
  const currentProgress = progress[activeTab];
  const tabIsGenerating = isGenerating && !results[activeTab] && !!currentProgress?.length;

  const canGenerate = topic && !isGenerating && (
    contentType !== "copywriting" || selectedPlatforms.length > 0
  );

  const generateLabel =
    contentType === "copywriting" ? "生成文案" :
    contentType === "poster" ? "生成海报方案" :
    contentType === "image_gen" ? "生成配图提示词" : "生成视频脚本";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">AI 内容生成</h2>
          <p className="text-sm text-gray-600">
            智能生成多平台适配的交通安全宣传内容
          </p>
        </div>
      </div>

      {/* Content Type Selector */}
      <ContentTypeSelector value={contentType} onChange={setContentType} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Input */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-700" />
                生成参数
              </h3>

              {/* Topic Input */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  主题关键词 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="例如：春节返程高速安全"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  补充描述（选填）
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="补充说明重点、目标受众等"
                />
              </div>

              {/* Style Selection */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  风格
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {styleOptions.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => toggleStyle(style.id)}
                      className={`px-4 py-2 rounded-lg border-2 transition text-sm font-medium ${
                        selectedStyles.includes(style.id)
                          ? "border-blue-700 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <span className="mr-1">{style.icon}</span>
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Selection — Copywriting only */}
              {contentType === "copywriting" && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    目标平台
                  </label>
                  <div className="space-y-2">
                    {platformOptions.map((platform) => (
                      <label
                        key={platform.id}
                        className="flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition hover:bg-gray-50"
                        style={{
                          borderColor: selectedPlatforms.includes(platform.id) ? "#1e40af" : "#e5e7eb",
                          backgroundColor: selectedPlatforms.includes(platform.id) ? "#eff6ff" : "white",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedPlatforms.includes(platform.id)}
                            onChange={() => togglePlatform(platform.id)}
                            className="w-4 h-4 text-blue-700 rounded"
                          />
                          <span className="font-medium text-gray-700">{platform.label}</span>
                        </div>
                        <span className="text-xs text-gray-500">{platform.limit}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Poster: Number of plans */}
              {contentType === "poster" && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    方案数量
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((n) => (
                      <button
                        key={n}
                        onClick={() => setNumPlans(n)}
                        className={`flex-1 py-2 rounded-lg border-2 transition text-sm font-medium ${
                          numPlans === n
                            ? "border-blue-700 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {n} 个方案
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Script: Duration + Platform */}
              {contentType === "video_script" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      视频时长
                    </label>
                    <div className="flex gap-2">
                      {DURATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setDuration(opt.id)}
                          className={`flex-1 py-2 rounded-lg border-2 transition text-sm font-medium ${
                            duration === opt.id
                              ? "border-blue-700 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      目标平台
                    </label>
                    <div className="flex gap-2">
                      {VIDEO_PLATFORMS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setVideoPlatform(p.id)}
                          className={`flex-1 py-2 rounded-lg border-2 transition text-sm font-medium ${
                            videoPlatform === p.id
                              ? "border-blue-700 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Image Gen: Style + Aspect Ratio + Scene */}
              {contentType === "image_gen" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      图片风格
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {IMAGE_STYLES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setImageStyle(s.id)}
                          className={`py-2 rounded-lg border-2 transition text-sm font-medium ${
                            imageStyle === s.id
                              ? "border-blue-700 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      画面比例
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ASPECT_RATIOS.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setAspectRatio(r.id)}
                          className={`py-2 rounded-lg border-2 transition text-sm font-medium ${
                            aspectRatio === r.id
                              ? "border-blue-700 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      场景描述（选填）
                    </label>
                    <textarea
                      value={sceneDescription}
                      onChange={(e) => setSceneDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      placeholder="描述画面场景，如：雨天的十字路口，行人正在过马路"
                    />
                  </div>
                </>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {generateLabel}
                  </>
                )}
              </button>
            </CardContent>
          </Card>

          {/* Material Reference — only for copywriting */}
          {contentType === "copywriting" && (
            <Card className="shadow border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-800 mb-4">素材引用</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left">
                    <BookOpen className="w-5 h-5 text-blue-700" />
                    <div>
                      <div className="text-sm font-semibold text-gray-700">案例库</div>
                      <div className="text-xs text-gray-500">引用优秀案例</div>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left">
                    <MessageSquare className="w-5 h-5 text-blue-700" />
                    <div>
                      <div className="text-sm font-semibold text-gray-700">话术库</div>
                      <div className="text-xs text-gray-500">使用常用话术</div>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left">
                    <Scale className="w-5 h-5 text-blue-700" />
                    <div>
                      <div className="text-sm font-semibold text-gray-700">法规库</div>
                      <div className="text-xs text-gray-500">引用法律条文</div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Output */}
        <div className="lg:col-span-3">
          <Card className="shadow border-gray-200 h-full flex flex-col">
            {/* === COPYWRITING OUTPUT === */}
            {contentType === "copywriting" && (
              <>
                {/* Platform Tabs */}
                <div className="border-b border-gray-200 px-6 pt-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {platformOptions
                      .filter((p) => selectedPlatforms.includes(p.id))
                      .map((platform) => (
                        <button
                          key={platform.id}
                          onClick={() => setActiveTab(platform.id)}
                          className={`px-4 py-2 font-medium text-sm transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                            activeTab === platform.id
                              ? "border-blue-700 text-blue-700"
                              : "border-transparent text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          {platform.label}
                          {results[platform.id] ? (
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                          ) : isGenerating && progress[platform.id]?.length ? (
                            <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                          ) : null}
                        </button>
                      ))}
                  </div>
                </div>

                <div className="flex-1 p-6">
                  {error && (
                    <div className="flex items-start gap-2 px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm">
                      <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  )}

                  {currentResult ? (
                    <div className="space-y-4">
                      {currentResult.audit_status === "passed" ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-700" />
                          <span className="text-green-700 font-medium">审核通过</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                          <AlertTriangle className="w-4 h-4 text-yellow-700" />
                          <span className="text-yellow-700 font-medium">需要修订</span>
                        </div>
                      )}

                      {currentResult.audit_report && (
                        <div className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => setShowAuditReport(!showAuditReport)}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                          >
                            <span>审核详情</span>
                            {showAuditReport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {showAuditReport && (
                            <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">
                              {currentResult.audit_report}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="border border-gray-200 rounded-lg p-4 min-h-[400px] whitespace-pre-wrap">
                        {displayContent}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>字数统计：{displayContent.length} 字</span>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          <RefreshCw className="w-4 h-4" />
                          重新生成
                        </button>
                        <button
                          onClick={handleCopy}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                            copySuccess
                              ? "bg-green-50 border border-green-300 text-green-700"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {copySuccess ? <><Check className="w-4 h-4" />已复制</> : <><Copy className="w-4 h-4" />复制文案</>}
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                          <Save className="w-4 h-4" />
                          保存草稿
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">
                          <Send className="w-4 h-4" />
                          提交审核
                        </button>
                      </div>
                    </div>
                  ) : tabIsGenerating ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-4">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">正在生成文案...</span>
                      </div>
                      <ProgressStepList steps={currentProgress} />
                    </div>
                  ) : isGenerating ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-400" />
                        <p className="text-lg font-medium text-gray-500">正在连接...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">等待生成内容</p>
                        <p className="text-sm mt-2">填写左侧参数后点击"生成文案"</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* === POSTER OUTPUT === */}
            {contentType === "poster" && (
              <div className="flex-1 p-6">
                {error && (
                  <div className="flex items-start gap-2 px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}

                {posterResult ? (
                  <div className="space-y-4">
                    <PosterResult result={posterResult.result} plansJson={posterResult.plans_json} />
                    <div className="flex gap-3">
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        <RefreshCw className="w-4 h-4" />
                        重新生成
                      </button>
                      <button
                        onClick={handleCopy}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                          copySuccess
                            ? "bg-green-50 border border-green-300 text-green-700"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {copySuccess ? <><Check className="w-4 h-4" />已复制</> : <><Copy className="w-4 h-4" />复制方案</>}
                      </button>
                    </div>
                  </div>
                ) : isGenerating && posterProgress.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">正在生成海报方案...</span>
                    </div>
                    <ProgressStepList steps={posterProgress} />
                  </div>
                ) : isGenerating ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-400" />
                      <p className="text-lg font-medium text-gray-500">正在连接...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">等待生成海报方案</p>
                      <p className="text-sm mt-2">填写左侧参数后点击"生成海报方案"</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* === VIDEO SCRIPT OUTPUT === */}
            {contentType === "video_script" && (
              <div className="flex-1 p-6">
                {error && (
                  <div className="flex items-start gap-2 px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}

                {videoResult ? (
                  <div className="space-y-4">
                    <VideoScriptResult
                      result={videoResult.result}
                      totalDuration={videoResult.total_duration}
                      sceneCount={videoResult.scene_count}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        <RefreshCw className="w-4 h-4" />
                        重新生成
                      </button>
                      <button
                        onClick={handleCopy}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                          copySuccess
                            ? "bg-green-50 border border-green-300 text-green-700"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {copySuccess ? <><Check className="w-4 h-4" />已复制</> : <><Copy className="w-4 h-4" />复制脚本</>}
                      </button>
                    </div>
                  </div>
                ) : isGenerating && videoProgress.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">正在生成视频脚本...</span>
                    </div>
                    <ProgressStepList steps={videoProgress} />
                  </div>
                ) : isGenerating ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-400" />
                      <p className="text-lg font-medium text-gray-500">正在连接...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">等待生成视频脚本</p>
                      <p className="text-sm mt-2">填写左侧参数后点击"生成视频脚本"</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* === IMAGE GEN OUTPUT === */}
            {contentType === "image_gen" && (
              <div className="flex-1 p-6">
                {error && (
                  <div className="flex items-start gap-2 px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}

                {imageResult ? (
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-5 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed max-h-[500px] overflow-y-auto">
                      {imageResult.result}
                    </div>

                    {/* Prompt JSON cards */}
                    {(() => {
                      try {
                        const prompts = JSON.parse(imageResult.prompt_json);
                        return (
                          <div className="space-y-3">
                            {prompts.prompt_en && (
                              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-blue-700">English Prompt</span>
                                  <button
                                    onClick={() => {
                                      setImageCopyTarget(prompts.prompt_en);
                                      handleCopy();
                                      setImageCopyTarget(null);
                                    }}
                                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                                  >
                                    复制
                                  </button>
                                </div>
                                <p className="text-sm text-gray-700">{prompts.prompt_en}</p>
                              </div>
                            )}
                            {prompts.prompt_zh && (
                              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-green-700">中文提示词</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(prompts.prompt_zh);
                                      setCopySuccess(true);
                                      setTimeout(() => setCopySuccess(false), 2000);
                                    }}
                                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                                  >
                                    复制
                                  </button>
                                </div>
                                <p className="text-sm text-gray-700">{prompts.prompt_zh}</p>
                              </div>
                            )}
                            {prompts.negative_prompt && (
                              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-red-700">Negative Prompt</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(prompts.negative_prompt);
                                      setCopySuccess(true);
                                      setTimeout(() => setCopySuccess(false), 2000);
                                    }}
                                    className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                                  >
                                    复制
                                  </button>
                                </div>
                                <p className="text-sm text-gray-700">{prompts.negative_prompt}</p>
                              </div>
                            )}
                            {prompts.style_tags && (
                              <div className="flex flex-wrap gap-1.5">
                                {(Array.isArray(prompts.style_tags) ? prompts.style_tags : []).map((tag: string, i: number) => (
                                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      } catch {
                        return null;
                      }
                    })()}

                    <div className="flex gap-3">
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        <RefreshCw className="w-4 h-4" />
                        重新生成
                      </button>
                      <button
                        onClick={handleCopy}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                          copySuccess
                            ? "bg-green-50 border border-green-300 text-green-700"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {copySuccess ? <><Check className="w-4 h-4" />已复制</> : <><Copy className="w-4 h-4" />复制全部</>}
                      </button>
                    </div>
                  </div>
                ) : isGenerating && imageProgress.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">正在生成配图提示词...</span>
                    </div>
                    <ProgressStepList steps={imageProgress} />
                  </div>
                ) : isGenerating ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-400" />
                      <p className="text-lg font-medium text-gray-500">正在连接...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">等待生成配图提示词</p>
                      <p className="text-sm mt-2">填写主题和场景后点击"生成配图提示词"</p>
                      <p className="text-xs mt-1 text-gray-300">生成的提示词可直接用于 Stable Diffusion / DALL-E / Midjourney</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
