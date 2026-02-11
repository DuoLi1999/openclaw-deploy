import { Badge } from "@/components/ui/badge";
import { Clock, Film, Hash } from "lucide-react";

interface VideoScriptResultProps {
  result: string;
  totalDuration: string;
  sceneCount: number;
}

export function VideoScriptResult({ result, totalDuration, sceneCount }: VideoScriptResultProps) {
  // Try to parse scene data from result text (table format)
  const lines = result.split("\n").filter((l) => l.trim());

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="flex gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            总时长 {totalDuration}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-lg">
          <Film className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">
            {sceneCount} 个场景
          </span>
        </div>
        <Badge className="bg-green-50 text-green-700 border-transparent rounded-full">
          <Hash className="w-3 h-3" />
          分镜脚本
        </Badge>
      </div>

      {/* Script content */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-700">分镜表</h4>
        </div>
        <div className="p-4 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed max-h-[500px] overflow-y-auto">
          {lines.map((line, idx) => {
            // Highlight scene headers
            const isSceneHeader =
              /^(场景|镜头|Scene|第[一二三四五六七八九十\d]+[场镜])/i.test(line.trim());
            return (
              <div
                key={idx}
                className={
                  isSceneHeader
                    ? "font-semibold text-blue-800 mt-3 mb-1 pb-1 border-b border-blue-100"
                    : ""
                }
              >
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
