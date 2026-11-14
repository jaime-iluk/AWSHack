"use client";
// App de la familia (Painani). Vistas: bienvenida/vinculación, Hoy, Mensajes, Cerca, Ayuda.
// Momentos a pantalla completa: aviso urgente, llamada y respiración.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ADMISSION,
  HOSPITAL,
  PLACES,
  NAH_TEXT,
  REST_PERMISSION,
  SERVICE_NAME,
  STAGES,
  SUGGESTED_QUESTIONS,
  pendingByCode,
  statusByCode,
} from "@/data/demo";
import { canRest, type DemoState, type PhoneMessage } from "@/lib/reducer";
import { fmtElapsed, fmtTime } from "@/lib/useDemo";
import { Ayuda, Bateria, Campana, Casa, Cerrar, Check, Enviar, Flecha, Mapa, Marca, Mensaje, Play, Señal, Telefono } from "../Icons";
import { Escena, Mini, Nubes, type Mood } from "../Illustrations";
import { MapaCerca } from "./MapaCerca";
import { LENGUAS, audioOf, lengua, tx } from "@/data/lenguas";

type Tab = "hoy" | "mensajes" | "cerca" | "ayuda";
type Props = {
  state: DemoState;
  linked: boolean;
  onLinked: () => void;
  onAsk: (t: string) => void;
  onConfirm: () => void;
  fullscreen?: boolean; // en un celular real: sin marco ni barra de estado falsa
};

const STAGE_MINI = ["registro", "atencion", "procedimiento", "hospital", "salida"] as const;

// Voz: si existe el audio grabado por un intérprete, se reproduce; si no, el celular lee el texto
// en náhuatl con una voz en español de México (la ortografía del náhuatl se lee bien así).
function speak(text?: string) {
  if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  const voice = voices.find((v) => v.lang === "es-MX") ?? voices.find((v) => v.lang.startsWith("es"));
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? "es-MX";
  u.rate = 0.85;
  synth.speak(u);
}

function playAudio(src?: string, text?: string) {
  if (!src) return speak(text);
  // Si el mp3 aún no existe, onerror y play().catch disparan ambos: hablar solo una vez.
  let done = false;
  const fallback = () => {
    if (done) return;
    done = true;
    speak(text);
  };
  const a = new Audio(src);
  a.onerror = fallback;
  a.play().catch(fallback);
}

// Botón de audio en la lengua elegida. Sin texto en la lengua, lee el español.
function Escuchar({
  lang,
  text,
  es,
  k,
  className = "",
  tone = "claro",
}: {
  lang: string;
  text?: string;
  es: string;
  k?: string;
  className?: string;
  tone?: "claro" | "blanco" | "noche";
}) {
  const own = !!text;
  const listen = tx(lang, "listen");
  const tones = { claro: "bg-azul-claro text-azul", blanco: "bg-white text-azul", noche: "bg-white/15 text-white" };
  return (
    <button
      type="button"
      onClick={() => playAudio(own && k ? audioOf(lang, k) : undefined, own ? text : es)}
      aria-label={`Escuchar en ${own ? lengua(lang).name : "español"}`}
      className={`flex w-fit items-center gap-2 rounded-full py-1.5 pl-2.5 pr-3.5 text-sm font-bold ${tones[tone]} ${className}`}
    >
      <Play width={14} height={14} />{" "}
      {own && listen ? (
        <>
          <span lang={lang}>{listen}</span> <span className="font-semibold opacity-75">· Escuchar</span>
        </>
      ) : (
        "Escuchar"
      )}
    </button>
  );
}

function useClock() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);
  return fmtTime(now).replace(/\s?[ap]\.?\s?m\.?/i, "");
}

function moodOf(s: DemoState): Mood {
  if (s.call.state === "coming") return "camino";
  if (s.call.state !== "idle" || s.pendings.length > 0) return "atencion";
  if (canRest(s)) return "descanso";
  return "calma";
}

/* ---------- Botón principal (pastilla azul) ---------- */
function Primario({ children, onClick, tone = "azul" }: { children: React.ReactNode; onClick: () => void; tone?: "azul" | "jade" | "blanco" }) {
  const tones = {
    azul: "bg-azul text-white hover:bg-azul-oscuro",
    jade: "bg-jade text-white hover:bg-jade-oscuro",
    blanco: "bg-white text-tinta hover:bg-fondo",
  };
  return (
    <button type="button" onClick={onClick} className={`w-full rounded-full py-3.5 text-base font-extrabold transition-colors duration-200 ${tones[tone]}`}>
      {children}
    </button>
  );
}

/* ---------- Bienvenida y vinculación (Requisito 4) ---------- */
type Copy = {
  title: string; sub: string; choose: string; cont: string; cardTitle: string; cardSub: string;
  folio: string; code: string; link: string; privTitle: string; priv: string[]; accept: string; decline: string; note?: string;
};

const COPY_ES: Copy = {
  title: "Le avisamos cómo va su paciente",
  sub: "Para que no tenga que esperar en la sala.",
  choose: "¿En qué lengua le hablamos?",
  cont: "Continuar",
  cardTitle: "Escriba los datos de su tarjeta",
  cardSub: "Se los dieron al registrar a su paciente. También puede escanear el código.",
  folio: "Folio",
  code: "Código de 6 números",
  link: "Vincular mi teléfono",
  privTitle: "Antes de empezar",
  priv: [
    "Solo le avisamos lo que el hospital publica.",
    "Nunca le daremos información médica por aquí. Eso se lo dice el médico en persona.",
    "Sus datos se borran 30 días después del alta.",
  ],
  accept: "Acepto",
  decline: "No acepto",
};

