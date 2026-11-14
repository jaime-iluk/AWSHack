// Escena de Painani al estilo de un cuadro de estambre (nierika) huichol/wixárika:
// marco lila, campos de color, sol al centro, ramas, flores, líneas onduladas y figuras
// con doble contorno, como el estambre prensado en cera. Composición original: no copia
// ninguna obra ni usa símbolos ceremoniales (hikuri, venado, velas). Para un producto real,
// lo correcto es comisionar la obra a un artista wixárika.

export type Mood = "calma" | "atencion" | "descanso" | "camino";

const Y = "#ffd23f";
const O = "#ff7b00";
const M = "#e4007c";
const T = "#00c2b8";
const B = "#2f6bff";
const G = "#3bd16f";
const R = "#ff2d3d";
const W = "#ffffff";

type Pal = {
  border: string;
  fields: [string, string, string, string]; // arriba-izq, arriba-der, abajo-izq, abajo-der
  center: string;
  runner: string;
};

const MOODS: Record<Mood, Pal> = {
  calma: { border: "#c6a6ff", fields: ["#12948c", "#4a0d22", "#1b2a8f", "#8a6ae0"], center: "#6b1430", runner: R },
  atencion: { border: "#ffb0c8", fields: ["#b3122e", "#4a0a1e", "#5b0f2a", "#d9465a"], center: "#7a0f25", runner: B },
  descanso: { border: "#8f8cff", fields: ["#0f1d5c", "#150b33", "#0b0f2e", "#2b2a7a"], center: "#1a1450", runner: M },
  camino: { border: "#9fe8c9", fields: ["#0f7a5c", "#3a1a0f", "#0b3d33", "#1f9e7a"], center: "#5a2410", runner: R },
};

// Un trazo "de estambre": línea gruesa de un color con otra más delgada encima.
function Hilo({ d, a, b, w = 6 }: { d: string; a: string; b: string; w?: number }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={a} strokeWidth={w} />
      <path d={d} stroke={b} strokeWidth={w * 0.42} />
    </g>
  );
}

function Estrella({ x, y, c, s = 5 }: { x: number; y: number; c: string; s?: number }) {
  return (
    <g stroke={c} strokeWidth={1.6} strokeLinecap="round">
      {[0, 45, 90, 135].map((r) => (
        <line key={r} x1={x - s} y1={y} x2={x + s} y2={y} transform={`rotate(${r} ${x} ${y})`} />
      ))}
      <circle cx={x} cy={y} r={1.4} fill={W} stroke="none" />
    </g>
  );
}

function Flor({ x, y, a, b }: { x: number; y: number; a: string; b: string }) {
  return (
    <g>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <ellipse key={i} cx={x} cy={y - 6} rx={3} ry={5.5} fill={a} stroke={Y} strokeWidth={0.8} transform={`rotate(${i * 60} ${x} ${y})`} />
      ))}
      <circle cx={x} cy={y} r={3.4} fill={b} />
      <circle cx={x} cy={y} r={1.3} fill={W} />
    </g>
  );
}

