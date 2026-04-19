/**
 * firebaseStorage.ts
 *
 * Firebase Storage service for dashboard template file uploads.
 *
 * Strategy — TWO upload paths:
 *   1. DIRECT (small files < 5 MB):  initializeApp + uploadBytes  via Firebase SDK
 *   2. SIGNED URL (large files > 5 MB):  ask backend for a signed PUT URL,
 *      then PUT directly to Firebase Storage — zero Lambda data transfer,
 *      reduces MongoDB billing, no 50 MB payload problems.
 *
 * The bucket is: whatsapp-main-9991e.appspot.com  (same as backend)
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  FirebaseStorage,
} from 'firebase/storage';

// ─── Firebase config (same project the backend uses) ──────────────────────────
// These are public-safe values — they identify your project but do not grant
// any access on their own (Storage Rules + backend auth gate access).
const FIREBASE_CONFIG = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'whatsapp-main-9991e.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'whatsapp-main-9991e',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'whatsapp-main-9991e.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '',
};

const BACKEND_URL = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000';
const API_KEY     = import.meta.env.VITE_API_KEY as string;

// 5 MB threshold — below this use SDK direct upload, above use signed URL
const DIRECT_UPLOAD_LIMIT = 5 * 1024 * 1024;

// ─── Singleton Firebase app ────────────────────────────────────────────────────
function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(FIREBASE_CONFIG);
}

function getFirebaseStorage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}

// ─── Auth headers for backend calls ───────────────────────────────────────────
function buildHeaders(): Record<string, string> {
  const token    = localStorage.getItem('authToken') || '';
  const branchId = localStorage.getItem('selectedBranch') || '';
  const h: Record<string, string> = {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`,
  };
  if (API_KEY)  h['x-api-key']         = API_KEY;
  if (branchId) h['x-selected-branch'] = branchId;
  return h;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface UploadResult {
  downloadUrl: string;
  storagePath: string;
  fileName:    string;
  fileSize:    number;
  fileType:    'html' | 'build';
}

export interface UploadProgress {
  loaded: number;
  total:  number;
  pct:    number;    // 0-100
  phase:  'preparing' | 'uploading' | 'finalising' | 'done' | 'error';
}

/**
 * uploadTemplateFile
 *
 * Uploads an HTML file or inlined build HTML string to Firebase Storage.
 * Returns the public download URL + metadata to save in MongoDB.
 *
 * @param content       Raw HTML string
 * @param fileName      e.g. "my-template.html"
 * @param fileType      'html' | 'build'
 * @param onProgress    Optional progress callback
 * @param signedUrlPath Backend endpoint for signed URL (default: dashboard-type)
 */
export async function uploadTemplateFile(
  content:    string,
  fileName:   string,
  fileType:   'html' | 'build',
  onProgress?: (p: UploadProgress) => void,
  signedUrlPath?: string,
): Promise<UploadResult> {
  const blob     = new Blob([content], { type: 'text/html; charset=utf-8' });
  const fileSize = blob.size;

  onProgress?.({ loaded: 0, total: fileSize, pct: 0, phase: 'preparing' });

  if (fileSize <= DIRECT_UPLOAD_LIMIT) {
    return _directUpload(blob, fileName, fileType, fileSize, onProgress, signedUrlPath);
  } else {
    return _signedUrlUpload(content, blob, fileName, fileType, fileSize, onProgress, signedUrlPath);
  }
}

/**
 * deleteTemplateFile
 *
 * Deletes a file from Firebase Storage by its download URL.
 * Called when a dashboard type is deleted or a new file replaces an old one.
 */
export async function deleteTemplateFile(downloadUrl: string): Promise<void> {
  try {
    // Extract storage path from URL
    // Format: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encoded-path>?alt=media&token=...
    const match = downloadUrl.match(/\/o\/([^?]+)/);
    if (!match) return;
    const storagePath = decodeURIComponent(match[1]);
    const storage     = getFirebaseStorage();
    const fileRef     = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (e: any) {
    // Non-fatal — file may already be gone
    console.warn('[firebaseStorage] deleteTemplateFile error:', e?.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

async function _directUpload(
  blob:       Blob,
  fileName:   string,
  fileType:   'html' | 'build',
  fileSize:   number,
  onProgress?: (p: UploadProgress) => void,
  signedUrlPath?: string,
): Promise<UploadResult> {
  onProgress?.({ loaded: 0, total: fileSize, pct: 10, phase: 'uploading' });

  const storage     = getFirebaseStorage();
  const branchId    = localStorage.getItem('selectedBranch') || 'unknown';
  const ts          = Date.now();
  const safeName    = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const folder      = signedUrlPath?.includes('print-type') ? 'print-templates' : 'dashboard-templates';
  const storagePath = `${folder}/${branchId}/${ts}_${safeName}`;
  const fileRef     = ref(storage, storagePath);

  await uploadBytes(fileRef, blob, { contentType: 'text/html; charset=utf-8' });
  onProgress?.({ loaded: fileSize, total: fileSize, pct: 80, phase: 'finalising' });

  const downloadUrl = await getDownloadURL(fileRef);
  onProgress?.({ loaded: fileSize, total: fileSize, pct: 100, phase: 'done' });

  return { downloadUrl, storagePath, fileName, fileSize, fileType };
}

async function _signedUrlUpload(
  content:    string,
  blob:       Blob,
  fileName:   string,
  fileType:   'html' | 'build',
  fileSize:   number,
  onProgress?: (p: UploadProgress) => void,
  signedUrlPath?: string,
): Promise<UploadResult> {
  onProgress?.({ loaded: 0, total: fileSize, pct: 5, phase: 'preparing' });

  const endpoint = signedUrlPath || 'v2/dashboard-type/upload-url';
  // Step 1 — ask backend for a signed URL
  const res = await fetch(`${BACKEND_URL}/${endpoint}`, {
    method:  'POST',
    headers: buildHeaders(),
    body:    JSON.stringify({ fileName, fileType, mimeType: 'text/html; charset=utf-8' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.message ?? `Signed URL request failed (${res.status})`);
  }
  const { data } = await res.json();
  const { uploadUrl, downloadUrl, storagePath } = data;

  onProgress?.({ loaded: 0, total: fileSize, pct: 15, phase: 'uploading' });

  // Step 2 — PUT directly to Firebase Storage (no Lambda in the path)
  // Use XMLHttpRequest for real progress events on large files
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', 'text/html; charset=utf-8');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = 15 + Math.round((e.loaded / e.total) * 75);
        onProgress?.({ loaded: e.loaded, total: e.total, pct, phase: 'uploading' });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Firebase upload failed: ${xhr.status} ${xhr.statusText}`));
    };
    xhr.onerror = () => reject(new Error('Network error during Firebase upload'));

    xhr.send(blob);
  });

  onProgress?.({ loaded: fileSize, total: fileSize, pct: 95, phase: 'finalising' });

  // Step 3 — make the file publicly readable
  // The signed URL already makes it readable; the download URL is returned by the backend
  onProgress?.({ loaded: fileSize, total: fileSize, pct: 100, phase: 'done' });

  return { downloadUrl, storagePath, fileName, fileSize, fileType };
}
