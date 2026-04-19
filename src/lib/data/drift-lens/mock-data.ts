import type { DriftLensResult } from './types';

/**
 * Mock interpretations for sample domains.
 * Architected for easy swap to a live AI endpoint.
 * Call `interpretDomain(domain)` — it returns a Promise<DriftLensResult>
 * so the consuming code won't need changes when the backend arrives.
 */

const mockResults: Record<string, DriftLensResult> = {
  'yuxbi.com': {
    domain: 'yuxbi.com',
    timestamp: new Date().toISOString(),
    signalId: 'SIG-0071',
    coreRead: {
      archetype: 'The Strange Inventor',
      interpretation: 'A digital laboratory brand that signals experimental craft and intentional weirdness.',
      confidence: 92,
      reasoning: 'The invented word "yuxbi" carries no inherited meaning, freeing it to become anything. The phonetics feel alien but memorable — short, punchy, with a hard stop. The .com signals serious intent despite the unconventional name. This is a brand that wants to be discovered, not explained.'
    },
    emotionalFeel: {
      traits: ['Experimental', 'Precise', 'Uncanny', 'Playful', 'Confident', 'Deliberate']
    },
    visualDirection: {
      colorPalette: [
        { name: 'Deep Lab', hex: '#1f2f56' },
        { name: 'Signal Blue', hex: '#3568eb' },
        { name: 'Warm Canvas', hex: '#fff6df' },
        { name: 'Hot Pink', hex: '#f76db8' },
        { name: 'Mint Signal', hex: '#1bb673' }
      ],
      typeDirection: 'Geometric sans-serif with character. Space Grotesk or similar — technical but not cold. Display weights for impact, lighter weights for body.',
      uiDensity: 'Generous whitespace with dense information clusters. Breathe between sections, pack within them.',
      motionStyle: 'Bouncy, elastic, physics-influenced. Elements should feel like they have weight and personality. Spring easing, not linear.',
      imageryDirection: 'Hand-drawn doodle illustrations over photographic content. Custom SVG icons with personality. Abstract shapes that feel intentional.',
      layoutPersonality: 'Asymmetric with structured chaos. Grid-based but with intentional breaks. Cards and modules that float with subtle motion.'
    },
    audienceSignal: {
      targetAudience: 'Indie developers, creative technologists, and design-forward founders who appreciate craft over convention.',
      trustProfile: 'Earns trust through quality of execution, not corporate signaling. The weird name filters for people who value originality.',
      pricePositioning: 'Free-to-use tools with a premium feel. Eventual monetization through pro features, not ads.'
    },
    siteRecommendation: {
      siteType: 'Experimental app directory / digital lab homepage',
      homepageSections: [
        'Hero with strong tagline and interactive element',
        'Brief manifesto explaining the lab concept',
        'Featured experiments grid with status indicators',
        'Activity log or transmission feed',
        'Philosophical manifesto section'
      ],
      ctaLanguage: ['View Experiments', 'Enter the Lab', 'Try Drift Lens', 'See What\'s Active']
    },
    voiceMessaging: {
      toneOfVoice: 'Sharp, dry, confident. Never explains itself too much. Treats the reader as smart. Slightly mysterious without being pretentious.',
      headlines: [
        'Weird ideas, clean apps.',
        'Software that shouldn\'t exist, but does.',
        'Strange tools for people who build things.'
      ],
      taglines: [
        'A lab for the unreasonable.',
        'One purpose. No compromise.',
        'Built because nothing else like it existed.'
      ],
      elevatorPitch: 'Yuxbi is a digital lab that turns strange ideas into clean, single-purpose apps. Each experiment does one thing well — the kind of tool that shouldn\'t exist but you\'re glad it does.'
    },
    identitySignals: {
      logoDirection: 'Abstract geometric mark — a shape that feels like a signal or lens. Not a literal object. Should work at 16px favicon size.',
      symbolConcept: 'A downward chevron with a dot below — like a signal being received, or a lens focusing on a point.',
      casingWordmark: 'All lowercase "yuxbi" — casual authority. The name is strange enough; don\'t add visual noise with mixed casing.',
      faviconIdea: 'The chevron-dot mark inside a rounded square. Monochrome with accent color fill.'
    },
    buildReadiness: {
      signalStrength: 'strong',
      recommendation: 'build now',
      nextActions: [
        'Lock the visual identity system and begin building real experiments',
        'Launch 2-3 flagship tools to establish what "Yuxbi experiments" means',
        'Create a mailing list for people who want to know when new experiments drop'
      ]
    }
  },

  'northforge.ai': {
    domain: 'northforge.ai',
    timestamp: new Date().toISOString(),
    signalId: 'SIG-0072',
    coreRead: {
      archetype: 'The Precision Builder',
      interpretation: 'A developer infrastructure brand that promises strength, reliability, and northern clarity.',
      confidence: 88,
      reasoning: '"North" signals direction, guidance, and a clear-headed approach. "Forge" implies creation through strength — something tempered and durable. The .ai TLD commits it to the AI/ML space. Together it reads as a serious tool-building company, not a consumer product.'
    },
    emotionalFeel: {
      traits: ['Sturdy', 'Technical', 'Clean', 'Ambitious', 'Methodical', 'Trustworthy', 'Cold-precise']
    },
    visualDirection: {
      colorPalette: [
        { name: 'Arctic Slate', hex: '#1a2332' },
        { name: 'Forge Blue', hex: '#2d6bcf' },
        { name: 'Steel', hex: '#94a3b8' },
        { name: 'Ember', hex: '#f59e0b' },
        { name: 'Snow', hex: '#f8fafc' }
      ],
      typeDirection: 'Clean, mechanical sans-serif. Inter or IBM Plex Sans — engineered precision. Monospace for code samples and metrics.',
      uiDensity: 'Medium-high density. Dashboard-ready layouts with clear data hierarchy. Compact but never cramped.',
      motionStyle: 'Minimal and purposeful. Smooth state transitions, no decorative animation. Everything should feel like it calculates before it moves.',
      imageryDirection: 'Abstract geometric patterns, node graphs, architectural diagrams. No stock photography. Technical illustrations with precision.',
      layoutPersonality: 'Grid-locked and structured. Left-aligned with strong vertical rhythm. Documentation-inspired clarity.'
    },
    audienceSignal: {
      targetAudience: 'ML engineers, DevOps leads, and technical founders building AI-powered products at scale.',
      trustProfile: 'Proven through documentation quality, uptime metrics, and open-source contributions. Enterprise trust pattern.',
      pricePositioning: 'Freemium with usage-based scaling. Signals mid-to-high pricing that serious teams expect and respect.'
    },
    siteRecommendation: {
      siteType: 'Developer platform / AI infrastructure product page',
      homepageSections: [
        'Hero with product value prop and live code demo',
        'Key metrics and performance benchmarks',
        'Feature comparison grid',
        'Integration logos and SDK support',
        'Documentation link and getting-started CTA'
      ],
      ctaLanguage: ['Start Building', 'Read the Docs', 'Deploy in Minutes', 'See Benchmarks']
    },
    voiceMessaging: {
      toneOfVoice: 'Direct, technical, respectful of the reader\'s intelligence. No marketing fluff. Let the product speak.',
      headlines: [
        'AI infrastructure, forged to last.',
        'Build models that ship. Not models that stall.',
        'From prototype to production in one push.'
      ],
      taglines: [
        'Forged for what comes next.',
        'Infrastructure with conviction.',
        'Where AI gets built.'
      ],
      elevatorPitch: 'NorthForge is AI infrastructure built for teams who need reliability at scale. Deploy, monitor, and iterate on ML models with tools forged for production — not prototyping.'
    },
    identitySignals: {
      logoDirection: 'Geometric anvil or compass mark combined with a subtle "N" form. Angular, not rounded. Strong at small sizes.',
      symbolConcept: 'A stylized anvil with a north star above it — creation guided by direction.',
      casingWordmark: 'CamelCase "NorthForge" — professional compound word. Reads clearly at any size.',
      faviconIdea: 'Simplified anvil silhouette or "NF" monogram in a tight square.'
    },
    buildReadiness: {
      signalStrength: 'strong',
      recommendation: 'build now',
      nextActions: [
        'Secure the domain and establish brand guidelines immediately',
        'Build a technical landing page with documentation-first approach',
        'Open-source a small utility to establish credibility in the AI tooling space'
      ]
    }
  },

  'emberstack.io': {
    domain: 'emberstack.io',
    timestamp: new Date().toISOString(),
    signalId: 'SIG-0073',
    coreRead: {
      archetype: 'The Warm Engineer',
      interpretation: 'A developer-friendly platform brand that balances technical depth with approachable energy.',
      confidence: 85,
      reasoning: '"Ember" brings warmth, energy, and a glowing persistence — something that stays lit. "Stack" is pure developer vocabulary, signaling a full-featured technical platform. The .io TLD reinforces the tech positioning. The combination avoids the coldness of most dev tools while maintaining credibility.'
    },
    emotionalFeel: {
      traits: ['Warm', 'Energetic', 'Approachable', 'Technical', 'Persistent', 'Community-driven']
    },
    visualDirection: {
      colorPalette: [
        { name: 'Charcoal', hex: '#1e1e2e' },
        { name: 'Ember Orange', hex: '#ef6c35' },
        { name: 'Flame', hex: '#fbbf24' },
        { name: 'Warm Gray', hex: '#a1a1aa' },
        { name: 'Cream', hex: '#fef3c7' }
      ],
      typeDirection: 'Rounded geometric sans-serif. Nunito Sans or DM Sans — friendly but professional. Comfortable reading at all sizes.',
      uiDensity: 'Balanced density. Generous padding around content blocks with tighter spacing in navigation and toolbars.',
      motionStyle: 'Warm and fluid. Gentle transitions that feel like embers shifting. Nothing jarring or mechanical.',
      imageryDirection: 'Warm-toned gradients, glowing particle effects, campfire-inspired abstract visuals. Custom illustrations with a friendly style.',
      layoutPersonality: 'Centered and welcoming. Card-based with clear groupings. Feels like a well-organized workshop, not a sterile dashboard.'
    },
    audienceSignal: {
      targetAudience: 'Full-stack developers, indie hackers, and small teams who want powerful tools that don\'t feel corporate.',
      trustProfile: 'Community trust through transparency, changelogs, and accessible documentation. Open-source-adjacent positioning.',
      pricePositioning: 'Affordable tiers with generous free plans. Positioned as the tool you choose over the expensive enterprise option.'
    },
    siteRecommendation: {
      siteType: 'Developer tool / full-stack platform product page',
      homepageSections: [
        'Hero with tagline and quick-start code snippet',
        'Feature cards with warm illustrations',
        'Community showcase and testimonials',
        'Pricing tiers with transparent comparison',
        'Changelog or "what\'s new" feed'
      ],
      ctaLanguage: ['Get Started Free', 'See the Stack', 'Join the Community', 'Read the Changelog']
    },
    voiceMessaging: {
      toneOfVoice: 'Friendly, direct, developer-native. Speaks like a sharp colleague, not a marketing department. Warm but never cheesy.',
      headlines: [
        'Your stack, fully lit.',
        'Ship faster without burning out.',
        'The full stack that actually feels full.'
      ],
      taglines: [
        'Keep the fire going.',
        'Built warm. Runs hot.',
        'Stack it. Ship it. Sleep well.'
      ],
      elevatorPitch: 'EmberStack is a full-stack platform that gives indie developers and small teams the power of enterprise tooling with the warmth of a community project. Ship faster without the overhead.'
    },
    identitySignals: {
      logoDirection: 'An abstract ember or flame integrated with a stack/layer motif. Warm colors, rounded edges.',
      symbolConcept: 'Three stacked layers with the top one glowing like an ember — technology that stays warm.',
      casingWordmark: 'CamelCase "EmberStack" — clear compound word with visual balance between the two halves.',
      faviconIdea: 'Simplified flame icon or glowing dot atop three horizontal lines.'
    },
    buildReadiness: {
      signalStrength: 'strong',
      recommendation: 'build now',
      nextActions: [
        'Define the core product offering and build a beta landing page',
        'Create a Discord or community channel to build early momentum',
        'Publish a "building in public" blog to establish the brand voice'
      ]
    }
  },

  'driftlens.co': {
    domain: 'driftlens.co',
    timestamp: new Date().toISOString(),
    signalId: 'SIG-0074',
    coreRead: {
      archetype: 'The Quiet Observer',
      interpretation: 'A contemplative design tool that watches, interprets, and reveals what others miss.',
      confidence: 91,
      reasoning: '"Drift" suggests movement without force — organic, unhurried observation. "Lens" is focus, clarity, seeing through. Together it describes a tool that patiently reads signals and surfaces meaning. The .co TLD keeps it modern and startup-friendly without the authority-weight of .com.'
    },
    emotionalFeel: {
      traits: ['Contemplative', 'Perceptive', 'Elegant', 'Subtle', 'Intelligent', 'Calm']
    },
    visualDirection: {
      colorPalette: [
        { name: 'Midnight', hex: '#0f172a' },
        { name: 'Drift Cyan', hex: '#22d3ee' },
        { name: 'Soft Lavender', hex: '#c4b5fd' },
        { name: 'Mist', hex: '#e2e8f0' },
        { name: 'Ghost White', hex: '#f8fafc' }
      ],
      typeDirection: 'Refined sans-serif with slight personality. Satoshi or General Sans — modern, not generic. Lighter weights for elegance.',
      uiDensity: 'Spacious and meditative. Generous margins. Content breathes. Each element earns its space.',
      motionStyle: 'Slow, purposeful drift. Elements ease into view over longer durations. No snapping. Everything flows.',
      imageryDirection: 'Abstract atmospheric gradients, lens flare effects, soft particle fields. Photography through frosted glass. Ethereal.',
      layoutPersonality: 'Centered, flowing, vertical. Scroll-driven with gentle transitions between sections. Feels like reading a poem, not scanning a dashboard.'
    },
    audienceSignal: {
      targetAudience: 'Designers, brand strategists, and creative directors who think deeply about meaning and perception.',
      trustProfile: 'Trust through aesthetic authority and demonstrated taste. The tool itself is the portfolio.',
      pricePositioning: 'Free tool with potential premium tier for deeper analysis. Positioned as a creative instrument, not a SaaS subscription.'
    },
    siteRecommendation: {
      siteType: 'Creative design tool / brand interpretation instrument',
      homepageSections: [
        'Minimal hero with the input field as the centerpiece',
        'Brief poetic explanation of what it does',
        'Live demo showing real interpretation output',
        'Visual showcase of interpretation quality',
        'Simple footer with attribution'
      ],
      ctaLanguage: ['Interpret a Domain', 'See the Signal', 'Read the Drift', 'Try It Now']
    },
    voiceMessaging: {
      toneOfVoice: 'Quiet, considered, poetic but not flowery. Speaks in observations, not commands. Makes the reader pause and think.',
      headlines: [
        'See what the name already knows.',
        'Every domain carries a signal.',
        'The brand exists before the site does.'
      ],
      taglines: [
        'Read the drift.',
        'Signals before pixels.',
        'The name already knows.'
      ],
      elevatorPitch: 'Drift Lens reads the hidden signal in a domain name — the brand archetype, visual direction, audience expectation, and emotional tone — before a single pixel is designed. It sees what the name already knows.'
    },
    identitySignals: {
      logoDirection: 'A minimal lens or aperture mark with a drift/flow element. Thin lines, high elegance. Monochrome base with cyan accent.',
      symbolConcept: 'A circular lens with a subtle wave or drift line passing through it — observation in motion.',
      casingWordmark: 'Title case "Drift Lens" with a space — two distinct words, each carrying meaning. Clean and balanced.',
      faviconIdea: 'A simplified lens circle with a drift line. Works at 16px with a single accent color.'
    },
    buildReadiness: {
      signalStrength: 'strong',
      recommendation: 'build now',
      nextActions: [
        'The tool already exists inside Yuxbi — expand it with real AI-powered interpretation',
        'Create shareable interpretation cards for social distribution',
        'Build an API so other tools can request domain readings programmatically'
      ]
    }
  }
};

