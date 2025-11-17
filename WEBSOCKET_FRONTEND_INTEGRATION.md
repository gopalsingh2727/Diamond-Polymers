# WebSocket Frontend Integration Guide

This guide shows how to integrate WebSocket real-time functionality into your existing React + Redux application.

## 📦 What's Already Created

All WebSocket code has been created for you:

1. **WebSocket Client** - `src/services/websocket/WebSocketClient.ts`
   - Auto-reconnection with exponential backoff
   - Message queue for offline messages
   - Event-based message handling
   - Heartbeat/ping-pong

2. **Redux Integration** - `src/componest/redux/websocket/`
   - `websocketSlice.ts` - Redux state management
   - `websocketMiddleware.ts` - Redux middleware

3. **React Hooks** - `src/hooks/useWebSocket.ts`
   - Easy-to-use hooks for components
   - Auto-subscription to orders and machines

---

## 🔧 Step 1: Update Redux Store

### 1.1 Add WebSocket Reducer to Root Reducer

Open `src/componest/redux/rootReducer.tsx` and add:

```typescript
import websocketReducer from './websocket/websocketSlice';

const rootReducer = combineReducers({
  // ... your existing reducers
  login: loginReducer,
  branches: branchReducer,
  orders: ordersReducer,
  // ... etc ...

  // ✅ ADD THIS LINE:
  websocket: websocketReducer,
});
```

### 1.2 Add WebSocket Middleware to Store

Open the file where you configure your Redux store (usually `src/componest/redux/store.ts` or in `main.tsx`):

```typescript
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import websocketMiddleware from './redux/websocket/websocketMiddleware';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore WebSocket actions with non-serializable payloads
        ignoredActions: ['websocket/messageReceived'],
        ignoredPaths: ['websocket.lastMessages']
      }
    }).concat(websocketMiddleware), // ✅ ADD WEBSOCKET MIDDLEWARE
});

export default store;
```

---

## 🚀 Step 2: Connect WebSocket on Login

### 2.1 Update Login Action

Open your login action file (e.g., `src/componest/redux/login/LoginActions.tsx`):

```typescript
export const loginManager = (credentials: any) => async (dispatch: Dispatch) => {
  try {
    const response = await axios.post(`${baseUrl}/manager/login`, credentials, {
      headers: { 'x-api-key': API_KEY }
    });

    const { token, user } = response.data;

    // Save to localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));

    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { token, user }
    });

    // ✅ CONNECT TO WEBSOCKET AFTER SUCCESSFUL LOGIN
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:4000';

    dispatch({
      type: 'websocket/connect',
      payload: {
        url: wsUrl,
        token: token,
        platform: 'electron', // or 'web' for main27Web
        deviceId: navigator.userAgent.substring(0, 50)
      }
    });

  } catch (error) {
    dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
  }
};
```

### 2.2 Add WebSocket URL to .env

Add to `main27/.env`:

```bash
# WebSocket URL (will be updated after deployment)
VITE_WEBSOCKET_URL=ws://localhost:4000

# After AWS deployment, update to:
# VITE_WEBSOCKET_URL=wss://your-websocket-id.execute-api.ap-south-1.amazonaws.com/dev
```

---

## 📱 Step 3: Use WebSocket in Components

### 3.1 Display Connection Status

Create a connection status indicator component:

```typescript
// src/components/WebSocketStatus.tsx
import React from 'react';
import { useWebSocketStatus } from '../hooks/useWebSocket';

export const WebSocketStatus: React.FC = () => {
  const { status, isConnected, reconnectAttempts } = useWebSocketStatus();

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
      isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
      }`} />
      {status === 'connected' && 'Connected'}
      {status === 'connecting' && 'Connecting...'}
      {status === 'disconnected' && 'Disconnected'}
      {status === 'reconnecting' && `Reconnecting (${reconnectAttempts})...`}
    </div>
  );
};
```

Add to your header or navbar:

```typescript
import { WebSocketStatus } from './components/WebSocketStatus';

