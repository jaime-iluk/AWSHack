// Ilustraciones planas de Painani, dibujadas a mano en SVG (sin personajes de terceros).
// Paisaje: cerros, sol o luna, el hospital con su letrero "H" y el camino de huellas del mensajero.

export type Mood = "calma" | "atencion" | "descanso" | "camino";

const MOODS: Record<Mood, { sky: string; sun: string; far: string; near: string; road: string }> = {
  calma: { sky: "#d8ebff", sun: "#f6be3b", far: "#8fd3b0", near: "#2e9e6e", road: "#fdf1cf" },
  atencion: { sky: "#fde5d3", sun: "#f0843c", far: "#f6be3b", near: "#e59a2f", road: "#fff7e6" },
  descanso: { sky: "#1c2050", sun: "#fdf1cf", far: "#2d3478", near: "#3a4296", road: "#5961b8" },
  camino: { sky: "#dcf2e7", sun: "#f6be3b", far: "#5ba8f5", near: "#2f62e8", road: "#ffffff" },
};

function Huellitas({ color, points }: { color: string; points: [number, number, number][] }) {
  return (
    <g fill={color}>
      {points.map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={3.2} ry={5} transform={`rotate(${r} ${x} ${y})`} />
      ))}
    </g>
  );
}

export function Escena({ mood = "calma", className }: { mood?: Mood; className?: string }) {
  const c = MOODS[mood];
  return (
    <svg viewBox="0 0 360 180" className={className} aria-hidden preserveAspectRatio="xMidYMid slice">
      <rect width="360" height="180" fill={c.sky} />
      {mood === "descanso" ? (
        <g>
          <circle cx="282" cy="52" r="24" fill={c.sun} />
          <circle cx="294" cy="44" r="22" fill={c.sky} />
          {[
            [60, 30],
            [110, 58],
            [180, 26],
            [220, 70],
            [330, 96],
            [30, 84],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 2 ? 1.6 : 2.4} fill="#fdf1cf" />
          ))}
        </g>
      ) : (
        <circle cx="280" cy="58" r="30" fill={c.sun} />
      )}
      <g className="flota">
        <ellipse cx="80" cy="46" rx="30" ry="10" fill="#ffffff" opacity={mood === "descanso" ? 0.12 : 0.85} />
        <ellipse cx="98" cy="40" rx="18" ry="11" fill="#ffffff" opacity={mood === "descanso" ? 0.12 : 0.85} />
      </g>
      <path d="M0 120 C60 86 120 92 180 110 C240 128 300 96 360 104 V180 H0Z" fill={c.far} />
      {/* Hospital */}
      <g transform="translate(230 86)">
        <rect x="0" y="12" width="70" height="44" rx="4" fill="#ffffff" />
        <rect x="22" y="0" width="26" height="20" rx="3" fill="#ffffff" />
        <text x="35" y="15" textAnchor="middle" fontSize="13" fontWeight="800" fill={mood === "descanso" ? "#1c2050" : "#2f62e8"} fontFamily="system-ui">
          H
        </text>
        {[8, 26, 44].map((x) => (
          <rect key={x} x={x} y="24" width="12" height="10" rx="2" fill={mood === "descanso" ? "#fdf1cf" : c.sky} />
        ))}
        <rect x="29" y="40" width="12" height="16" rx="2" fill={c.near} />
      </g>
      <path d="M0 150 C70 122 150 128 220 146 C280 160 320 140 360 136 V180 H0Z" fill={c.near} />
      <path d="M20 180 C70 150 150 150 250 142" stroke={c.road} strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.9" />
      <Huellitas
        color={mood === "descanso" ? "#1c2050" : c.near}
        points={[
          [60, 162, 60],
          [86, 156, 70],
          [114, 152, 76],
          [142, 149, 82],
          [170, 147, 84],
          [198, 145, 86],
        ]}
      />
    </svg>
  );
}

