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
  // Firebase Storage file (replaces htmlBody for large files)
  fileUrl?:  string;
  fileType?: 'html' | 'build' | '';
  fileName?: string;
  fileSize?: number;
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
