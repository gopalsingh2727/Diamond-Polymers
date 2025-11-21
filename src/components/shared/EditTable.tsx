import React, { useState, useMemo } from 'react';
import { useCRUD } from '../../hooks/useCRUD';
import { ToastContainer } from './Toast';
import { ConfirmDialog } from './ConfirmDialog';
import { Search, Filter, X, Edit2, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../../reports/styles/modules/ReportTable.module.css';

export interface EditTableColumn<T = any> {
  key: string;
  header: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

export interface EditTableProps<T = any> {
  // Data
  data: T[];
  columns: EditTableColumn<T>[];
  keyField?: string;

  // Header
  title?: string;
  description?: string;

  // Search & Filter
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: string[];
  filterable?: boolean;
  filterOptions?: Array<{ value: string; label: string }>;
  onFilterChange?: (value: string) => void;

  // Actions
  onEdit?: (row: T, index: number) => void;
  onDelete?: (row: T, index: number) => Promise<void>;
  onView?: (row: T, index: number) => void;
  customActions?: (row: T, index: number) => React.ReactNode;

  // Selection
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;

  // Pagination
  paginated?: boolean;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;

  // Styling
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
  stickyHeader?: boolean;
  className?: string;

  // Loading & Empty
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;

  // Sorting
  defaultSort?: { key: string; direction: 'asc' | 'desc' };
}

/**
 * EditTable - Unified table component for all edit sections
 * Uses ReportTable CSS styles with CRUD operations built-in
 *
 * @example
 * ```tsx
 * <EditTable
 *   data={machines}
 *   columns={[
 *     { key: 'name', header: 'Machine Name', sortable: true },
 *     { key: 'type', header: 'Type' },
 *     { key: 'branch', header: 'Branch', render: (v) => v.name }
 *   ]}
 *   searchable
 *   onEdit={(machine) => setEditingMachine(machine)}
 *   onDelete={async (machine) => await deleteMachine(machine._id)}
 *   title="Machines"
 *   description="Manage all machines"
 * />
 * ```
 */
export function EditTable<T = any>({
  data = [],
  columns = [],
  keyField = '_id',
  title,
  description,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchFields = [],
  filterable = false,
  filterOptions = [],
  onFilterChange,
  onEdit,
  onDelete,
  onView,
  customActions,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  paginated = false,
  pageSize = 10,
  currentPage: externalPage,
  onPageChange,
  striped = false,
  bordered = false,
  compact = false,
  stickyHeader = false,
  className = '',
  loading = false,
  emptyMessage = 'No data available',
  emptyIcon,
  defaultSort
}: EditTableProps<T>) {
  const { deleteState, handleDelete, confirmDialog, closeConfirmDialog, toast } = useCRUD();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    defaultSort || null
  );
  const [internalPage, setInternalPage] = useState(1);
  const [selectedRowsState, setSelectedRowsState] = useState<T[]>(selectedRows);

  // Use external page if controlled, otherwise use internal
  const currentPage = externalPage ?? internalPage;
  const setCurrentPage = onPageChange ?? setInternalPage;

  // Handle row selection
  const handleRowSelect = (row: T) => {
    const isSelected = selectedRowsState.some((r) => r[keyField as keyof T] === row[keyField as keyof T]);
    const newSelected = isSelected
      ? selectedRowsState.filter((r) => r[keyField as keyof T] !== row[keyField as keyof T])
      : [...selectedRowsState, row];

    setSelectedRowsState(newSelected);
    onSelectionChange?.(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRowsState.length === filteredData.length) {
      setSelectedRowsState([]);
      onSelectionChange?.([]);
    } else {
      setSelectedRowsState(filteredData);
      onSelectionChange?.(filteredData);
    }
  };

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchable && searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((row) => {
        if (searchFields.length > 0) {
          return searchFields.some((field) => {
            const value = row[field as keyof T];
            return String(value).toLowerCase().includes(searchLower);
          });
        } else {
          return Object.values(row as any).some((value) =>
            String(value).toLowerCase().includes(searchLower)
          );
        }
      });
    }

    // Apply filter
    if (filterable && filterValue) {
      result = result.filter((row: any) => row.filterField === filterValue);
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];

        if (aValue === bValue) return 0;

        const comparison = aValue < bValue ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, filterValue, sortConfig, searchable, filterable, searchFields]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!paginated) return filteredData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, paginated, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Handle sort
  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  // Handle delete with confirmation
  const handleDeleteClick = (row: T, index: number) => {
    if (!onDelete) return;

    handleDelete(() => onDelete(row, index), {
      confirmMessage: 'Are you sure you want to delete this item? This action cannot be undone.',
      successMessage: 'Item deleted successfully!'
    });
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterValue('');
    setSortConfig(null);
  };

  // Render cell value
  const renderCell = (column: EditTableColumn<T>, row: T, index: number) => {
    const value = row[column.key as keyof T];

    if (column.render) {
      return column.render(value, row, index);
    }

    return String(value ?? '');
  };

  // Get cell class name
  const getCellClassName = (column: EditTableColumn<T>) => {
    const classes = [column.className || ''];

    if (column.align === 'right') classes.push(styles.tableCellRight);
    else if (column.align === 'center') classes.push(styles.tableCellCenter);
    else classes.push(styles.tableCell);

    return classes.filter(Boolean).join(' ');
  };

  // Get header cell class name
  const getHeaderCellClassName = (column: EditTableColumn<T>) => {
    const classes = [];

    if (column.align === 'right') classes.push(styles.headerCellRight);
    else if (column.align === 'center') classes.push(styles.headerCellCenter);
    else classes.push(styles.headerCell);

    if (column.sortable) classes.push(styles.headerSortable);

    return classes.join(' ');
  };

  const hasActions = onEdit || onDelete || onView || customActions;

  return (
    <div className={`${styles.tableContainer} ${className}`}>
      {/* Header */}
      {(title || description) && (
        <div className={styles.tableHeader}>
          {title && <h2 className={styles.tableTitle}>{title}</h2>}
          {description && <p className={styles.tableDescription}>{description}</p>}
        </div>
      )}

      <div className={styles.tableBody}>
        {/* Controls */}
        {(searchable || filterable) && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {/* Search */}
            {searchable && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '250px', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
                <Search size={16} style={{ color: '#64748b' }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.875rem' }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#64748b' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Filter */}
            {filterable && filterOptions.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
                <Filter size={16} style={{ color: '#64748b' }} />
                <select
                  value={filterValue}
                  onChange={(e) => {
                    setFilterValue(e.target.value);
                    onFilterChange?.(e.target.value);
                  }}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.875rem', background: 'transparent', cursor: 'pointer' }}
                >
                  <option value="">All</option>
                  {filterOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear filters */}
            {(searchTerm || filterValue) && (
              <button
                onClick={handleClearFilters}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
              >
                Clear Filters
              </button>
            )}

            {/* Results summary */}
            {(searchTerm || filterValue) && (
              <div style={{ color: '#64748b', fontSize: '0.875rem', padding: '0.5rem', display: 'flex', alignItems: 'center' }}>
                Showing {filteredData.length} of {data.length} results
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className={`${styles.tableWrapper} ${stickyHeader ? styles.stickyHeader : ''}`} style={{ border: '1px solid #000' }}>
          <table className={`${styles.table} ${compact ? styles.tableCompact : ''} ${striped ? styles.tableStriped : ''} ${bordered ? styles.tableBordered : ''}`} style={{ border: '1px solid #000', borderCollapse: 'collapse' }}>
            {/* Head */}
            <thead className={styles.tableHead} style={{ backgroundColor: '#fff' }}>
              <tr className={styles.tableHeadRow}>
                {selectable && (
                  <th className={styles.headerCell} style={{ width: '40px', border: '1px solid #000', backgroundColor: '#fff' }}>
                    <input
                      type="checkbox"
                      checked={selectedRowsState.length === filteredData.length && filteredData.length > 0}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={getHeaderCellClassName(column)}
                    onClick={() => column.sortable && handleSort(column.key)}
                    style={{
                      width: column.width,
                      cursor: column.sortable ? 'pointer' : 'default',
                      border: '1px solid #000',
                      backgroundColor: '#fff'
                    }}
                  >
                    {column.header}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className={styles.sortIcon}>
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                ))}
                {hasActions && (
                  <th className={`${styles.headerCell} ${styles.headerCellCenter}`} style={{ width: '150px', border: '1px solid #000', backgroundColor: '#fff' }}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* Body */}
            <tbody className={styles.tableBodyElement} style={{ backgroundColor: '#fff' }}>
              {loading && (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0) + (selectable ? 1 : 0)} className={styles.loadingRow} style={{ textAlign: 'center', padding: '2rem', border: '1px solid #000', backgroundColor: '#fff' }}>
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && paginatedData.length === 0 && (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0) + (selectable ? 1 : 0)} style={{ border: '1px solid #000', backgroundColor: '#fff' }}>
                    <div className={styles.emptyState}>
                      {emptyIcon && <div className={styles.emptyIcon}>{emptyIcon}</div>}
                      <div className={styles.emptyTitle}>No Data Found</div>
                      <div className={styles.emptyDescription}>{emptyMessage}</div>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && paginatedData.map((row, index) => {
                const rowKey = row[keyField as keyof T] as any;
                const isSelected = selectedRowsState.some((r) => r[keyField as keyof T] === rowKey);

                return (
                  <tr
                    key={rowKey ?? index}
                    className={`${styles.tableRow} ${isSelected ? styles.rowSelected : ''}`}
                  >
                    {selectable && (
                      <td className={styles.tableCell} style={{ border: '1px solid #000', backgroundColor: '#fff' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(row)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={getCellClassName(column)}
                        style={{ width: column.width, border: '1px solid #000', backgroundColor: '#fff' }}
                      >
                        {renderCell(column, row, index)}
                      </td>
                    ))}
                    {hasActions && (
                      <td className={`${styles.tableCell} ${styles.tableCellCenter}`} style={{ border: '1px solid #000', backgroundColor: '#fff' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {onView && (
                            <button
                              onClick={() => onView(row, index)}
                              style={{ padding: '0.5rem', backgroundColor: '#FF6B35', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(row, index)}
                              style={{ padding: '0.5rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => handleDeleteClick(row, index)}
                              disabled={deleteState === 'loading'}
                              style={{ padding: '0.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deleteState === 'loading' ? 0.5 : 1 }}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          {customActions && customActions(row, index)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginated && filteredData.length > pageSize && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className={styles.paginationControls}>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ padding: '0.5rem', backgroundColor: currentPage === 1 ? '#e2e8f0' : '#FF6B35', color: currentPage === 1 ? '#64748b' : 'white', border: 'none', borderRadius: '0.375rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#64748b' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ padding: '0.5rem', backgroundColor: currentPage === totalPages ? '#e2e8f0' : '#FF6B35', color: currentPage === totalPages ? '#64748b' : 'white', border: 'none', borderRadius: '0.375rem', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirmDialog}
        isLoading={deleteState === 'loading'}
      />
    </div>
  );
}

export default EditTable;
