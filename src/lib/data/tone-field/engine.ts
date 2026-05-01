/**
 * Tone Field engine — pattern-driven mock analysis.
 *
 * This is a deterministic, lexicon-based reader. Same input → same output.
 * It examines the copy across eight axes and synthesises an interpretive
 * tone map. The engine is intentionally modular: replace `analyseTone` with
 * an LLM call later and the page contract stays identical.
 */

import {
  AXES,
  LOADING_PHRASES,
  type AxisDef,
  type AxisId,
  type AxisReading,
  type MoodBand,
  type RefinementMove,
  type ToneReading,
  type TraitTag,
  type VoiceArchetype
} from './types';

// silence unused-import warnings for re-exported helpers
void LOADING_PHRASES;

// ---------------------------------------------------------------------------
// Seeded RNG (used only for tie-breaking selection — never for axis values)
// ---------------------------------------------------------------------------

function hash32(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function rng(): number {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Lexicons — each list contributes signal to one or more axes
// ---------------------------------------------------------------------------

const WARM_WORDS = [
  'warm','cozy','gentle','kind','friend','friendly','hello','hi','love','loved','letter','home','quiet','soft','slow','together','share','shared','care','careful','small','tiny','little','hand','handmade','yours','your','our','us','we','you','i','me','my'
];

const COOL_WORDS = [
  'platform','enterprise','scalable','infrastructure','industrial','rigorous','operational','solution','solutions','suite','framework','framework','vendor','organisation','organization','synchronised','aligned','workflow','workflows','pipeline','engine','runtime','controls','observability','compliance','governance','protocol','system','systems','engineered','automated','automation','utilities'
];

const SHARP_WORDS = [
  'cut','strip','sharp','sharpen','exact','precise','precisely','no','only','one','single','done','ship','shipped','live','clear','clean','direct','blunt','hard','hardened','strict','strict','strict','versus','no-','zero','final','definitive'
];

const SOFT_WORDS = [
  'maybe','perhaps','quietly','softly','slowly','sometimes','possibly','gently','warmth','dream','breath','whisper','almost','nearly','little','small','glow','light','wander','linger','breeze','tender','curl','rest'
];

const PREMIUM_WORDS = [
  'crafted','craftsmanship','curated','considered','editorial','restrained','refined','exclusive','private','quiet','select','rare','signature','timeless','elevated','intentional','heirloom','luxury','luxurious','boutique','atelier','studio','studio.','singular','distinguished','unmistakable','meticulous','immaculate','rigorous','elegant','elegance'
];

const ACCESSIBLE_WORDS = [
  'easy','simple','simply','quick','quickly','free','everyone','anyone','beginner','beginners','starter','onboarding','help','helpful','tip','tips','step','steps','start','starts','starting','plus','also','great','awesome','cool','fun','friendly'
];

const TECHNICAL_WORDS = [
  'api','sdk','endpoint','endpoints','runtime','latency','throughput','typescript','python','schema','schemas','protocol','protocols','observability','telemetry','workflow','workflows','agent','agents','orchestration','deploy','deployment','sla','rps','json','config','configurable','tokenize','tokenized','vector','embedding','dataset','inference','typed','interfaces','tracing','logs','metrics','spans','queries','postgres','sqlite','rest','grpc'
];

const POETIC_WORDS = [
  'evening','night','quiet','breath','letter','field','signal','wander','linger','soft','slow','memory','remember','remembered','remembers','distance','near','almost','nearly','little','small','dream','river','sky','window','room','candle','floor','first','light','still','silver','quiet.'
];

const URGENT_WORDS = [
  'now','today','immediately','urgent','urgently','fast','faster','asap','must','need','required','breaking','live','real-time','realtime','rapid','accelerate','accelerating','overnight','instantly','don\u2019t','can\u2019t','wait'
];

const CALM_WORDS = [
  'slowly','quietly','later','eventually','room','space','breathing','breath','still','rest','rests','linger','quiet','calm','consider','considered','considers','patient','patiently','careful'
];

const STRANGE_WORDS = [
  'strange','weird','odd','peculiar','secret','secretive','private','vault','wormhole','field','signal','transmission','specimen','laboratory','lab','glyph','glyphs','obscure','occult','arcane','cipher','codex','idiosyncratic','eccentric','beautifully','quietly','privately','unindexed'
];

const CONVENTIONAL_WORDS = [
  'leading','industry','market','best-in-class','enterprise','platform','solution','solutions','customer','customers','user','users','seamless','holistic','transformation','digital','modern','innovative','innovation','optimize','optimized','empower','empowering','unified','integrated','synergy','strategic'
];

const INTIMATE_WORDS = [
  'i','me','my','mine','you','your','yours','letter','first-person','built','myself','ourselves','hands','hand','quietly','small','tiny','little','room','letter','journal','notebook','dear','listen','listening'
];

const DISTANT_WORDS = [
  'organisation','organization','enterprise','customers','users','clients','stakeholders','industry','vendor','suite','platform','market','operational','strategic','alignment','engagement','solutions','offering','offerings'
];

const PLAYFUL_WORDS = [
  'silly','weird','tiny','snack','snacks','snack-','fun','funky','wobble','wobbly','goofy','playful','play','toy','toys','little','silly.','wink','smile','smiles','haha','lol','okay','ok','hey'
];

const SERIOUS_WORDS = [
  'mission','critical','operation','operations','security','compliance','governance','rigorous','strategic','enterprise','responsible','responsibly','accountable','formal','deliberate','rigour','rigor','meticulous','professional','disciplined','industrial'
];

// punctuation cues
const URGENT_PUNCT = /[!]+/g;
const POETIC_PUNCT = /\u2014|\u2013| — | – /g;
const TECHNICAL_PUNCT = /\b\d+(\.\d+)?(ms|s|x|%|gb|mb|kb|rps|qps)\b/gi;

// hedge words — flatten the field
const HEDGES = [
  'maybe','perhaps','possibly','probably','arguably','potentially','seems','appears','kind of','sort of','really','very','actually','basically','essentially','generally','typically','overall','quite','rather','somewhat'
];

// ---------------------------------------------------------------------------
// Tokenisation helpers
// ---------------------------------------------------------------------------

function lower(s: string): string {
  return s.toLowerCase();
}

function tokens(input: string): string[] {
  return input
    .toLowerCase()
    // keep apostrophes inside words; split on everything else
    .split(/[^a-z0-9\u2019']+/)
    .filter((t) => t.length > 0);
}

function sentences(input: string): string[] {
  return input
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z\u2018\u2019"'(\[])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function countMatches(text: string, list: string[]): number {
  // word-boundary count of each lexicon entry
  const t = ' ' + text.toLowerCase().replace(/[^a-z0-9\u2019' ]+/g, ' ') + ' ';
  let n = 0;
  for (const w of list) {
    const safe = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(?:^|\\s)' + safe + '(?:\\s|$)', 'g');
    const m = t.match(re);
    if (m) n += m.length;
  }
  return n;
}

function regexCount(text: string, re: RegExp): number {
  const m = text.match(re);
  return m ? m.length : 0;
}

// Map a raw signed score into [-1, 1] using a soft sigmoid
function squash(x: number, k = 0.45): number {
  // tanh-ish soft squash without Math.tanh dependency
  const v = x * k;
  return v / (1 + Math.abs(v));
}

// ---------------------------------------------------------------------------
// Axis scoring
// ---------------------------------------------------------------------------

interface RawSignals {
  text: string;
  toks: string[];
  sents: string[];
  // counts
  warm: number;
  cool: number;
  sharp: number;
  soft: number;
  premium: number;
  accessible: number;
  technical: number;
  poetic: number;
  urgent: number;
  calm: number;
  strange: number;
  conventional: number;
  intimate: number;
  distant: number;
  playful: number;
  serious: number;
  hedges: number;
  // structural
  exclamations: number;
  emDashes: number;
  techPunct: number;
  firstPerson: number;
  shortSentences: number;
  longSentences: number;
  avgLen: number;
}

function gatherSignals(text: string): RawSignals {
  const toks = tokens(text);
  const sents = sentences(text);
  const lens = sents.map((s) => s.split(/\s+/).length);
  const avgLen = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;

  let firstPerson = 0;
  for (const tok of toks) {
    if (tok === 'i' || tok === 'me' || tok === 'my' || tok === 'mine') firstPerson++;
  }

  return {
    text,
    toks,
    sents,
    warm: countMatches(text, WARM_WORDS),
    cool: countMatches(text, COOL_WORDS),
    sharp: countMatches(text, SHARP_WORDS),
    soft: countMatches(text, SOFT_WORDS),
    premium: countMatches(text, PREMIUM_WORDS),
    accessible: countMatches(text, ACCESSIBLE_WORDS),
    technical: countMatches(text, TECHNICAL_WORDS),
    poetic: countMatches(text, POETIC_WORDS),
    urgent: countMatches(text, URGENT_WORDS),
    calm: countMatches(text, CALM_WORDS),
    strange: countMatches(text, STRANGE_WORDS),
    conventional: countMatches(text, CONVENTIONAL_WORDS),
    intimate: countMatches(text, INTIMATE_WORDS),
    distant: countMatches(text, DISTANT_WORDS),
    playful: countMatches(text, PLAYFUL_WORDS),
    serious: countMatches(text, SERIOUS_WORDS),
    hedges: countMatches(text, HEDGES),
    exclamations: regexCount(text, URGENT_PUNCT),
    emDashes: regexCount(text, POETIC_PUNCT),
    techPunct: regexCount(text, TECHNICAL_PUNCT),
    firstPerson,
    shortSentences: lens.filter((l) => l <= 6).length,
    longSentences: lens.filter((l) => l >= 18).length,
    avgLen
  };
}

function scoreAxes(s: RawSignals): AxisReading[] {
  // structural nudges
  const shortBias = s.shortSentences - s.longSentences * 1.2;
  const punctSharp = s.exclamations + Math.max(0, s.shortSentences - 3) * 0.3;
  const punctPoetic = s.emDashes;

  // raw signed scores per axis (right pole = positive)
  const raw: Record<AxisId, number> = {
    // cool ↔ warm
    temperature: s.warm - s.cool + s.firstPerson * 0.5,
    // soft ↔ sharp
    edge: s.sharp - s.soft + punctSharp - s.hedges * 0.6 + Math.max(0, -shortBias) * -0.05,
    // accessible ↔ premium
    register: s.premium - s.accessible + (s.avgLen >= 14 ? 1 : 0) - (s.exclamations > 1 ? 1 : 0),
    // poetic ↔ technical
    mode: s.technical + s.techPunct - s.poetic - punctPoetic * 0.8,
    // calm ↔ urgent
    tempo: s.urgent + s.exclamations * 1.2 - s.calm - (s.avgLen >= 16 ? 1 : 0),
    // strange ↔ conventional
    familiarity: s.conventional - s.strange,
    // intimate ↔ distant
    distance: s.distant - s.intimate - s.firstPerson * 0.7,
    // playful ↔ serious
    gravity: s.serious - s.playful + (s.avgLen >= 16 ? 0.5 : 0)
  };

  const readings: AxisReading[] = AXES.map((axis: AxisDef) => {
    const v = squash(raw[axis.id]);
    const pole: AxisReading['pole'] = v < -0.18 ? 'left' : v > 0.18 ? 'right' : 'center';
    const label = axisLabel(axis, v, pole);
    return { id: axis.id, value: v, pole, label };
  });

  return readings;
}

function axisLabel(axis: AxisDef, v: number, pole: AxisReading['pole']): string {
  const a = Math.abs(v);
  const intensity = a >= 0.6 ? 'distinctly' : a >= 0.35 ? 'leans' : 'softly';
  if (pole === 'center') return `Balanced — neither ${axis.left.toLowerCase()} nor ${axis.right.toLowerCase()}`;
  const word = pole === 'right' ? axis.right : axis.left;
  if (intensity === 'distinctly') return `Distinctly ${word.toLowerCase()}`;
  if (intensity === 'leans') return `Leans ${word.toLowerCase()}`;
  return `Softly ${word.toLowerCase()}`;
}

// ---------------------------------------------------------------------------
// Synthesis — build the interpretive layer on top of the axis field
// ---------------------------------------------------------------------------

const SIGNATURES: { match: (a: Map<AxisId, number>) => boolean; sig: string; note: string }[] = [
  // calm precision
  {
    match: (a) =>
      a.get('tempo')! < -0.1 && a.get('edge')! > 0.1 && a.get('mode')! > 0.1,
    sig: 'Calm precision',
    note: 'Quiet on the surface, exact underneath. Reads engineered, not loud.'
  },
  // cinematic rebellion
  {
    match: (a) =>
      a.get('familiarity')! < -0.15 && a.get('edge')! > 0.15 && a.get('register')! > 0,
    sig: 'Cinematic rebellion',
    note: 'Sharp posture, unconventional vocabulary. Refuses the default brand register.'
  },
  // polished warmth
  {
    match: (a) =>
      a.get('temperature')! > 0.15 && a.get('register')! > 0.1 && a.get('edge')! < 0.2,
    sig: 'Polished warmth',
    note: 'Premium register, but still close to the reader. Considered, not cold.'
  },
  // eccentric intelligence
  {
    match: (a) =>
      a.get('familiarity')! < -0.1 && a.get('mode')! > -0.1 && a.get('register')! > 0,
    sig: 'Eccentric intelligence',
    note: 'Strange enough to notice, smart enough to trust. Reads cult-brand, not gimmick.'
  },
  // elite utility
  {
    match: (a) =>
      a.get('register')! > 0.2 && a.get('mode')! > 0.1 && a.get('gravity')! > 0,
    sig: 'Elite utility',
    note: 'Restrained, technical, clearly aimed at people who already know what they need.'
  },
  // playful mystery
  {
    match: (a) =>
      a.get('gravity')! < -0.1 && a.get('familiarity')! < -0.1,
    sig: 'Playful mystery',
    note: 'Tonally light, conceptually weird. Invites without explaining.'
  },
  // intimate clarity — needs real first-person closeness AND warmth, not just low distance
  {
    match: (a) =>
      a.get('distance')! < -0.35 && a.get('temperature')! > 0.2,
    sig: 'Intimate clarity',
    note: 'First-person, declarative, unafraid to be specific. A founder voice without theatre.'
  },
  // corporate flatness
  {
    match: (a) =>
      a.get('familiarity')! > 0.25 && a.get('distance')! > 0.1 && a.get('temperature')! < 0,
    sig: 'Corporate flatness',
    note: 'Familiar enterprise vocabulary, low felt presence. Recognisable at distance, forgettable up close.'
  },
  // urgent direct
  {
    match: (a) => a.get('tempo')! > 0.3 && a.get('edge')! > 0.1,
    sig: 'Urgent direct',
    note: 'Pressing, no decoration. Pushes toward action faster than it builds atmosphere.'
  },
  // editorial restraint
  {
    match: (a) => a.get('register')! > 0.1 && a.get('tempo')! < 0,
    sig: 'Editorial restraint',
    note: 'Slow, considered cadence. Treats writing as part of the product, not packaging.'
  },
  // quiet authority — warm + close + soft, declarative without urgency
  {
    match: (a) =>
      a.get('temperature')! > 0.4 && a.get('distance')! < -0.4 && a.get('mode')! < 0,
    sig: 'Quiet authority',
    note: 'Close-range, unhurried, written in plain sentences. Trusts the reader to slow down.'
  },
  // technical signal — high tech without much else
  {
    match: (a) => a.get('mode')! > 0.5,
    sig: 'Technical signal',
    note: 'Engineering vocabulary leads. Reads as documentation in marketing clothes — assume your reader already knows the space.'
  },
  // friendly accessible
  {
    match: (a) =>
      a.get('register')! < -0.1 && a.get('temperature')! > 0,
    sig: 'Friendly accessible',
    note: 'Warm, low-friction, reaching for everyone. Easy to read, harder to make distinctive.'
  }
];

const FALLBACK_SIGNATURE = {
  sig: 'Mixed signal',
  note: 'No dominant pole — multiple tonal directions running side by side.'
};

function pickSignature(axes: AxisReading[]): { sig: string; note: string } {
  const map = new Map<AxisId, number>(axes.map((a) => [a.id, a.value]));
  for (const cand of SIGNATURES) {
    if (cand.match(map)) return { sig: cand.sig, note: cand.note };
  }
  return FALLBACK_SIGNATURE;
}

// trait pool keyed by axis pole — pick distinct tags by strongest signal
const TRAIT_POOL: Record<AxisId, { left: string[]; right: string[] }> = {
  temperature: { left: ['cool composure', 'measured distance'], right: ['warm grain', 'hand-written warmth'] },
  edge: { left: ['soft handling', 'slow contour'], right: ['sharp edge', 'cut-down phrasing'] },
  register: { left: ['accessible texture', 'low-friction reading'], right: ['premium restraint', 'editorial weight'] },
  mode: { left: ['poetic cadence', 'imagistic phrasing'], right: ['technical density', 'engineering vocabulary'] },
  tempo: { left: ['slow cadence', 'patient pacing'], right: ['urgent push', 'pressing tempo'] },
  familiarity: { left: ['unfamiliar register', 'private vocabulary'], right: ['conventional vocabulary', 'familiar enterprise grammar'] },
  distance: { left: ['intimate stance', 'close-range voice'], right: ['distant posture', 'institutional remove'] },
  gravity: { left: ['playful lift', 'human levity'], right: ['serious gravity', 'formal weight'] }
};

function pickTraits(axes: AxisReading[]): TraitTag[] {
  // sort by absolute value descending, take top 5
  const sorted = [...axes].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const out: TraitTag[] = [];
  for (const a of sorted) {
    if (out.length >= 5) break;
    const abs = Math.abs(a.value);
    if (abs < 0.15) continue;
    const intensity: TraitTag['intensity'] = abs >= 0.55 ? 'high' : abs >= 0.3 ? 'medium' : 'low';
    const pool = TRAIT_POOL[a.id];
    const text = a.pole === 'right' ? pool.right[0] : a.pole === 'left' ? pool.left[0] : '';
    if (!text) continue;
    out.push({ text, intensity });
  }
  // ensure at least 4
  if (out.length < 4) {
    for (const a of sorted) {
      if (out.length >= 4) break;
      const pool = TRAIT_POOL[a.id];
      const text = a.value >= 0 ? pool.right[0] : pool.left[0];
      if (out.find((t) => t.text === text)) continue;
      out.push({ text, intensity: 'low' });
    }
  }
  return out;
}

function pickVoice(axes: AxisReading[], s: RawSignals): VoiceArchetype {
  const m = new Map<AxisId, number>(axes.map((a) => [a.id, a.value]));
  if (s.firstPerson >= 2 && (m.get('register') ?? 0) > -0.1)
    return { name: 'Founder-driven editorial', short: 'Personal voice with care for craft.' };
  if ((m.get('familiarity') ?? 0) > 0.2 && (m.get('distance') ?? 0) > 0.1)
    return { name: 'Corporate platform', short: 'Generic enterprise grammar — recognisable, low signal.' };
  if ((m.get('mode') ?? 0) > 0.2 && (m.get('register') ?? 0) > 0)
    return { name: 'Product-led technical', short: 'Built for buyers who already know what they need.' };
  if ((m.get('familiarity') ?? 0) < -0.15 && (m.get('register') ?? 0) > 0)
    return { name: 'Cult-brand utility', short: 'A small audience treated very specifically.' };
  if ((m.get('gravity') ?? 0) < -0.15)
    return { name: 'Indie / playful', short: 'Light, human, willing to be silly.' };
  if ((m.get('register') ?? 0) > 0.15 && (m.get('mode') ?? 0) < 0)
    return { name: 'Editorial atelier', short: 'Reads like a publication, not a product page.' };
  return { name: 'Mixed brand voice', short: 'No single archetype dominates the copy.' };
}

function moodBand(axes: AxisReading[]): MoodBand {
  const t = axes.find((a) => a.id === 'temperature')!;
  const where =
    t.value > 0.5 ? 'Sits warm, openly'
    : t.value > 0.15 ? 'Sits warm-side of center'
    : t.value > -0.15 ? 'Holds neutral temperature'
    : t.value > -0.5 ? 'Sits cool-side of center'
    : 'Reads cool, openly';
  return { primary: 'temperature', position: t.value, caption: where };
}

function cohesionRead(axes: AxisReading[], s: RawSignals): string {
  // cohesion = inverse of axis spread + hedge density
  const strong = axes.filter((a) => Math.abs(a.value) >= 0.35).length;
  const conflicting =
    axes.find((a) => a.id === 'temperature')!.value > 0.2 &&
    axes.find((a) => a.id === 'distance')!.value > 0.2;
  const hedgeRatio = s.hedges / Math.max(1, s.toks.length / 50);
  if (conflicting) return 'Coherence wobbles — the copy reads warm but holds the reader at distance. Pick a side.';
  if (strong >= 4) return 'Strong tonal cohesion. Several axes pulling in the same direction.';
  if (strong >= 2 && hedgeRatio < 0.6) return 'Reasonable cohesion. The voice has shape but a few signals run mixed.';
  if (hedgeRatio >= 1.2) return 'Cohesion softens through hedging. The copy keeps qualifying itself.';
  return 'Cohesion is mid-band. The tone is legible but not yet locked in.';
}

function tensionRead(axes: AxisReading[]): string {
  const m = new Map<AxisId, number>(axes.map((a) => [a.id, a.value]));
  const warmCool = m.get('temperature')!;
  const softSharp = m.get('edge')!;
  const playSerious = m.get('gravity')!;
  if (Math.abs(warmCool) < 0.15 && Math.abs(softSharp) < 0.15)
    return 'No real tension — the copy sits flat on the central axes. Adding a single counter-signal would give it weight.';
  if (warmCool > 0.2 && softSharp > 0.2)
    return 'Productive tension between warmth and sharpness. The copy is friendly but does not soften its claims.';
  if (warmCool < -0.2 && softSharp > 0.2)
    return 'Cool authority. Confident posture, low warmth — readers will respect it before they like it.';
  if (playSerious < -0.2 && softSharp > 0.2)
    return 'Playful surface, sharp underneath. The kind of voice readers screenshot.';
  return 'Mild tension. One pole slightly pulls against another but neither dominates.';
}

function audienceRead(axes: AxisReading[], voice: VoiceArchetype): string {
  const m = new Map<AxisId, number>(axes.map((a) => [a.id, a.value]));
  const cool = m.get('temperature')! < -0.1;
  const premium = m.get('register')! > 0.15;
  const technical = m.get('mode')! > 0.15;
  const playful = m.get('gravity')! < -0.15;
  if (technical && premium) return 'A first-time reader is likely an operator who wants signal density. They will trust this fast and skim slowly.';
  if (premium && !technical) return 'A first-time reader feels invited into something curated. The brand reads scarce on purpose.';
  if (cool && !premium) return 'A first-time reader feels efficiently informed but not yet emotionally connected.';
  if (playful) return 'A first-time reader smiles before they understand. Likeable first, persuasive second.';
  if (voice.name === 'Founder-driven editorial')
    return 'A first-time reader feels addressed by a person, not a company. That is the asset and the risk.';
  return 'A first-time reader gets the gist quickly but is unlikely to remember the brand voice an hour later.';
}

// pull most/least distinctive sentence by counting signal density per sentence
function distinctivePhrases(s: RawSignals): { strong: string; flat: string | null } {
  if (s.sents.length <= 1) return { strong: s.sents[0] || '', flat: null };
  const score = (sent: string): number => {
    const t = sent.toLowerCase();
    let n = 0;
    for (const list of [
      WARM_WORDS, COOL_WORDS, SHARP_WORDS, SOFT_WORDS,
      PREMIUM_WORDS, TECHNICAL_WORDS, POETIC_WORDS, STRANGE_WORDS,
      INTIMATE_WORDS, PLAYFUL_WORDS
    ]) {
      n += countMatches(t, list);
    }
    // reward em-dashes and short punchy sentences
    n += (sent.match(/\u2014|\u2013| — | – /g) || []).length * 1.2;
    if (sent.split(/\s+/).length <= 6) n += 0.6;
    // penalise hedged sentences
    n -= countMatches(t, HEDGES) * 0.6;
    return n;
  };
  const ranked = s.sents
    .map((sent) => ({ sent, sc: score(sent) }))
    .sort((a, b) => b.sc - a.sc);
  const strong = ranked[0].sent;
  const last = ranked[ranked.length - 1];
  const flat = last && last.sc < ranked[0].sc - 1.2 ? last.sent : null;
  return { strong, flat };
}

function refinements(axes: AxisReading[], s: RawSignals): RefinementMove[] {
  const m = new Map<AxisId, number>(axes.map((a) => [a.id, a.value]));
  const moves: RefinementMove[] = [];

  if (s.hedges >= 3) {
    moves.push({
      label: 'Cut the hedging',
      detail: `${s.hedges} hedge words are flattening the field. Removing "maybe / really / actually / kind of" will tighten authority without changing meaning.`
    });
  }
  if ((m.get('familiarity') ?? 0) > 0.25) {
    moves.push({
      label: 'Replace platform-speak',
      detail: 'Swap "platform / solutions / seamless / unified" for verbs and concrete nouns. The copy is currently legible but indistinct.'
    });
  }
  if ((m.get('temperature') ?? 0) < -0.2 && (m.get('distance') ?? 0) > 0.1) {
    moves.push({
      label: 'Bring the reader closer',
      detail: 'Re-pitch one sentence in first or second person. The copy currently reads about a customer, not to them.'
    });
  }
  if ((m.get('edge') ?? 0) < 0 && s.exclamations === 0 && s.shortSentences <= 1) {
    moves.push({
      label: 'Add one short, definitive line',
      detail: 'The cadence is uniform. A single five-word sentence would create a tonal hinge and make the surrounding copy feel chosen.'
    });
  }
  if ((m.get('register') ?? 0) < -0.2 && (m.get('gravity') ?? 0) < -0.1) {
    moves.push({
      label: 'Lift the register slightly',
      detail: 'Friendly is good; friendly + casual punctuation reads junior. Drop one exclamation and the voice gains a quiet kind of authority.'
    });
  }
  if ((m.get('mode') ?? 0) > 0.35) {
    moves.push({
      label: 'Add one image-led line',
      detail: 'Almost all of the vocabulary is technical. One sensory or image-based sentence near the top would humanise the rest.'
    });
  }
  if ((m.get('familiarity') ?? 0) < -0.25 && (m.get('register') ?? 0) > 0.15) {
    moves.push({
      label: 'Anchor the strangeness',
      detail: 'The voice is distinctive — make sure one line states plainly what the product does, so the strangeness reads chosen, not avoidant.'
    });
  }
  if (moves.length === 0) {
    moves.push({
      label: 'Hold the line',
      detail: 'The tonal field is internally consistent. Most useful next move: write three more sentences without changing register and see if it still holds.'
    });
  }
  // cap at 3
  return moves.slice(0, 3);
}

function classification(s: RawSignals, axes: AxisReading[], seed: number): { code: string; band: string } {
  const strong = axes.filter((a) => Math.abs(a.value) >= 0.35).length;
  const band =
    strong >= 4 ? 'Strong reading'
    : strong >= 2 ? 'Coherent reading'
    : 'Soft reading';
  const greekIdx = (hash32(s.text) + seed) % 24;
  const greek = ['α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ','π','ρ','σ','τ','φ','χ','ψ','ω','Ω','Σ'][greekIdx];
  const num = 10 + ((hash32(s.text + ':n') + seed) % 80);
  return { code: `PULSE-09 / ${greek}-${num}`, band };
}

// ---------------------------------------------------------------------------
// Public entry
// ---------------------------------------------------------------------------

export interface AnalyseOptions {
  seed?: number; // bump to vary tie-breaks across regenerations
}

export function analyseTone(input: string, opts: AnalyseOptions = {}): ToneReading {
  const text = input.trim();
  if (text.length === 0) {
    throw new Error('Empty input');
  }

  const seed = opts.seed ?? 0;
  // RNG is reserved for stable tie-breaking variants (regenerate)
  const rand = mulberry32(hash32(text) ^ (seed * 2654435761));
  void rand;

  const s = gatherSignals(text);
  const axes = scoreAxes(s);

  const sig = pickSignature(axes);
  const traits = pickTraits(axes);
  const voice = pickVoice(axes, s);
  const mood = moodBand(axes);
  const cohesion = cohesionRead(axes, s);
  const tension = tensionRead(axes);
  const audience = audienceRead(axes, voice);
  const { strong, flat } = distinctivePhrases(s);
  const refines = refinements(axes, s);

  const wordCount = s.toks.length;
  const sentenceCount = s.sents.length;
  const avgSentenceLen = Math.round(s.avgLen * 10) / 10;
  const readMs = Math.max(1, Math.round((wordCount / 220) * 60000)); // ~220 wpm

  return {
    signature: sig.sig,
    signatureNote: sig.note,
    traits,
    voice,
    axes,
    mood,
    cohesion,
    tension,
    audience,
    strongestPhrase: strong,
    flatPhrase: flat,
    refinements: refines,
    meta: { wordCount, sentenceCount, avgSentenceLen, readMs },
    classification: classification(s, axes, seed)
  };
}
