// Lenguas de Painani. Todo hardcodeado para la demo.
//
// ⚠️ BORRADORES. Ningún texto de este archivo está validado. Cada lengua tiene variantes
// regionales grandes (el mixteco y el zapoteco, sobre todo). Antes de usarlo con familias reales:
// textos y audios hechos por intérpretes de la comunidad de cada hospital.
//
// Audio: si existe /audio/<lengua>/<clave>.mp3 (grabado por un intérprete) se reproduce ese archivo;
// si no, el celular lee el texto con la voz en español de México.
import { NAH_TEXT } from "./demo";

export type LangId = "es" | "nah" | "yua" | "tzh" | "tzo" | "mix" | "zap" | "oto" | "hch" | "otra";

export type TextKey =
  | "listen" | "hoy" | "welcome" | "onbTitle" | "onbChoose" | "onbCard" | "onbCardSub" | "priv1" | "priv2"
  | "path" | "coming" | "urgentTitle" | "rest" | "cerca" | "ayuda"
  | "E01" | "E02" | "E03" | "E04" | "E05" | "E06" | "E07" | "E08" | "E09" | "E10" | "E11" | "B01" | "P03";

export interface Lengua {
  id: LangId;
  label: string; // nombre en la propia lengua
  name: string; // nombre en español, para "Escuchar en ..."
  sub: string; // nombre en español y variante del borrador
  text: Partial<Record<TextKey, string>>;
}

const NAH: Lengua["text"] = {
  ...(NAH_TEXT as Partial<Record<TextKey, string>>),
  onbCardSub: "Mitzmacaqueh ihcuac oquitlalihqueh mococoxqui. Noihqui hueli ticitaz in código.",
  priv1: "Zan timitzilhuizqueh tlen quitoa tepahtihcalli.",
  priv2: "Amo nican timitzilhuizqueh tlen quipia mococoxqui; yehhuatl tepahtiani mitzilhuiz.",
  cerca: "Nican ticittaz campa hueli ticochiz, titlacuaz ihuan ticohuaz pahtli, ahco tepahtihcalli.",
  ayuda: "Intla ticnequi titlahtoz ica ce tlacatl tlen quimati motlahtol, xictlaltzotzona nican.",
};

// Maya yucateco
const YUA: Lengua["text"] = {
  listen: "U'uy",
  hoy: "Bejla'e'",
  welcome: "Ba'ax ka wa'alik, Rosa. Teen Painani: yaan in wa'alik teech bix yaan a k'oja'an.",
  onbTitle: "Yaan k-a'alik teech bix yaan a k'oja'an",
  onbChoose: "Yéey a t'aan",
  onbCard: "Ts'íibt le ba'ax yaan ti' a tarjetai'",
  onbCardSub: "Ts'a'ab teech ka ts'íibta'ab a k'oja'an. Je'el xan u páajtal a xak'altik le código'.",
  priv1: "Chéen k-a'alik teech le ba'ax ku ya'alik le najil ts'aak yaajo'.",
  priv2: "Ma' k-a'alik teech u k'oja'anil; le ts'aak yaaj ku ya'alik teech.",
  path: "U bej a k'oja'an",
  coming: "Táan in taal",
  urgentTitle: "Le ts'aak yaaj u k'áat u t'aan tech",
  rest: "Bejla'e' mix ba'al k'a'abet. Je'el u páajtal a hanal wa a je'elel. Yaan k-t'aan teech.",
  cerca: "Way yaan tu'ux je'el u páajtal a wenel, a hanal yéetel a manik ts'aak, naats' ti' le najil ts'aak yaajo'.",
  ayuda: "Wa a k'áat a t'aan yéetel juntúul máak ku t'aanik a t'aan, péech' way.",
  E01: "A k'oja'an ts'o'ok u k'uchul urgencias. Táan u pa'atik u yila'al tumen ts'aak yaaj.",
  E02: "Táan u yáanta'al a k'oja'an.",
  E07: "Le ts'aak yaaj u k'áat u t'aan tech. Ko'ox tu módulo de informes.",
  E08: "K'a'abet a wáantaj. Il ba'ax k'a'abet.",
  B01: "Le ts'aak yaaj yaan u ya'alik teech bix yaan a k'oja'an ti' 14:00.",
};

