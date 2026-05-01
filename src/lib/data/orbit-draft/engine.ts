/**
 * Orbit Draft engine — deterministic mock concept generator.
 *
 * Pure, client-side. No deps. Given a strange user input + optional vertical,
 * returns a fully-shaped `LaunchConcept`. Built so the page can be wired to a
 * real API later by replacing only the `generateConcept` function — the
 * output schema (`LaunchConcept`) is the contract.
 *
 * Design notes:
 * - Output reads as if a designer drafted it: short, declarative, no filler.
 * - Names are formed from real linguistic moves (compounds, latin/greek
 *   roots, kennings, suffix grafts) instead of random gibberish.
 * - All randomness is derived from a hash of the input, so the SAME input
 *   gives the SAME concept (helpful for sharing, debugging, and tests).
 *   A `seed` salt parameter lets the user "regenerate" deterministically.
 */

import type {
  LaunchConcept,
  ProductName,
  SectionPlan,
  Vertical
} from './types';

/* ------------------------------------------------------------------ */
/* RNG: deterministic seeded                                           */
/* ------------------------------------------------------------------ */

function hash32(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/* ------------------------------------------------------------------ */
/* Linguistic atoms                                                    */
/* ------------------------------------------------------------------ */

const STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'for', 'to', 'with', 'on', 'in', 'at',
  'is', 'are', 'be', 'as', 'by', 'from', 'this', 'that', 'these', 'those',
  'it', 'its', 'about', 'into', 'than', 'then', 'so', 'but', 'if', 'tool',
  'app', 'thing', 'stuff', 'one', 'your', 'my', 'our', 'their', 'his', 'her',
  'they', 'you', 'me', 'we', 'i', 'all', 'any', 'some', 'kind', 'type',
  'will', 'would', 'should', 'can', 'could', 'do', 'does', 'did', 'just',
  'only', 'really', 'very', 'lets', "let's", 'let', 'using', 'use', 'want',
  'wants', 'need', 'needs', 'people', 'who', 'what', 'when', 'where', 'why',
  'how', 'maybe', 'kinda', 'sort', 'like'
]);

