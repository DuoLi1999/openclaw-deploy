import { useState, useCallback } from "react";
import { X, Upload, Sparkles, Loader2, Plus } from "lucide-react";
import type { Material } from "./MaterialCard";

interface MaterialUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (material: Material) => void;
  existingTags: string[];
}

const TYPE_OPTIONS = [
  { id: "video" as const, label: "视频" },
  { id: "image" as const, label: "图片" },
];

const SOURCE_OPTIONS = [
  "执法记录仪",
  "道路监控",
  "路口监控",
  "宣传活动拍摄",
  "宣传科设计",
  "市民投稿",
  "社区宣传拍摄",
];

const AI_TAG_CATEGORIES = [
  "事故类型", "违法种类", "路段类型", "天气条件",
  "受众群体", "宣传场景", "时间特征",
];

export function MaterialUploadDialog({
  open,
  onClose,
  onSave,
  existingTags,
}: MaterialUploadDialogProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"video" | "image">("video");
  const [filename, setFilename] = useState("");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handlePickExistingTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleAISuggestTags = useCallback(async () => {
    if (!title && !description) return;
    setIsGeneratingTags(true);

    // Simulate AI tag suggestion based on content analysis
    // In production this would call a Dify workflow
    await new Promise((r) => setTimeout(r, 800));

    const suggestedTags: string[] = [];
    const text = `${title} ${description} ${location}`.toLowerCase();

    // Simple keyword-based suggestion logic
    const keywordMap: Record<string, string[]> = {
      "高速": ["高速公路"],
      "追尾": ["追尾", "事故"],
      "酒驾": ["酒驾", "查处"],
      "学校|学生": ["学生", "安全教育"],
      "电动车|骑手": ["电动车"],
      "头盔": ["头盔", "一盔一带"],
      "雨|暴雨": ["雨天", "恶劣天气"],
      "雪|冰": ["冰雪", "冬季"],
      "雾": ["雾天", "恶劣天气"],
      "老年|老人": ["老年人"],
      "儿童|孩子": ["儿童"],
      "农村|乡": ["农村", "乡村道路"],
      "施工": ["施工", "道路封闭"],
      "国庆|春节|春运|黄金周": ["节假日"],
      "夜间|凌晨": ["夜间"],
      "货车": ["货车"],
      "摩托车": ["摩托车"],
      "闯红灯": ["闯红灯", "违法"],
      "疲劳": ["疲劳驾驶"],
      "逆行": ["逆行", "违法"],
      "路口|十字": ["路口"],
      "宣传": ["宣传活动"],
      "海报": ["海报"],
    };

    for (const [pattern, matchTags] of Object.entries(keywordMap)) {
      const regex = new RegExp(pattern);
      if (regex.test(text)) {
        suggestedTags.push(...matchTags);
      }
    }

    // Add type-based tag
    if (type === "video") suggestedTags.push("视频素材");
    if (type === "image") suggestedTags.push("图片素材");

    // Deduplicate and merge with existing
    const unique = [...new Set(suggestedTags)].filter((t) => !tags.includes(t));
    setTags((prev) => [...prev, ...unique.slice(0, 8)]);
    setIsGeneratingTags(false);
  }, [title, description, location, type, tags]);

  const handleSave = () => {
    if (!title.trim()) return;
    const material: Material = {
      id: `mat-user-${Date.now()}`,
      title: title.trim(),
      type,
      filename: filename.trim() || `${title.trim()}.${type === "video" ? "mp4" : "jpg"}`,
      tags,
      source: source || "用户上传",
      description: description.trim(),
      location: location.trim(),
      date,
      usageCount: 0,
    };
    onSave(material);
    // Reset form
    setTitle("");
    setType("video");
    setFilename("");
    setSource("");
    setDescription("");
    setLocation("");
    setDate(new Date().toISOString().slice(0, 10));
    setTags([]);
    onClose();
  };

  if (!open) return null;

  // Show a few relevant existing tags as quick picks
  const quickPickTags = existingTags
    .filter((t) => !tags.includes(t))
    .slice(0, 12);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-700" />
            添加素材
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              素材标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="例如：高速公路追尾事故现场"
            />
          </div>

          {/* Type + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">类型</label>
              <div className="flex gap-2">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setType(opt.id)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition ${
                      type === opt.id
                        ? "border-blue-700 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">来源</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SOURCE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSource(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition ${
                    source === s
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
              placeholder="简要描述素材内容、拍摄背景等"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">地点</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="例如：G15高速K120"
            />
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold text-gray-700">标签</label>
              <button
                onClick={handleAISuggestTags}
                disabled={isGeneratingTags || (!title && !description)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition disabled:opacity-50"
              >
                {isGeneratingTags ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                AI 推荐标签
              </button>
            </div>

            {/* Current tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add tag input */}
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="输入标签后回车添加"
              />
              <button
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick pick existing tags */}
            {quickPickTags.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">快速添加：</p>
                <div className="flex flex-wrap gap-1">
                  {quickPickTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handlePickExistingTag(tag)}
                      className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-200 hover:bg-gray-100 transition"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition disabled:bg-gray-300 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            保存素材
          </button>
        </div>
      </div>
    </div>
  );
}