// Sol al centro: rayos finos alternados, anillos concéntricos y cara sencilla.
function Sol({ cx, cy, night }: { cx: number; cy: number; night: boolean }) {
  if (night) {
    return (
      <g>
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return <circle key={i} cx={cx + Math.cos(a) * 30} cy={cy + Math.sin(a) * 30} r={1.3} fill={i % 2 ? Y : W} />;
        })}
        <circle cx={cx} cy={cy} r={20} fill={Y} stroke={W} strokeWidth={3} />
        <circle cx={cx + 8} cy={cy - 5} r={17} fill="#1a1450" />
      </g>
    );
  }
  return (
    <g>
      {Array.from({ length: 32 }).map((_, i) => {
        const a = (i / 32) * Math.PI * 2;
        const r2 = i % 2 ? 34 : 39;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * 22}
            y1={cy + Math.sin(a) * 22}
            x2={cx + Math.cos(a) * r2}
            y2={cy + Math.sin(a) * r2}
            stroke={i % 2 ? O : Y}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={20} fill={O} stroke={B} strokeWidth={2.4} />
      <circle cx={cx} cy={cy} r={14} fill={Y} stroke={R} strokeWidth={2} />
      <circle cx={cx - 4.5} cy={cy - 2} r={1.6} fill={R} />
      <circle cx={cx + 4.5} cy={cy - 2} r={1.6} fill={R} />
      <path d={`M${cx - 4} ${cy + 4} Q${cx} ${cy + 7.5} ${cx + 4} ${cy + 4}`} stroke={R} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </g>
  );
}

// Rama con hojas a cada lado del sol.
function Rama({ cx, cy, side }: { cx: number; cy: number; side: 1 | -1 }) {
  const pts = Array.from({ length: 7 }).map((_, i) => {
    const t = i / 6;
    return [cx + side * (44 + Math.sin(t * Math.PI) * 10), cy + 34 - t * 66] as const;
  });
  const d = "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L");
  return (
    <g>
      <Hilo d={d} a={G} b={Y} w={3.6} />
      {pts.slice(1).map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x + side * 6} cy={y - 2} rx={5} ry={2.2} fill={G} stroke={Y} strokeWidth={0.8} transform={`rotate(${side * -30} ${x + side * 6} ${y - 2})`} />
          <ellipse cx={x - side * 6} cy={y - 2} rx={5} ry={2.2} fill={G} stroke={Y} strokeWidth={0.8} transform={`rotate(${side * 30} ${x - side * 6} ${y - 2})`} />
        </g>
      ))}
    </g>
  );
}

// Roseta de rayos (abajo a la izquierda).
function Roseta({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {Array.from({ length: 20 }).map((_, i) => {
        const a = (i / 20) * Math.PI * 2;
        return (
          <line key={i} x1={x + Math.cos(a) * 15} y1={y + Math.sin(a) * 15} x2={x + Math.cos(a) * 24} y2={y + Math.sin(a) * 24} stroke={i % 2 ? Y : O} strokeWidth={2} strokeLinecap="round" />
        );
      })}
      <circle cx={x} cy={y} r={13} fill={T} stroke={O} strokeWidth={2} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <ellipse key={i} cx={x} cy={y - 6} rx={2} ry={5} fill={B} transform={`rotate(${i * 45} ${x} ${y})`} />
      ))}
      <circle cx={x} cy={y} r={2.6} fill={Y} />
    </g>
  );
}

