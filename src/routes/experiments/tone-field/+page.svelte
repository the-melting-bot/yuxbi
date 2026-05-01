<script lang="ts">
  import Nav from '$lib/components/Nav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import {
    AXES,
    LOADING_PHRASES,
    SAMPLE_INPUTS,
    REFINEMENT_PRESETS,
    type ToneReading,
    type AxisReading
  } from '$lib/data/tone-field/types';
  import { analyseTone } from '$lib/data/tone-field/engine';

  // ----- State -----
  let rawInput = $state('');
  let isAnalysing = $state(false);
  let result = $state<ToneReading | null>(null);
  let error = $state<string | null>(null);
  let regenSeed = $state(0);

  let loadingPhrase = $state(LOADING_PHRASES[0]);
  let phraseInterval: ReturnType<typeof setInterval> | null = null;

  let copiedKey = $state<string | null>(null);
  let copiedTimer: ReturnType<typeof setTimeout> | null = null;

  let loadedSampleId = $state<string | null>(null);
  let activeRefinement = $state<string | null>(null);

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

  // ----- Validation -----
  const charCount = $derived(rawInput.length);
  const wordCount = $derived(
    rawInput.trim().length === 0 ? 0 : rawInput.trim().split(/\s+/).length
  );
  const tooShort = $derived(wordCount > 0 && wordCount < 6);
  const tooLong = $derived(wordCount > 600);
  const canAnalyse = $derived(
    !isAnalysing && wordCount >= 6 && !tooLong
  );

  // ----- Actions -----
  async function analyse() {
    if (!canAnalyse) return;
    error = null;
    isAnalysing = true;
    startPhrases();
    await new Promise((r) => setTimeout(r, 950));
    try {
      result = analyseTone(rawInput, { seed: regenSeed });
      // gentle scroll to results on desktop
      requestAnimationFrame(() => {
        const el = document.querySelector('.result-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (e) {
      console.error(e);
      error = 'The signal collapsed. Try a slightly different passage.';
      result = null;
    } finally {
      isAnalysing = false;
      stopPhrases();
    }
  }

  function regenerate() {
    if (!rawInput.trim() || isAnalysing) return;
    regenSeed = (regenSeed + 1) % 1000;
    activeRefinement = null;
    analyse();
  }

  function reset() {
    rawInput = '';
    result = null;
    error = null;
    loadedSampleId = null;
    activeRefinement = null;
    regenSeed = 0;
  }

  function loadSample(id: string) {
    const s = SAMPLE_INPUTS.find((x) => x.id === id);
    if (!s) return;
    rawInput = s.text;
    loadedSampleId = id;
    result = null;
    error = null;
    activeRefinement = null;
    regenSeed = 0;
  }

  function onInputChange() {
    loadedSampleId = null;
  }

  function handleKey(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      analyse();
    }
  }

  // ----- Copy -----
  async function copy(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedKey = key;
      if (copiedTimer) clearTimeout(copiedTimer);
      copiedTimer = setTimeout(() => (copiedKey = null), 1400);
    } catch {
      /* ignore */
    }
  }

  function copyAll() {
    if (!result) return;
    const lines: string[] = [
      `TONE FIELD — ${result.classification.code}`,
      `Signature: ${result.signature}`,
      `Note: ${result.signatureNote}`,
      ``,
      `Voice: ${result.voice.name} — ${result.voice.short}`,
      `Traits: ${result.traits.map((t) => t.text).join(', ')}`,
      `Mood: ${result.mood.caption}`,
      ``,
      `Cohesion: ${result.cohesion}`,
      `Tension: ${result.tension}`,
      `Audience: ${result.audience}`,
      ``,
      `Strongest line: "${result.strongestPhrase}"`,
      result.flatPhrase ? `Flat line: "${result.flatPhrase}"` : '',
      ``,
      `Refinements:`,
      ...result.refinements.map((r) => `- ${r.label}: ${r.detail}`),
      ``,
      `Axes:`,
      ...result.axes.map((a) => `- ${a.id}: ${a.label} (${a.value.toFixed(2)})`)
    ];
    copy('all', lines.filter((l) => l !== '').join('\n'));
  }

  // ----- Refinement quick prompts -----
  function applyRefinement(id: string) {
    activeRefinement = activeRefinement === id ? null : id;
  }

  // helpers used in template
  function axisPercent(v: number): number {
    // map -1..1 to 0..100
    return Math.max(0, Math.min(100, ((v + 1) / 2) * 100));
  }

  function axisLabelFor(id: string): { left: string; right: string; meta: string } {
    const a = AXES.find((x) => x.id === id)!;
    return { left: a.left, right: a.right, meta: a.meta };
  }

  // active refinement detail
  const refinementDetail = $derived.by(() => {
    if (!activeRefinement) return null;
    const r = REFINEMENT_PRESETS.find((x) => x.id === activeRefinement);
    if (!r || !result) return null;
    return refinementGuidance(activeRefinement, result);
  });

  function refinementGuidance(id: string, r: ToneReading): { title: string; body: string } {
    const ax = (k: AxisReading['id']) => r.axes.find((a) => a.id === k)!.value;
    switch (id) {
      case 'sharper':
        return {
          title: 'If you push it sharper',
          body:
            ax('edge') > 0.3
              ? 'The edge is already high. Going sharper will read as aggressive — consider trimming one adjective per sentence instead of adding force.'
              : 'Cut hedges, end two sentences with a single concrete noun, replace one polite verb with a definitive one. Expect "edge" to move +0.3.'
        };
      case 'human':
        return {
          title: 'If you make it more human',
          body:
            ax('temperature') > 0.4
              ? 'Already quite warm. The risk of going further is reading saccharine. Consider keeping the warmth and adding one specific detail (a place, a person, a habit) instead.'
              : 'Switch one clause to first-person. Use "we" or "I" once near the top. Replace one abstract noun with something the reader could touch.'
        };
      case 'less-corporate':
        return {
          title: 'If you strip the corporate layer',
          body:
            ax('familiarity') > 0.3
              ? 'There is a lot of platform-speak to remove. Start with: "platform / solutions / seamless / unified / leading / industry / empower". Each word you cut moves the brand back toward something specific.'
              : 'Already low on enterprise vocabulary. Watch out for replacing it with hedge words — keep the directness you have.'
        };
      case 'more-premium':
        return {
          title: 'If you raise the register',
          body:
            ax('register') > 0.3
              ? 'Already premium. Going further means cutting words, not adding ones. Try removing every adverb in one paragraph.'
              : 'Slow the cadence. Replace two short sentences with one longer one that earns its length. Drop exclamations.'
        };
      case 'stranger':
        return {
          title: 'If you lean into the strangeness',
          body:
            ax('familiarity') < -0.3
              ? 'Already strange. Anchor it: pair the next strange line with one plain sentence that says exactly what the product does.'
              : 'Pick one sentence and name something specifically — not "users" but "people who keep three browsers open". Specificity reads stranger than synonyms.'
        };
      case 'calmer':
        return {
          title: 'If you slow it down',
          body:
            ax('tempo') < -0.2
              ? 'Already calm. The next move is rhythm: vary sentence length more, use one pause-line to give the reader somewhere to land.'
              : 'Drop urgency words ("now", "today", "fast"). Remove exclamations. Add one sentence that ends mid-thought, on purpose.'
        };
      default:
        return { title: 'Refinement', body: '' };
    }
  }
</script>

<svelte:head>
  <title>Tone Field — Yuxbi</title>
  <meta
    name="description"
    content="Tone Field reads the emotional frequency of brand copy. Returns a tone map, not a score."
  />
</svelte:head>

<Nav />

<main class="tone-field">
  <!-- atmospheric layer -->
  <div class="atmosphere" aria-hidden="true">
    <svg class="wave wave-a" viewBox="0 0 1200 200" preserveAspectRatio="none">
      <path d="M0,100 Q300,40 600,100 T1200,100" stroke="currentColor" stroke-width="1" fill="none" opacity="0.15" />
    </svg>
    <svg class="wave wave-b" viewBox="0 0 1200 200" preserveAspectRatio="none">
      <path d="M0,120 Q300,80 600,120 T1200,120" stroke="currentColor" stroke-width="1" fill="none" opacity="0.1" />
    </svg>
    <div class="grain"></div>
  </div>

  <div class="container">
    <header class="app-header">
      <a href="/#experiments" class="back-link">
        <span class="arrow" aria-hidden="true">←</span>
        Back to Lab
      </a>
      <div class="header-meta">
        <span class="codename">PULSE-09</span>
        <span class="status-pill">
          <span class="status-dot"></span>
          Active
        </span>
      </div>
    </header>

    <!-- HERO: specimen card -->
    <section class="hero">
      <article class="specimen">
        <div class="specimen-strip">
          <span class="strip-label">SPECIMEN</span>
          <span class="strip-code">PULSE-09</span>
          <span class="strip-spacer"></span>
          <span class="strip-tag">TONE INSTRUMENT</span>
        </div>

        <div class="specimen-body">
          <div class="mark" aria-hidden="true">
            <svg viewBox="0 0 80 80" fill="none">
              <path
                d="M6 50 Q20 30 32 46 T56 46 T76 38"
                stroke="var(--color-accent)"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <path
                d="M6 60 Q22 44 36 56 T60 52 T76 48"
                stroke="var(--color-secondary)"
                stroke-width="2"
                stroke-linecap="round"
                opacity="0.7"
              />
              <circle cx="32" cy="46" r="3" fill="var(--color-accent)" />
              <circle cx="56" cy="46" r="2.5" fill="var(--color-secondary)" />
            </svg>
          </div>

          <h1 class="title">Tone Field</h1>
          <p class="subtitle">
            Paste your copy. We will read the field. This is not sentiment analysis — it is brand atmosphere detection. Tone in layers, not grades.
          </p>

          <div class="tags">
            <span class="tag">Brand atmosphere</span>
            <span class="tag">Eight-axis map</span>
            <span class="tag">Mock engine, API-ready</span>
          </div>
        </div>
      </article>
    </section>

    <!-- INPUT -->
    <section class="input-section" aria-label="Brand copy input">
      <div class="input-card">
        <div class="input-head">
          <span class="input-label">INPUT · BRAND COPY</span>
          <span class="input-hint">⌘/Ctrl + Enter to read field</span>
        </div>

        <textarea
          class="input"
          placeholder="Paste a tagline, hero section, about page, product description, or several paragraphs of brand copy. Anything from a single line to a full page."
          rows="7"
          bind:value={rawInput}
          oninput={onInputChange}
          onkeydown={handleKey}
          aria-label="Brand copy input"
        ></textarea>

        <div class="cta-row">
          <div class="cta-meta">
            <span class="char-count" class:warn={tooLong} class:hint={tooShort}>
              {wordCount} words
              {#if tooShort}· too short{/if}
              {#if tooLong}· trim under 600{/if}
            </span>
          </div>
          <div class="cta-actions">
            <button
              class="ghost-btn"
              type="button"
              onclick={() => loadSample('founder-poetic')}
              disabled={isAnalysing}
              aria-label="Load a sample input"
            >
              <span class="ghost-icon" aria-hidden="true">+</span>
              Try a sample
            </button>
            <button
              class="primary-btn"
              type="button"
              onclick={analyse}
              disabled={!canAnalyse}
              aria-label="Analyse the brand copy"
            >
              {isAnalysing ? 'Reading…' : 'Read field'}
            </button>
          </div>
        </div>
      </div>

      <!-- sample chips -->
      <div class="samples">
        <span class="samples-label">OR PICK A SAMPLE</span>
        <div class="samples-grid">
          {#each SAMPLE_INPUTS as s (s.id)}
            <button
              class="sample-chip"
              class:active={loadedSampleId === s.id}
              type="button"
              onclick={() => loadSample(s.id)}
              disabled={isAnalysing}
            >
              <span class="sample-label">{s.label}</span>
              <span class="sample-hint">{s.hint}</span>
            </button>
          {/each}
        </div>
      </div>
    </section>

    {#if error && !isAnalysing}
      <section class="error-card" role="alert">
        <span class="error-mark" aria-hidden="true">!</span>
        <p>{error}</p>
        <button class="ghost-btn" onclick={() => (error = null)}>Dismiss</button>
      </section>
    {/if}

    <!-- LOADING -->
    {#if isAnalysing}
      <section class="loading-section" aria-live="polite">
        <div class="loading-mark" aria-hidden="true">
          <svg class="loading-wave" viewBox="0 0 120 60" fill="none">
            <path
              class="wave-path"
              d="M0,30 Q15,10 30,30 T60,30 T90,30 T120,30"
              stroke="var(--color-accent)"
              stroke-width="2.5"
              fill="none"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <p class="loading-phrase">{loadingPhrase}</p>
      </section>
    {/if}

    <!-- RESULT -->
    {#if result && !isAnalysing}
      <section class="result-section" aria-label="Tone reading">
        <!-- Result header -->
        <div class="result-header">
          <div class="result-meta">
            <span class="meta-code">{result.classification.code}</span>
            <span class="meta-divider">·</span>
            <span class="meta-band">{result.classification.band}</span>
            <span class="meta-divider">·</span>
            <span class="meta-stats">
              {result.meta.wordCount} words · {result.meta.sentenceCount} sentences
            </span>
          </div>
          <div class="result-actions">
            <button class="ghost-btn small" type="button" onclick={copyAll}>
              {copiedKey === 'all' ? 'Copied' : 'Copy all'}
            </button>
            <button class="ghost-btn small" type="button" onclick={regenerate}>
              <span aria-hidden="true">↻</span> Re-read
            </button>
            <button class="ghost-btn small" type="button" onclick={reset}>
              <span aria-hidden="true">×</span> Reset
            </button>
          </div>
        </div>

        <!-- SIGNATURE block -->
        <div class="signature-block">
          <span class="block-label">PRIMARY SIGNATURE</span>
          <div class="signature-row">
            <h2 class="signature">{result.signature}</h2>
            <button
              class="copy-btn"
              type="button"
              onclick={() => copy('sig', `${result!.signature} — ${result!.signatureNote}`)}
              aria-label="Copy signature"
            >
              {copiedKey === 'sig' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p class="signature-note">{result.signatureNote}</p>
        </div>

        <!-- TRAIT TAGS + VOICE archetype -->
        <div class="trait-grid">
          <div class="trait-block">
            <span class="block-label">SUPPORTING TRAITS</span>
            <div class="trait-tags">
              {#each result.traits as t (t.text)}
                <span class="trait-tag intensity-{t.intensity}">{t.text}</span>
              {/each}
            </div>
          </div>
          <div class="voice-block">
            <span class="block-label">BRAND VOICE</span>
            <div class="voice-name">{result.voice.name}</div>
            <p class="voice-short">{result.voice.short}</p>
          </div>
        </div>

        <!-- TONE FIELD MAP — eight axis bands -->
        <div class="field-block">
          <div class="field-head">
            <span class="block-label">TONE FIELD</span>
            <span class="field-sub">Eight axes · marker shows where the copy sits</span>
          </div>
          <ul class="axis-list">
            {#each result.axes as a (a.id)}
              {@const labels = axisLabelFor(a.id)}
              <li class="axis-row" class:center={a.pole === 'center'}>
                <div class="axis-meta">
                  <span class="axis-name">{labels.meta}</span>
                  <span class="axis-summary">{a.label}</span>
                </div>
                <div class="axis-track" aria-hidden="true">
                  <span class="axis-pole left">{labels.left}</span>
                  <div class="axis-bar">
                    <div class="axis-rule"></div>
                    <div class="axis-mid"></div>
                    <div
                      class="axis-marker pole-{a.pole}"
                      style="left: {axisPercent(a.value)}%"
                    >
                      <span class="marker-pin"></span>
                    </div>
                  </div>
                  <span class="axis-pole right">{labels.right}</span>
                </div>
              </li>
            {/each}
          </ul>

          <!-- Mood band — primary temperature reading -->
          <div class="mood-band">
            <span class="block-label small">MOOD BAND</span>
            <div class="mood-track" aria-hidden="true">
              <div class="mood-gradient"></div>
              <div class="mood-marker" style="left: {axisPercent(result.mood.position)}%"></div>
            </div>
            <p class="mood-caption">{result.mood.caption}</p>
          </div>
        </div>

        <!-- COHESION / TENSION / AUDIENCE -->
        <div class="reading-grid">
          <div class="reading-card">
            <span class="block-label">COHESION</span>
            <p>{result.cohesion}</p>
          </div>
          <div class="reading-card">
            <span class="block-label">TENSION</span>
            <p>{result.tension}</p>
          </div>
          <div class="reading-card">
            <span class="block-label">FIRST-IMPRESSION READ</span>
            <p>{result.audience}</p>
          </div>
        </div>

        <!-- DISTINCTIVE PHRASES -->
        <div class="phrases-grid">
          <div class="phrase-card strongest">
            <div class="phrase-head">
              <span class="block-label">STRONGEST LINE</span>
              <button
                class="copy-btn"
                type="button"
                onclick={() => copy('strong', result!.strongestPhrase)}
              >
                {copiedKey === 'strong' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <blockquote class="phrase-quote">{result.strongestPhrase}</blockquote>
            <p class="phrase-note">Highest tonal density. The line that does the most work.</p>
          </div>
          {#if result.flatPhrase}
            <div class="phrase-card flat">
              <div class="phrase-head">
                <span class="block-label">FLATTEST LINE</span>
                <button
                  class="copy-btn"
                  type="button"
                  onclick={() => copy('flat', result!.flatPhrase || '')}
                >
                  {copiedKey === 'flat' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <blockquote class="phrase-quote subtle">{result.flatPhrase}</blockquote>
              <p class="phrase-note">Lowest tonal density. The first candidate to rewrite.</p>
            </div>
          {/if}
        </div>

        <!-- REFINEMENTS -->
        <div class="refine-block">
          <span class="block-label">SUGGESTED REFINEMENTS</span>
          <ol class="refine-list">
            {#each result.refinements as r (r.label)}
              <li class="refine-item">
                <span class="refine-name">{r.label}</span>
                <p class="refine-detail">{r.detail}</p>
              </li>
            {/each}
          </ol>
        </div>

        <!-- QUICK DIRECTIONS -->
        <div class="directions-block">
          <div class="directions-head">
            <span class="block-label">TRY A DIRECTION</span>
            <span class="directions-sub">Hypothetical shifts — see what would change</span>
          </div>
          <div class="directions-row">
            {#each REFINEMENT_PRESETS as p (p.id)}
              <button
                type="button"
                class="direction-chip"
                class:active={activeRefinement === p.id}
                onclick={() => applyRefinement(p.id)}
              >
                <span class="direction-label">{p.label}</span>
                <span class="direction-hint">{p.hint}</span>
              </button>
            {/each}
          </div>
          {#if refinementDetail}
            <div class="direction-detail">
              <span class="block-label small">{refinementDetail.title}</span>
              <p>{refinementDetail.body}</p>
            </div>
          {/if}
        </div>

        <!-- BOTTOM ACTIONS -->
        <div class="bottom-actions">
          <button class="ghost-btn" type="button" onclick={regenerate}>
            <span aria-hidden="true">↻</span> Re-read
          </button>
          <button class="ghost-btn" type="button" onclick={reset}>
            <span aria-hidden="true">+</span> New input
          </button>
        </div>
      </section>
    {/if}
  </div>
</main>

<Footer />

<style>
  .tone-field {
    --field-bg: var(--color-bg);
    --field-surface: var(--color-surface);
    --field-text: var(--color-text);
    --field-accent: var(--color-accent);
    --field-secondary: var(--color-secondary);
    --field-line: rgba(31, 47, 86, 0.1);
    --field-line-strong: rgba(31, 47, 86, 0.18);
    --field-muted: rgba(31, 47, 86, 0.55);
    --field-soft: rgba(31, 47, 86, 0.04);
    --pulse-violet: #8d57eb;

    position: relative;
    min-height: 100vh;
    background: var(--field-bg);
    color: var(--field-text);
    padding-top: var(--space-16);
    padding-bottom: var(--space-24);
    overflow-x: hidden;
  }

  .atmosphere {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    color: var(--field-text);
  }
  .wave {
    position: absolute;
    width: 130%;
    left: -15%;
    height: 200px;
  }
  .wave-a {
    top: 12%;
  }
  .wave-b {
    top: 38%;
  }
  .grain {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(31, 47, 86, 0.04) 1px, transparent 1px);
    background-size: 3px 3px;
    opacity: 0.6;
  }

  .container {
    position: relative;
    z-index: 1;
    width: min(100% - 2.5rem, 1080px);
    margin: 0 auto;
  }

  /* ---- Header ---- */
  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-block: var(--space-4);
    margin-bottom: var(--space-8);
  }
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--field-text);
    text-decoration: none;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    padding: 0.5rem 0.85rem;
    border: 1px solid var(--field-line-strong);
    border-radius: var(--radius-full);
    background: var(--field-surface);
    transition: transform 0.18s var(--ease-elastic), background 0.2s ease;
  }
  .back-link:hover {
    transform: translateX(-2px);
    background: var(--field-soft);
  }
  .arrow {
    transition: transform 0.18s ease;
  }
  .back-link:hover .arrow {
    transform: translateX(-2px);
  }
  .header-meta {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
  }
  .codename {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    color: var(--field-text);
    padding: 0.4rem 0.7rem;
    border: 1px solid var(--field-line-strong);
    border-radius: var(--radius-full);
    background: var(--field-surface);
  }
  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    color: #1bb673;
    text-transform: uppercase;
  }
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #1bb673;
    box-shadow: 0 0 0 0 rgba(27, 182, 115, 0.4);
    animation: pulse-dot 2.4s ease-in-out infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(27, 182, 115, 0.45); }
    50% { box-shadow: 0 0 0 6px rgba(27, 182, 115, 0); }
  }

  /* ---- Hero specimen card ---- */
  .hero {
    margin-bottom: var(--space-12);
  }
  .specimen {
    background: var(--field-surface);
    border: 1px solid var(--field-line-strong);
    border-radius: 1.25rem;
    overflow: hidden;
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.6) inset,
      0 30px 60px -40px rgba(31, 47, 86, 0.25);
  }
  .specimen-strip {
    display: grid;
    grid-template-columns: auto auto 1fr auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 1.25rem;
    background:
      repeating-linear-gradient(
        135deg,
        rgba(141, 87, 235, 0.07) 0,
        rgba(141, 87, 235, 0.07) 6px,
        transparent 6px,
        transparent 14px
      ),
      var(--field-soft);
    border-bottom: 1px solid var(--field-line);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    color: var(--field-muted);
    text-transform: uppercase;
  }
  .strip-code {
    color: var(--pulse-violet);
    font-weight: 600;
  }
  .strip-spacer {
    border-top: 1px dashed var(--field-line-strong);
    height: 0;
  }
  .strip-tag {
    color: var(--field-text);
  }
  .specimen-body {
    padding: clamp(2.25rem, 4vw, 3rem) clamp(1.5rem, 4vw, 2.5rem) clamp(2rem, 4vw, 2.75rem);
    text-align: center;
  }
  .mark {
    width: 80px;
    height: 80px;
    margin: 0 auto var(--space-4);
  }
  .mark svg { width: 100%; height: 100%; }
  .title {
    font-family: var(--font-display);
    font-size: clamp(2.4rem, 5vw, 3.4rem);
    line-height: 1.05;
    margin: 0 0 var(--space-3);
    letter-spacing: -0.02em;
  }
  .subtitle {
    font-size: 1.025rem;
    line-height: 1.55;
    color: var(--field-muted);
    max-width: 540px;
    margin: 0 auto var(--space-5);
  }
  .tags {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }
  .tag {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--field-accent);
    padding: 0.4rem 0.7rem;
    border: 1px solid rgba(53, 104, 235, 0.2);
    border-radius: var(--radius-full);
    background: rgba(53, 104, 235, 0.04);
  }

  /* ---- Input section ---- */
  .input-section {
    margin-bottom: var(--space-10);
  }
  .input-card {
    background: var(--field-surface);
    border: 1px solid var(--field-line-strong);
    border-radius: 1rem;
    padding: clamp(1rem, 2.5vw, 1.5rem);
    box-shadow: 0 16px 36px -28px rgba(31, 47, 86, 0.2);
  }
  .input-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-3);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--field-muted);
  }
  .input {
    width: 100%;
    background: transparent;
    border: 1px solid var(--field-line);
    border-radius: 0.75rem;
    padding: 1rem 1.1rem;
    font-family: var(--font-body);
    font-size: 0.985rem;
    line-height: 1.55;
    color: var(--field-text);
    resize: vertical;
    min-height: 160px;
    transition: border-color 0.18s ease, background 0.18s ease;
  }
  .input::placeholder {
    color: var(--field-muted);
    opacity: 0.85;
  }
  .input:focus {
    outline: none;
    border-color: rgba(53, 104, 235, 0.5);
    background: rgba(53, 104, 235, 0.02);
  }
  .cta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: var(--space-3);
  }
  .cta-meta {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    color: var(--field-muted);
  }
  .char-count.hint { color: var(--field-secondary); }
  .char-count.warn { color: #d33b3b; }
  .cta-actions {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
  }
  .ghost-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1rem;
    border: 1px solid var(--field-line-strong);
    border-radius: var(--radius-full);
    background: var(--field-surface);
    color: var(--field-text);
    font-family: var(--font-mono);
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: transform 0.18s var(--ease-elastic), background 0.18s ease, border-color 0.18s ease;
  }
  .ghost-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    background: var(--field-soft);
    border-color: var(--field-line-strong);
  }
  .ghost-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .ghost-btn.small { padding: 0.45rem 0.8rem; font-size: 0.74rem; }
  .ghost-icon { font-family: var(--font-mono); }
  .primary-btn {
    background: var(--field-text);
    color: var(--field-bg);
    border: 1px solid var(--field-text);
    padding: 0.7rem 1.3rem;
    border-radius: var(--radius-full);
    font-family: var(--font-body);
    font-weight: 500;
    font-size: 0.95rem;
    cursor: pointer;
    transition: transform 0.18s var(--ease-elastic), background 0.18s ease;
  }
  .primary-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    background: #2c4ec9;
    border-color: #2c4ec9;
  }
  .primary-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* ---- Samples ---- */
  .samples {
    margin-top: var(--space-5);
  }
  .samples-label {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--field-muted);
    margin-bottom: var(--space-3);
  }
  .samples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.65rem;
  }
  .sample-chip {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding: 0.85rem 1rem;
    border: 1px dashed var(--field-line-strong);
    background: transparent;
    border-radius: 0.75rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .sample-chip:hover:not(:disabled) {
    background: var(--field-surface);
    border-color: rgba(53, 104, 235, 0.4);
    border-style: solid;
    transform: translateY(-1px);
  }
  .sample-chip.active {
    background: var(--field-surface);
    border-color: var(--field-accent);
    border-style: solid;
  }
  .sample-chip:disabled { opacity: 0.55; cursor: not-allowed; }
  .sample-label {
    font-family: var(--font-body);
    font-weight: 500;
    font-size: 0.92rem;
    color: var(--field-text);
  }
  .sample-hint {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--field-muted);
  }

  /* ---- Error ---- */
  .error-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
    background: rgba(211, 59, 59, 0.05);
    border: 1px solid rgba(211, 59, 59, 0.25);
    border-radius: 0.85rem;
    margin-bottom: var(--space-8);
  }
  .error-mark {
    width: 26px; height: 26px;
    border-radius: 50%;
    background: rgba(211, 59, 59, 0.15);
    display: inline-flex; align-items: center; justify-content: center;
    color: #d33b3b;
    font-weight: 600;
  }
  .error-card p { margin: 0; flex: 1; color: var(--field-text); }

  /* ---- Loading ---- */
  .loading-section {
    background: var(--field-surface);
    border: 1px solid var(--field-line-strong);
    border-radius: 1rem;
    padding: var(--space-8) var(--space-6);
    margin-bottom: var(--space-10);
    text-align: center;
  }
  .loading-mark {
    width: 120px; height: 60px;
    margin: 0 auto var(--space-3);
  }
  .loading-wave { width: 100%; height: 100%; }
  .wave-path {
    stroke-dasharray: 200;
    stroke-dashoffset: 200;
    animation: draw-wave 1.6s ease-in-out infinite;
  }
  @keyframes draw-wave {
    0% { stroke-dashoffset: 200; opacity: 0.2; }
    50% { stroke-dashoffset: 0; opacity: 1; }
    100% { stroke-dashoffset: -200; opacity: 0.2; }
  }
  .loading-phrase {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    color: var(--field-muted);
    text-transform: uppercase;
    margin: 0;
  }

  /* ---- Result section ---- */
  .result-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    scroll-margin-top: var(--space-12);
  }

  .block-label {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--field-muted);
    margin-bottom: var(--space-2);
  }
  .block-label.small { font-size: 0.68rem; margin-bottom: 0.4rem; }

  .result-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: 0.65rem 1rem;
    border: 1px solid var(--field-line);
    border-radius: var(--radius-full);
    background: var(--field-surface);
  }
  .result-meta {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    color: var(--field-muted);
    flex-wrap: wrap;
  }
  .meta-code { color: var(--pulse-violet); font-weight: 600; }
  .meta-band { color: var(--field-text); }
  .meta-divider { opacity: 0.45; }
  .result-actions { display: inline-flex; gap: 0.5rem; flex-wrap: wrap; }

  /* signature */
  .signature-block {
    background: var(--field-surface);
    border: 1px solid var(--field-line-strong);
    border-radius: 1rem;
    padding: var(--space-6) clamp(1.25rem, 3vw, 1.75rem);
  }
  .signature-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .signature {
    font-family: var(--font-display);
    font-size: clamp(2rem, 4vw, 2.6rem);
    line-height: 1.1;
    letter-spacing: -0.015em;
    margin: 0;
  }
  .signature-note {
    margin: 0.6rem 0 0;
    color: var(--field-muted);
    font-size: 1rem;
    line-height: 1.55;
    max-width: 56ch;
  }
  .copy-btn {
    background: transparent;
    border: 1px solid var(--field-line-strong);
    color: var(--field-text);
    border-radius: var(--radius-full);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.04em;
    padding: 0.35rem 0.7rem;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .copy-btn:hover { background: var(--field-soft); }

  /* trait + voice */
  .trait-grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: var(--space-4);
  }
  .trait-block, .voice-block {
    background: var(--field-surface);
    border: 1px solid var(--field-line);
    border-radius: 0.9rem;
    padding: var(--space-4) var(--space-5);
  }
  .trait-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .trait-tag {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.02em;
    padding: 0.4rem 0.7rem;
    border: 1px solid var(--field-line-strong);
    border-radius: var(--radius-full);
    background: var(--field-soft);
    color: var(--field-text);
  }
  .trait-tag.intensity-high {
    border-color: rgba(53, 104, 235, 0.4);
    background: rgba(53, 104, 235, 0.06);
    color: #1c3fa3;
  }
  .trait-tag.intensity-medium {
    border-color: rgba(141, 87, 235, 0.32);
    background: rgba(141, 87, 235, 0.05);
    color: #6d3fc0;
  }
  .voice-name {
    font-family: var(--font-display);
    font-size: 1.4rem;
    line-height: 1.15;
    letter-spacing: -0.01em;
    margin-bottom: 0.3rem;
  }
  .voice-short {
    margin: 0;
    color: var(--field-muted);
    font-size: 0.95rem;
    line-height: 1.5;
  }

  /* tone field axes */
  .field-block {
    background: var(--field-surface);
    border: 1px solid var(--field-line-strong);
    border-radius: 1rem;
    padding: clamp(1rem, 2.5vw, 1.5rem);
  }
  .field-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: var(--space-3);
  }
  .field-sub {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--field-muted);
    letter-spacing: 0.04em;
  }
  .axis-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.85rem;
  }
  .axis-row {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 1.25rem;
    align-items: center;
  }
  .axis-meta { display: flex; flex-direction: column; gap: 0.2rem; }
  .axis-name {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--field-muted);
  }
  .axis-summary {
    font-family: var(--font-body);
    font-size: 0.95rem;
    color: var(--field-text);
  }
  .axis-track {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.75rem;
    align-items: center;
  }
  .axis-pole {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    color: var(--field-muted);
    text-transform: uppercase;
    min-width: 64px;
  }
  .axis-pole.right { text-align: right; }
  .axis-bar {
    position: relative;
    height: 22px;
  }
  .axis-rule {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--field-line-strong);
    transform: translateY(-50%);
  }
  .axis-mid {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1px;
    height: 14px;
    background: var(--field-line-strong);
    transform: translate(-50%, -50%);
  }
  .axis-marker {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .marker-pin {
    display: block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--field-accent);
    border: 2px solid var(--field-bg);
    box-shadow: 0 0 0 1px rgba(53, 104, 235, 0.4);
  }
  .pole-left .marker-pin { background: var(--field-accent); }
  .pole-right .marker-pin { background: var(--pulse-violet); box-shadow: 0 0 0 1px rgba(141, 87, 235, 0.4); }
  .pole-center .marker-pin {
    background: var(--field-bg);
    border-color: var(--field-text);
    box-shadow: 0 0 0 1px rgba(31, 47, 86, 0.35);
  }

  /* mood band */
  .mood-band {
    margin-top: var(--space-5);
    padding-top: var(--space-4);
    border-top: 1px dashed var(--field-line);
  }
  .mood-track {
    position: relative;
    height: 14px;
    border-radius: var(--radius-full);
    overflow: hidden;
    border: 1px solid var(--field-line-strong);
  }
  .mood-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to right,
      rgba(53, 104, 235, 0.45) 0%,
      rgba(53, 104, 235, 0.18) 35%,
      rgba(247, 109, 184, 0.18) 65%,
      rgba(247, 109, 184, 0.5) 100%
    );
  }
  .mood-marker {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--field-bg);
    border: 2px solid var(--field-text);
    box-shadow: 0 4px 12px rgba(31, 47, 86, 0.18);
  }
  .mood-caption {
    margin: 0.6rem 0 0;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    color: var(--field-muted);
  }

  /* reading grid */
  .reading-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
  }
  .reading-card {
    background: var(--field-surface);
    border: 1px solid var(--field-line);
    border-radius: 0.9rem;
    padding: var(--space-4) var(--space-5);
  }
  .reading-card p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.55;
    color: var(--field-text);
  }

  /* phrases */
  .phrases-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }
  .phrase-card {
    background: var(--field-surface);
    border: 1px solid var(--field-line);
    border-radius: 0.9rem;
    padding: var(--space-4) var(--space-5);
  }
  .phrase-card.strongest {
    border-left: 3px solid var(--field-accent);
  }
  .phrase-card.flat {
    border-left: 3px solid var(--field-muted);
    background: var(--field-soft);
  }
  .phrase-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  .phrase-quote {
    margin: 0.5rem 0 0.6rem;
    font-family: var(--font-display);
    font-size: 1.15rem;
    line-height: 1.4;
    letter-spacing: -0.005em;
    color: var(--field-text);
    quotes: '\201C' '\201D';
  }
  .phrase-quote.subtle { color: var(--field-muted); font-style: italic; }
  .phrase-quote::before { content: open-quote; margin-right: 0.1em; }
  .phrase-quote::after { content: close-quote; margin-left: 0.1em; }
  .phrase-note {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--field-muted);
    letter-spacing: 0.04em;
  }

  /* refinements */
  .refine-block {
    background: var(--field-surface);
    border: 1px solid var(--field-line-strong);
    border-radius: 1rem;
    padding: clamp(1rem, 2.5vw, 1.5rem);
  }
  .refine-list {
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: r-count;
  }
  .refine-item {
    counter-increment: r-count;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.75rem 1rem;
    padding: var(--space-3) 0;
    border-top: 1px dashed var(--field-line);
  }
  .refine-item:first-child { border-top: none; padding-top: 0.4rem; }
  .refine-item::before {
    content: counter(r-count, decimal-leading-zero);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--field-muted);
    letter-spacing: 0.05em;
    grid-row: span 2;
    align-self: start;
    padding-top: 0.15rem;
  }
  .refine-name {
    font-family: var(--font-display);
    font-size: 1.15rem;
    letter-spacing: -0.005em;
  }
  .refine-detail {
    margin: 0;
    color: var(--field-text);
    font-size: 0.95rem;
    line-height: 1.55;
  }

  /* directions */
  .directions-block {
    background: var(--field-surface);
    border: 1px solid var(--field-line);
    border-radius: 1rem;
    padding: clamp(1rem, 2.5vw, 1.5rem);
  }
  .directions-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: var(--space-3);
  }
  .directions-sub {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--field-muted);
    letter-spacing: 0.04em;
  }
  .directions-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .direction-chip {
    display: inline-flex;
    flex-direction: column;
    gap: 0.1rem;
    padding: 0.65rem 0.95rem;
    border: 1px dashed var(--field-line-strong);
    background: transparent;
    border-radius: 0.75rem;
    text-align: left;
    cursor: pointer;
    min-width: 0;
    transition: all 0.18s ease;
  }
  .direction-chip:hover {
    background: var(--field-soft);
    border-style: solid;
  }
  .direction-chip.active {
    background: rgba(141, 87, 235, 0.06);
    border-color: var(--pulse-violet);
    border-style: solid;
  }
  .direction-label {
    font-family: var(--font-body);
    font-weight: 500;
    font-size: 0.92rem;
    color: var(--field-text);
  }
  .direction-hint {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--field-muted);
  }
  .direction-detail {
    margin-top: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--field-soft);
    border-radius: 0.75rem;
    border-left: 3px solid var(--pulse-violet);
  }
  .direction-detail p {
    margin: 0;
    color: var(--field-text);
    font-size: 0.95rem;
    line-height: 1.55;
  }

  .bottom-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    padding-top: var(--space-4);
  }

  /* ---- Responsive ---- */
  @media (max-width: 920px) {
    .trait-grid { grid-template-columns: 1fr; }
    .reading-grid { grid-template-columns: 1fr; }
    .phrases-grid { grid-template-columns: 1fr; }
    .axis-row { grid-template-columns: 1fr; gap: 0.5rem; }
  }
  @media (max-width: 640px) {
    .app-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.6rem;
    }
    .specimen-strip {
      grid-template-columns: 1fr 1fr;
      row-gap: 0.4rem;
    }
    .strip-spacer { display: none; }
    .cta-row {
      flex-direction: column;
      align-items: stretch;
    }
    .cta-actions { justify-content: stretch; }
    .cta-actions .ghost-btn,
    .cta-actions .primary-btn {
      flex: 1;
      justify-content: center;
    }
    .axis-track {
      grid-template-columns: auto 1fr auto;
    }
    .axis-pole { min-width: 52px; font-size: 0.68rem; }
    .input-head {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }
    .signature-row { flex-direction: column; align-items: flex-start; }
    .result-header { padding: 0.75rem; border-radius: 0.85rem; }
    .result-actions { width: 100%; }
    .refine-item { grid-template-columns: 1fr; }
    .refine-item::before { grid-row: auto; }
  }

  @media (prefers-reduced-motion: reduce) {
    .status-dot,
    .wave-path {
      animation: none;
    }
    .back-link, .ghost-btn, .primary-btn, .sample-chip, .direction-chip {
      transition: none;
    }
  }
</style>
