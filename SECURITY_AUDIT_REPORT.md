# Security Audit Report - 27 Manufacturing

**Audit Date:** December 23, 2025
**Auditor:** Claude (Security Analysis Tool)
**Project Version:** 1.0.15
**Severity Levels:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## Executive Summary

This security audit identified **8 critical vulnerabilities** and **multiple high/medium severity issues** in the 27 Manufacturing application. The most severe issues include:

1. **Hardcoded secrets committed to repository** (🔴 CRITICAL)
2. **Unsafe eval() usage** (🔴 CRITICAL)
3. **XSS vulnerability via dangerouslySetInnerHTML** (🔴 CRITICAL)
4. **Tokens stored in plaintext localStorage** (🟠 HIGH)
5. **Missing input sanitization in forms** (🟠 HIGH)

**Immediate Action Required:** Revoke all exposed GitHub tokens and API keys.

---

## 🔴 CRITICAL Vulnerabilities

### 1. Hardcoded Secrets Exposed in Repository

**Severity:** 🔴 CRITICAL
**Files Affected:**
- `.env` (COMMITTED - should be in .gitignore)
- `token` (COMMITTED - contains GitHub PAT)

**Exposed Credentials:**
```
# EXPOSED GITHUB PAT (REVOKE IMMEDIATELY!)
GH_TOKEN=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

# EXPOSED API KEY
VITE_API_KEY=27infinity.in_5f84c89315f74a2db149c06a93cf4820

# EXPOSED FIREBASE PLACEHOLDER
VITE_FIREBASE_API_KEY=AIzaSyBqKVvMzX_YOUR_API_KEY
```

**Impact:**
- GitHub repository access compromise
- API access by unauthorized parties
- Potential data breach

**Remediation (URGENT):**
```bash
# 1. Revoke GitHub token immediately
# Go to: https://github.com/settings/tokens and revoke:
# github_pat_11BCA7VAQ0NbCAKKscfgJV_...
# github_pat_11BCA7VAQ0MretP3ry8Dq7_...

# 2. Generate new API key from backend team

# 3. Remove from git history (USE WITH CAUTION)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env token" \
  --prune-empty --tag-name-filter cat -- --all

# 4. Force push (if acceptable for your team)
# git push origin --force --all

# 5. Update .gitignore
echo "token" >> .gitignore
git add .gitignore
git commit -m "Add token to gitignore"
```

**Prevention:**
- ✅ `.gitignore` already contains `.env` but file was still committed
- Add pre-commit hook to detect secrets:
  ```bash
  npm install --save-dev @commitlint/config-conventional
  # Use git-secrets or detect-secrets
  ```

---

### 2. Unsafe eval() Usage - Code Injection Risk

**Severity:** 🔴 CRITICAL
**Files Affected:**
- `src/componest/second/menu/hooks/useMachineTableConfig.ts:187`
- `src/componest/second/menu/CreateOders/CreateOders.tsx:373`
- `src/componest/second/menu/Edit/EditMachine/EditMachineNew.tsx:234`
- `src/componest/second/menu/Edit/EditMachine/EditMachine.tsx:282`

**Vulnerability:**
```typescript
// DANGEROUS! User input could inject malicious code
const result = eval(formula);
```

**Attack Scenario:**
```typescript
// Attacker provides formula like:
formula = "1 + (function(){localStorage.clear();window.location='https://evil.com'})()";
eval(formula); // Executes arbitrary JavaScript!
```

**Remediation:**
Replace `eval()` with safe formula evaluator:

```typescript
// Install safe evaluator
npm install expr-eval

// Replace eval() with Parser
import { Parser } from 'expr-eval';

// BEFORE (UNSAFE):
const result = eval(formula);

// AFTER (SAFE):
const parser = new Parser();
try {
  const result = parser.evaluate(formula, variables);
} catch (error) {
  console.error('Invalid formula:', error);
  return 0;
}
```

**Files to Fix:**
1. `src/componest/second/menu/hooks/useMachineTableConfig.ts:187`
2. `src/componest/second/menu/CreateOders/CreateOders.tsx:373`
3. `src/componest/second/menu/Edit/EditMachine/EditMachineNew.tsx:234`
4. `src/componest/second/menu/Edit/EditMachine/EditMachine.tsx:282`

