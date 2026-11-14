// Contrato compartido entre el carril A (pantalla) y el carril B (agente / avisos reales).
// No cambiar la forma de DemoState ni las acciones sin avisar al otro dev.
import {
  ADMISSION,
  BROADCAST_B01,
  HOSPITAL,
  NAH_AUDIO,
  NAH_PENDING,
  SERVICE_NAME,
  pendingByCode,
  statusByCode,
  type PendingCode,
  type StatusCode,
} from "@/data/demo";

export type MessageKind = "status" | "broadcast" | "pending" | "agent" | "family" | "sms" | "system";

export interface PhoneMessage {
  id: string;
  from: "service" | "family";
  kind: MessageKind;
  text: string;
  nah?: string; // texto validado en náhuatl (o marcador pendiente)
  audio?: string; // audio pregrabado
  critical?: boolean;
  at: number;
}

export type CallState = "idle" | "waiting" | "sms_sent" | "calling" | "coming";

export interface DemoState {
  ready: boolean;
  status: StatusCode;
  stage: number;
  lastChangeAt: number | null;
  nextReport: string | null; // "14:00"
  pendings: { code: PendingCode; at: number }[];
  messages: PhoneMessage[];
  call: { state: CallState; startedAt?: number; confirmedAt?: number; escalated?: "sms" | "call" };
  agentTyping: boolean;
}

export type DemoAction =
  | { type: "RESET"; now: number }
  | { type: "PUBLISH_STATUS"; code: StatusCode; now: number }
  | { type: "BROADCAST_B01"; hora: string; now: number }
  | { type: "ADD_PENDING"; code: PendingCode; now: number }
  | { type: "ESCALATE"; level: "sms" | "call"; now: number }
  | { type: "CONFIRM_COMING"; now: number }
  | { type: "FAMILY_MESSAGE"; text: string; now: number }
  | { type: "AGENT_REPLY"; text: string; now: number };

export const initialState: DemoState = {
  ready: false,
  status: ADMISSION.initialStatus,
  stage: 1,
  lastChangeAt: null,
  nextReport: null,
  pendings: [],
  messages: [],
  call: { state: "idle" },
  agentTyping: false,
};

const msg = (state: DemoState, m: Omit<PhoneMessage, "id">): PhoneMessage => ({
  ...m,
  id: `${m.at}-${state.messages.length}`,
});

function statusMessage(state: DemoState, code: StatusCode, now: number): PhoneMessage {
  const s = statusByCode(code);
  return msg(state, {
    from: "service",
    kind: "status",
    text: s.es,
    nah: NAH_PENDING,
    audio: NAH_AUDIO[code],
    critical: s.critical,
    at: now,
  });
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "RESET": {
      const base: DemoState = { ...initialState, ready: true, lastChangeAt: action.now };
      const welcome = msg(base, {
        from: "service",
        kind: "system",
        text: `Hola, ${ADMISSION.contactName}. Soy ${SERVICE_NAME}, el asistente automático de ${HOSPITAL.name}. Le avisaré aquí de cada cambio del folio ${ADMISSION.folio}. Si prefiere, puede hablar con una persona.`,
        at: action.now,
      });
      const first = statusMessage({ ...base, messages: [welcome] }, base.status, action.now);
      return { ...base, messages: [welcome, first] };
    }

    case "PUBLISH_STATUS": {
      const s = statusByCode(action.code);
      const next: DemoState = {
        ...state,
        status: action.code,
        stage: s.stage ?? state.stage,
        lastChangeAt: action.now,
        messages: [...state.messages, statusMessage(state, action.code, action.now)],
      };
      if (action.code === "E07") {
        next.call = { state: "waiting", startedAt: action.now };
      }
      return next;
    }

    case "BROADCAST_B01": {
      const text = BROADCAST_B01.replace("{area}", HOSPITAL.area)
        .replace("{hora}", action.hora)
        .replace("{lugar}", HOSPITAL.reportPlace);
      return {
        ...state,
        nextReport: action.hora,
        messages: [
          ...state.messages,
          msg(state, { from: "service", kind: "broadcast", text, nah: NAH_PENDING, audio: NAH_AUDIO.B01, at: action.now }),
        ],
      };
    }

    case "ADD_PENDING": {
      const withStatus = demoReducer(state, { type: "PUBLISH_STATUS", code: "E08", now: action.now });
      const p = pendingByCode(action.code);
      return {
        ...withStatus,
        pendings: [...withStatus.pendings, { code: action.code, at: action.now }],
        messages: [
          ...withStatus.messages,
          msg(withStatus, {
            from: "service",
            kind: "pending",
            text: `Pendiente para usted: ${p.es}. Toque el enlace para ver los pasos.`,
            critical: true,
            at: action.now,
          }),
        ],
      };
    }

    case "ESCALATE": {
      if (state.call.state === "coming" || state.call.state === "idle") return state;
      if (action.level === "sms") {
        return {
          ...state,
          call: { ...state.call, state: "sms_sent", escalated: "sms" },
          messages: [
            ...state.messages,
            msg(state, { from: "service", kind: "sms", text: `SMS: ${statusByCode("E07").es}`, critical: true, at: action.now }),
          ],
        };
      }
      return { ...state, call: { ...state.call, state: "calling", escalated: "call" } };
    }

    case "CONFIRM_COMING": {
      if (state.call.state === "idle" || state.call.state === "coming") return state;
      return {
        ...state,
        call: { ...state.call, state: "coming", confirmedAt: action.now },
        messages: [
          ...state.messages,
          msg(state, { from: "family", kind: "family", text: "Voy en camino", at: action.now }),
        ],
      };
    }

    case "FAMILY_MESSAGE":
      return {
        ...state,
        agentTyping: true,
        messages: [...state.messages, msg(state, { from: "family", kind: "family", text: action.text, at: action.now })],
      };

    case "AGENT_REPLY":
      return {
        ...state,
        agentTyping: false,
        messages: [...state.messages, msg(state, { from: "service", kind: "agent", text: action.text, at: action.now })],
      };
  }
}

// Derivado: "permiso para descansar".
export const canRest = (s: DemoState) => s.pendings.length === 0 && s.nextReport !== null && s.call.state !== "waiting" && s.call.state !== "sms_sent" && s.call.state !== "calling";
