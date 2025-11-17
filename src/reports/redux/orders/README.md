# Order Management Redux - Based on MongoDB Schema

This Redux implementation matches your MongoDB Order schema exactly, providing complete state management for orders with all nested structures and operations.

## Structure

```
redux/orders/
├── orderTypes.ts       # TypeScript interfaces matching MongoDB schema
├── orderConstants.ts   # Action type constants
├── orderActions.ts     # Action creators with API integration
├── orderReducer.ts     # Reducer for order state management
└── README.md          # This file
```

## MongoDB Schema Alignment

This Redux structure perfectly matches your MongoDB Order schema with all fields:

### ✅ Main Order Fields
- `orderId`, `customerId`, `materialId`, `materialWeight`
- Dimensions: `Width`, `Height`, `Thickness`
- Specifications: `SealingType`, `BottomGusset`, `Flap`, `AirHole`, `Printing`
- Status: `overallStatus`, `priority`, `currentStepIndex`
- Dates: `scheduledStartDate`, `scheduledEndDate`, `actualStartDate`, `actualEndDate`

### ✅ Nested Structures
- **MachineProgress**: With statuses ('none', 'pending', 'in-progress', 'completed', 'paused', 'error')
- **StepProgress**: With machines array and step statuses
- **MixMaterial**: With material tracking and costs
- **RealTimeData**: Totals from machine tables
- **QualityControl**: Inspection and quality tracking
- **Financial**: Cost tracking
- **Delivery**: Shipping and delivery info
- **Notes**: Communication tracking
- **Attachments**: File management

## Available Actions

### CRUD Operations

```tsx
// Fetch all orders with filters
dispatch(fetchOrders({
  overallStatus: 'in_progress',
  priority: 'urgent',
  startDate: '2024-01-01',
  endDate: '2024-12-31'
}));

// Fetch single order
dispatch(fetchOrderById(orderId));

// Create new order
dispatch(createOrder(orderData));

// Update order
dispatch(updateOrder(orderId, updates));

// Delete order
dispatch(deleteOrder(orderId));
```

### Status Management

```tsx
// Update order status
dispatch(updateOrderStatus(orderId, 'in_progress'));
// Status options: 'pending', 'in_progress', 'dispatched', 'cancelled', 'Wait for Approval', 'completed'
```

### Machine Operations

```tsx
// Complete current machine in step
dispatch(completeCurrentMachine(orderId, stepIndex));
```

### Step Operations

```tsx
// Progress to next step
dispatch(progressToNextStep(orderId));
```

### Real-time Data

```tsx
// Update real-time data from machine tables
dispatch(updateRealTimeData(orderId));
```

### Notes Management

```tsx
// Add note to order
dispatch(addOrderNote(
  orderId,
  'Production started on Machine 3',
  userId,
  'production' // 'general' | 'production' | 'quality' | 'delivery' | 'customer'
));
```

### Quality Control

```tsx
// Update quality control
dispatch(updateQualityControl(orderId, {
  inspectionStatus: 'passed',
  qualityScore: 95,
  inspectedBy: 'John Doe',
  qualityNotes: ['Excellent quality'],
  defects: []
}));
```

### Dashboard and Reports

```tsx
// Fetch dashboard data
dispatch(fetchDashboardData(30)); // Last 30 days

// Fetch efficiency report
dispatch(fetchEfficiencyReport('2024-01-01', '2024-12-31'));
```

### Filters and State

```tsx
// Set filters
dispatch(setOrderFilters({
  overallStatus: 'in_progress',
  priority: 'high',
  branchId: 'branch123'
}));

// Clear filters
dispatch(clearOrderFilters());

// Set current order
dispatch(setCurrentOrder(order));

// Clear current order
dispatch(clearCurrentOrder());
```

## Usage in Components

### Basic Order List

```tsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchOrders } from '../redux/orders/orderActions';

function OrderList() {
  const dispatch = useAppDispatch();
  
  const { orders, loading, error } = useAppSelector(
    (state) => state.orders
  );
  
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {orders.map(order => (
        <div key={order._id}>
          <h3>{order.orderId}</h3>
          <p>Status: {order.overallStatus}</p>
          <p>Priority: {order.priority}</p>
          <p>Efficiency: {order.realTimeData.overallEfficiency}%</p>
        </div>
      ))}
    </div>
  );
}
```