function Header() {
  return (
    <header>
      <h1>27 Manufacturing</h1>
      <WebSocketStatus /> {/* ✅ ADD THIS */}
    </header>
  );
}
```

### 3.2 Auto-Subscribe to Order Updates

In your order details page:

```typescript
// src/reports/OrderDetailsPage.tsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useOrderUpdates } from '../hooks/useWebSocket';

export const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const dispatch = useDispatch();

  // ✅ AUTO-SUBSCRIBE TO REAL-TIME ORDER UPDATES
  useOrderUpdates(orderId);

  const order = useSelector((state: RootState) =>
    state.orders.allOrders.find(o => o._id === orderId)
  );

  return (
    <div>
      <h1>Order #{order?.orderNumber}</h1>
      <p>Status: {order?.status}</p>
      {/* Real-time status updates will appear automatically! */}
    </div>
  );
};
```

### 3.3 Auto-Subscribe to Machine Updates

In your machine monitoring page:

```typescript
// src/components/MachineMonitor.tsx
import React from 'react';
import { useMachineUpdates } from '../hooks/useWebSocket';
import { useSelector } from 'react-redux';

interface Props {
  machineId: string;
}

export const MachineMonitor: React.FC<Props> = ({ machineId }) => {
  // ✅ AUTO-SUBSCRIBE TO REAL-TIME MACHINE UPDATES
  useMachineUpdates(machineId);

  const machine = useSelector((state: RootState) =>
    state.machines.allMachines.find(m => m._id === machineId)
  );

  return (
    <div>
      <h2>{machine?.name}</h2>
      <div className={`status-indicator ${machine?.status}`}>
        {machine?.status}
      </div>
      {machine?.currentOrder && (
        <p>Current Order: {machine.currentOrder.orderNumber}</p>
      )}
      {/* Real-time machine updates will appear automatically! */}
    </div>
  );
};
```

---

## 🔔 Step 4: Handle Force Logout

The WebSocket middleware automatically handles force logout when a user logs in on another device.

### What Happens Automatically:

1. User logs in on Device B
2. Backend sends `session:force_logout` to Device A
3. WebSocket middleware on Device A:
   - Clears `localStorage` (token + userData)
   - Dispatches `forceLogout` action to Redux
   - Redirects to `/login` after 2 seconds

### Display Force Logout Message

Create a force logout modal:

```typescript
// src/components/ForceLogoutModal.tsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForceLogoutStatus } from '../hooks/useWebSocket';
import { clearForceLogout } from '../componest/redux/websocket/websocketSlice';

