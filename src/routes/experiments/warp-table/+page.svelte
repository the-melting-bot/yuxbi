<script lang="ts">
  import Nav from '$lib/components/Nav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { parseInput, runPipeline, suggestedDefaults, quickPreview } from '$lib/data/warp-table/engine';
  import type { ParsedInput } from '$lib/data/warp-table/engine';
  import { SAMPLE_DATASETS, getSampleById } from '$lib/data/warp-table/samples';
  import { LOADING_PHRASES } from '$lib/data/warp-table/types';
  import type { TargetFormat, Transform, TransformKind, TransformResult } from '$lib/data/warp-table/types';

  // --- State ---
  let rawInput: string = $state('');
  let parsed: ParsedInput | null = $state<ParsedInput | null>(null);
  let parseError: string | null = $state<string | null>(null);
  let loadedSampleName: string | null = $state<string | null>(null);

  let isDragging = $state(false);
  let isProcessing = $state(false);
  let loadingPhrase = $state(LOADING_PHRASES[0]);
  let phraseInterval: ReturnType<typeof setInterval> | null = null;

  let target: TargetFormat = $state<TargetFormat>('json');
  let transforms: Transform[] = $state<Transform[]>([]);
  let result: TransformResult | null = $state<TransformResult | null>(null);

  let copied = $state(false);
  let copiedOutput = $state(false);

  // Field action modals (simple inline prompts)
  let renameFrom = $state('');
  let renameTo = $state('');
  let removeField = $state('');
  let reorderOrder = $state('');
  let keyByField = $state('');
  let groupByField = $state('');

  // Which transforms are active (for one-click toggleable ones)
  const simpleKinds: TransformKind[] = ['trim-whitespace', 'remove-duplicates', 'drop-empty-columns', 'normalize-headers', 'flatten'];

  let nextId = 1;

  function newTransform(kind: TransformKind, label: string, param?: string, params?: Record<string, string>): Transform {
    return { id: `t${nextId++}`, kind, label, param, params };
  }

  function hasTransform(kind: TransformKind): boolean {
    return transforms.some((t) => t.kind === kind);
  }

  function toggleTransform(kind: TransformKind, label: string) {
    if (hasTransform(kind)) {
      transforms = transforms.filter((t) => t.kind !== kind);
    } else {
      transforms = [...transforms, newTransform(kind, label)];
    }
    recomputeResult();
  }

  function removeTransform(id: string) {
    transforms = transforms.filter((t) => t.id !== id);
    recomputeResult();
  }

  function moveTransform(id: string, dir: -1 | 1) {
    const idx = transforms.findIndex((t) => t.id === id);
    if (idx < 0) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= transforms.length) return;
    const copy = [...transforms];
    [copy[idx], copy[swap]] = [copy[swap], copy[idx]];
    transforms = copy;
    recomputeResult();
  }

  // --- Loading phrases ---
  function startPhrases() {
    let i = 0;
    loadingPhrase = LOADING_PHRASES[0];
    phraseInterval = setInterval(() => {
      i = (i + 1) % LOADING_PHRASES.length;
      loadingPhrase = LOADING_PHRASES[i];
    }, 500);
  }
  function stopPhrases() {
    if (phraseInterval) clearInterval(phraseInterval);
    phraseInterval = null;
  }

  // --- Parsing / processing ---
  async function processInput() {
    if (!rawInput.trim()) {
      parsed = null;
      result = null;
      parseError = null;
      return;
    }
    isProcessing = true;
    startPhrases();
    // allow UI to paint the loading state
    await new Promise((r) => setTimeout(r, 220));
    try {
      const p = parseInput(rawInput);
      parsed = p;
      parseError = null;
      const defaults = suggestedDefaults(p);
      target = defaults.target;
      transforms = defaults.transforms.map((k) => newTransform(k, labelFor(k)));
      recomputeResult();
    } catch (e) {
      parsed = null;
      result = null;
      parseError = (e as Error).message;
    } finally {
      isProcessing = false;
      stopPhrases();
    }
  }

  function recomputeResult() {
    if (!parsed) {
      result = null;
      return;
    }
    try {
      result = runPipeline({
        records: parsed.records,
        transforms,
        target
      });
    } catch (e) {
      result = null;
      parseError = (e as Error).message;
    }
  }

  $effect(() => {
    // when target changes and we already have parsed input, recompute
    target;
    if (parsed) recomputeResult();
  });

  function labelFor(kind: TransformKind): string {
    switch (kind) {
      case 'flatten': return 'Flatten nested';
      case 'trim-whitespace': return 'Trim whitespace';
      case 'remove-duplicates': return 'Remove duplicate rows';
      case 'drop-empty-columns': return 'Drop empty columns';
      case 'normalize-headers': return 'Normalize headers';
      case 'rename-field': return 'Rename field';
      case 'remove-field': return 'Remove field';
      case 'reorder-fields': return 'Reorder fields';
      case 'key-by-field': return 'Key by field';
      case 'group-by-field': return 'Group by field';
    }
  }

  function loadSample(id: string) {
    const s = getSampleById(id);
    if (!s) return;
    rawInput = s.content;
    loadedSampleName = s.name;
    processInput();
  }

  function clearAll() {
    rawInput = '';
    parsed = null;
    result = null;
    parseError = null;
    transforms = [];
    loadedSampleName = null;
  }

  // --- Param-bearing transforms (add buttons) ---
  function addRename() {
    const from = renameFrom.trim();
    const to = renameTo.trim();
    if (!from || !to) return;
    transforms = [...transforms, newTransform('rename-field', `Rename "${from}" → "${to}"`, undefined, { from, to })];
    renameFrom = '';
    renameTo = '';
    recomputeResult();
  }
  function addRemoveField() {
    const f = removeField.trim();
    if (!f) return;
    transforms = [...transforms, newTransform('remove-field', `Remove "${f}"`, f)];
    removeField = '';
    recomputeResult();
  }
  function addReorder() {
    const o = reorderOrder.trim();
    if (!o) return;
    transforms = [...transforms, newTransform('reorder-fields', `Reorder: ${o}`, o)];
    reorderOrder = '';
    recomputeResult();
  }
  function addKeyBy() {
    const f = keyByField.trim();
    if (!f) return;
    transforms = [...transforms, newTransform('key-by-field', `Key by "${f}"`, f)];
    keyByField = '';
    recomputeResult();
  }
  function addGroupBy() {
    const f = groupByField.trim();
    if (!f) return;
    transforms = [...transforms, newTransform('group-by-field', `Group by "${f}"`, f)];
    groupByField = '';
    recomputeResult();
  }

  // --- Drag & drop ---
  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }
  function handleDragLeave() {
    isDragging = false;
  }
  async function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    await readFile(file);
  }
  async function handleFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    await readFile(file);
    input.value = '';
  }
  async function readFile(file: File) {
    const text = await file.text();
    rawInput = text;
    loadedSampleName = file.name;
    processInput();
  }

  // --- Exports ---
  async function copyInput() {
    try {
      await navigator.clipboard.writeText(rawInput);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {}
  }
  async function copyOutput() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.outputString);
      copiedOutput = true;
      setTimeout(() => (copiedOutput = false), 1500);
    } catch {}
  }
  function downloadOutput() {
    if (!result) return;
    const ext = result.targetFormat === 'csv' ? 'csv' : 'json';
    const mime = result.targetFormat === 'csv' ? 'text/csv' : 'application/json';
    const blob = new Blob([result.outputString], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const base = loadedSampleName?.replace(/\.[^.]+$/, '') ?? 'warp-table-output';
    a.download = `${base}-warped.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function handlePasteKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      processInput();
    }
  }

  // --- Derived helpers for display ---
  let previewString = $derived(result ? quickPreview(result.outputString) : '');
  let inputPreviewString = $derived(rawInput ? quickPreview(rawInput, 2400) : '');
  let fieldKeys = $derived(parsed ? parsed.structure.fields.map((f) => f.key) : []);
</script>

<svelte:head>
  <title>Warp Table — Yuxbi</title>
  <meta name="description" content="Drag data in one shape. It comes out another. A client-side data reshaping tool by Yuxbi." />
  <meta property="og:title" content="Warp Table — Yuxbi" />
  <meta property="og:description" content="Drag data in one shape. It comes out another. No instructions needed." />
  <meta name="theme-color" content="#fff6df" />
</svelte:head>

<Nav />

<main class="warp-table">
  <div class="app-header">
    <div class="container">
      <a href="/" class="back-link">
        <span class="back-arrow">←</span>
        <span>Back to Lab</span>
      </a>
      <div class="app-meta">
        <span class="app-codename">FLUX-22</span>
        <span class="app-status">
          <span class="status-dot"></span>
          Active
        </span>
      </div>
    </div>
  </div>

  {#if !parsed}
    <!-- Empty state / intake -->
    <section class="input-section">
      <div class="container">
        <div class="input-hero">
          <div class="doodle-icon" aria-hidden="true">
            <svg viewBox="0 0 80 80" fill="none">
              <!-- Warp table doodle -->
              <rect x="10" y="18" width="60" height="44" rx="4" stroke="#2047af" stroke-width="3"/>
              <line x1="10" y1="30" x2="70" y2="30" stroke="#2047af" stroke-width="2"/>
              <line x1="30" y1="18" x2="30" y2="62" stroke="#2047af" stroke-width="2"/>
              <line x1="50" y1="18" x2="50" y2="62" stroke="#2047af" stroke-width="2"/>
              <path d="M16 46 Q40 30 64 52" stroke="#f76db8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
              <circle cx="16" cy="46" r="3" fill="#3568eb"/>
              <circle cx="64" cy="52" r="3" fill="#f76db8"/>
            </svg>
          </div>
          <h1 class="app-title">Warp Table</h1>
          <p class="app-subtitle">
            Drag data in one shape. It comes out another. Paste CSV or JSON, or drop a file — Warp Table
            reads the structure and hands you the right controls to reshape it.
          </p>

          {#if isProcessing}
            <div class="loading-state">
              <div class="warp-loader" aria-hidden="true">
                <svg viewBox="0 0 120 120" fill="none">
                  <rect x="20" y="30" width="80" height="60" rx="6" stroke="rgba(31,47,86,0.15)" stroke-width="2"/>
                  <line x1="20" y1="48" x2="100" y2="48" stroke="rgba(31,47,86,0.15)" stroke-width="1.5"/>
                  <line x1="44" y1="30" x2="44" y2="90" stroke="rgba(31,47,86,0.15)" stroke-width="1.5"/>
                  <line x1="72" y1="30" x2="72" y2="90" stroke="rgba(31,47,86,0.15)" stroke-width="1.5"/>
                  <path class="warp-line" d="M28 70 Q60 40 92 70" stroke="var(--color-accent)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                  <circle class="warp-dot warp-dot-1" cx="28" cy="70" r="4" fill="var(--color-accent)"/>
                  <circle class="warp-dot warp-dot-2" cx="92" cy="70" r="4" fill="var(--color-secondary)"/>
                </svg>
              </div>
              <p class="loading-phrase">{loadingPhrase}</p>
            </div>
          {:else}
            <div
              class="dropzone"
              class:dragging={isDragging}
              ondragover={handleDragOver}
              ondragleave={handleDragLeave}
              ondrop={handleDrop}
              role="region"
              aria-label="Drop a file here or paste data below"
            >
              <div class="dropzone-inner">
                <p class="dropzone-headline">Drop a file or paste data to start shaping it.</p>
                <p class="dropzone-hint">CSV or JSON · Everything runs in your browser.</p>
                <label class="file-button">
                  <input type="file" accept=".csv,.json,.txt,text/csv,application/json" onchange={handleFileInput} hidden />
                  <span>Choose a file</span>
                </label>
              </div>
            </div>

            <div class="paste-area">
              <div class="paste-head">
                <span class="paste-label">Or paste data</span>
                <span class="paste-hint">⌘/Ctrl + Enter to read it</span>
              </div>
              <textarea
                bind:value={rawInput}
                onkeydown={handlePasteKeydown}
                placeholder={'[{"name":"Mira","city":"SF"}]   or   name,city\\nMira,SF'}
                rows="8"
                spellcheck="false"
                autocapitalize="off"
                autocomplete="off"
              ></textarea>
              <div class="paste-actions">
                {#if parseError}
                  <span class="error-text">{parseError}</span>
                {/if}
                <button class="primary-btn" onclick={processInput} disabled={!rawInput.trim()}>
                  Read structure
                </button>
              </div>
            </div>

            <div class="sample-urls">
              <span class="sample-label">Or try a sample:</span>
              {#each SAMPLE_DATASETS as s}
                <button class="sample-chip" onclick={() => loadSample(s.id)} title={s.description}>
                  {s.name}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </section>
  {:else}
    <!-- Workspace -->
    <section class="workspace-section">
      <div class="container">
        <div class="workspace-header">
          <div class="workspace-meta">
            <span class="result-signal-id">FLUX-22</span>
            <span class="result-url">
              {loadedSampleName ?? (parsed.format === 'csv' ? 'Pasted CSV' : 'Pasted JSON')}
              <span class="format-badge format-badge-{parsed.format}">{parsed.format.toUpperCase()}</span>
            </span>
          </div>
          <div class="workspace-actions">
            <button class="action-btn" onclick={clearAll} title="Reset everything">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true">
                <path d="M4 10a6 6 0 0 1 10.5-4M16 10a6 6 0 0 1-10.5 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M14 3v3.5H10.5M6 17v-3.5H9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Reset
            </button>
          </div>
        </div>

        <div class="workspace-body">
          <!-- Column 1: Structure summary -->
          <div class="result-section structure-section">
            <div class="section-head">
              <span class="section-tag">Source Structure</span>
            </div>
            <div class="stat-grid">
              <div class="stat">
                <span class="stat-value">{parsed.structure.rowCount}</span>
                <span class="stat-label">{parsed.structure.rowCount === 1 ? 'Row' : 'Rows'}</span>
              </div>
              <div class="stat">
                <span class="stat-value">{parsed.structure.fieldCount}</span>
                <span class="stat-label">{parsed.structure.fieldCount === 1 ? 'Field' : 'Fields'}</span>
              </div>
              <div class="stat">
                <span class="stat-value">{parsed.structure.hasNesting ? 'Yes' : 'No'}</span>
                <span class="stat-label">Nested</span>
              </div>
              <div class="stat">
                <span class="stat-value">{Math.round(parsed.structure.rawByteLength / 100) / 10}<span class="stat-unit">k</span></span>
                <span class="stat-label">Chars</span>
              </div>
            </div>

            <div class="fields-list">
              {#each parsed.structure.fields as f}
                <div class="field-row">
                  <span class="field-key">{f.key}</span>
                  <span class="field-type field-type-{f.type}">{f.type}</span>
                  <span class="field-sample" title={f.sample}>{f.sample || '—'}</span>
                </div>
              {/each}
            </div>

            {#if parsed.structure.issues.length > 0}
              <div class="issues-block">
                <span class="issues-title">Notes</span>
                <ul>
                  {#each parsed.structure.issues as iss}
                    <li class="issue issue-{iss.kind}">{iss.message}</li>
                  {/each}
                </ul>
              </div>
            {/if}
          </div>

          <!-- Column 2: Transformation controls -->
          <div class="result-section transforms-section">
            <div class="section-head">
              <span class="section-tag">Transformations</span>
              <div class="target-switcher" role="radiogroup" aria-label="Target format">
                <button
                  class="target-btn"
                  class:active={target === 'json'}
                  onclick={() => (target = 'json')}
                  role="radio"
                  aria-checked={target === 'json'}
                >JSON</button>
                <button
                  class="target-btn"
                  class:active={target === 'csv'}
                  onclick={() => (target = 'csv')}
                  role="radio"
                  aria-checked={target === 'csv'}
                >CSV</button>
              </div>
            </div>

            <p class="section-lead">Toggle cleanup chips. Add field-level moves below. Order matters — drag with the arrows.</p>

            <div class="chip-grid">
              {#each simpleKinds as kind}
                <button
                  class="chip"
                  class:active={hasTransform(kind)}
                  onclick={() => toggleTransform(kind, labelFor(kind))}
                >
                  <span class="chip-check" aria-hidden="true">{hasTransform(kind) ? '✓' : '+'}</span>
                  <span class="chip-label">{labelFor(kind)}</span>
                </button>
              {/each}
            </div>

            <div class="field-ops">
              <details class="field-op">
                <summary>Rename a field</summary>
                <div class="field-op-body">
                  <input list="field-options" bind:value={renameFrom} placeholder="from (existing key)" />
                  <input bind:value={renameTo} placeholder="to (new key)" />
                  <button class="ghost-btn" onclick={addRename}>Add</button>
                </div>
              </details>
              <details class="field-op">
                <summary>Remove a field</summary>
                <div class="field-op-body">
                  <input list="field-options" bind:value={removeField} placeholder="field to remove" />
                  <button class="ghost-btn" onclick={addRemoveField}>Add</button>
                </div>
              </details>
              <details class="field-op">
                <summary>Reorder fields</summary>
                <div class="field-op-body">
                  <input bind:value={reorderOrder} placeholder="comma-separated order" />
                  <button class="ghost-btn" onclick={addReorder}>Add</button>
                </div>
              </details>
              <details class="field-op">
                <summary>Key by field</summary>
                <div class="field-op-body">
                  <input list="field-options" bind:value={keyByField} placeholder="field to key by" />
                  <button class="ghost-btn" onclick={addKeyBy}>Add</button>
                </div>
              </details>
              <details class="field-op">
                <summary>Group by field</summary>
                <div class="field-op-body">
                  <input list="field-options" bind:value={groupByField} placeholder="field to group by" />
                  <button class="ghost-btn" onclick={addGroupBy}>Add</button>
                </div>
              </details>
            </div>

            <datalist id="field-options">
              {#each fieldKeys as k}
                <option value={k}></option>
              {/each}
            </datalist>

            {#if transforms.length > 0}
              <div class="pipeline">
                <span class="pipeline-title">Pipeline</span>
                <ol class="pipeline-list">
                  {#each transforms as t, i (t.id)}
                    <li class="pipeline-item">
                      <span class="pipeline-num">{String(i + 1).padStart(2, '0')}</span>
                      <span class="pipeline-label">{t.label}</span>
                      <div class="pipeline-controls">
                        <button class="mini-btn" onclick={() => moveTransform(t.id, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                        <button class="mini-btn" onclick={() => moveTransform(t.id, 1)} disabled={i === transforms.length - 1} aria-label="Move down">↓</button>
                        <button class="mini-btn mini-btn-x" onclick={() => removeTransform(t.id)} aria-label="Remove">×</button>
                      </div>
                    </li>
                  {/each}
                </ol>
              </div>
            {/if}
          </div>
        </div>

        <!-- Preview -->
        <div class="result-section preview-section">
          <div class="section-head">
            <span class="section-tag">Preview</span>
            {#if result}
              <div class="preview-summary">
                <span class="summary-pill">{result.summary.rowsIn} → {result.summary.rowsOut} rows</span>
                <span class="summary-pill">{result.summary.fieldsIn} → {result.summary.fieldsOut} fields</span>
              </div>
            {/if}
          </div>

          <div class="preview-grid">
            <div class="preview-pane">
              <div class="pane-head">
                <span class="pane-label">Input · {parsed.format.toUpperCase()}</span>
                <button class="copy-btn" onclick={copyInput}>{copied ? '✓ Copied' : 'Copy'}</button>
              </div>
              <pre class="pane-body"><code>{inputPreviewString}</code></pre>
            </div>
            <div class="preview-pane preview-pane-output">
              <div class="pane-head">
                <span class="pane-label">Output · {result?.targetFormat.toUpperCase() ?? target.toUpperCase()}</span>
                <button class="copy-btn" onclick={copyOutput} disabled={!result}>{copiedOutput ? '✓ Copied' : 'Copy'}</button>
              </div>
              <pre class="pane-body"><code>{previewString}</code></pre>
            </div>
          </div>

          {#if result && result.summary.deltas.length > 0}
            <div class="deltas-block">
              <span class="deltas-title">What changed</span>
              <ul>
                {#each result.summary.deltas as d}
                  <li>{d}</li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if result && result.warnings.length > 0}
            <div class="warnings-block">
              <span class="deltas-title">Warnings</span>
              <ul>
                {#each result.warnings as w}
                  <li>{w}</li>
                {/each}
              </ul>
            </div>
          {/if}

          <div class="export-row">
            <button class="primary-btn" onclick={downloadOutput} disabled={!result}>
              Download {result?.targetFormat.toUpperCase() ?? target.toUpperCase()}
            </button>
            <button class="ghost-btn" onclick={copyOutput} disabled={!result}>
              {copiedOutput ? '✓ Copied output' : 'Copy output'}
            </button>
            <button class="ghost-btn" onclick={clearAll}>Reset</button>
          </div>
        </div>
      </div>
    </section>
  {/if}
</main>

<Footer />

<style>
  .warp-table {
    min-height: 100vh;
    padding-top: var(--space-16);
    background: var(--color-bg);
    color: var(--color-text);
  }

  .container {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 var(--space-6);
  }

  /* --- App header --- */
  .app-header {
    padding: var(--space-6) 0 var(--space-4);
    border-bottom: 2px solid rgba(31, 47, 86, 0.08);
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
  .back-arrow {
    font-weight: 600;
  }
  .app-meta {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
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
    color: #1bb673;
  }
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #1bb673;
    box-shadow: 0 0 0 0 rgba(27, 182, 115, 0.6);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(27, 182, 115, 0.5); }
    70% { box-shadow: 0 0 0 10px rgba(27, 182, 115, 0); }
    100% { box-shadow: 0 0 0 0 rgba(27, 182, 115, 0); }
  }

  /* --- Input / hero --- */
  .input-section {
    padding: var(--space-10) 0 var(--space-16);
  }
  .input-hero {
    text-align: center;
    max-width: 720px;
    margin: 0 auto;
  }
  .doodle-icon {
    width: 88px;
    height: 88px;
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
    font-size: var(--text-4xl);
    font-weight: 700;
    color: var(--color-text-bright);
    margin: 0 0 var(--space-3);
    letter-spacing: -0.02em;
  }
  .app-subtitle {
    font-size: var(--text-base);
    color: var(--color-text-muted);
    line-height: 1.6;
    max-width: 560px;
    margin: 0 auto var(--space-8);
  }

  /* Dropzone */
  .dropzone {
    border: 2px dashed rgba(31, 47, 86, 0.25);
    border-radius: var(--radius-xl);
    background: var(--color-surface);
    padding: var(--space-8);
    margin-bottom: var(--space-5);
    transition: all 0.2s var(--ease-elastic);
  }
  .dropzone.dragging {
    border-color: var(--color-accent);
    background: rgba(53, 104, 235, 0.06);
    transform: scale(1.01);
  }
  .dropzone-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
  }
  .dropzone-headline {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text-bright);
    margin: 0;
  }
  .dropzone-hint {
    font-size: var(--text-sm);
    color: var(--color-text-faint);
    margin: 0;
  }
  .file-button {
    cursor: pointer;
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-accent);
    padding: var(--space-2) var(--space-4);
    border: 2px solid rgba(53, 104, 235, 0.35);
    border-radius: var(--radius-full);
    background: rgba(53, 104, 235, 0.04);
    transition: all 0.2s var(--ease-elastic);
    margin-top: var(--space-2);
  }
  .file-button:hover {
    background: rgba(53, 104, 235, 0.1);
    transform: translateY(-2px);
  }

  .paste-area {
    text-align: left;
    margin-bottom: var(--space-6);
  }
  .paste-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: var(--space-2);
  }
  .paste-label {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-faint);
  }
  .paste-hint {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
  }
  textarea {
    width: 100%;
    font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
    font-size: 13px;
    line-height: 1.55;
    padding: var(--space-4);
    border: 2px solid rgba(31, 47, 86, 0.15);
    border-radius: var(--radius-xl);
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
  .paste-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-3);
    flex-wrap: wrap;
  }
  .error-text {
    font-size: var(--text-sm);
    color: #e53e3e;
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
  .primary-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ghost-btn {
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
  .ghost-btn:hover:not(:disabled) {
    border-color: rgba(53, 104, 235, 0.3);
    color: var(--color-accent);
    transform: translateY(-2px);
    box-shadow: 0 5px 0 rgba(31, 47, 86, 0.1);
  }
  .ghost-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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

  /* Loading */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-5);
    padding: var(--space-8) 0;
  }
  .warp-loader { width: 160px; height: 160px; }
  .warp-loader svg { width: 100%; height: 100%; }
  .warp-line {
    stroke-dasharray: 120;
    stroke-dashoffset: 120;
    animation: warpDraw 1.8s ease-in-out infinite;
  }
  @keyframes warpDraw {
    0% { stroke-dashoffset: 120; }
    50% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: -120; }
  }
  .warp-dot {
    animation: warpBlink 1.8s ease-in-out infinite;
  }
  .warp-dot-2 { animation-delay: 0.9s; }
  @keyframes warpBlink {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
  .loading-phrase {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-faint);
    letter-spacing: 0.06em;
  }

  /* --- Workspace --- */
  .workspace-section {
    padding: var(--space-8) 0 var(--space-16);
  }
  .workspace-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-8);
    padding-bottom: var(--space-5);
    border-bottom: 2px solid rgba(31, 47, 86, 0.1);
    flex-wrap: wrap;
  }
  .workspace-meta {
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
  }
  .result-url {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text-bright);
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
  }
  .format-badge {
    font-family: var(--font-display);
    font-size: 10px;
    letter-spacing: 0.14em;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    text-transform: uppercase;
  }
  .format-badge-csv {
    background: rgba(247, 109, 184, 0.14);
    color: #c42d82;
    border: 1px solid rgba(247, 109, 184, 0.3);
  }
  .format-badge-json {
    background: rgba(53, 104, 235, 0.12);
    color: var(--color-accent);
    border: 1px solid rgba(53, 104, 235, 0.3);
  }
  .workspace-actions {
    display: flex;
    gap: var(--space-2);
  }
  .action-btn {
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
  .action-btn:hover {
    border-color: rgba(53, 104, 235, 0.3);
    color: var(--color-accent);
    transform: translateY(-2px);
    box-shadow: 0 5px 0 rgba(31, 47, 86, 0.1);
  }

  .workspace-body {
    display: grid;
    grid-template-columns: minmax(0, 380px) minmax(0, 1fr);
    gap: var(--space-6);
    margin-bottom: var(--space-6);
  }

  /* Sections */
  .result-section {
    padding: var(--space-6);
    border: 2px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-xl);
    background: var(--color-surface);
    box-shadow: 0 4px 0 rgba(31, 47, 86, 0.08);
    animation: resultFadeIn 0.5s ease both;
  }
  .result-section:nth-child(2) { animation-delay: 0.05s; }
  @keyframes resultFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-5);
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
    background: rgba(53, 104, 235, 0.04);
  }
  .section-lead {
    font-size: var(--text-sm);
    color: var(--color-text-faint);
    margin: 0 0 var(--space-5);
    line-height: 1.6;
  }

  /* Structure */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-3);
    margin-bottom: var(--space-5);
  }
  .stat {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: var(--space-3);
    border-radius: var(--radius-md);
    background: rgba(31, 47, 86, 0.04);
  }
  .stat-value {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--color-text-bright);
    line-height: 1;
  }
  .stat-unit {
    font-size: var(--text-sm);
    margin-left: 1px;
    color: var(--color-text-faint);
  }
  .stat-label {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .fields-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    max-height: 360px;
    overflow-y: auto;
    padding-right: var(--space-1);
  }
  .field-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1.2fr);
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: 1px solid rgba(31, 47, 86, 0.08);
    border-radius: var(--radius-md);
    background: rgba(31, 47, 86, 0.02);
  }
  .field-key {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 12px;
    color: var(--color-text-bright);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .field-type {
    font-family: var(--font-display);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: var(--radius-full);
    border: 1px solid rgba(31, 47, 86, 0.12);
  }
  .field-type-string  { color: #2a7f6d; border-color: rgba(42, 127, 109, 0.25); background: rgba(42, 127, 109, 0.07); }
  .field-type-number  { color: var(--color-accent); border-color: rgba(53, 104, 235, 0.25); background: rgba(53, 104, 235, 0.07); }
  .field-type-boolean { color: #8d57eb; border-color: rgba(141, 87, 235, 0.25); background: rgba(141, 87, 235, 0.07); }
  .field-type-date    { color: #f39a19; border-color: rgba(243, 154, 25, 0.28); background: rgba(243, 154, 25, 0.08); }
  .field-type-object, .field-type-array {
    color: #c42d82; border-color: rgba(196, 45, 130, 0.25); background: rgba(196, 45, 130, 0.07);
  }
  .field-type-null, .field-type-mixed {
    color: var(--color-text-faint);
  }
  .field-sample {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    color: var(--color-text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .issues-block {
    margin-top: var(--space-5);
    padding-top: var(--space-4);
    border-top: 1px dashed rgba(31, 47, 86, 0.15);
  }
  .issues-title,
  .deltas-title,
  .pipeline-title {
    display: block;
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-faint);
    margin-bottom: var(--space-2);
  }
  .issues-block ul, .deltas-block ul, .warnings-block ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .issues-block li, .deltas-block li, .warnings-block li {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    padding-left: var(--space-4);
    position: relative;
    line-height: 1.5;
  }
  .issues-block li::before, .deltas-block li::before, .warnings-block li::before {
    content: '·';
    position: absolute;
    left: var(--space-1);
    color: var(--color-text-faint);
    font-weight: 700;
  }
  .warnings-block {
    margin-top: var(--space-4);
    padding: var(--space-4);
    background: rgba(243, 154, 25, 0.06);
    border: 1px solid rgba(243, 154, 25, 0.25);
    border-radius: var(--radius-md);
  }
  .warnings-block li::before { color: #f39a19; }

  /* Transforms */
  .target-switcher {
    display: inline-flex;
    gap: 2px;
    padding: 2px;
    border-radius: var(--radius-full);
    background: rgba(31, 47, 86, 0.06);
    border: 1px solid rgba(31, 47, 86, 0.1);
  }
  .target-btn {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.06em;
    padding: var(--space-1) var(--space-3);
    border: none;
    border-radius: var(--radius-full);
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .target-btn.active {
    background: var(--color-surface);
    color: var(--color-accent);
    box-shadow: 0 2px 0 rgba(31, 47, 86, 0.1);
  }

  .chip-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-5);
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    padding: var(--space-2) var(--space-3);
    border: 2px solid rgba(31, 47, 86, 0.14);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    cursor: pointer;
    transition: all 0.18s var(--ease-elastic);
    box-shadow: 0 3px 0 rgba(31, 47, 86, 0.06);
  }
  .chip:hover {
    border-color: rgba(53, 104, 235, 0.3);
    color: var(--color-accent);
    transform: translateY(-1px);
    box-shadow: 0 4px 0 rgba(31, 47, 86, 0.08);
  }
  .chip.active {
    border-color: var(--color-accent);
    background: rgba(53, 104, 235, 0.08);
    color: var(--color-accent);
    box-shadow: 0 3px 0 rgba(53, 104, 235, 0.2);
  }
  .chip-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(31, 47, 86, 0.08);
    color: var(--color-text-faint);
    font-size: 11px;
    font-weight: 700;
  }
  .chip.active .chip-check {
    background: var(--color-accent);
    color: #fff;
  }

  .field-ops {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-bottom: var(--space-5);
  }
  .field-op {
    border: 1px solid rgba(31, 47, 86, 0.1);
    border-radius: var(--radius-md);
    background: rgba(31, 47, 86, 0.02);
    padding: var(--space-2) var(--space-3);
  }
  .field-op summary {
    cursor: pointer;
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .field-op summary::-webkit-details-marker { display: none; }
  .field-op summary::after {
    content: '+';
    color: var(--color-text-faint);
    font-weight: 600;
    font-size: var(--text-base);
  }
  .field-op[open] summary::after { content: '−'; }
  .field-op-body {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-3);
    flex-wrap: wrap;
  }
  .field-op-body input {
    flex: 1;
    min-width: 140px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 12px;
    padding: var(--space-2) var(--space-3);
    border: 1.5px solid rgba(31, 47, 86, 0.15);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text-bright);
  }
  .field-op-body input:focus {
    outline: none;
    border-color: rgba(53, 104, 235, 0.45);
  }

  .pipeline {
    padding-top: var(--space-4);
    border-top: 1px dashed rgba(31, 47, 86, 0.15);
  }
  .pipeline-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .pipeline-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border: 1.5px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-md);
    background: var(--color-surface);
  }
  .pipeline-num {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--color-accent);
    letter-spacing: 0.08em;
  }
  .pipeline-label {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-bright);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pipeline-controls {
    display: inline-flex;
    gap: 4px;
  }
  .mini-btn {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 1px solid rgba(31, 47, 86, 0.15);
    background: var(--color-surface);
    color: var(--color-text-muted);
    font-size: 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }
  .mini-btn:hover:not(:disabled) {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
  .mini-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .mini-btn-x:hover:not(:disabled) {
    border-color: #e53e3e;
    color: #e53e3e;
  }

  /* Preview */
  .preview-section {
    margin-top: var(--space-6);
  }
  .preview-summary {
    display: inline-flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }
  .summary-pill {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.06em;
    color: var(--color-text-muted);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    background: rgba(31, 47, 86, 0.06);
  }
  .preview-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: var(--space-4);
    margin-bottom: var(--space-5);
  }
  .preview-pane {
    display: flex;
    flex-direction: column;
    border: 1.5px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-md);
    background: #fbfbf7;
    overflow: hidden;
    min-width: 0;
  }
  .preview-pane-output {
    background: #f6f9ff;
    border-color: rgba(53, 104, 235, 0.22);
  }
  .pane-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid rgba(31, 47, 86, 0.08);
    background: rgba(31, 47, 86, 0.02);
  }
  .pane-label {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-faint);
  }
  .copy-btn {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    padding: 2px var(--space-2);
    border: 1px solid rgba(31, 47, 86, 0.12);
    border-radius: var(--radius-full);
    background: transparent;
    cursor: pointer;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: all 0.15s ease;
  }
  .copy-btn:hover:not(:disabled) {
    color: var(--color-accent);
    border-color: rgba(53, 104, 235, 0.28);
    background: rgba(53, 104, 235, 0.04);
  }
  .copy-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .pane-body {
    margin: 0;
    padding: var(--space-4);
    font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
    font-size: 12px;
    line-height: 1.55;
    color: var(--color-text-bright);
    overflow: auto;
    max-height: 460px;
    min-height: 200px;
    white-space: pre;
    word-break: normal;
  }
  .pane-body code {
    font-family: inherit;
  }

  .deltas-block {
    margin-top: var(--space-4);
    padding: var(--space-4);
    background: rgba(53, 104, 235, 0.04);
    border: 1px solid rgba(53, 104, 235, 0.18);
    border-radius: var(--radius-md);
  }

  .export-row {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
    justify-content: flex-end;
    margin-top: var(--space-5);
    padding-top: var(--space-5);
    border-top: 1px dashed rgba(31, 47, 86, 0.12);
  }

  /* --- Responsive --- */
  @media (max-width: 900px) {
    .workspace-body {
      grid-template-columns: 1fr;
    }
    .preview-grid {
      grid-template-columns: 1fr;
    }
    .stat-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 640px) {
    .warp-table { padding-top: var(--space-12); }
    .app-title { font-size: var(--text-3xl); }
    .app-subtitle { font-size: var(--text-sm); }
    .dropzone { padding: var(--space-5); }
    .result-section { padding: var(--space-4); }
    .workspace-header {
      align-items: flex-start;
      flex-direction: column;
    }
    .export-row { justify-content: stretch; }
    .export-row > * { flex: 1; }
    .primary-btn, .ghost-btn { padding: var(--space-3) var(--space-4); }
  }
</style>
