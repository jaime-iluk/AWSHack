// Iconos dibujados a mano en un solo trazo (1.75) para no depender de librerías.
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

// Huella: motivo de los códices para "camino recorrido". Es la marca de Painani.
export function Huella({ filled = true, ...props }: P & { filled?: boolean }) {
  return (
    <svg {...base(props)} viewBox="0 0 24 24" stroke="none" fill={filled ? "currentColor" : "none"}>
      <path
        d="M9.2 21.5c-2.1 0-3.4-1.6-3.2-3.9.2-2.4 1.1-4.3 1-6.6-.1-1.9.9-3.3 2.6-3.3 1.9 0 2.9 1.6 2.8 3.9-.1 2.2-.8 4.3-.6 6.4.2 2-.9 3.5-2.6 3.5Z"
        stroke={filled ? "none" : "currentColor"}
        strokeWidth={1.5}
      />
      <circle cx="7.3" cy="5.1" r="1.05" />
      <circle cx="9.5" cy="4.1" r="1.1" />
      <circle cx="11.7" cy="4.6" r="1" />
      <circle cx="13.4" cy="5.9" r="0.85" />
    </svg>
  );
}

export function Marca(props: P) {
  return (
    <svg {...base(props)} viewBox="0 0 32 32" stroke="none" fill="currentColor">
      <g transform="translate(2 6) scale(0.8)">
        <path d="M9.2 21.5c-2.1 0-3.4-1.6-3.2-3.9.2-2.4 1.1-4.3 1-6.6-.1-1.9.9-3.3 2.6-3.3 1.9 0 2.9 1.6 2.8 3.9-.1 2.2-.8 4.3-.6 6.4.2 2-.9 3.5-2.6 3.5Z" />
        <circle cx="7.3" cy="5.1" r="1.05" />
        <circle cx="9.5" cy="4.1" r="1.1" />
        <circle cx="11.7" cy="4.6" r="1" />
      </g>
      <g transform="translate(13 -1) scale(0.8)" opacity="0.55">
        <path d="M9.2 21.5c-2.1 0-3.4-1.6-3.2-3.9.2-2.4 1.1-4.3 1-6.6-.1-1.9.9-3.3 2.6-3.3 1.9 0 2.9 1.6 2.8 3.9-.1 2.2-.8 4.3-.6 6.4.2 2-.9 3.5-2.6 3.5Z" />
        <circle cx="7.3" cy="5.1" r="1.05" />
        <circle cx="9.5" cy="4.1" r="1.1" />
        <circle cx="11.7" cy="4.6" r="1" />
      </g>
    </svg>
  );
}

export const Play = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor" stroke="none" />
  </svg>
);
export const Telefono = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 4.5h3.2l1.6 4-2 1.3a10.5 10.5 0 0 0 6.4 6.4l1.3-2 4 1.6V19a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 3.5 6.1 1.5 1.5 0 0 1 5 4.5Z" />
  </svg>
);
export const Mensaje = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 5.5h15v10h-9l-4 3.5v-3.5h-2v-10Z" />
  </svg>
);
export const Check = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const Cama = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 18.5v-11M3.5 14.5h17v4M20.5 14.5v-2.5a2.5 2.5 0 0 0-2.5-2.5h-7v5M7 12a1.5 1.5 0 1 0 0-.01" />
  </svg>
);
export const Papel = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 3.5h7l4 4v13H7v-17ZM14 3.5v4h4M9.5 12h6M9.5 15.5h6" />
  </svg>
);
export const Persona = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
  </svg>
);
export const Reloj = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
export const Enviar = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 12 19.5 5l-4 14-3.5-5.5L4.5 12Z" />
  </svg>
);
export const Reiniciar = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12a7 7 0 1 0 2.1-5M5 4.5V8h3.5" />
  </svg>
);
