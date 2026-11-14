// Datos de la demo de Sala Tranquila. Todo hardcodeado a propósito.
// Regla de producto: solo textos del catálogo; cero información clínica.
import catalog from "./status_catalog.json";

export type StatusCode =
  | "E01" | "E02" | "E03" | "E04" | "E05" | "E06"
  | "E07" | "E08" | "E09" | "E10" | "E11";
export type PendingCode = "P01" | "P02" | "P03" | "P04";
export type Lang = "es" | "nah";

export interface Status {
  code: StatusCode;
  stage: number | null;
  critical: boolean;
  es: string;
}

export const STATUSES = catalog.statuses as Status[];
export const STAGES = catalog.stages as { stage: number; es: string }[];
export const PENDING_TYPES = catalog.pending_types as { code: PendingCode; es: string }[];
export const BROADCAST_B01 = catalog.broadcasts.find((b) => b.code === "B01")!.es;
export const REST_PERMISSION = catalog.derived.rest_permission;

export const statusByCode = (code: StatusCode) => STATUSES.find((s) => s.code === code)!;
export const pendingByCode = (code: PendingCode) => PENDING_TYPES.find((p) => p.code === code)!;

export const HOSPITAL = {
  name: "Hospital General Ejemplo (IMSS-Bienestar)",
  area: "Urgencias adultos",
  reportPlace: "el módulo de informes de planta baja",
};

export const ADMISSION = {
  folio: "U-0231",
  token: "demo",
  contactName: "Rosa",
  lang: "nah" as Lang,
  initialStatus: "E01" as StatusCode,
};

// Botones que usa el guion de demo (en orden).
export const DEMO_BUTTONS = [
  { id: "E02", label: "Ya está en atención", role: "Enfermería" },
  { id: "B01", label: "Informe a las 14:00", role: "Informes" },
  { id: "E08", label: "Se necesitan donadores", role: "Enfermería" },
  { id: "E07", label: "El médico quiere hablar", role: "Trabajo social" },
] as const;
export type DemoButtonId = (typeof DEMO_BUTTONS)[number]["id"];

export const NEXT_REPORT_TIME = "14:00";

// Náhuatl: NO traducir al vuelo. Hasta tener el texto validado por intérprete,
// se muestra este marcador y se reproduce el audio pregrabado si existe.
export const NAH_PENDING = "[Aviso en náhuatl · pendiente de validar con intérprete]";
export const NAH_AUDIO: Partial<Record<StatusCode | "B01", string>> = {
  E02: "/audio/E02.mp3",
  E07: "/audio/E07.mp3",
  E08: "/audio/E08.mp3",
  B01: "/audio/B01.mp3",
};

export interface Place {
  id: string;
  type: "albergue" | "comedor" | "farmacia";
  name: string;
  walk: string;
  hours: string;
  cost: string;
  beds?: number;
  bedsReportedAt?: string;
}

// Lugares ficticios para la demo.
export const PLACES: Place[] = [
  {
    id: "alb-1",
    type: "albergue",
    name: "Albergue Casa Esperanza (ejemplo)",
    walk: "350 m · 5 min a pie",
    hours: "Abierto 24 horas",
    cost: "Gratuito",
    beds: 6,
    bedsReportedAt: "11:30",
  },
  {
    id: "com-1",
    type: "comedor",
    name: "Comedor comunitario La Mesa (ejemplo)",
    walk: "200 m · 3 min a pie",
    hours: "8:00 a 18:00",
    cost: "Cuota de recuperación $15",
  },
  {
    id: "far-1",
    type: "farmacia",
    name: "Farmacia 24 horas (ejemplo)",
    walk: "150 m · 2 min a pie",
    hours: "Abierto 24 horas",
    cost: "—",
  },
];

export const SUGGESTED_QUESTIONS = ["¿Dónde puedo dormir?", "¿Qué tiene mi esposo?"];
