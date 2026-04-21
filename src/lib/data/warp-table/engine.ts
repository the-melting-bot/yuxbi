/**
 * Warp Table — Transformation Engine
 * Pure, client-side parsing, structure detection, transformation, and serialization.
 * No external dependencies.
 */

import type {
  FieldSummary,
  FieldType,
  InputFormat,
  InputStructure,
  StructureIssue,
  TargetFormat,
  Transform,
  TransformKind,
  TransformResult,
  TransformSummary
} from './types';

/* ------------------------------------------------------------------ */
/* Format detection                                                    */
/* ------------------------------------------------------------------ */

export function detectFormat(raw: string): InputFormat {
  const trimmed = raw.trim();
  if (!trimmed) return 'unknown';
  const firstChar = trimmed[0];
  if (firstChar === '{' || firstChar === '[') {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // fall through — maybe it's CSV that happens to start with a bracket
    }
  }
  // CSV heuristic: has at least one delimiter-ish char on the first non-empty line
  const firstLine = trimmed.split(/\r?\n/)[0];
  if (/[,;\t|]/.test(firstLine)) return 'csv';
  return 'unknown';
}

/* ------------------------------------------------------------------ */
/* CSV parsing (RFC 4180-ish, with delimiter auto-detect)              */
/* ------------------------------------------------------------------ */

function detectDelimiter(sample: string): string {
  const candidates = [',', ';', '\t', '|'];
  const firstLines = sample.split(/\r?\n/).slice(0, 5).filter(Boolean);
  let best = ',';
  let bestScore = -1;
  for (const d of candidates) {
    const counts = firstLines.map((l) => splitCsvLine(l, d).length);
    if (counts.length === 0) continue;
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance =
      counts.reduce((a, b) => a + (b - avg) * (b - avg), 0) / counts.length;
    // Prefer delimiters with >1 column and low variance across rows
    if (avg > 1 && (bestScore === -1 || variance < bestScore || avg > bestScore)) {
      best = d;
      bestScore = variance;
    }
  }
  return best;
}

function splitCsvLine(line: string, delim: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delim) {
        result.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
  }
  result.push(cur);
  return result;
}

export interface CsvParseResult {
  rows: Record<string, string>[];
  headers: string[];
  delimiter: string;
  issues: StructureIssue[];
}

export function parseCsv(raw: string): CsvParseResult {
  const issues: StructureIssue[] = [];
  const text = raw.replace(/^\uFEFF/, ''); // strip BOM
  const delimiter = detectDelimiter(text);

  // Split into logical lines, respecting quoted newlines
  const lines: string[] = [];
  let buf = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQ && text[i + 1] === '"') {
        buf += '""';
        i++;
      } else {
        inQ = !inQ;
        buf += ch;
      }
    } else if ((ch === '\n' || ch === '\r') && !inQ) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      if (buf.length) lines.push(buf);
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf.length) lines.push(buf);

  if (lines.length === 0) {
    return { rows: [], headers: [], delimiter, issues };
  }

  const rawHeaders = splitCsvLine(lines[0], delimiter).map((h) => h.trim());
  const headers: string[] = [];
  const seen = new Map<string, number>();
  rawHeaders.forEach((h, i) => {
    let name = h || `column_${i + 1}`;
    if (!h) {
      issues.push({
        kind: 'blank-header',
        message: `Column ${i + 1} had a blank header — renamed to "${name}".`
      });
    }
    const n = (seen.get(name) ?? 0) + 1;
    seen.set(name, n);
    if (n > 1) {
      const deduped = `${name}_${n}`;
      issues.push({
        kind: 'duplicate-column',
        message: `Duplicate header "${name}" — renamed to "${deduped}".`
      });
      headers.push(deduped);
    } else {
      headers.push(name);
    }
  });

  const rows: Record<string, string>[] = [];
  let inconsistent = 0;
  for (let r = 1; r < lines.length; r++) {
    const cells = splitCsvLine(lines[r], delimiter);
    if (cells.length !== headers.length) inconsistent++;
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (cells[i] ?? '').trim();
    });
    rows.push(obj);
  }
  if (inconsistent > 0) {
    issues.push({
      kind: 'inconsistent-rows',
      message: `${inconsistent} row${inconsistent === 1 ? '' : 's'} had a different column count than the header.`
    });
  }

  return { rows, headers, delimiter, issues };
}

