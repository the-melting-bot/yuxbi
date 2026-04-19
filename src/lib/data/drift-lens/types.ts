/**
 * Drift Lens — Type Definitions
 * Structured interpretation output for domain brand readings.
 * Designed to be replaceable with a live AI endpoint in the future.
 */

export interface DriftLensResult {
  domain: string;
  timestamp: string;
  signalId: string;

  coreRead: {
    archetype: string;
    interpretation: string;
    confidence: number; // 0–100
    reasoning: string;
  };

  emotionalFeel: {
    traits: string[]; // 5–7 mood traits
  };

  visualDirection: {
    colorPalette: { name: string; hex: string }[];
    typeDirection: string;
    uiDensity: string;
    motionStyle: string;
    imageryDirection: string;
    layoutPersonality: string;
  };

  audienceSignal: {
    targetAudience: string;
    trustProfile: string;
    pricePositioning: string;
  };

  siteRecommendation: {
    siteType: string;
    homepageSections: string[];
    ctaLanguage: string[];
  };

  voiceMessaging: {
    toneOfVoice: string;
    headlines: string[];
    taglines: string[];
    elevatorPitch: string;
  };

  identitySignals: {
    logoDirection: string;
    symbolConcept: string;
    casingWordmark: string;
    faviconIdea: string;
  };

  buildReadiness: {
    signalStrength: 'strong' | 'moderate' | 'weak';
    recommendation: 'build now' | 'reposition' | 'rename';
    nextActions: string[];
  };
}

export const LOADING_PHRASES = [
  'Parsing semantic signal',
  'Reading brand gravity',
  'Interpreting audience expectation',
  'Mapping visual direction',
  'Decoding emotional frequency',
  'Tracing identity patterns',
  'Scanning name architecture',
  'Measuring trust resonance',
  'Extracting positioning data',
  'Calibrating tone field'
];
