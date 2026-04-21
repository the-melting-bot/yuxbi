/**
 * Vibe Decode — Mock Data
 * Atmospheric readings for seeded URLs. Used until a live endpoint is wired in.
 * Swap `decodeVibe()` internals to call a real AI/scrape service later.
 */

import type { VibeDecodeResult } from './types';

export const SAMPLE_URLS = [
  'stripe.com',
  'linear.app',
  'vercel.com',
  'framer.com',
  'yuxbi.com'
];

function signalId(seed: string): string {
  const chars = seed.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4).padEnd(4, 'X');
  const num = (seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 99).toString().padStart(2, '0');
  return `ECHO-${chars}-${num}`;
}

function now(): string {
  return new Date().toISOString();
}

const CATALOG: Record<string, VibeDecodeResult> = {
  'stripe.com': {
    url: 'https://stripe.com',
    prettyUrl: 'stripe.com',
    timestamp: now(),
    signalId: signalId('stripe'),

    atmosphereRead: {
      oneLiner: 'Engineered calm with a creative pulse underneath.',
      vibeClassification: 'Elevated Technical Editorial',
      confidence: 93,
      dominantFeeling:
        'Stripe reads as unshakably composed infrastructure that still wants to be seen as a design studio. The gradient work and typography suggest craft; the density and restraint suggest seriousness. You feel like you are being handled by adults who care about aesthetics.'
    },

    emotionalTone: {
      traits: ['precise', 'premium', 'technical', 'editorial', 'calm', 'confident', 'quietly expressive']
    },

    designLanguage: {
      layoutStyle: 'Asymmetric grid with generous vertical rhythm and dense information shelves.',
      typography: 'Custom sans with tight tracking. Large display weight carrying the personality; body text kept neutral and legible.',
      spacingDensity: 'High air on marketing pages, near-IDE density on docs — a deliberate two-speed system.',
      imageryStrategy: 'Abstract gradient surfaces, precise 3D product mockups, and schematic diagrams. Almost no stock photography.',
      interactionFeel: 'Micro-movements tuned to feel expensive. Nothing bouncy, everything eased.',
      motionPersonality: 'Cinematic scroll parallax on hero; quiet, professional transitions everywhere else.',
      uiPolish: 'Immaculate — every gradient stop, corner radius, and icon looks intentional.'
    },

    brandSignal: {
      companyArchetype: 'A serious infrastructure company that quietly believes it is the best-designed product in its space.',
      audience: 'Product engineers, CTOs, and finance teams at growth-stage and enterprise companies.',
      trustAuthority: 'Very high — the visual language alone signals that they handle real money for real businesses.',
      marketPosition: 'premium'
    },

    visualBreakdown: {
      colorPhilosophy: 'Cool purple-to-teal gradients against generous white. Accent color is never loud; it is carried through hue rather than saturation.',
      contrastBehavior: 'Low-to-mid contrast on marketing surfaces, high contrast on functional UI. Uses this shift as a tonal signal.',
      whitespaceUse: 'Treats whitespace as a product — never feels cramped, never feels wasteful.',
      surfaceStyle: 'Soft cards with subtle inner gradients, thin hairline borders, no heavy shadows.',
      iconStyle: 'Two-pixel rounded linework with occasional filled accent. Feels drawn by one hand.',
      hierarchyClarity: 'Every page has one clear first read, one clear second read, and the rest gets out of the way.',
      craftLevel: 'bespoke'
    },

    strategicInterpretation: {
      intendedFeeling: 'Stripe wants you to feel like you already trust them before you have read a word — and like you are smarter for choosing them.',
      doingWell: [
        'Turning infrastructure into aesthetics without losing seriousness',
        'Using gradient color as a brand signature no competitor can copy without feeling like a Stripe clone',
        'Letting docs and marketing speak in two different voices on purpose'
      ],
      overdoing: [
        'Gradient fatigue in some older marketing sections',
        'Occasional editorial flex that obscures what the product actually does'
      ],
      whyItWorks:
        'Because the restraint is real. Stripe chose to look calm in a market that defaults to aggressive, and that choice compounds every time a user lands on the site.'
    },

    borrowAvoid: {
      borrow: [
        'Two-speed spacing: airy on marketing, dense on functional UI',
        'A signature color treatment that your competitors cannot copy cleanly',
        'Custom product imagery instead of stock'
      ],
      avoid: [
        'Using gradient backgrounds without a reason — you are not Stripe',
        'Editorial headers that sound clever but dodge the value prop',
        'Copying the aesthetic without matching the operational discipline'
      ]
    },

    rebuildDirection: {
      type: 'Custom sans in display, neutral sans in body. Large size jump between them.',
      spacing: 'Generous vertical rhythm on marketing, tight rhythm in docs and dashboards.',
      surfaces: 'Soft light surfaces with restrained color gradients, hairline borders, minimal shadow.',
      motion: 'Eased, slow, cinematic — never bouncy, never elastic.',
      contentTone: 'Declarative, precise, occasionally quiet. No hype adjectives.',
      conversionStyle: 'Trust-led CTAs. Secondary actions get equal visual weight on purpose.'
    },

    scorecard: {
      clarity: 92,
      originality: 88,
      polish: 97,
      warmth: 62,
      authority: 96,
      distinctiveness: 91,
      trust: 95,
      memorability: 86
    }
  },

  'linear.app': {
    url: 'https://linear.app',
    prettyUrl: 'linear.app',
    timestamp: now(),
    signalId: signalId('linear'),

    atmosphereRead: {
      oneLiner: 'A quiet cathedral for people who hate meetings.',
      vibeClassification: 'Midnight Craft Tool',
      confidence: 95,
      dominantFeeling:
        'Linear feels like a product made by a small team that decided taste was a feature. The dark surfaces, sharp typography, and almost aggressive restraint create a sense of inwardness — this is software for people who want their tools to get out of the way and look serious while doing it.'
    },

    emotionalTone: {
      traits: ['severe', 'precise', 'nocturnal', 'quiet', 'focused', 'opinionated', 'cold-but-crafted']
    },

    designLanguage: {
      layoutStyle: 'Single-column marketing flow with very deliberate vertical pacing; dense grid on the product UI.',
      typography: 'Inter at very tight tracking. Heavy weight contrast. Numerals and keyboard shortcuts treated as first-class typographic elements.',
      spacingDensity: 'Tight. Everything is one unit closer than a typical marketing site would dare.',
      imageryStrategy: 'Product shots only. Zero illustration, zero stock. The product is the hero.',
      interactionFeel: 'Keyboard-first, cmd-palette energy, instant response.',
      motionPersonality: 'Sharp and short — 120ms eased cuts, not animations.',
      uiPolish: 'Surgical — pixel hinting, stroke alignment, and shadow physics all feel tuned by hand.'
    },

    brandSignal: {
      companyArchetype: 'A craft-obsessed product team building the tool they wish existed.',
      audience: 'Engineering leaders, product managers, and teams who use keyboard shortcuts on purpose.',
      trustAuthority: 'High among people who care about craft; invisible to people who do not.',
      marketPosition: 'premium'
    },

    visualBreakdown: {
      colorPhilosophy: 'Deep near-black with a violet undertone. One accent color at low saturation. Color is used like seasoning, not paint.',
      contrastBehavior: 'High contrast on active states, low contrast on ambient UI — trained your eye to follow focus.',
      whitespaceUse: 'Confidently tight. Uses rhythm rather than air to create hierarchy.',
      surfaceStyle: 'Flat dark surfaces with 1px borders and micro-shadows. No glassmorphism, no blur.',
      iconStyle: 'One-pixel line icons, perfectly aligned, feel almost schematic.',
      hierarchyClarity: 'Every section has one headline, one supporting line, one proof. Nothing extra.',
      craftLevel: 'bespoke'
    },

    strategicInterpretation: {
      intendedFeeling: 'Linear wants you to feel like you just found a secret tool that serious people already use.',
      doingWell: [
        'Making restraint a personality',
        'Treating keyboard shortcuts and command palettes as brand assets',
        'Letting the product do all the talking — no marketing fluff'
      ],
      overdoing: [
        'Sometimes so cold it reads as unwelcoming to new users',
        'Assumes craft literacy — casual visitors may miss why it is good'
      ],
      whyItWorks:
        'Because the restraint is earned. The product actually moves at the speed the design promises, so the aesthetic becomes a proof rather than a pose.'
    },

    borrowAvoid: {
      borrow: [
        'Extreme restraint on color — one accent, applied like seasoning',
        'Product screenshots as the only imagery',
        'Tight typography that rewards attention'
      ],
      avoid: [
        'Going dark-mode just because it looks cool — Linear earned it',
        'Copying the severity without the product speed to back it up',
        'Assuming your audience has the same craft literacy'
      ]
    },

    rebuildDirection: {
      type: 'Inter or similar neutral sans. Tight tracking. Strong weight contrast.',
      spacing: 'Tight but rhythmic. Trust the grid; do not pad to feel safe.',
      surfaces: 'Flat dark surfaces, 1px borders, subtle inner glow at most.',
      motion: 'Fast, eased cuts. Under 200ms. No bounce, no elasticity.',
      contentTone: 'Declarative, confident, specific. No adjectives that do not earn their place.',
      conversionStyle: 'One CTA per page. Feature list over selling points.'
    },

    scorecard: {
      clarity: 94,
      originality: 82,
      polish: 96,
      warmth: 38,
      authority: 90,
      distinctiveness: 88,
      trust: 89,
      memorability: 92
    }
  },

  'vercel.com': {
    url: 'https://vercel.com',
    prettyUrl: 'vercel.com',
    timestamp: now(),
    signalId: signalId('vercel'),

    atmosphereRead: {
      oneLiner: 'High-contrast developer theater with a platform underneath.',
      vibeClassification: 'Monochrome Infrastructure Showcase',
      confidence: 90,
      dominantFeeling:
        'Vercel reads as the platform that believes deployment is a spectacle. The black-and-white base, the geometric triangle mark, and the performative product demos create a feeling of a stage — it is not just infrastructure, it is infrastructure with a show.'
    },

    emotionalTone: {
      traits: ['sharp', 'technical', 'performant', 'cinematic', 'confident', 'performative', 'clean']
    },

    designLanguage: {
      layoutStyle: 'Full-bleed hero moments with strong centerline pacing and bold horizontal dividers.',
      typography: 'Geist sans family. Large display sizes, generous line height, confident hierarchy.',
      spacingDensity: 'Generous on marketing, dense in the dashboard — a dual-register system.',
      imageryStrategy: 'Live demos, animated diagrams, and abstract geometric graphics. Almost no humans, almost no stock.',
      interactionFeel: 'Instant feedback, keyboard-friendly, polished micro-interactions.',
      motionPersonality: 'Smooth but assertive — 200–300ms, clear easing, purposeful reveals.',
      uiPolish: 'Very high — everything aligned to a clear grid, consistent iconography, no visual debt.'
    },

    brandSignal: {
      companyArchetype: 'A platform company that believes developers deserve a brand as sharp as an editorial magazine.',
      audience: 'Frontend engineers, platform engineers, startups, and enterprise web teams.',
      trustAuthority: 'High — the monochrome confidence signals a platform that does not need to dress up.',
      marketPosition: 'premium'
    },

    visualBreakdown: {
      colorPhilosophy: 'Pure black and white base with selective, high-saturation accents used sparingly as signal.',
      contrastBehavior: 'Extreme contrast on hero; lower contrast in product UI so attention follows meaning.',
      whitespaceUse: 'Uses whitespace as punctuation between loud moments.',
      surfaceStyle: 'Flat surfaces with crisp borders. Occasional subtle gradient, used like a spotlight.',
      iconStyle: 'Geometric, monoline, confident — all clearly siblings of the triangle mark.',
      hierarchyClarity: 'Each section has a clear dominant element — no competing focal points.',
      craftLevel: 'custom-crafted'
    },

    strategicInterpretation: {
      intendedFeeling: 'Vercel wants you to feel like shipping is an event and they are the stage it happens on.',
      doingWell: [
        'Using monochrome as a statement rather than a lack of identity',
        'Putting live product behavior on the marketing surface',
        'Turning infrastructure into something with a point of view'
      ],
      overdoing: [
        'Occasionally so performative the humans disappear from the story',
        'Monochrome maximalism can feel cold on deeper pages'
      ],
      whyItWorks:
        'Because the contrast matches the promise — a platform that makes deployment visible, fast, and dramatic should look like this.'
    },

    borrowAvoid: {
      borrow: [
        'Monochrome base with a single high-saturation accent',
        'Live product moments on marketing pages, not just screenshots',
        'A geometric mark that can live in UI, favicon, and merch equally well'
      ],
      avoid: [
        'Going monochrome because it is trendy — without a point of view it reads generic',
        'Overusing black — warmth matters, especially on longer reading pages',
        'Theatrical hero sections that do not connect to the actual product story'
      ]
    },

    rebuildDirection: {
      type: 'Geist or similar geometric sans. Strong display, neutral body.',
      spacing: 'Generous on marketing, tighter in app UI. Clear horizontal rhythm.',
      surfaces: 'Mostly flat black/white with hairline dividers. Gradient only as spotlight.',
      motion: 'Purposeful reveals, 200–300ms. Smooth easing, not bouncy.',
      contentTone: 'Confident, technical, occasionally theatrical. Headlines do real work.',
      conversionStyle: 'One primary CTA per viewport. Developer-facing, not marketing-speak.'
    },

    scorecard: {
      clarity: 89,
      originality: 84,
      polish: 93,
      warmth: 45,
      authority: 91,
      distinctiveness: 83,
      trust: 88,
      memorability: 87
    }
  },

  'framer.com': {
    url: 'https://framer.com',
    prettyUrl: 'framer.com',
    timestamp: now(),
    signalId: signalId('framer'),

    atmosphereRead: {
      oneLiner: 'A design tool that dresses like a fashion house.',
      vibeClassification: 'Editorial Motion Showcase',
      confidence: 91,
      dominantFeeling:
        'Framer reads like a site built to prove the product can build sites like this. Every scroll is a pitch, every transition is a receipt. It is confident, expressive, and occasionally showing off — which is exactly the energy a creative tool needs.'
    },

    emotionalTone: {
      traits: ['expressive', 'editorial', 'cinematic', 'confident', 'stylish', 'motion-forward', 'creative']
    },

    designLanguage: {
      layoutStyle: 'Magazine-style with full-bleed sections, asymmetric compositions, and layered motion.',
      typography: 'Large display serif pairings with a neutral sans for body. Willing to go very big.',
      spacingDensity: 'Generous. Every element gets room to breathe and perform.',
      imageryStrategy: 'High-production imagery, video loops, and live component demos. Real humans appear.',
      interactionFeel: 'Expressive — hover states, scroll-linked motion, and 3D moments everywhere.',
      motionPersonality: 'Cinematic and performative — this is where the product speaks loudest.',
      uiPolish: 'Very high — but showing the seams is part of the charm.'
    },

    brandSignal: {
      companyArchetype: 'A design tool that wants to be the place where creative work lives, not just gets made.',
      audience: 'Designers, creative directors, brand studios, and agencies.',
      trustAuthority: 'High with design-literate audiences; may feel intimidating to casual users.',
      marketPosition: 'premium'
    },

    visualBreakdown: {
      colorPhilosophy: 'Confident neutrals punctuated by saturated editorial color moments. Not afraid of bold.',
      contrastBehavior: 'High contrast for editorial headers, softer contrast in working UI.',
      whitespaceUse: 'Treats whitespace like a stage — every element gets its moment.',
      surfaceStyle: 'Layered surfaces with real depth; uses blur, shadow, and gradient as composition tools.',
      iconStyle: 'Bespoke, occasionally illustrated, always stylistically consistent.',
      hierarchyClarity: 'Each section is a mini landing page — bold headline, clear supporting visual.',
      craftLevel: 'bespoke'
    },

    strategicInterpretation: {
      intendedFeeling: 'Framer wants designers to feel like the tool will make their work look better than it already does.',
      doingWell: [
        'Using motion to demonstrate the product instead of describing it',
        'Editorial typography that treats the marketing site like a magazine',
        'High-production imagery that signals taste'
      ],
      overdoing: [
        'Occasional motion overload — can overwhelm on lower-end devices',
        'Editorial ambition can obscure the practical entry point for new users'
      ],
      whyItWorks:
        'Because the site is the best possible demo of what the product can do — every scroll is proof of concept.'
    },

    borrowAvoid: {
      borrow: [
        'Motion as marketing copy — let the site show the product',
        'Editorial headline treatment on home',
        'Layered depth used with intention'
      ],
      avoid: [
        'Motion maximalism without a narrative reason',
        'Editorial flex that hides the value proposition',
        'High-production imagery without brand coherence'
      ]
    },

    rebuildDirection: {
      type: 'Display serif or high-contrast sans for headlines, neutral sans for body.',
      spacing: 'Generous — every element earns a stage.',
      surfaces: 'Layered depth, confident shadows, selective blur.',
      motion: 'Scroll-linked, cinematic, 400–700ms reveals with real choreography.',
      contentTone: 'Expressive, confident, creative-industry-literate.',
      conversionStyle: 'Show the work first, ask second. CTAs as quiet invitations.'
    },

    scorecard: {
      clarity: 82,
      originality: 91,
      polish: 94,
      warmth: 74,
      authority: 86,
      distinctiveness: 92,
      trust: 84,
      memorability: 94
    }
  },

  'yuxbi.com': {
    url: 'https://yuxbi.com',
    prettyUrl: 'yuxbi.com',
    timestamp: now(),
    signalId: signalId('yuxbi'),

    atmosphereRead: {
      oneLiner: 'A bright cartoon lab for apps that should not exist but do.',
      vibeClassification: 'Playful Lab Editorial',
      confidence: 88,
      dominantFeeling:
        'Yuxbi reads as a strange workshop where serious craft hides inside cheerful packaging. The warm cream background, flat cartoon-offset shadows, and doodle icons feel hand-drawn, but the grid, typography, and rhythm underneath are disciplined. It feels alive, a little weird, and carefully made.'
    },

    emotionalTone: {
      traits: ['playful', 'curious', 'crafted', 'warm', 'slightly strange', 'confident', 'lab-like']
    },

    designLanguage: {
      layoutStyle: 'Editorial-lab layout — sections behave like chapters, each with its own centerpiece.',
      typography: 'Space Grotesk display paired with General Sans body. Large, confident headlines, friendly body.',
      spacingDensity: 'Generous but rhythmic — the warm background needs room to breathe.',
      imageryStrategy: 'Custom cartoon doodles and SVG glyphs. Zero stock, zero photography.',
      interactionFeel: 'Bouncy and elastic — cards tilt, chips scale, buttons breathe.',
      motionPersonality: 'Elastic cubic-bezier on hover, calm on scroll. Motion is joy, not theater.',
      uiPolish: 'High — every card, chip, and shadow is tuned to the flat-offset system.'
    },

    brandSignal: {
      companyArchetype: 'A lab run by a small team that thinks of software as craft, play, and mischief.',
      audience: 'Designers, indie builders, curious creatives, and people who like the internet to be strange.',
      trustAuthority: 'Moderate — trust here is earned through taste, not through logos.',
      marketPosition: 'niche'
    },

    visualBreakdown: {
      colorPhilosophy: 'Warm cream base, bubble blue accent, hot pink secondary. Color as warmth, not as attention.',
      contrastBehavior: 'Mid contrast throughout — hierarchy comes from size and weight, not color punch.',
      whitespaceUse: 'Used like paper margins — the background itself is part of the composition.',
      surfaceStyle: 'White cards with 2px navy borders and flat offset shadows. Cartoon-sticker physics.',
      iconStyle: 'Custom doodle SVGs, hand-drawn quality with disciplined geometry underneath.',
      hierarchyClarity: 'Each section has a clear anchor element (icon, number, or label) that grounds the read.',
      craftLevel: 'bespoke'
    },

    strategicInterpretation: {
      intendedFeeling: 'Yuxbi wants you to feel like the internet can still be strange, small, and carefully made.',
      doingWell: [
        'Turning a playful aesthetic into a coherent design system',
        'Using custom doodles to avoid looking AI-generated',
        'Holding a rare middle ground between serious craft and real playfulness'
      ],
      overdoing: [
        'Cartoon aesthetic risks being read as unserious by business audiences',
        'Easter-egg mode may confuse first-time visitors'
      ],
      whyItWorks:
        'Because the whimsy is disciplined. The shadows, spacing, and typography are strict — the strangeness is intentional, not accidental.'
    },

    borrowAvoid: {
      borrow: [
        'Flat offset shadows that feel like paper stickers',
        'Custom doodle icons instead of generic icon libraries',
        'A warm background color that makes the whole site feel alive'
      ],
      avoid: [
        'Using cartoon aesthetics without a disciplined grid underneath',
        'Doodle icons that do not share visual grammar',
        'Easter-egg modes without real delight behind them'
      ]
    },

    rebuildDirection: {
      type: 'Space Grotesk or similar geometric display + a humanist body sans.',
      spacing: 'Generous, rhythmic. Let the background breathe.',
      surfaces: 'White cards, 2px solid borders, flat offset shadows.',
      motion: 'Elastic cubic-bezier on interaction, calm on ambient animations.',
      contentTone: 'Curious, specific, slightly strange. Never corporate, never cheesy.',
      conversionStyle: 'Soft invitations, not hard CTAs. Let the work be the pitch.'
    },

    scorecard: {
      clarity: 86,
      originality: 93,
      polish: 88,
      warmth: 92,
      authority: 74,
      distinctiveness: 94,
      trust: 80,
      memorability: 96
    }
  }
};