/* ------------------------------------------------------------------ */
/* JSON parsing                                                        */
/* ------------------------------------------------------------------ */

export interface JsonParseResult {
  records: Record<string, unknown>[];
  rootShape: 'array' | 'object' | 'wrapped-array' | 'primitive';
  rootKeyUsed?: string;
  issues: StructureIssue[];
}

export function parseJson(raw: string): JsonParseResult {
  const issues: StructureIssue[] = [];
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (e) {
    throw new Error(`JSON parse error: ${(e as Error).message}`);
  }

  if (Array.isArray(value)) {
    const records = value
      .filter((v) => v && typeof v === 'object' && !Array.isArray(v))
      .map((v) => v as Record<string, unknown>);
    if (records.length !== value.length) {
      issues.push({
        kind: 'parse-warning',
        message: `${value.length - records.length} non-object item${value.length - records.length === 1 ? '' : 's'} in the array were skipped.`
      });
    }
    return { records, rootShape: 'array', issues };
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    // Look for the first array-of-objects property
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v) && v.length > 0 && v.every((it) => it && typeof it === 'object' && !Array.isArray(it))) {
        issues.push({
          kind: 'parse-warning',
          message: `Unwrapped root — using "${k}" as the records array.`
        });
        return {
          records: v as Record<string, unknown>[],
          rootShape: 'wrapped-array',
          rootKeyUsed: k,
          issues
        };
      }
    }
    return { records: [obj], rootShape: 'object', issues };
  }

  throw new Error('JSON root must be an object or array.');
}

/* ------------------------------------------------------------------ */
/* Field type inference                                                */
/* ------------------------------------------------------------------ */

function inferFieldType(value: unknown): FieldType {
  if (value === null || value === undefined || value === '') return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return Number.isFinite(value) ? 'number' : 'null';
  if (typeof value === 'string') {
    const s = value.trim();
    if (/^(true|false)$/i.test(s)) return 'boolean';
    if (/^-?\d+(\.\d+)?$/.test(s)) return 'number';
    if (/^\d{4}-\d{2}-\d{2}/.test(s) && !Number.isNaN(Date.parse(s))) return 'date';
    return 'string';
  }
  return 'string';
}

function reconcileType(current: FieldType, next: FieldType): FieldType {
  if (current === next) return current;
  if (current === 'null') return next;
  if (next === 'null') return current;
  return 'mixed';
}

export function summarizeFields(records: Record<string, unknown>[]): FieldSummary[] {
  if (records.length === 0) return [];
  const map = new Map<string, { type: FieldType; sample: string; nulls: number; uniques: Set<string> }>();
  for (const rec of records) {
    for (const [k, v] of Object.entries(rec)) {
      const entry = map.get(k) ?? { type: 'null', sample: '', nulls: 0, uniques: new Set() };
      const t = inferFieldType(v);
      entry.type = reconcileType(entry.type, t);
      if (t === 'null') entry.nulls++;
      else if (!entry.sample) {
        entry.sample = typeof v === 'object' ? JSON.stringify(v) : String(v);
      }
      if (t !== 'null') entry.uniques.add(typeof v === 'object' ? JSON.stringify(v) : String(v));
      map.set(k, entry);
    }
  }
  return Array.from(map.entries()).map(([k, e]) => ({
    key: k,
    type: e.type,
    sample: e.sample.length > 60 ? e.sample.slice(0, 57) + '…' : e.sample,
    nullCount: e.nulls,
    uniqueCount: e.uniques.size
  }));
}

