// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardType {
  _id: string;
  typeName: string;
  typeCode: string;
  description?: string;
  category?: string;
  htmlHeader?: string;
  htmlBody?: string;
  htmlFooter?: string;
  css?: string;
  js?: string;
}

export type Step = 'date' | 'loading' | 'list' | 'preview';

export interface CacheFile {
  filename: string;
  filepath: string;
  fromDate: string;
  toDate: string;
  total: number;
  savedAt: number;
  ageMinutes: number;
  sizeKB: number;
}
