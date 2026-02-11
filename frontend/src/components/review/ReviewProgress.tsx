import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

export type StageStatus = "pending" | "running" | "pass" | "warning" | "block";

interface ReviewProgressProps {
  stages: {
    name: string;
    status: StageStatus;
  }[];
}

const statusConfig: Record<StageStatus, { icon: typeof CheckCircle; color: string; bg: string }> = {
  pending: { icon: Loader2, color: "text-gray-400", bg: "bg-gray-100" },
  running: { icon: Loader2, color: "text-blue-600", bg: "bg-blue-100" },
  pass: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
  warning: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-100" },
  block: { icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
};

export function ReviewProgress({ stages }: ReviewProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {stages.map((stage, idx) => {
        const config = statusConfig[stage.status];
        const Icon = config.icon;
        return (
          <div key={stage.name} className="flex items-center gap-2">
            {idx > 0 && (
              <div
                className={`w-8 h-0.5 ${
                  stage.status !== "pending" ? "bg-blue-300" : "bg-gray-200"
                }`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${config.bg}`}>
                <Icon
                  className={`w-4 h-4 ${config.color} ${
                    stage.status === "running" ? "animate-spin" : ""
                  }`}
                />
              </div>
              <span className={`text-xs font-medium ${config.color}`}>
                {stage.name}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
