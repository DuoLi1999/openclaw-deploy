import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, Palette, Type, Layout } from "lucide-react";

interface PosterPlan {
  title?: string;
  theme?: string;
  visual_description?: string;
  color_scheme?: string;
  layout?: string;
  text_content?: string;
  [key: string]: unknown;
}

interface PosterResultProps {
  result: string;
  plansJson: string;
}

export function PosterResult({ result, plansJson }: PosterResultProps) {
  const plans = useMemo(() => {
    try {
      const parsed = JSON.parse(plansJson);
      if (Array.isArray(parsed)) return parsed as PosterPlan[];
      if (parsed.plans && Array.isArray(parsed.plans)) return parsed.plans as PosterPlan[];
      return [];
    } catch {
      return [];
    }
  }, [plansJson]);

  if (plans.length === 0) {
    // Fallback: show raw result text
    return (
      <div className="border border-gray-200 rounded-lg p-4 min-h-[300px] whitespace-pre-wrap">
        {result}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {plans.map((plan, idx) => (
          <Card key={idx} className="border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-gray-800">
                  {plan.title || `方案 ${idx + 1}`}
                </h4>
                <Badge className="rounded-full bg-blue-100 text-blue-700 border-transparent">
                  方案 {idx + 1}
                </Badge>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {plan.theme && (
                <div className="flex items-start gap-2">
                  <Type className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-gray-500">主题</span>
                    <p className="text-sm text-gray-700">{plan.theme}</p>
                  </div>
                </div>
              )}
              {plan.visual_description && (
                <div className="flex items-start gap-2">
                  <Image className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-gray-500">视觉描述</span>
                    <p className="text-sm text-gray-700">{plan.visual_description}</p>
                  </div>
                </div>
              )}
              {plan.color_scheme && (
                <div className="flex items-start gap-2">
                  <Palette className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-gray-500">配色方案</span>
                    <p className="text-sm text-gray-700">{plan.color_scheme}</p>
                  </div>
                </div>
              )}
              {plan.layout && (
                <div className="flex items-start gap-2">
                  <Layout className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-gray-500">布局</span>
                    <p className="text-sm text-gray-700">{plan.layout}</p>
                  </div>
                </div>
              )}
              {plan.text_content && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium text-gray-500 block mb-1">文案内容</span>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{plan.text_content}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Raw result fallback */}
      {result && (
        <details className="text-sm">
          <summary className="text-gray-500 cursor-pointer hover:text-gray-700">
            查看原始输出
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap text-gray-700">
            {result}
          </div>
        </details>
      )}
    </div>
  );
}