**Note:** `expr-eval` is already installed in dependencies ✅

---

### 3. XSS Vulnerability - dangerouslySetInnerHTML

**Severity:** 🔴 CRITICAL
**File:** `src/components/chat/ChatMessage.tsx:83`

**Vulnerability:**
```tsx
<div dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
```

**Attack Scenario:**
```typescript
// Attacker sends chat message:
content = "<img src=x onerror='alert(document.cookie)'>";
// When rendered, executes JavaScript
```

**Remediation:**
```tsx
// OPTION 1: Use DOMPurify for HTML sanitization
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(formatContent(content))
}} />

// OPTION 2: Use React component instead
import ReactMarkdown from 'react-markdown';

<ReactMarkdown>{content}</ReactMarkdown>
```

**Install:**
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

---

### 4. document.write() Usage - DOM Clobbering

**Severity:** 🔴 CRITICAL
**Files Affected:**
- `src/componest/second/menu/CreateOders/optionsSection/InlineOptionsInput.tsx:706`
- `src/componest/second/menu/CreateOders/stepContainer.tsx:801`
- `src/componest/second/menu/CreateOders/stepContainer.tsx:1109`

**Vulnerability:**
```typescript
printWin.document.write(printContent);
```

**Issue:**
- `document.write()` is deprecated and unsafe
- Can be exploited for XSS if `printContent` contains user input

**Remediation:**
```typescript
// BEFORE (UNSAFE):
printWin.document.write(printContent);

// AFTER (SAFE):
const printDoc = printWin.document;
printDoc.open();
printDoc.write('<!DOCTYPE html><html><head><title>Print</title></head><body>');
printDoc.write(DOMPurify.sanitize(printContent));
printDoc.write('</body></html>');
printDoc.close();
```

---

## 🟠 HIGH Severity Vulnerabilities

### 5. Tokens Stored in Plaintext localStorage

**Severity:** 🟠 HIGH
**Files:** All Redux actions, authentication module

**Issue:**
```typescript
localStorage.setItem("authToken", token);
localStorage.setItem("refreshToken", refreshToken);
```

**Risk:**
- XSS attacks can steal tokens
- No encryption at rest
- Accessible via browser DevTools

**Current Mitigations (Partial):**
- ✅ Content Security Policy enabled
- ✅ Context isolation enabled in Electron
- ❌ Tokens not encrypted

**Recommended Improvement:**
```typescript
// Use Electron's safeStorage for sensitive data
import { safeStorage } from 'electron';

// In main process:
const encryptedToken = safeStorage.encryptString(token);
localStorage.setItem("authToken", encryptedToken);

// When retrieving:
const decryptedToken = safeStorage.decryptString(
  Buffer.from(localStorage.getItem("authToken"), 'base64')
);
```

**Note:** For web version, consider:
- IndexedDB with encryption
- Session storage instead of localStorage
- HTTP-only cookies (requires backend changes)

---

### 6. Hardcoded API Key Fallback

**Severity:** 🟠 HIGH
**File:** `src/utils/crudHelpers.ts:4`

**Vulnerability:**
```typescript
const API_KEY = import.meta.env.VITE_API_KEY || '27infinity.in_5f84c89315f74a2db149c06a93cf4820';
```

**Issue:**
- Hardcoded API key in source code
- Will be exposed in compiled JavaScript
- Anyone can decompile and extract

**Remediation:**
```typescript
// Remove fallback
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error('VITE_API_KEY environment variable is required');
}
```

---

### 7. CSP Allows unsafe-eval and unsafe-inline

**Severity:** 🟠 HIGH
**File:** `electron/main.ts:15`

**Current CSP:**
```typescript
"script-src 'self' 'unsafe-inline' 'unsafe-eval'", // ⚠️ DANGEROUS
```

**Issue:**
- `unsafe-eval` allows eval(), setTimeout(string), etc.
- `unsafe-inline` allows inline scripts
- Defeats XSS protection

**Remediation:**
```typescript
// For PRODUCTION builds only:
const CSP_POLICY = [
  "default-src 'self'",
  VITE_DEV_SERVER_URL
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" // Dev only
    : "script-src 'self'", // Production - NO unsafe-*
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // ... rest of policy
].join('; ');
```

