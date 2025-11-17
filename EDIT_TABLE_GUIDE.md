# Edit Table Component - Unified Table for All Edit Sections

## Problem Solved

❌ **Before**: Every edit section had its own custom table CSS with inconsistencies and bugs
✅ **After**: One unified `EditTable` component with professional styling, CRUD operations, and caching built-in!

---

## 🚀 Quick Start

### Basic Usage

```typescript
import { EditTable } from '@/components/shared/EditTable';
import { machineAPI } from '@/utils/crudHelpers';

const MyEditPage = () => {
  const [machines, setMachines] = useState([]);

  return (
    <EditTable
      data={machines}
      columns={[
        { key: 'name', header: 'Name', sortable: true },
        { key: 'type', header: 'Type' },
        { key: 'branch', header: 'Branch', render: (v) => v.name }
      ]}
      searchable
      paginated
      onEdit={(machine) => console.log('Edit:', machine)}
      onDelete={async (machine) => await machineAPI.delete(machine._id)}
      title="Machines"
      description="Manage all machines"
    />
  );
};
```

### With Cached Data (Recommended!)

```typescript
import { EditTable } from '@/components/shared/EditTable';
import { useOrderFormData } from '@/hooks/useOrderFormData';
import { machineAPI } from '@/utils/crudHelpers';

const MachineEdit = () => {
  const { machines, isLoading } = useOrderFormData(); // ✅ Cached!

  return (
    <EditTable
      data={machines}
      columns={[
        { key: 'machineName', header: 'Machine Name', sortable: true },
        { key: 'machineType', header: 'Type', render: (v) => v.type },
        { key: 'branchId', header: 'Branch', render: (v) => v.name }
      ]}
      searchable
      searchPlaceholder="Search machines..."
      searchFields={['machineName', 'machineType.type']}
      paginated
      pageSize={10}
      onEdit={(machine) => setEditingMachine(machine)}
      onDelete={async (machine) => await machineAPI.delete(machine._id)}
      loading={isLoading}
      title="Machine Management"
      description="View and manage all machines"
      striped
      stickyHeader
    />
  );
};
```

---

## 📋 Component Props

### Data Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | `[]` | Array of data to display |
| `columns` | `EditTableColumn<T>[]` | `[]` | Column definitions |
| `keyField` | `string` | `'_id'` | Unique key field for rows |

### Header Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Table title |
| `description` | `string` | - | Table description |

### Search & Filter Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchable` | `boolean` | `false` | Enable search functionality |
| `searchPlaceholder` | `string` | `'Search...'` | Search input placeholder |
| `searchFields` | `string[]` | `[]` | Fields to search (empty = all fields) |
| `filterable` | `boolean` | `false` | Enable filter dropdown |
| `filterOptions` | `Array<{value, label}>` | `[]` | Filter options |
| `onFilterChange` | `(value: string) => void` | - | Filter change callback |

### Action Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onEdit` | `(row: T, index: number) => void` | - | Edit button callback |
| `onDelete` | `(row: T, index: number) => Promise<void>` | - | Delete button callback (with confirmation) |
| `onView` | `(row: T, index: number) => void` | - | View button callback |
| `customActions` | `(row: T, index: number) => ReactNode` | - | Custom action buttons |

### Selection Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectable` | `boolean` | `false` | Enable row selection |
| `selectedRows` | `T[]` | `[]` | Currently selected rows |
| `onSelectionChange` | `(rows: T[]) => void` | - | Selection change callback |

### Pagination Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `paginated` | `boolean` | `false` | Enable pagination |
| `pageSize` | `number` | `10` | Items per page |
| `currentPage` | `number` | - | Controlled current page |
| `onPageChange` | `(page: number) => void` | - | Page change callback |

### Styling Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `striped` | `boolean` | `false` | Striped rows |
| `bordered` | `boolean` | `false` | Bordered cells |
| `compact` | `boolean` | `false` | Compact padding |
| `stickyHeader` | `boolean` | `false` | Sticky header on scroll |
| `className` | `string` | `''` | Additional CSS class |

### Loading & Empty Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | `boolean` | `false` | Show loading state |
| `emptyMessage` | `string` | `'No data available'` | Empty state message |
| `emptyIcon` | `ReactNode` | - | Empty state icon |

### Sorting Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultSort` | `{key: string, direction: 'asc'\|'desc'}` | - | Default sort configuration |

---

## 📐 Column Definition

### Basic Column

```typescript
{
  key: 'machineName',
  header: 'Machine Name'
}
```

### Sortable Column

```typescript
{
  key: 'machineName',
  header: 'Machine Name',
  sortable: true
}
```

### Custom Render

