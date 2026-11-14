"use client";

// Mapa interactivo hardcodeado de la zona alrededor del hospital (datos de ejemplo).
// Se puede arrastrar, hacer zoom con los botones y tocar cada pin para ver la ruta a pie.
import { useRef, useState } from "react";
import { PLACES, type Place } from "@/data/demo";

const HOSP = { x: 180, y: 170 };

// Posición de cada lugar en el plano (siempre sobre una esquina de calles).
const POS: Record<string, { x: number; y: number }> = {
  "alb-1": { x: 250, y: 90 },
  "com-1": { x: 120, y: 230 },
  "far-1": { x: 250, y: 230 },
};

const TYPE: Record<Place["type"], { color: string; label: string; glyph: string }> = {
  albergue: { color: "#2e9e6e", label: "Dormir", glyph: "M-5 2 h10 M-5 2 v-5 M5 2 v-3 M-5 -1 h10 M-3 -3 h2" },
  comedor: { color: "#f0843c", label: "Comer", glyph: "M-3 -5 v10 M-5 -5 v3 q2 2 4 0 v-3 M3 -5 q3 2 0 5 v5" },
  farmacia: { color: "#e4007c", label: "Farmacia", glyph: "M0 -5 v10 M-5 0 h10" },
};

const V = [60, 120, 180, 250, 310];
const H = [40, 90, 170, 230, 280];

function route(p: { x: number; y: number }) {
  // Por las calles: primero sobre la avenida, luego la calle transversal.
  return `M${HOSP.x} ${HOSP.y} L${p.x} ${HOSP.y} L${p.x} ${p.y}`;
}