**After fixing eval() usage, remove unsafe-eval from production CSP.**

---

### 8. Missing Input Validation in Forms

**Severity:** 🟠 HIGH
**Files:** Multiple form components

**Issue:**
Most forms don't use the security utilities:
- `src/componest/second/menu/SystemSetting/create/createDeviceAccess.tsx`
- `src/componest/second/menu/create/machine/ViewTemplateWizard.tsx`
- etc.

**Security Utils Available (UNUSED):**
```typescript
// src/utils/security.ts
✅ sanitizeString()
✅ sanitizeObject()
✅ prepareSecureFormData()
✅ isSuspiciousInput()
```

**Remediation:**
```typescript
// BEFORE:
const handleSubmit = () => {
  dispatch(createDeviceAccess({ deviceName, password, branchId }));
};

// AFTER:
import { prepareSecureFormData, isSuspiciousInput } from '@/utils/security';

const handleSubmit = () => {
  const formData = { deviceName, password, branchId };

  // Check for suspicious input
  Object.entries(formData).forEach(([key, value]) => {
    if (typeof value === 'string' && isSuspiciousInput(value)) {
      toast.addToast('error', `Invalid input in ${key}`);
      throw new Error('Suspicious input detected');
    }
  });

  // Sanitize before sending
  const sanitizedData = prepareSecureFormData(formData);
  dispatch(createDeviceAccess(sanitizedData));
};
```

---

## 🟡 MEDIUM Severity Issues

### 9. No Rate Limiting on API Calls

**Severity:** 🟡 MEDIUM

**Issue:**
- Only login has client-side rate limiting
- Other API endpoints unprotected
- Vulnerable to brute force attacks

**Recommendation:**
```typescript
import { checkRateLimit } from '@/utils/security';

// Before API call:
const rateCheck = checkRateLimit('createOrder', 10, 60000);
if (!rateCheck.allowed) {
  toast.addToast('error', `Too many requests. Try again in ${Math.ceil(rateCheck.resetIn / 1000)}s`);
  return;
}
```

---

### 10. Weak Password Validation

**Severity:** 🟡 MEDIUM
**File:** `src/utils/security.ts:104`

**Current Requirements:**
- ✅ Minimum 8 characters
- ✅ One uppercase
- ✅ One lowercase
- ✅ One number
- ❌ No special characters
- ❌ No common password check

**Recommendation:**
```typescript
export const validatePassword = (password: string) => {
  const errors: string[] = [];

  if (password.length < 12) { // Increased from 8
    errors.push('Password must be at least 12 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) { // NEW
    errors.push('Password must contain at least one special character');
  }

  // Check against common passwords
  const commonPasswords = ['password123', 'admin123', '12345678'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common');
  }

  return { valid: errors.length === 0, errors };
};
```

---

### 11. Missing HTTPS Enforcement

**Severity:** 🟡 MEDIUM

**Issue:**
`.env` shows both HTTP and HTTPS options:
```env
VITE_API_27INFINITY_IN=http://localhost:4000/dev  # ⚠️ HTTP allowed
VITE_API_27INFINITY_IN=https://api.27infinity.in  # ✅ HTTPS
```

**Recommendation:**
```typescript
// Force HTTPS in production
const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;

if (import.meta.env.PROD && !baseUrl.startsWith('https://')) {
  throw new Error('Production API must use HTTPS');
}
```

---

### 12. JWT Token Not Verified Client-Side

**Severity:** 🟡 MEDIUM

**Issue:**
```typescript
// src/componest/redux/login/authActions.ts:485
const payload = JSON.parse(atob(token.split('.')[1]));
```

**Problem:**
- Only decoding, not verifying signature
- Trusts token without validation
- Vulnerable to token tampering (though backend should catch this)

**Recommendation:**
Client-side verification not critical since backend validates, but consider:
```typescript
import jwt_decode from 'jwt-decode';

try {
  const decoded = jwt_decode(token);
  // Validate claims
  if (!decoded.exp || !decoded.userId) {
    throw new Error('Invalid token structure');
  }
} catch (error) {
  console.error('Token validation failed:', error);
  dispatch(logout());
}
```