function detectNesting(records: Record<string, unknown>[]): { has: boolean; depth: number } {
  let depth = 0;
  function walk(v: unknown, d: number) {
    if (d > depth) depth = d;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      for (const inner of Object.values(v)) walk(inner, d + 1);
    } else if (Array.isArray(v)) {
      for (const inner of v) walk(inner, d + 1);
    }
  }
  for (const r of records) walk(r, 0);
  return { has: depth > 1, depth };
}

/* ------------------------------------------------------------------ */
/* Full structure read                                                 */
/* ------------------------------------------------------------------ */

export interface ParsedInput {
  format: InputFormat;
  records: Record<string, unknown>[];
  structure: InputStructure;
  delimiter?: string;
  raw: string;
}

export function parseInput(raw: string): ParsedInput {
  const format = detectFormat(raw);
  if (format === 'unknown') {
    throw new Error("Couldn't detect a recognizable format. Paste CSV or JSON.");
  }

  let records: Record<string, unknown>[] = [];
  const issues: StructureIssue[] = [];
  let delimiter: string | undefined;

  if (format === 'csv') {
    const parsed = parseCsv(raw);
    records = parsed.rows;
    delimiter = parsed.delimiter;
    issues.push(...parsed.issues);
  } else {
    const parsed = parseJson(raw);
    records = parsed.records;
    issues.push(...parsed.issues);
  }

  const fields = summarizeFields(records);
  const nesting = detectNesting(records);

  // malformed-spacing heuristic: trailing/leading whitespace present in string values
  let spacyCells = 0;
  for (const r of records) {
    for (const v of Object.values(r)) {
      if (typeof v === 'string' && v !== v.trim() && v.trim() !== '') spacyCells++;
    }
  }
  if (spacyCells > 0) {
    issues.push({
      kind: 'malformed-spacing',
      message: `${spacyCells} value${spacyCells === 1 ? '' : 's'} have leading or trailing whitespace.`
    });
  }

  const structure: InputStructure = {
    detectedFormat: format,
    rowCount: records.length,
    fieldCount: fields.length,
    fields,
    hasNesting: nesting.has,
    nestingDepth: nesting.depth,
    issues,
    rawByteLength: raw.length
  };

  return { format, records, structure, delimiter, raw };
}

/* ------------------------------------------------------------------ */
/* Transformations                                                     */
/* ------------------------------------------------------------------ */

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

function flattenObject(obj: Record<string, unknown>, prefix = '', out: Record<string, unknown> = {}): Record<string, unknown> {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      flattenObject(v as Record<string, unknown>, key, out);
    } else if (Array.isArray(v)) {
      // Leave arrays as JSON strings — flattening arrays row-wise is out of scope for v1
      out[key] = JSON.stringify(v);
    } else {
      out[key] = v;
    }
  }
  return out;
}

function applyFlatten(records: Record<string, unknown>[]): { records: Record<string, unknown>[]; delta: string } {
  let nestedCount = 0;
  let newKeysCountTotal = 0;
  const before = records[0] ? Object.keys(records[0]).length : 0;
  const out = records.map((r) => {
    const hasNested = Object.values(r).some((v) => v && typeof v === 'object' && !Array.isArray(v));
    if (hasNested) nestedCount++;
    const flat = flattenObject(r);
    newKeysCountTotal = Math.max(newKeysCountTotal, Object.keys(flat).length);
    return flat;
  });
  if (nestedCount === 0) {
    return { records: out, delta: 'No nested objects found — nothing to flatten.' };
  }
  return {
    records: out,
    delta: `Flattened ${nestedCount} nested object${nestedCount === 1 ? '' : 's'} into ${newKeysCountTotal} output field${newKeysCountTotal === 1 ? '' : 's'}${before ? ` (was ${before})` : ''}.`
  };
}

