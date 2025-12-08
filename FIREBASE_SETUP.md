# Firebase File Upload Setup Guide

## Overview

The file upload system now uses **Firebase Storage** with automatic image compression. Files are:
- ✅ Validated (50MB hard limit)
- ✅ Compressed if over 10MB (images only)
- ✅ Uploaded to Firebase Storage
- ✅ Stored with permanent URLs

## Features

1. **File Size Validation**: Maximum 50MB per file
2. **Smart Compression**: Images over 10MB are automatically compressed
3. **Firebase Storage**: Files stored securely in cloud
4. **Permanent URLs**: Files accessible via permanent download URLs
5. **Eye Icon Preview**: Click eye icon to view uploaded files

## Setup Instructions

### Step 1: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **whatsapp-main-9991e**
3. Click the **gear icon** → **Project settings**
4. Scroll down to **Your apps** section
5. If you don't have a web app, click **Add app** → **Web** (</>) icon
6. Copy these values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",           // Copy this
  authDomain: "...",
  projectId: "whatsapp-main-9991e",
  storageBucket: "whatsapp-main-9991e.appspot.com",
  messagingSenderId: "...",     // Copy this
  appId: "1:..."                // Copy this
};
```

### Step 2: Enable Firebase Storage

1. In Firebase Console, go to **Storage** (left sidebar)
2. Click **Get Started**
3. Choose **Production mode** or **Test mode**
4. For security rules, use:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /order-files/{allPaths=**} {
      allow read: if true;  // Public read
      allow write: if request.auth != null || request.resource.size < 50 * 1024 * 1024;  // 50MB limit
    }
  }
}
```

### Step 3: Update .env File

Edit `/main27/.env` and replace the placeholder values:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBqKVvMzX_YOUR_ACTUAL_API_KEY_HERE
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_ACTUAL_SENDER_ID_HERE
VITE_FIREBASE_APP_ID=YOUR_ACTUAL_APP_ID_HERE
```

### Step 4: Restart the App

```bash
cd main27
npm run dev
```

## How It Works

### Upload Flow

1. **User selects file** → File picker opens
2. **Validation** → Check if file is under 50MB
3. **Compression** → If image > 10MB, compress it
4. **Upload** → Upload to Firebase Storage
5. **Save** → Store Firebase URL in database

### File Storage Structure

```
Firebase Storage
└── order-files/
    ├── 1234567890_abc123_image.png
    ├── 1234567891_def456_document.pdf
    └── ...
```

### File Data Structure

When saved to database:

```javascript
{
  fileName: "image.png",
  fileSize: 2048576,  // Size in bytes
  fileType: "image/png",
  fileUrl: "https://firebasestorage.googleapis.com/v0/b/.../order-files/...",
  originalSize: 5242880,  // Original size before compression
  compressed: true  // Whether compression was applied
}
```

## Testing

### Test File Upload

1. **Create a new order**
2. **Add an option** with a file specification
3. **Click "Choose File"**
4. **Select an image** (try a large one, > 10MB)
5. **Wait for upload** (you'll see "Loading...")
6. **Success message** appears
7. **Eye icon** (👁️) appears in table
8. **Click eye icon** → View the uploaded file

### Console Logs

Open browser console (F12) to see:

```
📁 File selected: image.png Type: image/png Size: 12.45 MB
📦 Original file size: 12.45 MB
🔄 Compressing image...
✅ Compressed to: 3.21 MB (74.2% reduction)
📤 Uploading to Firebase: order-files/1234567890_abc123_image.png
✅ File uploaded successfully
✅ Download URL obtained: https://...
```

## Troubleshooting

### Error: "Failed to upload file: Firebase: Error"

**Solution**: Check Firebase credentials in `.env` file

### Error: "File is too large"

**Solution**: File is over 50MB. Compress manually before uploading.

### Eye icon shows "URL not available"

**Solution**: This happens with files uploaded before Firebase integration. Re-upload the file.

### Images not compressing

**Solution**:
- Only images are compressed (PNG, JPG, GIF, WebP)
- PDFs and documents are uploaded as-is
- If image is already under 10MB, no compression is applied

## File Size Limits

| File Type | Max Size | Compression |
|-----------|----------|-------------|
| Images (PNG, JPG, GIF, WebP, SVG) | 50MB | Yes (if > 10MB) |
| PDFs | 50MB | No |
| Documents (DOC, DOCX, XLS) | 50MB | No |
| Other files | 50MB | No |

## Security Notes

1. **Firebase Storage Rules**: Currently set for testing. Update for production.
2. **API Keys**: Never commit `.env` file to Git (already in `.gitignore`)
3. **File Access**: URLs are public but unguessable (random filenames)
4. **Size Limits**: Enforced both client-side and Firebase rules

## Cost Optimization

Firebase Storage pricing (as of 2024):
- **Storage**: $0.026/GB/month
- **Download**: $0.12/GB
- **Upload**: Free

**Estimated costs** for 1000 orders with 2MB files:
- Storage: ~$0.05/month
- Very affordable for small-medium businesses

## Old Files (Before Firebase)

Files uploaded before this update won't have URLs. To fix:
1. **Re-upload** the file in edit mode
2. **OR** Delete and create new order with the file

## Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Verify Firebase credentials in `.env`
3. Ensure Firebase Storage is enabled
4. Check Firebase Storage rules

---

**Firebase Project**: whatsapp-main-9991e
**Storage Bucket**: whatsapp-main-9991e.appspot.com
**File Location**: `order-files/` folder
