/**
 * Tone Field — type definitions and presets.
 *
 * Tone Field reads pasted brand copy and returns a structured tone map,
 * not a numeric score. The output is interpretive: a primary signature,
 * supporting traits, an axis-based field, and strategic refinements.
 */

// ---------- Tonal axes ----------
// Each axis has two opposite poles. The engine returns a value
// in [-1, 1] where negative leans toward the left pole and positive
// leans toward the right pole. 0 is neutral.

export type AxisId =
  | 'temperature' // cool ↔ warm
  | 'edge' // soft ↔ sharp
  | 'register' // accessible ↔ premium
  | 'mode' // poetic ↔ technical
  | 'tempo' // calm ↔ urgent
  | 'familiarity' // strange ↔ conventional
  | 'distance' // intimate ↔ distant
  | 'gravity'; // playful ↔ serious

export interface AxisDef {
  id: AxisId;
  left: string; // lower-pole label
  right: string; // upper-pole label
  meta: string; // short tag like "Temperature"
}

export const AXES: AxisDef[] = [
  { id: 'temperature', meta: 'Temperature', left: 'Cool', right: 'Warm' },
  { id: 'edge', meta: 'Edge', left: 'Soft', right: 'Sharp' },
  { id: 'register', meta: 'Register', left: 'Accessible', right: 'Premium' },
  { id: 'mode', meta: 'Mode', left: 'Poetic', right: 'Technical' },
  { id: 'tempo', meta: 'Tempo', left: 'Calm', right: 'Urgent' },
  { id: 'familiarity', meta: 'Familiarity', left: 'Strange', right: 'Conventional' },
  { id: 'distance', meta: 'Distance', left: 'Intimate', right: 'Distant' },
  { id: 'gravity', meta: 'Gravity', left: 'Playful', right: 'Serious' }
];

export type AxisReading = {
  id: AxisId;
  value: number; // -1..1
  label: string; // human-readable summary, e.g. "Distinctly warm"
  pole: 'left' | 'right' | 'center';
};

// ---------- Result schema ----------

export interface TraitTag {
  text: string; // descriptor like "polished warmth"
  intensity: 'low' | 'medium' | 'high';
}

export interface MoodBand {
  // a small horizontal "band" rendered in the UI showing where the
  // overall mood sits across a primary axis (cool → warm by default)
  primary: AxisId; // axis used for the band
  position: number; // -1..1
  caption: string; // e.g. "Sits warm-side of center, softly"
}

export interface VoiceArchetype {
  // one of a small family of archetypes, used to describe brand voice
  name: string; // e.g. "Founder-driven editorial"
  short: string; // 1-line description
}

export interface RefinementMove {
  // an actionable shift the user can apply to the copy's tone
  label: string; // e.g. "Sharpen"
  detail: string; // 1-2 sentence rationale
}

export interface ToneReading {
  // top-line interpretive summary
  signature: string; // e.g. "Calm precision"
  signatureNote: string; // 1-line elaboration

  // descriptors
  traits: TraitTag[]; // 4-6 supporting tonal traits
  voice: VoiceArchetype;

  // structured map
  axes: AxisReading[]; // full axis field
  mood: MoodBand;

  // qualitative observations
  cohesion: string; // observation on tonal consistency
  tension: string; // contrast / balance reading
  audience: string; // first-impression read

  // strategic
  strongestPhrase: string; // most distinctive snippet from input
  flatPhrase: string | null; // weakest snippet, if any
  refinements: RefinementMove[]; // 3 directional shifts

  // input echo
  meta: {
    wordCount: number;
    sentenceCount: number;
    avgSentenceLen: number;
    readMs: number; // approximate reading time
  };

  // classification line for the result header
  classification: {
    code: string; // e.g. "PULSE-09 / θ-12"
    band: string; // e.g. "Coherent reading"
  };
}

// ---------- Sample inputs ----------

export interface SampleInput {
  id: string;
  label: string; // short button text
  hint: string; // subtitle line
  text: string;
}

export const SAMPLE_INPUTS: SampleInput[] = [
  {
    id: 'ai-infra',
    label: 'AI infra startup',
    hint: 'Sleek, technical, restrained',
    text:
      'The runtime for autonomous agents. Deploy multi-step workflows in production. ' +
      'Built for engineering teams who treat reliability as a feature. ' +
      'Trusted by companies running mission-critical pipelines at scale. ' +
      'Type safety, observability, and cost controls — by default.'
  },
  {
    id: 'creative-studio',
    label: 'Boutique studio',
    hint: 'Editorial, considered, luxurious',
    text:
      'We build small, strange, beautiful things. ' +
      'A studio for founders who care how the work feels. ' +
      'Brand identity, art direction, and editorial sites — finished slowly, on purpose. ' +
      'No retainers. No decks. Just the work.'
  },
  {
    id: 'strange-app',
    label: 'Strange premium app',
    hint: 'Cult-brand, slightly secret',
    text:
      'A private notebook for ideas you do not want indexed. ' +
      'No accounts. No cloud. No analytics. ' +
      'Lives on one device, encrypted, written like a letter to yourself. ' +
      'Some things are not meant to be searchable.'
  },
  {
    id: 'indie-tool',
    label: 'Playful indie tool',
    hint: 'Friendly, weird, human',
    text:
      'Hi. This is a tiny app that turns your tabs into a snack-sized to-do list. ' +
      'It is silly. It also kind of works. ' +
      'Made by two people in a kitchen. ' +
      'No subscription. Buy once, keep forever, complain freely.'
  },
  {
    id: 'enterprise-saas',
    label: 'Cold enterprise SaaS',
    hint: 'Corporate, flattened, distant',
    text:
      'The unified platform for enterprise risk operations. ' +
      'Streamline compliance workflows across global business units. ' +
      'Configurable controls, audit-ready reporting, and seamless integration with leading ERP systems. ' +
      'Empowering Fortune 500 organizations to drive operational excellence at scale.'
  },
  {
    id: 'founder-poetic',
    label: 'Poetic founder intro',
    hint: 'Intimate, slow, declarative',
    text:
      'I have been thinking about this for a long time. ' +
      'A reader for the long pieces you save and never come back to. ' +
      'It does one thing. It reminds you, gently, on the right kind of evening. ' +
      'I built it for myself first. I think you will like it.'
  }
];

// ---------- Loading phrases ----------

export const LOADING_PHRASES: string[] = [
  'reading the field',
  'isolating frequency',
  'mapping warmth and edge',
  'measuring tonal pressure',
  'cross-checking voice signal',
  'sampling cohesion',
  'rendering tone map'
];

// ---------- Refinement preset directions ----------
// Used after analysis as quick prompts: "what would happen if I made it sharper?"

export interface RefinementPreset {
  id: string;
  label: string;
  hint: string;
}

export const REFINEMENT_PRESETS: RefinementPreset[] = [
  { id: 'sharper', label: 'Sharper', hint: 'less hedging, more authority' },
  { id: 'human', label: 'More human', hint: 'shorter, first-person, warmer' },
  { id: 'less-corporate', label: 'Less corporate', hint: 'cut platform-speak' },
  { id: 'more-premium', label: 'More premium', hint: 'fewer words, more weight' },
  { id: 'stranger', label: 'More strange', hint: 'lean into the weird signal' },
  { id: 'calmer', label: 'Calmer', hint: 'release urgency, slow the cadence' }
];
