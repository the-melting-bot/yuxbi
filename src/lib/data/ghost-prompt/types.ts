/**
 * Ghost Prompt — Type Definitions
 * STATIC-03 · A prompt scrubber that strips filler, sharpens intent.
 */

export type TargetMode =
  | 'general'
  | 'coding'
  | 'design'
  | 'research'
  | 'marketing'
  | 'image';

export type VariantKey =
  | 'concise'
  | 'detailed'
  | 'technical'
  | 'creative'
  | 'expert';

export type PresetAction =
  | 'concise'
  | 'technical'
  | 'creative'
  | 'specific'
  | 'remove-fluff'
  | 'add-structure'
  | 'for-coding'
  | 'for-image';

export interface TargetModeMeta {
  key: TargetMode;
  label: string;
  blurb: string;
  glyph: string; // single-line svg path or symbol descriptor handled in component
}

export interface VariantMeta {
  key: VariantKey;
  label: string;
  blurb: string;
}

export interface PresetMeta {
  key: PresetAction;
  label: string;
}

export interface DiffSegment {
  kind: 'kept' | 'removed' | 'added';
  text: string;
}

export interface ScoreDimension {
  key: 'clarity' | 'specificity' | 'filler' | 'ambiguity' | 'structure';
  label: string;
  /** 0–100, higher = better signal (filler and ambiguity are inverted at compute time) */
  value: number;
  note: string;
}

export interface GhostScore {
  /** Overall 0–100. Higher = cleaner signal. */
  overall: number;
  /** Branded label e.g. "Faint signal", "Clear signal", "Static cluster" */
  band: string;
  dimensions: ScoreDimension[];
}

export interface MissingContext {
  key:
    | 'audience'
    | 'tone'
    | 'format'
    | 'length'
    | 'constraints'
    | 'platform'
    | 'examples'
    | 'inputs-outputs';
  label: string;
  prompt: string; // the question the user should answer
}

export interface PromptVariant {
  key: VariantKey;
  label: string;
  text: string;
}

export interface ScrubResult {
  original: string;
  cleaned: string;
  intent: string;
  missing: MissingContext[];
  variants: PromptVariant[];
  targetRewrite: {
    mode: TargetMode;
    text: string;
  };
  score: GhostScore;
  diff: DiffSegment[];
  removedCount: number;
  addedCount: number;
  /** Which preset actions, if any, were applied to the cleaned output */
  appliedPresets: PresetAction[];
}

export interface ScrubOptions {
  mode: TargetMode;
  presets?: PresetAction[];
}

export const TARGET_MODES: TargetModeMeta[] = [
  { key: 'general',   label: 'General AI',   blurb: 'A model-agnostic rewrite.', glyph: 'star' },
  { key: 'coding',    label: 'Coding',       blurb: 'For code generation tasks.', glyph: 'bracket' },
  { key: 'design',    label: 'Design / UI',  blurb: 'For UI, layout, and visual work.', glyph: 'frame' },
  { key: 'research',  label: 'Research',     blurb: 'For deep investigation.', glyph: 'lens' },
  { key: 'marketing', label: 'Marketing',    blurb: 'For copy, SEO, growth.', glyph: 'wave' },
  { key: 'image',     label: 'Image gen',    blurb: 'For diffusion-style image prompts.', glyph: 'eye' }
];

export const VARIANTS: VariantMeta[] = [
  { key: 'concise',   label: 'Concise',   blurb: 'Tightest possible version.' },
  { key: 'detailed',  label: 'Detailed',  blurb: 'Adds the missing context.' },
  { key: 'technical', label: 'Technical', blurb: 'Precise, jargon-aware.' },
  { key: 'creative',  label: 'Creative',  blurb: 'Looser, more imaginative.' },
  { key: 'expert',    label: 'Expert',    blurb: 'High-signal, role-conditioned.' }
];

export const PRESETS: PresetMeta[] = [
  { key: 'concise',       label: 'Make concise' },
  { key: 'technical',     label: 'Make technical' },
  { key: 'creative',      label: 'Make creative' },
  { key: 'specific',      label: 'More specific' },
  { key: 'remove-fluff',  label: 'Remove fluff' },
  { key: 'add-structure', label: 'Add structure' },
  { key: 'for-coding',    label: 'For coding' },
  { key: 'for-image',     label: 'For image' }
];

export const LOADING_PHRASES = [
  'Listening for signal',
  'Pulling residual noise',
  'Stripping the fog',
  'Reading what you meant',
  'Combing the static',
  'Counting the ghosts',
  'Recovering the ask'
];

export const SAMPLE_PROMPTS: { id: string; label: string; text: string }[] = [
  {
    id: 'startup-blog',
    label: 'Startup blog post',
    text:
      'so basically can u maybe write me a really good blog post about ai or whatever, like for our startup i think? it should be kinda professional but also fun and not too long, idk make it good plz'
  },
  {
    id: 'web-app',
    label: 'Build a small web app',
    text:
      "hey i was thinking it would be cool if i had like a small website thing where users can sort of upload a csv and then see the data in a chart. honestly im not sure what stack but probably modern. um also it should look nice and work on phones. can u just build it?"
  },
  {
    id: 'image-prompt',
    label: 'Generate cover art',
    text:
      'make me an image, like a cool cover for an album, sort of moody, kind of cyberpunk but also nature? not too cluttered, very vibey. high quality plz.'
  },
  {
    id: 'research',
    label: 'Research a topic',
    text:
      "i kinda want to understand the agent landscape rn, like who is doing what, but i don't want a million links. just give me the actual signal, in like a structured way maybe? thx"
  }
];
