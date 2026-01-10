# 🧪 Quick Test Guide - OrderForward Module

## ✅ How to Access OrderForward Pages

### Method 1: Via Sidebar Menu
1. Look for **"Order Forward"** in the left sidebar menu
2. Click on it
3. It will take you to: `#/menu/order-forward/connections`

### Method 2: Direct URL Navigation
Type these URLs directly in the browser address bar:

```
#/menu/order-forward/connections   ← Connections page
#/menu/order-forward/received      ← Received Orders page
#/menu/order-forward/forwarded     ← Forwarded Orders page
```

---

## 🔍 What You Should See on Each Page

### 1. **Connections Page** (`#/menu/order-forward/connections`)

**Header Section:**
```
[Back Button] Connections
               Manage your contacts for order forwarding

[Send Request] [Forwarded] [Received] [Refresh ↻]
```

**Tabs:**
- **My Contacts (0)** ← Shows your accepted connections
- **Pending (0)** ← Shows incoming connection requests
- **Sent (0)** ← Shows your sent connection requests

**What to Test:**
1. Click **"Send Request"** button
2. Search for a user
3. Send connection request
4. Click **"Forwarded"** button → Should navigate to Forwarded Orders page
5. Click **"Received"** button → Should navigate to Received Orders page

---

### 2. **Received Orders Page** (`#/menu/order-forward/received`)

**Header:**
```
Received Orders
Orders received from other branches and partners

[Export] [Refresh ↻]
```

**Stats Cards:**
- Total Received
- Pending
- In Progress
- Completed

**Filters:**
- Search box
- Status dropdown (All Status, Pending, Approved, etc.)

**Table Columns:**
- Order #
- Customer
- Received From
- Items
- Status
- Priority
- Date
- Actions (View, View Chain)

---

### 3. **Forwarded Orders Page** (`#/menu/order-forward/forwarded`)

**Header:**
```
Forwarded Orders
Orders you forwarded to other branches and partners

[Export] [Refresh ↻]
```

**Stats Cards:**
- Total Forwarded
- Pending
- In Progress
- Completed

**Filters:**
- Search box
- Status dropdown

**Table Columns:**
- Order #
- Customer
- Forwarded To
- Items
- Status
- Priority
- Date
- Actions (View, View Chain)

---

## 🎯 Step-by-Step Test Scenario

### Test 1: Navigate to Connections
```bash
1. Open app
2. Look at left sidebar
3. Find "Order Forward" menu item
4. Click it
5. ✅ Should see Connections page with tabs
```

### Test 2: Navigation Buttons
```bash
1. On Connections page
2. Look at top-right corner
3. Should see buttons: [Send Request] [Forwarded] [Received] [Refresh]
4. Click [Forwarded] button
5. ✅ URL should change to #/menu/order-forward/forwarded
6. ✅ Should see Forwarded Orders page
7. Go back, click [Received] button
8. ✅ URL should change to #/menu/order-forward/received
9. ✅ Should see Received Orders page
```

### Test 3: Send Connection Request
```bash
1. On Connections page
2. Click "Send Request" button
3. ✅ Modal should appear with search box
4. Type user email or name
5. Select a user from results
6. Add optional message
7. Click "Send Request"
8. ✅ Should see success message
9. Check "Sent" tab
10. ✅ Should see your sent request
```

### Test 4: Forward Order to Person
```bash
1. Go to Orders List page (IndexAllOders)
2. Find an order
3. Click "Forward" button (if available)
4. ✅ Modal should appear
5. Select "Forward to Person" tab
6. Choose a contact from dropdown
7. Add optional notes
8. Click "Forward Order"
9. ✅ Should see success message
10. Go to Forwarded Orders page
11. ✅ Should see the forwarded order
```

### Test 5: P2P Chat
```bash
1. Go to Connections page
2. Make sure you have at least 1 contact
3. Click "Chat" button on a contact
4. ✅ Chat window should appear (bottom-right)
5. Type a message
6. Press Enter
7. ✅ Message should appear in chat
8. ✅ Status indicator should show (✓✓)
```

