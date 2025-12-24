# Security Fix Guide - Step-by-Step Instructions

**Date:** December 23, 2025
**Estimated Time:** 4-6 hours for critical fixes
**Skill Level:** Intermediate

---

## 📋 Table of Contents

1. [Phase 1: Emergency - Revoke Exposed Secrets (15 mins)](#phase-1-emergency)
2. [Phase 2: Fix Critical Code Vulnerabilities (2-3 hours)](#phase-2-critical)
3. [Phase 3: Fix High Priority Issues (1-2 hours)](#phase-3-high-priority)
4. [Phase 4: Implement Best Practices (1-2 hours)](#phase-4-best-practices)
5. [Verification & Testing](#verification)

---

## Phase 1: Emergency - Revoke Exposed Secrets (15 mins)

### Step 1.1: Revoke GitHub Tokens

**⚠️ DO THIS IMMEDIATELY - YOUR REPOSITORY IS COMPROMISED**

1. Go to: https://github.com/settings/tokens
2. Find and **DELETE** these tokens:
   - `github_pat_11BCA7VAQ0NbCAKKscfgJV_...`
   - `github_pat_11BCA7VAQ0MretP3ry8Dq7_...`
3. Generate a new token (if needed for CI/CD):
   - Click "Generate new token" → "Classic"
   - Select minimal scopes: `repo` (if needed)
   - Copy the new token to a secure password manager
   - **NEVER commit this token to git**

### Step 1.2: Request New API Key

Contact your backend team:
```
Subject: URGENT - API Key Rotation Required

Message:
The API key `27infinity.in_5f84c89315f74a2db149c06a93cf4820` was
accidentally exposed in our git repository. Please:

1. Revoke this key immediately
2. Generate a new API key
3. Send it to me via secure channel (not email)

Timeline: ASAP
```

### Step 1.3: Clean Git History

**⚠️ WARNING: This rewrites git history. Coordinate with your team first!**

```bash
# Navigate to project
cd /Users/gopalsingh/Desktop/27/27mainAll/main27

# Backup current state
git branch backup-before-cleanup

# Remove sensitive files from ALL commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env token" \
  --prune-empty --tag-name-filter cat -- --all

# Update .gitignore to prevent future commits
echo "" >> .gitignore
echo "# Security - Never commit these" >> .gitignore
echo "token" >> .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# Commit the updated .gitignore
git add .gitignore
git commit -m "Security: Add token to .gitignore"

# Force push (if this is acceptable for your team)
# ONLY DO THIS IF YOU'RE SURE
# git push origin --force --all
```

### Step 1.4: Update Environment Files

```bash
# Delete the compromised files
rm .env
rm token

# Create new .env from template
cp .env.example .env

# Edit .env with new credentials (use a text editor)
nano .env
```

In `.env`, update:
```env
# Use NEW API key from backend team
VITE_API_KEY=YOUR_NEW_API_KEY_HERE

# Use NEW GitHub token (if needed)
GH_TOKEN=YOUR_NEW_GITHUB_TOKEN_HERE

# Production endpoints
VITE_API_27INFINITY_IN=https://api.27infinity.in
VITE_WEBSOCKET_URL=wss://ws.27infinity.in/dev
```

**✅ Phase 1 Complete - Secrets secured**

---

## Phase 2: Fix Critical Code Vulnerabilities (2-3 hours)

### Step 2.1: Install Security Dependencies

```bash
cd /Users/gopalsingh/Desktop/27/27mainAll/main27

# Install DOMPurify for XSS protection
npm install dompurify
npm install --save-dev @types/dompurify

# Install security linting
npm install --save-dev eslint-plugin-security

# Verify expr-eval is installed (should already be there)
npm list expr-eval
```

### Step 2.2: Fix eval() Injection Vulnerabilities

**File 1:** `src/componest/second/menu/hooks/useMachineTableConfig.ts`

```bash
# Open the file
nano src/componest/second/menu/hooks/useMachineTableConfig.ts
```

Find line ~187 and replace:

```typescript
// BEFORE (line ~187):
const result = eval(formula);

// AFTER:
import { Parser } from 'expr-eval';

// Replace the eval() line with:
try {
  const parser = new Parser();
  const result = parser.evaluate(formula);
  return result;
} catch (error) {
  console.error('Formula evaluation error:', error);
  return 0;
}
```

**Complete Fix for useMachineTableConfig.ts:**

Add import at the top:
```typescript
import { Parser } from 'expr-eval';
```

Replace the eval section (around line 187):
```typescript
// Find this code:
const evaluateFormula = (formula: string): number => {
  try {
    // OLD: const result = eval(formula);

    // NEW:
    const parser = new Parser();
    const result = parser.evaluate(formula);

    return typeof result === 'number' ? result : 0;
  } catch (error) {
    console.error('Formula evaluation failed:', error);
    return 0;
  }
};
```

**File 2:** `src/componest/second/menu/CreateOders/CreateOders.tsx`

Find line ~373:

```typescript
// BEFORE:
const result = eval(evalFormula);

// AFTER:
import { Parser } from 'expr-eval';

// At the top of the file, add:
const formulaParser = new Parser();

// Replace line 373:
try {
  const result = formulaParser.evaluate(evalFormula);
  return typeof result === 'number' ? Math.round(result * 100) / 100 : result;
} catch (e) {
  console.error('Error calculating formula:', formula, e);
  return '';
}
```

**File 3:** `src/componest/second/menu/Edit/EditMachine/EditMachineNew.tsx`

Line ~234:

```typescript
// BEFORE:
const result = eval(formula);

// AFTER:
import { Parser } from 'expr-eval';

const parser = new Parser();
try {
  const result = parser.evaluate(formula);
  return typeof result === 'number' ? result : 0;
} catch (error) {
  console.error('Formula error:', error);
  return 0;
}
```

**File 4:** `src/componest/second/menu/Edit/EditMachine/EditMachine.tsx`

Line ~282 - Same fix as above.

### Step 2.3: Fix XSS in ChatMessage Component

Edit: `src/components/chat/ChatMessage.tsx`

```typescript
// At the top of the file, add import:
import DOMPurify from 'dompurify';

// Find line ~83:
// BEFORE:
<div dangerouslySetInnerHTML={{ __html: formatContent(content) }} />

// AFTER:
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(formatContent(content), {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'title', 'target']
  })
}} />
```

### Step 2.4: Fix document.write() Vulnerabilities

**File 1:** `src/componest/second/menu/CreateOders/optionsSection/InlineOptionsInput.tsx`

Line ~706:

```typescript
// BEFORE:
printWin.document.write(printContent);

// AFTER:
import DOMPurify from 'dompurify';

const printDoc = printWin.document;
printDoc.open();
printDoc.write('<!DOCTYPE html><html><head><title>Print Preview</title>');
printDoc.write('<style>body { font-family: Arial, sans-serif; }</style>');
printDoc.write('</head><body>');
printDoc.write(DOMPurify.sanitize(printContent, {
  ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'table', 'tr', 'td', 'th', 'br'],
  ALLOWED_ATTR: ['class', 'style']
}));
printDoc.write('</body></html>');
printDoc.close();
```

**File 2:** `src/componest/second/menu/CreateOders/stepContainer.tsx`

Lines ~801 and ~1109 - Same fix as above.

### Step 2.5: Remove Hardcoded API Key Fallback

Edit: `src/utils/crudHelpers.ts`

```typescript
// BEFORE (line 4):
const API_KEY = import.meta.env.VITE_API_KEY || '27infinity.in_5f84c89315f74a2db149c06a93cf4820';

// AFTER:
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error('CRITICAL: VITE_API_KEY environment variable is not set. Check your .env file.');
}
```

**✅ Phase 2 Complete - Critical vulnerabilities fixed**

---

## Phase 3: Fix High Priority Issues (1-2 hours)

### Step 3.1: Add Input Sanitization to Forms

**File:** `src/componest/second/menu/SystemSetting/create/createDeviceAccess.tsx`

```typescript
// Add imports at the top:
import { prepareSecureFormData, isSuspiciousInput } from '../../../../utils/security';

// In handleSubmit function, BEFORE the API call:
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const { deviceName, password, confirmPassword, branchId } = formData;

  // Existing validations...
  if (!deviceName || !password || !confirmPassword || !branchId) {
    toast.addToast('error', 'All fields are required');
    return;
  }

  // NEW: Security checks
  if (isSuspiciousInput(deviceName)) {
    toast.addToast('error', 'Device name contains invalid characters');
    return;
  }

  if (isSuspiciousInput(branchId)) {
    toast.addToast('error', 'Invalid branch selection');
    return;
  }

  // Existing password validation...
  if (password !== confirmPassword) {
    toast.addToast('error', 'Passwords do not match');
    return;
  }

  // NEW: Sanitize before sending
  const sanitizedData = prepareSecureFormData({
    deviceName,
    location: branchId,
    password,
    confirmPassword,
  });

  handleSave(
    () => dispatch(createDeviceAccess(sanitizedData)),
    {
      successMessage: 'Device Access created successfully!',
      onSuccess: () => {
        setFormData({
          deviceName: '',
          password: '',
          confirmPassword: '',
          branchId: '',
        });
      }
    }
  );
};
```

**Repeat this pattern for other forms:**
- `src/componest/second/menu/create/machine/ViewTemplateWizard.tsx`
- `src/componest/second/menu/create/CreateCustomer/*`
- `src/componest/second/menu/create/CreateOperator/*`

### Step 3.2: Encrypt Tokens in localStorage (Electron Only)

**File:** `electron/main.ts`

Add IPC handler for secure storage:

```typescript
import { safeStorage } from 'electron';

// Add after app.whenReady()
ipcMain.handle('secure-storage:encrypt', async (_, text: string) => {
  if (safeStorage.isEncryptionAvailable()) {
    const buffer = safeStorage.encryptString(text);
    return buffer.toString('base64');
  }
  return text; // Fallback to plaintext if encryption unavailable
});

ipcMain.handle('secure-storage:decrypt', async (_, encrypted: string) => {
  if (safeStorage.isEncryptionAvailable()) {
    const buffer = Buffer.from(encrypted, 'base64');
    return safeStorage.decryptString(buffer);
  }
  return encrypted; // Fallback
});
```

**File:** `electron/preload.ts` (create if doesn't exist)

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('secureStorage', {
  encrypt: (text: string) => ipcRenderer.invoke('secure-storage:encrypt', text),
  decrypt: (encrypted: string) => ipcRenderer.invoke('secure-storage:decrypt', encrypted)
});
```

**File:** `src/utils/secureStorage.ts` (create new file)

```typescript
/**
 * Secure storage wrapper for tokens
 */

declare global {
  interface Window {
    secureStorage?: {
      encrypt: (text: string) => Promise<string>;
      decrypt: (encrypted: string) => Promise<string>;
    };
  }
}

export const storeTokenSecurely = async (key: string, token: string): Promise<void> => {
  try {
    if (window.secureStorage) {
      // Electron: Use encrypted storage
      const encrypted = await window.secureStorage.encrypt(token);
      localStorage.setItem(key, encrypted);
    } else {
      // Web fallback: Use plain localStorage (not ideal but functional)
      console.warn('Secure storage not available, using localStorage');
      localStorage.setItem(key, token);
    }
  } catch (error) {
    console.error('Failed to store token securely:', error);
    localStorage.setItem(key, token); // Fallback
  }
};

export const getTokenSecurely = async (key: string): Promise<string | null> => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    if (window.secureStorage) {
      // Decrypt if using secure storage
      return await window.secureStorage.decrypt(stored);
    }
    return stored;
  } catch (error) {
    console.error('Failed to retrieve token securely:', error);
    return localStorage.getItem(key); // Fallback
  }
};

export const removeTokenSecurely = (key: string): void => {
  localStorage.removeItem(key);
};
```

**Update:** `src/componest/redux/login/authActions.ts`

```typescript
// Add import:
import { storeTokenSecurely, getTokenSecurely, removeTokenSecurely } from '../../../utils/secureStorage';

// Replace all localStorage.setItem for tokens:
// BEFORE:
localStorage.setItem("authToken", token);

// AFTER:
await storeTokenSecurely("authToken", token);

// Replace all localStorage.getItem for tokens:
// BEFORE:
const token = localStorage.getItem("authToken");

// AFTER:
const token = await getTokenSecurely("authToken");

// Replace localStorage.removeItem:
// BEFORE:
localStorage.removeItem("authToken");

// AFTER:
removeTokenSecurely("authToken");
```

### Step 3.3: Improve CSP for Production

**File:** `electron/main.ts`

```typescript
// Replace the CSP_POLICY constant:
const isDev = !!VITE_DEV_SERVER_URL;

const CSP_POLICY = [
  "default-src 'self'",
  // Only allow unsafe-eval and unsafe-inline in development
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self'", // NO unsafe-* in production
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' http://localhost:* ws://localhost:* wss://* https://api.github.com https://*.27infinity.in https://*.execute-api.ap-south-1.amazonaws.com",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "object-src 'none'", // Prevent Flash/Java
  "base-uri 'self'", // Prevent base tag injection
  "form-action 'self'", // Prevent form hijacking
  "frame-ancestors 'none'", // Prevent clickjacking
].join('; ');
```

### Step 3.4: Add Rate Limiting to API Calls

**File:** `src/utils/apiRateLimiter.ts` (create new)

```typescript
import { checkRateLimit } from './security';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

const defaultConfig: RateLimitConfig = {
  maxAttempts: 10,
  windowMs: 60000 // 1 minute
};

export const withRateLimit = async <T>(
  action: string,
  apiCall: () => Promise<T>,
  config: RateLimitConfig = defaultConfig,
  onRateLimitExceeded?: (resetIn: number) => void
): Promise<T> => {
  const rateCheck = checkRateLimit(action, config.maxAttempts, config.windowMs);

  if (!rateCheck.allowed) {
    const resetInSeconds = Math.ceil(rateCheck.resetIn / 1000);
    const error = new Error(`Rate limit exceeded. Try again in ${resetInSeconds} seconds.`);

    if (onRateLimitExceeded) {
      onRateLimitExceeded(rateCheck.resetIn);
    }

    throw error;
  }

  return apiCall();
};
```

**Usage in Redux actions:**

```typescript
// Example in deviceAccessActions.ts
import { withRateLimit } from '../../utils/apiRateLimiter';

export const createDeviceAccess = (data: any) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      dispatch({ type: DEVICE_ACCESS_CREATE_REQUEST });

      const token = getToken(getState);

      // Wrap API call with rate limiting
      const response = await withRateLimit(
        'createDeviceAccess',
        () => axios.post(
          `${baseUrl}/device-access`,
          data,
          { headers: getHeaders(token) }
        ),
        { maxAttempts: 5, windowMs: 60000 },
        (resetIn) => {
          console.warn(`Rate limit hit, reset in ${resetIn}ms`);
        }
      );

      dispatch({
        type: DEVICE_ACCESS_CREATE_SUCCESS,
        payload: response.data,
      });

      return response.data;
    } catch (error: any) {
      // Handle rate limit errors
      if (error.message.includes('Rate limit')) {
        dispatch({
          type: DEVICE_ACCESS_CREATE_FAIL,
          payload: error.message,
        });
        return;
      }

      // Handle other errors...
    }
  };
};
```

**✅ Phase 3 Complete - High priority issues fixed**

---

## Phase 4: Best Practices (1-2 hours)

### Step 4.1: Strengthen Password Validation

**File:** `src/utils/security.ts`

Replace the `validatePassword` function:

```typescript
/**
 * Validate password strength (Enhanced)
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Minimum length increased to 12
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }

  // Maximum length check (prevent DoS)
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  // Character requirements
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)');
  }

  // Check for common passwords
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty', 'abc123',
    'password1', 'admin', 'admin123', 'letmein', 'welcome',
    '123456789', 'Password123', 'Password123!', 'Welcome123'
  ];

  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password is too common or contains common patterns');
  }

  // Check for sequential characters
  const sequential = ['123', '234', '345', '456', '567', '678', '789', 'abc', 'bcd', 'cde'];
  if (sequential.some(seq => password.toLowerCase().includes(seq))) {
    errors.push('Password contains sequential characters');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
```

### Step 4.2: Enforce HTTPS in Production

**File:** `src/main.tsx` or `src/App.tsx`

Add at the very top:

```typescript
// Enforce HTTPS in production
if (import.meta.env.PROD) {
  const apiUrl = import.meta.env.VITE_API_27INFINITY_IN;
  const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;

  if (apiUrl && !apiUrl.startsWith('https://')) {
    throw new Error(
      `SECURITY ERROR: Production API must use HTTPS. Current: ${apiUrl}`
    );
  }

  if (wsUrl && !wsUrl.startsWith('wss://')) {
    throw new Error(
      `SECURITY ERROR: Production WebSocket must use WSS. Current: ${wsUrl}`
    );
  }
}
```

### Step 4.3: Add Security Linting

**File:** `.eslintrc.cjs` or `.eslintrc.json`

```javascript
module.exports = {
  // ... existing config
  plugins: [
    // ... existing plugins
    'security'
  ],
  extends: [
    // ... existing extends
    'plugin:security/recommended'
  ],
  rules: {
    // ... existing rules
    'security/detect-eval-with-expression': 'error',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-require': 'warn',
    'security/detect-object-injection': 'warn',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'error',
  }
};
```

### Step 4.4: Add Pre-commit Hooks

```bash
# Install husky for git hooks
npm install --save-dev husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm audit"
```

Create: `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run linter
npm run lint

# Check for security issues
npm audit --production

# Prevent committing secrets
if git diff --cached --name-only | grep -E "\.env$|^token$"; then
  echo "❌ ERROR: Attempting to commit .env or token file!"
  echo "These files contain secrets and should never be committed."
  exit 1
fi

# Scan for potential secrets in staged files
git diff --cached | grep -i "api_key\|apikey\|password\|secret\|token" && {
  echo "⚠️  WARNING: Potential secrets detected in staged files!"
  echo "Review your changes before committing."
  exit 1
}
```

### Step 4.5: Add npm Scripts for Security

**File:** `package.json`

```json
{
  "scripts": {
    // ... existing scripts
    "security:audit": "npm audit --production",
    "security:audit:fix": "npm audit fix",
    "security:check": "npm run lint && npm run security:audit",
    "security:scan": "npx eslint --ext .ts,.tsx --plugin security src/",
    "precommit": "npm run security:check"
  }
}
```

**✅ Phase 4 Complete - Best practices implemented**

---

## Verification & Testing

### Step 5.1: Run Security Checks

```bash
# 1. Check for vulnerabilities in dependencies
npm audit

# 2. Fix auto-fixable vulnerabilities
npm audit fix

# 3. Run security linting
npm run security:scan

# 4. Check for type errors
npm run build:check

# 5. Run the app in dev mode
npm run dev
```

### Step 5.2: Manual Testing Checklist

Test each fixed vulnerability:

**✅ Secrets Test:**
```bash
# Ensure .env and token are NOT in git
git status
# Should not show .env or token

# Check .gitignore
cat .gitignore | grep -E "^\.env$|^token$"
# Should show both files
```

**✅ eval() Test:**
1. Open the app
2. Navigate to machine configuration with formulas
3. Try entering a formula: `2 + 2`
4. Should calculate correctly
5. Try entering malicious code: `alert('hack')`
6. Should fail safely with error, NOT execute alert

**✅ XSS Test:**
1. Open chat interface
2. Try sending: `<script>alert('XSS')</script>`
3. Should display as text, NOT execute
4. Check browser console for DOMPurify messages

**✅ Form Sanitization Test:**
1. Try creating device access with: `Device<script>alert(1)</script>`
2. Should be sanitized before sending to API
3. Check network tab - payload should have sanitized data

**✅ Rate Limiting Test:**
1. Rapidly create 10 devices in 1 minute
2. Should hit rate limit
3. Should show error message with retry time

### Step 5.3: Build and Test Production Version

```bash
# Build for production
npm run build

# Check CSP in production (should NOT have unsafe-eval)
# Open dist-electron/main.js and search for "unsafe-eval"
# Should only appear in dev mode condition
```

---

## Post-Fix Monitoring

### Ongoing Security Practices

**Daily:**
- Check `npm audit` output
- Review git commits for secrets

**Weekly:**
- Run `npm audit`
- Review dependency updates
- Check error logs for security issues

**Monthly:**
- Update dependencies: `npm update`
- Review this security guide
- Re-run full security audit

### Install Monitoring Tools (Optional)

```bash
# Snyk for dependency monitoring
npm install -g snyk
snyk auth
snyk test
snyk monitor

# git-secrets for preventing secret commits
brew install git-secrets
git secrets --install
git secrets --register-aws
```

---

## Emergency Rollback

If something breaks after fixes:

```bash
# Restore from backup
git checkout backup-before-cleanup

# Or revert specific files
git checkout HEAD~1 -- path/to/file.ts

# Or use git revert for specific commits
git log --oneline
git revert <commit-hash>
```

---

## Summary of Changes

### Files Modified (16 files):

1. `.env` - Removed and recreated with new secrets
2. `token` - Deleted
3. `.gitignore` - Added token
4. `src/componest/second/menu/hooks/useMachineTableConfig.ts` - Replaced eval()
5. `src/componest/second/menu/CreateOders/CreateOders.tsx` - Replaced eval()
6. `src/componest/second/menu/Edit/EditMachine/EditMachineNew.tsx` - Replaced eval()
7. `src/componest/second/menu/Edit/EditMachine/EditMachine.tsx` - Replaced eval()
8. `src/components/chat/ChatMessage.tsx` - Added DOMPurify
9. `src/componest/second/menu/CreateOders/optionsSection/InlineOptionsInput.tsx` - Fixed document.write()
10. `src/componest/second/menu/CreateOders/stepContainer.tsx` - Fixed document.write()
11. `src/utils/crudHelpers.ts` - Removed hardcoded API key
12. `src/componest/second/menu/SystemSetting/create/createDeviceAccess.tsx` - Added input sanitization
13. `electron/main.ts` - Improved CSP + secure storage
14. `src/utils/security.ts` - Enhanced password validation
15. `.eslintrc.cjs` - Added security plugin
16. `package.json` - Added security scripts

### Files Created (4 files):

1. `electron/preload.ts` - Secure storage API
2. `src/utils/secureStorage.ts` - Token encryption wrapper
3. `src/utils/apiRateLimiter.ts` - Rate limiting utility
4. `.husky/pre-commit` - Git hook for security

### Dependencies Added:

```
dompurify
@types/dompurify
eslint-plugin-security
husky
```

---

## Support & Questions

If you encounter issues:

1. **Check the error message** - Most issues will have clear error messages
2. **Review this guide** - Make sure you followed all steps in order
3. **Check git status** - Ensure no uncommitted changes are lost
4. **Test incrementally** - Fix and test one issue at a time
5. **Ask for help** - Contact: contact@27infinity.in

---

## Final Checklist

Before deploying to production:

- [ ] All GitHub tokens revoked and regenerated
- [ ] New API key obtained from backend team
- [ ] `.env` and `token` files not in git
- [ ] `.gitignore` updated with token
- [ ] All 4 eval() instances replaced
- [ ] DOMPurify installed and used in ChatMessage
- [ ] document.write() fixed in 3 locations
- [ ] Hardcoded API key removed
- [ ] Input sanitization added to forms
- [ ] Token encryption implemented (Electron)
- [ ] CSP updated for production
- [ ] Rate limiting added to critical APIs
- [ ] Password validation strengthened
- [ ] HTTPS enforced in production
- [ ] Security linting configured
- [ ] Pre-commit hooks installed
- [ ] All tests passing
- [ ] npm audit shows no critical vulnerabilities
- [ ] Production build successful

---

**Estimated Total Time:** 4-6 hours
**Difficulty:** Intermediate
**Impact:** 🔴 Critical → 🟢 Secure

Good luck! 🔒
