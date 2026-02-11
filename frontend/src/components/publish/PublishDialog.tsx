import { useState } from "react";
import {
  X,
  Send,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlatformConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  charLimit: string;
  features: string[];
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: "wechat",
    label: "微信公众号",
    icon: "WeChat",
    color: "text-green-700",
    bgColor: "bg-green-50",
    charLimit: "800-2000字",
    features: ["图文排版", "阅读原文链接", "封面图"],
  },
  {
    id: "weibo",
    label: "微博",
    icon: "Weibo",
    color: "text-red-600",
    bgColor: "bg-red-50",
    charLimit: "≤140字",
    features: ["话题标签", "图片/视频", "@提及"],
  },
  {
    id: "douyin",
    label: "抖音",
    icon: "Douyin",
    color: "text-gray-800",
    bgColor: "bg-gray-50",
    charLimit: "≤300字",
    features: ["短视频描述", "话题挑战", "定位"],
  },
  {
    id: "toutiao",
    label: "头条号",
    icon: "Toutiao",
    color: "text-red-700",
    bgColor: "bg-red-50",
    charLimit: "500-1500字",
    features: ["图文/微头条", "标签分类", "封面"],
  },
];

type PublishMode = "immediate" | "scheduled";
type PublishStatus = "pending" | "publishing" | "success" | "failed";

interface PlatformPublishState {
  platformId: string;
  status: PublishStatus;
  message?: string;
}

export interface PublishRecord {
  id: string;
  contentId: number;
  contentTitle: string;
  platforms: string[];
  publishMode: PublishMode;
  scheduledTime?: string;
  publishedAt: string;
  status: "success" | "partial" | "failed";
  results: { platform: string; status: "success" | "failed"; message: string }[];
}

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: number;
  contentTitle: string;
  contentPlatform: string;
  onPublished?: (record: PublishRecord) => void;
}

const PUBLISH_RECORDS_KEY = "publishRecords";

function loadPublishRecords(): PublishRecord[] {
  try {
    return JSON.parse(localStorage.getItem(PUBLISH_RECORDS_KEY) || "[]");
  } catch {
    return [];
  }
}

function savePublishRecord(record: PublishRecord) {
  const records = loadPublishRecords();
  records.unshift(record);
  localStorage.setItem(PUBLISH_RECORDS_KEY, JSON.stringify(records.slice(0, 100)));
}

