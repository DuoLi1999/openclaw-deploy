import { FileText, Image, Video, ImagePlus } from "lucide-react";

export type ContentType = "copywriting" | "poster" | "video_script" | "image_gen";

interface ContentTypeSelectorProps {
  value: ContentType;
  onChange: (type: ContentType) => void;
}

const options: { id: ContentType; label: string; icon: typeof FileText; desc: string }[] = [
  { id: "copywriting", label: "文案", icon: FileText, desc: "多平台宣传文案" },
  { id: "poster", label: "海报方案", icon: Image, desc: "视觉海报策划" },
  { id: "video_script", label: "视频脚本", icon: Video, desc: "短视频分镜脚本" },
  { id: "image_gen", label: "AI 配图", icon: ImagePlus, desc: "生成宣传配图提示词" },
];

export function ContentTypeSelector({ value, onChange }: ContentTypeSelectorProps) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition text-sm ${
              isActive
                ? "border-blue-700 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300 text-gray-600"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <div className="font-medium">{opt.label}</div>
              <div className="text-xs opacity-70">{opt.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
