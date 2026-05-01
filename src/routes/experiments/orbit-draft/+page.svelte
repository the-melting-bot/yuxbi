<script lang="ts">
  import Nav from '$lib/components/Nav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import {
    SAMPLE_PROMPTS,
    SURPRISE_SEEDS,
    LOADING_PHRASES,
    VERTICALS
  } from '$lib/data/orbit-draft/types';
  import type { LaunchConcept, Vertical } from '$lib/data/orbit-draft/types';
  import { generateConcept } from '$lib/data/orbit-draft/engine';

  // ----- State -----
  let rawInput = $state('');
  let vertical = $state<Vertical>('open');

  let isGenerating = $state(false);
  let result = $state<LaunchConcept | null>(null);
  let error = $state<string | null>(null);
  let regenSeed = $state(0); // bump to regenerate with new variant for the same input

  let loadingPhrase = $state(LOADING_PHRASES[0]);
  let phraseInterval: ReturnType<typeof setInterval> | null = null;

  let copiedKey = $state<string | null>(null);
  let copiedTimer: ReturnType<typeof setTimeout> | null = null;

  let loadedSampleId = $state<string | null>(null);

  // ----- Loading rotator -----
  function startPhrases() {
    let i = 0;
    loadingPhrase = LOADING_PHRASES[0];
    phraseInterval = setInterval(() => {
      i = (i + 1) % LOADING_PHRASES.length;
      loadingPhrase = LOADING_PHRASES[i];
    }, 520);
  }
  function stopPhrases() {
    if (phraseInterval) clearInterval(phraseInterval);
    phraseInterval = null;
  }

  // ----- Actions -----
  async function generate() {
    if (!rawInput.trim()) return;
    error = null;
    isGenerating = true;
    startPhrases();
    // a brief delay so the loading state actually feels considered, not jittery
    await new Promise((r) => setTimeout(r, 950));
    try {
      result = generateConcept(rawInput, { vertical, seed: regenSeed });
    } catch (e) {
      console.error(e);
      error = 'The signal collapsed. Try a slightly different phrase.';
      result = null;
    } finally {
      isGenerating = false;
      stopPhrases();
    }
  }

  function regenerate() {
    if (!rawInput.trim()) return;
    regenSeed = (regenSeed + 1) >>> 0;
    generate();
  }

  function loadSample(id: string) {
    const s = SAMPLE_PROMPTS.find((p) => p.id === id);
    if (!s) return;
    rawInput = s.text;
    vertical = s.vertical;
    loadedSampleId = id;
    result = null;
    error = null;
  }

  function surprise() {
    const idx = Math.floor(Math.random() * SURPRISE_SEEDS.length);
    rawInput = SURPRISE_SEEDS[idx];
    vertical = 'open';
    loadedSampleId = null;
    result = null;
    error = null;
  }

  function setVertical(v: Vertical) {
    vertical = v;
    if (result && rawInput.trim()) {
      // re-derive instantly if we already have a result
      regenSeed = 0;
      result = generateConcept(rawInput, { vertical, seed: regenSeed });
    }
  }

  function reset() {
    rawInput = '';
    result = null;
    error = null;
    regenSeed = 0;
    loadedSampleId = null;
    vertical = 'open';
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedKey = key;
      if (copiedTimer) clearTimeout(copiedTimer);
      copiedTimer = setTimeout(() => (copiedKey = null), 1500);
    } catch {
      // ignore — older browsers
    }
  }

  function copyAll() {
    if (!result) return;
    const lines = [
      `Input: ${result.input}`,
      `Vertical: ${result.vertical}`,
      ``,
      `Names:`,
      ...result.names.map((n) => `  • ${n.text} — ${n.rationale}`),
      ``,
      `Tagline: ${result.tagline}`,
      `Positioning: ${result.positioning}`,
      `Concept: ${result.concept}`,
      `Hook: ${result.hook}`,
      ``,
      `Landing structure:`,
      ...result.landing.map((s) => `  ${s.label} — ${s.copy}`),
      ``,
      `Audience: ${result.audience}`,
      `Tone: ${result.tone}`,
      `Visual: ${result.visual}`,
      `Monetization: ${result.monetization}`,
      ``,
      `${result.classification.code} · ${result.classification.band}`
    ];
    copy(lines.join('\n'), 'all');
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && rawInput.trim()) {
      e.preventDefault();
      generate();
    }
  }
