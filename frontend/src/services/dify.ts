// ==================== Types ====================

export interface WorkflowInputs {
  topic: string;
  description: string;
  style: string;
  platform: string;
  reference: string;
}

export interface WorkflowOutputs {
  result: string;
  audit_status: "passed" | "needs_revision";
  audit_report: string;
}

export interface StreamProgress {
  event: "node_started" | "node_finished";
  nodeTitle: string;
  nodeType: string;
  nodeIndex: number;
  status: "running" | "succeeded" | "failed";
  elapsedTime?: number;
}

export interface StreamCallbacks {
  onProgress: (progress: StreamProgress) => void;
}

interface WorkflowResponse<TOut = WorkflowOutputs> {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: string;
    outputs: TOut;
    error: string | null;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  };
}

// ==================== Constants ====================

const PLATFORM_MAP: Record<string, string> = {
  weibo: "weibo",
  wechat: "wechat_mp",
  douyin: "douyin",
  toutiao: "toutiao",
};

// ==================== Error ====================

export class DifyApiError extends Error {
  constructor(
    public status: number,
    public body: string
  ) {
    super(`Dify API error ${status}: ${body}`);
    this.name = "DifyApiError";
  }
}

// ==================== SSE Streaming ====================

async function* parseSSEStream(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<{ event: string; data: string }> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        let event = "message";
        let data = "";
        for (const line of part.split("\n")) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) data = line.slice(5).trim();
        }
        if (data) yield { event, data };
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ==================== Generic Workflow API ====================

export async function runGenericWorkflow<TIn, TOut>(
  endpoint: string,
  inputs: TIn,
  user = "web-user"
): Promise<TOut> {
  const body = {
    inputs,
    response_mode: "blocking",
    user,
  };

  const res = await fetch(`${endpoint}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new DifyApiError(res.status, text);
  }

  const json: WorkflowResponse<TOut> = await res.json();

  if (json.data.status !== "succeeded") {
    throw new DifyApiError(
      500,
      json.data.error ?? `Workflow status: ${json.data.status}`
    );
  }

  return json.data.outputs;
}

export async function runGenericWorkflowStreaming<TIn, TOut>(
  endpoint: string,
  inputs: TIn,
  callbacks: StreamCallbacks,
  user = "web-user"
): Promise<TOut> {
  const body = {
    inputs,
    response_mode: "streaming",
    user,
  };

  const res = await fetch(`${endpoint}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new DifyApiError(res.status, text);
  }

  if (!res.body) {
    throw new DifyApiError(500, "Response body is null — streaming not supported");
  }

  let finalOutputs: TOut | null = null;

  for await (const { data } of parseSSEStream(res.body)) {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(data);
    } catch {
      continue;
    }

    const evt = parsed.event as string | undefined;

    if (evt === "node_started") {
      const d = parsed.data as Record<string, unknown>;
      callbacks.onProgress({
        event: "node_started",
        nodeTitle: (d.title as string) ?? "",
        nodeType: (d.node_type as string) ?? "",
        nodeIndex: (d.index as number) ?? 0,
        status: "running",
      });
    } else if (evt === "node_finished") {
      const d = parsed.data as Record<string, unknown>;
      callbacks.onProgress({
        event: "node_finished",
        nodeTitle: (d.title as string) ?? "",
        nodeType: (d.node_type as string) ?? "",
        nodeIndex: (d.index as number) ?? 0,
        status: (d.status as string) === "succeeded" ? "succeeded" : "failed",
        elapsedTime: (d.elapsed_time as number) ?? undefined,
      });
    } else if (evt === "workflow_finished") {
      const d = parsed.data as Record<string, unknown>;
      const outputs = d.outputs as TOut | undefined;
      if (outputs) {
        finalOutputs = outputs;
      }
    }
  }

  if (!finalOutputs) {
    throw new DifyApiError(500, "Workflow stream ended without producing outputs");
  }

  return finalOutputs;
}

// ==================== Copywriter Workflow (backward-compatible) ====================

export async function runWorkflow(
  inputs: WorkflowInputs,
  user = "web-user"
): Promise<WorkflowOutputs> {
  return runGenericWorkflow(
    "/api/workflows",
    {
      ...inputs,
      platform: PLATFORM_MAP[inputs.platform] ?? inputs.platform,
    },
    user
  );
}

export async function runWorkflowStreaming(
  inputs: WorkflowInputs,
  callbacks: StreamCallbacks,
  user = "web-user"
): Promise<WorkflowOutputs> {
  return runGenericWorkflowStreaming(
    "/api/workflows",
    {
      ...inputs,
      platform: PLATFORM_MAP[inputs.platform] ?? inputs.platform,
    },
    callbacks,
    user
  );
}

// ==================== Poster Workflow ====================

export interface PosterInputs {
  topic: string;
  description: string;
  style: string;
  num_plans: number;
}

export interface PosterOutputs {
  result: string;
  plans_json: string;
}

export function runPosterWorkflowStreaming(
  inputs: PosterInputs,
  callbacks: StreamCallbacks,
  user = "web-user"
): Promise<PosterOutputs> {
  return runGenericWorkflowStreaming(
    "/api/poster",
    inputs,
    callbacks,
    user
  );
}

// ==================== Video Script Workflow ====================

export interface VideoScriptInputs {
  topic: string;
  description: string;
  style: string;
  duration: string;
  platform: string;
}

export interface VideoScriptOutputs {
  result: string;
  total_duration: string;
  scene_count: number;
}

