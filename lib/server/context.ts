// Contrato del carril B: lo que el teléfono simulado manda a /api/agent.
// Es un subconjunto de DemoState (lib/reducer.ts): solo lo que el hospital ya publicó.

import { ADMISSION, STATUSES, PENDING_TYPES, type PendingCode, type StatusCode } from "@/data/demo";
import { initialState, type DemoState } from "@/lib/reducer";

export type AgentState = Pick<DemoState, "status" | "stage" | "nextReport" | "pendings">;

export interface AgentRequest {
  text: string;
  state?: Partial<AgentState>;
}

export type AgentSource = "bedrock" | "fallback" | "guardrail";

export interface AgentResponse {
  reply: string;
  source: AgentSource;
}

export interface AgentContext {
  folio: string;
  status: StatusCode;
  stage: number;
  nextReport: string | null;
  pendings: PendingCode[];
}

const STATUS_CODES = new Set<string>(STATUSES.map((s) => s.code));
const PENDING_CODES = new Set<string>(PENDING_TYPES.map((p) => p.code));

/** Valida lo que manda el cliente: solo códigos del catálogo, nada de texto libre. */
export function normalizeContext(raw: Partial<AgentState> | undefined): AgentContext {
  const s = raw ?? {};
  const status = typeof s.status === "string" && STATUS_CODES.has(s.status) ? s.status : ADMISSION.initialStatus;
  const stage = typeof s.stage === "number" && s.stage >= 1 && s.stage <= 5 ? Math.floor(s.stage) : 1;
  const nextReport = typeof s.nextReport === "string" && /^\d{1,2}:\d{2}$/.test(s.nextReport) ? s.nextReport : null;
  const pendings = Array.isArray(s.pendings)
    ? [...new Set(s.pendings.map((p) => (p as { code?: unknown })?.code).filter((c): c is PendingCode => typeof c === "string" && PENDING_CODES.has(c)))]
    : [];
  return { folio: ADMISSION.folio, status, stage, nextReport, pendings };
}

/** DemoState mínimo para reutilizar fixedAnswer() de lib/agent.ts como respaldo. */
export function toDemoState(ctx: AgentContext): DemoState {
  return {
    ...initialState,
    ready: true,
    status: ctx.status,
    stage: ctx.stage,
    nextReport: ctx.nextReport,
    pendings: ctx.pendings.map((code) => ({ code, at: 0 })),
  };
}
