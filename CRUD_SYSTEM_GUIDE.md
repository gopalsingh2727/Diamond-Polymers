# CRUD System with Animations - User Guide

## Overview
This comprehensive CRUD system provides consistent save/update/delete operations with smooth animations across the entire main27 application.

## Features
✅ Unified action buttons with loading states
✅ Toast notifications with 4 types (success, error, info, warning)
✅ Confirmation dialogs for destructive operations
✅ Smooth animations for all state transitions
✅ TypeScript support
✅ Reusable hooks and components

---

## Quick Start

### 1. Import Required Components and Hooks

```typescript
import { ActionButton } from '@/components/shared/ActionButton';
import { ToastContainer } from '@/components/shared/Toast';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useCRUD } from '@/hooks/useCRUD';
```

### 2. Import Animations CSS

Add this to your main CSS file or component:

```typescript
import '@/styles/animations.css';
```

### 3. Basic Usage

```typescript
const MyComponent: React.FC = () => {
  const {
    saveState,
    updateState,
    deleteState,
    handleSave,
    handleUpdate,
    handleDelete,
    confirmDialog,
    closeConfirmDialog,
    toast
  } = useCRUD();

  const onSave = () => {
    handleSave(async () => {
      // Your save API call
      return await api.save(data);
    }, {
      successMessage: 'Data saved successfully',
      onSuccess: (result) => console.log(result)
    });
  };

  return (
    <div>
      <ActionButton
        type="save"
        state={saveState}
        onClick={onSave}
      />

      <ToastContainer
        toasts={toast.toasts}
        onClose={toast.removeToast}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Confirm"
        message="Are you sure?"
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirmDialog}
      />
    </div>
  );
};
```

---

## Components

### 1. ActionButton

Animated button for CRUD operations.

**Props:**
```typescript
interface ActionButtonProps {
  type: 'save' | 'update' | 'delete' | 'submit';
  state: 'idle' | 'loading' | 'success' | 'error';
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}
```

**Usage:**
```typescript
<ActionButton
  type="save"
  state={saveState}
  onClick={handleSave}
/>

<ActionButton
  type="delete"
  state={deleteState}
  onClick={handleDelete}
  className="custom-class"
>
  Custom Delete Text
</ActionButton>
```

**States:**
- `idle` - Default state
- `loading` - Shows spinner animation
- `success` - Shows checkmark with bounce animation
- `error` - Shows X icon with shake animation

---

### 2. Toast Notifications

**Types:**
- `success` - Green with checkmark
- `error` - Red with X icon
- `info` - Blue with info icon
- `warning` - Yellow with warning icon

**Manual Usage:**
```typescript
const { toast } = useCRUD();

// Success
toast.success('Success!', 'Operation completed successfully');

// Error
toast.error('Error!', 'Something went wrong');

// Info
toast.info('Info', 'Here is some information');

// Warning
toast.warning('Warning!', 'Please be careful');
```

**Toast Container Positions:**
```typescript
<ToastContainer
  toasts={toast.toasts}
  onClose={toast.removeToast}
  position="top-right" // top-left, bottom-right, bottom-left, top-center, bottom-center
/>
```

---

### 3. Confirm Dialog

Modal dialog for confirming destructive actions (delete operations).

**Props:**
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string; // Default: "Confirm"
  cancelText?: string;  // Default: "Cancel"
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Usage:**
```typescript
<ConfirmDialog
  isOpen={confirmDialog.isOpen}
  title="Delete Item"
  message="Are you sure you want to delete this item?"
  confirmText="Delete"
  type="danger"
  onConfirm={confirmDialog.onConfirm}
  onCancel={closeConfirmDialog}
  isLoading={deleteState === 'loading'}
/>
```

---

## Hooks

### useCRUD Hook

Main hook for managing CRUD operations.

**Return Values:**
```typescript
{
  saveState: ActionState;
  updateState: ActionState;
  deleteState: ActionState;
  handleSave: (fn, options) => Promise<T>;
  handleUpdate: (fn, options) => Promise<T>;
  handleDelete: (fn, options) => Promise<T>;
  confirmDialog: { isOpen: boolean; onConfirm: () => void };
  closeConfirmDialog: () => void;
  toast: ToastHook;
  resetStates: () => void;
}
```

**Options:**
```typescript
interface CRUDOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
  confirmMessage?: string; // For delete only
  confirmTitle?: string;    // For delete only
}
```

---

## Complete Examples

### Example 1: Simple Form with Save

