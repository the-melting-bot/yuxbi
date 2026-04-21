<script lang="ts">
  import Nav from '$lib/components/Nav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { decodeVibe, SAMPLE_URLS } from '$lib/data/vibe-decode/mock-data';
  import { LOADING_PHRASES } from '$lib/data/vibe-decode/types';
  import type { VibeDecodeResult } from '$lib/data/vibe-decode/types';

  let urlInput = $state('');
  let isLoading = $state(false);
  let loadingPhrase = $state(LOADING_PHRASES[0]);
  let result: VibeDecodeResult | null = $state(null);
  let showResults = $state(false);
  let hasError = $state(false);
  let copiedSection = $state<string | null>(null);

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

  function isValidUrlish(input: string): boolean {
    const cleaned = input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    return cleaned.length > 2 && cleaned.includes('.') && /^[a-z0-9.\-]+\.[a-z]{2,}$/.test(cleaned);
  }

  async function handleSubmit() {
    if (!isValidUrlish(urlInput)) {
      hasError = true;
      return;
    }

    hasError = false;
    isLoading = true;
    showResults = false;
    result = null;
    startLoadingPhrases();

    try {
      result = await decodeVibe(urlInput);
      showResults = true;
      // Scroll to top of results after render
      setTimeout(() => {
        document.querySelector('.results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } catch {
      hasError = true;
    } finally {
      isLoading = false;
      stopLoadingPhrases();
    }
  }

  function handleSampleClick(url: string) {
    urlInput = url;
    handleSubmit();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }

  function resetToInput() {
    showResults = false;
    result = null;
    urlInput = '';
    hasError = false;
  }

  async function regenerate() {
    if (!result) return;
    const current = result.prettyUrl;
    isLoading = true;
    showResults = false;
    result = null;
    startLoadingPhrases();
    try {
      result = await decodeVibe(current);
      showResults = true;
    } finally {
      isLoading = false;
      stopLoadingPhrases();
    }
  }

  async function copySection(sectionName: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedSection = sectionName;
      setTimeout(() => { copiedSection = null; }, 1500);
    } catch {
      // silently ignore clipboard failure
    }
  }

  function exportBrief() {
    if (!result) return;
    const r = result;
    const lines: string[] = [];
    lines.push(`VIBE DECODE BRIEF — ${r.prettyUrl}`);
    lines.push(`Signal ID: ${r.signalId}`);
    lines.push(`Decoded: ${new Date(r.timestamp).toLocaleString()}`);
    lines.push('');
    lines.push('— ATMOSPHERE READ —');
    lines.push(r.atmosphereRead.oneLiner);
    lines.push(`Classification: ${r.atmosphereRead.vibeClassification} (confidence ${r.atmosphereRead.confidence}%)`);
    lines.push(r.atmosphereRead.dominantFeeling);
    lines.push('');
    lines.push('— EMOTIONAL TONE —');
    lines.push(r.emotionalTone.traits.join(' · '));
    lines.push('');
    lines.push('— DESIGN LANGUAGE —');
    lines.push(`Layout: ${r.designLanguage.layoutStyle}`);
    lines.push(`Typography: ${r.designLanguage.typography}`);
    lines.push(`Spacing: ${r.designLanguage.spacingDensity}`);
    lines.push(`Imagery: ${r.designLanguage.imageryStrategy}`);
    lines.push(`Interaction: ${r.designLanguage.interactionFeel}`);
    lines.push(`Motion: ${r.designLanguage.motionPersonality}`);
    lines.push(`UI Polish: ${r.designLanguage.uiPolish}`);
    lines.push('');
    lines.push('— BRAND SIGNAL —');
    lines.push(`Archetype: ${r.brandSignal.companyArchetype}`);
    lines.push(`Audience: ${r.brandSignal.audience}`);
    lines.push(`Trust/Authority: ${r.brandSignal.trustAuthority}`);
    lines.push(`Market Position: ${r.brandSignal.marketPosition}`);
    lines.push('');
    lines.push('— VISUAL BREAKDOWN —');
    lines.push(`Color: ${r.visualBreakdown.colorPhilosophy}`);
    lines.push(`Contrast: ${r.visualBreakdown.contrastBehavior}`);
    lines.push(`Whitespace: ${r.visualBreakdown.whitespaceUse}`);
    lines.push(`Surfaces: ${r.visualBreakdown.surfaceStyle}`);
    lines.push(`Icons: ${r.visualBreakdown.iconStyle}`);
    lines.push(`Hierarchy: ${r.visualBreakdown.hierarchyClarity}`);
    lines.push(`Craft Level: ${r.visualBreakdown.craftLevel}`);
    lines.push('');
    lines.push('— STRATEGIC INTERPRETATION —');
    lines.push(`Intended feeling: ${r.strategicInterpretation.intendedFeeling}`);
    lines.push('Doing well:');
    r.strategicInterpretation.doingWell.forEach((x) => lines.push(`  · ${x}`));
    lines.push('Overdoing:');
    r.strategicInterpretation.overdoing.forEach((x) => lines.push(`  · ${x}`));
    lines.push(`Why it works: ${r.strategicInterpretation.whyItWorks}`);
    lines.push('');
    lines.push('— BORROW —');
    r.borrowAvoid.borrow.forEach((x) => lines.push(`  · ${x}`));
    lines.push('— AVOID —');
    r.borrowAvoid.avoid.forEach((x) => lines.push(`  · ${x}`));
    lines.push('');
    lines.push('— REBUILD DIRECTION —');
    lines.push(`Type: ${r.rebuildDirection.type}`);
    lines.push(`Spacing: ${r.rebuildDirection.spacing}`);
    lines.push(`Surfaces: ${r.rebuildDirection.surfaces}`);
    lines.push(`Motion: ${r.rebuildDirection.motion}`);
    lines.push(`Content tone: ${r.rebuildDirection.contentTone}`);
    lines.push(`Conversion: ${r.rebuildDirection.conversionStyle}`);
    lines.push('');
    lines.push('— SCORECARD —');
    Object.entries(r.scorecard).forEach(([k, v]) => lines.push(`  ${k.padEnd(16)} ${v}/100`));
    lines.push('');
    lines.push(`Decoded by Yuxbi · Vibe Decode · ${r.signalId}`);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vibe-decode-${r.prettyUrl.replace(/\./g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const scoreLabels: Record<string, string> = {
    clarity: 'Clarity',
    originality: 'Originality',
    polish: 'Polish',
    warmth: 'Warmth',
    authority: 'Authority',
    distinctiveness: 'Distinctiveness',
    trust: 'Trust',
    memorability: 'Memorability'
  };
</script>

<svelte:head>
  <title>Vibe Decode — Yuxbi</title>
  <meta name="description" content="Paste any URL. Receive a full atmospheric reading of its design language. A creative design-analysis experiment by Yuxbi." />
  <meta property="og:title" content="Vibe Decode — Yuxbi" />
  <meta property="og:description" content="Paste any URL. Receive a full atmospheric reading of its design language." />
  <meta name="theme-color" content="#fff6df" />
</svelte:head>

<Nav />

<main class="vibe-decode">
  <!-- App Header -->
  <div class="app-header">
    <div class="container">
      <a href="/" class="back-link">
        <span class="back-arrow">←</span>
        <span>Back to Lab</span>
      </a>
      <div class="app-meta">
        <span class="app-codename">ECHO-14</span>
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
          <div class="doodle-icon" aria-hidden="true">
            <svg viewBox="0 0 80 80" fill="none">
              <!-- Radar dish doodle -->
              <circle cx="40" cy="40" r="28" stroke="#2047af" stroke-width="3"/>
              <circle cx="40" cy="40" r="18" stroke="#3568eb" stroke-width="2.5" stroke-dasharray="3 4"/>
              <circle cx="40" cy="40" r="8" fill="#f76db8" stroke="#2047af" stroke-width="2.5"/>
              <path d="M40 40L64 22" stroke="#2047af" stroke-width="3" stroke-linecap="round"/>
              <circle cx="64" cy="22" r="3" fill="#3568eb"/>
            </svg>
          </div>

          <h1 class="app-title">Vibe Decode</h1>
          <p class="app-subtitle">
            Paste any URL. Receive a full atmospheric reading of its design language —
            what it feels like, who it is signaling to, and why.
          </p>

          {#if !isLoading}
            <div class="input-group" class:error={hasError}>
              <span class="input-prefix" aria-hidden="true">https://</span>
              <input
                type="text"
                bind:value={urlInput}
                onkeydown={handleKeydown}
                placeholder="paste a full URL"
                class="url-input"
                aria-label="Website URL"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
              />
              <button class="submit-btn" onclick={handleSubmit} disabled={!urlInput.trim()}>
                Decode Vibe
              </button>
            </div>
            {#if hasError}
              <p class="error-text">Enter a valid URL (e.g. stripe.com or https://stripe.com)</p>
            {/if}

            <div class="sample-urls">
              <span class="sample-label">Try:</span>
              {#each SAMPLE_URLS as url}
                <button class="sample-chip" onclick={() => handleSampleClick(url)}>
                  {url}
                </button>
              {/each}
            </div>
          {:else}
            <div class="loading-state">
              <div class="radar-sweep" aria-hidden="true">
                <svg viewBox="0 0 140 140" fill="none">
                  <circle cx="70" cy="70" r="60" stroke="rgba(31,47,86,0.08)" stroke-width="2"/>
                  <circle cx="70" cy="70" r="44" stroke="rgba(31,47,86,0.08)" stroke-width="1.5"/>
                  <circle cx="70" cy="70" r="28" stroke="rgba(31,47,86,0.08)" stroke-width="1.5"/>
                  <circle cx="70" cy="70" r="4" fill="var(--color-accent)"/>
                  <g class="sweep-arm">
                    <line x1="70" y1="70" x2="70" y2="10" stroke="var(--color-accent)" stroke-width="2" stroke-linecap="round"/>
                    <path d="M70 70L70 10 A60 60 0 0 1 114 34 Z" fill="var(--color-accent)" opacity="0.14"/>
                  </g>
                  <circle class="ping ping-1" cx="70" cy="70" r="6" fill="none" stroke="var(--color-secondary)" stroke-width="2"/>
                  <circle class="ping ping-2" cx="70" cy="70" r="6" fill="none" stroke="var(--color-accent)" stroke-width="2"/>
                </svg>
              </div>
              <p class="loading-url">{urlInput}</p>
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
            <span class="result-url">{result.prettyUrl}</span>
          </div>
          <div class="results-actions">
            <button class="action-btn" onclick={regenerate} title="Regenerate reading">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true">
                <path d="M4 10a6 6 0 0 1 10.5-4M16 10a6 6 0 0 1-10.5 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M14 3v3.5H10.5M6 17v-3.5H9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Regenerate
            </button>
            <button class="action-btn" onclick={exportBrief} title="Export as creative brief">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true">
                <path d="M10 3v10M6 10l4 4 4-4M4 17h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Export Brief
            </button>
            <button class="new-scan-btn" onclick={resetToInput}>
              <span>←</span> New Decode
            </button>
          </div>
        </div>

        <div class="results-body">
          <!-- Main content column -->
          <div class="results-main">
            <!-- 1. Atmosphere Read -->
            <div class="result-section">
              <div class="section-head">
                <span class="section-tag">01 · Atmosphere Read</span>
                <button
                  class="copy-btn"
                  onclick={() => copySection('atmosphere', `${result!.atmosphereRead.oneLiner}\n\n${result!.atmosphereRead.dominantFeeling}`)}
                  title="Copy section"
                  aria-label="Copy atmosphere read"
                >
                  {copiedSection === 'atmosphere' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p class="one-liner">"{result.atmosphereRead.oneLiner}"</p>
              <div class="atmosphere-grid">
                <div class="atmosphere-main">
                  <div class="atmosphere-classification">
                    <span class="mini-label">Vibe Classification</span>
                    <span class="classification-value">{result.atmosphereRead.vibeClassification}</span>
                  </div>
                  <p class="dominant-feeling">{result.atmosphereRead.dominantFeeling}</p>
                </div>
                <div class="confidence-meter">
                  <div class="confidence-ring">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="rgba(31,47,86,0.1)" stroke-width="8" fill="none"/>
                      <circle
                        cx="50" cy="50" r="40"
                        stroke="var(--color-accent)"
                        stroke-width="8"
                        fill="none"
                        stroke-linecap="round"
                        stroke-dasharray={`${(result.atmosphereRead.confidence / 100) * 251.3} 251.3`}
                        class="confidence-fill"
                      />
                    </svg>
                    <div class="confidence-value">{result.atmosphereRead.confidence}</div>
                  </div>
                  <div class="confidence-label">Confidence</div>
                </div>
              </div>
            </div>

            <!-- 2. Emotional Tone -->
            <div class="result-section">
              <div class="section-head">
                <span class="section-tag">02 · Emotional Tone</span>
                <button
                  class="copy-btn"
                  onclick={() => copySection('tone', result!.emotionalTone.traits.join(' · '))}
                  aria-label="Copy emotional tone"
                >
                  {copiedSection === 'tone' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p class="section-lead">The mood traits the site projects on first read.</p>
              <div class="traits-grid">
                {#each result.emotionalTone.traits as trait}
                  <span class="trait-chip">{trait}</span>
                {/each}
              </div>
            </div>

            <!-- 3. Design Language -->
            <div class="result-section">
              <div class="section-head">
                <span class="section-tag">03 · Design Language</span>
                <button
                  class="copy-btn"
                  onclick={() => copySection('design', `Layout: ${result!.designLanguage.layoutStyle}\nTypography: ${result!.designLanguage.typography}\nSpacing: ${result!.designLanguage.spacingDensity}\nImagery: ${result!.designLanguage.imageryStrategy}\nInteraction: ${result!.designLanguage.interactionFeel}\nMotion: ${result!.designLanguage.motionPersonality}\nPolish: ${result!.designLanguage.uiPolish}`)}
                  aria-label="Copy design language"
                >
                  {copiedSection === 'design' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Layout</span>
                  <p class="detail-value">{result.designLanguage.layoutStyle}</p>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Typography</span>
                  <p class="detail-value">{result.designLanguage.typography}</p>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Spacing &amp; Density</span>
                  <p class="detail-value">{result.designLanguage.spacingDensity}</p>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Imagery</span>
                  <p class="detail-value">{result.designLanguage.imageryStrategy}</p>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Interaction</span>
                  <p class="detail-value">{result.designLanguage.interactionFeel}</p>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Motion</span>
                  <p class="detail-value">{result.designLanguage.motionPersonality}</p>
                </div>
                <div class="detail-item detail-item-wide">
                  <span class="detail-label">UI Polish</span>
                  <p class="detail-value">{result.designLanguage.uiPolish}</p>
                </div>
              </div>
            </div>

            <!-- 4. Brand Signal -->
            <div class="result-section">
              <div class="section-head">
                <span class="section-tag">04 · Brand Signal</span>
                <button
                  class="copy-btn"
                  onclick={() => copySection('brand', `Archetype: ${result!.brandSignal.companyArchetype}\nAudience: ${result!.brandSignal.audience}\nTrust: ${result!.brandSignal.trustAuthority}\nPosition: ${result!.brandSignal.marketPosition}`)}
                  aria-label="Copy brand signal"
                >
                  {copiedSection === 'brand' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div class="brand-layout">
                <div class="brand-main">
                  <div class="detail-item">
                    <span class="detail-label">Company Archetype</span>
                    <p class="detail-value">{result.brandSignal.companyArchetype}</p>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Audience</span>
                    <p class="detail-value">{result.brandSignal.audience}</p>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Trust &amp; Authority</span>
                    <p class="detail-value">{result.brandSignal.trustAuthority}</p>
                  </div>
                </div>
                <div class="position-tile">
                  <span class="position-label">Market Position</span>
                  <span class="position-value" data-position={result.brandSignal.marketPosition}>
                    {result.brandSignal.marketPosition}
                  </span>
                  <div class="position-scale">
                    {#each ['mass', 'mid', 'premium', 'luxury', 'niche'] as tier}
                      <span class="position-tier" class:active={tier === result.brandSignal.marketPosition}>{tier}</span>
                    {/each}
                  </div>
                </div>
              </div>
            </div>

            <!-- 5. Visual Breakdown -->
            <div class="result-section">
              <div class="section-head">
                <span class="section-tag">05 · Visual Breakdown</span>
                <button
                  class="copy-btn"
                  onclick={() => copySection('visual', `Color: ${result!.visualBreakdown.colorPhilosophy}\nContrast: ${result!.visualBreakdown.contrastBehavior}\nWhitespace: ${result!.visualBreakdown.whitespaceUse}\nSurfaces: ${result!.visualBreakdown.surfaceStyle}\nIcons: ${result!.visualBreakdown.iconStyle}\nHierarchy: ${result!.visualBreakdown.hierarchyClarity}\nCraft: ${result!.visualBreakdown.craftLevel}`)}
                  aria-label="Copy visual breakdown"
                >
                  {copiedSection === 'visual' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Color Philosophy</span>
                  <p class="detail-value">{result.visualBreakdown.colorPhilosophy}</p>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Contrast Behavior</span>
                  <p class="detail-value">{result.visualBreakdown.contrastBehavior}</p>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Whitespace</span>
                  <p class="detail-value">{result.visualBreakdown.whitespaceUse}</p>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Surfaces</span>
                  <p class="detail-value">{result.visualBreakdown.surfaceStyle}</p>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Icons</span>
                  <p class="detail-value">{result.visualBreakdown.iconStyle}</p>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Hierarchy Clarity</span>
                  <p class="detail-value">{result.visualBreakdown.hierarchyClarity}</p>
                </div>
              </div>
              <div class="craft-level">
                <span class="detail-label">Craft Level</span>
                <div class="craft-bar">
                  {#each ['template-feel', 'semi-custom', 'custom-crafted', 'bespoke'] as level}
                    <div class="craft-tick" class:active={level === result.visualBreakdown.craftLevel}>
                      <span class="craft-dot"></span>
                      <span class="craft-label">{level.replace('-', ' ')}</span>
                    </div>
                  {/each}
                </div>
              </div>
            </div>

            <!-- 6. Strategic Interpretation -->
            <div class="result-section">
              <div class="section-head">
                <span class="section-tag">06 · Strategic Interpretation</span>
                <button
                  class="copy-btn"
                  onclick={() => copySection('strategy', `Intended feeling: ${result!.strategicInterpretation.intendedFeeling}\n\nDoing well:\n${result!.strategicInterpretation.doingWell.map(x => '- ' + x).join('\n')}\n\nOverdoing:\n${result!.strategicInterpretation.overdoing.map(x => '- ' + x).join('\n')}\n\nWhy it works: ${result!.strategicInterpretation.whyItWorks}`)}
                  aria-label="Copy strategic interpretation"
                >
                  {copiedSection === 'strategy' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div class="detail-item detail-item-intended">
                <span class="detail-label">Intended Feeling</span>
                <p class="detail-value detail-value-lead">{result.strategicInterpretation.intendedFeeling}</p>
              </div>
              <div class="strategy-lists">
                <div class="strategy-list strategy-list-plus">
                  <h4 class="strategy-title">Doing well</h4>
                  <ul>
                    {#each result.strategicInterpretation.doingWell as item}
                      <li>{item}</li>
                    {/each}
                  </ul>
                </div>
                <div class="strategy-list strategy-list-minus">
                  <h4 class="strategy-title">Overdoing</h4>
                  <ul>
                    {#each result.strategicInterpretation.overdoing as item}
                      <li>{item}</li>
                    {/each}
                  </ul>
                </div>
              </div>
              <div class="why-it-works">
                <span class="detail-label">Why it works</span>
                <p class="detail-value">{result.strategicInterpretation.whyItWorks}</p>
              </div>
            </div>

            <!-- 7. Borrow / Avoid -->
            <div class="result-section">
              <div class="section-head">
                <span class="section-tag">07 · Borrow / Avoid</span>
                <button
                  class="copy-btn"
                  onclick={() => copySection('borrow', `Borrow:\n${result!.borrowAvoid.borrow.map(x => '- ' + x).join('\n')}\n\nAvoid:\n${result!.borrowAvoid.avoid.map(x => '- ' + x).join('\n')}`)}
                  aria-label="Copy borrow and avoid"
                >
                  {copiedSection === 'borrow' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div class="borrow-avoid-grid">
                <div class="borrow-column">
                  <div class="column-head column-head-borrow">
                    <span class="column-badge">Borrow</span>
                    <span class="column-hint">Worth lifting — carefully</span>
                  </div>
                  <ol class="numbered-list">
                    {#each result.borrowAvoid.borrow as item, i}
                      <li>
                        <span class="list-number">{String(i + 1).padStart(2, '0')}</span>
                        <span class="list-text">{item}</span>
                      </li>
                    {/each}
                  </ol>
                </div>
                <div class="avoid-column">
                  <div class="column-head column-head-avoid">
                    <span class="column-badge column-badge-avoid">Avoid</span>
                    <span class="column-hint">Do not copy blindly</span>
                  </div>
                  <ol class="numbered-list">
                    {#each result.borrowAvoid.avoid as item, i}
                      <li>
                        <span class="list-number list-number-avoid">{String(i + 1).padStart(2, '0')}</span>
                        <span class="list-text">{item}</span>
                      </li>
                    {/each}
                  </ol>
                </div>
              </div>
            </div>

            <!-- 8. Rebuild Direction -->
            <div class="result-section">
              <div class="section-head">
                <span class="section-tag">08 · Rebuild Direction</span>
                <button
                  class="copy-btn"
                  onclick={() => copySection('rebuild', Object.entries(result!.rebuildDirection).map(([k, v]) => `${k}: ${v}`).join('\n'))}
                  aria-label="Copy rebuild direction"
                >
                  {copiedSection === 'rebuild' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p class="section-lead">If you wanted to build a site with a similar feel, focus here:</p>
              <div class="rebuild-grid">
                <div class="rebuild-item">
                  <span class="rebuild-key">Type</span>
                  <p class="rebuild-value">{result.rebuildDirection.type}</p>
                </div>
                <div class="rebuild-item">
                  <span class="rebuild-key">Spacing</span>
                  <p class="rebuild-value">{result.rebuildDirection.spacing}</p>
                </div>
                <div class="rebuild-item">
                  <span class="rebuild-key">Surfaces</span>
                  <p class="rebuild-value">{result.rebuildDirection.surfaces}</p>
                </div>
                <div class="rebuild-item">
                  <span class="rebuild-key">Motion</span>
                  <p class="rebuild-value">{result.rebuildDirection.motion}</p>
                </div>
                <div class="rebuild-item">
                  <span class="rebuild-key">Content tone</span>
                  <p class="rebuild-value">{result.rebuildDirection.contentTone}</p>
                </div>
                <div class="rebuild-item">
                  <span class="rebuild-key">Conversion</span>
                  <p class="rebuild-value">{result.rebuildDirection.conversionStyle}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sticky scorecard rail -->
          <aside class="results-rail">
            <div class="scorecard">
              <div class="scorecard-head">
                <span class="scorecard-tag">Scorecard</span>
                <span class="scorecard-sub">Signal reading</span>
              </div>
              <ul class="scorecard-list">
                {#each Object.entries(result.scorecard) as [key, value]}
                  <li class="score-row">
                    <span class="score-label">{scoreLabels[key] ?? key}</span>
                    <div class="score-bar">
                      <div class="score-fill" style="width: {value}%"></div>
                    </div>
                    <span class="score-value">{value}</span>
                  </li>
                {/each}
              </ul>
            </div>

            <div class="rail-cta">
              <p class="rail-cta-title">Turn this into a creative brief</p>
              <p class="rail-cta-body">Export all eight sections as a shareable plain-text brief.</p>
              <button class="rail-cta-btn" onclick={exportBrief}>
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true">
                  <path d="M10 3v10M6 10l4 4 4-4M4 17h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Export Brief
              </button>
            </div>
          </aside>
        </div>

        <!-- Footer note -->
        <div class="result-footer-note">
          <span class="result-footer-label">Decoded by Yuxbi</span>
          <span class="result-footer-sep">·</span>
          <span class="result-footer-id">Signal {result.signalId}</span>
          <span class="result-footer-sep">·</span>
          <span class="result-footer-ts">{new Date(result.timestamp).toLocaleString()}</span>
        </div>
      </div>
    </section>
  {/if}
</main>

<Footer />

<style>
  .vibe-decode {
    min-height: calc(100dvh - 80px);
    padding-top: var(--space-16);
  }

  /* --- App Header --- */
  .app-header {
    padding: var(--space-6) 0 var(--space-4);
    border-bottom: 1px solid rgba(31, 47, 86, 0.08);
  }

  .app-header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    transition: all 0.2s var(--ease-elastic);
  }

  .back-link:hover {
    color: var(--color-accent);
    transform: translateX(-3px);
  }

  .back-arrow {
    display: inline-block;
    transition: transform 0.2s var(--ease-elastic);
  }

  .back-link:hover .back-arrow {
    transform: translateX(-2px);
  }

  .app-meta {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .app-codename {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .app-status {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-signal-active);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: var(--space-1) var(--space-3);
    border: 1px solid rgba(27, 182, 115, 0.28);
    border-radius: var(--radius-full);
    background: rgba(27, 182, 115, 0.08);
  }

  .status-dot {
    width: 7px;
    height: 7px;
    background: var(--color-signal-active);
    border-radius: var(--radius-full);
    animation: statusPulse 2s ease-in-out infinite;
  }

  @keyframes statusPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.55; transform: scale(0.88); }
  }

  /* --- Input Section --- */
  .input-section {
    padding: clamp(var(--space-16), 10vw, var(--space-24)) 0;
    min-height: 70vh;
    display: flex;
    align-items: center;
  }

  .input-hero {
    max-width: 640px;
    margin: 0 auto;
    text-align: center;
    transition: opacity 0.3s ease;
  }

  .doodle-icon {
    width: 84px;
    height: 84px;
    margin: 0 auto var(--space-8);
    padding: var(--space-3);
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    display: grid;
    place-items: center;
    animation: doodleFloat 4.5s ease-in-out infinite;
  }

  @keyframes doodleFloat {
    0%, 100% { transform: translateY(0) rotate(-1deg); }
    50% { transform: translateY(-4px) rotate(1deg); }
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
    max-width: 520px;
    margin-inline: auto;
  }

  .input-group {
    display: flex;
    align-items: stretch;
    gap: 0;
    max-width: 580px;
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

  .input-prefix {
    display: inline-flex;
    align-items: center;
    padding-left: var(--space-5);
    padding-right: var(--space-1);
    font-family: var(--font-display);
    font-size: var(--text-base);
    color: var(--color-text-faint);
    letter-spacing: 0;
  }

  .url-input {
    flex: 1;
    padding: var(--space-4) var(--space-3) var(--space-4) var(--space-2);
    border: none;
    background: transparent;
    font-family: var(--font-display);
    font-size: var(--text-base);
    color: var(--color-text-bright);
    outline: none;
    min-width: 0;
  }

  .url-input::placeholder {
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

  .sample-urls {
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

  .radar-sweep {
    width: 140px;
    height: 140px;
    position: relative;
  }

  .radar-sweep svg {
    width: 100%;
    height: 100%;
  }

  .sweep-arm {
    transform-origin: 70px 70px;
    animation: sweepRotate 2.6s linear infinite;
  }

  @keyframes sweepRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .ping {
    opacity: 0;
    transform-origin: 70px 70px;
    animation: pingOut 2.6s ease-out infinite;
  }

  .ping-1 { animation-delay: 0.2s; }
  .ping-2 { animation-delay: 1.3s; }

  @keyframes pingOut {
    0% { opacity: 0.8; r: 4; }
    80% { opacity: 0; r: 58; }
    100% { opacity: 0; r: 58; }
  }

  .loading-url {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text-bright);
    word-break: break-all;
    max-width: 90%;
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
    gap: var(--space-4);
    margin-bottom: var(--space-10);
    padding-bottom: var(--space-6);
    border-bottom: 2px solid rgba(31, 47, 86, 0.1);
    flex-wrap: wrap;
  }

  .results-meta {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    flex-wrap: wrap;
    min-width: 0;
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
    white-space: nowrap;
  }

  .result-url {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--color-text-bright);
    word-break: break-all;
  }

  .results-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .action-btn,
  .new-scan-btn {
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
    transition: all 0.2s var(--ease-elastic);
    box-shadow: 0 3px 0 rgba(31, 47, 86, 0.08);
  }

  .action-btn:hover,
  .new-scan-btn:hover {
    border-color: rgba(53, 104, 235, 0.3);
    color: var(--color-accent);
    transform: translateY(-2px);
    box-shadow: 0 5px 0 rgba(31, 47, 86, 0.1);
  }

  /* --- Results Layout --- */
  .results-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: var(--space-10);
    align-items: start;
  }

  .results-main {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
    min-width: 0;
  }

  .results-rail {
    position: sticky;
    top: calc(var(--space-20) + var(--space-4));
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  /* --- Result Sections --- */
  .result-section {
    padding: var(--space-8);
    border: 2px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-xl);
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
    animation: resultFadeIn 0.5s var(--ease-out) both;
  }

  .result-section:nth-child(1) { animation-delay: 0.02s; }
  .result-section:nth-child(2) { animation-delay: 0.07s; }
  .result-section:nth-child(3) { animation-delay: 0.12s; }
  .result-section:nth-child(4) { animation-delay: 0.17s; }
  .result-section:nth-child(5) { animation-delay: 0.22s; }
  .result-section:nth-child(6) { animation-delay: 0.27s; }
  .result-section:nth-child(7) { animation-delay: 0.32s; }
  .result-section:nth-child(8) { animation-delay: 0.37s; }

  @keyframes resultFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
  }

  .section-tag {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-accent);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: var(--space-1) var(--space-3);
    border: 1px solid rgba(53, 104, 235, 0.2);
    border-radius: var(--radius-full);
    display: inline-block;
    background: rgba(53, 104, 235, 0.04);
  }

  .copy-btn {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    padding: var(--space-1) var(--space-3);
    border: 1px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-full);
    background: transparent;
    cursor: pointer;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: all 0.2s var(--ease-elastic);
  }

  .copy-btn:hover {
    color: var(--color-accent);
    border-color: rgba(53, 104, 235, 0.28);
    background: rgba(53, 104, 235, 0.04);
  }

  .section-lead {
    font-size: var(--text-sm);
    color: var(--color-text-faint);
    margin-bottom: var(--space-5);
    line-height: 1.6;
  }

  /* --- Atmosphere Read --- */
  .one-liner {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--color-text-bright);
    line-height: 1.35;
    margin-bottom: var(--space-6);
    letter-spacing: -0.01em;
    padding-left: var(--space-4);
    border-left: 3px solid var(--color-accent);
  }

  .atmosphere-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-8);
    align-items: start;
  }

  .mini-label {
    display: block;
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: var(--space-2);
  }

  .atmosphere-classification {
    margin-bottom: var(--space-5);
  }

  .classification-value {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text-bright);
  }

  .dominant-feeling {
    font-size: var(--text-base);
    color: var(--color-text-muted);
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
    transition: stroke-dasharray 1.2s var(--ease-out);
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
    letter-spacing: 0.08em;
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

  /* --- Detail grid (Design Language, Visual Breakdown) --- */
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-5) var(--space-8);
  }

  .detail-item-wide {
    grid-column: 1 / -1;
  }

  .detail-item {
    min-width: 0;
  }

  .detail-label {
    display: block;
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: var(--space-2);
  }

  .detail-value {
    font-size: var(--text-sm);
    color: var(--color-text);
    line-height: 1.65;
  }

  .detail-value-lead {
    font-size: var(--text-base);
    color: var(--color-text-muted);
  }

  /* --- Brand Signal --- */
  .brand-layout {
    display: grid;
    grid-template-columns: 1fr 200px;
    gap: var(--space-8);
    align-items: start;
  }

  .brand-main {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .position-tile {
    padding: var(--space-5);
    border: 2px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-lg);
    background: rgba(247, 109, 184, 0.06);
    text-align: center;
  }

  .position-label {
    display: block;
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: var(--space-3);
  }

  .position-value {
    display: block;
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--color-text-bright);
    text-transform: capitalize;
    margin-bottom: var(--space-4);
  }

  .position-scale {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    font-family: var(--font-display);
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-text-faint);
    padding-top: var(--space-3);
    border-top: 1px dashed rgba(31, 47, 86, 0.16);
  }

  .position-tier {
    padding: var(--space-1) 0;
    transition: all 0.2s ease;
  }

  .position-tier.active {
    color: var(--color-secondary);
    font-weight: 700;
    letter-spacing: 0.16em;
  }

  /* --- Craft Level --- */
  .craft-level {
    margin-top: var(--space-8);
    padding-top: var(--space-6);
    border-top: 1px dashed rgba(31, 47, 86, 0.14);
  }

  .craft-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-2);
    margin-top: var(--space-4);
    position: relative;
  }

  .craft-bar::before {
    content: '';
    position: absolute;
    top: 7px;
    left: 8%;
    right: 8%;
    height: 2px;
    background: rgba(31, 47, 86, 0.14);
    z-index: 0;
  }

  .craft-tick {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    position: relative;
    z-index: 1;
  }

  .craft-dot {
    width: 16px;
    height: 16px;
    border-radius: var(--radius-full);
    background: var(--color-surface);
    border: 2px solid rgba(31, 47, 86, 0.28);
    transition: all 0.3s var(--ease-elastic);
  }

  .craft-tick.active .craft-dot {
    background: var(--color-accent);
    border-color: var(--color-accent);
    transform: scale(1.25);
    box-shadow: 0 0 0 4px rgba(53, 104, 235, 0.14);
  }

  .craft-label {
    font-family: var(--font-display);
    font-size: 0.7rem;
    color: var(--color-text-faint);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
  }

  .craft-tick.active .craft-label {
    color: var(--color-accent);
    font-weight: 600;
  }

  /* --- Strategic Interpretation --- */
  .detail-item-intended {
    padding: var(--space-5);
    background: rgba(53, 104, 235, 0.04);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-6);
  }

  .strategy-lists {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
    margin-bottom: var(--space-6);
  }

  .strategy-title {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text-bright);
    margin-bottom: var(--space-3);
    padding-bottom: var(--space-2);
    border-bottom: 2px solid rgba(31, 47, 86, 0.1);
  }

  .strategy-list-plus .strategy-title {
    border-bottom-color: var(--color-signal-active);
  }

  .strategy-list-minus .strategy-title {
    border-bottom-color: var(--color-signal-pending);
  }

  .strategy-list ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .strategy-list li {
    font-size: var(--text-sm);
    color: var(--color-text);
    line-height: 1.6;
    padding-left: var(--space-5);
    position: relative;
  }

  .strategy-list li::before {
    position: absolute;
    left: 0;
    top: 0.15em;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: var(--text-base);
    line-height: 1;
  }

  .strategy-list-plus li::before {
    content: '+';
    color: var(--color-signal-active);
  }

  .strategy-list-minus li::before {
    content: '–';
    color: var(--color-signal-pending);
  }

  .why-it-works {
    padding: var(--space-5);
    border: 1px dashed rgba(31, 47, 86, 0.18);
    border-radius: var(--radius-lg);
  }

  /* --- Borrow / Avoid --- */
  .borrow-avoid-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }

  .borrow-column,
  .avoid-column {
    padding: var(--space-5);
    border-radius: var(--radius-lg);
    border: 2px solid;
  }

  .borrow-column {
    background: rgba(27, 182, 115, 0.05);
    border-color: rgba(27, 182, 115, 0.22);
  }

  .avoid-column {
    background: rgba(247, 109, 184, 0.05);
    border-color: rgba(247, 109, 184, 0.22);
  }

  .column-head {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-3);
    border-bottom: 1px dashed rgba(31, 47, 86, 0.14);
  }

  .column-badge {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    background: rgba(27, 182, 115, 0.15);
    color: #0e7a4c;
  }

  .column-badge-avoid {
    background: rgba(247, 109, 184, 0.15);
    color: #b54086;
  }

  .column-hint {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    letter-spacing: 0.04em;
  }

  .numbered-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .numbered-list li {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-3);
    align-items: baseline;
  }

  .list-number {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--color-signal-active);
    letter-spacing: 0.08em;
  }

  .list-number-avoid {
    color: var(--color-secondary);
  }

  .list-text {
    font-size: var(--text-sm);
    color: var(--color-text);
    line-height: 1.6;
  }

  /* --- Rebuild Direction --- */
  .rebuild-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-5);
  }

  .rebuild-item {
    padding: var(--space-4);
    background: rgba(53, 104, 235, 0.04);
    border: 1px dashed rgba(53, 104, 235, 0.24);
    border-radius: var(--radius-md);
  }

  .rebuild-key {
    display: block;
    font-family: var(--font-display);
    font-size: 0.7rem;
    color: var(--color-accent);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: var(--space-2);
  }

  .rebuild-value {
    font-size: var(--text-sm);
    color: var(--color-text);
    line-height: 1.6;
  }

  /* --- Scorecard Rail --- */
  .scorecard {
    padding: var(--space-6);
    border: 2px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-xl);
    background: var(--color-surface);
    box-shadow: var(--shadow-md);
  }

  .scorecard-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: var(--space-5);
    padding-bottom: var(--space-4);
    border-bottom: 2px dashed rgba(31, 47, 86, 0.1);
  }

  .scorecard-tag {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-accent);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 700;
  }

  .scorecard-sub {
    font-family: var(--font-display);
    font-size: 0.68rem;
    color: var(--color-text-faint);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .scorecard-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .score-row {
    display: grid;
    grid-template-columns: 108px 1fr 28px;
    align-items: center;
    gap: var(--space-3);
  }

  .score-label {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    letter-spacing: 0.04em;
  }

  .score-bar {
    height: 6px;
    background: rgba(31, 47, 86, 0.08);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .score-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-accent), var(--color-secondary));
    border-radius: var(--radius-full);
    animation: scoreGrow 0.8s var(--ease-out) both;
    transform-origin: left;
  }

  @keyframes scoreGrow {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }

  .score-value {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--color-text-bright);
    text-align: right;
  }

  .rail-cta {
    padding: var(--space-5);
    border: 2px dashed rgba(53, 104, 235, 0.28);
    border-radius: var(--radius-xl);
    background: rgba(53, 104, 235, 0.04);
    text-align: left;
  }

  .rail-cta-title {
    font-family: var(--font-display);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--color-text-bright);
    margin-bottom: var(--space-2);
    line-height: 1.3;
  }

  .rail-cta-body {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: 1.55;
    margin-bottom: var(--space-4);
  }

  .rail-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 600;
    color: white;
    padding: var(--space-3) var(--space-5);
    background: var(--color-accent);
    border: none;
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: transform 0.2s var(--ease-elastic), background 0.2s ease;
    box-shadow: 0 3px 0 rgba(31, 47, 86, 0.18);
  }

  .rail-cta-btn:hover {
    background: #2a57d0;
    transform: translateY(-2px);
    box-shadow: 0 5px 0 rgba(31, 47, 86, 0.18);
  }

  /* --- Result Footer Note --- */
  .result-footer-note {
    margin-top: var(--space-10);
    padding-top: var(--space-6);
    border-top: 1px dashed rgba(31, 47, 86, 0.14);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
    font-family: var(--font-display);
    font-size: 0.7rem;
    color: var(--color-text-faint);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .result-footer-sep {
    opacity: 0.5;
  }

  /* --- Responsive --- */
  @media (max-width: 1024px) {
    .results-body {
      grid-template-columns: 1fr;
    }

    .results-rail {
      position: static;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-5);
    }
  }

  @media (max-width: 768px) {
    .vibe-decode {
      padding-top: var(--space-12);
    }

    .app-header .container {
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .input-hero {
      padding-inline: var(--space-2);
    }

    .input-group {
      flex-direction: column;
      border-radius: var(--radius-xl);
    }

    .input-prefix {
      display: none;
    }

    .url-input {
      padding: var(--space-4);
      text-align: center;
      border-bottom: 1px solid rgba(31, 47, 86, 0.1);
    }

    .submit-btn {
      width: 100%;
      padding: var(--space-4);
    }

    .result-section {
      padding: var(--space-6);
    }

    .section-head {
      flex-wrap: wrap;
    }

    .atmosphere-grid,
    .brand-layout {
      grid-template-columns: 1fr;
      gap: var(--space-6);
    }

    .confidence-meter {
      justify-self: center;
    }

    .position-tile {
      max-width: 260px;
      margin: 0 auto;
    }

    .detail-grid,
    .rebuild-grid,
    .strategy-lists,
    .borrow-avoid-grid {
      grid-template-columns: 1fr;
      gap: var(--space-5);
    }

    .craft-bar {
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .craft-bar::before {
      display: none;
    }

    .results-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .results-actions {
      width: 100%;
      justify-content: flex-start;
    }

    .results-rail {
      grid-template-columns: 1fr;
    }

    .score-row {
      grid-template-columns: 108px 1fr 24px;
    }
  }
</style>
