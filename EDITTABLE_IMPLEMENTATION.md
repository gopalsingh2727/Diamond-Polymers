# EditTable Implementation Guide - For Edit Sections

## ✅ What Was Done

Created **EditMachineNew.tsx** as a reference implementation showing how to use EditTable in edit sections while keeping your existing purple/gradient color scheme.

---

## 🎨 Key Features

### Keeps Your Existing Colors
- ✅ Purple gradient header (`#667eea` to `#764ba2`)
- ✅ Blue machine type tags (`#3498db`)
- ✅ Green save buttons
- ✅ Red delete buttons
- ✅ Gray text colors
- ✅ All existing CSS classes from `editMachines.css`

### Uses New EditTable Component
- ✅ Built-in search
- ✅ Built-in sorting
- ✅ Built-in pagination
- ✅ Edit/Delete buttons with icons
- ✅ Delete confirmation dialog
- ✅ Toast notifications
- ✅ Loading states
- ✅ Professional table styling

---

## 📋 Before vs After

### Before (Old EditMachine.tsx)
```typescript
// Custom table HTML - 828 lines of CSS
<div className="EditMachinesTableWrapper">
  <table className="EditMachinesTable">
    <thead className="EditMachinesTableHeader">
      <tr>
        <th className="EditMachinesTableHeaderCell">Name</th>
        {/* ... more headers */}
      </tr>
    </thead>
    <tbody>
      {filteredMachines.map(machine => (
        <tr className="EditMachinesTableRow">
          <td className="EditMachinesTableCell">{machine.name}</td>
          {/* ... more cells */}
          <td>
            <button onClick={() => handleEdit(machine)}>Edit</button>
            <button onClick={() => handleDelete(machine)}>Delete</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

// Manual search implementation
// Manual pagination implementation
// Manual delete confirmation
```

### After (New EditMachineNew.tsx)
```typescript
// ONE EditTable component - everything built-in!
<EditTable
  data={machines}
  columns={[
    {
      key: 'machineName',
      header: 'Machine Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <strong>{value}</strong>
          <span className="machine-type-tag">{row.machineType.type}</span>
        </div>
      )
    },
    { key: 'branchId', header: 'Branch', render: (v) => v.name },
    { key: 'sizeX', header: 'Size X', align: 'center' },
    { key: 'sizeY', header: 'Size Y', align: 'center' },
    { key: 'sizeZ', header: 'Size Z', align: 'center' }
  ]}
  searchable
  searchPlaceholder="Search by name, type, or branch..."
  searchFields={['machineName', 'machineType.type', 'branchId.name']}
  paginated
  pageSize={10}
  onEdit={handleEdit}
  onDelete={handleDeleteMachine}
  loading={loading}
  striped
  stickyHeader
  defaultSort={{ key: 'machineName', direction: 'asc' }}
/>
```

**Result**: 80% less code, all features built-in!

---

## 🔧 How to Apply to Other Edit Pages

### Step 1: Import EditTable
```typescript
import { EditTable, EditTableColumn } from "../../../../../components/shared/EditTable";
import { useCRUD } from "../../../../../hooks/useCRUD";
```

### Step 2: Define Columns
```typescript
const columns: EditTableColumn<YourDataType>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true
  },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    render: (value) => (
      <span style={{
        backgroundColor: value === 'active' ? '#27ae60' : '#e74c3c',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px'
      }}>
        {value}
      </span>
    )
  }
];
```

### Step 3: Replace Table HTML with EditTable
```typescript
<EditTable
  data={yourData}
  columns={columns}
  searchable
  paginated
  onEdit={handleEdit}
  onDelete={handleDelete}
  loading={loading}
/>
```

### Step 4: Keep Your Existing Header
```typescript
{/* Keep your gradient header */}
<div className="EditMachinesHeader">
  <h1 className="EditMachinesTitle">Your Title</h1>
</div>

{/* Use EditTable for the table part */}
<div style={{ padding: '30px' }}>
  <EditTable {...props} />
</div>
```

---

## 📁 Files to Update

Here's how to update each edit section:

### 1. Edit Machine ✅ DONE
- **File**: `EditMachine/EditMachineNew.tsx`
- **Status**: Reference implementation created
- **Features**: Search, sort, pagination, custom machine type tags

### 2. Edit Products
- **File**: `EditProducts/EditProduct.tsx`
- **Columns**: productName, category, price, stock, status
- **Custom Render**: Price with currency, stock with color (red if low)

