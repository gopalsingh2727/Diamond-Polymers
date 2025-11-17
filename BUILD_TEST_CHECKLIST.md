# Build Test Checklist

## Build Information
- **Build Date**: 2025-11-17
- **Version**: 1.0.1
- **Build Type**: Production
- **Electron**: 30.5.1

## Test Results

### ✅ Basic Functionality
- [ ] Application launches successfully
- [ ] Login screen appears
- [ ] Can login with valid credentials
- [ ] Dashboard loads after login

### ✅ Core Features
- [ ] Can create new orders
- [ ] Can view existing orders
- [ ] Can edit orders
- [ ] Can delete orders
- [ ] Can create/edit machines
- [ ] Can create/edit materials
- [ ] Can create/edit customers
- [ ] Reports load correctly

### ✅ WebSocket Features (NEW)
- [ ] WebSocket connects on login (check console: "✅ WebSocket connected")
- [ ] Connection status indicator shows "Connected"
- [ ] Real-time order updates work
- [ ] Real-time machine status updates work
- [ ] Force logout works (test by logging in on another device)

### ✅ Performance
- [ ] Application loads quickly
- [ ] No lag when navigating between pages
- [ ] Forms submit without delays
- [ ] Large lists render smoothly

### ✅ UI/UX
- [ ] All buttons work
- [ ] Forms validate correctly
- [ ] Error messages display properly
- [ ] Success notifications appear
- [ ] Modals open and close correctly

### ✅ No Errors
- [ ] No console errors (Cmd+Option+I)
- [ ] No visual glitches
- [ ] No crashes during use

## WebSocket Test Scenarios

### Test 1: Real-Time Order Updates
1. Open the app on Device A
2. Create or update an order on Device A
3. Check if order updates appear immediately on Device A
4. (Optional) Open app on Device B, updates should appear there too

### Test 2: Force Logout
1. Login on Device A
2. Login with same user on Device B
3. Device A should show "Session Ended" modal and redirect to login

### Test 3: Connection Recovery
1. Disconnect internet
2. App should show "Disconnected" status
3. Reconnect internet
4. App should show "Reconnecting..." then "Connected"

## Issues Found
(List any bugs or issues you discover during testing)

-

## Notes
- WebSocket URL: `ws://localhost:4000` (local testing)
- Make sure backend is running: `cd main27Backend && npm run dev`