export function runVideoScriptWorkflowStreaming(
  inputs: VideoScriptInputs,
  callbacks: StreamCallbacks,
  user = "web-user"
): Promise<VideoScriptOutputs> {
  return runGenericWorkflowStreaming(
    "/api/script",
    {
      ...inputs,
      platform: PLATFORM_MAP[inputs.platform] ?? inputs.platform,
    },
    callbacks,
    user
  );
}

// ==================== Reviewer Workflow ====================

export interface ReviewerInputs {
  content: string;
  platform?: string;
  content_source?: string;
}

export interface ReviewerOutputs {
  result: string;
  final_status: "approved" | "revision_required" | "rejected";
  review_json: string;
  issue_count: number;
}

export function runReviewerWorkflowStreaming(
  inputs: ReviewerInputs,
  callbacks: StreamCallbacks,
  user = "web-user"
): Promise<ReviewerOutputs> {
  return runGenericWorkflowStreaming(
    "/api/reviewer",
    inputs,
    callbacks,
    user
  );
}

// ==================== Media Search Workflow ====================

export interface MediaSearchInputs {
  query: string;
  material_type: "all" | "video" | "image";
}

export interface MediaSearchOutputs {
  result: string;
  matches_json: string;
  match_count: number;
}

export function runMediaSearchWorkflow(
  inputs: MediaSearchInputs,
  user = "web-user"
): Promise<MediaSearchOutputs> {
  return runGenericWorkflow(
    "/api/media",
    inputs,
    user
  );
}

// ==================== Planner Workflow ====================

export interface PlannerInputs {
  goal: string;
  audience: string;
  platforms: string;
  time_range: string;
  background: string;
  accident_data?: string;
}

export interface PlannerOutputs {
  result: string;
}

export function runPlannerWorkflowStreaming(
  inputs: PlannerInputs,
  callbacks: StreamCallbacks,
  user = "web-user"
): Promise<PlannerOutputs> {
  return runGenericWorkflowStreaming(
    "/api/planner",
    inputs,
    callbacks,
    user
  );
}

// ==================== Analytics Workflow ====================

export interface AnalyticsInputs {
  wechat_data: string;
  weibo_data: string;
  douyin_data: string;
  analysis_month: string;
  focus_area: string;
}

export interface AnalyticsOutputs {
  result: string;
  summary_json: string;
}

export function runAnalyticsWorkflowStreaming(
  inputs: AnalyticsInputs,
  callbacks: StreamCallbacks,
  user = "web-user"
): Promise<AnalyticsOutputs> {
  return runGenericWorkflowStreaming(
    "/api/analytics",
    inputs,
    callbacks,
    user
  );
}

// ==================== Topic Recommender Workflow ====================

export interface TopicRecommenderInputs {
  current_month: string;
  accident_data: string;
  recent_topics?: string;
}

export interface TopicRecommenderOutputs {
  result: string;
  topics_json: string;
}

export function runTopicRecommenderWorkflowStreaming(
  inputs: TopicRecommenderInputs,
  callbacks: StreamCallbacks,
  user = "web-user"
): Promise<TopicRecommenderOutputs> {
  return runGenericWorkflowStreaming(
    "/api/recommender",
    inputs,
    callbacks,
    user
  );
}

// ==================== Precision Outreach Workflow ====================

export interface PrecisionInputs {
  accident_data: string;
  target_type: string;
  target_name: string;
  output_format: string;
}

export interface PrecisionOutputs {
  result: string;
  outreach_json: string;
}

export function runPrecisionWorkflowStreaming(
  inputs: PrecisionInputs,
  callbacks: StreamCallbacks,
  user = "web-user"
): Promise<PrecisionOutputs> {
  return runGenericWorkflowStreaming(
    "/api/precision",
    inputs,
    callbacks,
    user
  );
}

// ==================== Courseware Generator Workflow ====================

export interface CoursewareInputs {
  topic: string;
  audience: string;
  duration: string;
  focus_area: string;
  accident_data?: string;
}

export interface CoursewareOutputs {
  result: string;
  slides_json: string;
  slide_count: number;
}

export function runCoursewareWorkflowStreaming(
  inputs: CoursewareInputs,
  callbacks: StreamCallbacks,
  user = "web-user"
): Promise<CoursewareOutputs> {
  return runGenericWorkflowStreaming(
    "/api/courseware",
    inputs,
    callbacks,
    user
  );
}

// ==================== Public Opinion Workflow ====================

export interface PublicOpinionInputs {
  event_description: string;
  event_type: string;
  urgency_level: string;
  existing_response?: string;
}

export interface PublicOpinionOutputs {
  result: string;
  analysis: string;
  response_json: string;
}

export function runPublicOpinionWorkflowStreaming(
  inputs: PublicOpinionInputs,
  callbacks: StreamCallbacks,
  user = "web-user"
): Promise<PublicOpinionOutputs> {
  return runGenericWorkflowStreaming(
    "/api/opinion",
    inputs,
    callbacks,
    user
  );
}

// ==================== Image Generator Workflow ====================

export interface ImageGenInputs {
  topic: string;
  style: string;
  scene_description: string;
  aspect_ratio: string;
}

export interface ImageGenOutputs {
  result: string;
  prompt_json: string;
}

export function runImageGenWorkflowStreaming(
  inputs: ImageGenInputs,
  callbacks: StreamCallbacks,
  user = "web-user"
): Promise<ImageGenOutputs> {
  return runGenericWorkflowStreaming(
    "/api/imagegen",
    inputs,
    callbacks,
    user
  );
}
