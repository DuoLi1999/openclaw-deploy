import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  ShieldCheck,
  History,
  Send,
  Globe,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { contentItems } from "@/data/mock";
import { ReviewDialog } from "@/components/review/ReviewDialog";
import {
  PublishDialog,
  type PublishRecord,
} from "@/components/publish/PublishDialog";

interface ReviewRecord {
  id: string;
  contentTitle: string;
  finalStatus: "approved" | "revision_required" | "rejected";
  issueCount: number;
  timestamp: string;
}

export function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<"content" | "history" | "publish">("content");
  const [activeFilter, setActiveFilter] = useState("all");
  const [reviewTarget, setReviewTarget] = useState<{
    title: string;
    text: string;
    platform: string;
  } | null>(null);
  const [publishTarget, setPublishTarget] = useState<{
    id: number;
    title: string;
    platform: string;
  } | null>(null);
  const [reviewRecords, setReviewRecords] = useState<ReviewRecord[]>([]);
  const [publishRecords, setPublishRecords] = useState<PublishRecord[]>([]);
  const [historyFilter, setHistoryFilter] = useState<string>("all");

  // Load review records from localStorage
  useEffect(() => {
    const records = JSON.parse(localStorage.getItem("reviewRecords") || "[]");
    setReviewRecords(records);
    const pubRecords = JSON.parse(localStorage.getItem("publishRecords") || "[]");
    setPublishRecords(pubRecords);
  }, [reviewTarget, publishTarget]); // Refresh when dialogs close

  const filters = [
    { id: "all", label: "全部", count: contentItems.length },
    {
      id: "draft",
      label: "草稿",
      count: contentItems.filter((c) => c.status === "draft").length,
    },
    {
      id: "pending",
      label: "待审核",
      count: contentItems.filter((c) => c.status === "pending").length,
    },
    {
      id: "approved",
      label: "审核通过",
      count: contentItems.filter((c) => c.status === "approved").length,
    },
    {
      id: "published",
      label: "已发布",
      count: contentItems.filter((c) => c.status === "published").length,
    },
    {
      id: "rejected",
      label: "已退回",
      count: contentItems.filter((c) => c.status === "rejected").length,
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        bg: string;
        text: string;
        label: string;
        icon: typeof FileText;
      }
    > = {
      draft: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        label: "草稿",
        icon: FileText,
      },
      pending: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        label: "待审核",
        icon: Clock,
      },
      approved: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        label: "审核通过",
        icon: CheckCircle,
      },
      published: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "已发布",
        icon: CheckCircle,
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "已退回",
        icon: XCircle,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge
        className={`rounded-full border-transparent ${config.bg} ${config.text}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredContents =
    activeFilter === "all"
      ? contentItems
      : contentItems.filter((c) => c.status === activeFilter);

  const filteredHistory = historyFilter === "all"
    ? reviewRecords
    : reviewRecords.filter((r) => r.finalStatus === historyFilter);

  const getReviewStatusBadge = (status: string) => {
    if (status === "approved") return <Badge className="rounded-full border-transparent bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" />通过</Badge>;
    if (status === "revision_required") return <Badge className="rounded-full border-transparent bg-orange-100 text-orange-700"><Clock className="w-3 h-3" />需修订</Badge>;
    return <Badge className="rounded-full border-transparent bg-red-100 text-red-700"><XCircle className="w-3 h-3" />不通过</Badge>;
  };

  const clearHistory = () => {
    localStorage.removeItem("reviewRecords");
    setReviewRecords([]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">文案管理</h2>
          <p className="text-sm text-gray-600">
            查看和管理历史文案，跟踪审核状态
          </p>
        </div>
      </div>

      {/* Main Tabs: Content vs History */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("content")}
          className={`px-5 py-2.5 font-medium text-sm transition border-b-2 ${
            activeTab === "content"
              ? "border-blue-700 text-blue-700"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          <FileText className="w-4 h-4 inline mr-1.5" />
          文案列表
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2.5 font-medium text-sm transition border-b-2 flex items-center gap-1.5 ${
            activeTab === "history"
              ? "border-blue-700 text-blue-700"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          <History className="w-4 h-4" />
          审核历史
          {reviewRecords.length > 0 && (
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              {reviewRecords.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("publish")}
          className={`px-5 py-2.5 font-medium text-sm transition border-b-2 flex items-center gap-1.5 ${
            activeTab === "publish"
              ? "border-blue-700 text-blue-700"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          <Globe className="w-4 h-4" />
          发布记录
          {publishRecords.length > 0 && (
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              {publishRecords.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "content" ? (
        <Card className="shadow border-gray-200">
          {/* Filter Tabs */}
          <div className="border-b border-gray-200 px-6 pt-4">
            <div className="flex gap-1 overflow-x-auto">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 font-medium text-sm transition border-b-2 whitespace-nowrap ${
                    activeFilter === filter.id
                      ? "border-blue-700 text-blue-700"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {filter.label}
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search and Actions */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="搜索文案标题、作者..."
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <Filter className="w-5 h-5" />
                筛选
              </button>
            </div>
          </div>

          {/* Content List */}
          <div className="divide-y divide-gray-200">
            {filteredContents.map((content) => (
              <div key={content.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-800">
                        {content.title}
                      </h4>
                      {getStatusBadge(content.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{content.platform}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{content.createTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">作者：</span>
                        <span>{content.author}</span>
                      </div>
                      {content.status === "published" && (
                        <div>
                          <span className="text-gray-500">浏览：</span>
                          <span className="text-blue-700 font-semibold">
                            {content.views}
                          </span>
                        </div>
                      )}
                    </div>

                    {content.status === "rejected" && (
                      <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        <span className="font-semibold">退回原因：</span>
                        部分表述不够准确，需要补充法规依据
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      title="查看"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    {content.status === "approved" && (
                      <button
                        onClick={() =>
                          setPublishTarget({
                            id: content.id,
                            title: content.title,
                            platform: content.platform,
                          })
                        }
                        className="p-2 hover:bg-green-50 rounded-lg transition"
                        title="发布"
                      >
                        <Send className="w-4 h-4 text-green-600" />
                      </button>
                    )}
                    {(content.status === "draft" ||
                      content.status === "pending" ||
                      content.status === "rejected") && (
                      <button
                        onClick={() =>
                          setReviewTarget({
                            title: content.title,
                            text: `【${content.title}】\n\n这是${content.platform}平台的宣传文案内容示例。实际使用时将传入真实文案内容进行审核。`,
                            platform: content.platform,
                          })
                        }
                        className="p-2 hover:bg-blue-50 rounded-lg transition"
                        title="提交审核"
                      >
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                      </button>
                    )}
                    {(content.status === "draft" ||
                      content.status === "rejected") && (
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>
                    )}
                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                共 {filteredContents.length} 条记录
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                  上一页
                </button>
                <button className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition text-sm">
                  1
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                  2
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                  下一页
                </button>
              </div>
            </div>
          </div>
        </Card>
      ) : activeTab === "history" ? (
        /* Review History Tab */
        <Card className="shadow border-gray-200">
          {/* History Filters */}
          <div className="border-b border-gray-200 px-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {[
                  { id: "all", label: "全部" },
                  { id: "approved", label: "通过" },
                  { id: "revision_required", label: "需修订" },
                  { id: "rejected", label: "不通过" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setHistoryFilter(f.id)}
                    className={`px-4 py-2 font-medium text-sm transition border-b-2 ${
                      historyFilter === f.id
                        ? "border-blue-700 text-blue-700"
                        : "border-transparent text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {reviewRecords.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-red-500 transition"
                >
                  清空历史
                </button>
              )}
            </div>
          </div>

          {/* History Stats */}
          {reviewRecords.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">{reviewRecords.length}</div>
                  <div className="text-xs text-gray-500">总审核次数</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {reviewRecords.filter(r => r.finalStatus === "approved").length}
                  </div>
                  <div className="text-xs text-gray-500">通过</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {reviewRecords.filter(r => r.finalStatus === "revision_required").length}
                  </div>
                  <div className="text-xs text-gray-500">需修订</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {reviewRecords.filter(r => r.finalStatus === "rejected").length}
                  </div>
                  <div className="text-xs text-gray-500">不通过</div>
                </div>
              </div>
              {reviewRecords.length > 0 && (
                <div className="mt-3">
                  <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
                    <div
                      className="bg-green-500"
                      style={{ width: `${(reviewRecords.filter(r => r.finalStatus === "approved").length / reviewRecords.length) * 100}%` }}
                    />
                    <div
                      className="bg-orange-400"
                      style={{ width: `${(reviewRecords.filter(r => r.finalStatus === "revision_required").length / reviewRecords.length) * 100}%` }}
                    />
                    <div
                      className="bg-red-500"
                      style={{ width: `${(reviewRecords.filter(r => r.finalStatus === "rejected").length / reviewRecords.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">
                      通过率 {((reviewRecords.filter(r => r.finalStatus === "approved").length / reviewRecords.length) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History List */}
          {filteredHistory.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredHistory.map((record) => (
                <div key={record.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-gray-800 text-sm">{record.contentTitle}</h4>
                        {getReviewStatusBadge(record.finalStatus)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(record.timestamp).toLocaleString("zh-CN")}
                        </span>
                        {record.issueCount > 0 && (
                          <span className="text-orange-600">
                            发现 {record.issueCount} 个问题
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">暂无审核历史记录</p>
              <p className="text-xs mt-1">提交文案审核后，记录将自动保存在此</p>
            </div>
          )}

          {/* History Pagination */}
          {filteredHistory.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                共 {filteredHistory.length} 条审核记录
              </div>
            </div>
          )}
        </Card>
      ) : null}

      {activeTab === "publish" && (
        /* Publish History Tab */
        <Card className="shadow border-gray-200">
          <div className="border-b border-gray-200 px-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {[
                  { id: "all", label: "全部" },
                  { id: "success", label: "成功" },
                  { id: "partial", label: "部分成功" },
                  { id: "failed", label: "失败" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setHistoryFilter(f.id)}
                    className={`px-4 py-2 font-medium text-sm transition border-b-2 ${
                      historyFilter === f.id
                        ? "border-blue-700 text-blue-700"
                        : "border-transparent text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {publishRecords.length > 0 && (
                <button
                  onClick={() => {
                    localStorage.removeItem("publishRecords");
                    setPublishRecords([]);
                  }}
                  className="text-xs text-gray-400 hover:text-red-500 transition"
                >
                  清空记录
                </button>
              )}
            </div>
          </div>

          {/* Publish Stats */}
          {publishRecords.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">{publishRecords.length}</div>
                  <div className="text-xs text-gray-500">总发布次数</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {publishRecords.filter((r) => r.status === "success").length}
                  </div>
                  <div className="text-xs text-gray-500">全部成功</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {publishRecords.filter((r) => r.status === "partial").length}
                  </div>
                  <div className="text-xs text-gray-500">部分成功</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {publishRecords.filter((r) => r.status === "failed").length}
                  </div>
                  <div className="text-xs text-gray-500">全部失败</div>
                </div>
              </div>
            </div>
          )}

          {/* Publish Records List */}
          {(() => {
            const filtered =
              historyFilter === "all"
                ? publishRecords
                : publishRecords.filter((r) => r.status === historyFilter);
            return filtered.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filtered.map((record) => (
                  <div key={record.id} className="px-6 py-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-gray-800 text-sm">
                            {record.contentTitle}
                          </h4>
                          <Badge
                            className={`rounded-full border-transparent text-xs ${
                              record.status === "success"
                                ? "bg-green-100 text-green-700"
                                : record.status === "partial"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {record.status === "success"
                              ? "发布成功"
                              : record.status === "partial"
                              ? "部分成功"
                              : "发布失败"}
                          </Badge>
                          {record.publishMode === "scheduled" && (
                            <Badge className="rounded-full border-transparent bg-purple-100 text-purple-700 text-xs">
                              定时发布
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(record.publishedAt).toLocaleString("zh-CN")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {record.platforms.join("、")}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {record.results.map((r, i) => (
                            <span
                              key={i}
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                r.status === "success"
                                  ? "bg-green-50 text-green-600"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {r.platform}: {r.status === "success" ? "成功" : "失败"}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400">
                <Send className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">暂无发布记录</p>
                <p className="text-xs mt-1">审核通过的文案可以一键发布到多个平台</p>
              </div>
            );
          })()}

          {publishRecords.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                共 {publishRecords.length} 条发布记录
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewTarget !== null}
        onOpenChange={(open) => {
          if (!open) setReviewTarget(null);
        }}
        contentTitle={reviewTarget?.title ?? ""}
        contentText={reviewTarget?.text ?? ""}
        platform={reviewTarget?.platform}
      />

      {/* Publish Dialog */}
      <PublishDialog
        open={publishTarget !== null}
        onOpenChange={(open) => {
          if (!open) setPublishTarget(null);
        }}
        contentId={publishTarget?.id ?? 0}
        contentTitle={publishTarget?.title ?? ""}
        contentPlatform={publishTarget?.platform ?? ""}
        onPublished={() => {
          const pubRecords = JSON.parse(localStorage.getItem("publishRecords") || "[]");
          setPublishRecords(pubRecords);
        }}
      />
    </div>
  );
}
