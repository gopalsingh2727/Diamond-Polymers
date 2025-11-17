# Quick Start Guide - CRUD + Caching System

## ✅ What's Included

1. **CRUD Operations** - Save/Update/Delete with animations
2. **Data Caching** - Prevent multiple API calls (66% fewer requests!)
3. **Smooth Animations** - Professional UI transitions

---

## 🚀 Use It Now (3 Steps)

### Step 1: For Order Forms (Cached Data - No Repeated API Calls!)

```typescript
import { useOrderFormData } from '@/hooks/useOrderFormData';
import { ActionButton } from '@/components/shared/ActionButton';
import { ToastContainer } from '@/components/shared/Toast';
import { useCRUD } from '@/hooks/useCRUD';

const MyOrderForm = () => {
  // ✅ All data cached - fetched only ONCE!
  const { branches, customers, machines, products, isLoading } = useOrderFormData();
  const { saveState, handleSave, toast } = useCRUD();

  const onSave = () => {
    handleSave(() => api.createOrder(orderData), {
      successMessage: 'Order created!'
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <select>{branches.map(b => <option key={b._id}>{b.name}</option>)}</select>
      <select>{customers.map(c => <option key={c._id}>{c.name}</option>)}</select>

      <ActionButton type="save" state={saveState} onClick={onSave} />
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </>
  );
};
```

### Step 2: For Simple Forms (Just Save/Update/Delete)

```typescript
import { ActionButton } from '@/components/shared/ActionButton';
import { ToastContainer } from '@/components/shared/Toast';
import { useCRUD } from '@/hooks/useCRUD';
import { branchAPI } from '@/utils/crudHelpers';

const SimpleForm = () => {
  const { saveState, handleSave, toast } = useCRUD();
  const [data, setData] = useState({ name: '' });

  const onSave = () => {
    handleSave(() => branchAPI.create(data), {
      successMessage: 'Saved successfully!'
    });
  };

  return (
    <>
      <input value={data.name} onChange={e => setData({...data, name: e.target.value})} />
      <ActionButton type="save" state={saveState} onClick={onSave} />
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </>
  );
};
```

### Step 3: For Delete with Confirmation

```typescript
import { ActionButton } from '@/components/shared/ActionButton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useCRUD } from '@/hooks/useCRUD';

const DeleteExample = () => {
  const { deleteState, handleDelete, confirmDialog, closeConfirmDialog } = useCRUD();

  const onDelete = (id) => {
    handleDelete(() => api.delete(`/branch/${id}`), {
      confirmMessage: 'Delete this? Cannot be undone!',
      successMessage: 'Deleted successfully!'
    });
  };

  return (
    <>
      <ActionButton type="delete" state={deleteState} onClick={() => onDelete('123')} />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Confirm Delete"
        message="Are you sure?"
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirmDialog}
      />
    </>
  );
};
```

---

## 📦 Pre-configured API Helpers

Use these instead of raw axios calls:

```typescript
import { branchAPI, customerAPI, machineAPI, orderAPI } from '@/utils/crudHelpers';

// Create
await branchAPI.create({ name: 'New Branch', location: 'City' });

// Get all
const branches = await branchAPI.getAll();

// Get by ID
const branch = await branchAPI.getById('123');

// Update
await branchAPI.update('123', { name: 'Updated Name' });

// Delete
await branchAPI.delete('123');

// Also available: customerAPI, machineAPI, orderAPI, productAPI, materialAPI
```

---

## 🎨 Animation Classes

```html
<!-- Slide in from right (toasts) -->
<div class="animate-slide-in-right">Toast!</div>

<!-- Scale in from center (modals) -->
<div class="animate-scale-in">Modal!</div>

<!-- Fade in -->
<div class="animate-fade-in">Content</div>

<!-- Bounce (success) -->
<svg class="animate-bounce">✓</svg>

<!-- Shake (error) -->
<svg class="animate-shake">✗</svg>

<!-- Pulse (loading) -->
<button class="animate-pulse">Loading...</button>

<!-- Spin (loading spinner) -->
<svg class="animate-spin">⟳</svg>

<!-- Button hover lift -->
<button class="btn-hover-lift">Hover me!</button>
```

---

## 📊 Cache Performance

```
WITHOUT CACHING:
User opens order form    → 8 API calls
User edits order        → 8 API calls
User creates new order  → 8 API calls
Total: 24 API calls 🐌

WITH CACHING:
User opens order form    → 8 API calls (first time)
User edits order        → 0 API calls (cached!)
User creates new order  → 0 API calls (cached!)
Total: 8 API calls 🚀

Result: 66% FEWER API CALLS!
```

---

## 🎯 Complete Example

```typescript
import { useOrderFormData } from '@/hooks/useOrderFormData';
import { ActionButton } from '@/components/shared/ActionButton';
import { ToastContainer } from '@/components/shared/Toast';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useCRUD } from '@/hooks/useCRUD';
import { orderAPI } from '@/utils/crudHelpers';

const OrderForm = () => {
  const { branches, customers, machines, isLoading } = useOrderFormData();
  const { saveState, deleteState, handleSave, handleDelete, confirmDialog, closeConfirmDialog, toast } = useCRUD();
  const [order, setOrder] = useState({ branchId: '', customerId: '', machineId: '' });

  const onSave = () => {
    handleSave(() => orderAPI.create(order), {
      successMessage: 'Order created!'
    });
  };

  const onDelete = (id) => {
    handleDelete(() => orderAPI.delete(id), {
      confirmMessage: 'Delete this order?'
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      {/* Cached dropdowns - no repeated API calls! */}
      <select value={order.branchId} onChange={e => setOrder({...order, branchId: e.target.value})}>
        {branches.map(b => <option key={b._id}>{b.name}</option>)}
      </select>

      <select value={order.customerId} onChange={e => setOrder({...order, customerId: e.target.value})}>
        {customers.map(c => <option key={c._id}>{c.name}</option>)}
      </select>

      <select value={order.machineId} onChange={e => setOrder({...order, machineId: e.target.value})}>
        {machines.map(m => <option key={m._id}>{m.machineName}</option>)}
      </select>

      {/* Animated buttons */}
      <ActionButton type="save" state={saveState} onClick={onSave} />
      <ActionButton type="delete" state={deleteState} onClick={() => onDelete('123')} />

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Confirm Delete"
        message="Are you sure?"
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirmDialog}
      />
    </>
  );
};
```

---

## 📚 Full Documentation

- **[CRUD_SYSTEM_GUIDE.md](./CRUD_SYSTEM_GUIDE.md)** - Complete CRUD guide
- **[CACHING_SYSTEM_GUIDE.md](./CACHING_SYSTEM_GUIDE.md)** - Caching system guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Full summary

---

## 🎉 That's It!

✅ **Animations imported** - Already done!
✅ **Components ready** - Just import and use!
✅ **API helpers ready** - Use branchAPI, customerAPI, etc.
✅ **Caching working** - Automatic!

**Start using it in your forms now!** 🚀
