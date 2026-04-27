<script lang="ts">
  import Nav from '$lib/components/Nav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import GhostField from '$lib/components/ghost-prompt/GhostField.svelte';
  import AlienGhost from '$lib/components/ghost-prompt/AlienGhost.svelte';
  import { scrubPrompt } from '$lib/data/ghost-prompt/engine';
  import {
    LOADING_PHRASES,
    PRESETS,
    SAMPLE_PROMPTS,
    TARGET_MODES,
    VARIANTS
  } from '$lib/data/ghost-prompt/types';
  import type {
    PresetAction,
    PromptVariant,
    ScoreDimension,
    ScrubResult,
    TargetMode,
    VariantKey
  } from '$lib/data/ghost-prompt/types';

  // --- State ---
  let rawInput = $state('');
  let mode: TargetMode = $state('general');
  let activePresets = $state<PresetAction[]>([]);

  let isProcessing = $state(false);
  let result: ScrubResult | null = $state<ScrubResult | null>(null);
  let loadingPhrase = $state(LOADING_PHRASES[0]);
  let phraseInterval: ReturnType<typeof setInterval> | null = null;

  let openVariant: VariantKey | null = $state<VariantKey | null>(null);
  let copiedKey = $state<string | null>(null);
  let copiedTimer: ReturnType<typeof setTimeout> | null = null;

  let loadedSampleId: string | null = $state<string | null>(null);

  // --- Loading phrase rotator ---
  function startPhrases() {
    let i = 0;
    loadingPhrase = LOADING_PHRASES[0];
    phraseInterval = setInterval(() => {
      i = (i + 1) % LOADING_PHRASES.length;
      loadingPhrase = LOADING_PHRASES[i];
    }, 480);
  }
  function stopPhrases() {
    if (phraseInterval) clearInterval(phraseInterval);
    phraseInterval = null;
  }

  // --- Actions ---
  async function scrubIt() {
    if (!rawInput.trim()) return;
    isProcessing = true;
    result = null;
    startPhrases();
    // let the dense ghost field paint
    await new Promise((r) => setTimeout(r, 900));
    try {
      result = scrubPrompt(rawInput, { mode, presets: activePresets });
    } finally {
      isProcessing = false;
      stopPhrases();
    }
  }

  function loadSample(id: string) {
    const s = SAMPLE_PROMPTS.find((p) => p.id === id);
    if (!s) return;
    rawInput = s.text;
    loadedSampleId = id;
    result = null;
  }

  function reset() {
    rawInput = '';
    result = null;
    activePresets = [];
    loadedSampleId = null;
    mode = 'general';
    openVariant = null;
  }

  function togglePreset(p: PresetAction) {
    if (activePresets.includes(p)) {
      activePresets = activePresets.filter((x) => x !== p);
    } else {
      activePresets = [...activePresets, p];
    }
    // re-run if we already have a result
    if (result) {
      result = scrubPrompt(rawInput, { mode, presets: activePresets });
    }
  }

  function setMode(m: TargetMode) {
    mode = m;
    if (result) {
      result = scrubPrompt(rawInput, { mode, presets: activePresets });
    }
  }

  function selectVariant(k: VariantKey) {
    openVariant = openVariant === k ? null : k;
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedKey = key;
      if (copiedTimer) clearTimeout(copiedTimer);
      copiedTimer = setTimeout(() => (copiedKey = null), 1500);
    } catch {
      // ignore
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && rawInput.trim()) {
      e.preventDefault();
      scrubIt();
    }
  }

  // --- Helpers ---
  function bandClass(band: string): string {
    const slug = band.toLowerCase().replace(/\s+/g, '-');
    return `band-${slug}`;
  }

  function dimColor(d: ScoreDimension): string {
    if (d.value >= 75) return 'good';
    if (d.value >= 55) return 'mid';
    return 'low';
  }

  function variantById(k: VariantKey): PromptVariant | undefined {
    return result?.variants.find((v) => v.key === k);
  }

  function modeGlyph(g: string): string {
    // simple inline glyphs (single char fallback for the chip glyph)
    switch (g) {
      case 'star': return '✶';
      case 'bracket': return '⟨⟩';
      case 'frame': return '▢';
      case 'lens': return '◎';
      case 'wave': return '∿';
      case 'eye': return '◉';
      default: return '·';
    }
  }
</script>

