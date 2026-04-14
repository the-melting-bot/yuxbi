export interface Transmission {
  id: string;
  sequence: string;
  timestamp: string;
  label: string;
  content: string;
  type: 'log' | 'signal' | 'note' | 'alert';
}

export const transmissions: Transmission[] = [
  {
    id: 'tx-001',
    sequence: 'TX-0041',
    timestamp: '2026.04.12 — 03:17 UTC',
    label: 'LAB NOTE',
    content: 'First batch of experiments cleared for external observation. Drift Lens returning coherent readings. Publishing interface soon.',
    type: 'log'
  },
  {
    id: 'tx-002',
    sequence: 'TX-0038',
    timestamp: '2026.04.08 — 21:44 UTC',
    label: 'SIGNAL INTERCEPT',
    content: 'Ghost Prompt calibration underway. Early tests suggest 40% reduction in prompt noise. Monitoring for side effects in output clarity.',
    type: 'signal'
  },
  {
    id: 'tx-003',
    sequence: 'TX-0035',
    timestamp: '2026.04.03 — 14:02 UTC',
    label: 'FIELD REPORT',
    content: 'Tone Field successfully mapped three brand voices in blind testing. The emotional frequency model is holding. Preparing for wider deployment.',
    type: 'note'
  },
  {
    id: 'tx-004',
    sequence: 'TX-0029',
    timestamp: '2026.03.27 — 08:33 UTC',
    label: 'ORIGIN MARKER',
    content: 'Yuxbi lab environment initialized. Core systems online. Strange ideas welcome. Clean execution mandatory.',
    type: 'alert'
  },
  {
    id: 'tx-005',
    sequence: 'TX-0022',
    timestamp: '2026.03.19 — 19:11 UTC',
    label: 'ARTIFACT LOG',
    content: 'Warp Table prototype reshaping CSV → JSON with zero configuration. Structural inference engine performing beyond initial parameters.',
    type: 'log'
  }
];