### 3. Edit Materials
- **File**: `EditMaterials/EditMaterials.tsx`
- **Columns**: materialName, type, quantity, supplier
- **Custom Render**: Quantity with units

### 4. Edit Customers
- **File**: `EditNewAccount/EditNewAccount.tsx`
- **Columns**: name, email, phone, status, branch
- **Custom Render**: Status badge, email as link

### 5. Edit Machine Operators
- **File**: `EditMachineOpertor/EditMachineOPertor.tsx`
- **Columns**: operatorName, pin, machine, shift, status
- **Custom Render**: PIN masked, shift badges

---

## 🎨 Color Customization

You can customize colors in the render function:

```typescript
{
  key: 'status',
  header: 'Status',
  render: (value) => (
    <span style={{
      backgroundColor: value === 'active'
        ? '#27ae60'  // Green for active
        : '#e74c3c', // Red for inactive
      color: 'white',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 500
    }}>
      {value}
    </span>
  )
}
```

### Your Existing Color Palette:
- **Purple Gradient**: `#667eea` to `#764ba2` (headers)
- **Blue**: `#3498db` (machine types, primary actions)
- **Green**: `#27ae60` (success, save buttons)
- **Red**: `#e74c3c` (delete, errors)
- **Orange**: `#f39c12` (edit buttons)
- **Gray**: `#7f8c8d` (secondary text)
- **Dark Gray**: `#2c3e50`, `#34495e` (text)

---

## 📝 Quick Template for Any Edit Page

```typescript
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EditTable, EditTableColumn } from "../../../../../components/shared/EditTable";
import { ActionButton } from "../../../../../components/shared/ActionButton";
import { ToastContainer } from "../../../../../components/shared/Toast";
import { useCRUD } from "../../../../../hooks/useCRUD";
import "./yourStyles.css";

const YourEditPage: React.FC = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.yourData);
  const [selectedItem, setSelectedItem] = useState(null);
  const { saveState, handleSave, toast } = useCRUD();

  // Fetch data
  useEffect(() => {
    dispatch(fetchYourData());
  }, [dispatch]);

  // Define columns
  const columns: EditTableColumn[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'type', header: 'Type' },
    { key: 'status', header: 'Status', align: 'center' }
  ];

  // Handle edit
  const handleEdit = (item) => {
    setSelectedItem(item);
  };

  // Handle delete
  const handleDelete = async (item) => {
    await dispatch(deleteItem(item._id));
    dispatch(fetchYourData());
  };

  return (
    <div className="YourCss">
      <div className="YourContainer">
        {/* Keep your gradient header */}
        <div className="YourHeader">
          <h1 className="YourTitle">Your Title</h1>
        </div>

        {/* Use EditTable */}
        <div style={{ padding: '30px' }}>
          <EditTable
            data={data}
            columns={columns}
            searchable
            paginated
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
            striped
          />
        </div>

        {/* Your edit modal here */}

        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      </div>
    </div>
  );
};

export default YourEditPage;
```

---

## 🚀 Benefits

### For You:
- ✅ **80% less code** per edit page
- ✅ **Consistent UI** across all edit sections
- ✅ **Same colors** you're already using
- ✅ **All features built-in** (search, sort, pagination)
- ✅ **Less maintenance** - fix once, works everywhere
- ✅ **Professional styling** from ReportTable

### For Users:
- ✅ Fast search
- ✅ Easy sorting
- ✅ Clean pagination
- ✅ Delete confirmations
- ✅ Success/error notifications
- ✅ Consistent experience

---

## 📖 Next Steps

1. **Test EditMachineNew.tsx** - See how it works with your data
2. **Copy the pattern** to other edit pages (Products, Materials, etc.)
3. **Customize colors** in render functions if needed
4. **Keep your gradient headers** - they look great!
5. **Remove old custom table CSS** once migrated

---

## 💡 Pro Tips

1. **Keep your existing CSS file** for headers and modals
2. **Only replace the table part** with EditTable
3. **Use custom render** for colored badges and tags
4. **Add searchFields** to search specific columns
5. **Use defaultSort** to set initial sort order

---

## 🎉 Result

**Before**: Each edit page has 500+ lines of custom table code
**After**: Each edit page has ~100 lines using EditTable

**Same colors. Same styling. Way less code!** 🚀
