# Order Forwarding - Frontend Components

Complete React/TypeScript components for order forwarding functionality with Redux state management.

## 📁 Structure

```
OrderForward/
├── index.tsx                    # Main exports
├── OrderForwardCommon.css       # Shared styles
├── Connections/
│   ├── Connections.tsx          # Connection management page
│   └── Connections.css
├── ReceivedOrders/
│   ├── ReceivedOrders.tsx       # Orders received FROM others
│   └── ReceivedOrders.css
├── ForwardedOrders/
│   ├── ForwardedOrders.tsx      # Orders forwarded TO others
│   └── ForwardedOrders.css
└── components/
    ├── ForwardOrderModal.tsx    # Reusable forward modal
    └── ForwardOrderModal.css
```

## ✅ What's Included

### Pages (3)
1. **Connections** - Manage company connections
2. **ReceivedOrders** - View orders received from other branches
3. **ForwardedOrders** - View orders forwarded to other branches

### Components (1)
1. **ForwardOrderModal** - Reusable modal for forwarding orders

### Redux Integration
- All components connected to Redux
- Real-time updates
- Error handling
- Loading states

## 🚀 Quick Start

### 1. Import Components

```typescript
import {
  Connections,
  ReceivedOrders,
  ForwardedOrders,
  ForwardOrderModal
} from './componest/second/menu/OrderForward';
```

### 2. Use in Routes

```typescript
// In your router configuration
import { Connections, ReceivedOrders, ForwardedOrders } from './menu/OrderForward';

const routes = [
  {
    path: '/order-forward/connections',
    component: Connections
  },
  {
    path: '/order-forward/received',
    component: ReceivedOrders
  },
  {
    path: '/order-forward/forwarded',
    component: ForwardedOrders
  }
];
```

### 3. Add to Menu

```typescript
// In your menu configuration
const menuItems = [
  {
    title: 'Order Forward',
    icon: '🔄',
    children: [
      { path: '/order-forward/connections', label: 'Connections' },
      { path: '/order-forward/received', label: 'Received Orders' },
      { path: '/order-forward/forwarded', label: 'Forwarded Orders' }
    ]
  }
];
```

### 4. Use Forward Modal in Orders Page

```typescript
import { useState } from 'react';
import { ForwardOrderModal } from './menu/OrderForward';

function OrdersPage() {
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleForward = (order) => {
    setSelectedOrder(order);
    setForwardModalOpen(true);
  };

  return (
    <div>
      {/* Your orders table */}
      <button onClick={() => handleForward(order)}>
        Forward →
      </button>

      {/* Forward Modal */}
      <ForwardOrderModal
        isOpen={forwardModalOpen}
        onClose={() => setForwardModalOpen(false)}
        orderId={selectedOrder?._id}
        orderNumber={selectedOrder?.orderNumber}
        onSuccess={() => {
          // Refresh orders list
          loadOrders();
        }}
      />
    </div>
  );
}
```

## 📘 Component API

### Connections

Self-contained page component. No props needed.

**Features:**
- Tabbed interface (Connections, Pending, Sent)
- Send connection requests
- Accept/reject/block requests
- Remove connections
- Real-time stats

### ReceivedOrders

Self-contained page component. No props needed.

**Features:**
- Paginated orders list
- Status filter
- Forwarding chain view
- Real-time updates

### ForwardedOrders

Self-contained page component. No props needed.

**Features:**
- Paginated orders list
- Status filter
- Forwarding chain view
- Track forwarding status

### ForwardOrderModal

Reusable modal component.

**Props:**
```typescript
interface ForwardOrderModalProps {
  isOpen: boolean;           // Control modal visibility
  onClose: () => void;       // Close handler
  orderId: string;           // Order ID to forward
  orderNumber: string;       // Order number (display)
  onSuccess?: () => void;    // Success callback
}
```

**Usage:**
```typescript
<ForwardOrderModal
  isOpen={true}
  onClose={() => setModalOpen(false)}
  orderId="695a1234567890"
  orderNumber="MRK-2026-0001"
  onSuccess={() => console.log('Forwarded!')}
/>
```

## 🎨 Styling

All components use modular CSS with shared common styles.

**Customization:**
```css
/* Override in your global CSS */
.connection-card {
  /* Your custom styles */
}

.orders-table {
  /* Your custom table styles */
}
```

## 🔌 Redux State

Components automatically connect to Redux state:

```typescript
const {
  connections,              // Active connections
  pendingRequests,          // Incoming requests
  sentRequests,             // Outgoing requests
  receivedOrders,           // Orders received
  forwardedOrders,          // Orders forwarded
  forwardingChain,          // Chain data
  loading,                  // Loading state
  error,                    // Error messages
  successMessage            // Success messages
} = useSelector((state: RootState) => state.orderForward);
```

## 🔄 Real-Time Updates (Optional)

Connect to WebSocket for live updates:

```typescript
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchReceivedOrders } from './redux/orderforward/orderForwardActions';

function ReceivedOrdersWithWebSocket() {
  const dispatch = useDispatch();
  const websocket = useSelector((state: RootState) => state.websocket);

  useEffect(() => {
    if (websocket.lastMessage?.type === 'order:received') {
      // Refresh list when new order arrives
      dispatch(fetchReceivedOrders() as any);

      // Show notification
      showNotification('New order received!');
    }
  }, [websocket.lastMessage]);

  return <ReceivedOrders />;
}
```

## 🎯 Features

### Connection Management
- ✅ Send connection requests to companies
- ✅ Accept/reject/block incoming requests
- ✅ View connection statistics
- ✅ Remove connections
- ✅ Real-time status updates

### Order Forwarding
- ✅ Forward orders to connected branches
- ✅ View received orders from other branches
- ✅ Track forwarded orders
- ✅ View complete forwarding chain (A→B→C→D)
- ✅ Filter by status
- ✅ Pagination support

### User Experience
- ✅ Loading states
- ✅ Error handling
- ✅ Success messages
- ✅ Empty states
- ✅ Responsive design
- ✅ Accessible modals

## 🧪 Testing

### Manual Testing Checklist

**Connections:**
- [ ] Send connection request
- [ ] View sent requests
- [ ] Accept incoming request
- [ ] Reject incoming request
- [ ] Remove connection
- [ ] View connection stats

**Order Forwarding:**
- [ ] Open forward modal
- [ ] Select target branch
- [ ] Add notes
- [ ] Forward order
- [ ] View in Forwarded Orders
- [ ] View in Received Orders (target branch)
- [ ] View forwarding chain

## 🐛 Common Issues

### "No connections available"
- User needs to establish connections first
- Go to Connections page → Send Request

### Modal not closing
- Check `onClose` prop is provided
- Verify Redux state update

### Orders not loading
- Check Redux state in DevTools
- Verify API endpoints are accessible
- Check browser console for errors

## 📱 Responsive Design

All components are mobile-responsive:
- **Desktop**: Full table view with all columns
- **Tablet**: Horizontal scroll for tables
- **Mobile**: Stacked layout, simplified views

## ♿ Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus management in modals
- Clear error messages

## 🎨 Theming

Colors used (easily customizable):
```css
--primary: #007bff;
--success: #28a745;
--danger: #dc3545;
--warning: #ffc107;
--info: #17a2b8;
--light: #f8f9fa;
--dark: #343a40;
```

## 🔧 Customization

### Custom Order Card
```typescript
// Create your own order card component
import { ForwardedOrder } from './redux/orderforward/orderForwardTypes';

function CustomOrderCard({ order }: { order: ForwardedOrder }) {
  return (
    <div className="my-order-card">
      {/* Your custom layout */}
    </div>
  );
}
```

### Custom Chain Visualization
```typescript
// Override chain display
.forwarding-chain {
  /* Your custom chain styles */
  display: flex;
  flex-direction: row; /* Horizontal instead of vertical */
}
```

## 📚 Further Reading

- [Backend API Documentation](../../../../main27Backend/ordersforward/API-DOCUMENTATION.md)
- [Redux Actions Reference](../../../redux/orderforward/orderForwardActions.ts)
- [Redux Types Reference](../../../redux/orderforward/orderForwardTypes.ts)

## 💡 Tips

1. **Optimize Pagination**: Adjust `limit` in fetch actions based on screen size
2. **Cache Data**: Redux automatically caches, but consider localStorage for offline support
3. **Error Boundaries**: Wrap components in error boundaries for better error handling
4. **Loading States**: Show skeleton screens instead of plain "Loading..."
5. **Optimistic Updates**: Update UI immediately, rollback if API fails

## 🤝 Contributing

When adding new features:
1. Follow existing component structure
2. Use TypeScript types from `orderForwardTypes.ts`
3. Update Redux actions if needed
4. Add CSS following BEM or similar convention
5. Test on mobile devices

## 📄 License

Part of 27infinity manufacturing platform.

---

**Status**: ✅ Production Ready
**Last Updated**: 2026-01-08
**Components**: 3 pages + 1 modal
**Redux Integration**: Complete
**Styling**: Complete