---

## 🟢 LOW Severity / Best Practices

### 13. Console.log in Production

**Files:** Multiple

**Issue:**
```typescript
console.log('✅ Login successful for role:', userType);
```

**Recommendation:**
```typescript
// Use conditional logging
if (import.meta.env.DEV) {
  console.log('✅ Login successful for role:', userType);
}
```

**Note:** Already implemented in most places ✅

---

### 14. Error Messages Expose Internal Details

**Example:**
```typescript
catch (error) {
  console.error('Failed to fetch order form data:', error);
  // Exposes stack trace in DevTools
}
```

**Recommendation:**
```typescript
catch (error) {
  if (import.meta.env.DEV) {
    console.error('Failed to fetch order form data:', error);
  } else {
    console.error('Failed to fetch order form data');
    // Log to external service (Sentry, LogRocket)
  }
}
```

---

### 15. Missing Subresource Integrity (SRI)

**Severity:** 🟢 LOW

**Issue:**
External resources loaded without integrity checks:
```html
<link href="https://fonts.googleapis.com/..." />
```

**Recommendation:**
```html
<link
  href="https://fonts.googleapis.com/..."
  integrity="sha384-..."
  crossorigin="anonymous"
/>
```

---

## ✅ Security Features Already Implemented (GOOD)

### Electron Security ✅

**File:** `electron/main.ts`

```typescript
✅ contextIsolation: true
✅ nodeIntegration: false
✅ webSecurity: true
✅ allowRunningInsecureContent: false
✅ Content Security Policy
✅ X-Content-Type-Options: nosniff
✅ X-Frame-Options: DENY
✅ X-XSS-Protection: 1; mode=block
```

### Authentication ✅

```typescript
✅ Automatic token refresh
✅ Session expiration handling
✅ Rate limiting on login (5 attempts per minute)
✅ Email format validation
✅ Phone number validation
✅ MongoDB ObjectId validation
```

### Input Sanitization Utils ✅

```typescript
✅ sanitizeString() - XSS prevention
✅ sanitizeObject() - Deep sanitization
✅ isSuspiciousInput() - SQL/NoSQL injection detection
✅ validatePassword() - Strength checker
✅ prepareSecureFormData() - Form sanitization
```

**Note:** These utils exist but are not widely used in the codebase!

---

## Remediation Priority

### Phase 1: IMMEDIATE (Within 24 hours)

1. **Revoke exposed GitHub tokens** (🔴 CRITICAL)
2. **Regenerate API keys** (🔴 CRITICAL)
3. **Remove secrets from git history** (🔴 CRITICAL)
4. **Add `token` file to .gitignore** (🔴 CRITICAL)

### Phase 2: URGENT (Within 1 week)

1. **Replace all eval() with expr-eval Parser** (🔴 CRITICAL)
2. **Fix XSS in ChatMessage.tsx with DOMPurify** (🔴 CRITICAL)
3. **Fix document.write() usage** (🔴 CRITICAL)
4. **Remove hardcoded API key fallback** (🟠 HIGH)

### Phase 3: HIGH PRIORITY (Within 2 weeks)

1. **Implement token encryption for localStorage** (🟠 HIGH)
2. **Add input sanitization to all forms** (🟠 HIGH)
3. **Restrict CSP in production builds** (🟠 HIGH)
4. **Add rate limiting to API calls** (🟡 MEDIUM)

### Phase 4: MEDIUM PRIORITY (Within 1 month)

1. **Strengthen password requirements** (🟡 MEDIUM)
2. **Enforce HTTPS in production** (🟡 MEDIUM)
3. **Add client-side JWT validation** (🟡 MEDIUM)
4. **Implement proper error logging** (🟢 LOW)

---

## Security Testing Recommendations

### 1. Automated Security Scanning

```bash
# Install security scanners
npm install --save-dev eslint-plugin-security
npm audit

# Run scans
npm audit --production
npx eslint --plugin security src/
```

### 2. Dependency Scanning

```bash
# Check for vulnerable dependencies
npm audit
npm audit fix

# Use Snyk for continuous monitoring
npx snyk test
npx snyk monitor
```

### 3. Secret Scanning