function applyTrimWhitespace(records: Record<string, unknown>[]): { records: Record<string, unknown>[]; delta: string } {
  let trimmed = 0;
  const out = records.map((r) => {
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(r)) {
      if (typeof v === 'string') {
        const t = v.trim();
        if (t !== v) trimmed++;
        next[k] = t;
      } else {
        next[k] = v;
      }
    }
    return next;
  });
  return {
    records: out,
    delta: trimmed === 0 ? 'No extra whitespace found.' : `Trimmed whitespace from ${trimmed} value${trimmed === 1 ? '' : 's'}.`
  };
}

function applyRemoveDuplicates(records: Record<string, unknown>[]): { records: Record<string, unknown>[]; delta: string } {
  const seen = new Set<string>();
  const out: Record<string, unknown>[] = [];
  let dropped = 0;
  for (const r of records) {
    const key = JSON.stringify(r);
    if (seen.has(key)) {
      dropped++;
      continue;
    }
    seen.add(key);
    out.push(r);
  }
  return {
    records: out,
    delta: dropped === 0 ? 'No duplicate rows found.' : `Removed ${dropped} duplicate row${dropped === 1 ? '' : 's'}.`
  };
}

function applyDropEmptyColumns(records: Record<string, unknown>[]): { records: Record<string, unknown>[]; delta: string } {
  if (records.length === 0) return { records, delta: 'No rows to evaluate.' };
  const allKeys = new Set<string>();
  records.forEach((r) => Object.keys(r).forEach((k) => allKeys.add(k)));
  const emptyKeys: string[] = [];
  for (const k of allKeys) {
    const everyEmpty = records.every((r) => {
      const v = r[k];
      return v === null || v === undefined || v === '' || (typeof v === 'string' && v.trim() === '');
    });
    if (everyEmpty) emptyKeys.push(k);
  }
  if (emptyKeys.length === 0) return { records, delta: 'No empty columns found.' };
  const out = records.map((r) => {
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(r)) {
      if (!emptyKeys.includes(k)) next[k] = v;
    }
    return next;
  });
  return {
    records: out,
    delta: `Dropped ${emptyKeys.length} empty column${emptyKeys.length === 1 ? '' : 's'}: ${emptyKeys.join(', ')}.`
  };
}

