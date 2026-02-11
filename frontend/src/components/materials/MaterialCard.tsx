import { Video, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Material {
  id: string;
  title: string;
  type: "video" | "image";
  filename: string;
  tags: string[];
  source: string;
  description: string;
  location: string;
  date: string;
  usageCount: number;
}

interface MaterialCardProps {
  material: Material;
}

export function MaterialCard({ material }: MaterialCardProps) {
  const TypeIcon = material.type === "video" ? Video : Image;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            material.type === "video"
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600"
          }`}
        >
          <TypeIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-800 truncate">
              {material.title}
            </h4>
            <Badge
              className={`rounded-full border-transparent shrink-0 ${
                material.type === "video"
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {material.type === "video" ? "视频" : "图片"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {material.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
            <span>来源：{material.source}</span>
            <span>{material.date}</span>
            {material.location && <span>{material.location}</span>}
            <span>使用 {material.usageCount} 次</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {material.tags.map((tag) => (
              <Badge
                key={tag}
                className="bg-blue-50 text-blue-700 border-transparent rounded-full text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