// Tseltal
const TZH: Lengua["text"] = {
  listen: "A'iya",
  hoy: "Ya'tik",
  welcome: "Lek a wajlal, Rosa. Jo'on te Painani: ya kalbat bin ut'il ay a jchamel.",
  onbTitle: "Ya kalbatik bin ut'il ay a jchamel",
  onbChoose: "T'ujbilan a k'op",
  onbCard: "Ts'ibuya te bin ay ta a tarjeta",
  onbCardSub: "Ya'beyat k'alal la ts'ibuyot a jchamel. Ya xju' ya ak'el te código.",
  priv1: "Ja' nax ya kalbatik te bin ya yal te snail poxil.",
  priv2: "Ma' ya kalbatik te schamel; ja' ya yalbat te jpoxtawanej.",
  path: "Sbe a jchamel",
  coming: "Ya xtalon",
  urgentTitle: "Te jpoxtawanej ya sk'an ya xk'opoj awu'un",
  rest: "Ya'tik ma'yuk bin ya sk'an. Ya xju' ya ave' o ya xkux a wo'tan. Ya kik'atik.",
  cerca: "Li'i ya awil banti ya xju' ya xwayat, ya ave' sok ya amanbe poxil, nopol ta snail poxil.",
  ayuda: "Teme ya ak'an ya xk'opojat sok jtul winik ya sna' a k'op, nets'a li'i.",
  E01: "Ochix ta urgencias a jchamel. Ya smaliy ya yil te jpoxtawanej.",
  E02: "Yakalix ta koltayel a jchamel.",
  E07: "Te jpoxtawanej ya sk'an ya xk'opoj awu'un. Tal ta módulo de informes.",
  E08: "Ay bin ya sk'an ya akoltay. Ilawil bin ya sk'an.",
  B01: "Te jpoxtawanej ya yalbat bin ut'il ay a jchamel ta 14:00.",
};

// Tsotsil
const TZO: Lengua["text"] = {
  listen: "A'iyo",
  hoy: "Avie",
  welcome: "Kuxi avo'on, Rosa. Vu'un li Painani: ta jalbot k'u x-elan li ajchamele.",
  onbTitle: "Ta jalbekutik k'u x-elan li ajchamele",
  onbChoose: "T'ujo li ak'ope",
  onbCard: "Ts'ibao li k'usi oy ta atarjetae",
  onbCardSub: "Ak'bot k'alal la sts'ibaik li ajchamele. Xu' xtok xak'el li código.",
  priv1: "Ja' no'ox ta jalbekutik li k'usi ta xal li snail poxile.",
  priv2: "Mu jalbekutik li schamele; ja' ta xalbot li j-poxtavaneje.",
  path: "Sbe li ajchamele",
  coming: "Ta xtalon xa",
  urgentTitle: "Li j-poxtavaneje tsk'an ta xk'opoj avu'un",
  rest: "Avie mu'yuk k'usi tsk'an. Xu' ta ave' o ta xakux. Ta jik'atutik.",
  cerca: "Li'e ta xavil bu xu' ta xavay, ta ave' xchi'uk ta xamanbe poxil, nopol ta snail poxil.",
  ayuda: "Mi tsk'an ta xak'opoj xchi'uk jun krixchano ta sna' li ak'ope, net'o li'e.",
  E01: "Ochem xa ta urgencias li ajchamele. Ta smala ti ta xil j-poxtavaneje.",
  E02: "Ta xa koltaat li ajchamele.",
  E07: "Li j-poxtavaneje tsk'an ta xk'opoj avu'un. La' ta módulo de informes.",
  E08: "Oy k'usi tsk'an ta akoltaan. K'elo k'usi tsk'an.",
  B01: "Li j-poxtavaneje ta xalbot k'u x-elan li ajchamele ta 14:00.",
};