// El painani: mensajero corriendo, figura de doble contorno.
function Mensajero({ x, y, c }: { x: number; y: number; c: string }) {
  const limbs = [
    `M${x - 2} ${y + 6} L${x - 8} ${y + 26}`, // torso
    `M${x - 3} ${y + 10} L${x + 8} ${y + 14} L${x + 16} ${y + 8}`, // brazo adelante
    `M${x - 3} ${y + 10} L${x - 14} ${y + 16} L${x - 20} ${y + 12}`, // brazo atrás
    `M${x - 8} ${y + 26} L${x + 4} ${y + 34} L${x + 6} ${y + 46}`, // pierna adelante
    `M${x - 8} ${y + 26} L${x - 18} ${y + 36} L${x - 28} ${y + 36}`, // pierna atrás
  ];
  return (
    <g>
      {limbs.map((d, i) => (
        <path key={`a${i}`} d={d} stroke={Y} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {limbs.map((d, i) => (
        <path key={`b${i}`} d={d} stroke={c} strokeWidth={3.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <circle cx={x} cy={y} r={6} fill={c} stroke={Y} strokeWidth={2} />
      <circle cx={x + 2} cy={y - 1} r={1.2} fill={W} />
      {/* el mensaje que lleva */}
      <rect x={x + 14} y={y + 2} width={8} height={6} rx={1} fill={W} stroke={O} strokeWidth={1.2} />
    </g>
  );
}

const wave = (x: number, y: number, n: number, h = 4) => `M${x} ${y}` + Array.from({ length: n }).map(() => ` q4 ${-h} 8 0 t8 0`).join("");

export function Escena({ mood = "calma", className }: { mood?: Mood; className?: string }) {
  const c = MOODS[mood];
  const night = mood === "descanso";
  const [tl, tr, bl, br] = c.fields;
  const cx = 180;
  const cy = 88;
  const diamond = `M${cx} 6 L${cx - 112} ${cy} L${cx} 174 L${cx + 112} ${cy} Z`;
  const inner = `M${cx} 18 L${cx - 98} ${cy} L${cx} 162 L${cx + 98} ${cy} Z`;
  const beads = [Y, O, M, T, W, G];
  return (
    <svg viewBox="0 0 360 180" className={className} aria-hidden preserveAspectRatio="xMidYMid slice">
      {/* campos de color */}
      <rect x="0" y="0" width="180" height="90" fill={tl} />
      <rect x="180" y="0" width="180" height="90" fill={tr} />
      <rect x="0" y="90" width="180" height="90" fill={bl} />
      <rect x="180" y="90" width="180" height="90" fill={br} />

      {/* esquina arriba-izq: líneas onduladas */}
      {[16, 27, 38].map((y, i) => (
        <Hilo key={y} d={wave(10, y, 4)} a={i % 2 ? O : Y} b={R} w={3.4} />
      ))}
      {/* esquina arriba-der: ondas verticales */}
      {[300, 314, 328, 342].map((x, i) => (
        <g key={x} transform={`rotate(90 ${x} 10)`}>
          <Hilo d={wave(x, 10, 2, 3)} a={i % 2 ? Y : O} b={M} w={3} />
        </g>
      ))}
      <g className="flota">
        <Flor x={262} y={22} a={M} b={Y} />
      </g>
      <Flor x={96} y={66} a={O} b={B} />

      {/* rombo central con doble marco de estambre */}
      <path d={diamond} fill={c.center} />
      <Hilo d={diamond} a={Y} b={R} w={6} />
      <Hilo d={inner} a={T} b={B} w={3} />

      <Rama cx={cx} cy={cy} side={-1} />
      <Rama cx={cx} cy={cy} side={1} />
      <Sol cx={cx} cy={cy} night={night} />
      <Flor x={cx} y={146} a={R} b={Y} />

      {/* abajo-izq: roseta; abajo-der: el mensajero */}
      <Roseta x={40} y={140} />
      <Mensajero x={318} y={106} c={c.runner} />

      {/* camino de huellas de chaquira, del mensajero hacia la izquierda */}
      <g fill={W}>
        {[
          [282, 166, -84],
          [258, 170, -90],
          [234, 166, -96],
          [126, 166, -84],
          [102, 170, -90],
        ].map(([x, y, r], i) => (
          <g key={i} transform={`rotate(${r} ${x} ${y})`}>
            <ellipse cx={x} cy={y} rx={2.8} ry={4.6} />
            <circle cx={x - 1.7} cy={y - 6.4} r={0.95} />
            <circle cx={x + 0.4} cy={y - 7.1} r={0.95} />
            <circle cx={x + 2.3} cy={y - 6.3} r={0.85} />
          </g>
        ))}
      </g>

      {/* estrellas y chaquiras sueltas */}
      {[
        [118, 18, Y],
        [236, 40, T],
        [24, 74, W],
        [338, 66, Y],
        [86, 112, O],
        [258, 128, Y],
        [70, 166, T],
      ].map(([x, y, col], i) => (
        <Estrella key={i} x={x as number} y={y as number} c={col as string} />
      ))}
      {Array.from({ length: 34 }).map((_, i) => {
        const x = 8 + ((i * 53) % 344);
        const y = 8 + ((i * 37) % 164);
        const dx = Math.abs(x - cx) / 112 + Math.abs(y - cy) / 82;
        if (dx < 1.08) return null; // fuera del rombo
        return <circle key={i} cx={x} cy={y} r={i % 3 ? 1.4 : 2.1} fill={beads[i % beads.length]} />;
      })}

      {/* marco lila */}
      <rect x="2.5" y="2.5" width="355" height="175" fill="none" stroke={c.border} strokeWidth={5} />
      <rect x="6.5" y="6.5" width="347" height="167" fill="none" stroke="#3a2470" strokeWidth={1.4} />
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
