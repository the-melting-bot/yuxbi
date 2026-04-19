<script lang="ts">
  import Nav from '$lib/components/Nav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { interpretDomain, SAMPLE_DOMAINS } from '$lib/data/drift-lens/mock-data';
  import { LOADING_PHRASES } from '$lib/data/drift-lens/types';
  import type { DriftLensResult } from '$lib/data/drift-lens/types';

  let domainInput = $state('');
  let isLoading = $state(false);
  let loadingPhrase = $state(LOADING_PHRASES[0]);
  let result: DriftLensResult | null = $state(null);
  let showResults = $state(false);
  let hasError = $state(false);

  let phraseInterval: ReturnType<typeof setInterval>;
  let phraseIndex = 0;

  function startLoadingPhrases() {
    phraseIndex = 0;
    loadingPhrase = LOADING_PHRASES[0];
    phraseInterval = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % LOADING_PHRASES.length;
      loadingPhrase = LOADING_PHRASES[phraseIndex];
    }, 600);
  }

  function stopLoadingPhrases() {
    clearInterval(phraseInterval);
  }

  async function handleSubmit() {
    const cleaned = domainInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    if (!cleaned || !cleaned.includes('.')) {
      hasError = true;
      return;
    }

    hasError = false;
    isLoading = true;
    showResults = false;
    result = null;
    startLoadingPhrases();

    try {
      result = await interpretDomain(cleaned);
      showResults = true;
    } catch {
      hasError = true;
    } finally {
      isLoading = false;
      stopLoadingPhrases();
    }
  }

  function handleSampleClick(domain: string) {
    domainInput = domain;
    handleSubmit();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }

  function resetToInput() {
    showResults = false;
    result = null;
    domainInput = '';
  }
</script>

<svelte:head>
  <title>Drift Lens — Yuxbi</title>
  <meta name="description" content="Feed it a domain name. It tells you what the site should feel like before it exists. A brand interpretation experiment by Yuxbi." />
  <meta property="og:title" content="Drift Lens — Yuxbi" />
  <meta property="og:description" content="Feed it a domain name. It tells you what the site should feel like before it exists." />
  <meta name="theme-color" content="#fff6df" />
</svelte:head>

<Nav />

