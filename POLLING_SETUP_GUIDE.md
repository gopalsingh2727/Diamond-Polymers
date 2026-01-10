# 🚀 Order Polling Setup Guide

## Quick Start

Follow these steps to test the order polling functionality in your React app.

---

## 1️⃣ Environment Setup

Add these to your `.env` file:

```env
VITE_API_URL=http://localhost:4000/dev
VITE_API_KEY=27infinity.in_5f84c89315f74a2db149c06a93cf4820
```

---

## 2️⃣ Add Test Route

Add the polling test page to your router:

### For React Router v6:

```typescript
// In your App.tsx or routes file
import OrderPollingTestPage from './components/OrderPollingTest';

// Add this to your routes
<Routes>
  <Route path="/test-polling" element={<OrderPollingTestPage />} />
  {/* ... your other routes */}
</Routes>
```

### For React Router v5:

```typescript
import OrderPollingTestPage from './components/OrderPollingTest';

<Route path="/test-polling" component={OrderPollingTestPage} />
```

---

## 3️⃣ Test the Polling

### A. Start Your Backend

```bash
cd /Users/gopalsingh/Desktop/27/27mainAll/main27Backend
npm run dev
```

Make sure the backend is running on `http://localhost:4000`

### B. Start Your Frontend

```bash
cd /Users/gopalsingh/Desktop/27/27mainAll/main27
npm run dev
```

### C. Navigate to Test Page

Open your browser and go to:
```
http://localhost:5173/test-polling
```

*(Adjust the port if your Vite server runs on a different port)*

---

## 4️⃣ Testing Steps

### Test Long Polling (Real-time)

1. Enter your Branch ID: `694e3f76635d7dd01a826b5b`
2. Click **"Start Polling"**
3. In another tab/window, create or update an order
4. Watch the update log and orders section update in real-time!

### Test Change Detection (Lightweight)

1. Enter your Branch ID
2. Click **"Start Detection"**
3. Create or update an order in another tab
4. Watch the detection pick up changes within 5 seconds

### Test Both Together

1. Start both polling and detection
2. Compare their behaviors
3. See how they complement each other

---

## 5️⃣ Use in Your Components

### Simple Real-time Orders List

```typescript
import { useOrderPolling } from './hooks/useOrderPolling';

function MyOrdersPage() {
  const { updates, isPolling } = useOrderPolling('YOUR_BRANCH_ID', {
    enabled: true,
    onUpdate: (updates) => {
      console.log('New updates:', updates);
      // Update your orders state here
    }
  });

  return (
    <div>
      {isPolling && <span>🟢 Live</span>}
      {/* Your orders UI */}
    </div>
  );
}
```

### Battery-Friendly Periodic Checks

```typescript
import { useOrderChangeDetection } from './hooks/useOrderChangeDetection';

function MyMobileOrdersPage() {
  const { hasChanges, changeCount } = useOrderChangeDetection('YOUR_BRANCH_ID', {
    interval: 10000, // Check every 10 seconds
    onChangeDetected: (count) => {
      console.log(`${count} changes detected`);
      // Refetch orders
      fetchOrders();
    }
  });

  return (
    <div>
      {hasChanges && <span>⚠️ {changeCount} new updates</span>}
      {/* Your orders UI */}
    </div>
  );
}
```

---

## 6️⃣ Testing Checklist

Use this checklist to verify everything works:

### Backend Tests

- [ ] Backend running on port 4000
- [ ] Can access `/v2/orders/poll` endpoint
- [ ] Can access `/v2/orders/changes` endpoint
- [ ] Authentication works (JWT token)
- [ ] API key validation works

### Frontend Tests

- [ ] Test page loads without errors
- [ ] Can enter branch ID
- [ ] Long polling starts/stops correctly
- [ ] Change detection starts/stops correctly
- [ ] Updates appear in the log when orders change
- [ ] Orders display updates in real-time
- [ ] Error handling works when backend is down

### Integration Tests

- [ ] Create new order → appears in polling
- [ ] Update order → updates show immediately
- [ ] Delete order → removed from list
- [ ] Change order status → status updates
- [ ] Multiple tabs → all get updates

---

## 7️⃣ Troubleshooting

### Polling Not Working

**Issue**: No updates received

**Solutions**:
1. Check if backend is running: `curl http://localhost:4000/dev/v2/orders/poll?branchId=XXX`
2. Check browser console for errors
3. Verify your JWT token is valid
4. Check API key in `.env` matches backend

### CORS Errors

**Issue**: CORS policy blocking requests

**Solution**:
Backend already has CORS enabled, but verify:
```javascript
// In backend serverless.yml
cors: true  // Should be set for all endpoints
```

### Authentication Errors

**Issue**: 401 Unauthorized

**Solution**:
1. Login first to get a valid token
2. Check token is stored in localStorage as `authToken` or `token`
3. Verify token hasn't expired

### No Changes Detected

**Issue**: Change detection not picking up updates

**Solutions**:
1. Verify you're creating orders in the correct branch
2. Check the `since` timestamp is not in the future
3. Wait for the next check interval (default 5 seconds in test page)

---

## 8️⃣ Performance Tips

### For Desktop/Web Apps
✅ Use **Long Polling** (`useOrderPolling`)
- Real-time updates
- Low latency
- Best user experience

### For Mobile Apps
✅ Use **Change Detection** (`useOrderChangeDetection`)
- Better battery life
- Reduced network usage
- Acceptable latency (5-30s)

### For Background Sync
✅ Use **Change Detection** with longer intervals
```typescript
useOrderChangeDetection(branchId, {
  interval: 60000, // Check every minute
  onChangeDetected: syncOrders
});
```

---

## 9️⃣ Next Steps

After testing works:

1. **Integrate into your real components**
   - Replace your WebSocket code (if any)
   - Or use polling as a fallback

2. **Customize for your needs**
   - Adjust timeout values
   - Add custom event types
   - Implement your own update logic

3. **Monitor performance**
   - Track poll frequency
   - Monitor update latency
   - Watch for errors

---

## 🎉 Success!

If you can:
- ✅ Start polling
- ✅ See updates appear in real-time
- ✅ Create/update orders and see them in the test page

Then polling is working correctly! 🚀

---

## 📚 Additional Resources

- **Backend Guide**: `/main27Backend/ORDER_POLLING_GUIDE.md`
- **Example Components**: `/main27/src/components/OrderPollingExample.tsx`
- **Hook Documentation**: Check comments in hook files

---

## 🐛 Need Help?

Check the console for errors:
- Backend logs: In terminal running `npm run dev`
- Frontend logs: Browser DevTools → Console

The test page shows all updates in the log panel for debugging!