```typescript
{
  key: 'machineType',
  header: 'Type',
  render: (value, row, index) => (
    <span style={{
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem'
    }}>
      {value.type}
    </span>
  )
}
```

### Aligned Column

```typescript
{
  key: 'price',
  header: 'Price',
  align: 'right', // 'left' | 'center' | 'right'
  render: (value) => `$${value.toFixed(2)}`
}
```

### Fixed Width Column

```typescript
{
  key: 'status',
  header: 'Status',
  width: '100px',
  align: 'center'
}
```

---

## 🎨 Complete Examples

### Example 1: Machine Management

```typescript
import { useState } from 'react';
import { EditTable, EditTableColumn } from '@/components/shared/EditTable';
import { useOrderFormData } from '@/hooks/useOrderFormData';
import { machineAPI } from '@/utils/crudHelpers';

interface Machine {
  _id: string;
  machineName: string;
  machineType: { _id: string; type: string };
  branchId: { _id: string; name: string };
  sizeX: string;
  sizeY: string;
  sizeZ: string;
}

const MachineManagement = () => {
  const { machines, isLoading } = useOrderFormData();
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  const columns: EditTableColumn<Machine>[] = [
    {
      key: 'machineName',
      header: 'Machine Name',
      sortable: true,
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <strong>{value}</strong>
          <span style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem'
          }}>
            {row.machineType.type}
          </span>
        </div>
      )
    },
    {
      key: 'branchId',
      header: 'Branch',
      sortable: true,
      render: (value) => value.name
    },
    {
      key: 'sizeX',
      header: 'X',
      align: 'center',
      width: '80px',
      render: (value) => <code>{value}</code>
    },
    {
      key: 'sizeY',
      header: 'Y',
      align: 'center',
      width: '80px',
      render: (value) => <code>{value}</code>
    },
    {
      key: 'sizeZ',
      header: 'Z',
      align: 'center',
      width: '80px',
      render: (value) => <code>{value}</code>
    }
  ];

  const handleDelete = async (machine: Machine) => {
    await machineAPI.delete(machine._id);
    // Cache will auto-refresh
  };

  return (
    <>
      <EditTable
        data={machines}
        columns={columns}
        searchable
        searchPlaceholder="Search by name, type, or branch..."
        searchFields={['machineName', 'machineType.type', 'branchId.name']}
        paginated
        pageSize={15}
        onEdit={setEditingMachine}
        onDelete={handleDelete}
        loading={isLoading}
        title="Machine Management"
        description="View and manage all machines in the system"
        striped
        stickyHeader
        defaultSort={{ key: 'machineName', direction: 'asc' }}
      />

      {/* Edit modal here */}
    </>
  );
};
```

### Example 2: Customer Management with Selection

```typescript
const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      render: (value: string) => (
        <span style={{
          backgroundColor: value === 'active' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.75rem'
        }}>
          {value}
        </span>
      )
    }
  ];

  const handleBulkDelete = async () => {
    for (const customer of selectedCustomers) {
      await customerAPI.delete(customer._id);
    }
    setSelectedCustomers([]);
  };

  return (
    <div>
      {selectedCustomers.length > 0 && (
        <div style={{ padding: '1rem', backgroundColor: '#eff6ff', marginBottom: '1rem' }}>
          <p>{selectedCustomers.length} customers selected</p>
          <button onClick={handleBulkDelete}>Delete Selected</button>
        </div>
      )}

      <EditTable
        data={customers}
        columns={columns}
        selectable
        selectedRows={selectedCustomers}
        onSelectionChange={setSelectedCustomers}
        searchable
        paginated
        onEdit={(customer) => console.log('Edit:', customer)}
        onDelete={async (customer) => await customerAPI.delete(customer._id)}
        title="Customer Management"
      />
    </div>
  );
};
```

### Example 3: Product Catalog with Filter

```typescript
const ProductCatalog = () => {
  const [products, setProducts] = useState([]);

  const columns = [
    { key: 'productName', header: 'Product', sortable: true },
    {
      key: 'price',
      header: 'Price',
      align: 'right' as const,
      sortable: true,
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { key: 'category', header: 'Category' },
    {
      key: 'stock',
      header: 'Stock',
      align: 'center' as const,
      render: (value: number) => (
        <span style={{ color: value < 10 ? '#ef4444' : '#10b981' }}>
          {value}
        </span>
      )
    }
  ];

  return (
    <EditTable
      data={products}
      columns={columns}
      searchable
      filterable
      filterOptions={[
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'food', label: 'Food' }
      ]}
      paginated
      pageSize={20}
      onEdit={(product) => console.log('Edit:', product)}
      onDelete={async (product) => await productAPI.delete(product._id)}
      title="Product Catalog"
      description="Browse and manage all products"
      striped
      bordered
    />
  );
};
```