/**
 * Fallback generator — builds a believable, branded reading for any URL
 * not in the seeded catalog. Deterministic from the URL hash so the same
 * URL always returns the same vibe.
 */
function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length];
}

function generateFallback(pretty: string, fullUrl: string): VibeDecodeResult {
  const seed = hashString(pretty);

  const classifications = [
    'Quiet Technical Editorial',
    'Warm Editorial Showcase',
    'Minimal Product Study',
    'Bright Consumer Surface',
    'Atmospheric Brand Space',
    'Utility-Forward Toolkit',
    'Studio-Style Portfolio'
  ];

  const oneLiners = [
    'A site that values composure over volume.',
    'Quiet craft asking to be noticed slowly.',
    'Efficient, restrained, and slightly stylish.',
    'A surface built for readers, not scanners.',
    'Bright, open, and confident in its posture.',
    'A toolkit that wants to be useful more than seen.',
    'Studio-grade design with a working brain underneath.'
  ];

  const traitPools = [
    ['calm', 'precise', 'editorial', 'technical', 'confident', 'warm', 'quiet'],
    ['energetic', 'bright', 'playful', 'friendly', 'bold', 'expressive', 'youthful'],
    ['severe', 'premium', 'cinematic', 'restrained', 'cold', 'authoritative', 'tight'],
    ['crafted', 'thoughtful', 'curious', 'strange', 'specific', 'generous', 'alive']
  ];

  const traits = traitPools[seed % traitPools.length];

  const marketPositions: Array<VibeDecodeResult['brandSignal']['marketPosition']> = [
    'mass', 'mid', 'premium', 'luxury', 'niche'
  ];

  const craftLevels: Array<VibeDecodeResult['visualBreakdown']['craftLevel']> = [
    'template-feel', 'semi-custom', 'custom-crafted', 'bespoke'
  ];

  return {
    url: fullUrl,
    prettyUrl: pretty,
    timestamp: now(),
    signalId: signalId(pretty),

    atmosphereRead: {
      oneLiner: pick(oneLiners, seed),
      vibeClassification: pick(classifications, seed, 1),
      confidence: 72 + (seed % 18),
      dominantFeeling: `${pretty} reads as a site with a clear posture — ${pick(traits, seed).toLowerCase()}, ${pick(traits, seed, 2).toLowerCase()}, and built with more care than most of its peers. The design language is coherent enough to suggest intentional decisions rather than template defaults, though the full personality reveals itself slowly rather than in a single scroll.`
    },

    emotionalTone: {
      traits: traits.slice(0, 6)
    },

    designLanguage: {
      layoutStyle: 'Clear hero, predictable section rhythm, competent grid alignment.',
      typography: 'Sans-serif pairing with a reasonable size ramp. Headlines work, body reads.',
      spacingDensity: 'Moderate — neither minimalist nor cramped.',
      imageryStrategy: 'A mix of custom and stock visuals, not always unified stylistically.',
      interactionFeel: 'Competent hovers, standard transitions, no signature moves.',
      motionPersonality: 'Functional — used for feedback rather than expression.',
      uiPolish: 'Good — nothing broken, a few rough seams on closer inspection.'
    },

    brandSignal: {
      companyArchetype: `${pretty} feels like a company or creator with a clear identity and a reasonable team behind it.`,
      audience: 'A specific audience the site is designed to attract — not a mass market, not a niche of one.',
      trustAuthority: 'Moderate to high — the site does not trigger red flags and signals that someone is paying attention.',
      marketPosition: pick(marketPositions, seed, 3)
    },

    visualBreakdown: {
      colorPhilosophy: 'A coherent palette with a primary accent and restrained use of secondary color.',
      contrastBehavior: 'Legible throughout; hero moments carry more punch.',
      whitespaceUse: 'Used reasonably — not wasted, not denied.',
      surfaceStyle: 'Cards and panels behave consistently across the page.',
      iconStyle: 'A consistent icon family, occasionally mixed with library glyphs.',
      hierarchyClarity: 'Each section has a clear primary read; secondary elements behave.',
      craftLevel: pick(craftLevels, seed, 2)
    },

    strategicInterpretation: {
      intendedFeeling: `${pretty} wants visitors to feel oriented, capable, and a step closer to acting than they did before landing.`,
      doingWell: [
        'Keeping a consistent voice across sections',
        'Using a small enough palette that the site reads as one thing',
        'Letting the primary CTA be obvious without shouting'
      ],
      overdoing: [
        'Occasional section that could be cut without losing meaning',
        'A few stock-feeling visuals among the custom ones'
      ],
      whyItWorks: `${pretty} earns credibility through consistency rather than spectacle. The design is not the loudest in the room, which is often the smartest posture to take.`
    },

    borrowAvoid: {
      borrow: [
        'A consistent voice across pages',
        'A small, intentional color palette',
        'Clear hierarchy per section — one dominant read'
      ],
      avoid: [
        'Mixing stock imagery with custom work without a unifying treatment',
        'Adding sections for completeness rather than purpose',
        'Borrowing visual tropes from unrelated brands without editing them'
      ]
    },

    rebuildDirection: {
      type: 'A distinctive display face paired with a readable neutral body sans.',
      spacing: 'Generous on marketing, tighter on utility pages.',
      surfaces: 'Consistent card system with one signature shadow or border treatment.',
      motion: 'Functional by default, expressive only where it earns attention.',
      contentTone: 'Specific, confident, and edited ruthlessly for length.',
      conversionStyle: 'One obvious primary action per viewport; secondary actions support, not compete.'
    },

    scorecard: {
      clarity: 78 + (seed % 12),
      originality: 68 + (seed % 20),
      polish: 75 + (seed % 18),
      warmth: 60 + (seed % 28),
      authority: 72 + (seed % 18),
      distinctiveness: 66 + (seed % 22),
      trust: 74 + (seed % 16),
      memorability: 70 + (seed % 20)
    }
  };
}

/**
 * Main API — drop-in replacement target for a future live endpoint.
 * Accepts any URL string (with or without protocol/www) and returns a reading.
 */
export async function decodeVibe(rawUrl: string): Promise<VibeDecodeResult> {
  const pretty = rawUrl
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .split('/')[0];

  const fullUrl = rawUrl.trim().match(/^https?:\/\//) ? rawUrl.trim() : `https://${pretty}`;

  // Simulated processing time — matches the rotating loading phrases
  await new Promise((resolve) => setTimeout(resolve, 2800));

  if (CATALOG[pretty]) {
    return { ...CATALOG[pretty], timestamp: now() };
  }

  return generateFallback(pretty, fullUrl);
}
