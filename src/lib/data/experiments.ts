export interface Experiment {
  id: string;
  name: string;
  codename: string;
  description: string;
  status: 'active' | 'pending' | 'classified';
  category: string;
  icon: 'lens' | 'radar' | 'ghost' | 'table' | 'orbit' | 'tone';
  href?: string;
}

export const experiments: Experiment[] = [
  {
    id: 'exp-001',
    name: 'Drift Lens',
    codename: 'SIGNAL-07',
    description: 'Feed it a domain name. It tells you what the site should feel like before it exists.',
    status: 'active',
    category: 'interpretation',
    icon: 'lens',
    href: '/experiments/drift-lens'
  },
  {
    id: 'exp-002',
    name: 'Vibe Decode',
    codename: 'ECHO-14',
    description: 'Paste any URL. Receive a full atmospheric reading of its design language.',
    status: 'active',
    category: 'analysis',
    icon: 'radar'
  },
  {
    id: 'exp-003',
    name: 'Ghost Prompt',
    codename: 'STATIC-03',
    description: 'A prompt scrubber that strips filler, sharpens intent, and returns the version you meant to write.',
    status: 'pending',
    category: 'language',
    icon: 'ghost'
  },
  {
    id: 'exp-004',
    name: 'Warp Table',
    codename: 'FLUX-22',
    description: 'Drag data in one shape. It comes out another. No instructions needed.',
    status: 'active',
    category: 'transformation',
    icon: 'table'
  },
  {
    id: 'exp-005',
    name: 'Orbit Draft',
    codename: 'NOVA-11',
    description: 'Generates launch concepts from a single strange input. Name, tagline, landing structure — instant.',
    status: 'classified',
    category: 'generation',
    icon: 'orbit'
  },
  {
    id: 'exp-006',
    name: 'Tone Field',
    codename: 'PULSE-09',
    description: 'Measures the emotional frequency of your brand copy. Returns a tone map, not a score.',
    status: 'pending',
    category: 'measurement',
    icon: 'tone'
  }
];
