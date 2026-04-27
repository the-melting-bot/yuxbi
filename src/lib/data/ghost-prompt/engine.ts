/**
 * Ghost Prompt — Scrubber Engine
 * Pure, client-side. Strips filler, sharpens intent, rewrites for target modes,
 * computes a Ghost Score, and emits a word-level diff.
 *
 * This is deterministic mock-LLM logic. The architecture cleanly accepts a
 * future API: replace `scrubPrompt` with a server-call that returns the same
 * `ScrubResult` shape.
 */

import type {
  DiffSegment,
  GhostScore,
  MissingContext,
  PresetAction,
  PromptVariant,
  ScoreDimension,
  ScrubOptions,
  ScrubResult,
  TargetMode
} from './types';

/* ------------------------------------------------------------------ */
/* Lexicons                                                            */
/* ------------------------------------------------------------------ */

// Filler phrases (lowercase, longest-first). Order matters — multi-word first.
const FILLER_PHRASES: string[] = [
  'i was wondering if you could maybe',
  'i was wondering if you could',
  'i was kind of wondering',
  'so basically can you maybe',
  'so basically can u maybe',
  'so basically can u',
  'so basically can you',
  'i was thinking it would be cool if',
  'i was thinking maybe',
  'i was thinking it would be',
  'can u just',
  'can you just',
  'is it possible to',
  'do you think you could',
  'if you wouldnt mind',
  "if you wouldn't mind",
  'i kind of want to',
  'i kinda want to',
  'kind of want to',
  'kinda want to',
  'sort of like',
  'sort of',
  'kind of',
  'kinda',
  'i guess',
  'i mean',
  'idk maybe',
  'idk just',
  'idk',
  'um also',
  'um',
  'uh',
  'er ',
  'like a really good',
  'really really',
  'maybe',
  'basically',
  'honestly',
  'literally',
  'just',
  'pretty much',
  'pretty',
  'sort of',
  'somewhat',
  'kinda',
  'or whatever',
  'or something',
  'or anything',
  'plz',
  'pls',
  'thx',
  'thanks',
  'tbh',
  'rn',
  'ngl',
  'i think',
  'i feel like',
  'in my opinion',
  'imo',
  'sort of a',
  'i was thinking'
];

// Single-word fillers that should be removed wholesale (with surrounding spaces).
const FILLER_WORDS = new Set([
  'um', 'uh', 'er', 'hmm', 'hm', 'so', 'well', 'like', 'just', 'really',
  'very', 'kinda', 'kind', 'maybe', 'basically', 'honestly', 'literally',
  'tbh', 'rn', 'ngl', 'plz', 'pls', 'thx', 'idk', 'lol'
]);