// Borrador en náhuatl: validar con intérprete.
const COPY_NAH: Copy = {
  title: NAH_TEXT.onbTitle,
  sub: "Amo monequi timochiaz ipan calli tlen chiyalo.",
  choose: NAH_TEXT.onbChoose,
  cont: "Xicontoca",
  cardTitle: NAH_TEXT.onbCard,
  cardSub: "Mitzmacaqueh ihcuac oquitlalihqueh mococoxqui. Noihqui hueli ticitaz in código.",
  folio: "Folio",
  code: "Chicuacen tlapohualli",
  link: "Xiquilpi moteléfono",
  privTitle: "Achtopa",
  priv: [
    "Zan timitzilhuizqueh tlen quitoa tepahtihcalli.",
    "Amo nican timitzilhuizqueh tlen quipia mococoxqui; yehhuatl tepahtiani mitzilhuiz.",
    "Motlahtol polihuiz ipan 30 tonalli.",
  ],
  accept: "Quemah, nicselia",
  decline: "Amo",
};

const COPY_OTRA: Copy = { ...COPY_ES, note: "Una voluntaria le ayudará en su lengua. Mientras, le mostramos todo en español." };

// Copia del onboarding para cada lengua: lo que no tenga borrador se queda en español.
function copyFor(lang: string): Copy {
  if (lang === "nah") return COPY_NAH;
  if (lang === "otra") return COPY_OTRA;
  if (lang === "es") return COPY_ES;
  const t = (k: Parameters<typeof tx>[1]) => tx(lang, k);
  return {
    ...COPY_ES,
    title: t("onbTitle") ?? COPY_ES.title,
    choose: t("onbChoose") ?? COPY_ES.choose,
    cardTitle: t("onbCard") ?? COPY_ES.cardTitle,
    priv: [t("priv1") ?? COPY_ES.priv[0], t("priv2") ?? COPY_ES.priv[1], COPY_ES.priv[2]],
  };
}

// Texto principal en la lengua elegida; si es otra lengua, el español va debajo como apoyo.
function Bi({ main, es, nah, lang = "nah", className = "", subClass = "" }: { main: string; es: string; nah: boolean; lang?: string; className?: string; subClass?: string }) {
  const own = nah && main !== es;
  return (
    <>
      <span lang={own ? lang : "es"} className={`block ${className}`}>{main}</span>
      {own && <span className={`block text-tinta-suave ${subClass}`}>{es}</span>}
    </>
  );
}

