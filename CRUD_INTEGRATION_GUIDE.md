# CRUD Integration Guide

Complete guide for adding the unified CRUD system to any Create or Edit section.

## What You Get

- ✅ **ActionButton** - Animated save/update/delete buttons with 4 states
- ✅ **Toast Notifications** - Auto-dismiss success/error messages
- ✅ **Confirm Dialogs** - Delete confirmations before destructive actions
- ✅ **15+ Animations** - Professional transitions and effects
- ✅ **Consistent UX** - Same behavior across entire application

---

## Table of Contents

1. [Quick Integration Steps](#quick-integration-steps)
2. [For Create Sections](#for-create-sections)
3. [For Edit Sections](#for-edit-sections)
4. [Available Animations](#available-animations)
5. [Examples](#examples)

---

## Quick Integration Steps

### 1. Import Required Components

```typescript
import { ActionButton } from '../../../components/shared/ActionButton';
import { ToastContainer } from '../../../components/shared/Toast';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { useCRUD } from '../../../hooks/useCRUD';
```

### 2. Use the useCRUD Hook

```typescript
const {
  saveState,        // For create/save operations
  updateState,      // For update operations
  deleteState,      // For delete operations
  handleSave,       // Function to handle save
  handleUpdate,     // Function to handle update
  handleDelete,     // Function to handle delete
  confirmDialog,    // Confirmation dialog state
  closeConfirmDialog, // Close confirmation
  toast             // Toast notifications
} = useCRUD();
```

### 3. Replace Your Submit Button

**Before:**
```typescript
<button onClick={handleSubmit} disabled={loading}>
  {loading ? 'Saving...' : 'Save'}
</button>
```

**After:**
```typescript
<ActionButton
  type="save"
  state={saveState}
  onClick={handleSubmitWithCRUD}
>
  Save
</ActionButton>
```

### 4. Wrap Your Submit Handler

```typescript
const handleSubmitWithCRUD = () => {
  handleSave(
    () => dispatch(createItem(formData)),  // Your API call
    {
      successMessage: 'Item created successfully!',
      onSuccess: () => {
        setFormData(initialFormData);  // Reset form
        // Any other success actions
      }
    }
  );
};
```

### 5. Add Toast & Confirm Components

At the end of your component's return statement (before closing `</div>`):

```tsx
{/* Toast notifications */}
<ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

{/* Delete confirmation dialog (if needed) */}
<ConfirmDialog
  isOpen={confirmDialog.isOpen}
  title={confirmDialog.title}
  message={confirmDialog.message}
  onConfirm={confirmDialog.onConfirm}
  onCancel={closeConfirmDialog}
  isLoading={deleteState === 'loading'}
/>
```

---

## For Create Sections

### Complete Example: CreateMachine.tsx

```typescript
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createMachine } from '../../../redux/create/machine/MachineActions';
import { ActionButton } from '../../../components/shared/ActionButton';
import { ToastContainer } from '../../../components/shared/Toast';
import { useCRUD } from '../../../hooks/useCRUD';

const CreateMachine: React.FC = () => {
  const dispatch = useDispatch();
  const { saveState, handleSave, toast } = useCRUD();

  const [formData, setFormData] = useState({
    machineName: '',
    machineTypeId: '',
    sizeX: '',
    sizeY: '',
    sizeZ: ''
  });

  const handleSubmit = () => {
    handleSave(
      () => dispatch(createMachine(formData)),
      {
        successMessage: 'Machine created successfully!',
        onSuccess: () => {
          setFormData({ machineName: '', machineTypeId: '', sizeX: '', sizeY: '', sizeZ: '' });
        }
      }
    );
  };

  return (
    <div className="CreateMachineContainer">
      <h1>Create Machine</h1>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div className="FormGroup">
          <label>Machine Name</label>
          <input
            type="text"
            value={formData.machineName}
            onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
          />
        </div>

        {/* More form fields... */}

        <div className="FormActions">
          <ActionButton
            type="save"
            state={saveState}
            onClick={handleSubmit}
          >
            Create Machine
          </ActionButton>
        </div>
      </form>

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateMachine;
```

---

## For Edit Sections

Edit sections should use **EditTable** component for the list view, and **CRUD system** for edit/delete operations.

### Complete Example: EditMachines.tsx

```typescript
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMachines, updateMachine, deleteMachine } from '../../../redux/create/machine/MachineActions';
import { EditTable, EditTableColumn } from '../../../components/shared/EditTable';
import { ActionButton } from '../../../components/shared/ActionButton';
import { ToastContainer } from '../../../components/shared/Toast';
import { useCRUD } from '../../../hooks/useCRUD';

const EditMachines: React.FC = () => {
  const dispatch = useDispatch();
  const { machines = [], loading } = useSelector((state: RootState) => state.machineList);

  const { saveState, handleSave, toast } = useCRUD();
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [editForm, setEditForm] = useState({ machineName: '', sizeX: '', sizeY: '', sizeZ: '' });

  useEffect(() => {
    dispatch(getMachines());
  }, [dispatch]);

  // Define table columns
  const columns: EditTableColumn[] = [
    { key: 'machineName', header: 'Machine Name', sortable: true },
    { key: 'machineType', header: 'Type', render: (value) => value?.type || 'N/A' },
    { key: 'sizeX', header: 'Size X', align: 'center' },
    { key: 'sizeY', header: 'Size Y', align: 'center' },
    { key: 'sizeZ', header: 'Size Z', align: 'center' }
  ];

  // Handle edit
  const handleEdit = (machine) => {
    setSelectedMachine(machine);
    setEditForm({
      machineName: machine.machineName,
      sizeX: machine.sizeX,
      sizeY: machine.sizeY,
      sizeZ: machine.sizeZ
    });
  };

  // Handle save edit
  const handleSaveEdit = () => {
    handleSave(
      () => dispatch(updateMachine(selectedMachine._id, editForm)),
      {
        successMessage: 'Machine updated successfully!',
        onSuccess: () => {
          setSelectedMachine(null);
          dispatch(getMachines());
        }
      }
    );
  };

  // Handle delete
  const handleDeleteMachine = async (machine) => {
    await dispatch(deleteMachine(machine._id));
    dispatch(getMachines());
  };

  return (
    <div className="EditMachinesContainer">
      <h1>Edit Machines</h1>

      {/* Machine Table with built-in CRUD */}
      <EditTable
        data={machines}
        columns={columns}
        keyField="_id"
        searchable
        searchPlaceholder="Search machines..."
        searchFields={['machineName', 'machineType.type']}
        paginated
        pageSize={10}
        onEdit={handleEdit}
        onDelete={handleDeleteMachine}
        loading={loading}
        striped
        stickyHeader
        defaultSort={{ key: 'machineName', direction: 'asc' }}
      />

      {/* Edit Modal */}
      {selectedMachine && (
        <div className="Modal">
          <div className="ModalContent">
            <h2>Edit Machine</h2>

            <input
              type="text"
              value={editForm.machineName}
              onChange={(e) => setEditForm({ ...editForm, machineName: e.target.value })}
            />

            <div className="ModalActions">
              <button onClick={() => setSelectedMachine(null)}>Cancel</button>
              <ActionButton
                type="save"
                state={saveState}
                onClick={handleSaveEdit}
              >
                Save Changes
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default EditMachines;
```

---

## Available Animations

All animations are in `/src/styles/animations.css` and automatically applied by ActionButton and Toast components.

### Button Animations
- **Loading**: `animate-spin` - Spinning loader
- **Success**: `animate-bounce` - Bounce effect
- **Error**: `animate-shake` - Shake effect

### Toast Animations
- **Slide In**: `animate-slide-in` - Slides from right
- **Fade Out**: `animate-fade-out` - Fades away

### Modal/Dialog Animations
- **Scale In**: `animate-scale-in` - Grows from center
- **Fade In**: `animate-fade-in` - Fades in

### Available CSS Classes
```css
.animate-spin          /* Continuous rotation */
.animate-bounce        /* Bounce up and down */
.animate-shake         /* Shake left and right */
.animate-pulse         /* Pulsing opacity */
.animate-slide-in      /* Slide in from right */
.animate-slide-in-top  /* Slide in from top */
.animate-slide-in-bottom /* Slide in from bottom */
.animate-slide-in-left /* Slide in from left */
.animate-fade-in       /* Fade in */
.animate-fade-out      /* Fade out */
.animate-scale-in      /* Scale from small to normal */
.animate-scale-out     /* Scale from normal to small */
.animate-shimmer       /* Shimmering effect */
```

---

## ActionButton Props

```typescript
interface ActionButtonProps {
  type: 'save' | 'update' | 'delete' | 'submit';  // Button type
  state: 'idle' | 'loading' | 'success' | 'error'; // Current state
  onClick: () => void;                             // Click handler
  disabled?: boolean;                              // Disabled state
  className?: string;                              // Additional CSS classes
  children?: React.ReactNode;                      // Button text
}
```

### Usage Examples

```tsx
{/* Save button */}
<ActionButton type="save" state={saveState} onClick={handleSave}>
  Save Item
</ActionButton>

{/* Update button */}
<ActionButton type="update" state={updateState} onClick={handleUpdate}>
  Update Item
</ActionButton>

{/* Delete button */}
<ActionButton type="delete" state={deleteState} onClick={handleDelete}>
  Delete Item
</ActionButton>
```

---

## useCRUD Hook Options

### handleSave / handleUpdate Options

```typescript
{
  successMessage?: string;           // Toast message on success
  errorMessage?: string;             // Toast message on error
  onSuccess?: (data) => void;        // Callback on success
  onError?: (error) => void;         // Callback on error
  showToast?: boolean;               // Show toast (default: true)
}
```

### handleDelete Options

```typescript
{
  successMessage?: string;           // Toast message on success
  errorMessage?: string;             // Toast message on error
  confirmMessage?: string;           // Confirmation dialog message
  confirmTitle?: string;             // Confirmation dialog title
  onSuccess?: (data) => void;        // Callback on success
  onError?: (error) => void;         // Callback on error
  showToast?: boolean;               // Show toast (default: true)
}
```

---

## Migration Checklist

For each Create/Edit section:

- [ ] Import ActionButton, ToastContainer, ConfirmDialog (if delete)
- [ ] Import useCRUD hook
- [ ] Initialize useCRUD in component
- [ ] Replace submit button with ActionButton
- [ ] Wrap submit handler with handleSave/handleUpdate
- [ ] For Edit sections: Use EditTable component
- [ ] For Edit sections: Wrap delete with handleDelete
- [ ] Add ToastContainer at end of component
- [ ] Add ConfirmDialog at end (if delete operations)
- [ ] Test all operations (create/update/delete)
- [ ] Verify animations work
- [ ] Verify toast notifications appear

---

## Common Patterns

### Pattern 1: Create Form with Reset

```typescript
const handleSubmit = () => {
  handleSave(
    () => dispatch(createItem(formData)),
    {
      successMessage: 'Item created successfully!',
      onSuccess: () => {
        setFormData(initialFormData);  // Reset form
      }
    }
  );
};
```

### Pattern 2: Update with Refresh

```typescript
const handleUpdate = () => {
  handleSave(
    () => dispatch(updateItem(item._id, formData)),
    {
      successMessage: 'Item updated successfully!',
      onSuccess: () => {
        setEditingItem(null);
        dispatch(getItems());  // Refresh list
      }
    }
  );
};
```

### Pattern 3: Delete with Confirmation

```typescript
const handleDelete = (item) => {
  handleDelete(
    () => dispatch(deleteItem(item._id)),
    {
      confirmMessage: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      confirmTitle: 'Confirm Delete',
      successMessage: 'Item deleted successfully!',
      onSuccess: () => {
        dispatch(getItems());  // Refresh list
      }
    }
  );
};
```

---

## EditTable Component

For Edit sections, use the unified EditTable component instead of custom tables.

### Basic Usage

```tsx
<EditTable
  data={items}
  columns={columns}
  keyField="_id"
  searchable
  paginated
  onEdit={handleEdit}
  onDelete={handleDelete}
  loading={loading}
/>
```

### Full Props

```typescript
{
  // Data
  data: T[];                          // Array of items
  columns: EditTableColumn<T>[];      // Column definitions
  keyField?: string;                  // Unique key field (default: '_id')

  // Search & Filter
  searchable?: boolean;               // Enable search
  searchPlaceholder?: string;         // Search placeholder text
  searchFields?: string[];            // Fields to search

  // Actions
  onEdit?: (row, index) => void;      // Edit handler
  onDelete?: (row, index) => Promise<void>;  // Delete handler (with confirmation)

  // Pagination
  paginated?: boolean;                // Enable pagination
  pageSize?: number;                  // Items per page (default: 10)

  // Styling
  striped?: boolean;                  // Striped rows
  stickyHeader?: boolean;             // Sticky header on scroll

  // Loading & Empty
  loading?: boolean;                  // Show loading state
  emptyMessage?: string;              // Empty state message

  // Sorting
  defaultSort?: { key: string; direction: 'asc' | 'desc' };  // Default sort
}
```

---

## Need Help?

- **See Examples**: Navigate to `/menu/examples` in the app
- **View EditMachineNew.tsx**: Reference implementation in `src/componest/second/menu/Edit/EditMachine/EditMachineNew.tsx`
- **Check CRUD_SYSTEM_GUIDE.md**: Detailed guide for CRUD components
- **Check EDIT_TABLE_GUIDE.md**: Detailed guide for EditTable component

---

## Summary

1. Import useCRUD hook and components
2. Replace buttons with ActionButton
3. Wrap handlers with handleSave/handleUpdate/handleDelete
4. Add ToastContainer and ConfirmDialog
5. For Edit sections, use EditTable component
6. Test all operations and animations

**Result**: Consistent, professional CRUD operations with animations across your entire application!
