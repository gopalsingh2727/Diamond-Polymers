import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  ActionCodeSettings
} from 'firebase/auth';
import imageCompression from 'browser-image-compression';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChdzcyp0YHUy5-D8Sw1Xt6NS0Bl8DaaUQ",
  authDomain: "infnityreal.firebaseapp.com",
  projectId: "infnityreal",
  storageBucket: "infnityreal.firebasestorage.app",
  messagingSenderId: "258042580112",
  appId: "1:258042580112:web:3ebf572fd8345de7505c15",
  measurementId: "G-R2ZFL84DNP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

// Phone Authentication Functions

/**
 * Initialize invisible reCAPTCHA verifier
 * @param containerId - DOM element ID for reCAPTCHA container
 * @returns RecaptchaVerifier instance
 */
export function initializeRecaptcha(containerId: string): RecaptchaVerifier {
  const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('✅ reCAPTCHA verified');
    },
    'expired-callback': () => {
      console.log('⚠️ reCAPTCHA expired');
    }
  });
  return recaptchaVerifier;
}

/**
 * Send phone verification code via Firebase
 * @param phoneNumber - Phone number with country code (e.g., +919876543210)
 * @param recaptchaVerifier - RecaptchaVerifier instance
 * @returns ConfirmationResult for OTP verification
 */
export async function sendPhoneVerificationCode(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  try {
    // Ensure phone number has country code
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    console.log(`📱 Sending OTP to: ${formattedPhone}`);

    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    console.log('✅ OTP sent successfully');
    return confirmationResult;
  } catch (error: any) {
    console.error('❌ Failed to send OTP:', error);
    throw new Error(error.message || 'Failed to send verification code');
  }
}

/**
 * Verify OTP code and get Firebase ID token
 * @param confirmationResult - ConfirmationResult from sendPhoneVerificationCode
 * @param code - 6-digit OTP code
 * @returns Firebase ID token
 */
export async function verifyPhoneCode(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<string> {
  try {
    const result = await confirmationResult.confirm(code);
    const idToken = await result.user.getIdToken();
    console.log('✅ Phone verified successfully');
    return idToken;
  } catch (error: any) {
    console.error('❌ OTP verification failed:', error);
    throw new Error(error.code === 'auth/invalid-verification-code'
      ? 'Invalid OTP code'
      : error.message || 'Verification failed');
  }
}

/**
 * Get current user's ID token (if signed in)
 * @returns ID token or null
 */
export async function getFirebaseIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}

// Email Authentication Functions

/**
 * Send email verification link via Firebase
 * @param email - Email address to verify
 * @returns Promise<void>
 */