export function MapaCerca({ selected, onSelect }: { selected: string | null; onSelect: (id: string | null) => void }) {
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const drag = useRef<{ px: number; py: number; x: number; y: number; moved: boolean } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const sel = PLACES.find((p) => p.id === selected);

  const scale = () => {
    const r = svgRef.current?.getBoundingClientRect();
    return r ? 360 / r.width : 1;
  };
  const zoom = (f: number) =>
    setView((v) => {
      const k = Math.min(2.4, Math.max(1, v.k * f));
      // Mantener el centro del mapa al hacer zoom.
      const cx = 180, cy = 150;
      return { k, x: cx - ((cx - v.x) * k) / v.k, y: cy - ((cy - v.y) * k) / v.k };
    });
  const center = (p: { x: number; y: number }, k = view.k) => setView({ k, x: 180 - p.x * k, y: 150 - p.y * k });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#efe9df] shadow-[0_2px_0_#ebe7e1]">
      <svg
        ref={svgRef}
        viewBox="0 0 360 300"
        className="block h-72 w-full touch-none select-none"
        role="img"
        aria-label="Mapa de lugares cerca del hospital"
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          drag.current = { px: e.clientX, py: e.clientY, x: view.x, y: view.y, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const s = scale();
          const dx = (e.clientX - d.px) * s;
          const dy = (e.clientY - d.py) * s;
          if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
          setView((v) => ({ ...v, x: d.x + dx, y: d.y + dy }));
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`} style={{ transition: drag.current ? "none" : "transform 300ms ease" }}>
          <rect x={-200} y={-200} width={760} height={700} fill="#efe9df" />
          {/* manzanas */}
          {V.slice(0, -1).map((x, i) =>
            H.slice(0, -1).map((y, j) => (
              <rect key={`${i}-${j}`} x={x + 7} y={y + 7} width={V[i + 1] - x - 14} height={H[j + 1] - y - 14} rx={4} fill={(i + j) % 5 === 3 ? "#cdeccf" : "#f8f4ec"} />
            )),
          )}
          {/* hospital */}
          <rect x={127} y={97} width={46} height={66} rx={5} fill="#d8ebff" stroke="#2f62e8" strokeWidth={1.5} />
          <path d="M150 122 v14 M143 129 h14" stroke="#ff2d3d" strokeWidth={4} strokeLinecap="round" />
          <text x={150} y={154} textAnchor="middle" fontSize={8} fontWeight={800} fill="#2149c4">Hospital</text>
          {/* calles */}
          {V.map((x) => (
            <line key={`v${x}`} x1={x} y1={-200} x2={x} y2={500} stroke="#fff" strokeWidth={x === 180 ? 12 : 8} />
          ))}
          {H.map((y) => (
            <line key={`h${y}`} x1={-200} y1={y} x2={560} y2={y} stroke="#fff" strokeWidth={y === 170 ? 12 : 8} />
          ))}
          <text x={34} y={166} fontSize={7} fontWeight={700} fill="#8a8698">Av. Principal</text>
          <text x={185} y={30} fontSize={7} fontWeight={700} fill="#8a8698" transform="rotate(90 185 30)">Calle 5</text>
          {/* ruta a pie */}
          {sel && POS[sel.id] && (
            <path
              key={sel.id}
              d={route(POS[sel.id])}
              fill="none"
              stroke="#2f62e8"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1 7"
              className="ruta"
            />
          )}
          {/* usted está aquí: entrada de urgencias */}
          <circle cx={HOSP.x} cy={HOSP.y} r={12} fill="#2f62e8" opacity={0.18} className="pulso" />
          <circle cx={HOSP.x} cy={HOSP.y} r={6} fill="#2f62e8" stroke="#fff" strokeWidth={2.5} />
          {/* pines */}
          {PLACES.map((p) => {
            const pos = POS[p.id];
            if (!pos) return null;
            const t = TYPE[p.type];
            const on = p.id === selected;
            const s = on ? 1.25 : 1;
            return (
              <g
                key={p.id}
                role="button"
                tabIndex={0}
                aria-label={p.name}
                className="cursor-pointer"
                transform={`translate(${pos.x} ${pos.y}) scale(${s / view.k})`}
                onPointerUp={(e) => {
                  if (drag.current?.moved) return;
                  e.stopPropagation();
                  drag.current = null;
                  onSelect(on ? null : p.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(on ? null : p.id);
                }}
              >
                <path d="M0 0 C-4 -6 -13 -12 -13 -22 A13 13 0 1 1 13 -22 C13 -12 4 -6 0 0 Z" fill={t.color} stroke="#fff" strokeWidth={2.5} />
                <g transform="translate(0 -22)">
                  <path d={t.glyph} stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                {on && (
                  <g transform="translate(0 -44)">
                    <rect x={-28} y={-9} width={56} height={15} rx={7.5} fill="#1f2340" />
                    <text y={2} textAnchor="middle" fontSize={8} fontWeight={800} fill="#fff">
                      {t.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* controles */}
      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-2xl bg-white shadow-md">
        <button type="button" aria-label="Acercar" onClick={() => zoom(1.35)} className="size-10 text-xl font-extrabold text-tinta hover:bg-fondo">
          +
        </button>
        <span className="h-px bg-linea" />
        <button type="button" aria-label="Alejar" onClick={() => zoom(1 / 1.35)} className="size-10 text-xl font-extrabold text-tinta hover:bg-fondo">
          −
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          onSelect(null);
          setView({ x: 0, y: 0, k: 1 });
        }}
        className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-azul shadow-md"
      >
        <span className="size-2.5 rounded-full bg-azul" /> Usted está aquí
      </button>
      {sel && POS[sel.id] && (
        <button
          type="button"
          onClick={() => center(POS[sel.id], Math.max(view.k, 1.6))}
          className="absolute bottom-3 right-3 rounded-full bg-azul px-3.5 py-2 text-xs font-extrabold text-white shadow-md"
        >
          Acercar a {TYPE[sel.type].label.toLowerCase()}
        </button>
      )}
      <p className="absolute bottom-3 left-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-tinta-suave">Mapa de ejemplo</p>
    </div>
  );
}