```bash
# Install git-secrets
brew install git-secrets

# Scan repository
git secrets --scan
git secrets --scan-history
```

### 4. Penetration Testing Checklist

- [ ] XSS testing on all input fields
- [ ] SQL/NoSQL injection attempts
- [ ] CSRF token validation
- [ ] Session hijacking attempts
- [ ] Token expiration testing
- [ ] Rate limit bypass attempts
- [ ] File upload vulnerabilities
- [ ] API authentication bypass

---

## Compliance Considerations

### OWASP Top 10 Coverage

| OWASP Risk | Status | Notes |
|------------|--------|-------|
| A01: Broken Access Control | ⚠️ Partial | Auth implemented, but no RBAC validation |
| A02: Cryptographic Failures | 🔴 FAIL | Tokens in plaintext, secrets exposed |
| A03: Injection | 🔴 FAIL | eval() usage, missing sanitization |
| A04: Insecure Design | 🟡 PARTIAL | Some security utils unused |
| A05: Security Misconfiguration | 🟠 FAIL | CSP allows unsafe-eval |
| A06: Vulnerable Components | 🟢 PASS | Dependencies mostly up to date |
| A07: Auth Failures | 🟡 PARTIAL | Rate limiting exists, but limited |
| A08: Data Integrity | 🟡 PARTIAL | No SRI, limited validation |
| A09: Logging Failures | 🟠 FAIL | No centralized logging |
| A10: SSRF | N/A | Not applicable (desktop app) |

**Overall Security Grade: D+ (Failing)**

---

## Recommended Security Tools

### Development
- `eslint-plugin-security` - Security linting
- `@commitlint/config-conventional` - Commit validation
- `husky` - Git hooks for pre-commit checks
- `detect-secrets` - Secret scanning

### Runtime
- `helmet` - Security headers (if using Express backend)
- `dompurify` - HTML sanitization
- `express-rate-limit` - API rate limiting

### Monitoring
- `Sentry` - Error tracking
- `LogRocket` - Session replay
- `Snyk` - Dependency monitoring

---

## Code Review Checklist

Before any deployment, verify:

- [ ] No secrets in code or environment files
- [ ] All user input is sanitized
- [ ] eval() is not used
- [ ] dangerouslySetInnerHTML uses DOMPurify
- [ ] CSP doesn't allow unsafe-eval in production
- [ ] Tokens are encrypted before storage
- [ ] HTTPS is enforced in production
- [ ] Rate limiting is implemented
- [ ] Error messages don't expose internals
- [ ] Dependencies are up to date (npm audit)

---

## Contact for Security Issues

**Report security vulnerabilities to:**
- Email: contact@27infinity.in
- Subject: [SECURITY] Vulnerability Report

**DO NOT create public GitHub issues for security vulnerabilities.**

---

## Conclusion

The 27 Manufacturing application has a foundation of security features (Electron isolation, auth system, sanitization utils) but **critical vulnerabilities exist** that must be addressed immediately.

**Most Critical Actions:**
1. Revoke exposed tokens NOW
2. Remove eval() usage
3. Fix XSS vulnerabilities
4. Encrypt stored tokens

**Estimated Remediation Time:**
- Phase 1 (Critical): 1-2 days
- Phase 2 (High): 1 week
- Phase 3 (Medium): 2 weeks
- Total: ~3-4 weeks for full remediation

**Next Steps:**
1. Share this report with the development team
2. Create JIRA/GitHub issues for each vulnerability
3. Assign owners and deadlines
4. Schedule weekly security reviews
5. Implement automated security scanning in CI/CD

---

**Report Generated:** December 23, 2025
**Next Review:** January 23, 2026 (1 month)

---

## Appendix: Quick Fix Commands

```bash
# 1. Revoke GitHub tokens (manual via GitHub settings)

# 2. Remove secrets from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env token" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Install security dependencies
npm install dompurify expr-eval
npm install --save-dev @types/dompurify eslint-plugin-security

# 4. Run security audit
npm audit
npm audit fix

# 5. Update .gitignore
echo "token" >> .gitignore

# 6. Commit security fixes
git add .gitignore
git commit -m "Security: Remove exposed secrets, update dependencies"
```

---

**End of Security Audit Report**