<svelte:head>
  <title>Ghost Prompt — Yuxbi</title>
  <meta
    name="description"
    content="Drop a messy prompt. Watch the static lift. Ghost Prompt scrubs filler, sharpens intent, and returns the version you meant to write."
  />
  <meta property="og:title" content="Ghost Prompt — Yuxbi" />
  <meta
    property="og:description"
    content="A prompt scrubber that strips filler, sharpens intent, and returns the version you meant to write."
  />
  <meta name="theme-color" content="#fff6df" />
</svelte:head>

<Nav />

<main class="ghost-prompt">
  <div class="app-header">
    <div class="container">
      <a href="/" class="back-link">
        <span class="back-arrow">←</span>
        <span>Back to Lab</span>
      </a>
      <div class="app-meta">
        <span class="app-codename">STATIC-03</span>
        <span class="app-status">
          <span class="status-dot"></span>
          Active
        </span>
      </div>
    </div>
  </div>

  <!-- HERO -->
  <section class="hero-section">
    <div class="hero-field" aria-hidden="true">
      <GhostField density="ambient" family="violet" />
    </div>

    <div class="container hero-inner">
      <div class="doodle-icon" aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="none">
          <!-- Alien ghost mark -->
          <defs>
            <radialGradient id="gp-doodle-grad" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stop-color="#b9c9ff" stop-opacity="0.95" />
              <stop offset="60%" stop-color="#8d57eb" stop-opacity="0.55" />
              <stop offset="100%" stop-color="#3568eb" stop-opacity="0.0" />
            </radialGradient>
          </defs>
          <path
            d="M22 18 C22 8 58 8 58 18 L58 50 C58 56 53 56 50 52 C48 50 46 50 44 52 C42 54 38 54 36 52 C34 50 32 50 30 52 C27 56 22 56 22 50 Z"
            fill="url(#gp-doodle-grad)"
            stroke="#1f2f56"
            stroke-width="2.4"
            stroke-linejoin="round"
          />
          <ellipse cx="34" cy="30" rx="2.2" ry="3.2" fill="#1f2f56" />
          <ellipse cx="46" cy="30" rx="2.2" ry="3.2" fill="#1f2f56" />
          <path
            d="M30 40 Q40 46 50 40"
            stroke="#f76db8"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
          />
          <circle cx="14" cy="14" r="2.2" fill="#3568eb" />
          <circle cx="68" cy="22" r="1.6" fill="#f76db8" />
          <circle cx="66" cy="62" r="1.8" fill="#8d57eb" />
        </svg>
      </div>

      <h1 class="app-title">Ghost Prompt</h1>
      <p class="app-subtitle">
        Drop a messy prompt. Watch the static lift. Ghost Prompt strips filler, finds the intent
        underneath, and hands back the version you meant to write.
      </p>
    </div>
  </section>

  {#if !result && !isProcessing}
    <!-- INPUT STATE -->
    <section class="input-section">
      <div class="container">
        <div class="input-card">
          <div class="card-head">
            <span class="section-tag">Raw signal</span>
            <span class="card-hint">⌘/Ctrl + Enter to scrub</span>
          </div>

          <textarea
            bind:value={rawInput}
            onkeydown={handleKeydown}
            placeholder={'Paste your half-formed thought here. Filler, hedging, ramble — it all comes out clean.'}
            rows="7"
            spellcheck="false"
            autocapitalize="off"
            autocomplete="off"
          ></textarea>

          <div class="mode-row">
            <span class="mode-label">Target mode</span>
            <div class="mode-chips" role="radiogroup" aria-label="Target mode">
              {#each TARGET_MODES as m}
                <button
                  type="button"
                  class="mode-chip"
                  class:active={mode === m.key}
                  role="radio"
                  aria-checked={mode === m.key}
                  onclick={() => setMode(m.key)}
                  title={m.blurb}
                >
                  <span class="mode-glyph" aria-hidden="true">{modeGlyph(m.glyph)}</span>
                  <span>{m.label}</span>
                </button>
              {/each}
            </div>
          </div>

          <div class="cta-row">
            <span class="char-count" aria-live="polite">
              {rawInput.trim().length} chars
            </span>
            <button
              type="button"
              class="primary-btn"
              onclick={scrubIt}
              disabled={!rawInput.trim()}
            >
              Scrub it
            </button>
          </div>
        </div>

        <div class="samples-row">
          <span class="samples-label">Or try a sample</span>
          {#each SAMPLE_PROMPTS as s}
            <button
              type="button"
              class="sample-chip"
              class:loaded={loadedSampleId === s.id}
              onclick={() => loadSample(s.id)}
            >
              {s.label}
            </button>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  {#if isProcessing}
    <!-- PROCESSING STATE -->
    <section class="processing-section">
      <div class="processing-field" aria-hidden="true">
        <GhostField density="dense" family="violet" processing={true} />
      </div>
      <div class="container processing-inner">
        <div class="processing-card">
          <div class="processing-orb" aria-hidden="true">
            <AlienGhost
              species="orb"
              x={50}
              y={50}
              size={120}
              hue="violet"
              drift={6}
              opacity={0.85}
              spin={true}
            />
          </div>
          <p class="loading-phrase">{loadingPhrase}</p>
          <p class="loading-sub">Combing the static for what you meant.</p>
        </div>
      </div>
    </section>
  {/if}

  {#if result && !isProcessing}
    <!-- RESULT STATE -->
    <section class="result-section-wrap">
      <div class="result-edge-field" aria-hidden="true">
        <GhostField density="edge" family="cyan" />
      </div>
      <div class="container">
        <div class="workspace-header">
          <div class="workspace-meta">
            <span class="result-signal-id">STATIC-03</span>
            <span class="result-band {bandClass(result.score.band)}">
              <span class="band-dot"></span>
              {result.score.band}
            </span>
          </div>
          <div class="workspace-actions">
            <button class="ghost-btn" type="button" onclick={reset}>
              <span class="btn-glyph">↺</span>
              Reset
            </button>
          </div>
        </div>

        <!-- Ghost Score -->
        <div class="result-section score-section">
          <div class="section-head">
            <span class="section-tag">Ghost score</span>
            <span class="section-sub">Higher = cleaner signal.</span>
          </div>
          <div class="score-body">
            <div class="score-overall">
              <div class="overall-num">{result.score.overall}</div>
              <div class="overall-band {bandClass(result.score.band)}">{result.score.band}</div>
              <div class="reduction-line">
                {result.removedCount} ghosts removed
                {#if result.addedCount > 0}
                  · {result.addedCount} signal added
                {/if}
              </div>
            </div>
            <div class="score-dims">
              {#each result.score.dimensions as d}
                <div class="score-dim">
                  <div class="dim-head">
                    <span class="dim-label">{d.label}</span>
                    <span class="dim-value dim-{dimColor(d)}">{d.value}</span>
                  </div>
                  <div class="dim-bar">
                    <div
                      class="dim-fill dim-{dimColor(d)}"
                      style="width: {d.value}%"
                    ></div>
                  </div>
                  <div class="dim-note">{d.note}</div>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Clean Prompt -->
        <div class="result-section clean-section">
          <div class="section-head">
            <span class="section-tag">Clean prompt</span>
            <button
              class="copy-btn"
              type="button"
              onclick={() => copy(result?.cleaned ?? '', 'cleaned')}
              aria-label="Copy clean prompt"
            >
              {copiedKey === 'cleaned' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div class="prompt-block primary-block">{result.cleaned}</div>
        </div>

        <!-- Two-column: Intent + Missing -->
        <div class="dual-grid">
          <div class="result-section intent-section">
            <div class="section-head">
              <span class="section-tag">Detected intent</span>
            </div>
            <p class="intent-text">{result.intent}</p>
          </div>

          <div class="result-section missing-section">
            <div class="section-head">
              <span class="section-tag">Missing context</span>
              <span class="section-sub">{result.missing.length} field{result.missing.length === 1 ? '' : 's'}</span>
            </div>
            {#if result.missing.length === 0}
              <p class="missing-empty">Nothing critical missing. Signal is intact.</p>
            {:else}
              <ul class="missing-list">
                {#each result.missing as m}
                  <li class="missing-item">
                    <span class="missing-key">{m.label}</span>
                    <span class="missing-q">{m.prompt}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </div>

        <!-- Diff -->
        <div class="result-section diff-section">
          <div class="section-head">
            <span class="section-tag">Diff · what got stripped</span>
            <div class="diff-legend">
              <span class="legend-item legend-removed">removed</span>
              <span class="legend-item legend-added">added</span>
              <span class="legend-item legend-kept">kept</span>
            </div>
          </div>
          <div class="diff-block">
            {#each result.diff as seg}
              {#if seg.kind === 'removed'}
                <span class="seg seg-removed">{seg.text}</span>
              {:else if seg.kind === 'added'}
                <span class="seg seg-added">{seg.text}</span>
              {:else}
                <span class="seg seg-kept">{seg.text}</span>
              {/if}
            {/each}
          </div>
        </div>

        <!-- Target rewrite -->
        <div class="result-section target-section">
          <div class="section-head">
            <span class="section-tag">For {TARGET_MODES.find((tm) => tm.key === result?.targetRewrite.mode)?.label ?? 'target'}</span>
            <button
              class="copy-btn"
              type="button"
              onclick={() => copy(result?.targetRewrite.text ?? '', 'target')}
              aria-label="Copy target rewrite"
            >
              {copiedKey === 'target' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div class="prompt-block">{result.targetRewrite.text}</div>
          <div class="mode-switcher" role="radiogroup" aria-label="Switch target mode">
            {#each TARGET_MODES as m}
              <button
                type="button"
                class="mode-chip mode-chip-sm"
                class:active={mode === m.key}
                role="radio"
                aria-checked={mode === m.key}
                onclick={() => setMode(m.key)}
              >
                <span class="mode-glyph" aria-hidden="true">{modeGlyph(m.glyph)}</span>
                <span>{m.label}</span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Variants -->
        <div class="result-section variants-section">
          <div class="section-head">
            <span class="section-tag">Variants</span>
            <span class="section-sub">5 readings of the same intent.</span>
          </div>
          <div class="variants-list">
            {#each VARIANTS as vmeta}
              {@const v = variantById(vmeta.key)}
              <div class="variant-row" class:open={openVariant === vmeta.key}>
                <button
                  type="button"
                  class="variant-head"
                  onclick={() => selectVariant(vmeta.key)}
                  aria-expanded={openVariant === vmeta.key}
                >
                  <span class="variant-label">{vmeta.label}</span>
                  <span class="variant-blurb">{vmeta.blurb}</span>
                  <span class="variant-toggle" aria-hidden="true">
                    {openVariant === vmeta.key ? '−' : '+'}
                  </span>
                </button>
                {#if openVariant === vmeta.key && v}
                  <div class="variant-body">
                    <div class="prompt-block prompt-block-sm">{v.text}</div>
                    <button
                      type="button"
                      class="copy-btn"
                      onclick={() => copy(v.text, `variant-${v.key}`)}
                      aria-label={`Copy ${v.label} variant`}
                    >
                      {copiedKey === `variant-${v.key}` ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <!-- Preset actions -->
        <div class="result-section presets-section">
          <div class="section-head">
            <span class="section-tag">Apply a preset</span>
            <span class="section-sub">Re-scrubs the cleaned prompt.</span>
          </div>
          <div class="presets-list">
            {#each PRESETS as p}
              <button
                type="button"
                class="preset-chip"
                class:active={activePresets.includes(p.key)}
                onclick={() => togglePreset(p.key)}
              >
                {p.label}
              </button>
            {/each}
          </div>
          {#if activePresets.length > 0}
            <div class="presets-applied">
              <span class="applied-label">Active</span>
              {#each activePresets as ap}
                <span class="applied-chip">
                  {PRESETS.find((p) => p.key === ap)?.label}
                </span>
              {/each}
              <button
                type="button"
                class="ghost-btn ghost-btn-sm"
                onclick={() => { activePresets = []; if (result) result = scrubPrompt(rawInput, { mode, presets: [] }); }}
              >
                Clear
              </button>
            </div>
          {/if}
        </div>

        <!-- Original (collapsible-ish for reference) -->
        <div class="result-section original-section">
          <div class="section-head">
            <span class="section-tag">Original</span>
            <span class="section-sub">For reference.</span>
          </div>
          <div class="prompt-block prompt-block-faint">{result.original}</div>
        </div>

        <div class="bottom-actions">
          <button class="ghost-btn" type="button" onclick={reset}>
            <span class="btn-glyph">↺</span>
            Try another prompt
          </button>
        </div>
      </div>
    </section>
  {/if}
</main>

<Footer />

<style>
  .ghost-prompt {
    min-height: 100vh;
    padding-top: var(--space-16);
    background: var(--color-bg);
    color: var(--color-text);
    position: relative;
    overflow-x: hidden;
  }

  .container {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 var(--space-6);
    position: relative;
    z-index: 2;
  }

  /* --- App header --- */
  .app-header {
    padding: var(--space-6) 0 var(--space-4);
    border-bottom: 2px solid rgba(31, 47, 86, 0.08);
    position: relative;
    z-index: 5;
  }
  .app-header .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
  }
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    text-decoration: none;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-full);
    border: 2px solid rgba(31, 47, 86, 0.12);
    background: var(--color-surface);
    box-shadow: 0 3px 0 rgba(31, 47, 86, 0.08);
    transition: all 0.2s var(--ease-elastic);
  }
  .back-link:hover {
    color: var(--color-accent);
    border-color: rgba(53, 104, 235, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 5px 0 rgba(31, 47, 86, 0.1);
  }
  .back-arrow { font-weight: 600; }
  .app-meta { display: flex; align-items: center; gap: var(--space-3); }
  .app-codename {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-accent);
    padding: var(--space-1) var(--space-3);
    border: 1px solid rgba(53, 104, 235, 0.2);
    border-radius: var(--radius-full);
    background: rgba(53, 104, 235, 0.06);
  }
  .app-status {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-signal-active);
  }
  .status-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--color-signal-active);
    box-shadow: 0 0 0 0 rgba(27, 182, 115, 0.6);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(27, 182, 115, 0.5); }
    70% { box-shadow: 0 0 0 10px rgba(27, 182, 115, 0); }
    100% { box-shadow: 0 0 0 0 rgba(27, 182, 115, 0); }
  }

  /* --- Hero --- */
  .hero-section {
    position: relative;
    padding: var(--space-12) 0 var(--space-8);
  }
  .hero-field {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }
  .hero-inner {
    text-align: center;
    max-width: 760px;
  }
  .doodle-icon {
    width: 92px;
    height: 92px;
    margin: 0 auto var(--space-5);
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-md);
    animation: float 5s ease-in-out infinite;
  }
  .doodle-icon svg { width: 64px; height: 64px; }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  .app-title {
    font-family: var(--font-display);
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-text-bright);
    margin: 0 0 var(--space-3);
    letter-spacing: -0.02em;
    line-height: 1.05;
  }
  .app-subtitle {
    font-size: var(--text-base);
    color: var(--color-text-muted);
    line-height: 1.6;
    max-width: 580px;
    margin: 0 auto;
  }

  /* --- Input --- */
  .input-section {
    padding: var(--space-4) 0 var(--space-16);
    position: relative;
    z-index: 2;
  }
  .input-card {
    background: var(--color-surface);
    border: 2px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-xl);
    padding: var(--space-6);
    box-shadow: var(--shadow-md);
    max-width: 880px;
    margin: 0 auto;
  }
  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: var(--space-3);
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .section-tag {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-accent);
    font-weight: 600;
  }
  .section-sub {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    letter-spacing: 0.04em;
  }
  .card-hint {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
  }

  textarea {
    width: 100%;
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.6;
    padding: var(--space-4);
    border: 2px solid rgba(31, 47, 86, 0.15);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    color: var(--color-text-bright);
    resize: vertical;
    min-height: 180px;
    transition: border-color 0.2s ease;
    box-shadow: 0 3px 0 rgba(31, 47, 86, 0.06);
  }
  textarea:focus {
    outline: none;
    border-color: rgba(53, 104, 235, 0.5);
  }

  .mode-row {
    margin-top: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .mode-label {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-faint);
  }
  .mode-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .mode-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    padding: var(--space-2) var(--space-4);
    border: 2px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    cursor: pointer;
    transition: all 0.2s var(--ease-elastic);
    box-shadow: 0 2px 0 rgba(31, 47, 86, 0.06);
  }
  .mode-chip:hover {
    border-color: rgba(53, 104, 235, 0.35);
    color: var(--color-accent);
    transform: translateY(-1px);
  }
  .mode-chip.active {
    background: var(--color-accent);
    color: #fff;
    border-color: var(--color-accent);
    box-shadow: 0 4px 0 rgba(31, 47, 86, 0.2);
  }
  .mode-glyph {
    font-family: var(--font-mono);
    font-size: 0.95em;
    opacity: 0.8;
  }
  .mode-chip-sm {
    font-size: var(--text-xs);
    padding: var(--space-1) var(--space-3);
  }

  .cta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-5);
    flex-wrap: wrap;
  }
  .char-count {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
  }
  .primary-btn {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 600;
    letter-spacing: 0.02em;
    color: #fff;
    background: var(--color-accent);
    border: 2px solid var(--color-accent);
    border-radius: var(--radius-full);
    padding: var(--space-3) var(--space-6);
    cursor: pointer;
    box-shadow: 0 4px 0 rgba(31, 47, 86, 0.2);
    transition: all 0.2s var(--ease-elastic);
  }
  .primary-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 rgba(31, 47, 86, 0.22);
  }
  .primary-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 0 rgba(31, 47, 86, 0.22);
  }
  .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .ghost-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    padding: var(--space-2) var(--space-4);
    border: 2px solid rgba(31, 47, 86, 0.15);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    cursor: pointer;
    box-shadow: 0 3px 0 rgba(31, 47, 86, 0.08);
    transition: all 0.2s var(--ease-elastic);
  }
  .ghost-btn:hover {
    border-color: rgba(53, 104, 235, 0.3);
    color: var(--color-accent);
    transform: translateY(-2px);
    box-shadow: 0 5px 0 rgba(31, 47, 86, 0.1);
  }
  .ghost-btn-sm {
    font-size: var(--text-xs);
    padding: var(--space-1) var(--space-3);
  }
  .btn-glyph { font-weight: 600; }

  .samples-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    flex-wrap: wrap;
    margin-top: var(--space-6);
  }
  .samples-label {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-faint);
  }
  .sample-chip {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    padding: var(--space-2) var(--space-4);
    border: 2px dashed rgba(31, 47, 86, 0.2);
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s var(--ease-elastic);
  }
  .sample-chip:hover {
    border-style: solid;
    border-color: rgba(141, 87, 235, 0.5);
    color: var(--color-signal-classified);
    transform: translateY(-2px);
  }
  .sample-chip.loaded {
    border-style: solid;
    border-color: rgba(141, 87, 235, 0.6);
    background: rgba(141, 87, 235, 0.06);
    color: var(--color-signal-classified);
  }

  /* --- Processing --- */
  .processing-section {
    position: relative;
    padding: var(--space-16) 0 var(--space-20);
    min-height: 60vh;
  }
  .processing-field {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
  }
  .processing-inner {
    position: relative; z-index: 2;
    display: flex; justify-content: center;
  }
  .processing-card {
    text-align: center;
    padding: var(--space-10) var(--space-8);
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(6px);
    border: 2px solid rgba(141, 87, 235, 0.18);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    max-width: 480px;
    width: 100%;
  }
  .processing-orb {
    position: relative;
    width: 140px;
    height: 140px;
    margin: 0 auto var(--space-5);
  }
  .loading-phrase {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text-bright);
    margin: 0 0 var(--space-2);
    letter-spacing: -0.01em;
  }
  .loading-sub {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: 0;
  }

  /* --- Result --- */
  .result-section-wrap {
    position: relative;
    padding: var(--space-8) 0 var(--space-16);
  }
  .result-edge-field {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
  }
  .workspace-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
    flex-wrap: wrap;
    margin-bottom: var(--space-6);
  }
  .workspace-meta {
    display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap;
  }
  .result-signal-id {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-accent);
    padding: var(--space-1) var(--space-3);
    border: 1px solid rgba(53, 104, 235, 0.2);
    border-radius: var(--radius-full);
    background: rgba(53, 104, 235, 0.06);
  }
  .result-band {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    border: 1px solid currentColor;
  }
  .band-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: currentColor;
  }
  .band-clear-signal { color: var(--color-signal-active); background: rgba(27,182,115,0.08); }
  .band-mild-static { color: var(--color-accent); background: rgba(53,104,235,0.08); }
  .band-static-cluster { color: var(--color-signal-pending); background: rgba(243,154,25,0.08); }
  .band-heavy-fog { color: var(--color-signal-classified); background: rgba(141,87,235,0.08); }
  .band-faint-signal { color: #c64f8f; background: rgba(247,109,184,0.08); }

  .result-section {
    background: var(--color-surface);
    border: 2px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-xl);
    padding: var(--space-6);
    margin-bottom: var(--space-5);
    box-shadow: var(--shadow-md);
    animation: fade-in 0.45s var(--ease-out) both;
    position: relative;
    z-index: 2;
  }
  .result-section:nth-child(2) { animation-delay: 0.05s; }
  .result-section:nth-child(3) { animation-delay: 0.1s; }
  .result-section:nth-child(4) { animation-delay: 0.15s; }
  .result-section:nth-child(5) { animation-delay: 0.2s; }
  .result-section:nth-child(6) { animation-delay: 0.25s; }
  .result-section:nth-child(7) { animation-delay: 0.3s; }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .section-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
    flex-wrap: wrap;
  }

  /* Score */
  .score-body {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: var(--space-6);
    align-items: start;
  }
  .score-overall {
    text-align: center;
    padding: var(--space-5);
    background: linear-gradient(180deg, rgba(141, 87, 235, 0.06), rgba(53, 104, 235, 0.04));
    border: 1px solid rgba(141, 87, 235, 0.15);
    border-radius: var(--radius-xl);
  }
  .overall-num {
    font-family: var(--font-display);
    font-size: 5rem;
    font-weight: 700;
    line-height: 1;
    color: var(--color-text-bright);
    letter-spacing: -0.04em;
  }
  .overall-band {
    display: inline-block;
    margin-top: var(--space-3);
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    border: 1px solid currentColor;
  }
  .reduction-line {
    margin-top: var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
  }
  .score-dims {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .score-dim {
    border-bottom: 1px solid rgba(31, 47, 86, 0.06);
    padding-bottom: var(--space-2);
  }
  .score-dim:last-child { border-bottom: 0; padding-bottom: 0; }
  .dim-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: var(--space-2);
  }
  .dim-label {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text);
    text-transform: capitalize;
  }
  .dim-value {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
  }
  .dim-good { color: var(--color-signal-active); }
  .dim-mid { color: var(--color-accent); }
  .dim-low { color: var(--color-signal-pending); }
  .dim-bar {
    height: 6px;
    background: rgba(31, 47, 86, 0.08);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .dim-fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.6s var(--ease-out);
  }
  .dim-fill.dim-good { background: var(--color-signal-active); }
  .dim-fill.dim-mid { background: var(--color-accent); }
  .dim-fill.dim-low { background: var(--color-signal-pending); }
  .dim-note {
    margin-top: var(--space-2);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    line-height: 1.5;
  }

  /* Prompt blocks */
  .prompt-block {
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.65;
    color: var(--color-text-bright);
    background: rgba(255, 246, 223, 0.6);
    border: 1px solid rgba(31, 47, 86, 0.1);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .primary-block {
    background: linear-gradient(180deg, rgba(53, 104, 235, 0.04), rgba(53, 104, 235, 0.02));
    border-color: rgba(53, 104, 235, 0.18);
    font-size: 15px;
  }
  .prompt-block-sm { font-size: 13px; padding: var(--space-3); }
  .prompt-block-faint {
    color: var(--color-text-muted);
    background: rgba(31, 47, 86, 0.03);
    border-color: rgba(31, 47, 86, 0.08);
  }

  .copy-btn {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-accent);
    background: rgba(53, 104, 235, 0.06);
    border: 1px solid rgba(53, 104, 235, 0.25);
    border-radius: var(--radius-full);
    padding: var(--space-1) var(--space-3);
    cursor: pointer;
    transition: all 0.2s var(--ease-elastic);
  }
  .copy-btn:hover {
    background: var(--color-accent);
    color: #fff;
    border-color: var(--color-accent);
  }

  /* Dual grid */
  .dual-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-5);
    margin-bottom: var(--space-5);
  }
  .dual-grid > .result-section { margin-bottom: 0; }

  .intent-text {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    line-height: 1.5;
    color: var(--color-text-bright);
    margin: 0;
    letter-spacing: -0.01em;
  }
  .missing-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .missing-item {
    padding: var(--space-3);
    background: rgba(247, 109, 184, 0.04);
    border: 1px solid rgba(247, 109, 184, 0.18);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .missing-key {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-secondary-dim);
  }
  .missing-q {
    font-size: var(--text-sm);
    color: var(--color-text);
    line-height: 1.5;
  }
  .missing-empty {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: 0;
    font-style: italic;
  }

  /* Diff */
  .diff-legend {
    display: flex;
    gap: var(--space-3);
    align-items: center;
  }
  .legend-item {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: var(--radius-full);
  }
  .legend-removed { background: rgba(247, 109, 184, 0.14); color: var(--color-secondary-dim); }
  .legend-added { background: rgba(27, 182, 115, 0.14); color: var(--color-signal-active); }
  .legend-kept { background: rgba(31, 47, 86, 0.06); color: var(--color-text-muted); }

  .diff-block {
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.85;
    color: var(--color-text-bright);
    background: rgba(255, 246, 223, 0.6);
    border: 1px solid rgba(31, 47, 86, 0.1);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    word-wrap: break-word;
  }
  .seg { transition: background 0.2s ease; }
  .seg-kept { color: var(--color-text); }
  .seg-removed {
    background: rgba(247, 109, 184, 0.18);
    color: var(--color-secondary-dim);
    text-decoration: line-through;
    text-decoration-color: rgba(198, 79, 143, 0.45);
    border-radius: 3px;
    padding: 0 2px;
  }
  .seg-added {
    background: rgba(27, 182, 115, 0.16);
    color: #0d8c5a;
    border-radius: 3px;
    padding: 0 2px;
    font-weight: 500;
  }

  /* Mode switcher under target rewrite */
  .mode-switcher {
    margin-top: var(--space-4);
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  /* Variants */
  .variants-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .variant-row {
    border: 1px solid rgba(31, 47, 86, 0.1);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: rgba(255, 246, 223, 0.4);
    transition: all 0.2s var(--ease-out);
  }
  .variant-row.open {
    border-color: rgba(53, 104, 235, 0.3);
    background: var(--color-surface);
    box-shadow: 0 4px 0 rgba(31, 47, 86, 0.06);
  }
  .variant-head {
    display: grid;
    grid-template-columns: 130px 1fr auto;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    text-align: left;
    padding: var(--space-3) var(--space-4);
    background: transparent;
    border: 0;
    cursor: pointer;
    font-family: inherit;
    color: inherit;
  }
  .variant-head:hover { background: rgba(53, 104, 235, 0.04); }
  .variant-label {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text-bright);
  }
  .variant-blurb {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
  .variant-toggle {
    font-family: var(--font-mono);
    font-size: 1.2em;
    color: var(--color-accent);
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .variant-body {
    padding: 0 var(--space-4) var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    align-items: flex-start;
  }
  .variant-body .copy-btn { align-self: flex-end; }

  /* Presets */
  .presets-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .preset-chip {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    padding: var(--space-2) var(--space-4);
    border: 2px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    cursor: pointer;
    transition: all 0.2s var(--ease-elastic);
  }
  .preset-chip:hover {
    border-color: rgba(141, 87, 235, 0.4);
    color: var(--color-signal-classified);
    transform: translateY(-1px);
  }
  .preset-chip.active {
    background: var(--color-signal-classified);
    color: #fff;
    border-color: var(--color-signal-classified);
    box-shadow: 0 3px 0 rgba(31, 47, 86, 0.18);
  }
  .presets-applied {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-4);
    padding-top: var(--space-3);
    border-top: 1px dashed rgba(31, 47, 86, 0.1);
  }
  .applied-label {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-faint);
    margin-right: var(--space-2);
  }
  .applied-chip {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-signal-classified);
    background: rgba(141, 87, 235, 0.08);
    border: 1px solid rgba(141, 87, 235, 0.25);
    border-radius: var(--radius-full);
    padding: 2px 10px;
  }

  .bottom-actions {
    margin-top: var(--space-6);
    display: flex;
    justify-content: center;
  }

  /* --- Mobile --- */
  @media (max-width: 900px) {
    .score-body { grid-template-columns: 1fr; }
    .dual-grid { grid-template-columns: 1fr; }
    .variant-head {
      grid-template-columns: 110px 1fr auto;
    }
  }
  @media (max-width: 640px) {
    .app-header .container {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);
    }
    .input-card { padding: var(--space-4); }
    .result-section { padding: var(--space-4); }
    .overall-num { font-size: 4rem; }
    .variant-head {
      grid-template-columns: 1fr auto;
    }
    .variant-blurb { display: none; }
    .workspace-header { flex-direction: column; align-items: flex-start; }
    .cta-row { flex-direction: column; align-items: stretch; }
    .cta-row .primary-btn { width: 100%; }
  }

  @media (prefers-reduced-motion: reduce) {
    .doodle-icon { animation: none; }
    .status-dot { animation: none; }
    .result-section { animation: none; }
    .dim-fill { transition: none; }
  }
</style>