export async function sendEmailVerificationLink(email: string): Promise<void> {
  try {
    const actionCodeSettings: ActionCodeSettings = {
      url: `${window.location.origin}/verify-email`,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Save email locally to complete sign-in when user clicks link
    window.localStorage.setItem('emailForSignIn', email);
    console.log('✅ Email verification link sent to:', email);
  } catch (error: any) {
    console.error('❌ Failed to send email verification link:', error);
    throw new Error(error.message || 'Failed to send verification email');
  }
}

/**
 * Check if current URL is a sign-in email link
 * @returns boolean
 */
export function isEmailVerificationLink(): boolean {
  return isSignInWithEmailLink(auth, window.location.href);
}

/**
 * Complete email verification and get Firebase ID token
 * @param email - Email address (optional, will try to get from localStorage)
 * @returns Firebase ID token
 */
export async function completeEmailVerification(email?: string): Promise<string> {
  try {
    const emailToUse = email || window.localStorage.getItem('emailForSignIn');

    if (!emailToUse) {
      throw new Error('Email not found. Please enter your email again.');
    }

    if (!isSignInWithEmailLink(auth, window.location.href)) {
      throw new Error('Invalid verification link');
    }

    const result = await signInWithEmailLink(auth, emailToUse, window.location.href);
    const idToken = await result.user.getIdToken();

    // Clear stored email
    window.localStorage.removeItem('emailForSignIn');

    console.log('✅ Email verified successfully');
    return idToken;
  } catch (error: any) {
    console.error('❌ Email verification failed:', error);
    throw new Error(error.message || 'Email verification failed');
  }
}

/**
 * Compress image if it's too large
 * @param file - File to compress
 * @param maxSizeMB - Maximum size in MB (default 10MB)
 * @returns Compressed file or original if already small enough
 */
export async function compressImageIfNeeded(file: File, maxSizeMB: number = 10): Promise<File> {
  const fileSizeMB = file.size / 1024 / 1024;

  console.log(`📦 Original file size: ${fileSizeMB.toFixed(2)} MB`);

  // If file is already smaller than max, return it
  if (fileSizeMB <= maxSizeMB) {
    console.log('✅ File size is acceptable, no compression needed');
    return file;
  }

  // Only compress images
  if (!file.type.startsWith('image/')) {
    console.log('⚠️ File is not an image, skipping compression');
    return file;
  }

  console.log('🔄 Compressing image...');

  try {
    const options = {
      maxSizeMB: maxSizeMB,
      maxWidthOrHeight: 1920, // Max dimension
      useWebWorker: true,
      fileType: file.type as any
    };

    const compressedFile = await imageCompression(file, options);
    const compressedSizeMB = compressedFile.size / 1024 / 1024;

    console.log(`✅ Compressed to: ${compressedSizeMB.toFixed(2)} MB (${((1 - compressedSizeMB / fileSizeMB) * 100).toFixed(1)}% reduction)`);

    return compressedFile;
  } catch (error) {
    console.error('❌ Compression failed:', error);
    return file; // Return original if compression fails
  }
}

/**
 * Upload file to Firebase Storage
 * @param file - File to upload
 * @param folder - Folder name in storage (default: 'order-files')
 * @returns Download URL
 */
export async function uploadFileToFirebase(
  file: File,
  folder: string = 'order-files'
): Promise<{ url: string; fileName: string }> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}_${randomString}_${file.name}`;
    const filePath = `${folder}/${fileName}`;

    console.log(`📤 Uploading to Firebase: ${filePath}`);

    // Create a reference to the file location
    const fileRef = ref(storage, filePath);

    // Upload the file
    const snapshot = await uploadBytes(fileRef, file, {
      contentType: file.type,
    });

    console.log('✅ File uploaded successfully');

    // Get the download URL
    const url = await getDownloadURL(snapshot.ref);

    console.log('✅ Download URL obtained:', url);

    return {
      url,
      fileName: file.name
    };
  } catch (error: any) {
    console.error('❌ Firebase upload failed:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Complete file upload workflow: validate, compress, and upload
 * @param file - File to process
 * @param maxSizeMB - Maximum size in MB
 * @param folder - Storage folder
 * @returns File info with URL
 */
export async function processAndUploadFile(
  file: File,
  maxSizeMB: number = 10,
  folder: string = 'order-files'
): Promise<{
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  originalSize: number;
  compressed: boolean;
}> {
  const originalSize = file.size;

  // Validate file size (before compression)
  const fileSizeMB = file.size / 1024 / 1024;
  if (fileSizeMB > 50) { // Hard limit: 50MB
    throw new Error(`File is too large (${fileSizeMB.toFixed(1)} MB). Maximum allowed: 50 MB`);
  }

  console.log('🚀 Starting file processing...');

  // Step 1: Compress if needed
  const processedFile = await compressImageIfNeeded(file, maxSizeMB);
  const compressed = processedFile.size < originalSize;

  // Step 2: Upload to Firebase
  const { url, fileName } = await uploadFileToFirebase(processedFile, folder);

  return {
    fileName,
    fileSize: processedFile.size,
    fileType: processedFile.type,
    fileUrl: url,
    originalSize,
    compressed
  };
}

export { storage, auth };
