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
  // Dos huellas en marcha: el paso del mensajero.
  return (
    <svg {...base(props)} viewBox="0 0 32 32" stroke="none" fill="currentColor">
      <ellipse cx="10.5" cy="21" rx="4" ry="6.6" transform="rotate(-10 10.5 21)" />
      <circle cx="7.6" cy="11.6" r="1.3" />
      <circle cx="10.2" cy="10.6" r="1.4" />
      <circle cx="12.8" cy="11.4" r="1.2" />
      <ellipse cx="21.5" cy="15" rx="4" ry="6.6" transform="rotate(10 21.5 15)" opacity="0.7" />
      <circle cx="19.4" cy="5.4" r="1.2" opacity="0.7" />
      <circle cx="22" cy="4.7" r="1.4" opacity="0.7" />
      <circle cx="24.6" cy="5.6" r="1.3" opacity="0.7" />
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

export const Casa = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 11 12 4.5 20 11v8.5h-5.5v-5h-5v5H4V11Z" />
  </svg>
);
export const Mapa = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);
export const Ayuda = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.4M12 16.8v.01" />
  </svg>
);
export const Campana = (p: P) => (
  <svg {...base(p)}>
    <path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5l1.5-1.5ZM10 20.5h4" />
  </svg>
);
export const Cerrar = (p: P) => (
  <svg {...base(p)}>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  </svg>
);
export const Flecha = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 5.5 15.5 12 9 18.5" />
  </svg>
);
export const Señal = (p: P) => (
  <svg {...base(p)} stroke="none" fill="currentColor">
    <rect x="3" y="15" width="3" height="5" rx="1" />
    <rect x="8" y="11.5" width="3" height="8.5" rx="1" />
    <rect x="13" y="8" width="3" height="12" rx="1" />
    <rect x="18" y="4.5" width="3" height="15.5" rx="1" opacity="0.35" />
  </svg>
);
export const Bateria = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="7.5" width="16" height="9" rx="2.5" />
    <rect x="5" y="9.5" width="7" height="5" rx="1" fill="currentColor" stroke="none" />
    <path d="M21 10.5v3" />
  </svg>
);