function normalizeHeaderName(h: string): string {
  return h
    .trim()
    .replace(/[\s\-]+/g, '_')
    .replace(/[^A-Za-z0-9_.]+/g, '')
    .replace(/__+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function applyNormalizeHeaders(records: Record<string, unknown>[]): { records: Record<string, unknown>[]; delta: string } {
  if (records.length === 0) return { records, delta: 'No fields to normalize.' };
  const mapping = new Map<string, string>();
  const used = new Set<string>();
  const allKeys = new Set<string>();
  records.forEach((r) => Object.keys(r).forEach((k) => allKeys.add(k)));
  let changed = 0;
  for (const k of allKeys) {
    let norm = normalizeHeaderName(k) || 'field';
    let final = norm;
    let n = 1;
    while (used.has(final)) {
      n++;
      final = `${norm}_${n}`;
    }
    used.add(final);
    mapping.set(k, final);
    if (final !== k) changed++;
  }
  const out = records.map((r) => {
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(r)) {
      next[mapping.get(k) ?? k] = v;
    }
    return next;
  });
  return {
    records: out,
    delta: changed === 0 ? 'Headers already normalized.' : `Normalized ${changed} header${changed === 1 ? '' : 's'} to snake_case.`
  };
}

function applyRenameField(records: Record<string, unknown>[], from: string, to: string): { records: Record<string, unknown>[]; delta: string } {
  if (!from || !to || from === to) {
    return { records, delta: 'Rename skipped — missing or identical field names.' };
  }
  let count = 0;
  const out = records.map((r) => {
    if (from in r) {
      count++;
      const { [from]: moved, ...rest } = r;
      return { ...rest, [to]: moved };
    }
    return r;
  });
  return {
    records: out,
    delta: count === 0 ? `Field "${from}" not found.` : `Renamed "${from}" → "${to}" on ${count} row${count === 1 ? '' : 's'}.`
  };
}

function applyRemoveField(records: Record<string, unknown>[], field: string): { records: Record<string, unknown>[]; delta: string } {
  if (!field) return { records, delta: 'No field specified to remove.' };
  let count = 0;
  const out = records.map((r) => {
    if (field in r) {
      count++;
      const { [field]: _drop, ...rest } = r;
      return rest;
    }
    return r;
  });
  return {
    records: out,
    delta: count === 0 ? `Field "${field}" not found.` : `Removed "${field}" from ${count} row${count === 1 ? '' : 's'}.`
  };
}

function applyReorderFields(records: Record<string, unknown>[], order: string): { records: Record<string, unknown>[]; delta: string } {
  const desired = order.split(',').map((s) => s.trim()).filter(Boolean);
  if (desired.length === 0) return { records, delta: 'No field order specified.' };
  const out = records.map((r) => {
    const next: Record<string, unknown> = {};
    for (const k of desired) if (k in r) next[k] = r[k];
    for (const k of Object.keys(r)) if (!(k in next)) next[k] = r[k];
    return next;
  });
  return { records: out, delta: `Reordered fields — leading with ${desired.slice(0, 4).join(', ')}${desired.length > 4 ? ' …' : ''}.` };
}

function applyKeyByField(records: Record<string, unknown>[], field: string): { records: Record<string, unknown>[] | Record<string, unknown>; delta: string } {
  if (!field) return { records, delta: 'No field specified to key by.' };
  const dict: Record<string, unknown> = {};
  let missing = 0;
  for (const r of records) {
    const v = r[field];
    if (v === undefined || v === null || v === '') {
      missing++;
      continue;
    }
    dict[String(v)] = r;
  }
  return {
    records: dict as unknown as Record<string, unknown>,
    delta: `Keyed ${records.length - missing} row${records.length - missing === 1 ? '' : 's'} by "${field}"${missing ? ` (skipped ${missing} missing)` : ''}.`
  };
}

function applyGroupByField(records: Record<string, unknown>[], field: string): { records: Record<string, unknown>[] | Record<string, unknown>; delta: string } {
  if (!field) return { records, delta: 'No field specified to group by.' };
  const groups: Record<string, Record<string, unknown>[]> = {};
  for (const r of records) {
    const v = r[field];
    const key = v === undefined || v === null || v === '' ? '(blank)' : String(v);
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }
  const groupCount = Object.keys(groups).length;
  return {
    records: groups as unknown as Record<string, unknown>,
    delta: `Grouped ${records.length} row${records.length === 1 ? '' : 's'} into ${groupCount} bucket${groupCount === 1 ? '' : 's'} by "${field}".`
  };
}

/* ------------------------------------------------------------------ */
/* Transform pipeline                                                  */
/* ------------------------------------------------------------------ */

export interface PipelineInput {
  records: Record<string, unknown>[];
  transforms: Transform[];
  target: TargetFormat;
}

export function runPipeline(input: PipelineInput): TransformResult {
  const warnings: string[] = [];
  const deltas: string[] = [];
  const rowsIn = input.records.length;
  const fieldsIn = summarizeFields(input.records).length;

  let current: Record<string, unknown>[] | Record<string, unknown> = clone(input.records);
  let finalKind: 'array' | 'dict' = 'array';

  for (const t of input.transforms) {
    if (!Array.isArray(current)) {
      // Most transforms expect array form. Stop if we've already produced a dict.
      warnings.push(`Skipped "${t.label}" — output is already a grouped/keyed object.`);
      continue;
    }
    let res: { records: Record<string, unknown>[] | Record<string, unknown>; delta: string };
    switch (t.kind) {
      case 'flatten':
        res = applyFlatten(current);
        break;
      case 'trim-whitespace':
        res = applyTrimWhitespace(current);
        break;
      case 'remove-duplicates':
        res = applyRemoveDuplicates(current);
        break;
      case 'drop-empty-columns':
        res = applyDropEmptyColumns(current);
        break;
      case 'normalize-headers':
        res = applyNormalizeHeaders(current);
        break;
      case 'rename-field':
        res = applyRenameField(current, t.params?.from ?? '', t.params?.to ?? '');
        break;
      case 'remove-field':
        res = applyRemoveField(current, t.param ?? '');
        break;
      case 'reorder-fields':
        res = applyReorderFields(current, t.param ?? '');
        break;
      case 'key-by-field':
        res = applyKeyByField(current, t.param ?? '');
        if (!Array.isArray(res.records)) finalKind = 'dict';
        break;
      case 'group-by-field':
        res = applyGroupByField(current, t.param ?? '');
        if (!Array.isArray(res.records)) finalKind = 'dict';
        break;
      default:
        res = { records: current, delta: `Unknown transform: ${t.kind}` };
    }
    current = res.records;
    deltas.push(res.delta);
  }

  let rowsOut: number;
  let fieldsOut: number;
  if (Array.isArray(current)) {
    rowsOut = current.length;
    fieldsOut = summarizeFields(current).length;
  } else {
    rowsOut = Object.keys(current).length;
    fieldsOut = 1;
  }

  // Serialize
  let outputString: string;
  const effectiveTarget: TargetFormat = finalKind === 'dict' ? 'json' : input.target;
  if (effectiveTarget === 'json') {
    outputString = JSON.stringify(current, null, 2);
  } else {
    if (!Array.isArray(current)) {
      warnings.push('CSV export not supported for grouped/keyed results — returning JSON instead.');
      outputString = JSON.stringify(current, null, 2);
    } else {
      outputString = serializeCsv(current);
    }
  }

  const summary: TransformSummary = {
    rowsIn,
    rowsOut,
    fieldsIn,
    fieldsOut,
    deltas
  };

  return {
    records: current,
    targetFormat: effectiveTarget,
    outputString,
    summary,
    warnings
  };
}

/* ------------------------------------------------------------------ */
/* Serialization                                                       */
/* ------------------------------------------------------------------ */

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  let s: string;
  if (typeof value === 'object') s = JSON.stringify(value);
  else s = String(value);
  const needsQuotes = /[",\r\n]/.test(s);
  if (needsQuotes) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function serializeCsv(records: Record<string, unknown>[]): string {
  if (records.length === 0) return '';
  const headerSet = new Set<string>();
  for (const r of records) Object.keys(r).forEach((k) => headerSet.add(k));
  const headers = Array.from(headerSet);
  const lines: string[] = [];
  lines.push(headers.map((h) => escapeCsvCell(h)).join(','));
  for (const r of records) {
    lines.push(headers.map((h) => escapeCsvCell(r[h])).join(','));
  }
  return lines.join('\n');
}

/* ------------------------------------------------------------------ */
/* Convenience                                                         */
/* ------------------------------------------------------------------ */

export function quickPreview(outputString: string, maxChars = 4000): string {
  if (outputString.length <= maxChars) return outputString;
  return outputString.slice(0, maxChars) + `\n\n… (${outputString.length - maxChars} more characters)`;
}

export function suggestedDefaults(parsed: ParsedInput): { target: TargetFormat; transforms: TransformKind[] } {
  const target: TargetFormat = parsed.format === 'csv' ? 'json' : 'csv';
  const suggested: TransformKind[] = [];
  if (parsed.structure.issues.some((i) => i.kind === 'malformed-spacing')) suggested.push('trim-whitespace');
  if (parsed.structure.hasNesting && target === 'csv') suggested.push('flatten');
  return { target, transforms: suggested };
}