// Mixteco (borrador genérico; la variante debe ser la de la familia)
const MIX: Lengua["text"] = {
  listen: "Kuniso'o",
  hoy: "Vitin",
  welcome: "Na'a ñi, Rosa. Yu'u kuu Painani: ka'an ña'a xi'in yo'o naa ndiko'o na kue'e.",
  onbTitle: "Ka'an ña'a xi'in yo'o naa ndiko'o na kue'e",
  onbChoose: "Kaxin tu'un ro'o",
  onbCard: "Tee ña ndiko'o nu tarjeta ro'o",
  onbCardSub: "Ni sakuaa ro'o ña yo'o tiempu ni tee na ña kue'e. Kuvi koto ro'o código.",
  priv1: "Ña ka'an ve'e tatan kuiti ka'an ña'a xi'in yo'o.",
  priv2: "Ña kue'e ma ka'an ña'a; tatan ka'an xi'in yo'o.",
  path: "Ichi na kue'e",
  coming: "Kixi yu'u",
  urgentTitle: "Tatan kuni ka'an xi'in yo'o",
  rest: "Vitin ña'a ñu'u ña xiniñu'u. Kuvi kasi'i ro'o a kunduu ro'o. Kana ña'a yo'o.",
  cerca: "Yo'o kuni ro'o ndenu kuvi kusu ro'o, kasi'i ro'o ta kuaan ro'o tatan, yatin ve'e tatan.",
  ayuda: "Tu kuni ro'o ka'an xi'in in ñayivi ña ka'an tu'un ro'o, kaani yo'o.",
  E01: "Na kue'e ni kixa'a nu urgencias. Ndatu ña kuni tatan.",
  E02: "Chindee na na kue'e.",
  E07: "Tatan kuni ka'an xi'in yo'o. Kixi nu módulo de informes.",
  E08: "Ñu'u ña xiniñu'u. Kotó ña xiniñu'u.",
  B01: "Tatan ka'an xi'in yo'o naa ndiko'o na kue'e nu 14:00.",
};

// Zapoteco del Istmo (diidxazá)
const ZAP: Lengua["text"] = {
  listen: "Gucaadiaga",
  hoy: "Yanna",
  welcome: "Padiuxi, Rosa. Naa nga Painani: zabe lii xi modo nuu ni huará stiu.",
  onbTitle: "Zabedu lii xi modo nuu ni huará stiu",
  onbChoose: "Guixhe diidxa' stiu",
  onbCard: "Bicaa ni nuu lu tarjeta stiu",
  onbCardSub: "Biidicabe lii ora bicaacabe ni huará stiu. Zanda guiiyu código ca.",
  priv1: "Ni rabi hospital ngasi zabedu lii.",
  priv2: "Qué zabedu lii xi huará ni; doctor nga zabi lii.",
  path: "Neza ni huará stiu",
  coming: "Ma zedaya",
  urgentTitle: "Doctor racala'dxi' guini' ne lii",
  rest: "Yanna qué gasti' caquiiñe'. Zanda go' ne guiziilu. Zuni'du lii.",
  cerca: "Ndaa' zuuyu paraa zanda gásilu, go' ne gu'u remedio, gaxha de hospital.",
  ayuda: "Pa racala'dxu' guini'lu ne tobi ni nanna diidxa' stiu, bisaba ndaa'.",
  E01: "Ma bidxiña ni huará stiu urgencias. Doctor ziuuya laa.",
  E02: "Ma cacané doctor ni huará stiu.",
  E07: "Doctor racala'dxi' guini' ne lii. Biaba módulo de informes.",
  E08: "Nuu ni caquiiñe'. Biiya xi caquiiñe'.",
  B01: "Doctor zabi lii xi modo nuu ni huará stiu 14:00.",
};