---

## 🐛 If You Don't See Something

### Problem: Can't see "Order Forward" in sidebar
**Solution:**
```bash
1. Check file: main27/src/componest/main/sidebar/menu.tsx
2. Look for line: { name: "Order Forward", path: "/menu/order-forward/connections" }
3. Make sure it's there and not commented out
```

### Problem: Buttons not visible on Connections page
**Check:**
```bash
1. Open browser DevTools (F12)
2. Go to Elements tab
3. Search for "btn-icon-action"
4. Check if buttons exist in DOM
5. Check CSS: display, visibility, opacity
```

### Problem: Pages show blank/empty
**Check Console:**
```bash
1. Open browser console (F12)
2. Look for errors (red text)
3. Common issues:
   - "Cannot find module" → Import path wrong
   - "undefined is not a function" → Missing Redux reducer
   - "Network error" → API not accessible
```

### Problem: Navigation doesn't work
**Check:**
```bash
1. Current URL in browser
2. Should be: #/menu/order-forward/connections
3. NOT: #/menu/forwarded (wrong!)
4. NOT: #/menu/received (wrong!)
```

---

## 📊 What Browser Console Should Show

When page loads successfully:
```
✅ Loaded people count: 5
✅ Sample person data: {userId: "123", userName: "John", userRole: "manager"}
```

When forwarding order:
```
🚀 Forwarding to person: {orderId: "abc123", selectedPersonId: "user456", normalizedRole: "manager"}
✅ Order forwarded successfully
```

When chat opens:
```
🔵 Initializing P2P chat with: user123
✅ Conversation initialized: conv456
```

---

## 🎨 What UI Should Look Like

### Connections Page Header
```
┌─────────────────────────────────────────────────────────┐
│ ← Connections                                           │
│    Manage your contacts for order forwarding            │
│                                                          │
│ [👤 Send Request] [📤 Forwarded] [📥 Received] [↻]    │
└─────────────────────────────────────────────────────────┘
```

### Tabs
```
┌─────────────────────────────────────────────────────────┐
│ [👥 My Contacts (5)] [⏰ Pending (2)] [📤 Sent (1)]    │
└─────────────────────────────────────────────────────────┘
```

### Contact Card (when you have contacts)
```
┌─────────────────────────────────────────┐
│  [J]  John Doe                          │
│       Manager                           │
│       john@example.com                  │
│       Connected Jan 9, 2026             │
│                                          │
│  [💬 Chat]  [✓ Connected]              │
└─────────────────────────────────────────┘
```

---

## 💡 Quick Fixes

### Fix 1: Clear Browser Cache
```bash
1. Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. Clear cache and reload
3. Or use Incognito/Private mode
```

### Fix 2: Check Token
```bash
1. Open DevTools (F12)
2. Go to Application/Storage tab
3. Click localStorage
4. Find 'authToken'
5. Should have a long JWT string
6. If missing → Log out and log in again
```

### Fix 3: Verify Redux Store
```bash
1. Install Redux DevTools extension
2. Open DevTools
3. Go to Redux tab
4. Check state.orderForward
5. Should have: connections, receivedOrders, forwardedOrders
```

---

## ✅ Success Checklist

- [ ] Can navigate to Connections page via sidebar
- [ ] Can see "Send Request", "Forwarded", "Received" buttons
- [ ] Buttons respond when clicked
- [ ] "Forwarded" button navigates to Forwarded Orders page
- [ ] "Received" button navigates to Received Orders page
- [ ] Received Orders page loads and shows table
- [ ] Forwarded Orders page loads and shows table
- [ ] Can send connection request
- [ ] Can forward order to person
- [ ] Chat button appears on contacts
- [ ] Chat window opens when clicked

---

**If ALL checks pass:** Everything is working! 🎉

**If ANY checks fail:** Copy the error from browser console and share it for debugging.

---

**Created:** 2026-01-09
**Module:** OrderForward
**Status:** All features fixed and ready for testing
