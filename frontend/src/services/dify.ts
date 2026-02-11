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

interface WorkflowResponse {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: string;
    outputs: WorkflowOutputs;
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

// ==================== API ====================

export async function runWorkflow(
  inputs: WorkflowInputs,
  user = "web-user"
): Promise<WorkflowOutputs> {
  const body = {
    inputs: {
      ...inputs,
      platform: PLATFORM_MAP[inputs.platform] ?? inputs.platform,
    },
    response_mode: "blocking",
    user,
  };

  const res = await fetch("/api/workflows/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new DifyApiError(res.status, text);
  }

  const json: WorkflowResponse = await res.json();

  if (json.data.status !== "succeeded") {
    throw new DifyApiError(
      500,
      json.data.error ?? `Workflow status: ${json.data.status}`
    );
  }

  return json.data.outputs;
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

export async function runWorkflowStreaming(
  inputs: WorkflowInputs,
  callbacks: StreamCallbacks,
  user = "web-user"
): Promise<WorkflowOutputs> {
  const body = {
    inputs: {
      ...inputs,
      platform: PLATFORM_MAP[inputs.platform] ?? inputs.platform,
    },
    response_mode: "streaming",
    user,
  };

  const res = await fetch("/api/workflows/run", {
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

  let finalOutputs: WorkflowOutputs | null = null;

  for await (const { data } of parseSSEStream(res.body)) {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(data);
    } catch {
      continue;
    }

    // Dify puts the event type inside the JSON payload, not in the SSE event: header
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
      const outputs = d.outputs as WorkflowOutputs | undefined;
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