function Onboarding({ onLinked, lang, setLang }: { onLinked: () => void; lang: string; setLang: (l: string) => void }) {
  const [step, setStep] = useState(0);
  const nah = lang === "nah"; // solo el náhuatl tiene botones y ayudas completos
  const native = lang !== "es" && lang !== "otra";
  const c = copyFor(lang);
  const es = COPY_ES;
  const privacyOwn = native && (tx(lang, "priv1") || tx(lang, "priv2")) ? `${c.priv[0]} ${c.priv[1]}` : undefined;
  const privacyText = privacyOwn ?? COPY_ES.priv.join(" ");
  // Al llegar a "Antes de empezar", el aviso de privacidad se lee en voz alta en la lengua elegida.
  useEffect(() => {
    if (step === 2) playAudio(privacyOwn ? audioOf(lang, "privacidad") : undefined, privacyText);
  }, [step, lang, privacyOwn, privacyText]);
  // Al tocar una lengua, se escucha el saludo en esa lengua: así se elige aunque no se lea.
  const pick = (id: string) => {
    setLang(id);
    const t = tx(id, "onbTitle");
    playAudio(t ? audioOf(id, "onbTitle") : undefined, t ?? (id === "otra" ? COPY_OTRA.note : COPY_ES.title));
  };
  const langs = LENGUAS;

  if (step === 0)
    return (
      <div key="o0" className="entra flex h-full flex-col">
        <div className="relative h-[24%] shrink-0 overflow-hidden">
          <Escena mood="calma" className="h-full w-full" />
          <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute -bottom-px left-0 h-8 w-full" aria-hidden>
            <path d="M0 10 C30 0 70 0 100 10Z" fill="#ffffff" />
          </svg>
        </div>
        <div className="relative z-10 -mt-14 flex shrink-0 flex-col items-center px-6">
          <span className="grid size-28 place-items-center rounded-[34px] bg-azul text-white ring-[6px] ring-white">
            <Marca width={84} height={84} />
          </span>
          <span translate="no" className="mt-2 text-[44px] font-extrabold leading-none tracking-[-0.02em]">
            {SERVICE_NAME}
          </span>
        </div>
        <div className="app-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6">
          <h2 className="mt-3 text-center">
            <Bi main={c.title} es={es.title} nah={native} lang={lang} className="text-[19px] font-extrabold leading-tight text-balance" subClass="mt-0.5 text-sm font-bold" />
          </h2>
          <Escuchar lang={lang} k="bienvenida" text={native && tx(lang, "onbTitle") ? `${c.title}. ${c.choose}.` : undefined} es={`${es.title}. ${es.choose}`} className="mx-auto mt-2" />
          <p className="mt-3 text-center">
            <Bi main={c.choose} es={es.choose} nah={native} lang={lang} className="text-base font-extrabold" subClass="text-sm font-bold" />
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Lengua">
            {langs.map((l) => {
              const on = lang === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => pick(l.id)}
                  className={`flex items-center justify-between gap-1 rounded-2xl border-2 px-3 py-2 text-left font-bold transition-colors duration-200 ${
                    on ? "border-transparent bg-linea" : "border-linea bg-white hover:border-tinta-suave/30"
                  }`}
                >
                  <span className="min-w-0">
                    <span lang={l.id === "otra" ? "es" : l.id} className="block leading-tight">{l.label}</span>
                    <span className="block text-xs font-semibold text-tinta-suave">{l.sub}</span>
                  </span>
                  <span className={`grid size-6 shrink-0 place-items-center rounded-full ${on ? "bg-tinta text-white" : "bg-fondo"}`}>{on && <Check width={14} height={14} />}</span>
                </button>
              );
            })}
          </div>
          {c.note && <p className="mt-2 text-center text-sm font-bold text-cafe">{c.note}</p>}
          <div className="mt-auto pt-4">
            <Primario onClick={() => setStep(1)}>{c.cont}</Primario>
          </div>
        </div>
      </div>
    );

  if (step === 1)
    return (
      <div key="o1" className="entra flex h-full flex-col">
        <div className="grid h-[30%] shrink-0 place-items-center bg-maiz">
          <div className="relative w-44 rotate-[-4deg] rounded-2xl bg-white p-4 shadow-[0_12px_24px_-10px_rgba(31,35,64,0.35)]">
            <p className="flex items-center gap-1.5 text-xs font-bold text-azul">
              <Marca width={16} height={16} /> {SERVICE_NAME}
            </p>
            <p className="text-2xl font-extrabold tabular">{ADMISSION.folio}</p>
            <div className="mt-2 grid grid-cols-6 gap-0.5" aria-hidden>
              {Array.from({ length: 36 }).map((_, i) => (
                <span key={i} className={`aspect-square rounded-[2px] ${(i * 7) % 5 < 2 ? "bg-tinta" : "bg-linea"}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="app-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-6">
          <h2>
            <Bi main={c.cardTitle} es={es.cardTitle} nah={native} lang={lang} className="text-[20px] font-extrabold leading-tight" subClass="mt-0.5 text-base font-bold leading-tight" />
          </h2>
          <Escuchar lang={lang} k="onbCard" text={native && tx(lang, "onbCard") ? c.cardTitle : undefined} es={`${es.cardTitle}. ${es.cardSub}`} className="mt-2" />
          <p className="mt-2 text-sm text-tinta-suave">{c.cardSub}</p>
          <label className="mt-5 text-sm font-bold text-tinta-suave" htmlFor="folio">
            {c.folio}
          </label>
          <input id="folio" readOnly value={ADMISSION.folio} className="mt-1 rounded-2xl bg-fondo px-4 py-3 text-lg font-extrabold tabular outline-none" />
          <p className="mt-4 text-sm font-bold text-tinta-suave">
            {c.code}
            {nah && <span className="font-semibold"> ({es.code})</span>}
          </p>
          <div className="mt-1 grid grid-cols-6 gap-2" aria-label="Código 482913">
            {"482913".split("").map((d, i) => (
              <span key={i} className="grid h-12 place-items-center rounded-xl bg-fondo text-xl font-extrabold tabular">
                {d}
              </span>
            ))}
          </div>
          <div className="mt-auto pt-4">
            <Primario onClick={() => setStep(2)}>{c.link}</Primario>
          </div>
        </div>
      </div>
    );

  return (
    <div key="o2" className="entra flex h-full flex-col">
      <div className="h-[26%] shrink-0 overflow-hidden">
        <Escena mood="camino" className="h-full w-full" />
      </div>
      <div className="app-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-5">
        <h2>
          <Bi main={c.privTitle} es={es.privTitle} nah={native} lang={lang} className="text-[22px] font-extrabold leading-tight" subClass="text-base font-bold" />
        </h2>
        <Escuchar lang={lang} k="privacidad" text={privacyOwn} es={privacyText} className="mt-2" />
        <ul className="mt-4 flex flex-col gap-3 text-[15px] leading-snug">
          {c.priv.map((line, i) => (
            <li key={line} className="flex gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-jade-claro text-jade-oscuro">
                <Check width={14} height={14} />
              </span>
              <span>
                <Bi main={line} es={es.priv[i]} nah={native} lang={lang} className={native && line !== es.priv[i] ? "font-bold" : ""} subClass="mt-0.5 text-[13px]" />
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <Primario onClick={onLinked}>{nah ? `${c.accept} (${es.accept})` : c.accept}</Primario>
          <button type="button" className="py-2 text-sm font-bold text-tinta-suave">
            {nah ? `${c.decline} (${es.decline})` : c.decline}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Hoy ---------- */
function Hoy({ state, onAsk, onBreathe, go, lang }: { state: DemoState; onAsk: (t: string) => void; onBreathe: () => void; go: (t: Tab) => void; lang: string }) {
  const s = statusByCode(state.status);
  const own = tx(lang, state.status);
  const restEs = REST_PERMISSION.replace("{hora}", state.nextReport ?? "");
  const mood = moodOf(state);
  const pending = state.pendings[0];
  const urgent = state.call.state !== "idle" && state.call.state !== "coming";

  return (
    <div key="hoy" className="entra pb-6">
      <header className="flex items-center justify-between px-5 pb-3 pt-2">
        <h2 className="text-2xl font-extrabold">
          {tx(lang, "hoy") ? (
            <>
              <span lang={lang}>{tx(lang, "hoy")}</span> <span className="text-base font-bold text-tinta-suave">Hoy</span>
            </>
          ) : (
            "Hoy"
          )}
        </h2>
        <button type="button" aria-label="Avisos" onClick={() => go("mensajes")} className="grid size-10 place-items-center rounded-full hover:bg-fondo">
          <Campana />
        </button>
      </header>

      <div className="mx-4 overflow-hidden rounded-3xl bg-white shadow-[0_2px_0_#ebe7e1]">
        <Escena mood={mood} className="h-36 w-full" />
        <div className="p-4">
          <p className={`text-sm font-extrabold ${urgent || pending ? "text-naranja" : "text-jade-oscuro"}`}>
            {urgent ? "Le necesitamos" : state.call.state === "coming" ? "Va en camino" : `Etapa ${state.stage} de ${STAGES.length}`}
          </p>
          {own ? (
            <>
              <p lang={lang} className="mt-1 text-lg font-extrabold leading-snug text-pretty">{own}</p>
              <p className="mt-1 text-sm leading-snug text-tinta-suave text-pretty">{s.es}</p>
            </>
          ) : (
            <p className="mt-1 text-lg font-extrabold leading-snug text-pretty">{s.es}</p>
          )}
          <p className="mt-1 text-xs text-tinta-suave tabular">Último aviso del hospital: {fmtTime(state.lastChangeAt)}</p>
          <Escuchar lang={lang} k={state.status} text={own} es={s.es} className="mt-3" />
        </div>
      </div>

      {pending && (
        <div className="mx-4 mt-3 flex items-center gap-3 rounded-3xl bg-maiz-claro p-4">
          <Mini kind="tramite" className="size-14 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold text-cafe">Se necesita algo de usted</p>
            {tx(lang, pending.code) && <p lang={lang} className="font-extrabold leading-tight">{tx(lang, pending.code)}</p>}
            <p className={tx(lang, pending.code) ? "text-sm leading-tight" : "font-extrabold leading-tight"}>{pendingByCode(pending.code).es}</p>
            <Escuchar lang={lang} k={pending.code} text={tx(lang, pending.code) ?? tx(lang, "E08")} es={pendingByCode(pending.code).es} tone="blanco" className="mt-2 text-xs" />
          </div>
          <button
            type="button"
            onClick={() => {
              onAsk("¿Qué trámites tengo que hacer?");
              go("mensajes");
            }}
            className="shrink-0 rounded-full bg-tinta px-3.5 py-2 text-sm font-bold text-white"
          >
            Ver qué hacer
          </button>
        </div>
      )}

      {canRest(state) && (
        <div className="mx-4 mt-3 rounded-3xl bg-noche p-4 text-white">
          {tx(lang, "rest") && <p lang={lang} className="mb-1.5 text-[15px] font-extrabold leading-snug text-pretty">{tx(lang, "rest")}</p>}
          <p className={`leading-snug text-pretty ${tx(lang, "rest") ? "text-sm text-white/80" : "text-[15px]"}`}>{restEs}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Escuchar lang={lang} k="rest" text={tx(lang, "rest")} es={restEs} tone="noche" />
            <button type="button" onClick={onBreathe} className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold hover:bg-white/25">
              Respirar un momento <Flecha width={16} height={16} />
            </button>
          </div>
        </div>
      )}

      <div className="mx-4 mt-3 flex items-center justify-between rounded-3xl bg-white px-4 py-3 shadow-[0_2px_0_#ebe7e1]">
        <span className="text-sm font-bold text-tinta-suave">Próximo informe médico</span>
        <span className="text-xl font-extrabold tabular">{state.nextReport ?? "Por confirmar"}</span>
      </div>

      <h3 className="mx-5 mt-6 text-lg font-extrabold">
        {tx(lang, "path") ? <span lang={lang}>{tx(lang, "path")}</span> : "El camino de su paciente"}
        {tx(lang, "path") && <span className="block text-sm font-bold text-tinta-suave">El camino de su paciente</span>}
      </h3>
      <ol className="relative mx-4 mt-3 flex flex-col gap-3">
        <span aria-hidden className="absolute bottom-6 left-[11px] top-6 border-l-2 border-dashed border-linea" />
        {STAGES.map((st, i) => {
          const done = st.stage < state.stage;
          const now = st.stage === state.stage;
          return (
            <li key={st.stage} className="relative flex items-center gap-3" aria-current={now ? "step" : undefined}>
              <span
                className={`relative z-10 grid size-6 shrink-0 place-items-center rounded-full border-2 ${
                  now ? "border-naranja bg-naranja" : done ? "border-jade bg-jade text-white" : "border-tinta-suave/40 bg-white"
                }`}
              >
                {done && <Check width={12} height={12} />}
              </span>
              <div className={`flex flex-1 items-center gap-3 rounded-2xl p-2.5 pr-3 ${now ? "bg-white shadow-[0_2px_0_#ebe7e1]" : "bg-transparent"}`}>
                <Mini kind={STAGE_MINI[i]} className={`size-12 shrink-0 ${!now && !done ? "opacity-50" : ""}`} />
                <div>
                  <p className={`font-extrabold ${!now && !done ? "text-tinta-suave" : ""}`}>{st.es}</p>
                  <p className="text-xs text-tinta-suave">{now ? "Aquí va ahora" : done ? "Listo" : "Más adelante"}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------- Mensajes ---------- */
function Burbuja({ m, lang }: { m: PhoneMessage; lang: string }) {
  const own = tx(lang, m.tkey);
  const showNah = !!own;
  if (m.kind === "sms") {
    return (
      <li className="entra self-center max-w-[88%] rounded-2xl bg-tinta/85 px-4 py-2 text-center text-sm text-white">
        <span className="block text-[11px] font-extrabold opacity-80">Mensaje SMS</span>
        {showNah && <span lang={lang} className="block font-bold">{own}</span>}
        <span className={showNah ? "mt-0.5 block text-xs opacity-80" : ""}>{m.text.replace(/^SMS:\s*/, "")}</span>
      </li>
    );
  }
  const mine = m.from === "family";
  return (
    <li
      className={`entra max-w-[86%] rounded-3xl px-4 py-3 text-[15px] leading-snug ${
        mine ? "self-end rounded-br-lg bg-azul text-white" : m.critical ? "self-start rounded-bl-lg bg-maiz-claro" : "self-start rounded-bl-lg bg-white shadow-[0_2px_0_#ebe7e1]"
      }`}
    >
      {m.critical && !mine && <span className="mb-0.5 block text-xs font-extrabold text-cafe">Le necesitamos</span>}
      {showNah ? (
        <>
          <p lang={lang} className="font-bold text-pretty">{own}</p>
          <p className={`mt-1 text-[13px] leading-snug ${mine ? "text-white/80" : "text-tinta-suave"}`}>{m.text}</p>
        </>
      ) : (
        <p className="text-pretty">{m.text}</p>
      )}
      {!mine && <Escuchar lang={lang} k={m.tkey} text={own} es={m.text} className="mt-2 text-xs" />}
      <p className={`mt-1 text-right text-[11px] tabular ${mine ? "text-white/75" : "text-tinta-suave"}`}>{fmtTime(m.at)}</p>
    </li>
  );
}

function Mensajes({ state, onAsk, lang }: { state: DemoState; onAsk: (t: string) => void; lang: string }) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
  }, [state.messages.length, state.agentTyping]);
  const send = (t: string) => {
    if (!t.trim()) return;
    onAsk(t);
    setText("");
  };
  return (
    <div key="mensajes" className="entra flex h-full flex-col">
      <header className="flex items-center gap-3 px-5 pb-3 pt-2">
        <span className="grid size-10 place-items-center rounded-full bg-cielo text-white">
          <Marca width={26} height={26} />
        </span>
        <div>
          <h2 className="text-lg font-extrabold leading-tight">{SERVICE_NAME}</h2>
          <p className="text-xs text-tinta-suave">Asistente automático, o una persona si la pide</p>
        </div>
      </header>
      <div className="app-scroll min-h-0 flex-1 overflow-y-auto bg-fondo px-3 py-4">
        <ol aria-live="polite" className="flex flex-col gap-2.5">
          {state.messages.map((m) => (
            <Burbuja key={m.id} m={m} lang={lang} />
          ))}
          {state.agentTyping && <li className="entra self-start rounded-3xl bg-white px-4 py-3 text-sm text-tinta-suave">Escribiendo…</li>}
        </ol>
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 overflow-x-auto bg-fondo px-3 pb-2 app-scroll">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button key={q} type="button" onClick={() => send(q)} className="shrink-0 rounded-full bg-white px-3.5 py-2 text-sm font-bold text-azul shadow-[0_2px_0_#ebe7e1]">
            {q}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
        className="flex items-center gap-2 bg-white p-2.5"
      >
        <label htmlFor="pregunta" className="sr-only">
          Escriba su pregunta
        </label>
        <input
          id="pregunta"
          name="pregunta"
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escriba su pregunta…"
          className="min-w-0 flex-1 rounded-full bg-fondo px-4 py-2.5 text-[15px] placeholder:text-tinta-suave"
        />
        <button type="submit" aria-label="Enviar pregunta" className="grid size-11 shrink-0 place-items-center rounded-full bg-azul text-white hover:bg-azul-oscuro">
          <Enviar />
        </button>
      </form>
    </div>
  );
}

/* ---------- Cerca ---------- */
function Cerca({ onAsk, go, lang }: { onAsk: (t: string) => void; go: (t: Tab) => void; lang: string }) {
  const [sel, setSel] = useState<string | null>("alb-1");
  const cercaEs = `Cerca del hospital: ${PLACES.map((p) => `${p.name.replace(" (ejemplo)", "")}, ${p.walk.replace("·", ",")}`).join(". ")}.`;
  return (
    <div key="cerca" className="entra px-4 pb-6">
      <header className="px-1 pb-3 pt-2">
        <h2 className="text-2xl font-extrabold">Cerca del hospital</h2>
        {tx(lang, "cerca") && <p lang={lang} className="mt-1 font-bold leading-snug text-pretty">{tx(lang, "cerca")}</p>}
        <p className="text-sm text-tinta-suave">Lugares revisados por voluntarias. Datos de ejemplo.</p>
        <Escuchar lang={lang} k="cerca" text={tx(lang, "cerca")} es={cercaEs} className="mt-2" />
      </header>
      <MapaCerca selected={sel} onSelect={setSel} />
      <ul className="mt-3 flex flex-col gap-3">
        {PLACES.map((p) => (
          <li
            key={p.id}
            onClick={() => setSel(p.id === sel ? null : p.id)}
            className={`flex cursor-pointer gap-3 rounded-3xl bg-white p-3 shadow-[0_2px_0_#ebe7e1] transition ${p.id === sel ? "ring-2 ring-azul" : ""}`}
          >
            <Mini kind={p.type} className="size-20 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-extrabold leading-tight">{p.name}</p>
                <button
                  type="button"
                  aria-label={`Escuchar: ${p.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSel(p.id);
                    speak(`${p.name.replace(" (ejemplo)", "")}. ${p.walk.replace("·", ",")}. ${p.hours}. ${p.cost === "—" ? "" : p.cost}`);
                  }}
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-azul-claro text-azul"
                >
                  <Play width={13} height={13} />
                </button>
              </div>
              <p className="mt-0.5 text-sm text-tinta-suave">{p.walk}</p>
              <p className="text-sm text-tinta-suave">
                {p.hours}. {p.cost}
              </p>
              {p.beds !== undefined && (
                <p className="mt-1 w-fit rounded-full bg-jade-claro px-2.5 py-0.5 text-xs font-extrabold text-jade-oscuro">
                  {p.beds} camas libres a las {p.bedsReportedAt}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => {
          onAsk("¿Dónde puedo dormir?");
          go("mensajes");
        }}
        className="mt-4 w-full rounded-full border-2 border-linea py-3 font-extrabold text-azul hover:bg-white"
      >
        Preguntar al asistente
      </button>
    </div>
  );
}

/* ---------- Ayuda ---------- */
function AyudaView({ onAsk, go, lang }: { onAsk: (t: string) => void; go: (t: Tab) => void; lang: string }) {
  const L = lengua(lang);
  const native = lang !== "es" && lang !== "otra";
  const ayudaEs = "Si quiere hablar con una persona que hable su lengua, toque el botón amarillo.";
  const ask = (q: string) => {
    onAsk(q);
    go("mensajes");
  };
  return (
    <div key="ayuda" className="entra px-4 pb-6">
      <header className="px-1 pb-3 pt-2">
        <h2 className="text-2xl font-extrabold">Ayuda</h2>
        {tx(lang, "ayuda") && <p lang={lang} className="mt-1 font-bold leading-snug text-pretty">{tx(lang, "ayuda")}</p>}
        <Escuchar lang={lang} k="ayuda" text={tx(lang, "ayuda")} es={ayudaEs} className="mt-2" />
      </header>
      <button type="button" onClick={() => ask("Quiero hablar con una persona")} className="flex w-full items-center gap-4 rounded-3xl bg-maiz p-4 text-left">
        <Mini kind="persona" className="size-16 shrink-0" />
        <span>
          <span className="block text-lg font-extrabold leading-tight">Hablar con una persona</span>
          <span className="text-sm">{native ? `Una voluntaria que habla español y ${L.name}` : "Una voluntaria o un intérprete"}</span>
        </span>
      </button>
      <ul className="mt-3 flex flex-col gap-2">
        {[
          { q: "¿Qué trámites tengo que hacer?", l: "Trámites y papeles", k: "tramite" as const },
          { q: "¿Cómo va mi paciente?", l: "¿Cómo va mi paciente?", k: "atencion" as const },
        ].map((x) => (
          <li key={x.l}>
            <button type="button" onClick={() => ask(x.q)} className="flex w-full items-center gap-3 rounded-3xl bg-white p-3 text-left font-extrabold shadow-[0_2px_0_#ebe7e1]">
              <Mini kind={x.k} className="size-12 shrink-0" />
              <span className="flex-1">{x.l}</span>
              <Flecha className="text-tinta-suave" />
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-5 px-1 text-sm text-tinta-suave">
        {HOSPITAL.name}. Folio <span className="tabular">{ADMISSION.folio}</span>. Para dejar de recibir avisos, escriba BAJA.
      </p>
    </div>
  );
}

/* ---------- Momentos a pantalla completa ---------- */
function AvisoUrgente({ state, onConfirm, lang }: { state: DemoState; onConfirm: () => void; lang: string }) {
  const own = tx(lang, "E07");
  const es = statusByCode("E07").es;
  const title = tx(lang, "urgentTitle");
  const nah = !!title;
  // Al llegar el aviso urgente, el celular lo dice en voz alta una vez, en la lengua elegida.
  useEffect(() => {
    playAudio(own ? audioOf(lang, "E07") : undefined, own ?? es);
  }, [lang, own, es]);
  return (
    <div role="alertdialog" aria-label="Aviso urgente" className="sube absolute inset-0 z-30 flex flex-col bg-naranja-claro">
      <div className="relative h-[42%] shrink-0 overflow-hidden">
        <Escena mood="atencion" className="h-full w-full" />
        <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute -bottom-px left-0 h-8 w-full" aria-hidden>
          <path d="M0 10 C30 0 70 0 100 10Z" fill="#fde5d3" />
        </svg>
      </div>
      <div className="flex flex-1 flex-col px-6 pb-6">
        <p className="text-center text-sm font-extrabold text-cafe">Aviso del hospital</p>
        {title && <p lang={lang} className="mt-1 text-center text-[26px] font-extrabold leading-tight text-balance">{title}</p>}
        <h2 className={`mt-1 text-center font-extrabold leading-tight text-balance ${nah ? "text-lg text-tinta-suave" : "text-[26px]"}`}>El médico quiere hablar con usted</h2>
        <p className="mt-2 text-center text-[15px] text-tinta-suave">Por favor regrese a informes en los próximos 20 minutos.</p>
        <Escuchar lang={lang} k="E07" text={own} es={es} tone="blanco" className="mx-auto mt-4" />
        <p className="mt-auto pb-3 text-center text-xs text-tinta-suave">
          {state.call.state === "sms_sent" ? "También le enviamos un SMS. Si no responde, le llamaremos." : "Si no responde, le avisaremos por SMS y llamada."}
        </p>
        <Primario onClick={onConfirm}>{tx(lang, "coming") ? `${tx(lang, "coming")}: voy en camino` : "Voy en camino"}</Primario>
      </div>
    </div>
  );
}

function Llamada({ onConfirm, lang }: { onConfirm: () => void; lang: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const said = tx(lang, "E07") ?? statusByCode("E07").es;
  const title = tx(lang, "urgentTitle");
  useEffect(() => {
    ref.current?.focus();
    // La llamada "habla": lee el aviso dos veces en la lengua elegida, como un audio de llamada.
    playAudio(undefined, `${said} ... ${said}`);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [said]);
  return (
    <div role="dialog" aria-modal="true" aria-label="Llamada entrante" className="entra absolute inset-0 z-40 flex flex-col items-center justify-between bg-noche px-8 py-16 text-white">
      <div className="text-center">
        <p className="text-sm opacity-75">Llamada entrante</p>
        <p className="mt-2 text-4xl font-extrabold">{SERVICE_NAME}</p>
        {title && <p lang={lang} className="mt-3 text-lg font-bold text-pretty">“{title}”</p>}
        <p className="mt-2 text-base opacity-80 text-pretty">Audio en {tx(lang, "E07") ? lengua(lang).name : "español"}: el médico quiere hablar con usted.</p>
      </div>
      <span className="grid size-28 place-items-center rounded-full bg-white/10">
        <Telefono width={48} height={48} className="timbre" />
      </span>
      <button ref={ref} type="button" onClick={onConfirm} className="w-full rounded-full bg-jade py-4 text-lg font-extrabold hover:bg-jade-oscuro">
        {tx(lang, "coming") ? `Contestar: ${tx(lang, "coming")}` : "Contestar: voy en camino"}
      </button>
    </div>
  );
}

function Respirar({ onClose }: { onClose: () => void }) {
  const CYCLE = 8000; // 4 s inhalar, 4 s exhalar
  const TOTAL = 3;
  const [t, setT] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setT(Date.now() - start), 100);
    return () => clearInterval(id);
  }, []);
  const done = t >= CYCLE * TOTAL;
  const inCycle = t % CYCLE;
  const inhaling = inCycle < CYCLE / 2;
  const left = Math.max(0, TOTAL - Math.floor(t / CYCLE));
  const scale = done ? 1 : inhaling ? 0.7 + 0.5 * (inCycle / (CYCLE / 2)) : 1.2 - 0.5 * ((inCycle - CYCLE / 2) / (CYCLE / 2));

  return (
    <div role="dialog" aria-modal="true" aria-label="Respirar un momento" className="sube absolute inset-0 z-30 overflow-hidden">
      <Nubes className="absolute inset-0 h-full w-full" />
      <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute left-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-white text-tinta">
        <Cerrar />
      </button>
      <div className="relative flex h-full flex-col items-center justify-center gap-6 px-10 text-white">
        <span
          aria-hidden
          className="size-28 rounded-full bg-white/25 motion-safe:transition-transform motion-safe:duration-100"
          style={{ transform: `scale(${scale})` }}
        />
        <p className="text-2xl font-extrabold">{done ? "Muy bien" : inhaling ? "Inhale" : "Exhale"}</p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/30">
          <span className="block h-full rounded-full bg-white" style={{ width: `${Math.min(100, (t / (CYCLE * TOTAL)) * 100)}%` }} />
        </div>
        <p className="text-center text-lg font-bold">{done ? "Le avisaremos si le necesitan." : `${left} ${left === 1 ? "respiración" : "respiraciones"} más`}</p>
      </div>
    </div>
  );
}

/* ---------- App ---------- */
export function PainaniApp({ state, linked, onLinked, onAsk, onConfirm, fullscreen = false }: Props) {
  const [tab, setTab] = useState<Tab>("hoy");
  const [lang, setLang] = useState("nah");
  const [breathing, setBreathing] = useState(false);
  const [banner, setBanner] = useState<PhoneMessage | null>(null);
  const [seen, setSeen] = useState(0);
  const lastCount = useRef(state.messages.length);
  const clock = useClock();

  const serviceCount = useMemo(() => state.messages.filter((m) => m.from === "service").length, [state.messages]);
  const unread = tab === "mensajes" ? 0 : Math.max(0, serviceCount - seen);

  // Al estar en Mensajes, todo queda leído.
  useEffect(() => {
    if (tab === "mensajes") setSeen(serviceCount);
  }, [tab, serviceCount]);

  // Notificación tipo push cuando llega algo nuevo y no está en Mensajes.
  useEffect(() => {
    const prev = lastCount.current;
    lastCount.current = state.messages.length;
    if (!linked || state.messages.length <= prev) return;
    const last = state.messages[state.messages.length - 1];
    if (last.from !== "service" || tab === "mensajes" || last.kind === "sms") return;
    setBanner(last);
  }, [state.messages, linked, tab]);

  useEffect(() => {
    if (!banner) return;
    const id = setTimeout(() => setBanner(null), 4500);
    return () => clearTimeout(id);
  }, [banner]);

  // Al confirmar o reiniciar, cerrar respiración si llega un aviso urgente.
  const urgent = state.call.state === "waiting" || state.call.state === "sms_sent";
  useEffect(() => {
    if (urgent) setBreathing(false);
  }, [urgent]);

  const NAV: { id: Tab; label: string; Icon: typeof Casa }[] = [
    { id: "hoy", label: "Hoy", Icon: Casa },
    { id: "mensajes", label: "Mensajes", Icon: Mensaje },
    { id: "cerca", label: "Cerca", Icon: Mapa },
    { id: "ayuda", label: "Ayuda", Icon: Ayuda },
  ];

  return (
    <div
      className={`relative flex h-full min-h-0 flex-col overflow-hidden bg-white ${
        fullscreen ? "pt-[env(safe-area-inset-top)]" : "rounded-[46px] border-[10px] border-tinta shadow-[0_30px_60px_-28px_rgba(31,35,64,0.55)]"
      }`}
    >
      {/* Barra de estado (solo en la maqueta de escritorio) */}
      {!fullscreen && <div className={`relative z-50 flex items-center justify-between px-6 pb-1 pt-2.5 text-[13px] font-extrabold transition-colors duration-200 ${state.call.state === "calling" ? "bg-noche text-white" : ""}`}>
        <span className="tabular">{clock}</span>
        <span className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-tinta" aria-hidden />
        <span className="flex items-center gap-1">
          <Señal width={16} height={16} />
          <Bateria width={20} height={20} />
        </span>
      </div>}

      {!linked ? (
        <div className="min-h-0 flex-1">
          <Onboarding onLinked={onLinked} lang={lang} setLang={setLang} />
        </div>
      ) : (
        <>
          <main className="app-scroll relative min-h-0 flex-1 overflow-y-auto">
            {tab === "hoy" && <Hoy state={state} onAsk={onAsk} onBreathe={() => setBreathing(true)} go={setTab} lang={lang} />}
            {tab === "mensajes" && <Mensajes state={state} onAsk={onAsk} lang={lang} />}
            {tab === "cerca" && <Cerca onAsk={onAsk} go={setTab} lang={lang} />}
            {tab === "ayuda" && <AyudaView onAsk={onAsk} go={setTab} lang={lang} />}
          </main>

          {state.call.state === "coming" && tab === "hoy" && (
            <p className="mx-4 mb-2 rounded-full bg-jade-claro px-4 py-2 text-center text-sm font-extrabold text-jade-oscuro">
              Le esperan en informes. Confirmó en <span className="tabular">{fmtElapsed(state.call.startedAt, state.call.confirmedAt)}</span>
            </p>
          )}

          <nav aria-label="Secciones" className="grid grid-cols-4 border-t border-linea bg-white px-2 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {NAV.map(({ id, label, Icon }) => {
              const on = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  aria-current={on ? "page" : undefined}
                  className={`relative flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-xs font-extrabold transition-colors duration-200 ${on ? "text-tinta" : "text-tinta-suave/70 hover:text-tinta"}`}
                >
                  <Icon width={24} height={24} strokeWidth={on ? 2.2 : 1.75} />
                  {label}
                  {id === "mensajes" && unread > 0 && (
                    <span className="absolute right-[22%] top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-naranja px-1 text-[11px] text-white tabular">{unread}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {banner && !urgent && state.call.state !== "calling" && (
            <button
              type="button"
              onClick={() => {
                setTab("mensajes");
                setBanner(null);
              }}
              className="baja absolute inset-x-3 top-10 z-40 flex gap-3 rounded-3xl bg-white/95 p-3 text-left shadow-[0_12px_30px_-10px_rgba(31,35,64,0.45)] backdrop-blur"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-cielo text-white">
                <Marca width={22} height={22} />
              </span>
              <span className="min-w-0">
                <span className="flex justify-between text-xs font-extrabold">
                  {SERVICE_NAME}
                  <span className="font-bold text-tinta-suave">ahora</span>
                </span>
                <span lang={tx(lang, banner.tkey) ? lang : undefined} className="line-clamp-2 text-sm font-bold leading-snug">
                  {tx(lang, banner.tkey) ?? banner.text}
                </span>
                {tx(lang, banner.tkey) && <span className="line-clamp-1 text-xs text-tinta-suave">{banner.text}</span>}
              </span>
            </button>
          )}

          {urgent && <AvisoUrgente state={state} onConfirm={onConfirm} lang={lang} />}
          {state.call.state === "calling" && <Llamada onConfirm={onConfirm} lang={lang} />}
          {breathing && !urgent && <Respirar onClose={() => setBreathing(false)} />}
        </>
      )}
    </div>
  );
}
