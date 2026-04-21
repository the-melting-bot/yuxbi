/**
 * Vibe Decode — Type Definitions
 * Atmospheric reading of a website's design language.
 * Designed to be replaceable with a live AI endpoint or scraping pipeline.
 */

export interface VibeDecodeResult {
  url: string;
  prettyUrl: string; // e.g. "stripe.com"
  timestamp: string;
  signalId: string;

  atmosphereRead: {
    oneLiner: string;
    vibeClassification: string;
    confidence: number; // 0–100
    dominantFeeling: string;
  };

  emotionalTone: {
    traits: string[]; // 5–8 mood traits
  };

  designLanguage: {
    layoutStyle: string;
    typography: string;
    spacingDensity: string;
    imageryStrategy: string;
    interactionFeel: string;
    motionPersonality: string;
    uiPolish: string;
  };

  brandSignal: {
    companyArchetype: string;
    audience: string;
    trustAuthority: string;
    marketPosition: 'mass' | 'mid' | 'premium' | 'luxury' | 'niche';
  };

  visualBreakdown: {
    colorPhilosophy: string;
    contrastBehavior: string;
    whitespaceUse: string;
    surfaceStyle: string;
    iconStyle: string;
    hierarchyClarity: string;
    craftLevel: 'template-feel' | 'semi-custom' | 'custom-crafted' | 'bespoke';
  };

  strategicInterpretation: {
    intendedFeeling: string;
    doingWell: string[];
    overdoing: string[];
    whyItWorks: string;
  };

  borrowAvoid: {
    borrow: string[]; // 3 things
    avoid: string[]; // 3 things
  };

  rebuildDirection: {
    type: string;
    spacing: string;
    surfaces: string;
    motion: string;
    contentTone: string;
    conversionStyle: string;
  };

  scorecard: {
    clarity: number;
    originality: number;
    polish: number;
    warmth: number;
    authority: number;
    distinctiveness: number;
    trust: number;
    memorability: number;
  };
}

export const LOADING_PHRASES = [
  'Sampling visual language',
  'Reading atmospheric signal',
  'Mapping design intent',
  'Interpreting trust cues',
  'Decoding aesthetic posture',
  'Measuring brand gravity',
  'Parsing tonal frequency',
  'Tracing hierarchy patterns',
  'Scanning surface behavior',
  'Calibrating vibe field'
];