/** Vertical-conditioned atom packs. */
const ATOMS = {
  prefixes: {
    open:            ['Aero', 'Halo', 'Lumen', 'Nova', 'Orb', 'Vela', 'Atlas', 'Mira', 'Sable', 'Quill'],
    'weird-saas':    ['Moth', 'Quill', 'Brisk', 'Kelp', 'Crate', 'Ledger', 'Slate', 'Mort', 'Flint', 'Hum'],
    'sci-fi-product': ['Helio', 'Vex', 'Astra', 'Ion', 'Lume', 'Vault', 'Halcyon', 'Echo', 'Specter', 'Aether'],
    'creator-brand': ['Glass', 'Paper', 'Salt', 'Velvet', 'Marrow', 'Ember', 'Plumage', 'Tide', 'Linen', 'Brass'],
    'ai-side-project': ['Tiny', 'Quiet', 'Soft', 'Solo', 'Pocket', 'Drift', 'Hush', 'Loop', 'Pico', 'Brisk'],
    'niche-utility': ['Sharp', 'Clip', 'Notch', 'Plain', 'Honest', 'Steady', 'Trim', 'Pin', 'Cog', 'Tap']
  },
  suffixes: {
    open:            ['lab', 'works', 'house', 'kit', 'bureau', 'co', 'index', 'field', 'press'],
    'weird-saas':    ['desk', 'sheet', 'ledger', 'book', 'list', 'inbox', 'office', 'log'],
    'sci-fi-product': ['drive', 'beacon', 'array', 'core', 'engine', 'glass', 'frame', 'echo'],
    'creator-brand': ['studio', 'press', 'records', 'salon', 'review', 'house', 'editions', 'works'],
    'ai-side-project': ['agent', 'note', 'bot', 'kit', 'pad', 'lens', 'pal', 'ish'],
    'niche-utility': ['tool', 'check', 'pass', 'pin', 'mark', 'tag', 'tab', 'log']
  },
  // single-word evocative names per vertical
  monolithic: {
    open:            ['Halo', 'Vellum', 'Ondine', 'Clearing', 'Mira', 'Ferry', 'Atlas', 'Praxis'],
    'weird-saas':    ['Sundry', 'Marginalia', 'Bookkeep', 'Footnote', 'Decimal', 'Filebox', 'Errand'],
    'sci-fi-product': ['Stratus', 'Helium', 'Cygnet', 'Orrery', 'Lacuna', 'Penumbra', 'Solstice'],
    'creator-brand': ['Pretext', 'Marrow', 'Smallworld', 'Backroom', 'Bookmatter', 'Drafthouse'],
    'ai-side-project': ['Sidecar', 'Loafer', 'Pebble', 'Halftone', 'Tinder', 'Ish', 'Loiter'],
    'niche-utility': ['Hatch', 'Plumb', 'Dovetail', 'Notchwork', 'Threadbare', 'Anchor']
  },
  // verbs to colour the tagline + concept
  verbs: {
    open:            ['turns', 'maps', 'translates', 'reframes', 'reads'],
    'weird-saas':    ['tracks', 'tames', 'files', 'audits', 'tidies', 'sorts'],
    'sci-fi-product': ['captures', 'projects', 'transmits', 'archives', 'unfolds'],
    'creator-brand': ['publishes', 'curates', 'frames', 'releases', 'collects'],
    'ai-side-project': ['drafts', 'whispers', 'autocompletes', 'nudges', 'finishes'],
    'niche-utility': ['cuts', 'sharpens', 'measures', 'closes', 'logs']
  },
  // tone descriptor packs
  tones: {
    open:            ['calm, curious, slightly classified',                            'warm minimalist, low-volume confidence'],
    'weird-saas':    ['dry, oddly specific, deeply useful',                            'small-town accountant, deadpan helpful'],
    'sci-fi-product': ['speculative, archival, slightly haunted',                      'science museum gift shop, but the future'],
    'creator-brand': ['editorial, intimate, generous',                                  'tactile, slightly literary, never loud'],
    'ai-side-project': ['tiny, witty, generous with the user',                          'soft-spoken AI that knows when to stop'],
    'niche-utility': ['plain-spoken, useful, no marketing voice',                       'workshop tool — labels, not slogans']
  },
  // visual direction
  visual: {
    open:            ['Off-white surfaces, navy ink, a single accent. Generous white space, geometric sans, soft shadows.'],
    'weird-saas':    ['Receipt-paper neutrals, monospace numerals, hairline rules. Restraint over flourish.'],
    'sci-fi-product': ['Dark stratus blue + bone white, type-only hero, faint grid, classified-strip metadata.'],
    'creator-brand': ['Cream + ink, serif display, generous photography, magazine grid feel.'],
    'ai-side-project': ['Mostly white, one warm accent, soft drop shadows, friendly mono captions.'],
    'niche-utility': ['Newsprint neutrals, deliberate alignment, hard corners, no decoration.']
  },
  // monetization angles
  monetization: {
    open:            ['Free tier with a one-time unlock for the pro toolset.',          'Subscription: monthly + yearly with a generous free read.'],
    'weird-saas':    ['Flat $12/mo. No usage tiers. One plan, sharp value.',             'Per-seat pricing, billed annually; no overage games.'],
    'sci-fi-product': ['Limited drops priced as artifacts, with a small standing club.', 'Hardware sale + a quiet annual membership for the lore.'],
    'creator-brand': ['Subscription publication + occasional paid editions.',            'Free archive, paid current issues, paid live events.'],
    'ai-side-project': ['Free with a low-friction "buy me a coffee" pro mode.',          'Pay-what-you-want, with a $5 default and bonus prompts.'],
    'niche-utility': ['One-time purchase, lifetime updates. No accounts.',               'Tiny monthly fee, billed quietly, cancellable in one click.']
  }
};

/** Latin / latinate roots used as a fallback "scientific" name source. */
const LATIN_ROOTS = [
  'lumen', 'ferro', 'astra', 'corvid', 'flora', 'volta', 'umbra', 'aurum',
  'noct', 'helio', 'silv', 'fora', 'meri', 'vox', 'sona', 'pluvia'
];

/** Generic extra glyph names for codeword diversity. */
const GLYPHS = ['Δ', 'Ω', 'Σ', 'Φ', 'Ψ', 'Λ', 'Θ', 'Ξ'];

