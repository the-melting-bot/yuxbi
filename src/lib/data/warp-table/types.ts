/**
 * Warp Table — Type Definitions
 * Client-side data transformation workspace.
 */

export type InputFormat = 'csv' | 'json' | 'unknown';
export type TargetFormat = 'json' | 'csv';

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'null' | 'object' | 'array' | 'mixed';

export interface FieldSummary {
  key: string;
  type: FieldType;
  sample: string;
  nullCount: number;
  uniqueCount: number;
}

export interface InputStructure {
  detectedFormat: InputFormat;
  rowCount: number;
  fieldCount: number;
  fields: FieldSummary[];
  hasNesting: boolean;
  nestingDepth: number;
  issues: StructureIssue[];
  rawByteLength: number;
}

export type StructureIssue = {
  kind: 'blank-header' | 'duplicate-column' | 'inconsistent-rows' | 'malformed-spacing' | 'parse-warning';
  message: string;
};

export type TransformKind =
  | 'flatten'
  | 'trim-whitespace'
  | 'remove-duplicates'
  | 'drop-empty-columns'
  | 'normalize-headers'
  | 'key-by-field'
  | 'group-by-field'
  | 'rename-field'
  | 'remove-field'
  | 'reorder-fields';

export interface Transform {
  id: string;
  kind: TransformKind;
  label: string;
  // Optional params for param-bearing transforms
  param?: string; // e.g. field name
  params?: Record<string, string>;
}

export interface TransformResult {
  records: Record<string, unknown>[] | Record<string, unknown>;
  targetFormat: TargetFormat;
  outputString: string;
  summary: TransformSummary;
  warnings: string[];
}

export interface TransformSummary {
  rowsIn: number;
  rowsOut: number;
  fieldsIn: number;
  fieldsOut: number;
  deltas: string[]; // human-readable change notes, like "Removed 14 duplicate rows"
}

export interface SampleDataset {
  id: string;
  name: string;
  description: string;
  format: InputFormat;
  content: string;
}

export const LOADING_PHRASES = [
  'Inspecting structure',
  'Mapping fields',
  'Warping table shape',
  'Reshaping records',
  'Rewriting headers',
  'Calibrating output',
  'Preparing export'
];