<main class="drift-lens">
  <!-- App Header -->
  <div class="app-header">
    <div class="container">
      <a href="/" class="back-link">
        <span class="back-arrow">←</span>
        <span>Back to Lab</span>
      </a>
      <div class="app-meta">
        <span class="app-codename">SIGNAL-07</span>
        <span class="app-status">
          <span class="status-dot"></span>
          Active
        </span>
      </div>
    </div>
  </div>

  <!-- Input Section -->
  {#if !showResults}
    <section class="input-section">
      <div class="container">
        <div class="input-hero" class:loading={isLoading}>
          <div class="doodle-icon">
            <svg viewBox="0 0 80 80" fill="none">
              <circle cx="36" cy="36" r="22" stroke="#2047af" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 5"/>
              <circle cx="36" cy="36" r="11" stroke="#3568eb" stroke-width="3"/>
              <path d="M50 51L66 68" stroke="#2047af" stroke-width="4" stroke-linecap="round"/>
            </svg>
          </div>

          <h1 class="app-title">Drift Lens</h1>
          <p class="app-subtitle">
            Feed it a domain name. It tells you what the site should feel like before it exists.
          </p>

          {#if !isLoading}
            <div class="input-group" class:error={hasError}>
              <input
                type="text"
                bind:value={domainInput}
                onkeydown={handleKeydown}
                placeholder="enter a domain name"
                class="domain-input"
                aria-label="Domain name"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
              />
              <button class="submit-btn" onclick={handleSubmit} disabled={!domainInput.trim()}>
                Interpret Domain
              </button>
            </div>
            {#if hasError}
              <p class="error-text">Enter a valid domain name (e.g. example.com)</p>
            {/if}

            <div class="sample-domains">
              <span class="sample-label">Try:</span>
              {#each SAMPLE_DOMAINS as domain}
                <button class="sample-chip" onclick={() => handleSampleClick(domain)}>
                  {domain}
                </button>
              {/each}
            </div>
          {:else}
            <div class="loading-state">
              <div class="scan-ring">
                <svg viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="50" stroke="rgba(31,47,86,0.1)" stroke-width="2"/>
                  <circle cx="60" cy="60" r="50" stroke="var(--color-accent)" stroke-width="2" stroke-dasharray="80 234" class="scan-arc"/>
                  <circle cx="60" cy="60" r="35" stroke="rgba(31,47,86,0.06)" stroke-width="1.5"/>
                  <circle cx="60" cy="60" r="35" stroke="var(--color-secondary)" stroke-width="1.5" stroke-dasharray="50 170" class="scan-arc-inner"/>
                </svg>
              </div>
              <p class="loading-domain">{domainInput}</p>
              <p class="loading-phrase">{loadingPhrase}</p>
            </div>
          {/if}
        </div>
      </div>
    </section>
  {/if}

  <!-- Results Section -->
  {#if showResults && result}
    <section class="results-section">
      <div class="container">
        <!-- Results Header -->
        <div class="results-header">
          <div class="results-meta">
            <span class="result-signal-id">{result.signalId}</span>
            <span class="result-domain">{result.domain}</span>
          </div>
          <button class="new-scan-btn" onclick={resetToInput}>
            <span>←</span> New Interpretation
          </button>
        </div>

        <!-- Core Read -->
        <div class="result-section result-core">
          <div class="section-tag">Core Read</div>
          <div class="core-grid">
            <div class="core-main">
              <h2 class="archetype">{result.coreRead.archetype}</h2>
              <p class="interpretation">{result.coreRead.interpretation}</p>
              <p class="reasoning">{result.coreRead.reasoning}</p>
            </div>
            <div class="confidence-meter">
              <div class="confidence-ring">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(31,47,86,0.08)" stroke-width="6"/>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-accent)" stroke-width="6"
                    stroke-dasharray="{result.coreRead.confidence * 2.64} {264 - result.coreRead.confidence * 2.64}"
                    stroke-dashoffset="66" stroke-linecap="round"
                    class="confidence-fill"/>
                </svg>
                <span class="confidence-value">{result.coreRead.confidence}</span>
              </div>
              <span class="confidence-label">Signal Confidence</span>
            </div>
          </div>
        </div>

        <!-- Emotional Feel -->
        <div class="result-section">
          <div class="section-tag">Emotional Feel</div>
          <div class="traits-grid">
            {#each result.emotionalFeel.traits as trait}
              <span class="trait-chip">{trait}</span>
            {/each}
          </div>
        </div>

        <!-- Visual Direction -->
        <div class="result-section">
          <div class="section-tag">Visual Direction</div>
          <div class="visual-grid">
            <div class="palette-row">
              {#each result.visualDirection.colorPalette as color}
                <div class="color-swatch">
                  <div class="swatch-fill" style="background: {color.hex}"></div>
                  <span class="swatch-name">{color.name}</span>
                  <span class="swatch-hex">{color.hex}</span>
                </div>
              {/each}
            </div>
            <div class="visual-details">
              <div class="visual-item">
                <span class="visual-label">Type Direction</span>
                <p>{result.visualDirection.typeDirection}</p>
              </div>
              <div class="visual-item">
                <span class="visual-label">UI Density</span>
                <p>{result.visualDirection.uiDensity}</p>
              </div>
              <div class="visual-item">
                <span class="visual-label">Motion Style</span>
                <p>{result.visualDirection.motionStyle}</p>
              </div>
              <div class="visual-item">
                <span class="visual-label">Imagery</span>
                <p>{result.visualDirection.imageryDirection}</p>
              </div>
              <div class="visual-item">
                <span class="visual-label">Layout Personality</span>
                <p>{result.visualDirection.layoutPersonality}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Audience Signal -->
        <div class="result-section">
          <div class="section-tag">Audience Signal</div>
          <div class="audience-grid">
            <div class="audience-item">
              <span class="audience-label">Target Audience</span>
              <p>{result.audienceSignal.targetAudience}</p>
            </div>
            <div class="audience-item">
              <span class="audience-label">Trust Profile</span>
              <p>{result.audienceSignal.trustProfile}</p>
            </div>
            <div class="audience-item">
              <span class="audience-label">Price Positioning</span>
              <p>{result.audienceSignal.pricePositioning}</p>
            </div>
          </div>
        </div>

        <!-- Site Recommendation -->
        <div class="result-section">
          <div class="section-tag">Site Recommendation</div>
          <div class="site-rec">
            <div class="rec-type">
              <span class="rec-label">Recommended Site Type</span>
              <p class="rec-value">{result.siteRecommendation.siteType}</p>
            </div>
            <div class="rec-sections">
              <span class="rec-label">Homepage Sections</span>
              <ol class="rec-list">
                {#each result.siteRecommendation.homepageSections as section}
                  <li>{section}</li>
                {/each}
              </ol>
            </div>
            <div class="rec-ctas">
              <span class="rec-label">CTA Language</span>
              <div class="cta-chips">
                {#each result.siteRecommendation.ctaLanguage as cta}
                  <span class="cta-chip">{cta}</span>
                {/each}
              </div>
            </div>
          </div>
        </div>

        <!-- Voice & Messaging -->
        <div class="result-section">
          <div class="section-tag">Voice & Messaging</div>
          <div class="voice-grid">
            <div class="voice-tone">
              <span class="voice-label">Tone of Voice</span>
              <p>{result.voiceMessaging.toneOfVoice}</p>
            </div>
            <div class="voice-headlines">
              <span class="voice-label">Homepage Headlines</span>
              {#each result.voiceMessaging.headlines as headline}
                <blockquote class="headline-quote">"{headline}"</blockquote>
              {/each}
            </div>
            <div class="voice-taglines">
              <span class="voice-label">Tagline Options</span>
              {#each result.voiceMessaging.taglines as tagline}
                <blockquote class="tagline-quote">"{tagline}"</blockquote>
              {/each}
            </div>
            <div class="voice-pitch">
              <span class="voice-label">Elevator Pitch</span>
              <p class="pitch-text">{result.voiceMessaging.elevatorPitch}</p>
            </div>
          </div>
        </div>

        <!-- Identity Signals -->
        <div class="result-section">
          <div class="section-tag">Identity Signals</div>
          <div class="identity-grid">
            <div class="identity-item">
              <span class="identity-label">Logo Direction</span>
              <p>{result.identitySignals.logoDirection}</p>
            </div>
            <div class="identity-item">
              <span class="identity-label">Symbol Concept</span>
              <p>{result.identitySignals.symbolConcept}</p>
            </div>
            <div class="identity-item">
              <span class="identity-label">Wordmark / Casing</span>
              <p>{result.identitySignals.casingWordmark}</p>
            </div>
            <div class="identity-item">
              <span class="identity-label">Favicon Idea</span>
              <p>{result.identitySignals.faviconIdea}</p>
            </div>
          </div>
        </div>

        <!-- Build Readiness -->
        <div class="result-section result-readiness">
          <div class="section-tag">Build Readiness</div>
          <div class="readiness-grid">
            <div class="readiness-header">
              <div class="signal-strength strength-{result.buildReadiness.signalStrength}">
                <span class="strength-icon">
                  {#if result.buildReadiness.signalStrength === 'strong'}◉
                  {:else if result.buildReadiness.signalStrength === 'moderate'}◎
                  {:else}○{/if}
                </span>
                <span class="strength-text">{result.buildReadiness.signalStrength} signal</span>
              </div>
              <div class="recommendation rec-{result.buildReadiness.recommendation.replace(' ', '-')}">
                {result.buildReadiness.recommendation}
              </div>
            </div>
            <div class="next-actions">
              <span class="actions-label">Next Actions</span>
              <ol class="actions-list">
                {#each result.buildReadiness.nextActions as action}
                  <li>{action}</li>
                {/each}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  {/if}
</main>

<Footer />

<style>
  .drift-lens {
    min-height: 100dvh;
    padding-top: 60px;
  }

  /* --- App Header --- */
  .app-header {
    padding: var(--space-4) 0;
    border-bottom: 2px solid rgba(31, 47, 86, 0.1);
  }

  .app-header .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    transition: color 0.2s ease, background 0.2s ease;
  }

  .back-link:hover {
    color: var(--color-accent);
    background: rgba(53, 104, 235, 0.06);
  }

  .back-arrow {
    font-size: 1.1em;
  }

  .app-meta {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .app-codename {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    letter-spacing: 0.12em;
    text-transform: uppercase;
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
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    border: 1px solid rgba(27, 182, 115, 0.28);
    background: rgba(27, 182, 115, 0.08);
  }

  .status-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--color-signal-active);
    animation: statusPulse 2s ease-in-out infinite;
  }

  @keyframes statusPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* --- Input Section --- */
  .input-section {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100dvh - 140px);
    padding: var(--space-12) 0;
  }

  .input-hero {
    text-align: center;
    max-width: 640px;
    margin: 0 auto;
  }

  .doodle-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto var(--space-6);
    padding: 10px;
    border-radius: 18px;
    border: 2px solid rgba(31, 47, 86, 0.16);
    background: rgba(255, 255, 255, 0.8);
    box-shadow: var(--shadow-sm);
  }

  .doodle-icon svg {
    width: 100%;
    height: 100%;
  }

  .app-title {
    font-family: var(--font-display);
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-text-bright);
    margin-bottom: var(--space-4);
    letter-spacing: -0.02em;
  }

  .app-subtitle {
    font-size: var(--text-lg);
    color: var(--color-text-muted);
    line-height: 1.6;
    margin-bottom: var(--space-10);
    max-width: 480px;
    margin-inline: auto;
  }

  .input-group {
    display: flex;
    gap: 0;
    max-width: 520px;
    margin: 0 auto var(--space-6);
    border: 2px solid rgba(31, 47, 86, 0.2);
    border-radius: var(--radius-full);
    overflow: hidden;
    background: var(--color-surface);
    box-shadow: var(--shadow-md);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .input-group:focus-within {
    border-color: var(--color-accent);
    box-shadow: var(--shadow-md), 0 0 0 3px rgba(53, 104, 235, 0.12);
  }

  .input-group.error {
    border-color: #e53e3e;
  }

  .domain-input {
    flex: 1;
    padding: var(--space-4) var(--space-6);
    border: none;
    background: transparent;
    font-family: var(--font-display);
    font-size: var(--text-base);
    color: var(--color-text-bright);
    outline: none;
  }

  .domain-input::placeholder {
    color: var(--color-text-faint);
  }

  .submit-btn {
    padding: var(--space-4) var(--space-6);
    background: var(--color-accent);
    color: white;
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 600;
    letter-spacing: 0.02em;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s ease, transform 0.2s var(--ease-elastic);
  }

  .submit-btn:hover:not(:disabled) {
    background: #2a57d0;
    transform: scale(1.02);
  }

  .submit-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error-text {
    font-size: var(--text-sm);
    color: #e53e3e;
    margin-bottom: var(--space-4);
  }

  .sample-domains {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .sample-label {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .sample-chip {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    padding: var(--space-2) var(--space-3);
    border: 2px solid rgba(31, 47, 86, 0.14);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    cursor: pointer;
    transition: all 0.2s var(--ease-elastic);
    box-shadow: 0 3px 0 rgba(31, 47, 86, 0.08);
  }

  .sample-chip:hover {
    border-color: rgba(53, 104, 235, 0.3);
    color: var(--color-accent);
    transform: translateY(-2px);
    box-shadow: 0 5px 0 rgba(31, 47, 86, 0.1);
  }

  /* --- Loading State --- */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-5);
    padding: var(--space-8) 0;
  }

  .scan-ring {
    width: 120px;
    height: 120px;
  }

  .scan-ring svg {
    width: 100%;
    height: 100%;
  }

  .scan-arc {
    animation: scanRotate 1.8s linear infinite;
    transform-origin: center;
  }

  .scan-arc-inner {
    animation: scanRotate 2.4s linear infinite reverse;
    transform-origin: center;
  }

  @keyframes scanRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .loading-domain {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text-bright);
  }

  .loading-phrase {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-faint);
    letter-spacing: 0.06em;
    min-height: 1.4em;
    transition: opacity 0.15s ease;
  }

  /* --- Results Section --- */
  .results-section {
    padding: var(--space-8) 0 var(--space-16);
  }

  .results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-10);
    padding-bottom: var(--space-6);
    border-bottom: 2px solid rgba(31, 47, 86, 0.1);
  }

  .results-meta {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .result-signal-id {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-accent);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: var(--space-1) var(--space-3);
    border: 1px solid rgba(53, 104, 235, 0.2);
    border-radius: var(--radius-full);
    background: rgba(53, 104, 235, 0.06);
  }

  .result-domain {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--color-text-bright);
  }

  .new-scan-btn {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    padding: var(--space-2) var(--space-4);
    border: 2px solid rgba(31, 47, 86, 0.15);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    cursor: pointer;
    transition: all 0.2s var(--ease-elastic);
    box-shadow: 0 3px 0 rgba(31, 47, 86, 0.08);
  }

  .new-scan-btn:hover {
    border-color: rgba(53, 104, 235, 0.3);
    color: var(--color-accent);
    transform: translateY(-2px);
    box-shadow: 0 5px 0 rgba(31, 47, 86, 0.1);
  }

  /* --- Result Sections --- */
  .result-section {
    margin-bottom: var(--space-10);
    padding: var(--space-8);
    border: 2px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-xl);
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
    animation: resultFadeIn 0.5s var(--ease-out) both;
  }

  .result-section:nth-child(2) { animation-delay: 0.05s; }
  .result-section:nth-child(3) { animation-delay: 0.1s; }
  .result-section:nth-child(4) { animation-delay: 0.15s; }
  .result-section:nth-child(5) { animation-delay: 0.2s; }
  .result-section:nth-child(6) { animation-delay: 0.25s; }
  .result-section:nth-child(7) { animation-delay: 0.3s; }
  .result-section:nth-child(8) { animation-delay: 0.35s; }
  .result-section:nth-child(9) { animation-delay: 0.4s; }

  @keyframes resultFadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .section-tag {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-accent);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: var(--space-6);
    padding: var(--space-1) var(--space-3);
    border: 1px solid rgba(53, 104, 235, 0.2);
    border-radius: var(--radius-full);
    display: inline-block;
    background: rgba(53, 104, 235, 0.04);
  }

  /* --- Core Read --- */
  .core-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-8);
    align-items: start;
  }

  .archetype {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: 700;
    color: var(--color-text-bright);
    margin-bottom: var(--space-3);
    letter-spacing: -0.01em;
  }

  .interpretation {
    font-size: var(--text-lg);
    color: var(--color-text-muted);
    margin-bottom: var(--space-4);
    line-height: 1.6;
  }

  .reasoning {
    font-size: var(--text-sm);
    color: var(--color-text-faint);
    line-height: 1.7;
  }

  .confidence-meter {
    text-align: center;
    flex-shrink: 0;
  }

  .confidence-ring {
    position: relative;
    width: 100px;
    height: 100px;
    margin-bottom: var(--space-2);
  }

  .confidence-ring svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .confidence-fill {
    transition: stroke-dasharray 1s var(--ease-out);
  }

  .confidence-value {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--color-text-bright);
  }

  .confidence-label {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* --- Traits --- */
  .traits-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .trait-chip {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    padding: var(--space-2) var(--space-4);
    border: 2px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-full);
    background: rgba(53, 104, 235, 0.04);
    box-shadow: 0 2px 0 rgba(31, 47, 86, 0.06);
  }

  /* --- Visual Direction --- */
  .palette-row {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-8);
    flex-wrap: wrap;
  }

  .color-swatch {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  .swatch-fill {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-lg);
    border: 2px solid rgba(31, 47, 86, 0.12);
    box-shadow: 0 3px 0 rgba(31, 47, 86, 0.1);
  }

  .swatch-name {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-align: center;
  }

  .swatch-hex {
    font-family: var(--font-display);
    font-size: 0.65rem;
    color: var(--color-text-faint);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .visual-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }

  .visual-item {
    padding: var(--space-4);
    border: 1px solid rgba(31, 47, 86, 0.08);
    border-radius: var(--radius-lg);
    background: rgba(255, 246, 223, 0.3);
  }

  .visual-label, .audience-label, .voice-label, .identity-label, .rec-label, .actions-label {
    display: block;
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-accent);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: var(--space-3);
    font-weight: 500;
  }

  .visual-item p, .audience-item p, .identity-item p {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: 1.7;
  }

  /* --- Audience Signal --- */
  .audience-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
  }

  .audience-item {
    padding: var(--space-4);
    border: 1px solid rgba(31, 47, 86, 0.08);
    border-radius: var(--radius-lg);
    background: rgba(255, 246, 223, 0.3);
  }

  /* --- Site Recommendation --- */
  .site-rec {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .rec-value {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text-bright);
  }

  .rec-list {
    list-style: decimal;
    padding-left: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .rec-list li {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: 1.6;
  }

  .cta-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .cta-chip {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-surface);
    background: var(--color-accent);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    box-shadow: 0 3px 0 rgba(32, 71, 175, 0.3);
  }

  /* --- Voice & Messaging --- */
  .voice-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .voice-tone p, .voice-pitch p {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: 1.7;
  }

  .headline-quote, .tagline-quote {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 500;
    color: var(--color-text-bright);
    padding: var(--space-3) var(--space-5);
    border-left: 3px solid var(--color-accent);
    margin-bottom: var(--space-3);
    background: rgba(53, 104, 235, 0.03);
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
  }

  .tagline-quote {
    font-size: var(--text-base);
    border-left-color: var(--color-secondary);
    background: rgba(247, 109, 184, 0.03);
  }

  .pitch-text {
    font-size: var(--text-base);
    color: var(--color-text-muted);
    line-height: 1.7;
    padding: var(--space-4);
    border: 1px solid rgba(31, 47, 86, 0.08);
    border-radius: var(--radius-lg);
    background: rgba(255, 246, 223, 0.3);
  }

  /* --- Identity Signals --- */
  .identity-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }

  .identity-item {
    padding: var(--space-4);
    border: 1px solid rgba(31, 47, 86, 0.08);
    border-radius: var(--radius-lg);
    background: rgba(255, 246, 223, 0.3);
  }

  /* --- Build Readiness --- */
  .readiness-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .readiness-header {
    display: flex;
    align-items: center;
    gap: var(--space-6);
    flex-wrap: wrap;
  }

  .signal-strength {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    text-transform: capitalize;
  }

  .strength-icon {
    font-size: 1.2em;
  }

  .strength-strong { color: var(--color-signal-active); }
  .strength-moderate { color: var(--color-signal-pending); }
  .strength-weak { color: #e53e3e; }

  .recommendation {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    border: 2px solid;
    box-shadow: 0 3px 0 rgba(31, 47, 86, 0.08);
  }

  .rec-build-now {
    color: var(--color-signal-active);
    border-color: rgba(27, 182, 115, 0.3);
    background: rgba(27, 182, 115, 0.08);
  }

  .rec-reposition {
    color: var(--color-signal-pending);
    border-color: rgba(243, 154, 25, 0.3);
    background: rgba(243, 154, 25, 0.08);
  }

  .rec-rename {
    color: #e53e3e;
    border-color: rgba(229, 62, 62, 0.3);
    background: rgba(229, 62, 62, 0.08);
  }

  .actions-list {
    list-style: decimal;
    padding-left: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .actions-list li {
    font-size: var(--text-base);
    color: var(--color-text-muted);
    line-height: 1.6;
  }

  /* --- Responsive --- */
  @media (max-width: 768px) {
    .core-grid {
      grid-template-columns: 1fr;
    }

    .confidence-meter {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .confidence-ring {
      width: 72px;
      height: 72px;
    }

    .visual-details,
    .audience-grid,
    .identity-grid {
      grid-template-columns: 1fr;
    }

    .input-group {
      flex-direction: column;
      border-radius: var(--radius-xl);
    }

    .submit-btn {
      border-radius: 0 0 calc(var(--radius-xl) - 2px) calc(var(--radius-xl) - 2px);
    }

    .results-header {
      flex-direction: column;
      gap: var(--space-4);
      align-items: flex-start;
    }

    .readiness-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .palette-row {
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .sample-domains {
      flex-direction: column;
      gap: var(--space-2);
    }

    .app-title {
      font-size: var(--text-2xl);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .scan-arc,
    .scan-arc-inner {
      animation: none;
    }

    .result-section {
      animation: none;
      opacity: 1;
    }
  }
</style>