export function PublishDialog({
  open,
  onOpenChange,
  contentId,
  contentTitle,
  contentPlatform,
  onPublished,
}: PublishDialogProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(() => {
    const match = PLATFORMS.find((p) => contentPlatform.includes(p.label));
    return match ? [match.id] : [PLATFORMS[0].id];
  });
  const [publishMode, setPublishMode] = useState<PublishMode>("immediate");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [isPublishing, setIsPublishing] = useState(false);
  const [platformStates, setPlatformStates] = useState<PlatformPublishState[]>([]);
  const [publishComplete, setPublishComplete] = useState(false);

  if (!open) return null;

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const simulatePublish = async () => {
    setIsPublishing(true);
    setPublishComplete(false);
    const states: PlatformPublishState[] = selectedPlatforms.map((pid) => ({
      platformId: pid,
      status: "pending" as PublishStatus,
    }));
    setPlatformStates([...states]);

    const results: PublishRecord["results"] = [];

    for (let i = 0; i < states.length; i++) {
      states[i].status = "publishing";
      setPlatformStates([...states]);

      // Simulate API call delay
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

      // 90% success rate simulation
      const success = Math.random() > 0.1;
      const platform = PLATFORMS.find((p) => p.id === states[i].platformId)!;

      if (success) {
        states[i].status = "success";
        states[i].message = `已成功发布到${platform.label}`;
        results.push({
          platform: platform.label,
          status: "success",
          message: `内容已推送至${platform.label}，预计5分钟内可见`,
        });
      } else {
        states[i].status = "failed";
        states[i].message = `发布失败：${platform.label} API 连接超时`;
        results.push({
          platform: platform.label,
          status: "failed",
          message: "API连接超时，请稍后重试",
        });
      }
      setPlatformStates([...states]);
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const record: PublishRecord = {
      id: `pub-${Date.now()}`,
      contentId,
      contentTitle,
      platforms: selectedPlatforms.map(
        (pid) => PLATFORMS.find((p) => p.id === pid)!.label
      ),
      publishMode,
      scheduledTime:
        publishMode === "scheduled"
          ? `${scheduledDate} ${scheduledTime}`
          : undefined,
      publishedAt: new Date().toISOString(),
      status:
        successCount === results.length
          ? "success"
          : successCount > 0
          ? "partial"
          : "failed",
      results,
    };

    savePublishRecord(record);
    setIsPublishing(false);
    setPublishComplete(true);
    onPublished?.(record);
  };

  const handleClose = () => {
    if (isPublishing) return;
    setPublishComplete(false);
    setPlatformStates([]);
    onOpenChange(false);
  };

  const getStatusIcon = (status: PublishStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-gray-400" />;
      case "publishing":
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Send className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">发布内容</h3>
              <p className="text-xs text-gray-500 mt-0.5">{contentTitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isPublishing}
            className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!publishComplete ? (
            <>
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Globe className="w-4 h-4 inline mr-1.5" />
                  选择发布平台
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PLATFORMS.map((platform) => {
                    const selected = selectedPlatforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        onClick={() => !isPublishing && togglePlatform(platform.id)}
                        disabled={isPublishing}
                        className={`p-4 rounded-xl border-2 text-left transition ${
                          selected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        } ${isPublishing ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-semibold text-sm ${platform.color}`}>
                            {platform.label}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selected
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selected && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          {platform.charLimit}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {platform.features.map((f) => (
                            <span
                              key={f}
                              className={`text-xs px-1.5 py-0.5 rounded ${platform.bgColor} ${platform.color}`}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Publish Mode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Clock className="w-4 h-4 inline mr-1.5" />
                  发布方式
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => !isPublishing && setPublishMode("immediate")}
                    disabled={isPublishing}
                    className={`flex-1 p-3 rounded-xl border-2 text-center transition ${
                      publishMode === "immediate"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Send className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <div className="text-sm font-medium">立即发布</div>
                    <div className="text-xs text-gray-500">内容将立即推送到选定平台</div>
                  </button>
                  <button
                    onClick={() => !isPublishing && setPublishMode("scheduled")}
                    disabled={isPublishing}
                    className={`flex-1 p-3 rounded-xl border-2 text-center transition ${
                      publishMode === "scheduled"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Calendar className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                    <div className="text-sm font-medium">定时发布</div>
                    <div className="text-xs text-gray-500">设定发布时间，到时自动推送</div>
                  </button>
                </div>

                {publishMode === "scheduled" && (
                  <div className="mt-3 flex gap-3">
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Preview */}
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">发布预览</span>
                  </div>
                  <div className="space-y-2">
                    {selectedPlatforms.map((pid) => {
                      const platform = PLATFORMS.find((p) => p.id === pid)!;
                      return (
                        <div
                          key={pid}
                          className={`flex items-center justify-between p-3 rounded-lg ${platform.bgColor}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${platform.color}`}>
                              {platform.label}
                            </span>
                            <Badge className="bg-white text-gray-600 text-xs border-transparent">
                              {platform.charLimit}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {publishMode === "immediate"
                              ? "立即推送"
                              : scheduledDate
                              ? `${scheduledDate} ${scheduledTime}`
                              : "未设定时间"}
                          </span>
                        </div>
                      );
                    })}
                    {selectedPlatforms.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">
                        请选择至少一个发布平台
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Publishing Progress */}
              {isPublishing && platformStates.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">发布进度</p>
                  {platformStates.map((ps) => {
                    const platform = PLATFORMS.find((p) => p.id === ps.platformId)!;
                    return (
                      <div
                        key={ps.platformId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ps.status)}
                          <span className="text-sm font-medium">{platform.label}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {ps.status === "pending" && "等待中..."}
                          {ps.status === "publishing" && "正在推送..."}
                          {ps.status === "success" && ps.message}
                          {ps.status === "failed" && ps.message}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Publish Complete */
            <div className="text-center py-6">
              {platformStates.every((ps) => ps.status === "success") ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">发布成功</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    内容已成功推送至{" "}
                    {selectedPlatforms
                      .map((pid) => PLATFORMS.find((p) => p.id === pid)!.label)
                      .join("、")}
                  </p>
                </>
              ) : platformStates.some((ps) => ps.status === "success") ? (
                <>
                  <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">部分发布成功</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    部分平台发布失败，请查看详情
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">发布失败</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    所有平台发布失败，请检查网络后重试
                  </p>
                </>
              )}

              <div className="space-y-2 max-w-md mx-auto mb-6">
                {platformStates.map((ps) => {
                  const platform = PLATFORMS.find((p) => p.id === ps.platformId)!;
                  return (
                    <div
                      key={ps.platformId}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        ps.status === "success" ? "bg-green-50" : "bg-red-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ps.status)}
                        <span className="text-sm font-medium">{platform.label}</span>
                      </div>
                      <span
                        className={`text-xs ${
                          ps.status === "success" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {ps.status === "success" ? "发布成功" : "发布失败"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleClose}
                className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition text-sm font-medium"
              >
                完成
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!publishComplete && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <p className="text-xs text-gray-500">
              {selectedPlatforms.length} 个平台已选择
              {publishMode === "scheduled" && scheduledDate && (
                <span className="ml-2">
                  | 定时 {scheduledDate} {scheduledTime}
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isPublishing}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={simulatePublish}
                disabled={
                  isPublishing ||
                  selectedPlatforms.length === 0 ||
                  (publishMode === "scheduled" && !scheduledDate)
                }
                className="flex items-center gap-2 px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition text-sm font-medium disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    发布中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {publishMode === "immediate" ? "立即发布" : "设定定时发布"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