export const ForceLogoutModal: React.FC = () => {
  const { forceLoggedOut, forceLogoutReason } = useForceLogoutStatus();
  const dispatch = useDispatch();

  useEffect(() => {
    if (forceLoggedOut) {
      // Auto-close modal and redirect after 2 seconds
      const timer = setTimeout(() => {
        dispatch(clearForceLogout());
        window.location.href = '/login';
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [forceLoggedOut, dispatch]);

  if (!forceLoggedOut) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          Session Ended
        </h2>
        <p className="text-gray-700 mb-4">
          {forceLogoutReason || 'Your session has ended'}
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to login in 2 seconds...
        </p>
      </div>
    </div>
  );
};
```

Add to your main App component:

```typescript
import { ForceLogoutModal } from './components/ForceLogoutModal';

function App() {
  return (
    <div>
      <YourRoutes />
      <ForceLogoutModal /> {/* ✅ ADD THIS */}
    </div>
  );
}
```

---

## 📊 Step 5: Handle Real-Time Redux Updates

### Update Order Reducer

Open your order reducer (e.g., `src/componest/redux/oders/OdersReducer.tsx`):

```typescript
const ordersReducer = (state = initialState, action: any) => {
  switch (action.type) {
    // ... existing cases ...

    // ✅ ADD WEBSOCKET CASES:
    case 'orders/orderCreatedViaWS':
      return {
        ...state,
        allOrders: [action.payload, ...state.allOrders],
        // Show notification if needed
      };

    case 'orders/orderStatusChangedViaWS':
      return {
        ...state,
        allOrders: state.allOrders.map(order =>
          order._id === action.payload._id
            ? { ...order, status: action.payload.status }
            : order
        ),
        // Show notification if needed
      };

    case 'orders/orderPriorityChangedViaWS':
      return {
        ...state,
        allOrders: state.allOrders.map(order =>
          order._id === action.payload._id
            ? { ...order, priority: action.payload.priority }
            : order
        ),
      };

    default:
      return state;
  }
};
```

### Update Machine Reducer

Similarly, update your machine reducer:

```typescript
const machinesReducer = (state = initialState, action: any) => {
  switch (action.type) {
    // ... existing cases ...

    // ✅ ADD WEBSOCKET CASES:
    case 'machines/machineStatusChangedViaWS':
      return {
        ...state,
        allMachines: state.allMachines.map(machine =>
          machine._id === action.payload._id
            ? { ...machine, status: action.payload.status }
            : machine
        ),
      };

    case 'machines/machineOrderStartedViaWS':
      return {
        ...state,
        allMachines: state.allMachines.map(machine =>
          machine._id === action.payload.machineId
            ? {
                ...machine,
                status: 'running',
                currentOrder: action.payload.order
              }
            : machine
        ),
      };

    case 'machines/machineOrderCompletedViaWS':
      return {
        ...state,
        allMachines: state.allMachines.map(machine =>
          machine._id === action.payload.machineId
            ? {
                ...machine,
                status: 'idle',
                currentOrder: null
              }
            : machine
        ),
      };

    default:
      return state;
  }
};
```

---

## 🧪 Step 6: Testing

### Test Locally

1. **Start Backend**:
   ```bash
   cd main27Backend
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   cd main27
   npm run dev
   ```

3. **Login and Check WebSocket**:
   - Open browser DevTools → Network → WS tab
   - You should see WebSocket connection established
   - Login with manager credentials
   - Check connection shows `status: connected`

4. **Test Real-Time Updates**:
   - Open order details page
   - In another tab, change order status via API or mobile app
   - Order status should update automatically without refresh!

5. **Test Force Logout**:
   - Login on Device A (Chrome)
   - Login with same user on Device B (Firefox)
   - Device A should show force logout modal and redirect to login

### Test After AWS Deployment

After deploying WebSocket to AWS (see next section), update `.env`:

```bash
VITE_WEBSOCKET_URL=wss://abc123.execute-api.ap-south-1.amazonaws.com/dev
```

Rebuild and test again.

---

## 📦 Available Hooks Reference

### `useWebSocketStatus()`
Returns connection status and metadata.

```typescript
const {
  status,              // 'connected' | 'connecting' | 'disconnected' | 'reconnecting'
  isConnected,         // boolean
  connectionId,        // string | null
  error,               // string | null
  reconnectAttempts,   // number
  subscribedRooms      // string[]
} = useWebSocketStatus();
```

### `useWebSocketConnect()`
Returns connect/disconnect functions.

```typescript
const { connect, disconnect } = useWebSocketConnect();

// Connect
connect(
  'wss://your-url.com',  // url
  'your-jwt-token',      // token
  'electron',            // platform
  'device-id-123'        // deviceId
);

// Disconnect
disconnect();
```

### `useWebSocketSend()`
Returns function to send custom messages.

```typescript
const sendMessage = useWebSocketSend();

sendMessage({
  action: 'customAction',
  data: { foo: 'bar' }
});
```

### `useWebSocketRooms()`
Returns room subscription functions.

```typescript
const { subscribeToRoom, subscribeToOrder, subscribeToMachine } = useWebSocketRooms();

subscribeToRoom('branch:123');
subscribeToOrder('order-id-456');
subscribeToMachine('machine-id-789');
```

### `useOrderUpdates(orderId)`
Auto-subscribes to order updates when orderId changes.

```typescript
const orderId = useParams().orderId;
useOrderUpdates(orderId); // Automatically subscribes when connected
```

### `useMachineUpdates(machineId)`
Auto-subscribes to machine updates when machineId changes.

```typescript
const machineId = useParams().machineId;
useMachineUpdates(machineId); // Automatically subscribes when connected
```

### `useForceLogoutStatus()`
Returns force logout status.

```typescript
const { forceLoggedOut, forceLogoutReason } = useForceLogoutStatus();
```

---

## 🔐 Security Notes

1. **Token Expiration**: JWT token is sent in WebSocket URL. If token expires, you need to reconnect with new token:
   ```typescript
   // After token refresh
   dispatch({ type: 'websocket/disconnect' });
   dispatch({
     type: 'websocket/connect',
     payload: { url, token: newToken, platform, deviceId }
   });
   ```

2. **Branch Isolation**: Users can only subscribe to their own branch data. The backend validates all subscriptions.

3. **Rate Limiting**: 100 messages per minute per user. Exceeding this will disconnect you.

4. **Connection Limits**: Maximum 10 connections per user, 50 per IP address.

---

## 🐛 Troubleshooting

### WebSocket Won't Connect

1. Check browser console for errors
2. Verify `VITE_WEBSOCKET_URL` in `.env`
3. Check backend logs for connection attempts
4. Verify JWT token is valid

### Messages Not Appearing

1. Check Redux DevTools → State → websocket.lastMessages
2. Verify reducer handles WebSocket actions (e.g., `orders/orderStatusChangedViaWS`)
3. Check if subscribed to correct room (Redux state → websocket.subscribedRooms)

### Force Logout Not Working

1. Check if `sessionManager.js` is being called in login handlers
2. Verify WebSocket middleware is handling `session:force_logout` event
3. Check localStorage is being cleared

### Connection Keeps Disconnecting

1. Check if hitting rate limit (100 messages/minute)
2. Check if hitting connection limit (10/user)
3. Verify JWT token hasn't expired
4. Check backend CloudWatch logs for errors

---

## ✅ Checklist

- [ ] Added `websocket` reducer to `rootReducer.tsx`
- [ ] Added `websocketMiddleware` to store configuration
- [ ] Updated login actions to connect WebSocket
- [ ] Added `VITE_WEBSOCKET_URL` to `.env`
- [ ] Created `WebSocketStatus` component
- [ ] Created `ForceLogoutModal` component
- [ ] Updated order reducer to handle WebSocket actions
- [ ] Updated machine reducer to handle WebSocket actions
- [ ] Used `useOrderUpdates()` in order details pages
- [ ] Used `useMachineUpdates()` in machine monitoring pages
- [ ] Tested locally with `npm run dev`
- [ ] Tested force logout with multiple browser tabs
- [ ] Updated `.env` with production WebSocket URL after deployment
- [ ] Tested in production

---

## 🚀 Next Steps

1. **Fix CloudFormation 500 Resource Limit** (see WEBSOCKET_DEPLOYMENT_FIX.md)
2. **Deploy WebSocket as Separate Service**
3. **Update Frontend `.env` with Production WebSocket URL**
4. **Test All Features in Production**

---

## 📚 Related Documentation

- `WEBSOCKET_SETUP_GUIDE.md` - Backend WebSocket setup
- `WEBSOCKET_SECURITY_AUDIT.md` - Security vulnerabilities fixed
- `SINGLE_SESSION_INTEGRATION_GUIDE.md` - Single session enforcement
- `WEBSOCKET_TESTING_GUIDE.md` - Testing procedures