// Fallback generator for unknown domains
function generateFallback(domain: string): DriftLensResult {
  const name = domain.split('.')[0];
  const tld = domain.split('.').slice(1).join('.');

  return {
    domain,
    timestamp: new Date().toISOString(),
    signalId: `SIG-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    coreRead: {
      archetype: 'The Emerging Signal',
      interpretation: `"${name}" is an uncharted signal — a name waiting to be defined by what gets built under it.`,
      confidence: 62,
      reasoning: `The domain "${name}" doesn't map to established patterns, which is either a creative advantage or a recognition challenge. The .${tld} extension ${tld === 'com' ? 'provides maximum credibility' : tld === 'io' ? 'signals a technical audience' : tld === 'ai' ? 'commits to the AI space' : tld === 'co' ? 'reads as modern and startup-friendly' : 'is unconventional, which may require extra brand-building effort'}. The name's unfamiliarity means the brand will be entirely shaped by execution.`
    },
    emotionalFeel: {
      traits: ['Undefined', 'Open', 'Curious', 'Potential-rich', 'Unproven']
    },
    visualDirection: {
      colorPalette: [
        { name: 'Foundation', hex: '#1e293b' },
        { name: 'Primary', hex: '#6366f1' },
        { name: 'Secondary', hex: '#a78bfa' },
        { name: 'Neutral', hex: '#94a3b8' },
        { name: 'Light', hex: '#f1f5f9' }
      ],
      typeDirection: 'Start with a versatile sans-serif that can adapt as the brand identity solidifies. Avoid committing to a strong stylistic direction too early.',
      uiDensity: 'Medium — balanced between content and breathing room until the product\'s information architecture is clear.',
      motionStyle: 'Subtle and professional. Don\'t over-animate an unproven brand. Let the product earn its motion language.',
      imageryDirection: 'Abstract and adaptable. Geometric patterns or gradients until the brand voice is strong enough to dictate specific imagery.',
      layoutPersonality: 'Clean and conventional to start. Build trust through clarity before experimenting with unconventional layouts.'
    },
    audienceSignal: {
      targetAudience: 'Audience not yet defined by the name alone. The domain is a blank canvas that will attract whoever the product serves.',
      trustProfile: 'Will need to establish trust through quality, consistency, and clear communication. The name doesn\'t carry inherent authority.',
      pricePositioning: 'Flexible — the name doesn\'t signal a specific price tier, leaving room to position anywhere on the spectrum.'
    },
    siteRecommendation: {
      siteType: 'Depends entirely on the product — start with a focused landing page',
      homepageSections: [
        'Clear hero explaining what this is in one sentence',
        'Visual or demo showing the product in action',
        'Three key benefits or features',
        'Social proof or early traction signals',
        'Single clear call-to-action'
      ],
      ctaLanguage: ['Get Started', 'Learn More', 'Try It Free', 'See How It Works']
    },
    voiceMessaging: {
      toneOfVoice: 'Clear and direct to compensate for the unfamiliar name. Be specific about what you do — don\'t add mystery to an already mysterious brand name.',
      headlines: [
        `${name.charAt(0).toUpperCase() + name.slice(1)}: built for what comes next.`,
        'Simple tools. No compromise.',
        'The thing you didn\'t know you needed.'
      ],
      taglines: [
        'Start here.',
        'Built different, on purpose.',
        'Something new is forming.'
      ],
      elevatorPitch: `${name.charAt(0).toUpperCase() + name.slice(1)} is a new project with a name that doesn\'t explain itself — which means the product has to. Focus on clarity of purpose and quality of execution to define what this name means.`
    },
    identitySignals: {
      logoDirection: 'Simple wordmark to start. Let the name become recognizable through repetition before adding a complex symbol.',
      symbolConcept: 'A minimal abstract mark that can evolve with the brand. Avoid over-designing the identity before the product is proven.',
      casingWordmark: `Lowercase "${name}" for approachability, or title case for formality. Test both before committing.`,
      faviconIdea: 'First letter of the name in a simple, bold treatment inside a rounded square.'
    },
    buildReadiness: {
      signalStrength: 'moderate',
      recommendation: 'build now',
      nextActions: [
        'Define the product clearly before investing in brand identity',
        'Build a minimal landing page to test the concept with real users',
        'Gather feedback on the name — does it help or hinder first impressions?'
      ]
    }
  };
}

/**
 * Interpret a domain name.
 * Returns a Promise so consuming code is ready for async AI endpoint swap.
 */
export async function interpretDomain(domain: string): Promise<DriftLensResult> {
  // Normalize input
  const clean = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');

  // Simulate network delay for realistic UX
  await new Promise(resolve => setTimeout(resolve, 2800 + Math.random() * 1200));

  return mockResults[clean] ?? generateFallback(clean);
}

export const SAMPLE_DOMAINS = ['yuxbi.com', 'northforge.ai', 'emberstack.io', 'driftlens.co'];