// Otomí (hñähñu, Valle del Mezquital)
const OTO: Lengua["text"] = {
  listen: "Ü̱de",
  hoy: "Nu'bya",
  welcome: "Ki hats'i, Rosa. Nugi ri Painani: ga xiki'i hanja bi 'bu̱i ri tsa'ya.",
  onbTitle: "Ga xiki'i hanja bi 'bu̱i ri tsa'ya",
  onbChoose: "Huahni ri hñä",
  onbCard: "Ofo te bi 'bu̱i ha ri tarjeta",
  onbCardSub: "Bi uni'i nu'bu̱ bi ofo ri tsa'ya. Sa gi hyandi ri código.",
  priv1: "Ho'ä ga xiki'i te i ma ngu ñ'eni.",
  priv2: "Hingi ga xiki'i te pe̱ts'i ri tsa'ya; ri ñ'eni da xiki'i.",
  path: "Ri ñuu ri tsa'ya",
  coming: "Di ehe ya",
  urgentTitle: "Ri ñ'eni bi ne da ñä ko'i",
  rest: "Nu'bya hinte ne. Sa gi ñuni o gi ñ'ot'i. Ga mati'i.",
  cerca: "Nuua gi hyandi habu sa gi ahu̱, gi ñuni ne gi tai ri ñ'eni, ha ra ngu ñ'eni.",
  ayuda: "Nu'bu̱ gi ne gi ñä ko n'a ri jä'i da pädi ri hñä, ofo nuua.",
  E01: "Ya bi kut'i ri tsa'ya ha urgencias. Tu̱ni da hyandi ri ñ'eni.",
  E02: "Ya di fa̱ts'i ri tsa'ya.",
  E07: "Ri ñ'eni bi ne da ñä ko'i. Ehe ha módulo de informes.",
  E08: "Pe̱ts'i te ne. Hyandi te ne.",
  B01: "Ri ñ'eni da xiki'i hanja bi 'bu̱i ri tsa'ya ha 14:00.",
};

// Wixárika (huichol). Borrador mínimo: lo que falte se muestra y se lee en español.
const HCH: Lengua["text"] = {
  welcome: "Kepauxa, Rosa. Ne Painani: nepitixaxatani ke peyeika kwiniyame.",
  onbTitle: "Nepitixaxatani ke peyeika kwiniyame",
  onbChoose: "Pexeiya pemiti niukiyari",
  onbCard: "Xikuxa'ana tarjeta hepaine",
  onbCardSub: "Hospital pitimieme mekate kwiniyame.",
  priv1: "Hospital ke mutixaxata nexi nepitixaxatani.",
  priv2: "Doctor pitixaxatani kwiniyari.",
  urgentTitle: "Doctor pitixaxatanike",
  E07: "Doctor pitixaxatanike. Módulo de informes pereu.",
};

export const LENGUAS: Lengua[] = [
  { id: "es", label: "Español", name: "español", sub: "Caxtiltlahtolli", text: {} },
  { id: "nah", label: "Nāhuatlahtōlli", name: "náhuatl", sub: "Náhuatl (mexicano)", text: NAH },
  { id: "yua", label: "Maaya t'aan", name: "maya", sub: "Maya (yucateco)", text: YUA },
  { id: "tzh", label: "Bats'il k'op", name: "tseltal", sub: "Tseltal", text: TZH },
  { id: "tzo", label: "Bats'i k'op", name: "tsotsil", sub: "Tsotsil", text: TZO },
  { id: "mix", label: "Tu'un savi", name: "mixteco", sub: "Mixteco", text: MIX },
  { id: "zap", label: "Diidxazá", name: "zapoteco", sub: "Zapoteco (del Istmo)", text: ZAP },
  { id: "oto", label: "Hñähñu", name: "otomí", sub: "Otomí", text: OTO },
  { id: "hch", label: "Wixárika", name: "wixárika", sub: "Huichol", text: HCH },
  { id: "otra", label: "Otra lengua", name: "otra lengua", sub: "Le ayuda una voluntaria", text: {} },
];

export const lengua = (id: string) => LENGUAS.find((l) => l.id === id) ?? LENGUAS[0];

/** Texto en la lengua elegida, o undefined si es español / no hay borrador (se usa el español). */
export const tx = (lang: string, key?: string) => (key ? lengua(lang).text[key as TextKey] : undefined);

/** Ruta del audio grabado por intérprete (si no existe, se usa la voz del celular). */
export const audioOf = (lang: string, key: string) => (lang === "es" || lang === "otra" ? undefined : `/audio/${lang}/${key}.mp3`);

/** Audios grabados que de verdad existen en public/audio. Agregar aquí cada mp3 que suba un intérprete,
 * p. ej. "/audio/nah/E07.mp3". Mientras esté vacía, todo se lee con la voz del celular. */
export const AUDIO_FILES = new Set<string>([]);