### Order Details with Real-time Updates

```tsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { 
  fetchOrderById, 
  updateRealTimeData,
  completeCurrentMachine,
  progressToNextStep 
} from '../redux/orders/orderActions';

function OrderDetails({ orderId }: { orderId: string }) {
  const dispatch = useAppDispatch();
  
  const { currentOrder, loading } = useAppSelector(
    (state) => state.orders
  );
  
  useEffect(() => {
    // Fetch order details
    dispatch(fetchOrderById(orderId));
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      dispatch(updateRealTimeData(orderId));
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch, orderId]);
  
  const handleCompleteMachine = async (stepIndex: number) => {
    await dispatch(completeCurrentMachine(orderId, stepIndex));
    // Refresh real-time data
    dispatch(updateRealTimeData(orderId));
  };
  
  const handleNextStep = async () => {
    await dispatch(progressToNextStep(orderId));
  };
  
  if (loading || !currentOrder) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>{currentOrder.orderId}</h2>
      
      {/* Real-time Data */}
      <div>
        <h3>Production Metrics</h3>
        <p>Net Weight: {currentOrder.realTimeData.totalNetWeight} kg</p>
        <p>Wastage: {currentOrder.realTimeData.totalWastage} kg</p>
        <p>Efficiency: {currentOrder.realTimeData.overallEfficiency}%</p>
        <p>Active Machines: {currentOrder.realTimeData.activeMachines}</p>
      </div>
      
      {/* Steps and Machines */}
      <div>
        <h3>Production Steps</h3>
        {currentOrder.steps.map((step, stepIndex) => (
          <div key={step._id}>
            <h4>Step {stepIndex + 1}: {step.stepStatus}</h4>
            {step.machines.map((machine, machineIndex) => (
              <div key={machine._id || machineIndex}>
                <p>Machine Status: {machine.status}</p>
                <p>Operator: {machine.operatorName || 'Not assigned'}</p>
                <p>Efficiency: {machine.calculatedOutput.efficiency}%</p>
                
                {machine.status === 'in-progress' && (
                  <button onClick={() => handleCompleteMachine(stepIndex)}>
                    Complete Machine
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Quality Control */}
      <div>
        <h3>Quality Control</h3>
        <p>Status: {currentOrder.qualityControl.inspectionStatus}</p>
        <p>Score: {currentOrder.qualityControl.qualityScore || 'N/A'}</p>
      </div>
      
      {/* Actions */}
      <button onClick={handleNextStep}>
        Progress to Next Step
      </button>
    </div>
  );
}
```

### Dashboard with Reports

```tsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchDashboardData, fetchEfficiencyReport } from '../redux/orders/orderActions';

function Dashboard() {
  const dispatch = useAppDispatch();
  
  const { dashboardData, efficiencyReport, loading } = useAppSelector(
    (state) => state.orders
  );
  
  useEffect(() => {
    dispatch(fetchDashboardData(30));
    dispatch(fetchEfficiencyReport('2024-01-01', '2024-12-31'));
  }, [dispatch]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {/* Dashboard Summary */}
      {dashboardData && (
        <div>
          <h2>Dashboard ({dashboardData.dateRange})</h2>
          <p>Total Orders: {dashboardData.totalOrders}</p>
          
          {dashboardData.statusBreakdown.map(status => (
            <div key={status._id}>
              <h3>{status._id}</h3>
              <p>Count: {status.count}</p>
              <p>Total Weight: {status.totalWeight} kg</p>
              <p>Avg Efficiency: {status.avgEfficiency.toFixed(2)}%</p>
            </div>
          ))}
        </div>
      )}
      
      {/* Efficiency Report */}
      {efficiencyReport && (
        <div>
          <h2>Efficiency Report</h2>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Efficiency</th>
                <th>Net Weight</th>
              </tr>
            </thead>
            <tbody>
              {efficiencyReport.map(report => (
                <tr key={report.orderId}>
                  <td>{report.orderId}</td>
                  <td>{report.customerName}</td>
                  <td>{report.overallEfficiency}%</td>
                  <td>{report.totalNetWeight} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

### Adding Notes

```tsx
import { useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { addOrderNote } from '../redux/orders/orderActions';

function AddNoteForm({ orderId, userId }: { orderId: string, userId: string }) {
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState('');
  const [noteType, setNoteType] = useState<'general' | 'production' | 'quality' | 'delivery' | 'customer'>('general');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(addOrderNote(orderId, message, userId, noteType));
    setMessage('');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <textarea 
        value={message} 
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter note..."
      />
      <select value={noteType} onChange={(e) => setNoteType(e.target.value as any)}>
        <option value="general">General</option>
        <option value="production">Production</option>
        <option value="quality">Quality</option>
        <option value="delivery">Delivery</option>
        <option value="customer">Customer</option>
      </select>
      <button type="submit">Add Note</button>
    </form>
  );
}
```

## API Endpoints

The actions expect these API endpoints:

```
GET    /api/orders                           - Fetch orders with filters
GET    /api/orders/:orderId                  - Fetch single order
POST   /api/orders                           - Create new order
PUT    /api/orders/:orderId                  - Update order
DELETE /api/orders/:orderId                  - Delete order
PATCH  /api/orders/:orderId/status           - Update order status
POST   /api/orders/:orderId/complete-machine - Complete current machine
POST   /api/orders/:orderId/next-step        - Progress to next step
POST   /api/orders/:orderId/update-realtime  - Update real-time data
POST   /api/orders/:orderId/notes            - Add note
PATCH  /api/orders/:orderId/quality-control  - Update quality control
GET    /api/orders/dashboard/:branchId       - Get dashboard data
GET    /api/orders/efficiency-report/:branchId - Get efficiency report
```

## State Structure

```typescript
state.orders = {
  currentOrder: Order | null,           // Currently viewed/edited order
  orders: Order[],                      // List of orders
  pagination: PaginationInfo | null,    // Pagination data
  dashboardData: DashboardData | null,  // Dashboard summary
  efficiencyReport: EfficiencyReport[] | null, // Efficiency report
  filters: OrderFilters,                // Active filters
  loading: boolean,                     // Global loading state
  saving: boolean,                      // Saving state
  error: string | null,                 // Error message
  successMessage: string | null,        // Success message
  isCreating: boolean,                  // Creating order flag
  isUpdating: boolean,                  // Updating order flag
  isDeleting: boolean,                  // Deleting order flag
  isFetching: boolean                   // Fetching orders flag
}
```

## TypeScript Support

All interfaces match your MongoDB schema exactly:

```typescript
import { 
  Order, 
  MachineProgress,
  StepProgress,
  MixMaterial,
  RealTimeData,
  QualityControl,
  Financial,
  Delivery,
  OrderNote,
  OrderAttachment,
  DashboardData,
  EfficiencyReport
} from '../redux/orders/orderTypes';
```

## Error Handling

All actions include comprehensive error handling:

```tsx
try {
  await dispatch(createOrder(orderData));
  // Success - successMessage will be set in state
} catch (error) {
  // Error - error message will be set in state
  console.error('Failed to create order:', error);
}
```

## Real-time Updates

For real-time updates of machine table data:

```tsx
// Set up polling for real-time data
useEffect(() => {
  const interval = setInterval(() => {
    if (currentOrder?._id) {
      dispatch(updateRealTimeData(currentOrder._id));
    }
  }, 30000); // Update every 30 seconds
  
  return () => clearInterval(interval);
}, [currentOrder?._id, dispatch]);
```

## Machine Status Flow

The machine status flow matches your schema:

1. **none** → Machine is waiting (not yet ready to work)
2. **pending** → Machine is ready to start work
3. **in-progress** → Machine is actively working
4. **completed** → Machine has finished its work
5. **paused** → Machine work is temporarily stopped
6. **error** → Machine has encountered an issue

Use `completeCurrentMachine()` to automatically progress:
- Current machine → 'completed'
- Next machine → 'pending' (if it was 'none')

## Best Practices

1. **Always refresh real-time data** after completing machines or progressing steps
2. **Use error boundaries** to catch and display errors gracefully
3. **Clear messages** after displaying them to users
4. **Poll for updates** on active orders to keep real-time data current
5. **Validate data** before dispatching create/update actions
6. **Handle loading states** to provide good UX

## Integration with Reports

The order data can be used directly in your reports dashboard:

```tsx
// In your reports components
const { orders } = useAppSelector((state) => state.orders);

// Filter for report-specific views
const completedOrders = orders.filter(o => o.overallStatus === 'completed');
const urgentOrders = orders.filter(o => o.priority === 'urgent');
```