```typescript
import { ActionButton } from '@/components/shared/ActionButton';
import { ToastContainer } from '@/components/shared/Toast';
import { useCRUD } from '@/hooks/useCRUD';
import { useState } from 'react';

const SimpleForm = () => {
  const { saveState, handleSave, toast } = useCRUD();
  const [data, setData] = useState({ name: '', email: '' });

  const onSave = () => {
    handleSave(async () => {
      const response = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.json();
    }, {
      successMessage: `User ${data.name} created successfully`,
      onSuccess: () => setData({ name: '', email: '' })
    });
  };

  return (
    <div>
      <input
        value={data.name}
        onChange={(e) => setData({ ...data, name: e.target.value })}
      />
      <ActionButton type="save" state={saveState} onClick={onSave} />
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};
```

### Example 2: Full CRUD Operations

```typescript
const FullCRUD = () => {
  const {
    saveState,
    updateState,
    deleteState,
    handleSave,
    handleUpdate,
    handleDelete,
    confirmDialog,
    closeConfirmDialog,
    toast
  } = useCRUD();

  const [item, setItem] = useState({ id: null, name: '' });

  const onSave = () => {
    handleSave(async () => {
      return await api.post('/items', item);
    });
  };

  const onUpdate = () => {
    handleUpdate(async () => {
      return await api.put(`/items/${item.id}`, item);
    });
  };

  const onDelete = () => {
    handleDelete(async () => {
      return await api.delete(`/items/${item.id}`);
    }, {
      confirmTitle: 'Delete Item',
      confirmMessage: `Delete "${item.name}"? This cannot be undone.`,
      onSuccess: () => setItem({ id: null, name: '' })
    });
  };

  return (
    <div>
      <input
        value={item.name}
        onChange={(e) => setItem({ ...item, name: e.target.value })}
      />

      <div className="flex gap-4">
        <ActionButton type="save" state={saveState} onClick={onSave} />
        <ActionButton type="update" state={updateState} onClick={onUpdate} />
        <ActionButton type="delete" state={deleteState} onClick={onDelete} />
      </div>

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Item"
        message={`Delete "${item.name}"?`}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirmDialog}
        isLoading={deleteState === 'loading'}
      />
    </div>
  );
};
```

### Example 3: With Redux Integration

```typescript
import { useDispatch } from 'react-redux';
import { saveBranch, updateBranch, deleteBranch } from '@/redux/branch/actions';

const BranchForm = () => {
  const dispatch = useDispatch();
  const { saveState, handleSave, toast } = useCRUD();
  const [branch, setBranch] = useState({ name: '', location: '' });

  const onSave = () => {
    handleSave(async () => {
      return await dispatch(saveBranch(branch));
    }, {
      successMessage: `Branch ${branch.name} created`,
      onSuccess: (result) => {
        console.log('Saved:', result);
        setBranch({ name: '', location: '' });
      }
    });
  };

  return (
    <>
      {/* Form inputs */}
      <ActionButton type="save" state={saveState} onClick={onSave} />
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </>
  );
};
```

---

## Animations

All components include smooth animations:

- **Slide In** - Toasts slide in from the right
- **Scale In** - Dialogs scale up from center
- **Fade In** - Backdrop fades in
- **Bounce** - Success icons bounce
- **Shake** - Error icons shake
- **Pulse** - Loading states pulse
- **Spin** - Loading spinners rotate
- **Progress** - Toast progress bar

**Custom Animations:**

Add to your component:
```typescript
className="animate-slide-in-right animate-bounce animate-fade-in"
```

Available animation classes:
- `animate-slide-in-right`
- `animate-scale-in`
- `animate-fade-in`
- `animate-shake`
- `animate-bounce`
- `animate-pulse`
- `animate-spin`
- `animate-progress`

---

## Best Practices

1. **Always use ToastContainer** - Include it in your component for visual feedback
2. **Reset forms after success** - Clear form data in `onSuccess` callback
3. **Handle errors gracefully** - Provide meaningful error messages
4. **Use confirm dialog for deletes** - Always confirm destructive actions
5. **Keep loading states consistent** - Use the provided action states

---

## Troubleshooting

**Issue:** Animations not working
**Solution:** Make sure `animations.css` is imported in your main CSS file

**Issue:** Toasts not showing
**Solution:** Ensure `<ToastContainer>` is rendered in your component

**Issue:** Button stays in loading state
**Solution:** Ensure your async function returns a Promise

**Issue:** Multiple toasts stacking
**Solution:** Use `toast.clearAll()` before showing new toasts if needed

---

## File Structure

```
src/
├── components/
│   ├── shared/
│   │   ├── ActionButton.tsx
│   │   ├── Toast.tsx
│   │   └── ConfirmDialog.tsx
│   └── examples/
│       └── CRUDExample.tsx
├── hooks/
│   ├── useCRUD.ts
│   └── useToast.ts
└── styles/
    └── animations.css
```

---

## Support

For issues or questions, refer to the example component at:
`src/components/examples/CRUDExample.tsx`