/* ------------------------------------------------------------------ */
/* Input parsing                                                       */
/* ------------------------------------------------------------------ */

interface InputAnatomy {
  tokens: string[];        // significant content tokens, lowercased
  keywords: string[];      // top 4 distinct content tokens
  subject: string;         // best-guess noun-phrase, capitalized
  topic: string;           // 1-3 word topic phrase, lowercased
  domain: string | null;   // detected domain noun (real estate, ai, dreams, etc.)
}

const DOMAIN_HINTS: { domain: string; words: string[] }[] = [
  { domain: 'real estate',   words: ['real', 'estate', 'house', 'home', 'listing', 'listings', 'property', 'realtor'] },
  { domain: 'dreams',        words: ['dream', 'dreams', 'sleep', 'sleeping', 'nightmare'] },
  { domain: 'AI',            words: ['ai', 'gpt', 'llm', 'model', 'agent', 'assistant'] },
  { domain: 'writing',       words: ['essay', 'essays', 'writing', 'writer', 'blog', 'newsletter', 'note', 'notes'] },
  { domain: 'compliments',   words: ['compliment', 'compliments', 'praise'] },
  { domain: 'rejection',     words: ['rejection', 'rejections', 'reject', 'no', 'denied'] },
  { domain: 'haunted',       words: ['haunted', 'ghost', 'ghosts', 'spirit', 'paranormal'] },
  { domain: 'meetings',      words: ['meeting', 'meetings', 'standup', 'calendar'] },
  { domain: 'focus',         words: ['focus', 'attention', 'concentration', 'flow'] },
  { domain: 'reading',       words: ['book', 'books', 'reading', 'read', 'library'] },
  { domain: 'food',          words: ['food', 'recipe', 'recipes', 'cook', 'kitchen'] },
  { domain: 'music',         words: ['music', 'song', 'songs', 'album', 'playlist'] },
  { domain: 'health',        words: ['health', 'fitness', 'workout', 'sleep', 'mood'] },
  { domain: 'finance',       words: ['budget', 'finance', 'money', 'spending', 'expense', 'expenses'] },
  { domain: 'travel',        words: ['travel', 'trip', 'flight', 'flights', 'hotel'] },
  { domain: 'jobs',          words: ['job', 'jobs', 'hiring', 'recruiter', 'resume'] }
];

/**
 * Common verbs/adjectives we don't want as the subject's head noun.
 * Keeps the subject phrase grammatical when the user's first content
 * word happens to be a verb like "export" or "write".
 */
const NON_NOUNS = new Set([
  'export', 'import', 'write', 'writes', 'read', 'reads', 'send', 'sends',
  'make', 'makes', 'build', 'builds', 'turn', 'turns', 'cut', 'cuts',
  'haunted', 'private', 'tiny', 'small', 'big', 'large', 'good', 'bad',
  'weird', 'strange', 'odd', 'quiet', 'loud', 'fast', 'slow', 'old',
  'new', 'real', 'fake', 'late', 'early', 'hyper-specific', 'specific',
  'simple', 'complex', 'ai', 'gpt'
]);

/** Brand-name short labels used to refer to the user's idea generically. */
const SUBJECT_FALLBACKS: Record<Vertical, string> = {
  open:              'the idea',
  'weird-saas':      'this niche',
  'sci-fi-product':  'the artifact',
  'creator-brand':   'this practice',
  'ai-side-project': 'this little tool',
  'niche-utility':   'this workflow'
};

