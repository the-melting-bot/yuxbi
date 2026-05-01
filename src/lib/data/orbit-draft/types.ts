/**
 * Orbit Draft — types & static data.
 *
 * NOVA-11. Generates launch concepts from a single strange input.
 *
 * Future API: replace `generateConcept` in engine.ts with a server call
 * returning the same `LaunchConcept` shape — UI is API-shape stable.
 */

export type Vertical =
  | 'weird-saas'
  | 'sci-fi-product'
  | 'creator-brand'
  | 'ai-side-project'
  | 'niche-utility'
  | 'open';

export interface VerticalMeta {
  key: Vertical;
  label: string;
  blurb: string;
}

export const VERTICALS: VerticalMeta[] = [
  { key: 'open',            label: 'Open signal',     blurb: 'Let Orbit Draft choose the orbit.' },
  { key: 'weird-saas',      label: 'Weird SaaS',      blurb: 'Niche tool, paid-for, oddly specific.' },
  { key: 'sci-fi-product',  label: 'Sci-fi product',  blurb: 'Speculative hardware, rituals, lore.' },
  { key: 'creator-brand',   label: 'Creator brand',   blurb: 'A studio, a label, a personal universe.' },
  { key: 'ai-side-project', label: 'AI side project', blurb: 'Tiny intelligent thing, shipped fast.' },
  { key: 'niche-utility',   label: 'Niche utility',   blurb: 'A sharp tool for a small, real problem.' }
];

export interface ProductName {
  text: string;
  rationale: string;
}

export interface SectionPlan {
  /** Section key, e.g. 'hero', 'proof', 'features' */
  key: string;
  /** Display label */
  label: string;
  /** Short description of what goes in this section */
  copy: string;
}

export interface LaunchConcept {
  /** Echo of user's raw input */
  input: string;
  /** Vertical that shaped the concept */
  vertical: Vertical;
  /** 3 product name options, ranked best-first */
  names: ProductName[];
  /** Primary tagline — short, one line */
  tagline: string;
  /** Positioning statement — "for X, who Y, our product is Z that Q" feel */
  positioning: string;
  /** One-paragraph concept description */
  concept: string;
  /** Launch angle / hook — one sharp sentence */
  hook: string;
  /** Recommended landing page sections in order */
  landing: SectionPlan[];
  /** Bonus fields */
  audience: string;
  tone: string;
  visual: string;
  monetization: string;
  /** Internal pseudo-classification for UI flair */
  classification: {
    code: string;     // e.g. "NOVA-11 / Δ-04"
    band: string;     // e.g. "High coherence"
  };
}

export interface SamplePrompt {
  id: string;
  label: string;
  text: string;
  vertical: Vertical;
}

export const SAMPLE_PROMPTS: SamplePrompt[] = [
  {
    id: 'haunted-listings',
    label: 'AI for haunted real estate',
    text: 'AI tool for haunted real estate listings',
    vertical: 'weird-saas'
  },
  {
    id: 'dream-export',
    label: 'Dream export device',
    text: 'A device that lets you export your dreams as short films',
    vertical: 'sci-fi-product'
  },
  {
    id: 'midnight-essays',
    label: 'Newsletter for night thinkers',
    text: 'A newsletter for people who write essays at 2am',
    vertical: 'creator-brand'
  },
  {
    id: 'compliment-gen',
    label: 'Hyper-specific compliments',
    text: 'A tiny AI that writes hyper-specific compliments about your work',
    vertical: 'ai-side-project'
  },
  {
    id: 'rejection-archive',
    label: 'Rejection letter archive',
    text: 'A private archive for rejection letters that turns them into a quarterly report',
    vertical: 'niche-utility'
  }
];

/** Loading phrases shown while the engine "computes". */
export const LOADING_PHRASES: string[] = [
  'Locking onto the orbit',
  'Naming the unnamed',
  'Aligning the launch axis',
  'Drafting from the signal',
  'Pulling angle from noise',
  'Composing the cold-open',
  'Mapping the landing path'
];

/** Surprise-me seed inputs — used by the dice button. */
export const SURPRISE_SEEDS: string[] = [
  'A subscription that mails you one strange object per month',
  'A calendar app that only shows the next interesting thing',
  'A read-it-later app for books you have not bought yet',
  'A focus tool that listens for sighs and offers a break',
  'A studio for one-person operas',
  'A tiny CRM for people who owe you favors',
  'An AI agent that drafts your apology emails before you need them',
  'A map of every quiet bar within a 20-minute walk',
  'A note-taking app shaped like a tarot deck',
  'A platform for selling unfinished ideas, priced by completeness',
  'A weather app for creative output',
  'A directory of things that almost worked'
];
