import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ReviewProgress, type StageStatus } from "./ReviewProgress";
import { ReviewReport, type ReviewStageResult } from "./ReviewReport";
import {
  runReviewerWorkflowStreaming,
  type StreamProgress,
} from "@/services/dify";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentTitle: string;
  contentText: string;
  platform?: string;
  onComplete?: (result: {
    finalStatus: "approved" | "revision_required" | "rejected";
    stages: ReviewStageResult[];
    summary: string;
  }) => void;
}

const STAGE_NAMES = ["初审：格式与敏感词", "复审：内容质量", "终审：政策合规"];

// Map Dify node titles to review stages
function nodeToStageIndex(nodeTitle: string): number {
  const lower = nodeTitle.toLowerCase();
  if (lower.includes("初审") || lower.includes("格式") || lower.includes("敏感")) return 0;
  if (lower.includes("复审") || lower.includes("质量")) return 1;
  if (lower.includes("终审") || lower.includes("合规") || lower.includes("政策")) return 2;
  return -1;
}

export function ReviewDialog({
  open,
  onOpenChange,
  contentTitle,
  contentText,
  platform,
  onComplete,
}: ReviewDialogProps) {
  const [reviewing, setReviewing] = useState(false);
  const [stageStatuses, setStageStatuses] = useState<StageStatus[]>(["pending", "pending", "pending"]);
  const [result, setResult] = useState<{
    stages: ReviewStageResult[];
    finalStatus: "approved" | "revision_required" | "rejected";
    summary: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startReview = useCallback(async () => {
    setReviewing(true);
    setError(null);
    setResult(null);
    setStageStatuses(["running", "pending", "pending"]);

    try {
      const output = await runReviewerWorkflowStreaming(
        {
          content: contentText,
          platform: platform,
        },
        {
          onProgress: (progress: StreamProgress) => {
            if (progress.event === "node_started") {
              const idx = nodeToStageIndex(progress.nodeTitle);
              if (idx >= 0) {
                setStageStatuses((prev) => {
                  const next = [...prev];
                  next[idx] = "running";
                  return next;
                });
              }
            } else if (progress.event === "node_finished") {
              const idx = nodeToStageIndex(progress.nodeTitle);
              if (idx >= 0) {
                setStageStatuses((prev) => {
                  const next = [...prev];
                  next[idx] = progress.status === "succeeded" ? "pass" : "block";
                  // Start next stage
                  if (idx + 1 < next.length && next[idx + 1] === "pending") {
                    next[idx + 1] = "running";
                  }
                  return next;
                });
              }
            }
          },
        }
      );

      // Parse the review_json output
      let stages: ReviewStageResult[] = [];
      let summary = "";
      try {
        const parsed = JSON.parse(output.review_json);
        if (Array.isArray(parsed.stages)) {
          stages = parsed.stages;
        } else if (Array.isArray(parsed)) {
          stages = parsed;
        }
        summary = parsed.summary || "";
      } catch {
        // If review_json parse fails, create a basic report from result text
        stages = STAGE_NAMES.map((name, idx) => ({
          stage: `stage_${idx}`,
          stageName: name,
          result: output.final_status === "approved" ? "pass" as const : "warning" as const,
          issues: [],
        }));
        summary = output.result;
      }

      // Update stage statuses based on parsed results
      setStageStatuses(
        stages.map((s) =>
          s.result === "block" ? "block" : s.result === "warning" ? "warning" : "pass"
        )
      );

      const reviewResult = {
        stages,
        finalStatus: output.final_status,
        summary,
      };
      setResult(reviewResult);
      onComplete?.(reviewResult);

      // Save to localStorage
      const records = JSON.parse(localStorage.getItem("reviewRecords") || "[]");
      records.unshift({
        id: `review-${Date.now()}`,
        contentTitle,
        finalStatus: output.final_status,
        issueCount: output.issue_count,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("reviewRecords", JSON.stringify(records.slice(0, 50)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "审核失败");
      setStageStatuses((prev) => {
        const next = [...prev];
        // Mark current running stage as failed
        for (let i = 0; i < next.length; i++) {
          if (next[i] === "running") next[i] = "block";
        }
        return next;
      });
    } finally {
      setReviewing(false);
    }
  }, [contentText, contentTitle, platform, onComplete]);

  const handleOpenChange = (open: boolean) => {
    if (!reviewing) {
      onOpenChange(open);
      if (!open) {
        // Reset state when closing
        setStageStatuses(["pending", "pending", "pending"]);
        setResult(null);
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI 三级审核</DialogTitle>
          <DialogDescription>
            对「{contentTitle}」进行格式、质量、合规三级审核
          </DialogDescription>
        </DialogHeader>

        {/* Content preview */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
          <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-5">
            {contentText || "（无内容）"}
          </p>
        </div>

        {/* Review progress */}
        <div className="py-2">
          <ReviewProgress
            stages={STAGE_NAMES.map((name, idx) => ({
              name,
              status: stageStatuses[idx],
            }))}
          />
        </div>

        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <ReviewReport
            stages={result.stages}
            finalStatus={result.finalStatus}
            summary={result.summary}
          />
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          {!reviewing && !result && (
            <button
              onClick={startReview}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition text-sm font-medium"
            >
              开始审核
            </button>
          )}
          {!reviewing && result && (
            <button
              onClick={startReview}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              重新审核
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