function anatomy(input: string): InputAnatomy {
  const raw = input.toLowerCase();
  const tokens = raw
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^[-']+|[-']+$/g, ''))
    .filter((t) => t.length > 1 && !STOP.has(t));

  // Domain detection — first hit wins.
  let domain: string | null = null;
  for (const hint of DOMAIN_HINTS) {
    if (tokens.some((t) => hint.words.includes(t))) {
      domain = hint.domain;
      break;
    }
  }

  // Keywords — keep first-seen order, dedupe. Only keep "good" tokens for naming.
  const keywords = uniq(tokens).slice(0, 5);

  // Subject: anchor on the FIRST clear noun (skipping verbs / adjectives if possible),
  // and prefix it with the first "good" modifier we saw before it. Result: 1–2 words.
  const nounIdx = keywords.findIndex((k) => !NON_NOUNS.has(k));
  let subjectTokens: string[] = [];
  if (nounIdx >= 0) {
    const noun = keywords[nounIdx];
    // Find a modifier earlier in the input that isn't 'ai' (too generic) and isn't the noun.
    const modifier = keywords.slice(0, nounIdx).find((k) => k !== noun && k !== 'ai');
    subjectTokens = modifier ? [modifier, noun] : [noun];
  } else if (keywords.length) {
    subjectTokens = [keywords[0]];
  }
  const subj = subjectTokens.length ? subjectTokens.map(capitalize).join(' ') : '';

  const topic = (keywords.slice(0, 2).join(' ') || 'the signal').toLowerCase();

  return { tokens, keywords, subject: subj, topic, domain };
}

/**
 * Pick a subject phrase to plug into copy. Returns the noun phrase if we
 * extracted a clean one, otherwise a vertical-appropriate fallback.
 */
function subjectFor(anat: InputAnatomy, vertical: Vertical): string {
  return anat.subject || capitalize(SUBJECT_FALLBACKS[vertical]);
}