</script>

<svelte:head>
  <title>Orbit Draft — Yuxbi</title>
  <meta
    name="description"
    content="Drop one strange input. Get a launch concept pack — name, tagline, positioning, landing structure. An idea accelerator for product builders."
  />
  <meta property="og:title" content="Orbit Draft — Yuxbi" />
  <meta
    property="og:description"
    content="Generates launch concepts from a single strange input. Name, tagline, landing structure — instant."
  />
  <meta name="theme-color" content="#fff6df" />
</svelte:head>

<Nav />

<main class="orbit-draft">
  <!-- Atmospheric layer -->
  <div class="atmosphere" aria-hidden="true">
    <div class="orbit-line orbit-line-1"></div>
    <div class="orbit-line orbit-line-2"></div>
    <div class="orbit-line orbit-line-3"></div>
    <div class="grain"></div>
  </div>

  <div class="app-header">
    <div class="container">
      <a href="/" class="back-link">
        <span class="back-arrow">←</span>
        <span>Back to Lab</span>
      </a>
      <div class="app-meta">
        <span class="app-codename">NOVA-11</span>
        <span class="app-status">
          <span class="status-dot"></span>
          Active
        </span>
      </div>
    </div>
  </div>

  <!-- HERO / INTRO -->
  <section class="hero-section">
    <div class="container">
      <div class="specimen-card">
        <div class="specimen-strip">
          <span class="strip-label">Specimen</span>
          <span class="strip-code">NOVA-11</span>
          <span class="strip-divider"></span>
          <span class="strip-meta">Concept generator</span>
        </div>

        <div class="specimen-body">
          <div class="specimen-mark" aria-hidden="true">
            <svg viewBox="0 0 96 96" fill="none">
              <!-- Orbit Draft mark: a small body in a steady orbit around a core -->
              <circle cx="48" cy="48" r="36" stroke="#1f2f56" stroke-width="2" stroke-dasharray="2 4" opacity="0.45"/>
              <circle cx="48" cy="48" r="22" stroke="#1f2f56" stroke-width="2" opacity="0.85"/>
              <circle cx="48" cy="48" r="6" fill="#1f2f56"/>
              <circle cx="80" cy="48" r="4.5" fill="#3568eb"/>
              <circle cx="48" cy="84" r="2.5" fill="#f76db8"/>
              <circle cx="14" cy="34" r="2" fill="#8d57eb"/>
            </svg>
          </div>

          <h1 class="specimen-title">Orbit Draft</h1>
          <p class="specimen-subtitle">
            Drop one strange input. Get a full launch concept — name, tagline, positioning, hook,
            and a landing page that already knows what it wants to be.
          </p>

          <div class="specimen-tags">
            <span class="tag">Idea accelerator</span>
            <span class="tag tag-quiet">Frontend complete</span>
            <span class="tag tag-quiet">Mock engine, API-ready</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  {#if !result && !isGenerating}
    <!-- INPUT STATE -->
    <section class="input-section">
      <div class="container">
        <div class="input-card">
          <div class="card-head">
            <span class="section-tag">Input · raw signal</span>
            <span class="card-hint">⌘/Ctrl + Enter to generate</span>
          </div>

          <textarea
            bind:value={rawInput}
            onkeydown={handleKeydown}
            placeholder={'A weird idea, a fragment, a startup-shaped sentence. Anything specific is fine. Anything vague is also fine.'}
            rows="5"
            spellcheck="false"
            autocapitalize="off"
            autocomplete="off"
            aria-label="Concept input"
          ></textarea>

          <div class="vertical-row">
            <span class="row-label">Vertical</span>
            <div class="vertical-chips" role="radiogroup" aria-label="Concept vertical">
              {#each VERTICALS as v}
                <button
                  type="button"
                  class="v-chip"
                  class:active={vertical === v.key}
                  role="radio"
                  aria-checked={vertical === v.key}
                  title={v.blurb}
                  onclick={() => setVertical(v.key)}
                >
                  {v.label}
                </button>
              {/each}
            </div>
          </div>

          <div class="cta-row">
            <button
              type="button"
              class="ghost-btn"
              onclick={surprise}
              aria-label="Surprise me with a sample input"
            >
              <span class="btn-glyph" aria-hidden="true">⌖</span>
              Surprise me
            </button>
            <div class="cta-right">
              <span class="char-count" aria-live="polite">
                {rawInput.trim().length} chars
              </span>
              <button
                type="button"
                class="primary-btn"
                onclick={generate}
                disabled={!rawInput.trim()}
              >
                Generate concept
              </button>
            </div>
          </div>
        </div>

        <div class="samples-row">
          <span class="samples-label">Or try a sample</span>
          <div class="samples-list">
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

        {#if error}
          <div class="error-card" role="alert">
            <span class="error-glyph" aria-hidden="true">!</span>
            <span>{error}</span>
            <button class="ghost-btn ghost-btn-sm" type="button" onclick={() => (error = null)}>
              Dismiss
            </button>
          </div>
        {/if}
      </div>
    </section>
  {/if}

  {#if isGenerating}
    <!-- LOADING STATE -->
    <section class="loading-section">
      <div class="container">
        <div class="loading-card">
          <div class="loading-orbit" aria-hidden="true">
            <svg viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="48" stroke="rgba(31,47,86,0.2)" stroke-width="1.5" stroke-dasharray="3 5"/>
              <circle cx="60" cy="60" r="32" stroke="rgba(31,47,86,0.3)" stroke-width="1.5"/>
              <circle cx="60" cy="60" r="6" fill="#1f2f56"/>
              <g class="loading-orbit-spin">
                <circle cx="108" cy="60" r="5" fill="#3568eb"/>
              </g>
              <g class="loading-orbit-spin loading-orbit-spin-2">
                <circle cx="92" cy="60" r="3" fill="#f76db8"/>
              </g>
            </svg>
          </div>
          <p class="loading-phrase">{loadingPhrase}</p>
          <p class="loading-sub">Composing a launch concept from “{rawInput.trim()}”.</p>
        </div>
      </div>
    </section>
  {/if}

  {#if result && !isGenerating}
    <!-- RESULT STATE -->
    <section class="result-section">
      <div class="container">
        <!-- Result header -->
        <div class="result-header">
          <div class="result-meta">
            <span class="result-code">{result.classification.code}</span>
            <span class="result-band">{result.classification.band}</span>
            <span class="result-vertical">
              {VERTICALS.find((v) => v.key === result?.vertical)?.label}
            </span>
          </div>
          <div class="result-actions">
            <button class="ghost-btn ghost-btn-sm" type="button" onclick={copyAll}>
              {copiedKey === 'all' ? 'Copied' : 'Copy all'}
            </button>
            <button class="ghost-btn ghost-btn-sm" type="button" onclick={regenerate}>
              <span class="btn-glyph" aria-hidden="true">↻</span>
              Regenerate
            </button>
            <button class="ghost-btn ghost-btn-sm" type="button" onclick={reset}>
              Reset
            </button>
          </div>
        </div>

        <!-- Names -->
        <div class="block names-block">
          <div class="block-head">
            <span class="block-tag">Product name</span>
            <span class="block-sub">Three options, ranked.</span>
          </div>
          <div class="names-grid">
            {#each result.names as n, i}
              <div class="name-card" class:primary={i === 0}>
                <div class="name-rank">{String(i + 1).padStart(2, '0')}</div>
                <div class="name-text">{n.text}</div>
                <div class="name-rationale">{n.rationale}</div>
                <button
                  type="button"
                  class="name-copy"
                  onclick={() => copy(n.text, `name-${i}`)}
                  aria-label={`Copy name ${n.text}`}
                >
                  {copiedKey === `name-${i}` ? 'Copied' : 'Copy'}
                </button>
              </div>
            {/each}
          </div>
        </div>

        <!-- Tagline -->
        <div class="block tagline-block">
          <div class="block-head">
            <span class="block-tag">Tagline</span>
            <button class="copy-btn" type="button" onclick={() => copy(result?.tagline ?? '', 'tagline')}>
              {copiedKey === 'tagline' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p class="tagline-text">{result.tagline}</p>
        </div>

        <!-- Positioning + Concept (dual) -->
        <div class="dual-grid">
          <div class="block">
            <div class="block-head">
              <span class="block-tag">Positioning</span>
              <button class="copy-btn" type="button" onclick={() => copy(result?.positioning ?? '', 'positioning')}>
                {copiedKey === 'positioning' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p class="prose">{result.positioning}</p>
          </div>
          <div class="block">
            <div class="block-head">
              <span class="block-tag">Concept</span>
              <button class="copy-btn" type="button" onclick={() => copy(result?.concept ?? '', 'concept')}>
                {copiedKey === 'concept' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p class="prose">{result.concept}</p>
          </div>
        </div>

        <!-- Hook -->
        <div class="block hook-block">
          <div class="block-head">
            <span class="block-tag">Launch hook</span>
            <button class="copy-btn" type="button" onclick={() => copy(result?.hook ?? '', 'hook')}>
              {copiedKey === 'hook' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p class="hook-text">{result.hook}</p>
        </div>

        <!-- Landing structure -->
        <div class="block landing-block">
          <div class="block-head">
            <span class="block-tag">Landing structure</span>
            <span class="block-sub">{result.landing.length} sections, in order.</span>
          </div>
          <ol class="landing-list">
            {#each result.landing as section, i}
              <li class="landing-item">
                <div class="landing-num">{String(i + 1).padStart(2, '0')}</div>
                <div class="landing-body">
                  <div class="landing-label">{section.label}</div>
                  <div class="landing-copy">{section.copy}</div>
                </div>
              </li>
            {/each}
          </ol>
        </div>

        <!-- Bonus fields -->
        <div class="block bonus-block">
          <div class="block-head">
            <span class="block-tag">Production notes</span>
            <span class="block-sub">Tone, visual, audience, monetization.</span>
          </div>
          <div class="bonus-grid">
            <div class="bonus-cell">
              <span class="bonus-label">Audience</span>
              <p class="bonus-value">{result.audience}</p>
            </div>
            <div class="bonus-cell">
              <span class="bonus-label">Tone</span>
              <p class="bonus-value">{result.tone}</p>
            </div>
            <div class="bonus-cell">
              <span class="bonus-label">Visual direction</span>
              <p class="bonus-value">{result.visual}</p>
            </div>
            <div class="bonus-cell">
              <span class="bonus-label">Monetization</span>
              <p class="bonus-value">{result.monetization}</p>
            </div>
          </div>
        </div>

        <!-- Re-frame controls (vertical re-targeting) -->
        <div class="block reframe-block">
          <div class="block-head">
            <span class="block-tag">Re-frame</span>
            <span class="block-sub">Same input, different orbit.</span>
          </div>
          <div class="vertical-chips" role="radiogroup" aria-label="Re-frame vertical">
            {#each VERTICALS as v}
              <button
                type="button"
                class="v-chip v-chip-sm"
                class:active={vertical === v.key}
                role="radio"
                aria-checked={vertical === v.key}
                onclick={() => setVertical(v.key)}
              >
                {v.label}
              </button>
            {/each}
          </div>
        </div>

        <div class="bottom-actions">
          <button class="ghost-btn" type="button" onclick={regenerate}>
            <span class="btn-glyph" aria-hidden="true">↻</span>
            Regenerate
          </button>
          <button class="ghost-btn" type="button" onclick={reset}>
            <span class="btn-glyph" aria-hidden="true">↺</span>
            New input
          </button>
        </div>
      </div>
    </section>
  {/if}
</main>

<Footer />

<style>
  .orbit-draft {
    min-height: 100vh;
    padding-top: var(--space-16);
    background: var(--color-bg);
    color: var(--color-text);
    position: relative;
    overflow-x: hidden;
  }

  .container {
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 var(--space-6);
    position: relative;
    z-index: 2;
  }

  /* --- Atmospheric layer --- */
  .atmosphere {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }
  .orbit-line {
    position: absolute;
    border: 1px dashed rgba(31, 47, 86, 0.08);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  .orbit-line-1 { top: 18%; left: 50%; width: 760px; height: 760px; }
  .orbit-line-2 { top: 22%; left: 50%; width: 1100px; height: 1100px; border-color: rgba(31,47,86,0.05); }
  .orbit-line-3 { top: 26%; left: 50%; width: 1480px; height: 1480px; border-color: rgba(31,47,86,0.04); }
  .grain {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(rgba(31, 47, 86, 0.04) 1px, transparent 1px);
    background-size: 3px 3px;
    opacity: 0.4;
    mix-blend-mode: multiply;
  }

  /* --- App header --- */
  .app-header {
    padding: var(--space-6) 0 var(--space-4);
    border-bottom: 1px solid rgba(31, 47, 86, 0.08);
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
    border: 1px solid rgba(31, 47, 86, 0.12);
    background: var(--color-surface);
    transition: all 0.2s var(--ease-elastic);
  }
  .back-link:hover {
    color: var(--color-accent);
    border-color: rgba(53, 104, 235, 0.3);
    transform: translateY(-1px);
  }
  .back-arrow { font-weight: 600; }
  .app-meta { display: flex; align-items: center; gap: var(--space-3); }
  .app-codename {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.14em;
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
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-signal-active);
  }
  .status-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--color-signal-active);
    box-shadow: 0 0 0 0 rgba(27, 182, 115, 0.5);
    animation: pulse 2.4s infinite;
  }
  @keyframes pulse {
    0%   { box-shadow: 0 0 0 0 rgba(27,182,115,0.45); }
    70%  { box-shadow: 0 0 0 10px rgba(27,182,115,0); }
    100% { box-shadow: 0 0 0 0 rgba(27,182,115,0); }
  }

  /* --- Hero / specimen card --- */
  .hero-section {
    padding: var(--space-12) 0 var(--space-8);
  }
  .specimen-card {
    max-width: 720px;
    margin: 0 auto;
    background: var(--color-surface);
    border: 1px solid rgba(31, 47, 86, 0.14);
    border-radius: var(--radius-xl);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.6) inset,
      0 24px 60px -20px rgba(31, 47, 86, 0.18),
      0 4px 12px -4px rgba(31, 47, 86, 0.08);
    overflow: hidden;
  }
  .specimen-strip {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-5);
    background:
      repeating-linear-gradient(135deg,
        rgba(31, 47, 86, 0.04) 0 6px,
        transparent 6px 12px),
      var(--color-surface-2);
    border-bottom: 1px solid rgba(31, 47, 86, 0.1);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }
  .strip-label { color: var(--color-text-faint); }
  .strip-code { color: var(--color-accent); font-weight: 600; }
  .strip-divider {
    flex: 1;
    height: 1px;
    background: rgba(31, 47, 86, 0.15);
  }
  .strip-meta { color: var(--color-text-muted); }

  .specimen-body {
    padding: var(--space-10) var(--space-8) var(--space-8);
    text-align: center;
  }
  .specimen-mark {
    width: 96px; height: 96px;
    margin: 0 auto var(--space-6);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .specimen-mark svg {
    width: 96px;
    height: 96px;
    animation: drift 16s ease-in-out infinite;
  }
  @keyframes drift {
    0%, 100% { transform: rotate(0deg); }
    50%      { transform: rotate(8deg); }
  }
  .specimen-title {
    font-family: var(--font-display);
    font-size: clamp(2.25rem, 1.5rem + 3vw, 3.75rem);
    font-weight: 700;
    color: var(--color-text-bright);
    margin: 0 0 var(--space-3);
    letter-spacing: -0.025em;
    line-height: 1.0;
  }
  .specimen-subtitle {
    font-size: var(--text-base);
    color: var(--color-text-muted);
    line-height: 1.55;
    max-width: 520px;
    margin: 0 auto var(--space-5);
  }
  .specimen-tags {
    display: inline-flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-2);
  }
  .tag {
    font-family: var(--font-display);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: var(--radius-full);
    background: rgba(53, 104, 235, 0.06);
    color: var(--color-accent);
    border: 1px solid rgba(53, 104, 235, 0.18);
  }
  .tag-quiet {
    color: var(--color-text-faint);
    background: rgba(31, 47, 86, 0.04);
    border-color: rgba(31, 47, 86, 0.1);
  }

  /* --- Input section --- */
  .input-section {
    padding: var(--space-4) 0 var(--space-16);
  }
  .input-card {
    max-width: 720px;
    margin: 0 auto;
    background: var(--color-surface);
    border: 1px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-xl);
    padding: var(--space-6);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.6) inset,
      0 12px 30px -16px rgba(31, 47, 86, 0.14);
  }
  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: var(--space-3);
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .section-tag, .block-tag {
    font-family: var(--font-display);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-accent);
    font-weight: 600;
  }
  .block-sub {
    font-family: var(--font-display);
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--color-text-faint);
  }
  .card-hint {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--color-text-faint);
    letter-spacing: 0.04em;
  }
  textarea {
    width: 100%;
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.55;
    padding: var(--space-4) var(--space-4);
    border: 1px solid rgba(31, 47, 86, 0.15);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    color: var(--color-text-bright);
    resize: vertical;
    min-height: 140px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  textarea:focus {
    outline: none;
    border-color: rgba(53, 104, 235, 0.45);
    box-shadow: 0 0 0 3px rgba(53, 104, 235, 0.1);
  }

  .vertical-row {
    margin-top: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .row-label {
    font-family: var(--font-display);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-faint);
  }
  .vertical-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .v-chip {
    display: inline-flex;
    align-items: center;
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    padding: 8px 14px;
    border: 1px solid rgba(31, 47, 86, 0.14);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    cursor: pointer;
    transition: all 0.2s var(--ease-elastic);
  }
  .v-chip:hover {
    border-color: rgba(53, 104, 235, 0.4);
    color: var(--color-accent);
  }
  .v-chip.active {
    background: var(--color-text-bright);
    color: #fff;
    border-color: var(--color-text-bright);
  }
  .v-chip-sm {
    font-size: 12px;
    padding: 6px 12px;
  }

  .cta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-5);
    flex-wrap: wrap;
  }
  .cta-right {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  .char-count {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--color-text-faint);
    letter-spacing: 0.04em;
  }
  .primary-btn {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 600;
    letter-spacing: 0.01em;
    color: #fff;
    background: var(--color-text-bright);
    border: 1px solid var(--color-text-bright);
    border-radius: var(--radius-full);
    padding: 10px 22px;
    cursor: pointer;
    box-shadow: 0 6px 20px -8px rgba(31, 47, 86, 0.5);
    transition: all 0.2s var(--ease-elastic);
  }
  .primary-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px -8px rgba(31, 47, 86, 0.55);
  }
  .primary-btn:active:not(:disabled) { transform: translateY(0); }
  .primary-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
  }
  .ghost-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    padding: 8px 14px;
    border: 1px solid rgba(31, 47, 86, 0.14);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    cursor: pointer;
    transition: all 0.2s var(--ease-elastic);
  }
  .ghost-btn:hover {
    border-color: rgba(53, 104, 235, 0.3);
    color: var(--color-accent);
    transform: translateY(-1px);
  }
  .ghost-btn-sm { font-size: 12px; padding: 6px 12px; }
  .btn-glyph { font-weight: 500; }

  .samples-row {
    max-width: 720px;
    margin: var(--space-6) auto 0;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .samples-label {
    font-family: var(--font-display);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-faint);
  }
  .samples-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .sample-chip {
    font-family: var(--font-display);
    font-size: 13px;
    color: var(--color-text-muted);
    padding: 6px 12px;
    border: 1px dashed rgba(31, 47, 86, 0.2);
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s var(--ease-elastic);
  }
  .sample-chip:hover {
    border-style: solid;
    border-color: rgba(141, 87, 235, 0.5);
    color: var(--color-signal-classified);
    transform: translateY(-1px);
  }
  .sample-chip.loaded {
    border-style: solid;
    border-color: rgba(141, 87, 235, 0.6);
    background: rgba(141, 87, 235, 0.06);
    color: var(--color-signal-classified);
  }

  .error-card {
    max-width: 720px;
    margin: var(--space-5) auto 0;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: rgba(247, 109, 184, 0.06);
    border: 1px solid rgba(247, 109, 184, 0.3);
    border-radius: var(--radius-lg);
    color: var(--color-secondary-dim);
    font-size: var(--text-sm);
  }
  .error-glyph {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: var(--color-secondary);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-family: var(--font-display);
  }
  .error-card .ghost-btn { margin-left: auto; }

  /* --- Loading --- */
  .loading-section {
    padding: var(--space-10) 0 var(--space-20);
  }
  .loading-card {
    max-width: 480px;
    margin: 0 auto;
    text-align: center;
    padding: var(--space-8);
    background: var(--color-surface);
    border: 1px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-xl);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.6) inset,
      0 18px 40px -20px rgba(31, 47, 86, 0.16);
  }
  .loading-orbit {
    width: 120px; height: 120px;
    margin: 0 auto var(--space-5);
  }
  .loading-orbit svg { width: 120px; height: 120px; }
  .loading-orbit-spin {
    transform-origin: 60px 60px;
    animation: spin 5s linear infinite;
  }
  .loading-orbit-spin-2 {
    animation-duration: 3s;
    animation-direction: reverse;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
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
    line-height: 1.5;
  }

  /* --- Result --- */
  .result-section {
    padding: var(--space-4) 0 var(--space-16);
  }
  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
    flex-wrap: wrap;
    margin-bottom: var(--space-6);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid rgba(31, 47, 86, 0.08);
  }
  .result-meta {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .result-code {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-accent);
    padding: 4px 10px;
    border: 1px solid rgba(53, 104, 235, 0.2);
    border-radius: var(--radius-full);
    background: rgba(53, 104, 235, 0.06);
  }
  .result-band {
    font-family: var(--font-display);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-signal-classified);
    padding: 4px 10px;
    border: 1px solid rgba(141, 87, 235, 0.25);
    border-radius: var(--radius-full);
    background: rgba(141, 87, 235, 0.06);
  }
  .result-vertical {
    font-family: var(--font-display);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-faint);
  }
  .result-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .block {
    background: var(--color-surface);
    border: 1px solid rgba(31, 47, 86, 0.1);
    border-radius: var(--radius-xl);
    padding: var(--space-6);
    margin-bottom: var(--space-4);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.6) inset,
      0 6px 16px -10px rgba(31, 47, 86, 0.1);
    animation: rise 0.5s var(--ease-elastic) both;
  }
  .block:nth-of-type(2) { animation-delay: 0.05s; }
  .block:nth-of-type(3) { animation-delay: 0.1s; }
  .block:nth-of-type(4) { animation-delay: 0.15s; }
  .block:nth-of-type(5) { animation-delay: 0.2s; }
  .block:nth-of-type(6) { animation-delay: 0.25s; }
  .block:nth-of-type(7) { animation-delay: 0.3s; }
  @keyframes rise {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .block-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
    flex-wrap: wrap;
  }

  .copy-btn {
    font-family: var(--font-display);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    background: transparent;
    border: 1px solid rgba(31, 47, 86, 0.16);
    border-radius: var(--radius-full);
    padding: 4px 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .copy-btn:hover {
    color: var(--color-accent);
    border-color: rgba(53, 104, 235, 0.4);
  }

  /* Names */
  .names-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
  }
  .name-card {
    position: relative;
    padding: var(--space-5);
    border: 1px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-lg);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.6), rgba(255, 246, 223, 0.4));
    transition: transform 0.2s var(--ease-elastic), box-shadow 0.2s ease;
  }
  .name-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px -10px rgba(31, 47, 86, 0.2);
  }
  .name-card.primary {
    border-color: rgba(53, 104, 235, 0.3);
    background: linear-gradient(180deg, rgba(53, 104, 235, 0.05), rgba(53, 104, 235, 0.02));
  }
  .name-rank {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    color: var(--color-text-faint);
    margin-bottom: var(--space-2);
  }
  .name-text {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--color-text-bright);
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin-bottom: var(--space-3);
  }
  .name-rationale {
    font-size: 13px;
    color: var(--color-text-muted);
    line-height: 1.55;
    margin-bottom: var(--space-3);
  }
  .name-copy {
    font-family: var(--font-display);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    background: transparent;
    border: 1px solid rgba(31, 47, 86, 0.16);
    border-radius: var(--radius-full);
    padding: 4px 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .name-copy:hover {
    color: var(--color-accent);
    border-color: rgba(53, 104, 235, 0.4);
  }

  /* Tagline */
  .tagline-block { padding: var(--space-8) var(--space-6); }
  .tagline-text {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 1rem + 1.6vw, 2.25rem);
    font-weight: 600;
    line-height: 1.2;
    color: var(--color-text-bright);
    letter-spacing: -0.02em;
    margin: 0;
  }

  /* Dual grid (positioning + concept) */
  .dual-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
  }
  .dual-grid > .block { margin-bottom: 0; }
  .prose {
    font-size: 15px;
    line-height: 1.65;
    color: var(--color-text);
    margin: 0;
  }

  /* Hook */
  .hook-block {
    background:
      linear-gradient(180deg, rgba(141, 87, 235, 0.04), rgba(53, 104, 235, 0.02)),
      var(--color-surface);
    border-color: rgba(141, 87, 235, 0.2);
  }
  .hook-text {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    line-height: 1.45;
    color: var(--color-text-bright);
    margin: 0;
    letter-spacing: -0.01em;
  }

  /* Landing */
  .landing-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
  }
  .landing-item {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: var(--space-4);
    padding: var(--space-4) 0;
    border-top: 1px solid rgba(31, 47, 86, 0.08);
  }
  .landing-item:first-child { border-top: 0; padding-top: var(--space-2); }
  .landing-num {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-text-faint);
    letter-spacing: 0.16em;
    padding-top: 3px;
  }
  .landing-label {
    font-family: var(--font-display);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--color-text-bright);
    margin-bottom: 4px;
    letter-spacing: -0.01em;
  }
  .landing-copy {
    font-size: 14px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  /* Bonus */
  .bonus-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }
  .bonus-cell {
    padding: var(--space-4);
    border: 1px solid rgba(31, 47, 86, 0.08);
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.5);
  }
  .bonus-label {
    display: block;
    font-family: var(--font-display);
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-text-faint);
    margin-bottom: var(--space-2);
  }
  .bonus-value {
    font-size: 14px;
    line-height: 1.55;
    color: var(--color-text);
    margin: 0;
  }

  .reframe-block .vertical-chips { margin-top: var(--space-1); }

  .bottom-actions {
    margin-top: var(--space-6);
    display: flex;
    justify-content: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  /* --- Mobile --- */
  @media (max-width: 900px) {
    .names-grid { grid-template-columns: 1fr; }
    .dual-grid { grid-template-columns: 1fr; }
    .bonus-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .app-header .container {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);
    }
    .specimen-body { padding: var(--space-8) var(--space-5) var(--space-6); }
    .input-card { padding: var(--space-5); }
    .block { padding: var(--space-5); }
    .cta-row { flex-direction: column; align-items: stretch; }
    .cta-right { justify-content: space-between; }
    .primary-btn { width: 100%; justify-content: center; text-align: center; }
    .result-header { flex-direction: column; align-items: flex-start; }
    .landing-item { grid-template-columns: 40px 1fr; gap: var(--space-3); }
  }

  @media (prefers-reduced-motion: reduce) {
    .specimen-mark svg { animation: none; }
    .status-dot { animation: none; }
    .loading-orbit-spin { animation: none; }
    .block { animation: none; }
  }
</style>