---

## 🎯 Features

### Built-in Features

- ✅ **Search** - Filter data by any field
- ✅ **Sorting** - Click column headers to sort
- ✅ **Pagination** - Split data across pages
- ✅ **Selection** - Select multiple rows with checkboxes
- ✅ **Actions** - Edit, Delete, View buttons with icons
- ✅ **Loading State** - Shows loading indicator
- ✅ **Empty State** - Customizable empty message
- ✅ **Filtering** - Dropdown filter by category
- ✅ **Custom Rendering** - Full control over cell content
- ✅ **Responsive** - Mobile-friendly design
- ✅ **Animations** - Smooth hover and transition effects
- ✅ **Delete Confirmation** - Built-in confirmation dialog
- ✅ **Toast Notifications** - Success/error messages
- ✅ **CRUD Integration** - Works with useCRUD hook
- ✅ **Cache Support** - Works with useOrderFormData

### CSS Features (from ReportTable.module.css)

- Professional gradient headers
- Hover effects on rows
- Sticky header support
- Striped rows option
- Bordered cells option
- Compact mode
- Dark mode support
- Print-friendly styles
- Responsive design

---

## 🔧 Migration Guide

### Before (Old EditMachines.css)

```typescript
// Old way - custom CSS for each page
import './editMachines.css';

<div className="EditMachinesTableWrapper">
  <table className="EditMachinesTable">
    <thead className="EditMachinesTableHeader">
      <tr>
        <th className="EditMachinesTableHeaderCell">Name</th>
        {/* ... */}
      </tr>
    </thead>
    <tbody>
      {machines.map(machine => (
        <tr className="EditMachinesTableRow">
          <td className="EditMachinesTableCell">{machine.name}</td>
          {/* ... */}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### After (New EditTable)

```typescript
// New way - one line!
import { EditTable } from '@/components/shared/EditTable';

<EditTable
  data={machines}
  columns={[
    { key: 'name', header: 'Name' },
    // ...
  ]}
  searchable
  paginated
  onEdit={(m) => setEditing(m)}
  onDelete={async (m) => await api.delete(m._id)}
/>
```

---

## 💡 Pro Tips

1. **Use with cached data** - Combine with `useOrderFormData()` for instant loads
   ```typescript
   const { machines, isLoading } = useOrderFormData();
   <EditTable data={machines} loading={isLoading} />
   ```

2. **Custom actions** - Add your own action buttons
   ```typescript
   customActions={(row) => (
     <button onClick={() => console.log(row)}>Custom</button>
   )}
   ```

3. **Controlled pagination** - Control page state externally
   ```typescript
   const [page, setPage] = useState(1);
   <EditTable currentPage={page} onPageChange={setPage} />
   ```

4. **Search specific fields** - Limit search to certain fields
   ```typescript
   searchFields={['name', 'email', 'phone']}
   ```

5. **Default sorting** - Set initial sort order
   ```typescript
   defaultSort={{ key: 'name', direction: 'asc' }}
   ```

---

## 🐛 Troubleshooting

### Data not showing?

Check if data is an array:
```typescript
console.log('Data:', data, Array.isArray(data));
```

### Search not working?

Specify `searchFields`:
```typescript
searchFields={['name', 'email']}
```

### Delete confirmation not showing?

The delete confirmation is built-in! Just provide `onDelete`:
```typescript
onDelete={async (row) => await api.delete(row._id)}
```

### Styling looks wrong?

Make sure ReportTable.module.css is imported in your main CSS:
```css
/* Already done in index.css */
@import './styles/animations.css';
```

---

## 📚 Related Documentation

- [CRUD_SYSTEM_GUIDE.md](./CRUD_SYSTEM_GUIDE.md) - CRUD operations and ActionButton
- [CACHING_SYSTEM_GUIDE.md](./CACHING_SYSTEM_GUIDE.md) - Data caching with useOrderFormData
- [QUICK_START.md](./QUICK_START.md) - Quick reference for all systems

---

## 🎉 Result

**Before:**
- Custom CSS for every edit page
- Inconsistent styling
- Bugs in table layouts
- No built-in CRUD operations
- Repeated code everywhere

**After:**
- ✅ One `<EditTable>` component
- ✅ Consistent professional styling
- ✅ Built-in CRUD with confirmations
- ✅ Built-in search, sort, pagination
- ✅ Works with caching system
- ✅ Fully responsive
- ✅ Dark mode support

**Replace all your custom table CSS with one component!** 🚀