function capitalize(s: string): string {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

/**
 * Convert third-person singular verb to bare/imperative form for use in
 * "X verbs Y" → "verb Y" patterns.
 * E.g. 'releases' → 'release', 'tracks' → 'track', 'tidies' → 'tidy'.
 */
function thirdPersonToBare(verb: string): string {
  if (/ies$/.test(verb)) return verb.slice(0, -3) + 'y';
  if (/(ches|shes|sses|xes|zes)$/.test(verb)) return verb.slice(0, -2);
  if (/s$/.test(verb)) return verb.slice(0, -1);
  return verb;
}

/* ------------------------------------------------------------------ */
/* Name generation                                                     */
/* ------------------------------------------------------------------ */

function makeNames(
  anat: InputAnatomy,
  vertical: Vertical,
  rng: () => number
): ProductName[] {
  const v = vertical;
  const prefixes = shuffle(ATOMS.prefixes[v], rng);
  const suffixes = shuffle(ATOMS.suffixes[v], rng);
  const monolithic = shuffle(ATOMS.monolithic[v], rng);
  // Prefer real nouns for the keyword-graft name; skip generic tokens like 'ai'.
  const goodKw = anat.keywords.find((k) => !NON_NOUNS.has(k) && k.length >= 4);
  const kwCore = goodKw ?? anat.keywords[0] ?? 'signal';

  const candidates: ProductName[] = [];

  // 1. Compound: PrefixSuffix (e.g. "Mothdesk", "Aetherdrive")
  candidates.push({
    text: capitalize(prefixes[0]) + suffixes[0],
    rationale: 'Compound name. Easy to say, available across most TLDs, evokes a small studio with a clear function.'
  });

  // 2. Keyword-graft: a content token + suffix (e.g. "Dreambeacon", "Rejectionledger")
  candidates.push({
    text: capitalize(kwCore) + suffixes[1 % suffixes.length],
    rationale: `Anchors the brand directly to “${kwCore}” so the URL telegraphs the use case. Memorable, slightly unfashionable in a good way.`
  });

  // 3. Monolithic / poetic single word (e.g. "Marginalia", "Lacuna")
  candidates.push({
    text: monolithic[0],
    rationale: 'Single word, no compound. Reads as a brand, not a description — gives the product room to grow past the first feature.'
  });

  // 4. Latin/Greek scientific feel — used as 2nd-tier alternate, only for sci-fi / open
  if (v === 'sci-fi-product' || v === 'open') {
    const latin = pick(LATIN_ROOTS, rng);
    candidates.push({
      text: capitalize(latin) + suffixes[2 % suffixes.length],
      rationale: 'Latinate root + functional suffix. Reads as classified instrumentation; useful if the product wants a specimen-jar feel.'
    });
  }

  // Dedupe and trim to 3
  const seen = new Set<string>();
  const out: ProductName[] = [];
  for (const c of candidates) {
    const k = c.text.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
    if (out.length === 3) break;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Tagline / positioning / concept / hook                              */
/* ------------------------------------------------------------------ */

const TAGLINE_PATTERNS: Record<Vertical, ((s: string, v: string, k: string) => string)[]> = {
  open: [
    (s)        => `${s}, made legible.`,
    (s, _v, k) => `Quiet tools for ${k || s.toLowerCase()}.`,
    (s, v)     => `${capitalize(thirdPersonToBare(v))} ${s.toLowerCase()}, on purpose.`
  ],
  'weird-saas': [
    (s, v) => `${capitalize(v)} ${s.toLowerCase()}, before they pile up.`,
    (s)    => `Bookkeeping for ${s.toLowerCase()}.`,
    (s)    => `One small tool. One sharp job: ${s.toLowerCase()}.`
  ],
  'sci-fi-product': [
    (s)    => `An instrument for ${s.toLowerCase()}.`,
    (s, v) => `Field equipment that ${v} ${articled(s.toLowerCase())}.`,
    (s)    => `${s}, observed and recorded.`
  ],
  'creator-brand': [
    (s)    => `A small press for ${s.toLowerCase()}.`,
    (s, v) => `${capitalize(thirdPersonToBare(v))} ${articled(s.toLowerCase())}, slowly and on purpose.`,
    (s)    => `${s}, edited.`
  ],
  'ai-side-project': [
    (s, v) => `A tiny model that ${v} ${articled(s.toLowerCase())}.`,
    (s)    => `${s}, in one keystroke.`,
    (s)    => `A pocket-sized assistant for ${s.toLowerCase()}.`
  ],
  'niche-utility': [
    (s)    => `${s}. Done.`,
    (s, v) => `${capitalize(v)} ${s.toLowerCase()}, with no setup.`,
    (s)    => `A single switch for ${s.toLowerCase()}.`
  ]
};

/** Add a leading article to a 1-2 word subject if it would read better with one. */
function articled(subj: string): string {
  // If it already starts with 'the/a/an' or 'this/that' or a possessive, leave it.
  if (/^(the|a|an|this|that|these|those|my|your|our)\b/i.test(subj)) return subj;
  // Pluralized? Skip article.
  if (/s$/i.test(subj) && !/ss$/i.test(subj)) return subj;
  // Starts with a vowel sound → 'an', else 'a'.
  const first = subj.trim()[0]?.toLowerCase() ?? '';
  return ('aeiou'.includes(first) ? 'an ' : 'a ') + subj;
}

function makeTagline(anat: InputAnatomy, vertical: Vertical, rng: () => number): string {
  const verb = pick(ATOMS.verbs[vertical], rng);
  const subj = subjectFor(anat, vertical);
  const kw = anat.keywords.find((k) => !NON_NOUNS.has(k)) ?? anat.keywords[0] ?? '';
  const fns = TAGLINE_PATTERNS[vertical];
  const fn = pick(fns, rng);
  return fn(subj, verb, kw);
}

const AUDIENCE_BY_VERTICAL: Record<Vertical, string[]> = {
  open:            ['curious builders and editors', 'people who like sharp tools', 'small teams who ship taste'],
  'weird-saas':    ['small operators with one weird recurring task', 'solo founders running odd businesses'],
  'sci-fi-product': ['collectors, world-builders, and people who keep field notebooks', 'speculative-design folks and quiet futurists'],
  'creator-brand': ['independent writers, editors, and zine-minded creators', 'creators who would rather publish less, better'],
  'ai-side-project': ['indie hackers and one-person studios', 'developers who want their AI quiet, small, and local-first'],
  'niche-utility': ['professionals with one stubborn pain point', 'people who already tried three apps and a spreadsheet']
};

function makePositioning(anat: InputAnatomy, vertical: Vertical, rng: () => number): string {
  const audience = pick(AUDIENCE_BY_VERTICAL[vertical], rng);
  const subj = subjectFor(anat, vertical).toLowerCase();
  const verb = pick(ATOMS.verbs[vertical], rng);
  const domain = anat.domain ? ` in ${anat.domain}` : '';
  return `For ${audience}${domain}: a tool that ${verb} ${subj} into something you can actually use, without the usual ceremony.`;
}

function makeConcept(input: string, anat: InputAnatomy, vertical: Vertical, rng: () => number): string {
  const verbA = pick(ATOMS.verbs[vertical], rng);
  const verbB = pick(ATOMS.verbs[vertical].filter((v) => v !== verbA), rng) || pick(ATOMS.verbs[vertical], rng);
  const domain = anat.domain ?? subjectFor(anat, vertical).toLowerCase();

  const seedSentence = `Start from "${input.trim()}" — that exact phrase is the input on day one.`;
  const moveSentence = `From there, the product ${verbA} ${domain} into a clean, legible artifact, then ${verbB} the result so it has somewhere to live.`;
  const closeByVertical: Record<Vertical, string> = {
    open:              'Optional, not opinionated. Reads more like a calm utility than a SaaS dashboard.',
    'weird-saas':      'Boring by design. The novelty is the niche, not the interface.',
    'sci-fi-product':  'Documentation is part of the product; lore is part of the documentation.',
    'creator-brand':   'Less feed, more edition. Each output is a release, not a notification.',
    'ai-side-project': 'Small surface, low expectations, surprisingly nice when used daily.',
    'niche-utility':   'A single workflow done well, and nothing else trying to grow into a platform.'
  };
  return `${seedSentence} ${moveSentence} ${closeByVertical[vertical]}`;
}

function makeHook(anat: InputAnatomy, vertical: Vertical, rng: () => number): string {
  const subj = subjectFor(anat, vertical).toLowerCase();
  const hooksByVertical: Record<Vertical, string[]> = {
    open:              [`Open with the input live on the page — type the phrase, watch the concept assemble.`,
                        `Lead with one bold sentence. Hide the pricing two scrolls down.`],
    'weird-saas':      [`Position it like a serious tool for an absurd niche — straight face, sharp copy.`,
                        `Lean into the specificity. Name the user by their job-to-be-done in the headline.`],
    'sci-fi-product':  [`Treat the launch page as a museum label. One artifact, one paragraph, one button.`,
                        `Open with a fictional field report; reveal it is the product.`],
    'creator-brand':   [`Launch with issue zero, not a homepage. The roadmap is a publishing calendar.`,
                        `Run the launch as a single editorial — beautiful PDF, three real readers, then open the doors.`],
    'ai-side-project': [`Show the product working in 8 seconds, no signup. Pricing is a footnote.`,
                        `Position as the smaller, calmer alternative to whatever 200-feature tool people are tired of.`],
    'niche-utility':   [`Lead with a before/after for ${subj}. Three bullets max.`,
                        `Sell the relief, not the feature list — what stops being annoying after install.`]
  };
  return pick(hooksByVertical[vertical], rng);
}

/* ------------------------------------------------------------------ */
/* Landing page structure                                              */
/* ------------------------------------------------------------------ */

function makeLanding(anat: InputAnatomy, vertical: Vertical, input: string): SectionPlan[] {
  // Use the user's actual phrase if we have it, else the extracted subject.
  const heroAnchor = input?.trim() || anat.subject || 'the idea';
  const base: SectionPlan[] = [
    { key: 'hero',     label: 'Hero',           copy: `One-line promise + the product working live. Anchor the page in the phrase the user typed: “${heroAnchor}”.` },
    { key: 'proof',    label: 'Proof of life',  copy: 'A short before/after, a 12-second loop, or one screenshot annotated with three callouts. Skip stock illustrations.' },
    { key: 'features', label: 'Three moves',    copy: 'Exactly three feature blocks, named as verbs not nouns. Each one ends with a single concrete output.' },
    { key: 'social',   label: 'Quiet endorsement', copy: 'Two real quotes, ideally with names and faces. If you do not have them yet, replace this with a single beta-user line.' },
    { key: 'cta',      label: 'One clear door', copy: 'A single primary CTA. No "or" choice. The footer carries pricing, contact, and a small system-status line.' }
  ];

  // Vertical adjustments
  if (vertical === 'creator-brand') {
    base.splice(2, 0, {
      key: 'editorial',
      label: 'Editorial sample',
      copy: 'Inline excerpt from the latest issue. Real type, real images, no marketing voiceover.'
    });
  }
  if (vertical === 'sci-fi-product') {
    base.splice(2, 0, {
      key: 'specimen',
      label: 'Specimen card',
      copy: 'Treat the product like a cataloged artifact: code, dimensions, materials, provenance. Type-only. No render.'
    });
  }
  if (vertical === 'ai-side-project') {
    base.splice(1, 0, {
      key: 'demo',
      label: 'Try it inline',
      copy: 'A live, working demo above the fold. No signup. Outputs are the marketing.'
    });
  }
  if (vertical === 'niche-utility') {
    base.splice(2, 0, {
      key: 'price',
      label: 'Price up front',
      copy: 'State the price in the second section, not the eighth. Reassurance > theatre.'
    });
  }

  return base;
}

/* ------------------------------------------------------------------ */
/* Bonus fields                                                        */
/* ------------------------------------------------------------------ */

function makeAudience(anat: InputAnatomy, vertical: Vertical, rng: () => number): string {
  const base = pick(AUDIENCE_BY_VERTICAL[vertical], rng);
  const domain = anat.domain ? ` working with ${anat.domain}` : '';
  return capitalize(base + domain) + '.';
}

function makeTone(vertical: Vertical, rng: () => number): string {
  return capitalize(pick(ATOMS.tones[vertical], rng)) + '.';
}

function makeVisual(vertical: Vertical, rng: () => number): string {
  return pick(ATOMS.visual[vertical], rng);
}

function makeMonetization(vertical: Vertical, rng: () => number): string {
  return pick(ATOMS.monetization[vertical], rng);
}

/* ------------------------------------------------------------------ */
/* Classification chip                                                  */
/* ------------------------------------------------------------------ */

function makeClassification(seed: number, anat: InputAnatomy): { code: string; band: string } {
  const rng = mulberry32(seed ^ 0x4e4f5641); // 'NOVA'
  const glyph = pick(GLYPHS, rng);
  const num = (seed % 90) + 10;          // 10–99
  const code = `NOVA-11 / ${glyph}-${num}`;
  const coherence = (anat.keywords.length * 18 + (seed % 22) + 35);
  const score = Math.max(35, Math.min(96, coherence));
  let band = 'Faint signal';
  if (score >= 85)      band = 'High coherence';
  else if (score >= 72) band = 'Clear orbit';
  else if (score >= 58) band = 'Forming pattern';
  else if (score >= 45) band = 'Loose draft';
  return { code, band };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export interface GenerateOptions {
  vertical: Vertical;
  /** Optional seed salt — bumping this with the same input regenerates a new variant. */
  seed?: number;
}

/**
 * Generate a launch concept from a single strange input.
 * Pure + deterministic given (input, vertical, seed).
 *
 * To swap in a real API later, replace the body with a fetch and keep the
 * `LaunchConcept` return shape intact.
 */
export function generateConcept(input: string, opts: GenerateOptions): LaunchConcept {
  const cleaned = input.trim();
  const seed = hash32(`${cleaned}::${opts.vertical}::${opts.seed ?? 0}`);
  const rng = mulberry32(seed);

  const anat = anatomy(cleaned);
  const vertical = opts.vertical;

  const names = makeNames(anat, vertical, rng);
  const tagline = makeTagline(anat, vertical, rng);
  const positioning = makePositioning(anat, vertical, rng);
  const concept = makeConcept(cleaned, anat, vertical, rng);
  const hook = makeHook(anat, vertical, rng);
  const landing = makeLanding(anat, vertical, cleaned);

  const audience = makeAudience(anat, vertical, rng);
  const tone = makeTone(vertical, rng);
  const visual = makeVisual(vertical, rng);
  const monetization = makeMonetization(vertical, rng);
  const classification = makeClassification(seed, anat);

  // Tagline: capitalize only the first character — keep the rest as written.
  const cleanTagline = tagline.replace(/\s+/g, ' ').trim();
  const finalTagline =
    cleanTagline.charAt(0).toUpperCase() + cleanTagline.slice(1);

  return {
    input: cleaned,
    vertical,
    names,
    tagline: finalTagline,
    positioning,
    concept,
    hook,
    landing,
    audience,
    tone,
    visual,
    monetization,
    classification
  };
}