// Hedges to soften then sharpen.
const HEDGES_PATTERNS: [RegExp, string][] = [
  [/\bi (?:would |'d )?like (?:you )?to\b/gi, ''],
  [/\bcan you\b/gi, ''],
  [/\bcould you\b/gi, ''],
  [/\bplease\b/gi, ''],
  [/\bif possible\b/gi, ''],
  [/\bif that's ok\b/gi, ''],
  [/\bif thats ok\b/gi, ''],
  [/\bif you can\b/gi, ''],
  [/\bif you could\b/gi, ''],
  [/\bi need\b/gi, ''],
  [/\bi want\b/gi, ''],
  [/\bi'd like\b/gi, ''],
  [/\bid like\b/gi, '']
];

// Vague qualifiers — flag for ambiguity score and softly remove.
const VAGUE_QUALIFIERS = [
  'good', 'nice', 'great', 'cool', 'awesome', 'amazing', 'modern',
  'professional', 'clean', 'beautiful', 'simple', 'pretty', 'fun',
  'fancy', 'perfect', 'best', 'better', 'high quality', 'top quality',
  'high-quality', 'quality', 'vibey'
];

// Tokens that strongly imply intent verbs.
const INTENT_VERBS = [
  'write', 'generate', 'build', 'create', 'design', 'make', 'render',
  'analyze', 'summarize', 'translate', 'rewrite', 'review', 'explain',
  'compare', 'list', 'plan', 'draft', 'extract', 'find', 'fix', 'debug',
  'refactor', 'implement', 'visualize', 'chart', 'sort', 'classify',
  'evaluate', 'critique', 'optimize', 'simplify', 'illustrate'
];

// Casual contractions / spellings to formalize.
const NORMALIZATIONS: [RegExp, string][] = [
  [/\bu\b/g, 'you'],
  [/\bur\b/g, 'your'],
  [/\bidk\b/gi, ''],
  [/\bdunno\b/gi, ''],
  [/\bgonna\b/gi, 'going to'],
  [/\bwanna\b/gi, 'want to'],
  [/\bgotta\b/gi, 'have to'],
  [/\bcuz\b/gi, 'because'],
  [/\bthru\b/gi, 'through'],
  [/\bwut\b/gi, 'what'],
  [/\bpls\b/gi, ''],
  [/\bplz\b/gi, ''],
  [/\bthx\b/gi, '']
];

/* ------------------------------------------------------------------ */
/* Tokenizer                                                           */
/* ------------------------------------------------------------------ */

function tokenize(s: string): string[] {
  // Split into tokens of "word", "whitespace", or "punct"
  const out: string[] = [];
  const re = /([A-Za-z][A-Za-z'']*|\d+|\s+|[^A-Za-z0-9\s])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) out.push(m[0]);
  return out;
}

function lowerWord(t: string): string {
  return t.toLowerCase().replace(/[^a-z]/g, '');
}

function capitalizeFirst(s: string): string {
  if (!s) return s;
  // capitalize first letter of first alpha char
  return s.replace(/([a-z])/, (c) => c.toUpperCase());
}

function isWordToken(t: string): boolean {
  return /^[A-Za-z][A-Za-z'']*$/.test(t);
}

/* ------------------------------------------------------------------ */
/* Cleaning core — produces cleaned text + diff segments               */
/* ------------------------------------------------------------------ */

interface CleanPass {
  cleaned: string;
  diff: DiffSegment[];
  removedCount: number;
  addedCount: number;
}

function passCleanFiller(input: string): { text: string; removedTokens: Set<number> } {
  let text = input;
  // Multi-word phrase pass (case-insensitive). Use placeholder to avoid double-strikes.
  for (const phrase of FILLER_PHRASES) {
    const re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    text = text.replace(re, ' ');
  }
  // Normalizations
  for (const [re, repl] of NORMALIZATIONS) text = text.replace(re, repl);
  // Hedge patterns
  for (const [re, repl] of HEDGES_PATTERNS) text = text.replace(re, repl);
  return { text, removedTokens: new Set() };
}

function stripFillerWords(s: string): string {
  // Token-aware filler word removal (preserves punctuation/spaces)
  const tokens = tokenize(s);
  const out: string[] = [];
  for (const t of tokens) {
    if (isWordToken(t) && FILLER_WORDS.has(lowerWord(t))) continue;
    out.push(t);
  }
  return out.join('');
}

function collapseWhitespace(s: string): string {
  return s
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*([,.;:!?])\s*/g, '$1 ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

function repairPunctuation(s: string): string {
  let r = s;
  // Strip filler punctuation noise like ". ." or " , ."
  r = r.replace(/([,.;:!?])\s*[,.;:!?]/g, '$1');
  r = r.replace(/\s+([,.;:!?])/g, '$1');
  // Ensure terminal period for declarative request
  if (!/[.!?]$/.test(r) && r.length > 0) r += '.';
  // Capitalize first letter
  r = capitalizeFirst(r);
  // Capitalize after sentence terminators
  r = r.replace(/([.!?]\s+)([a-z])/g, (_m, p1: string, p2: string) => p1 + p2.toUpperCase());
  return r;
}

function cleanCore(original: string): string {
  let s = original.replace(/\s+/g, ' ').trim();
  s = passCleanFiller(s).text;
  s = stripFillerWords(s);
  s = collapseWhitespace(s);
  s = repairPunctuation(s);
  return s;
}

/* ------------------------------------------------------------------ */
/* Word-level diff                                                     */
/* ------------------------------------------------------------------ */

function wordsOnly(s: string): string[] {
  return s
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[^a-z0-9'-]/g, ''));
}

function buildDiff(original: string, cleaned: string): { diff: DiffSegment[]; removed: number; added: number } {
  // LCS-based word diff that preserves original casing/punctuation when possible.
  const origTokens = tokenize(original).filter((t) => t.trim().length > 0);
  const cleanTokens = tokenize(cleaned).filter((t) => t.trim().length > 0);
  const a = origTokens.map((t) => t.toLowerCase().replace(/[^a-z0-9'-]/g, ''));
  const b = cleanTokens.map((t) => t.toLowerCase().replace(/[^a-z0-9'-]/g, ''));

  const m = a.length;
  const n = b.length;
  // LCS DP
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] && a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const segs: DiffSegment[] = [];
  let i = 0;
  let j = 0;
  let removed = 0;
  let added = 0;
  function pushSeg(kind: DiffSegment['kind'], text: string) {
    if (!text) return;
    const last = segs[segs.length - 1];
    if (last && last.kind === kind) last.text += ' ' + text;
    else segs.push({ kind, text });
  }
  while (i < m && j < n) {
    if (a[i] && a[i] === b[j]) {
      pushSeg('kept', origTokens[i]);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      pushSeg('removed', origTokens[i]);
      removed++;
      i++;
    } else {
      pushSeg('added', cleanTokens[j]);
      added++;
      j++;
    }
  }
  while (i < m) {
    pushSeg('removed', origTokens[i++]);
    removed++;
  }
  while (j < n) {
    pushSeg('added', cleanTokens[j++]);
    added++;
  }
  return { diff: segs, removed, added };
}

/* ------------------------------------------------------------------ */
/* Intent detection                                                    */
/* ------------------------------------------------------------------ */

function detectIntent(cleaned: string, mode: TargetMode): string {
  // Find ALL intent-verb hits and prefer the one whose trailing chunk yields
  // the longest, cleanest subject. This avoids latching onto a verb that
  // happens to appear inside a noun phrase (e.g. "data in a chart").
  let verb: string | undefined;
  let subject = '';
  type Hit = { verb: string; idx: number; subject: string };
  const hits: Hit[] = [];

  for (const v of INTENT_VERBS) {
    const re = new RegExp(`\\b${v}\\b`, 'gi');
    let m: RegExpExecArray | null;
    while ((m = re.exec(cleaned)) !== null) {
      const after = cleaned.slice(m.index + m[0].length);
      const s = extractSubject(after);
      // Reject trivial subjects ("", "t", "it", single-letter, single stop-word)
      if (s && s.length >= 3 && s.split(/\s+/).some((w) => w.length >= 3)) {
        hits.push({ verb: v, idx: m.index, subject: s });
      }
    }
  }

  if (hits.length) {
    // Prefer the earliest hit with a non-trivial subject (>=2 tokens),
    // otherwise the longest subject.
    const meaty = hits.filter((h) => h.subject.split(/\s+/).length >= 2);
    const pick =
      meaty.sort((a, b) => a.idx - b.idx)[0] ??
      hits.sort((a, b) => b.subject.length - a.subject.length)[0];
    verb = pick.verb;
    subject = pick.subject;
  }

  // Fallback: scan whole cleaned text for the longest meaty noun-phrase chunk.
  if (!subject) {
    const candidates = cleaned
      .split(/[.!?,;:\n]/)
      .map((c) => extractSubject(c))
      .filter((s) => s && s.length >= 3 && s.split(/\s+/).some((w) => w.length >= 3));
    candidates.sort((a, b) => b.length - a.length);
    subject = candidates[0] ?? '';
  }
  if (!subject) subject = 'the request';

  // Mode-conditioned phrasing
  const modePhrase: Record<TargetMode, string> = {
    general:   `produce a clear response about ${subject}.`,
    coding:    `produce a working code solution for ${subject}.`,
    design:    `produce a design or UI direction for ${subject}.`,
    research:  `produce a structured investigation into ${subject}.`,
    marketing: `produce on-voice marketing copy for ${subject}.`,
    image:     `produce an image prompt describing ${subject}.`
  };

  if (!verb) verb = mode === 'image' ? 'render' : 'produce';
  return `The user wants to ${modePhrase[mode]}`.replace(`produce`, verb);
}

/**
 * Pull a short, readable noun-phrase from a chunk of text.
 * Strips leading articles and stop-words, stops at clause boundaries,
 * and caps at ~9 words / 80 chars.
 */
function extractSubject(text: string): string {
  if (!text) return '';
  // Stop at sentence/clause boundaries.
  const clause = text.split(/[.!?,;:\n]/)[0] ?? '';
  // Drop leading filler / connectives / pronouns / openers
  let cleaned = clause
    .replace(/^[\s]+/, '')
    .replace(
      /^(?:(?:that|which|where|how|why|when|what|who|like|kinda|sort of|maybe|just|some|hey|um|okay|ok|so|i|we|you|they|i'd|i'm|i had|i was|i think|it|its|it's|a |an |the )\s*)+/i,
      ''
    )
    .trim();
  // Tokenize and trim
  const stopHead = new Set([
    'a', 'an', 'the', 'to', 'of', 'for', 'with', 'on', 'about', 'in',
    'i', 'we', 'you', 'they', 'me', 'my', 'our', 'your', 'their', 'it',
    'had', 'was', 'is', 'are', 'be', 'this', 'that'
  ]);
  const stopTail = new Set([
    'a', 'an', 'the', 'to', 'of', 'for', 'with', 'on', 'about', 'in', 'and', 'or',
    'is', 'are', 'be', 'that', 'which', 'this', 'it', 'me', 'my', 'our', 'your', 'their',
    'where', 'how', 'why', 'when', 'what', 'who', 'so', 'but', 'if', 'as'
  ]);
  let toks = cleaned.split(/\s+/).filter(Boolean);
  while (toks.length && stopHead.has(toks[0].replace(/[^A-Za-z']/g, '').toLowerCase())) toks.shift();
  toks = toks.slice(0, 9);
  while (toks.length && stopTail.has(toks[toks.length - 1].replace(/[^A-Za-z']/g, '').toLowerCase()))
    toks.pop();
  let out = toks.join(' ').trim();
  // Trim trailing punctuation
  out = out.replace(/[\s\-—–:;,.]+$/, '');
  if (out.length > 80) out = out.slice(0, 80).replace(/\s+\S*$/, '') + '…';
  return out.toLowerCase();
}

/* ------------------------------------------------------------------ */
/* Missing context                                                     */
/* ------------------------------------------------------------------ */

function detectMissing(original: string, mode: TargetMode): MissingContext[] {
  const lower = original.toLowerCase();
  const has = (re: RegExp) => re.test(lower);
  const out: MissingContext[] = [];

  if (!has(/\b(audience|user|reader|customer|persona|for (devs|developers|designers|founders|kids|teens|adults))\b/))
    out.push({ key: 'audience', label: 'Audience', prompt: 'Who is this for?' });

  if (!has(/\b(tone|voice|formal|casual|friendly|playful|serious|witty|dry)\b/))
    out.push({ key: 'tone', label: 'Tone', prompt: 'What tone should it strike?' });

  if (!has(/\b(format|bullet|list|table|markdown|json|outline|steps|paragraph|email|tweet|thread|essay)\b/))
    out.push({ key: 'format', label: 'Format', prompt: 'What output format do you want?' });

  if (!has(/\b(\d+\s*(words?|sentences?|paragraphs?|chars?|characters|lines?|items?|bullets?))\b|short|long|brief|concise/))
    out.push({ key: 'length', label: 'Length', prompt: 'How long should it be?' });

  if (!has(/\b(must|should not|avoid|don't|do not|constraint|only|max|min|under|over|within)\b/))
    out.push({ key: 'constraints', label: 'Constraints', prompt: 'Any hard rules or things to avoid?' });

  if (mode === 'coding' && !has(/\b(react|svelte|vue|next|node|python|rust|typescript|tailwind|html|api|database|sql|postgres|sqlite)\b/))
    out.push({ key: 'platform', label: 'Stack', prompt: 'Which language, framework, or runtime?' });

  if (mode === 'image' && !has(/\b(style|aspect|ratio|lighting|palette|camera|lens|composition|mood)\b/))
    out.push({ key: 'platform', label: 'Style', prompt: 'Style references, aspect, lighting, mood?' });

  if (!has(/\b(example|reference|like|similar to|in the style of|see also|inspired by)\b/))
    out.push({ key: 'examples', label: 'Examples', prompt: 'Any reference examples to anchor on?' });

  if (mode === 'coding' || mode === 'research') {
    if (!has(/\b(input|output|signature|return|format|schema)\b/))
      out.push({ key: 'inputs-outputs', label: 'Inputs / outputs', prompt: 'What goes in and what should come out?' });
  }

  // Cap to 6 to keep UI tidy
  return out.slice(0, 6);
}

/* ------------------------------------------------------------------ */
/* Variants                                                            */
/* ------------------------------------------------------------------ */

function variantConcise(cleaned: string): string {
  // Take the smallest sentence-fragment that includes the first intent verb.
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  const main = sentences[0] ?? cleaned;
  // Strip vague qualifiers
  let s = main;
  for (const q of VAGUE_QUALIFIERS) s = s.replace(new RegExp(`\\b${q}\\b`, 'gi'), '');
  s = collapseWhitespace(s);
  return repairPunctuation(s);
}

function variantDetailed(cleaned: string, missing: MissingContext[]): string {
  const lines: string[] = [cleaned.replace(/\.$/, '') + '.'];
  if (missing.length) {
    lines.push('');
    lines.push('Specify:');
    for (const m of missing.slice(0, 5)) lines.push(`- ${m.label}: ${m.prompt}`);
  }
  return lines.join('\n');
}

function variantTechnical(cleaned: string, mode: TargetMode): string {
  const role =
    mode === 'coding' ? 'a senior software engineer'
    : mode === 'design' ? 'a senior product designer'
    : mode === 'research' ? 'a domain analyst'
    : mode === 'marketing' ? 'a senior brand copywriter'
    : mode === 'image' ? 'a concept artist'
    : 'a domain expert';
  return [
    `Role: Act as ${role}.`,
    `Task: ${cleaned}`,
    `Method: Reason step by step. Surface assumptions explicitly.`,
    `Output: Return the answer in a clearly structured form. Cite any constraints. No filler, no hedging.`
  ].join('\n');
}

function variantCreative(cleaned: string): string {
  return [
    `Take this brief and answer it as if you have unusually good taste.`,
    ``,
    cleaned,
    ``,
    `Constraints: avoid clichés. Avoid generic SaaS phrasing. Pick a strong angle and commit.`
  ].join('\n');
}

function variantExpert(cleaned: string, mode: TargetMode): string {
  const focusLine: Record<TargetMode, string> = {
    general:   'Maximize signal density. No throat-clearing.',
    coding:    'Production-quality code. Handle edges. No commented stubs.',
    design:    'Strong opinion on hierarchy, type, spacing, and motion. No moodboard mush.',
    research:  'Primary sources where possible. Quantify where you can. State confidence.',
    marketing: 'Specific, sticky, and concrete. No marketing-tone padding.',
    image:     'Camera, lens, lighting, palette, composition, subject — be precise.'
  };
  return [
    cleaned,
    ``,
    `Quality bar: ${focusLine[mode]}`,
    `If anything is missing, ask one tight clarifying question first; otherwise proceed.`
  ].join('\n');
}

/* ------------------------------------------------------------------ */
/* Target-mode rewrite                                                 */
/* ------------------------------------------------------------------ */

function rewriteForMode(cleaned: string, mode: TargetMode, missing: MissingContext[]): string {
  switch (mode) {
    case 'coding':
      return [
        `Goal: ${cleaned}`,
        `Stack: <fill in: language / framework / runtime>`,
        `Inputs: <fill in>`,
        `Outputs: <fill in: data shape, return type, side effects>`,
        `Constraints: <fill in: perf budget, deps, style>`,
        `Deliverable: working code, with brief inline rationale and a small test or usage example.`
      ].join('\n');
    case 'design':
      return [
        `Goal: ${cleaned}`,
        `Surface: <fill in: page, component, flow>`,
        `Audience: <fill in>`,
        `Tone: <fill in: serious / playful / clinical / luxe>`,
        `Constraints: <fill in: brand tokens, accessibility, layout>`,
        `Deliverable: a recommended direction with hierarchy, type, color, spacing, and one alternate.`
      ].join('\n');
    case 'research':
      return [
        `Question: ${cleaned}`,
        `Scope: <fill in: time range, geography, segments>`,
        `Sources to prefer: <fill in>`,
        `Format: structured summary, named sources, and 3 takeaways.`,
        `Confidence: state where evidence is thin.`
      ].join('\n');
    case 'marketing':
      return [
        `Brief: ${cleaned}`,
        `Audience: <fill in>`,
        `Tone: <fill in>`,
        `Format: <fill in: tagline, paragraph, post, ad set>`,
        `Constraints: <fill in: word count, brand voice, do-not-say list>`,
        `Deliverable: one strong primary, two alternates, and a one-line rationale per option.`
      ].join('\n');
    case 'image':
      return [
        `Subject: ${cleaned}`,
        `Style: <fill in: photoreal, illustration, 3D, painterly>`,
        `Composition: <fill in: framing, focal point, rule of thirds>`,
        `Lighting: <fill in: time of day, source, mood>`,
        `Palette: <fill in>`,
        `Camera: <fill in: lens, depth of field, angle>`,
        `Aspect: <fill in> · Negative: <fill in>`
      ].join('\n');
    case 'general':
    default: {
      const tail = missing.length
        ? `\n\nIf needed, ask once about: ${missing.slice(0, 3).map((m) => m.label.toLowerCase()).join(', ')}.`
        : '';
      return `${cleaned}${tail}`;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Ghost score                                                         */
/* ------------------------------------------------------------------ */

function countMatches(re: RegExp, s: string): number {
  const m = s.match(re);
  return m ? m.length : 0;
}

function computeScore(original: string, cleaned: string): GhostScore {
  const origWords = wordsOnly(original).length || 1;
  const cleanWords = wordsOnly(cleaned).length || 1;
  const lower = original.toLowerCase();

  // Filler density
  const fillerHits =
    countMatches(/\b(um|uh|like|just|kinda|kind of|sort of|maybe|basically|honestly|literally|tbh|rn|ngl|plz|pls|thx|idk)\b/gi, lower) +
    countMatches(/\b(or whatever|or something|or anything)\b/gi, lower);
  const fillerRatio = Math.min(1, fillerHits / Math.max(8, origWords / 6));
  const fillerScore = Math.round((1 - fillerRatio) * 100);

  // Vague qualifiers → ambiguity
  let vagueHits = 0;
  for (const q of VAGUE_QUALIFIERS) vagueHits += countMatches(new RegExp(`\\b${q}\\b`, 'gi'), lower);
  const ambiguityRatio = Math.min(1, vagueHits / Math.max(6, origWords / 8));
  const ambiguityScore = Math.round((1 - ambiguityRatio) * 100);

  // Specificity — proper nouns, numbers, quoted bits, code-ish tokens
  const specificHits =
    countMatches(/\b\d+(?:\.\d+)?\b/g, original) +
    countMatches(/\b[A-Z][a-z]{2,}\b/g, original) +
    countMatches(/[`"'][^`"']{2,}[`"']/g, original) +
    countMatches(/\b(react|svelte|vue|next|node|python|rust|typescript|tailwind|html|api|sql)\b/gi, original);
  const specificityScore = Math.min(100, 30 + specificHits * 12);

  // Clarity — derived from filler + structure + sentence length
  const sentences = original.split(/[.!?\n]+/).filter((s) => s.trim().length > 0);
  const avgLen = sentences.length ? origWords / sentences.length : origWords;
  const sentenceLenScore = avgLen <= 28 && avgLen >= 4 ? 100 : avgLen > 28 ? Math.max(40, 100 - (avgLen - 28) * 3) : 70;
  const clarityScore = Math.round((fillerScore * 0.5 + sentenceLenScore * 0.5));

  // Structure — bullets, numbers, line breaks, "format:" cues
  const structureHits =
    countMatches(/^\s*[-*]\s/gm, original) +
    countMatches(/^\s*\d+\.\s/gm, original) +
    countMatches(/\n/g, original) +
    countMatches(/\b(format|tone|audience|constraint|input|output|goal|task|deliverable):/gi, original);
  const structureScore = Math.min(100, 30 + structureHits * 14);

  const dimensions: ScoreDimension[] = [
    { key: 'clarity',     label: 'Clarity',     value: clarityScore,     note: clarityNote(clarityScore) },
    { key: 'specificity', label: 'Specificity', value: specificityScore, note: specificityNote(specificityScore) },
    { key: 'filler',      label: 'Filler',      value: fillerScore,      note: fillerNote(fillerScore) },
    { key: 'ambiguity',   label: 'Ambiguity',   value: ambiguityScore,   note: ambiguityNote(ambiguityScore) },
    { key: 'structure',   label: 'Structure',   value: structureScore,   note: structureNote(structureScore) }
  ];

  const overall = Math.round(
    dimensions.reduce((sum, d) => sum + d.value, 0) / dimensions.length
  );

  // Reduction bonus — large cleanup means original was noisy.
  const reduction = 1 - cleanWords / origWords;
  const adjusted = Math.max(0, Math.min(100, overall - Math.round(reduction * 12)));
  // We use `adjusted` for the band — original was noisier than its parts suggest.
  const band = bandFor(adjusted);

  return { overall: adjusted, band, dimensions };
}

function bandFor(score: number): string {
  if (score >= 80) return 'Clear signal';
  if (score >= 65) return 'Mild static';
  if (score >= 50) return 'Static cluster';
  if (score >= 35) return 'Heavy fog';
  return 'Faint signal';
}

function clarityNote(v: number): string {
  if (v >= 80) return 'Reads cleanly.';
  if (v >= 60) return 'A few rough edges.';
  if (v >= 40) return 'Hard to follow in places.';
  return 'Hard to follow throughout.';
}
function specificityNote(v: number): string {
  if (v >= 80) return 'Concrete nouns and numbers.';
  if (v >= 60) return 'Some specifics, some haze.';
  if (v >= 40) return 'Mostly abstract.';
  return 'Almost nothing concrete.';
}
function fillerNote(v: number): string {
  if (v >= 80) return 'Tight, almost no filler.';
  if (v >= 60) return 'A bit of throat-clearing.';
  if (v >= 40) return 'Filler crowds the signal.';
  return 'Buried in filler.';
}
function ambiguityNote(v: number): string {
  if (v >= 80) return 'Clear references.';
  if (v >= 60) return 'A few vague qualifiers.';
  if (v >= 40) return 'Many vague qualifiers.';
  return 'Mostly vague.';
}
function structureNote(v: number): string {
  if (v >= 80) return 'Well structured.';
  if (v >= 60) return 'Light structure present.';
  if (v >= 40) return 'No real structure.';
  return 'No structure at all.';
}

/* ------------------------------------------------------------------ */
/* Preset application                                                  */
/* ------------------------------------------------------------------ */

function applyPresets(text: string, presets: PresetAction[], mode: TargetMode): string {
  let out = text;
  for (const p of presets) {
    switch (p) {
      case 'concise':
        out = variantConcise(out);
        break;
      case 'remove-fluff':
        out = cleanCore(out);
        break;
      case 'add-structure':
        out = `Goal: ${out}\nFormat: <fill in>\nConstraints: <fill in>\nDeliverable: <fill in>`;
        break;
      case 'specific':
        out = `${out}\n\nBe specific: name the audience, format, length, and at least one concrete example.`;
        break;
      case 'technical':
        out = variantTechnical(out, mode);
        break;
      case 'creative':
        out = variantCreative(out);
        break;
      case 'for-coding':
        out = rewriteForMode(out, 'coding', []);
        break;
      case 'for-image':
        out = rewriteForMode(out, 'image', []);
        break;
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Public entry                                                        */
/* ------------------------------------------------------------------ */

export function scrubPrompt(input: string, opts: ScrubOptions): ScrubResult {
  const original = input;
  const cleaned = cleanCore(original);

  const intent = detectIntent(cleaned, opts.mode);
  const missing = detectMissing(original, opts.mode);

  const variants: PromptVariant[] = [
    { key: 'concise',   label: 'Concise',   text: variantConcise(cleaned) },
    { key: 'detailed',  label: 'Detailed',  text: variantDetailed(cleaned, missing) },
    { key: 'technical', label: 'Technical', text: variantTechnical(cleaned, opts.mode) },
    { key: 'creative',  label: 'Creative',  text: variantCreative(cleaned) },
    { key: 'expert',    label: 'Expert',    text: variantExpert(cleaned, opts.mode) }
  ];

  const presets = opts.presets ?? [];
  const cleanedAfterPresets = presets.length ? applyPresets(cleaned, presets, opts.mode) : cleaned;

  const targetRewrite = {
    mode: opts.mode,
    text: rewriteForMode(cleanedAfterPresets, opts.mode, missing)
  };

  const score = computeScore(original, cleaned);

  const { diff, removed, added } = buildDiff(original, cleanedAfterPresets);

  return {
    original,
    cleaned: cleanedAfterPresets,
    intent,
    missing,
    variants,
    targetRewrite,
    score,
    diff,
    removedCount: removed,
    addedCount: added,
    appliedPresets: presets
  };
}
