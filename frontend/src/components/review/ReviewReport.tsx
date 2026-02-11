import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ReviewIssue {
  level: "warning" | "block";
  category: string;
  text: string;
  suggestion: string;
}

export interface ReviewStageResult {
  stage: string;
  stageName: string;
  result: "pass" | "warning" | "block";
  issues: ReviewIssue[];
}

interface ReviewReportProps {
  stages: ReviewStageResult[];
  finalStatus: "approved" | "revision_required" | "rejected";
  summary: string;
}

const resultConfig: Record<string, { label: string; color: string; bg: string }> = {
  pass: { label: "通过", color: "text-green-700", bg: "bg-green-100" },
  warning: { label: "警告", color: "text-yellow-700", bg: "bg-yellow-100" },
  block: { label: "阻断", color: "text-red-700", bg: "bg-red-100" },
};

const finalStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  approved: { label: "审核通过", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  revision_required: { label: "需要修改", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  rejected: { label: "审核拒绝", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

export function ReviewReport({ stages, finalStatus, summary }: ReviewReportProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const finalConfig = finalStatusConfig[finalStatus];

  return (
    <div className="space-y-4">
      {/* Final result banner */}
      <div className={`p-3 rounded-lg border ${finalConfig.bg}`}>
        <div className="flex items-center gap-2">
          {finalStatus === "approved" ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : finalStatus === "revision_required" ? (
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={`font-semibold ${finalConfig.color}`}>{finalConfig.label}</span>
        </div>
        {summary && <p className="mt-2 text-sm text-gray-700">{summary}</p>}
      </div>

      {/* Stage details */}
      {stages.map((stage) => {
        const config = resultConfig[stage.result];
        const isOpen = expanded[stage.stage] ?? false;

        return (
          <div key={stage.stage} className="border border-gray-200 rounded-lg">
            <button
              onClick={() =>
                setExpanded((prev) => ({ ...prev, [stage.stage]: !prev[stage.stage] }))
              }
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <span className="font-medium text-sm text-gray-800">{stage.stageName}</span>
              </div>
              <Badge className={`rounded-full border-transparent ${config.bg} ${config.color}`}>
                {config.label}
                {stage.issues.length > 0 && ` (${stage.issues.length})`}
              </Badge>
            </button>

            {isOpen && stage.issues.length > 0 && (
              <div className="px-3 pb-3 space-y-2">
                {stage.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded text-sm ${
                      issue.level === "block"
                        ? "bg-red-50 border border-red-200"
                        : "bg-yellow-50 border border-yellow-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {issue.level === "block" ? (
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                      )}
                      <span className="font-medium text-gray-700">[{issue.category}]</span>
                      <span className="text-gray-600">{issue.text}</span>
                    </div>
                    {issue.suggestion && (
                      <p className="ml-5 text-gray-500">建议：{issue.suggestion}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isOpen && stage.issues.length === 0 && (
              <div className="px-3 pb-3">
                <p className="text-sm text-green-600">无问题</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
