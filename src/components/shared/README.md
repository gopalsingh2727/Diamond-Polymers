# Shared CRUD Components

## Quick Reference

### ActionButton
```tsx
<ActionButton
  type="save" // 'save' | 'update' | 'delete' | 'submit'
  state={saveState} // 'idle' | 'loading' | 'success' | 'error'
  onClick={handleSave}
/>
```

### Toast Notifications
```tsx
// In your component
const { toast } = useCRUD();

// Show toast
toast.success('Title', 'Message');
toast.error('Title', 'Message');
toast.info('Title', 'Message');
toast.warning('Title', 'Message');

// Render container
<ToastContainer
  toasts={toast.toasts}
  onClose={toast.removeToast}
  position="top-right"
/>
```

### Confirm Dialog
```tsx
<ConfirmDialog
  isOpen={confirmDialog.isOpen}
  title="Confirm Delete"
  message="Are you sure?"
  type="danger"
  onConfirm={confirmDialog.onConfirm}
  onCancel={closeConfirmDialog}
  isLoading={deleteState === 'loading'}
/>
```

## Full Example

```tsx
import { ActionButton } from './ActionButton';
import { ToastContainer } from './Toast';
import { ConfirmDialog } from './ConfirmDialog';
import { useCRUD } from '@/hooks/useCRUD';

const MyComponent = () => {
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
      // Your API call
      return await api.save(data);
    }, {
      successMessage: 'Saved!',
      onSuccess: (result) => console.log(result)
    });
  };

  return (
    <>
      <ActionButton type="save" state={saveState} onClick={onSave} />
      <ActionButton type="update" state={updateState} onClick={onUpdate} />
      <ActionButton type="delete" state={deleteState} onClick={onDelete} />

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      <ConfirmDialog {...confirmDialog} onCancel={closeConfirmDialog} />
    </>
  );
};
```

See [CRUD_SYSTEM_GUIDE.md](../../../CRUD_SYSTEM_GUIDE.md) for complete documentation.