// Miniaturas para listas (etapas, lugares). Cuadradas, un objeto simple sobre color plano.
export function Mini({ kind, className }: { kind: "registro" | "atencion" | "procedimiento" | "hospital" | "salida" | "albergue" | "comedor" | "farmacia" | "persona" | "tramite"; className?: string }) {
  const bg: Record<string, string> = {
    registro: "#fdf1cf",
    atencion: "#d8ebff",
    procedimiento: "#fde5d3",
    hospital: "#dcf2e7",
    salida: "#e8eeff",
    albergue: "#1c2050",
    comedor: "#fde5d3",
    farmacia: "#dcf2e7",
    persona: "#fdf1cf",
    tramite: "#d8ebff",
  };
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="14" fill={bg[kind]} />
      {kind === "registro" && (
        <g>
          <rect x="18" y="14" width="28" height="36" rx="4" fill="#ffffff" />
          <rect x="25" y="10" width="14" height="8" rx="3" fill="#f6be3b" />
          <rect x="23" y="26" width="18" height="3" rx="1.5" fill="#f6be3b" />
          <rect x="23" y="33" width="14" height="3" rx="1.5" fill="#ebe7e1" />
          <rect x="23" y="40" width="16" height="3" rx="1.5" fill="#ebe7e1" />
        </g>
      )}
      {kind === "atencion" && (
        <g>
          <path d="M32 47s-13-8-13-17a7 7 0 0 1 13-3.6A7 7 0 0 1 45 30c0 9-13 17-13 17Z" fill="#5ba8f5" />
          <path d="M24 32h5l2-4 3 7 2-3h4" stroke="#ffffff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {kind === "procedimiento" && (
        <g>
          <rect x="16" y="16" width="32" height="34" rx="4" fill="#ffffff" />
          <rect x="21" y="21" width="22" height="9" rx="2" fill="#f0843c" />
          <circle cx="40" cy="38" r="2.4" fill="#f0843c" />
          <rect x="22" y="12" width="20" height="5" rx="2.5" fill="#f0843c" opacity="0.5" />
        </g>
      )}
      {kind === "hospital" && (
        <g>
          <rect x="12" y="34" width="40" height="10" rx="3" fill="#2e9e6e" />
          <rect x="12" y="28" width="12" height="9" rx="3" fill="#ffffff" />
          <rect x="22" y="30" width="30" height="6" rx="3" fill="#8fd3b0" />
          <rect x="12" y="44" width="4" height="7" rx="1" fill="#2e9e6e" />
          <rect x="48" y="44" width="4" height="7" rx="1" fill="#2e9e6e" />
        </g>
      )}
      {kind === "salida" && (
        <g>
          <circle cx="40" cy="22" r="8" fill="#f6be3b" />
          <rect x="16" y="20" width="20" height="30" rx="3" fill="#2f62e8" />
          <rect x="20" y="24" width="12" height="26" rx="2" fill="#ffffff" />
          <circle cx="29" cy="37" r="1.6" fill="#2f62e8" />
        </g>
      )}
      {kind === "albergue" && (
        <g>
          <circle cx="45" cy="18" r="6" fill="#fdf1cf" />
          <circle cx="48" cy="16" r="5.5" fill="#1c2050" />
          <path d="M14 34 32 20l18 14v16H14V34Z" fill="#fdf1cf" />
          <rect x="28" y="38" width="8" height="12" rx="2" fill="#f6be3b" />
        </g>
      )}
      {kind === "comedor" && (
        <g>
          <path d="M14 32h36a18 14 0 0 1-36 0Z" fill="#f0843c" />
          <path d="M24 26c0-4 4-4 4-8M32 26c0-4 4-4 4-8" stroke="#f0843c" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.6" />
          <rect x="22" y="46" width="20" height="4" rx="2" fill="#f0843c" />
        </g>
      )}
      {kind === "farmacia" && (
        <g>
          <rect x="22" y="18" width="20" height="30" rx="5" fill="#ffffff" />
          <rect x="24" y="12" width="16" height="8" rx="2" fill="#2e9e6e" />
          <rect x="26" y="28" width="12" height="10" rx="2" fill="#2e9e6e" />
        </g>
      )}
      {kind === "persona" && (
        <g>
          <circle cx="32" cy="24" r="8" fill="#f0843c" />
          <path d="M16 50c2-10 8-14 16-14s14 4 16 14Z" fill="#f6be3b" />
        </g>
      )}
      {kind === "tramite" && (
        <g>
          <path d="M32 14s-11 12-11 20a11 11 0 0 0 22 0c0-8-11-20-11-20Z" fill="#f0843c" />
          <path d="M27 35a5 5 0 0 0 5 5" stroke="#ffffff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

// Nubes para la pantalla de respiración.
export function Nubes({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 800" className={className} aria-hidden preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="800" fill="#5ba8f5" />
      <g fill="#ffffff">
        <circle cx="60" cy="90" r="44" />
        <circle cx="120" cy="70" r="40" />
        <circle cx="170" cy="96" r="30" />
        <rect x="20" y="96" width="180" height="34" rx="17" />
      </g>
      <g fill="#ebe7e1">
        <circle cx="360" cy="150" r="70" />
        <circle cx="290" cy="190" r="50" />
      </g>
      <g fill="#ffffff">
        <circle cx="40" cy="700" r="80" />
        <circle cx="150" cy="740" r="70" />
        <circle cx="280" cy="720" r="90" />
        <circle cx="390" cy="680" r="70" />
        <rect x="0" y="740" width="400" height="60" />
      </g>
      <g fill="#ebe7e1" opacity="0.9">
        <circle cx="330" cy="620" r="46" />
        <circle cx="0" cy="620" r="50" />
      </g>
    </svg>
  );
}
